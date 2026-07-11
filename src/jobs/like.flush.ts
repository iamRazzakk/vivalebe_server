import cron from "node-cron";
import { LIKE_FLUSH_CRON } from "../app/modules/like/like.constants";
import { LikeServices } from "../app/modules/like/like.service";
import { logger } from "../shared/logger";

export const startLikeFlushJob = () => {
    cron.schedule(LIKE_FLUSH_CRON, async () => {
        try {
            await LikeServices.flushPendingLikes();
        } catch (error) {
            logger.error("Like flush job failed:", error);
        }
    });

    logger.info("Like flush job scheduled (every 2 minutes)");
};