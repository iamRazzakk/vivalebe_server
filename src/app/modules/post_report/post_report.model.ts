import { Schema, model } from "mongoose";
import { IPostReport, PostReportModel } from "./post_report.interface";

const postReportSchema = new Schema<IPostReport, PostReportModel>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
      enum: [
        "usingAiGeneratedContent",
        "containsContactInformation",
        "inappropriateOrObsceneContent",
        "photoImperSonatingAnotherIndividual",
        "photoOfAChild",
        "other",
      ],
      required: true,
    },
    description: { type: String },
    image: { type: [String] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export const PostReport = model<IPostReport, PostReportModel>(
  "PostReport",
  postReportSchema,
);
