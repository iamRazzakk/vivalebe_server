import { INotification } from "../app/modules/notification/notification.interface";
import { getChannel } from "../config/rabbitmq";

const NOTIFICATION_QUEUE = 'notification_queue';
export const sendNotificationToQueue = async (data: INotification): Promise<INotification> => {
    // need to create channel 

    const channel = await getChannel();
    await channel.assertQueue(NOTIFICATION_QUEUE, {
        durable: true,
    });
    channel.sendToQueue(
        NOTIFICATION_QUEUE,
        Buffer.from(JSON.stringify(data)),
        {
            persistent: true,
        }
    )
    return data;
}