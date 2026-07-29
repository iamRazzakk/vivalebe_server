import { JwtPayload } from "jsonwebtoken";
import { ISuccessStoryComment } from "./success_story_comment.interface";
import { SuccessStoryComment } from "./success_story_comment.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { SuccessStory } from "../success_story/success_story.model";

const createSuccessStoryCommentInDB = async (
  payload: ISuccessStoryComment,
  user: JwtPayload,
) => {
  payload.userId = new Types.ObjectId(user.id);
  const result = await SuccessStoryComment.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create success story comment",
    );
  }
  await SuccessStory.findByIdAndUpdate(payload.successStoryId, {
    $inc: { totalComments: 1 },
  });
  return result;
};

const getSuccessStoryCommentsFromDB = async (id: string) => {
  return SuccessStoryComment.find({ successStoryId: id }).lean();
};

const deleteSuccessStoryCommentFromDB = async (
  id: string,
  user: JwtPayload,
) => {
  const result = await SuccessStoryComment.findOneAndDelete({
    _id: id,
    userId: user.id,
  });
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Success story comment not found",
    );
  }
  await SuccessStory.findByIdAndUpdate(result.successStoryId, {
    $inc: { totalComments: -1 },
  });
  return result;
};

const updateSuccessStoryCommentInDB = async (
  id: string,
  payload: Partial<ISuccessStoryComment>,
  user: JwtPayload,
) => {
  const result = await SuccessStoryComment.findOneAndUpdate(
    { _id: id, userId: user.id },
    payload,
    { new: true },
  );
  if (!result) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Success story comment not found",
    );
  }
  return result;
};

export const SuccessStoryCommentServices = {
  createSuccessStoryCommentInDB,
  getSuccessStoryCommentsFromDB,
  deleteSuccessStoryCommentFromDB,
  updateSuccessStoryCommentInDB,
};
