import { Request, Response, NextFunction } from "express";
import { PostReportServices } from "./post_report.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createReportedPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostReportServices.createPostReport(req.body, req.user);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Report submitted",
    data: result,
  });
});

const getAllReportedPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostReportServices.getAllReportedPostFromDB(req.query);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reported posts fetched successfully",
    pagination: result.meta,
    data: result.result,
  });
});

const updateReportedPostStatus = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PostReportServices.updateReportedPostStatus(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reported post status updated successfully",
      data: result,
    });
  },
);

const deleteReportedPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostReportServices.deleteReportedPostFromDB(
    req.params.id,
  );
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reported post deleted successfully",
    data: result,
  });
});

export const PostReportController = {
  createReportedPost,
  getAllReportedPost,
  updateReportedPostStatus,
  deleteReportedPost,
};
