import { Schema, model } from "mongoose";
import {
  ISuccessStoryLike,
  SuccessStoryLikeModel,
} from "./success_story_like.interface";

const successStoryLikeSchema = new Schema<
  ISuccessStoryLike,
  SuccessStoryLikeModel
>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    successStoryId: {
      type: Schema.Types.ObjectId,
      ref: "SuccessStory",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

successStoryLikeSchema.index(
  { userId: 1, successStoryId: 1 },
  { unique: true },
);

export const SuccessStoryLike = model<ISuccessStoryLike, SuccessStoryLikeModel>(
  "SuccessStoryLike",
  successStoryLikeSchema,
);
