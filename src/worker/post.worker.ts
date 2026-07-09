import { Posts } from "../app/modules/posts/posts.model";
import { getChannel } from "../config/rabbitmq";
import { logger } from "../shared/logger";

const POST_QUEUE = "post_queue";

export const startPostWorker = async () => {
    const channel = await getChannel();
    await channel.assertQueue(POST_QUEUE, { durable: true });

    logger.info("✅ Post worker is ready to process jobs");

    channel.consume(POST_QUEUE, async (msg) => {
        if (!msg) return;

        try {
            const data = JSON.parse(msg.content.toString());

            await Posts.create(data);

            channel.ack(msg);
        } catch (error) {
            logger.error("❌ Post worker error:", error);
        }
    });
};