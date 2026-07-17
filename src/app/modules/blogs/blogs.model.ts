import { Schema, model } from "mongoose";
import { IBlogs, BlogsModel } from "./blogs.interface";

const blogsSchema = new Schema<IBlogs, BlogsModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    youtubeUrl: {
      type: String,
      required: false,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      required: true,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    totalComments: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

blogsSchema.index({ userId: 1 });

blogsSchema.index({ createdAt: -1 });

blogsSchema.index({ totalLikes: -1, createdAt: -1 });

export const Blogs = model<IBlogs, BlogsModel>("Blogs", blogsSchema);
