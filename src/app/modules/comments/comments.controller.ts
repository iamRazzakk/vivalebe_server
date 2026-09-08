import { Request, Response } from 'express';
import { CommentsServices } from './comments.service';
import catchAsync from '../../../shared/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getChannel } from '../../../config/rabbitmq';
import crypto from 'crypto';

const COMMENT_QUEUE = "comment_processing_queue";

const createComments = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const trackingId = req.body.trackingId || crypto.randomUUID();

    const payload = {
        comment: req.body.comment,
        postId: req.body.postId,
        userId: user.id,
        trackingId,
    };

    const channel = await getChannel();
    await channel.assertQueue(COMMENT_QUEUE, { durable: true });
    channel.sendToQueue(COMMENT_QUEUE, Buffer.from(JSON.stringify(payload)), {
        persistent: true,
        messageId: trackingId,
    });

    sendResponse(res, {
        statusCode: StatusCodes.ACCEPTED,
        success: true,
        message: "Comment submission accepted",
        data: payload,
    });
});

const getCommentsByPostId = catchAsync(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const result = await CommentsServices.getCommentsByPostId(postId, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Comments fetched successfully",
        data: result.data,
        pagination: result.meta,
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
    getCommentsByPostId,
    updateComments,
    deleteComments,
};
