import { Request, Response } from "express";
import { BlockServices } from "./block.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
const createBlock = catchAsync(async (req: Request, res: Response) => {
  const result = await BlockServices.createBlockIntoDB(req.body, req.user!);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Block created successfully",
    data: result,
  });
});
const createHideUser = catchAsync(async (req: Request, res: Response) => {
  const result = await BlockServices.createHideUserIntoDB(req.body, req.user!);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Hide user created successfully",
    data: result,
  });
});
const getAllBlockedUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await BlockServices.getAllBlockedUsers(req.user!);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Blocked users fetched successfully",
    data: result,
  });
});
const getAllHiddenUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await BlockServices.getAllHiddenUsers(req.user!);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Hidden users fetched successfully",
    data: result,
  });
});


const unHideUser = catchAsync(async (req: Request, res: Response) => {
  const result = await BlockServices.unHideUserFromDB(req.user!, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Hidden user unhidden successfully",
    data: result,
  });
});
const unBlockUser = catchAsync(async (req: Request, res: Response) => {
  const result = await BlockServices.unBlockUserFromDB(req.user!, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Blocked user unblocked successfully",
    data: result,
  });
});
export const BlockController = {
  createBlock,
  createHideUser,
  getAllBlockedUsers,
  getAllHiddenUsers,
  unHideUser,
  unBlockUser,
};
