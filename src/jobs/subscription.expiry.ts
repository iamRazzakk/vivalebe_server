import cron from "node-cron";

import { Subscription } from "../app/modules/subscription/subscription.model";
import { User } from "../app/modules/user/user.model";
import { logger } from "../shared/logger";
import {
  SUBSCRIPTION_EXPIRY_CRON,
  SUBSCRIPTION_EXPIRY_TIMEZONE,
} from "../app/modules/subscription/subscription.constant";

export const expireSubscriptionsJob = async () => {
  const now = new Date();
  const expiredSubscriptions = await Subscription.find({
    status: "active",
    currentPeriodEnd: { $lt: now.toISOString() },
  })
    .select("user")
    .lean();
  if (!expiredSubscriptions.length) {
    logger.info("Subscription expiry job: no expired subscriptions found.");
    return;
  }

  const affectedUserIds = [
    ...new Set(expiredSubscriptions.map((sub) => String(sub.user))),
  ];

  const subscriptionResult = await Subscription.updateMany(
    {
      status: "active",
      currentPeriodEnd: { $lt: now.toISOString() },
    },
    { $set: { status: "expired" } },
  );

  const usersWithActiveSubscription = await Subscription.distinct("user", {
    status: "active",
    currentPeriodEnd: { $gte: now.toISOString() },
  });

  const activeUserIdSet = new Set(
    usersWithActiveSubscription.map((id) => String(id)),
  );

  const userIdsToRevokePremium = affectedUserIds.filter(
    (userId) => !activeUserIdSet.has(userId),
  );

  const userResult = await User.updateMany(
    {
      _id: { $in: userIdsToRevokePremium },
      premiumMembership: true,
    },
    { $set: { premiumMembership: false } },
  );

  logger.info(
    `Subscription expiry job done: ${subscriptionResult.modifiedCount} subscriptions expired, ${userResult.modifiedCount} users premium revoked.`,
  );
};

export const startSubscriptionExpiryJob = () => {
  cron.schedule(
    SUBSCRIPTION_EXPIRY_CRON,
    async () => {
      try {
        await expireSubscriptionsJob();
      } catch (error) {
        logger.error("Subscription expiry job failed:", error);
      }
    },
    { timezone: SUBSCRIPTION_EXPIRY_TIMEZONE },
  );

  logger.info(
    "🔥 Subscription expiry job scheduled (daily at 00:00 Europe/Lisbon).",
  );
};
