import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { NotificationService } from './notification.service';

const getNotificationFromDB = catchAsync( async (req: Request, res: Response) => {
    const user = req.user;
    const result = await NotificationService.getAllNotificationsFromDB(user, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notifications Retrieved Successfully',
        data: result.notifications,
        pagination: result.total,
    });
  }
);

const readNotification = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await NotificationService.readNotificationFromDB(user, req.params.id);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Notification Read Successfully',
        data: result
    });
});


export const NotificationController = {
    getNotificationFromDB,
    readNotification,
};
