import { Model } from "mongoose";
import { Types } from "mongoose";
export type IFeed = {
  owner: Types.ObjectId;
  post: Types.ObjectId;
  author: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export type FeedModel = Model<IFeed, Document>;
