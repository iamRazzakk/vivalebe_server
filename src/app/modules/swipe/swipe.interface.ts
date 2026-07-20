import { Model, Types } from "mongoose";

export type ISwipe = {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  action: "like" | "reject";
  
};

export type SwipeModel = Model<ISwipe>;
