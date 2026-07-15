import { getChannel } from "../config/rabbitmq";
import { sendNotifications } from "../helpers/notificationsHelper";
import { logger } from "../shared/logger";

const NOTIFICATION_QUEUE = 'notification_queue';
const startNotificationWorker = async () => {
    const channel = await getChannel();
    await channel.assertQueue(NOTIFICATION_QUEUE, { durable: true });
    channel.consume(NOTIFICATION_QUEUE, async (msg) => {
        if (!msg) return;
        try {
            const data = JSON.parse(msg.content.toString());
            await sendNotifications(data);
            channel.ack(msg);
        } catch (error) {
            logger.error("Notification worker failed:", error);
            channel.ack(msg);
        }
    });
};

export default startNotificationWorker;