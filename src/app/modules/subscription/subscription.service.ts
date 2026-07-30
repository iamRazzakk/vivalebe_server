import { JwtPayload } from "jsonwebtoken";
import { Package } from "../package/package.model";
import { ISubscription } from "./subscription.interface";
import { Subscription } from "./subscription.model";
import stripe from "../../../config/stripe";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/queryBuilder";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const getAllSubscriptionsListFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Subscription.find(), query)
    .filter()
    .fields()
    .sort()
    .search(["status"])
    .populate(["user"], {
      user: "name email",
    });
  const [subscriptions, total] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    subscriptions,
    total,
  };
};

const updateSubscriptionStatusFromDB = async (id: string, payload: any) => {
  const subscription = await Subscription.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();
  if (!subscription) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Subscription not found");
  }
  return subscription;
};

export const SubscriptionService = {
  getAllSubscriptionsListFromDB,
  updateSubscriptionStatusFromDB,
};
