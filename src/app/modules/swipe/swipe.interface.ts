import { Model, Types } from "mongoose";

export type ISwipe = {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  action: "like" | "reject";
  isMatch: boolean;
  isWinked?: boolean;
  isLiked?: boolean;
};

export type SwipeModel = Model<ISwipe>;
