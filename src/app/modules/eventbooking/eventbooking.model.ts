import { Schema, model } from "mongoose";
import { EventBookingModel, IEventBooking } from "./eventbooking.interface";

const eventBookingSchema = new Schema<IEventBooking, EventBookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Events",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingRequest: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "usd",
    },
    trxId: {
      type: String,
    },
    checkoutSessionId: {
      type: String,
    },
    customerId: {
      type: String,
    },
    failureReason: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const EventBooking = model<IEventBooking, EventBookingModel>(
  "EventBooking",
  eventBookingSchema,
);
