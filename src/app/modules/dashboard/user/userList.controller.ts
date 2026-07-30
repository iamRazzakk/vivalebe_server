import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { UserListService } from "./userList.service";
import { Request, Response } from "express";

const getUserList = catchAsync(async (req: Request, res: Response) => {
  const userList = await UserListService.getUserListFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User list fetched successfully",
    pagination: userList.meta,
    data: userList.data,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserListService.getSingleUserFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User fetched successfully",
    data: user,
  });
});

const banThisUser = catchAsync(async (req: Request, res: Response) => {
  const user = await UserListService.banThisUserFromDB(req.params.id);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User banned successfully",
    data: user,
  });
});
export const UserListController = {
  getUserList,
  getSingleUser,
  banThisUser,
};
