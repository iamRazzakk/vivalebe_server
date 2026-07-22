import { Request, Response, NextFunction } from "express";
import { FeedServices } from "./feed.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const getMyFeed = catchAsync(async (req: Request, res: Response) => {
  const result = await FeedServices.getMyFeedFromDB(req.user, req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Feed fetched successfully",
    pagination: result.meta,
    data: result.feed,
  });
});

export const FeedController = {
  getMyFeed,
};
