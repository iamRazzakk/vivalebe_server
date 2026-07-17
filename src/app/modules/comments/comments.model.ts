import { Schema, model } from "mongoose";
import { IComments, CommentsModel } from "./comments.interface";

const commentsSchema = new Schema<IComments, CommentsModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Posts", required: true },
    comment: { type: String, required: true },
    isPublish: { type: Boolean, default: false },
  },
  { timestamps: true },
);

commentsSchema.index({ postId: 1, createdAt: -1 });

export const Comments = model<IComments, CommentsModel>(
  "Comments",
  commentsSchema,
);
