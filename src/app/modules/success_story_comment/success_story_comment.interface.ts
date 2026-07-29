import { Model, Types } from "mongoose";

export type ISuccessStoryComment = {
  successStoryId: Types.ObjectId;
  comment: string;
  userId: Types.ObjectId;
};

export type SuccessStoryCommentModel = Model<ISuccessStoryComment>;
