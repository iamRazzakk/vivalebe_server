import { Schema, model } from "mongoose";
import {
  ISuccessStoryComment,
  SuccessStoryCommentModel,
} from "./success_story_comment.interface";

const successStoryCommentSchema = new Schema<
  ISuccessStoryComment,
  SuccessStoryCommentModel
>(
  {
    successStoryId: {
      type: Schema.Types.ObjectId,
      ref: "SuccessStory",
      required: true,
    },
    comment: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

successStoryCommentSchema.index(
  { successStoryId: 1, userId: 1 },
  { unique: true },
);

export const SuccessStoryComment = model<
  ISuccessStoryComment,
  SuccessStoryCommentModel
>("SuccessStoryComment", successStoryCommentSchema);
