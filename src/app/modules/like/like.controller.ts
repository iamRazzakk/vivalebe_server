import { Request, Response, NextFunction } from 'express';
import { LikeServices } from './like.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';


const createLike = catchAsync(async (req: Request, res: Response) => {

    const like = await LikeServices.createLike(req.body, req.user);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Like created successfully",
        data: like,
    });
});


const getAllLikesByPost = catchAsync(async (req: Request, res: Response) => {
    const likes = await LikeServices.getAllLikesByPost(req.params.postId, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Likes fetched successfully",
        pagination: likes.meta.meta,
        data: likes.meta.data,
    });
});

export const LikeController = {
    createLike,
    getAllLikesByPost,
};
