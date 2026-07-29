import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { OverviewService } from "./overview.service";
import { Request, Response } from "express";

const getOverviewData = catchAsync(async (req: Request, res: Response) => {
  const overviewData = await OverviewService.getOverviewDataFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Overview data fetched successfully",
    data: overviewData,
  });
});

const getUserActivity = catchAsync(async (req: Request, res: Response) => {
  const userActivity = await OverviewService.getUserActivityFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "User activity fetched successfully",
    data: userActivity,
  });
});

const getNewUserActivity = catchAsync(async (req: Request, res: Response) => {
  const newUserActivity = await OverviewService.getNewUserActivityFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "New user activity fetched successfully",
    data: newUserActivity,
  });
});

const getRecent10SignUpUser = catchAsync(
  async (req: Request, res: Response) => {
    const recent10SignUpUser =
      await OverviewService.getRecent10SignUpUserFromDB();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Recent 10 sign up user fetched successfully",
      data: recent10SignUpUser,
    });
  },
);

const getRecent10Report = catchAsync(async (req: Request, res: Response) => {
  const recent10Report = await OverviewService.getRecent10ReportFromDB();
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Recent 10 report fetched successfully",
    data: recent10Report,
  });
});

const getRecent10SubscriptionUser = catchAsync(
  async (req: Request, res: Response) => {
    const recent10SubscriptionUser =
      await OverviewService.getRecent10SubscriptionUserFromDB();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Recent 10 subscription user fetched successfully",
      data: recent10SubscriptionUser,
    });
  },
);

export const OverviewController = {
  getOverviewData,
  getUserActivity,
  getNewUserActivity,
  getRecent10SignUpUser,
  getRecent10Report,
  getRecent10SubscriptionUser,
};
