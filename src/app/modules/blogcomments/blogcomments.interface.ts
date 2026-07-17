import { Model, Types } from 'mongoose';

export type IBlogPostComments = {
  blogId: Types.ObjectId;
  userId: Types.ObjectId;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BlogPostCommentsModel = Model<IBlogPostComments>;
