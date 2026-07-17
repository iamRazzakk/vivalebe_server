import { Model, Types } from "mongoose";

export type IWink = {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  isMatch: boolean;
};

export type WinkModel = Model<IWink>;
