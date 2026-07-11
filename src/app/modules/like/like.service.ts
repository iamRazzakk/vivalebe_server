import { JwtPayload } from 'jsonwebtoken';
import { ILike } from './like.interface';
import { Like } from './like.model';
import { Posts } from '../posts/posts.model';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { applyFlushedCountDeltas, bufferLike, bufferUnlike, clearFlushedPending, getLikeCountDelta, getPendingAddUserIdsForPost, getPendingLikes, getPendingRemoveUserIdsForPost, isLikedInRedis, isPendingRemove, parseLikeMember } from '../../../redis/redis.store';
import { logger } from '../../../shared/logger';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/queryBuilder';
import { User } from '../user/user.model';



const createLike = async (payload: ILike, user: JwtPayload) => {
    const userId = user.id.toString();
    const postIdStr = payload.postId.toString();

    const post = await Posts.findById(postIdStr).select('_id likeCount').lean();
    if (!post) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'User removed this post');
    }

    const liveCount = async () =>
        (post.likeCount || 0) + (await getLikeCountDelta(postIdStr));

    // Currently liked in Redis cache?
    if (await isLikedInRedis(userId, postIdStr)) {
        await bufferUnlike(userId, postIdStr);
        return {
            isLiked: false,
            message: 'Like removed successfully',
            likeCount: Math.max(0, await liveCount()),
            data: null,
        };
    }

    // In DB, but NOT already queued for remove → real unlike
    const existingInDb = await Like.exists({ userId, postId: postIdStr });
    const pendingRemove = await isPendingRemove(userId, postIdStr);

    if (existingInDb && !pendingRemove) {
        await bufferUnlike(userId, postIdStr);
        return {
            isLiked: false,
            message: 'Like removed successfully',
            likeCount: Math.max(0, await liveCount()),
            data: null,
        };
    }

    // Fresh like OR re-like while pending:remove (bufferLike cancels remove)
    await bufferLike(userId, postIdStr);
    return {
        isLiked: true,
        message: 'Liked successfully',
        likeCount: Math.max(0, await liveCount()),
        data: { userId, postId: postIdStr },
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
    const [pendingAddUserIds, pendingRemoveUserIds] = await Promise.all([
        getPendingAddUserIdsForPost(postId),
        getPendingRemoveUserIdsForPost(postId),
    ]);


    const excludeUserIds = [...pendingAddUserIds, ...pendingRemoveUserIds];
    // redis pending like
    const redisUsers = pendingAddUserIds.length
        ? await User.find({ _id: { $in: pendingAddUserIds } })
            .select('name email profile')
            .lean()
        : [];

    const redisLikes = redisUsers.map((user) => ({
        _id: `redis:${user._id}`,
        userId: user,
        postId,
        source: 'redis' as const,
        createdAt: new Date(),
    }));
    // db like 
    const dbFilter: Record<string, unknown> = { postId };
    if (excludeUserIds.length) {
        dbFilter.userId = {
            $nin: excludeUserIds.map((id) => new Types.ObjectId(id)),
        };
    }
    const qb = new QueryBuilder(Like.find(dbFilter), query)
        .populate(['userId'], { userId: 'name email profile' })
        .sort()
        .cursorPaginate();


    const results = (await qb.modelQuery.lean()) as Record<string, unknown>[];
    const { data: dbLikes, meta } = qb.getCursorPaginationMeta(results);
    const dbLikesWithSource = dbLikes.map((like) => ({
        ...like,
        source: 'db' as const,
    }));
    return {
        data: [...redisLikes, ...dbLikesWithSource],
        meta,
    };
};

export const LikeServices = {
    createLike,
    flushPendingLikes,
    getAllLikesByPost
};
