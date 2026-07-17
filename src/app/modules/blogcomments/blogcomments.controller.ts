import { Request, Response, NextFunction } from "express";
import { BlogCommentsServices } from "./blogcomments.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createBlogComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogCommentsServices.createBlogComment(
      req.body,
      req.user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Blog comment created successfully",
      data: data,
    });
  },
);

const getAllBlogCommentsBasedOnBlogId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogCommentsServices.getAllBlogCommentsBasedOnBlogId(
      req.params.id,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog comments fetched successfully",
      data: data,
    });
  },
);

const updateBlogComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogCommentsServices.updateBlogCommentIntoDB(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog comment updated successfully",
      data: data,
    });
  },
);

const deleteBlogComment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogCommentsServices.deleteBlogCommentFromDB(
      req.params.id,
      req.user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog comment deleted successfully",
      data: data,
    });
  },
);
export const BlogCommentsController = {
  createBlogComment,
  getAllBlogCommentsBasedOnBlogId,
  updateBlogComment,
  deleteBlogComment,
};
