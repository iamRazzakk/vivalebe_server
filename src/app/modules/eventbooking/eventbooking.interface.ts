import { Model, Types } from "mongoose";

export type IEventBooking = {
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  bookingRequest: "pending" | "accepted" | "rejected";
  paymentStatus: "pending" | "paid" | "failed";
  paymentDate?: Date | null;
  paymentAmount: number;
  currency?: string;
  trxId?: string;
  checkoutSessionId?: string;
  customerId?: string;
  failureReason?: string;
  isDeleted: boolean;
};

export type EventBookingModel = Model<IEventBooking>;
