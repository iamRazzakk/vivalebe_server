import { Model, Types } from "mongoose";

export type IBlog_like = {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
};

export type Blog_likeModel = Model<IBlog_like>;
