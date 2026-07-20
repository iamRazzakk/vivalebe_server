import { Request, Response } from "express";
import { ViewMeServices } from "./viewme.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const getAllRecentlyViewedMe = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ViewMeServices.getAllRecentlyViewedMeFromDB(
      req.user,
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Recently viewed me fetched successfully",
      pagination: result.meta,
      data: result.recentlyViewedMe,
    });
  },
);

export const ViewMeController = {
  getAllRecentlyViewedMe,
};
