import { Request, Response, NextFunction } from "express";
import { WinkServices } from "./wink.service";
import catchAsync from "../../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createWink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const wink = await WinkServices.createWinkIntoDB(
      req.body,
      req.user as JwtPayload,
    );
    sendResponse(res, {
      success: true,
      statusCode:
        wink.action === "removed" ? StatusCodes.OK : StatusCodes.CREATED,
      message:
        wink.action === "removed"
          ? "Wink removed successfully"
          : "Wink created successfully",
      data: wink,
    });
  },
);

const getAllWinksForMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const winks = await WinkServices.getAllWinksForMeFromDB(req.user!);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Winks fetched successfully",
      data: winks,
    });
  },
);

const getSingleWink = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const wink = await WinkServices.getSingleWinkFromDB(req.params.id);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Wink fetched successfully",
      data: wink,
    });
  },
);

// id: string,
//   payload: { isMatch: boolean },
//   user: JwtPayload,
const updateWinkMatchStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const wink = await WinkServices.updateWinkMatchStatusIntoDB(
      id,
      req.body,
      req.user! as JwtPayload,
    );
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Wink match status updated successfully",
      data: wink,
    });
  },
);

export const WinkController = {
  createWink,
  getSingleWink,
  getAllWinksForMe,
  updateWinkMatchStatus,
};
