import { Request, Response, NextFunction } from "express";
import { BlogsServices } from "./blogs.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogsServices.createBlogIntoDB(req.body, req.user!);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Blog created successfully",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogsServices.getAllBlogsWithFilteringFromDB(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Blogs fetched successfully",
    pagination: result.meta,
    data: result.blogs,
  });
});
export const BlogsController = { createBlog, getAllBlogs };
