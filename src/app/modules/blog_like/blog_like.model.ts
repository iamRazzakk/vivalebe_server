import { Schema, model } from "mongoose";
import { IBlog_like, Blog_likeModel } from "./blog_like.interface";

const blogLikesSchema = new Schema<IBlog_like, Blog_likeModel>(
  {
    blogId: { type: Schema.Types.ObjectId, ref: "Blogs", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

blogLikesSchema.index({ blogId: 1, userId: 1 }, { unique: true });

export const BlogLikes = model<IBlog_like, Blog_likeModel>(
  "BlogLikes",
  blogLikesSchema,
);
