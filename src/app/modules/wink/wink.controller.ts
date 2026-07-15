import { Request, Response, NextFunction } from 'express';
import { WinkServices } from './wink.service';
import catchAsync from '../../../shared/catchAsync';
import { JwtPayload } from 'jsonwebtoken';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';



const createWink = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    const wink = await WinkServices.createWinkIntoDB(req.body, req.user as JwtPayload);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.CREATED,
        message: 'Wink created successfully',
        data: wink,
    });
});


const getSingleWink = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const wink = await WinkServices.getSingleWinkFromDB(req.params.id);
    sendResponse(res, {
        success: true,
        statusCode: StatusCodes.OK,
        message: 'Wink fetched successfully',
        data: wink,
    });
});


export const WinkController = { createWink, getSingleWink };
