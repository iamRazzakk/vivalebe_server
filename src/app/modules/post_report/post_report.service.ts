import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import { IPostReport } from "./post_report.interface";
import { PostReport } from "./post_report.model";
import QueryBuilder from "../../builder/queryBuilder";
import { JwtPayload } from "jsonwebtoken";

export const createPostReport = async (
  payload: IPostReport,
  user: JwtPayload,
) => {
  payload.userId = user.id;
  const postReport = await PostReport.create(payload);
  if (!postReport) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create post report");
  }
  return postReport;
};

const getAllReportedPostFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(PostReport.find(), query)
    .filter()
    .sort()
    .populate(["postId", "userId"], {
      postId: "description content likeCount commentCount",
      userId: "name email profile",
    })
    .paginate();
  const [result, meta] = await Promise.all([
    qb.modelQuery.exec(),
    qb.getPaginationInfo(),
  ]);
  return {
    result,
    meta,
  };
};

const updateReportedPostStatus = async (
  id: string,
  payload: Partial<IPostReport>,
) => {
  const postReport = await PostReport.findByIdAndUpdate(id, payload, {
    new: true,
  });
  if (!postReport) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Failed to update post report status",
    );
  }
  return postReport;
};

const deleteReportedPostFromDB = async (id: string) => {
  const postReport = await PostReport.findByIdAndDelete(id);
  if (!postReport) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to delete post report");
  }
  return postReport;
};

export const PostReportServices = {
  createPostReport,
  getAllReportedPostFromDB,
  updateReportedPostStatus,
  deleteReportedPostFromDB,
};
