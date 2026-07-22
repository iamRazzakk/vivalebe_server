import { Posts } from "../app/modules/posts/posts.model";
import { getChannel } from "../config/rabbitmq";
import { logger } from "../shared/logger";
import sendFeedFanOutToQueue from "../app/queue/feed.queue";

const POST_QUEUE = "post_queue";

export const startPostWorker = async () => {
  const channel = await getChannel();
  await channel.assertQueue(POST_QUEUE, { durable: true });

  logger.info("✅ Post worker is ready to process jobs");

  channel.consume(POST_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString());
      const post: any = await Posts.create(data);

      await sendFeedFanOutToQueue({
        postId: String(post._id),
        authorId: String(post.user),
        createdAt: post.createdAt?.toISOString?.() ?? new Date().toISOString(),
      });

      channel.ack(msg);
    } catch (error) {
      logger.error("❌ Post worker error:", error);
      channel.nack(msg, false, false);
    }
  });
};
