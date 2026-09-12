import { JwtPayload } from "jsonwebtoken";
import { IPrivateAlbum } from "./private_album.interface";
import { PrivateAlbum } from "./private_album.model";
import { Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const createPrivateAlbum = async (
  privateAlbum: IPrivateAlbum,
  user: JwtPayload,
) => {
  privateAlbum.user = new Types.ObjectId(user.id);
  const exist = await PrivateAlbum.findOne({
    user: new Types.ObjectId(user.id),
  });
  if (exist) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Private album already exists");
  }
  const newPrivateAlbum = await PrivateAlbum.create(privateAlbum);
  return newPrivateAlbum;
};

const getPrivateAlbumForMeFromDB = async (user: JwtPayload) => {
  const privateAlbum = await PrivateAlbum.findOne({
    user: new Types.ObjectId(user.id),
  }).populate(
    "user",
    "name nationality profile height weight education relationStatus bio height weight education relationStatus bio",
  );
  if (!privateAlbum) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Private album not found");
  }
  return privateAlbum;
};

const updatePrivateAlbumIntoDB = async (
  user: JwtPayload,
  id: string,
  payload: Partial<IPrivateAlbum>,
) => {
  const privateAlbum = await PrivateAlbum.findOneAndUpdate(
    { user: new Types.ObjectId(user.id), _id: id },
    payload,
    { new: true },
  );
  return privateAlbum;
};

export const PrivateAlbumServices = {
  createPrivateAlbum,
  getPrivateAlbumForMeFromDB,
  updatePrivateAlbumIntoDB,
};
