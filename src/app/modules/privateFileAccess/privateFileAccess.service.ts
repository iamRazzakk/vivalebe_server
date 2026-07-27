import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPrivateFileAccess } from "./privateFileAccess.interface";
import { PrivateFileAccess } from "./privateFileAccess.model";

const createPrivateFileAccessIntoDB = async (
  payload: Pick<IPrivateFileAccess, "providedUserId" | "message">,
  user: JwtPayload,
) => {
  if (payload.providedUserId.toString() === user.id) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You cannot request access to your own private files",
    );
  }

  const existing = await PrivateFileAccess.findOne({
    requestedUserId: new Types.ObjectId(user.id),
    providedUserId: payload.providedUserId,
  });

  if (existing) {
    throw new ApiError(
      StatusCodes.CONFLICT,
      "Access request already exists for this user",
    );
  }

  const accessRequest = await PrivateFileAccess.create({
    requestedUserId: new Types.ObjectId(user.id),
    providedUserId: payload.providedUserId,
    message: payload.message,
    isAccessGranted: false,
  });

  return accessRequest;
};

const getMyPrivateFileAccessFromDB = async (user: JwtPayload) => {
  const result = await PrivateFileAccess.find({
    $or: [
      { requestedUserId: new Types.ObjectId(user.id) },
      { providedUserId: new Types.ObjectId(user.id) },
    ],
  })
    .populate("requestedUserId", "name email profile displayName")
    .populate("providedUserId", "name email profile displayName")
    .lean();
  return result;
};

const getSinglePrivateFileAccessFromDB = async (
  id: string,
  user: JwtPayload,
) => {
  const access = await PrivateFileAccess.findById(new Types.ObjectId(id));

  if (!access) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Private file access not found");
  }

  if (
    access.requestedUserId.toString() !== user.id &&
    access.providedUserId.toString() !== user.id
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to view this access request",
    );
  }

  return PrivateFileAccess.findById(access._id)
    .populate("requestedUserId", "name email profile displayName")
    .populate("providedUserId", "name email profile displayName")
    .lean();
};

const updatePrivateFileAccessIntoDB = async (
  id: string,
  payload: Partial<Pick<IPrivateFileAccess, "isAccessGranted" | "message">>,
  user: JwtPayload,
) => {
  const access = await PrivateFileAccess.findById(new Types.ObjectId(id));

  if (!access) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Private file access not found");
  }

  const isProvider = access.providedUserId.toString() === user.id;
  const isRequester = access.requestedUserId.toString() === user.id;

  if (!isProvider && !isRequester) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this access request",
    );
  }

  if (payload.isAccessGranted !== undefined && !isProvider) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only the file owner can grant or revoke access",
    );
  }

  if (payload.message !== undefined && !isRequester) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "Only the requester can update the message",
    );
  }

  const updated = await PrivateFileAccess.findByIdAndUpdate(
    new Types.ObjectId(id),
    payload,
    { new: true },
  )
    .populate("requestedUserId", "name email profile displayName")
    .populate("providedUserId", "name email profile displayName")
    .lean();

  return updated;
};

const deletePrivateFileAccessFromDB = async (id: string, user: JwtPayload) => {
  const access = await PrivateFileAccess.findById(new Types.ObjectId(id));

  if (!access) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Private file access not found");
  }

  if (
    access.requestedUserId.toString() !== user.id &&
    access.providedUserId.toString() !== user.id
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this access request",
    );
  }

  await PrivateFileAccess.findByIdAndDelete(new Types.ObjectId(id));
  return access;
};

export const PrivateFileAccessServices = {
  createPrivateFileAccessIntoDB,
  getMyPrivateFileAccessFromDB,
  getSinglePrivateFileAccessFromDB,
  updatePrivateFileAccessIntoDB,
  deletePrivateFileAccessFromDB,
};
