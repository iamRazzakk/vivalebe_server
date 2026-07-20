import { Request, Response, NextFunction } from "express";
import catchAsync from "../../../shared/catchAsync";
import { FirstDateIdeasServices } from "./first_date_ideas.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createFirstDateIdea = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await FirstDateIdeasServices.createFirstDateIdeasIntoDB(
      req.body,
      req.user,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "First date idea created successfully",
      data,
    });
  },
);

const getAllFirstDateIdeas = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await FirstDateIdeasServices.getAllFirstDateIdeasFromDB(
      req.query,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "First date ideas fetched successfully",
      data: data.result,
      pagination: data.meta,
    });
  },
);

const getSingleFirstDateIdea = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await FirstDateIdeasServices.getSingleFirstDateIdeaFromDB(
      req.params.id,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "First date idea fetched successfully",
      data,
    });
  },
);

const updateFirstDateIdea = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = await FirstDateIdeasServices.updateFirstDateIdeaInDB(
      req.params.id,
      req.body,
      req.user,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "First date idea updated successfully",
      data,
    });
  },
);

const deleteFirstDateIdea = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await FirstDateIdeasServices.deleteFirstDateIdeaFromDB(
      req.params.id,
      req.user,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "First date idea deleted successfully",
    });
  },
);

export const FirstDateIdeaController = {
  createFirstDateIdea,
  getAllFirstDateIdeas,
  getSingleFirstDateIdea,
  updateFirstDateIdea,
  deleteFirstDateIdea,
};
