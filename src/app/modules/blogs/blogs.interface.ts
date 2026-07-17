import { Model, Types } from "mongoose";

export type IBlogs = {
  userId: Types.ObjectId;
  title: string;
  description: string;
  youtubeUrl?: string;
  imageUrl?: string;
  tags: string[];
  totalLikes: number;
  totalComments: number;
};

export type BlogsModel = Model<IBlogs>;
