import { JwtPayload } from "jsonwebtoken";
import { BlogLikes } from "./blog_like.model";
import { Blogs } from "../blogs/blogs.model";
import QueryBuilder from "../../builder/queryBuilder";

const createBlogLikeInDB = async (user: JwtPayload, blogId: string) => {
  const deletedLike = await BlogLikes.findOneAndDelete({
    blogId,
    userId: user.id,
  });

  if (deletedLike) {
    await Blogs.findByIdAndUpdate(blogId, {
      $inc: { totalLikes: -1 },
    });
    return {
      liked: false,
      message: "Blog unliked successfully",
    };
  }

  const newLike = await BlogLikes.create({
    blogId,
    userId: user.id,
  });
  await Blogs.findByIdAndUpdate(blogId, {
    $inc: { totalLikes: 1 },
  });
  return newLike;
};

const getBlogLikesFromDB = async (id: string, query: Record<string, any>) => {
  const qb = new QueryBuilder(BlogLikes.find({ blogId: id }), query)
    .filter()
    .sort()
    .paginate();
  const [data, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    data,
    meta,
  };
};

export const BlogLikeServices = {
  createBlogLikeInDB,
  getBlogLikesFromDB,
};
