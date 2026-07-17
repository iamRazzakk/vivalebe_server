import { z } from "zod";
import { checkValidID } from "../../../shared/checkValidID";

const createBlogLikeZodSchema = z.object({
  body: z.object({
    blogId: checkValidID("Invalid Blog ID"),
    userId: checkValidID("Invalid User ID"),
  }),
});

export const Blog_likeValidations = {
  createBlogLikeZodSchema,
};
