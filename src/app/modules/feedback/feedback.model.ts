import { Schema, model } from "mongoose";
import { IFeedback, FeedbackModel } from "./feedback.interface";
import { SupportCategory } from "../../../enums/SupportCategory";

const feedbackSchema = new Schema<IFeedback, FeedbackModel>(
  {
    topic: {
      type: String,
      enum: SupportCategory,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    voiceMessage: {
      type: String,
      required: false,
    },
    media: {
      type: [String],
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export const Feedback = model<IFeedback, FeedbackModel>(
  "Feedback",
  feedbackSchema,
);
