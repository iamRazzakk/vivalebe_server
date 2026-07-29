import { Model, Types } from "mongoose";

export type ISuccessStoryLike = {
  userId: Types.ObjectId;
  successStoryId: Types.ObjectId;
};

export type SuccessStoryLikeModel = Model<ISuccessStoryLike>;
