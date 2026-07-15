import { JwtPayload } from 'jsonwebtoken';
import { IComments } from './comments.interface';
import { Comments } from './comments.model';
import { Posts } from '../posts/posts.model';
import redisClient from '../../../config/redis.config';
import QueryBuilder from '../../builder/queryBuilder';

const createCommentsIntoDB = async (payload: IComments, user: JwtPayload) => {
    payload.userId = user.id;
    const comment = await Comments.create(payload);
    return comment;
}

const updateCommentsInDB = async (id: string, payload: IComments, user: JwtPayload) => {
    payload.userId = user.id;
    const comment = await Comments.findByIdAndUpdate(id, payload, { new: true });
    return comment;
}


const deleteCommentsFromDB = async (id: string, user: JwtPayload) => {
    const comment = await Comments.findByIdAndDelete(id, { userId: user.id });
    return comment;
}

const getCommentsByPostId = async (id: string, query: Record<string, any>) => {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    const redisKey = `comments:${id}`;

    // Try Redis cache if the range is within the top 100 comments
    if (end < 100) {
        const exists = await redisClient.exists(redisKey);
        if (exists) {
            const cachedStrings = await redisClient.lrange(redisKey, start, end);
            const data = cachedStrings.map((str: string) => JSON.parse(str));

            const post = await Posts.findById(id).select('commentCount').lean();
            const total = post?.commentCount ?? (await Comments.countDocuments({ postId: id }));
            const totalPage = Math.ceil(total / limit);

            return {
                data,
                meta: {
                    total,
                    limit,
                    page,
                    totalPage,
                },
            };
        }

        // Cache miss: Warm Redis cache with top 100 comments from MongoDB
        const commentsFromDb = await Comments.find({ postId: id })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate("userId", { name: 1, email: 1, profile: 1 })
            .lean();

        if (commentsFromDb.length > 0) {
            const pipeline = redisClient.pipeline();
            pipeline.rpush(redisKey, ...commentsFromDb.map(c => JSON.stringify(c)));
            pipeline.expire(redisKey, 300); // 5 minutes TTL
            await pipeline.exec();
        }

        const data = commentsFromDb.slice(start, end + 1);
        const post = await Posts.findById(id).select('commentCount').lean();
        const total = post?.commentCount ?? (await Comments.countDocuments({ postId: id }));
        const totalPage = Math.ceil(total / limit);

        return {
            data,
            meta: {
                total,
                limit,
                page,
                totalPage,
            },
        };
    }

    // Fallback to MongoDB for deeper pagination
    const qb = new QueryBuilder(Comments.find({ postId: id }), query)
        .filter()
        .sort()
        .paginate()
        .populate(["userId"], { "userId": "name email profile" });

    const data = await qb.modelQuery.lean();
    const meta = await qb.getPaginationInfo();

    return {
        data,
        meta,
    }
}


export const CommentsServices = {
    createCommentsIntoDB,
    updateCommentsInDB,
    deleteCommentsFromDB,
    getCommentsByPostId,
};
