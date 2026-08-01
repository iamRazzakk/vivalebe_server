import Stripe from "stripe";
import { StatusCodes } from "http-status-codes";
import ApiError from "../errors/ApiErrors";
import { EventBooking } from "../app/modules/eventbooking/eventbooking.model";
import { Events } from "../app/modules/events/events.model";
import { logger } from "../shared/logger";

export const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  if (session.metadata?.type !== "event_booking") return;

  const bookingId = session.metadata.bookingId;
  if (!bookingId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Missing bookingId in metadata");
  }

  const booking = await EventBooking.findById(bookingId);
  if (!booking) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found");
  }
  if (booking.paymentStatus === "paid") {
    logger.info(`Booking ${bookingId} already paid, skipping.`);
    return;
  }

  await EventBooking.findByIdAndUpdate(bookingId, {
    paymentStatus: "paid",
    paymentDate: new Date(),
    trxId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id,
    customerId:
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id,
    checkoutSessionId: session.id,
    failureReason: undefined,
  });

  await Events.findByIdAndUpdate(booking.eventId, {
    $inc: { attendPerson: 1 },
  });

  logger.info(`Event booking ${bookingId} marked as paid.`);
};

export const handleCheckoutSessionExpired = async (
  session: Stripe.Checkout.Session,
) => {
  if (session.metadata?.type !== "event_booking") return;

  const bookingId = session.metadata.bookingId;
  if (!bookingId) return;

  await EventBooking.findOneAndUpdate(
    {
      _id: bookingId,
      paymentStatus: "pending",
    },
    {
      paymentStatus: "failed",
      failureReason: "Checkout session expired",
    },
  );

  logger.info(`Event booking ${bookingId} expired.`);
};

export const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  const bookingId = paymentIntent.metadata?.bookingId;
  if (!bookingId || paymentIntent.metadata?.type !== "event_booking") return;

  await EventBooking.findOneAndUpdate(
    {
      _id: bookingId,
      paymentStatus: "pending",
    },
    {
      paymentStatus: "failed",
      failureReason:
        paymentIntent.last_payment_error?.message || "Payment failed",
      trxId: paymentIntent.id,
    },
  );

  logger.info(`Event booking ${bookingId} payment failed.`);
};