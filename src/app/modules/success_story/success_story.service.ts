import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../builder/queryBuilder";
import { ISuccess_story } from "./success_story.interface";
import { SuccessStory } from "./success_story.model";
import { SuccessStoryLike } from "../success_story_like/success_story_like.model";

const createSuccessStoryIntoDB = async (
  payload: ISuccess_story,
  user: JwtPayload,
) => {
  payload.userId = new Types.ObjectId(user.id);
  const result = await SuccessStory.create(payload);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create success story",
    );
  }
  return result;
};

const getAllSuccessStoriesFromDB = async (
  query: Record<string, any>,
  user: JwtPayload,
) => {
  const qb = new QueryBuilder<ISuccess_story>(SuccessStory.find(), query)
    .filter()
    .sort()
    .paginate();

  const [stories, meta] = await Promise.all([
    qb.modelQuery.populate("userId", "name profile displayName").lean().exec(),
    qb.getPaginationInfo(),
  ]);
  const likedStories = await SuccessStoryLike.find({
    userId: user.id,
  }).lean();
  const likedStoryIds = new Set(
    likedStories.map((like) => like.successStoryId.toString()),
  );
  const result = stories.map((story: any) => ({
    ...story,
    isLiked: likedStoryIds.has(story?._id.toString()),
  }));
  return { result, meta };
};

const getSingleSuccessStoryFromDB = async (id: string) => {
  const result = await SuccessStory.findById(id)
    .populate("userId", "name profile displayName")
    .select("-__v")
    .lean();

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Success story not found");
  }
  return result;
};

const updateSuccessStoryIntoDB = async (
  id: string,
  payload: Partial<ISuccess_story>,
  user: JwtPayload,
) => {
  const story = await SuccessStory.findById(id).lean();
  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Success story not found");
  }
  if (story.userId.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this success story",
    );
  }

  const result = await SuccessStory.findByIdAndUpdate(id, payload, {
    new: true,
  }).lean();

  return result;
};

const deleteSuccessStoryFromDB = async (id: string, user: JwtPayload) => {
  const story = await SuccessStory.findById(id).lean();
  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Success story not found");
  }
  if (story.userId.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this success story",
    );
  }

  const result = await SuccessStory.findByIdAndDelete(id).lean();
  return result;
};

export const SuccessStoryServices = {
  createSuccessStoryIntoDB,
  getAllSuccessStoriesFromDB,
  getSingleSuccessStoryFromDB,
  updateSuccessStoryIntoDB,
  deleteSuccessStoryFromDB,
};
