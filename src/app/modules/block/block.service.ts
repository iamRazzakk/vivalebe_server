import { JwtPayload } from "jsonwebtoken";
import { IBlock, IHideUser } from "./block.interface";
import { Block, HideUser } from "./block.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const createBlockIntoDB = async (payload: IBlock, user: JwtPayload) => {
  payload.blockerId = user.id;
  const blockPayload = {
    ...payload,
  };

  const existingBlock = await Block.findOne({
    blockerId: blockPayload.blockerId,
    blockedUserId: payload.blockedUserId,
  });
  if (existingBlock) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You have already blocked this user",
    );
  }
  const block = await Block.create(blockPayload);
  return block;
};

const getAllBlockedUsers = async (user: JwtPayload) => {
  const blockedUsers = await Block.find({
    blockerId: user.id,
    isBlocked: true,
  }).populate(
    "blockedUserId",
    "name nationality profile height weight education relationStatus bio",
  );
  return blockedUsers;
};

const getAllHiddenUsers = async (user: JwtPayload) => {
  const hiddenUsers = await HideUser.find({
    hiddenUserId: user.id,
    isHidden: true,
  }).populate(
    "userId",
    "name nationality profile height weight education relationStatus bio",
  );
  return hiddenUsers;
};

const unHideUserFromDB = async (user: JwtPayload, id: string) => {
  const hiddenUser = await HideUser.findByIdAndDelete({
    _id: id,
    hiddenUserId: user.id,
  });
  if (!hiddenUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Hidden user not found");
  }
  return hiddenUser;
};

const createHideUserIntoDB = async (payload: IHideUser, user: JwtPayload) => {
  payload.hiddenUserId = user.id;
  const existingHideUser = await HideUser.findOne({
    userId: payload.userId,
    hiddenUserId: payload.hiddenUserId,
  });
  if (existingHideUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You have already hidden this user",
    );
  }
  const hideUser = await HideUser.create(payload);
  return hideUser;
};

const unBlockUserFromDB = async (user: JwtPayload, id: string) => {
  const blockedUser = await Block.findByIdAndDelete({
    _id: id,
    blockerId: user.id,
  });
  return blockedUser;
};

export const BlockServices = {
  createBlockIntoDB,
  createHideUserIntoDB,
  getAllBlockedUsers,
  getAllHiddenUsers,
  unHideUserFromDB,
  unBlockUserFromDB,
};
