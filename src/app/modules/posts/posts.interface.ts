import { Model, Types } from 'mongoose';

export type IPosts = {
  description: string;
  content: string[];
  user: Types.ObjectId;
  type: "IMAGE" | "VIDEO";
};

export type PostsModel = Model<IPosts>;
