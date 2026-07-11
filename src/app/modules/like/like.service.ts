import { JwtPayload } from 'jsonwebtoken';
import { ILike } from './like.interface';
import { Like } from './like.model';
import { Posts } from '../posts/posts.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { applyFlushedCountDeltas, bufferLike, bufferUnlike, clearFlushedPending, getPendingLikes, isLikedInRedis, parseLikeMember } from '../../../redis/redis.store';
import { logger } from '../../../shared/logger';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/queryBuilder';



const createLike = async (payload: ILike, user: JwtPayload) => {
    const userId = user.id;
    const { postId } = payload;

    const post = await Posts.findById(postId).select("_id").lean();

    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User removed this post");
    }

    const likedInRedis = await isLikedInRedis(userId.toString(), postId.toString());
    if (likedInRedis) {
        await bufferUnlike(userId.toString(), (postId as unknown as string));
        return {
            isLiked: false,
            message: "Like removed successfully",
            data: null,
        };
    }
    const existingInDb = await Like.exists({ userId, postId });

    if (existingInDb) {
        await bufferUnlike(userId, postId.toString());
        return {
            isLiked: false,
            message: "Like removed successfully",
            data: null,
        };
    }

    await bufferLike(userId, postId.toString());
    return {
        isLiked: true,
        message: "Liked successfully",
        data: { userId, postId },
    };
};


const flushPendingLikes = async () => {
    const { toAdd, toRemove } = await getPendingLikes();
    if (!toAdd.length && !toRemove.length) return;
    // Snapshot first — ignore members that change mid-flush via clear of exact snapshot
    const addDocs = toAdd
        .map(parseLikeMember)
        .filter(Boolean)
        .map((m) => ({
            userId: new Types.ObjectId(m!.userId),
            postId: new Types.ObjectId(m!.postId),
        }));
    const removeFilters = toRemove
        .map(parseLikeMember)
        .filter(Boolean)
        .map((m) => ({
            userId: new Types.ObjectId(m!.userId),
            postId: new Types.ObjectId(m!.postId),
        }));
    const countDeltas: Record<string, number> = {};
    if (addDocs.length) {
        try {
            await Like.insertMany(addDocs, { ordered: false });
        } catch (error: any) {
            // Ignore duplicate key (race / re-flush)
            if (error?.code !== 11000 && !error?.writeErrors) {
                throw error;
            }
        }
        for (const doc of addDocs) {
            const id = String(doc.postId);
            countDeltas[id] = (countDeltas[id] || 0) + 1;
        }
    }
    if (removeFilters.length) {
        await Like.deleteMany({ $or: removeFilters });
        for (const filter of removeFilters) {
            const id = String(filter.postId);
            countDeltas[id] = (countDeltas[id] || 0) - 1;
        }
    }
    // Persist likeCount on posts
    const bulkOps = Object.entries(countDeltas)
        .filter(([, delta]) => delta !== 0)
        .map(([postId, delta]) => ({
            updateOne: {
                filter: { _id: new Types.ObjectId(postId) },
                update: { $inc: { likeCount: delta } },
            },
        }));
    if (bulkOps.length) {
        await Posts.bulkWrite(bulkOps);
    }
    // Clear flushed pending + compensate redis deltas (DB now owns them)
    await clearFlushedPending(toAdd, toRemove);
    await applyFlushedCountDeltas(countDeltas);
    logger.info(
        `Like flush: +${addDocs.length} / -${removeFilters.length} postsUpdated=${bulkOps.length}`,
    );
};


// get all likes base on post
const getAllLikesByPost = async (postId: string, query: Record<string, any>) => {
    const qb = new QueryBuilder(Like.find({ postId }), query).populate(['userId'], { userId: 'name email profile' }).sort().cursorPaginate();
    const meta = await qb.getCursorPaginationMeta(await qb.modelQuery.lean() as unknown as Record<string, unknown>[]);
    return { meta };
};

export const LikeServices = {
    createLike,
    flushPendingLikes,
    getAllLikesByPost
};
