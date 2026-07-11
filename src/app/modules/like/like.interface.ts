import { Model, Types } from 'mongoose';

export type ILike = {
  userId: Types.ObjectId;
  postId: Types.ObjectId;
};

export type LikeModel = Model<ILike>;
