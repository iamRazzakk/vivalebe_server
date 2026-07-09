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

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
    const result = await PostsServices.getAllPostsFromDB(req.query);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Posts fetched successfully",
        data: result.posts,
        pagination: result.meta,
    });
});

const getPostsByUser = catchAsync(async (req: Request, res: Response) => {

    const result = await PostsServices.getPostsByUserFromDB(req.query, req.user);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: "Posts fetched successfully",
        pagination: result.meta,
        data: result.posts,
    });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
    const result = await PostsServices.getSinglePostFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: result ? "Post fetched successfully" : "Post not found",
        data: result ? result : null,
    });
});

export const PostsController = { createPost, getAllPosts, getPostsByUser, getSinglePost };
