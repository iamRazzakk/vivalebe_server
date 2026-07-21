import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import QueryBuilder from "../../builder/queryBuilder";
import { FeedbackModel, IFeedback } from "./feedback.interface";
import { Feedback } from "./feedback.model";

const createFeedbackToDB = async (payload: IFeedback): Promise<IFeedback> => {
  const feedback = await Feedback.create(payload);
  return feedback;
};

const getFeedbackFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(Feedback.find(), query)
    .filter()
    .sort()
    .paginate();
  const [result, meta] = await Promise.all([
    qb.modelQuery,
    qb.getPaginationInfo(),
  ]);
  return {
    result,
    meta,
  };
};

const updateFeedbackToDB = async (id: string, payload: IFeedback) => {
  const feedback = await Feedback.findByIdAndUpdate(id, payload, { new: true });
  if (!feedback) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Feedback not found");
  }
  return feedback;
};

export const FeedbackServices = {
  createFeedbackToDB,
  getFeedbackFromDB,
  updateFeedbackToDB,
};
