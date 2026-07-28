import { Request, Response, NextFunction } from "express";
import { PrivateAlbumServices } from "./private_album.service";
import catchAsync from "../../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createPrivateAlbum = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrivateAlbumServices.createPrivateAlbum(
      req.body,
      req.user as JwtPayload,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Private album created successfully",
      data: result,
    });
  },
);

const getPrivateAlbumForMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrivateAlbumServices.getPrivateAlbumForMeFromDB(
      req.user as JwtPayload,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Private album fetched successfully",
      data: result,
    });
  },
);

const updatePrivateAlbum = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await PrivateAlbumServices.updatePrivateAlbumIntoDB(
      req.user as JwtPayload,
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Private album updated successfully",
      data: result,
    });
  },
);
export const PrivateAlbumController = {
  createPrivateAlbum,
  getPrivateAlbumForMe,
  updatePrivateAlbum,
};
