import { Request, Response, NextFunction } from "express";
import { SuccessStoryCommentServices } from "./success_story_comment.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createSuccessStoryComment = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SuccessStoryCommentServices.createSuccessStoryCommentInDB(
        req.body,
        req.user!,
      );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Success story comment created successfully",
      data: result,
    });
  },
);

const getSuccessStoryComments = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SuccessStoryCommentServices.getSuccessStoryCommentsFromDB(
        req.params.id,
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Success story comments fetched successfully",
      data: result,
    });
  },
);

const deleteSuccessStoryComment = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SuccessStoryCommentServices.deleteSuccessStoryCommentFromDB(
        req.params.id,
        req.user!,
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Success story comment deleted successfully",
      data: result,
    });
  },
);

const updateSuccessStoryComment = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await SuccessStoryCommentServices.updateSuccessStoryCommentInDB(
        req.params.id,
        req.body,
        req.user!,
      );
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Success story comment updated successfully",
      data: result,
    });
  },
);

export const SuccessStoryCommentController = {
  createSuccessStoryComment,
  getSuccessStoryComments,
  deleteSuccessStoryComment,
  updateSuccessStoryComment,
};
