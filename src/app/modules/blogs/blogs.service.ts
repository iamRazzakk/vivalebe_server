import { JwtPayload } from "jsonwebtoken";
import { BlogsModel, IBlogs } from "./blogs.interface";
import { Types } from "mongoose";
import { Blogs } from "./blogs.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import QueryBuilder from "../../builder/queryBuilder";

const createBlogIntoDB = async (payload: IBlogs, user: JwtPayload) => {
  const result = await Blogs.create({
    ...payload,
    userId: new Types.ObjectId(user.id),
  });
  if (!result) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create blog");
  }
  return result;
};

const getAllBlogsWithFilteringFromDB = async (
  queue: Record<string, unknown>,
) => {
  const qb = new QueryBuilder(Blogs.find(), queue)
    .fields()
    .filter()
    .sort()
    .cursorPaginate()
    .populate(["userId"], {
      userId: "name email profile nationality country state",
    });
  const results = await qb.modelQuery.lean();
  const { data: blogs, meta } = qb.getCursorPaginationMeta(
    results as Record<string, unknown>[],
  );

  return { blogs, meta };
};

const myBlogsFromDB = async (id: string, query: Record<string, unknown>) => {
  const qb = new QueryBuilder(
    Blogs.find({ userId: new Types.ObjectId(id) }),
    query,
  )
    .fields()
    .filter()
    .sort()
    .cursorPaginate()
    .populate(["userId"], {
      userId: "name email profile nationality country state",
    });
  const results = await qb.modelQuery.lean();
  const { data: blogs, meta } = qb.getCursorPaginationMeta(
    results as Record<string, unknown>[],
  );
  return { blogs, meta };
};
export const BlogsServices = {
  createBlogIntoDB,
  getAllBlogsWithFilteringFromDB,
  myBlogsFromDB,
};
