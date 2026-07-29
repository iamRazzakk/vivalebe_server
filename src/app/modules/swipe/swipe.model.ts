import { Schema, model } from "mongoose";
import { ISwipe, SwipeModel } from "./swipe.interface";

const swipeSchema = new Schema<ISwipe, SwipeModel>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isMatch: { type: Boolean, default: false },
    action: { type: String, enum: ["like", "reject"], required: true },
  },
  {
    timestamps: true,
  },
);
swipeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
export const Swipe = model<ISwipe, SwipeModel>("Swipe", swipeSchema);
