import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SuccessStoryServices } from "./success_story.service";

const createSuccessStory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await SuccessStoryServices.createSuccessStoryIntoDB(
      req.body,
      req.user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Success story created successfully",
      data,
    });
  },
);

const getAllSuccessStories = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await SuccessStoryServices.getAllSuccessStoriesFromDB(
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Success stories fetched successfully",
      data: data.result,
      pagination: data.meta,
    });
  },
);

const getSingleSuccessStory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await SuccessStoryServices.getSingleSuccessStoryFromDB(
      req.params.id,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Success story fetched successfully",
      data,
    });
  },
);

const updateSuccessStory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const data = await SuccessStoryServices.updateSuccessStoryIntoDB(
      req.params.id,
      req.body,
      req.user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Success story updated successfully",
      data,
    });
  },
);

const deleteSuccessStory = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    await SuccessStoryServices.deleteSuccessStoryFromDB(
      req.params.id,
      req.user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Success story deleted successfully",
    });
  },
);

export const SuccessStoryController = {
  createSuccessStory,
  getAllSuccessStories,
  getSingleSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
};
