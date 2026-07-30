import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { SubscriptionService } from "./subscription.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";


const subscriptions = catchAsync( async(req: Request, res: Response)=>{
    const result = await SubscriptionService.getAllSubscriptionsListFromDB(req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription List Retrieved Successfully",
        pagination: result.total,
        data: result.subscriptions  
    })
});

const subscriptionDetails = catchAsync( async(req: Request, res: Response)=>{
    const result = await SubscriptionService.updateSubscriptionStatusFromDB(req.params.id, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Subscription Status Updated Successfully",
        data: result
    })
});




export const SubscriptionController = {
    subscriptions,
    subscriptionDetails,
}