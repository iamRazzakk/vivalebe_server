import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../errors/ApiErrors";
import stripe from "../config/stripe";
import { User } from "../app/modules/user/user.model";
import { Subscription } from "../app/modules/subscription/subscription.model";

export const handleSubscriptionDeleted = async (data: Stripe.Subscription) => {
  const subscription = await stripe.subscriptions.retrieve(data.id);

  const userSubscription = await Subscription.findOne({
    subscriptionId: subscription.id,  status: "active",
  });

  if (!userSubscription) {
    return; 
  }

  await Subscription.findByIdAndUpdate(userSubscription._id, {
    status: "cancel", 
  });

  const otherActive = await Subscription.findOne({
    user: userSubscription.user,
    status: "active",
    _id: { $ne: userSubscription._id },
  });

  if (!otherActive) {
    await User.findByIdAndUpdate(userSubscription.user, {
      premiumMembership: false, 
    });
  }
};
