import { Schema, model } from "mongoose";
import {
  IBlogPostComments,
  BlogPostCommentsModel,
} from "./blogcomments.interface";

const blogCommentsSchema = new Schema<IBlogPostComments, BlogPostCommentsModel>(
  {
    comment: { type: String, required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blogs", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

export const BlogPostComments = model<IBlogPostComments, BlogPostCommentsModel>(
  "BlogPostComments",
  blogCommentsSchema,
);
