import { getChannel } from "../config/rabbitmq";
import { Comments } from "../app/modules/comments/comments.model";
import { Posts } from "../app/modules/posts/posts.model";
import redisClient from "../config/redis.config";
import { logger } from "../shared/logger";
import { Blogs } from "../app/modules/blogs/blogs.model";

const COMMENT_QUEUE = "comment_processing_queue";

export const startCommentWorker = async () => {
  const channel = await getChannel();
  await channel.assertQueue(COMMENT_QUEUE, { durable: true });

  logger.info("✅ Comment worker is ready to process jobs");

  channel.consume(COMMENT_QUEUE, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());
    const { comment, postId, userId, trackingId, blogId } = data;

    logger.info(
      `💬 Processing comment post=${postId} blog=${blogId} trackingId=${trackingId}`,
    );

    try {
      if (!postId && !blogId) {
        throw new Error("Either postId or blogId is required");
      }

      let newComment;
      let redisKey: string;

      if (blogId) {
        const blog = await Blogs.findById(blogId).select("_id").lean();
        if (!blog) {
          throw new Error(`Blog not found: ${blogId}`);
        }

        newComment = await Comments.create({
          comment,
          blogId,
          userId,
          isPublish: true,
        });

        await Blogs.findByIdAndUpdate(blogId, { $inc: { totalComments: 1 } });
        redisKey = `comments:blog:${blogId}`;

        logger.info(
          `✅ Blog comment saved: commentId=${newComment._id} blogId=${blogId}`,
        );
      } else {
        const post = await Posts.findById(postId).select("_id").lean();
        if (!post) {
          throw new Error(`Post not found: ${postId}`);
        }

        newComment = await Comments.create({
          comment,
          postId,
          userId,
          isPublish: true,
        });

        await Posts.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
        redisKey = `comments:${postId}`;

        logger.info(
          `✅ Post comment saved: commentId=${newComment._id} postId=${postId}`,
        );
      }

      const exists = await redisClient.exists(redisKey);
      if (exists) {
        const populatedComment = await Comments.findById(newComment._id)
          .populate("userId", { name: 1, email: 1, profile: 1 })
          .lean();

        if (populatedComment) {
          const pipeline = redisClient.pipeline();
          pipeline.lpush(redisKey, JSON.stringify(populatedComment));
          pipeline.ltrim(redisKey, 0, 99);
          pipeline.expire(redisKey, 300);
          await pipeline.exec();
          logger.info(`⚡ Redis cache updated for key=${redisKey}`);
        }
      }

      channel.ack(msg);
    } catch (error) {
      logger.error(
        `❌ Error processing comment post=${postId} blog=${blogId} trackingId=${trackingId}:`,
        error,
      );
      channel.ack(msg);
    }
  });
};
