import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SearchServices } from "./search.service";

const getMySearches = catchAsync(async (req: Request, res: Response) => {
  const result = await SearchServices.getMySearchesFromDB(req.user.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Search history fetched successfully",
    data: result,
  });
});

export const SearchController = {
  getMySearches,
};
