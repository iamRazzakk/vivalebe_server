import { Model, Types } from 'mongoose';

export type IWink = {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
};

export type WinkModel = Model<IWink>;
