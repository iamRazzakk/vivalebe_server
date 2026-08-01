import { Schema, model } from "mongoose";
import { IEvents, EventsModel, IGuest } from "./events.interface";

const guestSchema = new Schema<IGuest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    _id: false,
  },
);

const eventsSchema = new Schema<IEvents, EventsModel>(
  {
    eventName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    guests: {
      type: [guestSchema],
      default: [],
    },
    price: {
      type: Number,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["private", "public"],
      required: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      required: true,
    },
    eventOwner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendPerson: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Events = model<IEvents, EventsModel>("Events", eventsSchema);
