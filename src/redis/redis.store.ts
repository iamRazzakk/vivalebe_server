// need to store the authentication data in redis
import Redis from "ioredis";
import redisClient from "../config/redis.config";


export const dataStoreToRedis =
    async (key: string, value: string, expiration: number) => {
        await redisClient.set(key, value, "PX", expiration);
    };



export const dataGetFromRedis = async (key: string) => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
};

// delete data from redis
export const dataDeleteFromRedis = async (key: string) => {
    await redisClient.del(key);
};



// like buffering

const PENDING_ADD = "like:pending:add";
const PENDING_REMOVE = "like:pending:remove";


const postLikeKey = (postId: string) => `like:post:${postId}`;
const likeCountDeltaKey = (postId: string) => `like:count:delta:${postId}`;
const memberKey = (userId: string, postId: string) => `${userId}:${postId}`;


export const parseLikeMember = (member: string) => {
    const [userId, postId] = member.split(":");
    if (!userId || !postId) return null;
    return { userId, postId };
};

/** Is this user currently liked in Redis cache for the post? */
export const isLikedInRedis = async (userId: string, postId: string) => {
    const result = await redisClient.sismember(postLikeKey(postId), userId);
    return result === 1;
};

/** Like: add to post set + pending add; cancel any pending remove */
export const bufferLike = async (userId: string, postId: string) => {
    const member = memberKey(userId, postId);
    const pipeline = redisClient.pipeline();
    pipeline.sadd(postLikeKey(postId), userId);
    pipeline.sadd(PENDING_ADD, member);
    pipeline.srem(PENDING_REMOVE, member);
    pipeline.incr(likeCountDeltaKey(postId));
    await pipeline.exec();
};

/** Unlike: remove from post set; if still pending add → just cancel; else queue DB remove */
export const bufferUnlike = async (userId: string, postId: string) => {
    const member = memberKey(userId, postId);
    const wasPendingAdd = await redisClient.sismember(PENDING_ADD, member);
    const pipeline = redisClient.pipeline();
    pipeline.srem(postLikeKey(postId), userId);
    pipeline.srem(PENDING_ADD, member);
    pipeline.decr(likeCountDeltaKey(postId));
    if (wasPendingAdd !== 1) {
        pipeline.sadd(PENDING_REMOVE, member);
    }
    await pipeline.exec();
};


export const getPendingLikes = async () => {
    const [toAdd, toRemove] = await Promise.all([
        redisClient.smembers(PENDING_ADD),
        redisClient.smembers(PENDING_REMOVE),
    ]);
    return { toAdd, toRemove };
};

/** Remove only the members we successfully flushed */

export const clearFlushedPending = async (
    toAdd: string[],
    toRemove: string[],
) => {
    const pipeline = redisClient.pipeline();
    if (toAdd.length) pipeline.srem(PENDING_ADD, ...toAdd);
    if (toRemove.length) pipeline.srem(PENDING_REMOVE, ...toRemove);
    await pipeline.exec();
};


export const getLikeCountDelta = async (postId: string) => {
    const val = await redisClient.get(likeCountDeltaKey(postId));
    return val ? Number(val) : 0;
};


/** After flush, subtract flushed delta from redis counter (keep live accuracy) */
export const applyFlushedCountDeltas = async (
    deltas: Record<string, number>,
) => {
    const entries = Object.entries(deltas);
    if (!entries.length) return;
    const pipeline = redisClient.pipeline();
    for (const [postId, delta] of entries) {
        if (delta !== 0) {
            pipeline.incrby(likeCountDeltaKey(postId), -delta);
        }
    }
    await pipeline.exec();
};


/** Warm Redis post-like set from DB (optional, on cache miss) */
export const warmPostLikes = async (postId: string, userIds: string[]) => {
    if (!userIds.length) return;
    await redisClient.sadd(postLikeKey(postId), ...userIds);
};

export const getLikeCountDeltas = async (postIds: string[]) => {
    if (!postIds.length) return {} as Record<string, number>;
  
    const keys = postIds.map(likeCountDeltaKey);
    const values = await redisClient.mget(...keys);
  
    const map: Record<string, number> = {};
    postIds.forEach((id, i) => {
      map[id] = values[i] ? Number(values[i]) : 0;
    });
    return map;
  };