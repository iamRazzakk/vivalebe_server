import { JwtPayload } from "jsonwebtoken";
import { IBlock, IHideUser } from "./block.interface";
import { Block, HideUser } from "./block.model";

const createBlockIntoDB = async (payload: IBlock, user: JwtPayload) => {
  const existingBlock = await Block.findOne({
    blockerId: user.id,
    blockedUserId: payload.blockedUserId,
  });
  if (existingBlock) {
    await existingBlock.updateOne({ isBlocked: payload.isBlocked });
    return existingBlock;
  }
  const block = await Block.create(payload);
  return block;
};

const getAllBlockedUsers = async (user: JwtPayload) => {
  const blockedUsers = await Block.find({ blockerId: user.id, isBlocked: true });
  return blockedUsers;
};

const getAllHiddenUsers = async (user: JwtPayload) => {
  const hiddenUsers = await HideUser.find({ userId: user.id, isHidden: true });
  return hiddenUsers;
};

const createHideUserIntoDB = async (payload: IHideUser, user: JwtPayload) => {
  const existingHideUser = await HideUser.findOne({
    userId: user.id,
    hiddenUserId: payload.hiddenUserId,
  });
  if (existingHideUser) {
    await existingHideUser.updateOne({ isHidden: payload.isHidden });
    return existingHideUser;
  }
  const hideUser = await HideUser.create(payload);
  return hideUser;
};

export const BlockServices = {
  createBlockIntoDB,
  createHideUserIntoDB,
  getAllBlockedUsers,
  getAllHiddenUsers,
};
