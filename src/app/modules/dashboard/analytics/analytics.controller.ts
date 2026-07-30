import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../../shared/catchAsync";
import sendResponse from "../../../../shared/sendResponse";
import { AnalyticsService } from "./analytics.service";

const getWeeklySwipeAnalytics = catchAsync(
  async (_req: Request, res: Response) => {
    const data = await AnalyticsService.getWeeklySwipeAnalyticsFromDB();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Weekly swipe analytics fetched successfully",
      data,
    });
  },
);
const getMonthlyRevenueAnalytics = catchAsync(
  async (_req: Request, res: Response) => {
    const data = await AnalyticsService.getMonthlyRevenueAnalyticsFromDB();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Monthly revenue analytics fetched successfully",
      data,
    });
  },
);

const getPlanDistributionAnalytics = catchAsync(
  async (_req: Request, res: Response) => {
    const data = await AnalyticsService.getPlanDistributionAnalyticsFromDB();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Plan distribution analytics fetched successfully",
      data,
    });
  },
);
const getGenderDistributionAnalytics = catchAsync(
    async (_req: Request, res: Response) => {
      const data = await AnalyticsService.getGenderDistributionAnalyticsFromDB();
  
      sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Gender distribution analytics fetched successfully",
        data,
      });
    },
  );

const getAgeDistributionAnalytics = catchAsync(
  async (_req: Request, res: Response) => {
    const data = await AnalyticsService.getAgeDistributionAnalyticsFromDB();
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Age distribution analytics fetched successfully",
      data,
    });
  },
  );

export const AnalyticsController = {
  getWeeklySwipeAnalytics,
  getMonthlyRevenueAnalytics,
    getPlanDistributionAnalytics,
    getGenderDistributionAnalytics,
    getAgeDistributionAnalytics,
  };
