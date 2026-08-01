import Stripe from "stripe";
import { EventBooking } from "../app/modules/eventbooking/eventbooking.model";

const handlePaymentIntentSucceeded = async (
    paymentIntent: Stripe.PaymentIntent,
  ) => {
    if (paymentIntent.metadata?.type !== "event_booking") return;
    const bookingId = paymentIntent.metadata.bookingId;
    if (!bookingId) return;
    await EventBooking.findOneAndUpdate(
      { _id: bookingId, paymentStatus: "pending" },
      {
        paymentStatus: "paid",
        paymentDate: new Date(),
        trxId: paymentIntent.id,
      },
    );
  };

export default handlePaymentIntentSucceeded;