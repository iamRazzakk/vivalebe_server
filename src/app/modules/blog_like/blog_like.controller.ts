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
      message: (data as any).message
        ? "Blog unliked successfully"
        : "Blog liked successfully",
      data: data,
    });
  },
);

const getBlogLikes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogLikeServices.getBlogLikesFromDB(
      req.params.id,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Blog likes fetched successfully",
      pagination: data.meta,
      data: data.data,
    });
  },
);

const getMyLikes = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await BlogLikeServices.getMyLikesFromDB(req.user!, req.query);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "My likes fetched successfully",
      pagination: data.meta,
      data: data.data,
    });
  },
);

export const BlogLikeController = {
  createBlogLike,
  getBlogLikes,
  getMyLikes,
};
