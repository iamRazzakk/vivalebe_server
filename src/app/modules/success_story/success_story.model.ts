import { Schema, model } from "mongoose";
import { ISuccess_story, Success_storyModel } from "./success_story.interface";

const successStorySchema = new Schema<ISuccess_story, Success_storyModel>(
  {
    relationshipStatus: {
      type: String,
      enum: ["dating", "engaged", "other"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    media: { type: [String], required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    totalLikes: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SuccessStory = model<ISuccess_story, Success_storyModel>(
  "SuccessStory",
  successStorySchema,
);
