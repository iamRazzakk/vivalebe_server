import { JwtPayload } from "jsonwebtoken";
import { BlogLikes } from "./blog_like.model";

const createBlogLikeInDB = async (user: JwtPayload, blogId: string) => {
  const deletedLike = await BlogLikes.findOneAndDelete({
    blogId,
    userId: user.id,
  });

  if (deletedLike) {
    return {
      liked: false,
      message: "Blog unliked successfully",
    };
  }

  const newLike = await BlogLikes.create({
    blogId,
    userId: user.id,
  });
  return newLike;
};

export const BlogLikeServices = {
  createBlogLikeInDB,
};
