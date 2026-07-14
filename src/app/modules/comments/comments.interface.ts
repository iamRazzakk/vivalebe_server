import { Model, Types } from "mongoose";

export type IComments = {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
  comment: string;
  isPublish: boolean;
};

export type CommentsModel = Model<IComments>;
