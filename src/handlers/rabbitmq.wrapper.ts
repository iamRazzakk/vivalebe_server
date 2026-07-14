
import { rabbitmqConfig } from "../config/rabbitmq";
import { startFailedWorker } from "../util/startFailedWorker";
import { startPostWorker } from "../worker/post.worker";
import { startEmailWorker } from "../worker/rabbitmq.worker";
import { startCommentWorker } from "../worker/comment.worker";

export const bootstrap = async () => {
  await rabbitmqConfig();
  await startPostWorker();
  await startEmailWorker();
  await startFailedWorker();
  await startCommentWorker();
};
