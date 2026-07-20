import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../errors/ApiErrors";
import stripe from "../config/stripe";
import { User } from "../app/modules/user/user.model";
import { Package } from "../app/modules/package/package.model";
import { Subscription } from "../app/modules/subscription/subscription.model";

export const handleSubscriptionCreated = async (data: Stripe.Subscription) => {
  const subscription = await stripe.subscriptions.retrieve(data.id);
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string,
  )) as Stripe.Customer;

  const priceId = subscription.items.data[0]?.price?.id;
  const productId = subscription.items.data[0]?.price?.product as string;

  if (!customer?.email) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No email found for the customer!",
    );
  }

  const existingUser = await User.findOne({ email: customer.email });
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Invalid User!");
  }

  const pricingPlan =
    (priceId && (await Package.findOne({ priceId }))) ||
    (productId && (await Package.findOne({ productId })));

  if (!pricingPlan) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Package not found for priceId: ${priceId}`,
    );
  }

  const currentActiveSubscription = await Subscription.findOne({
    user: existingUser._id,
    status: "active",
  }).populate("package");

  if (currentActiveSubscription) {
    const currentPackageId = String(
      (currentActiveSubscription.package as any)?._id ||
        currentActiveSubscription.package,
    );
    const newPackageId = String(pricingPlan._id);

    if (currentPackageId === newPackageId) {
      // Optionally cancel the duplicate Stripe subscription
      await stripe.subscriptions.cancel(subscription.id);
      // Return without throw to avoid Stripe infinite retry
      return;
    }

    if (currentActiveSubscription.subscriptionId) {
      await stripe.subscriptions.cancel(
        currentActiveSubscription.subscriptionId,
      );
    }
    await Subscription.findByIdAndUpdate(currentActiveSubscription._id, {
      status: "cancel",
    });
  }

  const invoice = await stripe.invoices.retrieve(
    subscription.latest_invoice as string,
  );
  const trxId =
    typeof invoice.payment_intent === "string"
      ? invoice.payment_intent
      : (invoice.payment_intent as Stripe.PaymentIntent)?.id || invoice.id;

  const amountPaid = (invoice?.total ?? 0) / 100;

  const newSubscription = await Subscription.create({
    user: existingUser._id,
    customerId: customer.id,
    package: pricingPlan._id,
    price: amountPaid,
    trxId,
    subscriptionId: subscription.id,
    currentPeriodStart: new Date(
      subscription.current_period_start * 1000,
    ).toISOString(),
    currentPeriodEnd: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
    remaining: Math.ceil(
      (subscription.current_period_end * 1000 - Date.now()) /
        (1000 * 60 * 60 * 24),
    ),
    status: "active",
  });

  await User.findByIdAndUpdate(existingUser._id, {
    premiumMembership: true,
  });

  return newSubscription;
};
