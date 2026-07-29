import { Model, Types } from "mongoose";

export type IPosts = {
  description: string;
  content: string[];
  user: Types.ObjectId;
  type: "IMAGE" | "VIDEO";
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
};

export type PostsModel = Model<IPosts>;
