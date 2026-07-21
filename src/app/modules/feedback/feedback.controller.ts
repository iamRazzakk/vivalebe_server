import { Request, Response, NextFunction } from "express";
import { FeedbackServices } from "./feedback.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createFeedback = catchAsync(async (req: Request, res: Response) => {
  const feedback = await FeedbackServices.createFeedbackToDB(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Feedback created successfully",
    data: feedback,
  });
});

const getFeedback = catchAsync(async (req: Request, res: Response) => {
  const feedback = await FeedbackServices.getFeedbackFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Feedback retrieved successfully",
    data: feedback,
  });
});

const updateFeedback = catchAsync(async (req: Request, res: Response) => {
  const feedback = await FeedbackServices.updateFeedbackToDB(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Feedback updated successfully",
    data: feedback,
  });
});

export const FeedbackController = {
  createFeedback,
  getFeedback,
  updateFeedback,
};
