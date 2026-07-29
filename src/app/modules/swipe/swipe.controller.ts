import { Request, Response, NextFunction } from "express";
import { SwipeServices } from "./swipe.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

// create swipe user
const createSwipeUser = catchAsync(async (req: Request, res: Response) => {
  const swipe = await SwipeServices.createSwipeUserIntoDB(req.body, req.user);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message:
      swipe.action === "removed"
        ? "Liked removed successfully"
        : "Liked created successfully",
    data: swipe,
  });
});

// get feed users
const getFeedUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await SwipeServices.getFeedUsersFromDB(req.user, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Feed fetched successfully",
    pagination: result.meta,
    data: result.users,
  });
});
// undo swipe user
const undoSwipeUser = catchAsync(async (req: Request, res: Response) => {
  const result = await SwipeServices.undoSwipeUserIntoDB(
    req.body.action,
    req.user,
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Swipe undone successfully",
    data: result,
  });
});

// likes you users
const likesYouUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await SwipeServices.likesYouUsersFromDB(req.user, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Likes you users fetched successfully",
    pagination: result.meta,
    data: result.likesYouUsers,
  });
});

// you liked users
const youLikedUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await SwipeServices.youLikedUsersFromDB(req.user, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "You liked users fetched successfully",
    pagination: result.meta,
    data: result.youLikedUsers,
  });
});
export const SwipeController = {
  createSwipeUser,
  getFeedUsers,
  undoSwipeUser,
  likesYouUsers,
  youLikedUsers,
};
