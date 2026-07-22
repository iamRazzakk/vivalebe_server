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
  const newPrivateAlbum = await PrivateAlbum.create(privateAlbum);
  return newPrivateAlbum;
};

const getPrivateAlbumForMeFromDB = async (user: JwtPayload) => {
  const privateAlbum = await PrivateAlbum.findOne({
    user: new Types.ObjectId(user.id),
  });
  if (!privateAlbum) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Private album not found");
  }
  return privateAlbum;
};

export const PrivateAlbumServices = {
  createPrivateAlbum,
  getPrivateAlbumForMeFromDB,
};
