import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PrivateFileAccessServices } from "./privateFileAccess.service";

const createPrivateFileAccess = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PrivateFileAccessServices.createPrivateFileAccessIntoDB(
      req.body,
      req.user!,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: "Private file access request created successfully",
      data: result,
    });
  },
);

const getMyPrivateFileAccess = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await PrivateFileAccessServices.getMyPrivateFileAccessFromDB(req.user!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Private file access list fetched successfully",
      data: result,
    });
  },
);

const getSinglePrivateFileAccess = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await PrivateFileAccessServices.getSinglePrivateFileAccessFromDB(
        req.params.id,
        req.user!,
      );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Private file access fetched successfully",
      data: result,
    });
  },
);

const updatePrivateFileAccess = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await PrivateFileAccessServices.updatePrivateFileAccessIntoDB(
        req.params.id,
        req.body,
        req.user!,
      );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Private file access updated successfully",
      data: result,
    });
  },
);

const deletePrivateFileAccess = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await PrivateFileAccessServices.deletePrivateFileAccessFromDB(
        req.params.id,
        req.user!,
      );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Private file access deleted successfully",
      data: result,
    });
  },
);

export const PrivateFileAccessController = {
  createPrivateFileAccess,
  getMyPrivateFileAccess,
  getSinglePrivateFileAccess,
  updatePrivateFileAccess,
  deletePrivateFileAccess,
};
