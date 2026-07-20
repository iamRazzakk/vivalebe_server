import { JwtPayload } from "jsonwebtoken";
import {
  FirstDateIdeasModel,
  IFirstDateIdeas,
} from "./first_date_ideas.interface";
import { Types } from "mongoose";
import { FirstDateIdeas } from "./first_date_ideas.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/queryBuilder";

const createFirstDateIdeasIntoDB = async (
  body: IFirstDateIdeas,
  user: JwtPayload,
) => {
  body.user = new Types.ObjectId(user.id);
  const result = await FirstDateIdeas.create(body);
  if (!result) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to create first date ideas",
    );
  }
  return result;
};

const getAllFirstDateIdeasFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder<IFirstDateIdeas>(FirstDateIdeas.find(), query)
    .filter()
    .sort()
    .paginate();
  const [result, meta] = await Promise.all([
    qb.modelQuery.exec(),
    qb.getPaginationInfo(),
  ]);
  return { result, meta };
};

const getSingleFirstDateIdeaFromDB = async (id: string) => {
  const result = await FirstDateIdeas.findById(id)
    .select("-__v -updatedAt")
    .lean();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "First date idea not found");
  }
  return result;
};

const updateFirstDateIdeaInDB = async (
  id: string,
  body: IFirstDateIdeas,
  user: JwtPayload,
) => {
  const idea = await FirstDateIdeas.findById(id).lean();
  if (!idea) {
    throw new ApiError(StatusCodes.NOT_FOUND, "First date idea not found");
  }
  if (idea.user.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this first date idea",
    );
  }
  const result = await FirstDateIdeas.findByIdAndUpdate(id, body, {
    new: true,
    user: new Types.ObjectId(user.id),
  });
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "First date idea not found");
  }
  return idea;
};

const deleteFirstDateIdeaFromDB = async (id: string, user: JwtPayload) => {
  const idea = await FirstDateIdeas.findById(id).lean();
  if (!idea) {
    throw new ApiError(StatusCodes.NOT_FOUND, "First date idea not found");
  }
  if (idea.user.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to delete this first date idea",
    );
  }
  const result = await FirstDateIdeas.findByIdAndDelete(id, {
    user: new Types.ObjectId(user.id),
  })
    .select("-__v -updatedAt")
    .lean();
  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, "First date idea not found");
  }
  return result;
};

export const FirstDateIdeasServices = {
  createFirstDateIdeasIntoDB,
  getAllFirstDateIdeasFromDB,
  getSingleFirstDateIdeaFromDB,
  updateFirstDateIdeaInDB,
  deleteFirstDateIdeaFromDB,
};
