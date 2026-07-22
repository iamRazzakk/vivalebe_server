import { rabbitmqConfig } from "../config/rabbitmq";
import { startFailedWorker } from "../util/startFailedWorker";
import { startPostWorker } from "../worker/post.worker";
import { startEmailWorker } from "../worker/rabbitmq.worker";
import { startCommentWorker } from "../worker/comment.worker";
import startNotificationWorker from "../worker/notification.worker";
import { startFeedWorker } from "../worker/feed.worker";

export const bootstrap = async () => {
  await rabbitmqConfig();
  await startPostWorker();
  await startFeedWorker();
  await startEmailWorker();
  await startFailedWorker();
  await startNotificationWorker();
  await startCommentWorker();
};
