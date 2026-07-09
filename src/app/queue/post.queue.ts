import { getChannel } from "../../config/rabbitmq";
import { IPosts } from "../modules/posts/posts.interface";

const POST_QUEUE = "post_queue";

const sendPostToQueue = async (post: IPosts) => {
    const channel = await getChannel();
    await channel.assertQueue(POST_QUEUE, { durable: true });
    channel.sendToQueue(POST_QUEUE, Buffer.from(JSON.stringify(post)), {
        persistent: true
    });
};

export default sendPostToQueue;