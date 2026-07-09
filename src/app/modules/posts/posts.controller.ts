import { Request, Response, NextFunction } from 'express';
import { PostsServices } from './posts.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from "http-status-codes";


const createPost = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const result = await PostsServices.createPostToDB(req.body, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: "Post created successfully",
        data: result.data,
    });
});

export const PostsController = { createPost };
