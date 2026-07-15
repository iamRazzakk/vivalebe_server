import { getChannel } from "../config/rabbitmq";
import { Comments } from "../app/modules/comments/comments.model";
import { Posts } from "../app/modules/posts/posts.model";
import redisClient from "../config/redis.config";
import { logger } from "../shared/logger";

const COMMENT_QUEUE = "comment_processing_queue";

export const startCommentWorker = async () => {
    const channel = await getChannel();
    await channel.assertQueue(COMMENT_QUEUE, { durable: true });

    logger.info("✅ Comment worker is ready to process jobs");

    channel.consume(COMMENT_QUEUE, async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        const { comment, postId, userId, trackingId } = data;

        logger.info(`💬 Processing comment for post=${postId} trackingId=${trackingId}`);

        try {
            // Standalone MongoDB does not support multi-doc transactions
            // (requires replica set / mongos). Do sequential ops instead.
            const post = await Posts.findById(postId).select("_id").lean();
            if (!post) {
                throw new Error(`Post not found: ${postId}`);
            }

            const newComment = await Comments.create({
                comment,
                postId,
                userId,
                isPublish: true,
            });

            await Posts.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

            logger.info(`✅ Comment saved & Post counter incremented: commentId=${newComment._id}`);

            // Cache-aside update: update Redis list if cached
            const redisKey = `comments:${postId}`;
            const exists = await redisClient.exists(redisKey);
            if (exists) {
                const populatedComment = await Comments.findById(newComment._id)
                    .populate("userId", { name: 1, email: 1, profile: 1 })
                    .lean();

                if (populatedComment) {
                    const pipeline = redisClient.pipeline();
                    pipeline.lpush(redisKey, JSON.stringify(populatedComment));
                    pipeline.ltrim(redisKey, 0, 99);
                    pipeline.expire(redisKey, 300); // 5 minutes TTL
                    await pipeline.exec();
                    logger.info(`⚡ Redis cache updated for key=${redisKey}`);
                }
            }

            channel.ack(msg);
        } catch (error) {
            logger.error(`❌ Error processing comment for post=${postId} trackingId=${trackingId}:`, error);

            // Acknowledge message on error to prevent blocking the queue with poisoned messages
            channel.ack(msg);
        }
    });
};
