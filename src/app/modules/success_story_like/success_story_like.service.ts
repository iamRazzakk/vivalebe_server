import { JwtPayload } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { ISuccessStoryLike } from "./success_story_like.interface";
import { SuccessStoryLike } from "./success_story_like.model";
import { SuccessStory } from "../success_story/success_story.model";

const createSuccessStoryLikeInDB = async (
  user: JwtPayload,
  payload: Pick<ISuccessStoryLike, "successStoryId">,
) => {
  const story = await SuccessStory.findById(payload.successStoryId)
    .select("_id")
    .lean();

  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Success story not found");
  }

  const deletedLike = await SuccessStoryLike.findOneAndDelete({
    userId: user.id,
    successStoryId: payload.successStoryId,
  });

  if (deletedLike) {
    await SuccessStory.findOneAndUpdate(
      {
        _id: payload.successStoryId,
        totalLikes: { $gt: 0 },
      },
      {
        $inc: { totalLikes: -1 },
      },
    );

    return {
      liked: false,
      message: "Success story unliked successfully",
      data: null,
    };
  }

  const newLike = await SuccessStoryLike.create({
    userId: user.id,
    successStoryId: payload.successStoryId,
  });

  await SuccessStory.findByIdAndUpdate(payload.successStoryId, {
    $inc: { totalLikes: 1 },
  });

  return {
    liked: true,
    message: "Success story liked successfully",
    data: newLike,
  };
};

const getSuccessStoryLikesFromDB = async (id: string) => {
  return SuccessStoryLike.find({ successStoryId: id }).lean();
};

export const SuccessStoryLikeServices = {
  createSuccessStoryLikeInDB,
  getSuccessStoryLikesFromDB,
};
