import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { SuccessStoryLikeServices } from "./success_story_like.service";

const createSuccessStoryLike = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SuccessStoryLikeServices.createSuccessStoryLikeInDB(
      req.user!,
      req.body,
    );

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: result.message,
      data: {
        liked: result.liked,
        like: result.data,
      },
    });
  },
);

const getSuccessStoryLikes = catchAsync(async (req: Request, res: Response) => {
  const result = await SuccessStoryLikeServices.getSuccessStoryLikesFromDB(
    req.params.id,
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Success story likes fetched successfully",
    data: result,
  });
});

export const SuccessStoryLikeController = {
  createSuccessStoryLike,
  getSuccessStoryLikes,
};
