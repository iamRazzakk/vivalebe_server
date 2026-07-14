import { Request, Response, NextFunction } from 'express';
import { CommentsServices } from './comments.service';
import catchAsync from '../../../shared/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';


const createComments = catchAsync(async (req: Request, res: Response) => {

    const result = await CommentsServices.createCommentsIntoDB(req.body, req.user);
    sendResponse(res, {
        statusCode: StatusCodes.CREATED,
        success: true,
        message: "Comments created successfully",
        data: result,
    });
});

const updateComments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CommentsServices.updateCommentsInDB(id, req.body, req.user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Comments updated successfully",
        data: result,
    });
});

const deleteComments = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user as JwtPayload;
    const result = await CommentsServices.deleteCommentsFromDB(id, user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Comments deleted successfully",
        data: result,
    });
});
export const CommentsController = {
    createComments,
    updateComments,
    deleteComments,
};
