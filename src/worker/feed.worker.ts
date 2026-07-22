import { getChannel } from "../config/rabbitmq";
import { logger } from "../shared/logger";

import { fanOutPostToFeeds } from "../helpers/feedFanoutHelper";
import { FEED_FAN_OUT_QUEUE, FeedFanOutPayload } from "../app/queue/feed.queue";

export const startFeedWorker = async () => {
  const channel = await getChannel();
  await channel.assertQueue(FEED_FAN_OUT_QUEUE, { durable: true });

  logger.info("✅ Feed fan-out worker is ready");

  channel.consume(FEED_FAN_OUT_QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const data = JSON.parse(msg.content.toString()) as FeedFanOutPayload;

      await fanOutPostToFeeds({
        postId: data.postId,
        authorId: data.authorId,
        createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      });

      channel.ack(msg);
    } catch (error) {
      logger.error("❌ Feed fan-out worker error:", error);
      // nack without requeue
      channel.nack(msg, false, false);
    }
  });
};
