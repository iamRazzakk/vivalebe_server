import { getChannel } from "../../config/rabbitmq";

export const FEED_FAN_OUT_QUEUE = "feed_fan_out_queue";

export type FeedFanOutPayload = {
  postId: string;
  authorId: string;
  createdAt?: string;
};

const sendFeedFanOutToQueue = async (payload: FeedFanOutPayload) => {
  const channel = await getChannel();
  await channel.assertQueue(FEED_FAN_OUT_QUEUE, { durable: true });
  channel.sendToQueue(
    FEED_FAN_OUT_QUEUE,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true },
  );
};

export default sendFeedFanOutToQueue;