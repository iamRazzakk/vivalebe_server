import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../errors/ApiErrors";
import stripe from "../config/stripe";
import { User } from "../app/modules/user/user.model";
import { Package } from "../app/modules/package/package.model";
import { Subscription } from "../app/modules/subscription/subscription.model";

export const handleSubscriptionUpdated = async (data: Stripe.Subscription) => {
  const subscription = await stripe.subscriptions.retrieve(data.id);
  const customer = (await stripe.customers.retrieve(
    subscription.customer as string,
  )) as Stripe.Customer;

  if (!customer?.email) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "No email found for the customer!",
    );
  }

  const existingUser = await User.findOne({ email: customer.email });
  if (!existingUser) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `User not found: ${customer.email}`,
    );
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const productId = subscription.items.data[0]?.price?.product as string;

  const pricingPlan =
    (priceId && (await Package.findOne({ priceId }))) ||
    (productId && (await Package.findOne({ productId })));

  if (!pricingPlan) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      `Package not found for priceId: ${priceId}`,
    );
  }

  const existingRecord = await Subscription.findOne({
    subscriptionId: subscription.id,
  });

  const invoice = subscription.latest_invoice
    ? await stripe.invoices.retrieve(subscription.latest_invoice as string)
    : null;

  const trxId = invoice
    ? typeof invoice.payment_intent === "string"
      ? invoice.payment_intent
      : (invoice.payment_intent as Stripe.PaymentIntent)?.id || invoice.id
    : existingRecord?.trxId || subscription.id;

  const amountPaid = invoice
    ? (invoice.total ?? 0) / 100
    : (existingRecord?.price ?? 0);

  const payload = {
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
    status:
      subscription.status === "active"
        ? "active"
        : subscription.status === "canceled"
          ? "cancel"
          : "expired",
  };

  if (existingRecord) {
    await Subscription.findByIdAndUpdate(existingRecord._id, payload);
  } else {
    await Subscription.create(payload);
  }

  // ✅ Sync user premium status
  await User.findByIdAndUpdate(existingUser._id, {
    premiumMembership: subscription.status === "active",
  });
};
