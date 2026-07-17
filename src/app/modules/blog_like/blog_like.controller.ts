import { Request, Response, NextFunction } from "express";
import { BlogLikeServices } from "./blog_like.service";
import catchAsync from "../../../shared/catchAsync";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const createBlogLike = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogLikeServices.createBlogLikeInDB(
      req.user!,
      req.params.id,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: (data as any).liked
        ? "Blog liked successfully"
        : "Blog unliked successfully",
      data: data,
    });
  },
);

export const BlogLikeController = {
  createBlogLike,
};
