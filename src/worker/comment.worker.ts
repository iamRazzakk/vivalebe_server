import mongoose from "mongoose";
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

        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            // 1. Create the comment inside the transaction
            const [newComment] = await Comments.create(
                [
                    {
                        comment,
                        postId,
                        userId,
                        isPublish: true,
                    },
                ],
                { session }
            );

            // 2. Atomically increment commentCount of the target Post
            const updatedPost = await Posts.findOneAndUpdate(
                { _id: postId },
                { $inc: { commentCount: 1 } },
                { session, new: true }
            );

            if (!updatedPost) {
                throw new Error(`Post not found: ${postId}`);
            }

            await session.commitTransaction();
            session.endSession();

            logger.info(`✅ Comment saved & Post counter incremented: commentId=${newComment._id}`);

            // 3. Cache-aside update: update Redis list if cached
            const redisKey = `comments:${postId}`;
            const exists = await redisClient.exists(redisKey);
            if (exists) {
                // Populate the comment user field to match retrieval schema
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
            // Abort transactional operations
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            session.endSession();

            logger.error(`❌ Error processing comment for post=${postId} trackingId=${trackingId}:`, error);
            
            // Acknowledge message on error to prevent blocking the queue with poisoned messages
            channel.ack(msg);
        }
    });
};
