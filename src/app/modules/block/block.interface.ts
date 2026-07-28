import { Model } from "mongoose";
import { Types } from "mongoose";

export type IBlock = {
  blockerId: Types.ObjectId; // user id who is blocking
  blockedUserId: Types.ObjectId; // user id who is blocked
  isBlocked: boolean;
};

export type BlockModel = Model<IBlock>;

export type IHideUser = {
  userId: Types.ObjectId;
  hiddenUserId: Types.ObjectId;
  isHidden: boolean;
};

export type HideUserModel = Model<IHideUser>;
