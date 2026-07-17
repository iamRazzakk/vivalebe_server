import { JwtPayload } from "jsonwebtoken";
import { IBlogPostComments } from "./blogcomments.interface";
import { BlogPostComments } from "./blogcomments.model";
import { Types } from "mongoose";
import { Blogs } from "../blogs/blogs.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const createBlogComment = async (
  payload: IBlogPostComments,
  user: JwtPayload,
) => {
  payload.userId = user.id;
  const result = await BlogPostComments.create(payload);
  await Blogs.findByIdAndUpdate(payload.blogId, {
    $inc: { totalComments: 1 },
  });
  return result;
};

const getAllBlogCommentsBasedOnBlogId = async (id: string) => {
  const data = await BlogPostComments.find({ blogId: new Types.ObjectId(id) })
    .populate({
      path: "userId",
      select: "name profile",
    })
    .sort({ createdAt: -1 })
    .select("-__v");
  return data;
};

const updateBlogCommentIntoDB = async (
  id: string,
  payload: Partial<IBlogPostComments>,
) => {
  const data = await BlogPostComments.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return data;
};

const deleteBlogCommentFromDB = async (id: string, user: JwtPayload) => {
  const data = await BlogPostComments.findByIdAndDelete(id, {
    userId: user.id,
  });
  if (!data) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Unauthorized to delete this blog comment",
    );
  }
  await Blogs.findByIdAndUpdate(data.blogId, {
    $inc: { totalComments: -1 },
  });
  return data;
};

export const BlogCommentsServices = {
  createBlogComment,
  getAllBlogCommentsBasedOnBlogId,
  updateBlogCommentIntoDB,
  deleteBlogCommentFromDB,
};
