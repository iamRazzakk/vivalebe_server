import { Model } from "mongoose";
import { Types } from "mongoose";

export type IBlock = {
  blockerId: Types.ObjectId;
  blockedUserId: Types.ObjectId;
  isBlocked: boolean;
};

export type BlockModel = Model<IBlock>;

export type IHideUser = {
  userId: Types.ObjectId;
  hiddenUserId: Types.ObjectId;
  isHidden: boolean;
};

export type HideUserModel = Model<IHideUser>;
