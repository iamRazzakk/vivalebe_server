import { Schema, model } from "mongoose";
import { IFeed, FeedModel } from "./feed.interface";

const feedSchema = new Schema<IFeed, FeedModel>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

feedSchema.index({ owner: 1, post: 1, author: 1 }, { unique: true });
// feed read path
feedSchema.index({ owner: 1, createdAt: -1, _id: -1 });

export const Feed = model<IFeed, FeedModel>("Feed", feedSchema);
