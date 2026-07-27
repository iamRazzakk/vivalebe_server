import { Schema, model } from "mongoose";
import {
  IBlock,
  BlockModel,
  IHideUser,
  HideUserModel,
} from "./block.interface";

const blockSchema = new Schema<IBlock, BlockModel>(
  {
    blockerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blockedUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isBlocked: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

blockSchema.index({ blockerId: 1, blockedUserId: 1 }, { unique: true });
export const Block = model<IBlock, BlockModel>("Block", blockSchema);

const hideUserSchema = new Schema<IHideUser, HideUserModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hiddenUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isHidden: { type: Boolean, default: true },
  },
  { timestamps: true },
);
hideUserSchema.index({ userId: 1, hiddenUserId: 1 }, { unique: true });
export const HideUser = model<IHideUser, HideUserModel>(
  "HideUser",
  hideUserSchema,
);
