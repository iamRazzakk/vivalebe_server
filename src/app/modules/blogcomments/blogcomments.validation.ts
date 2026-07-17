import { z } from "zod";
import { checkValidID } from "../../../shared/checkValidID";

const createBlogPostCommentZodSchema = z.object({
  body: z.object({
    blogId: checkValidID("Invalid Blog ID"),
    comment: z.string().min(1, { message: "Comment is required" }),
  }),
});

const updateBlogPostCommentZodSchema = z.object({
  body: z.object({
    comment: z.string().min(1, { message: "Comment is required" }),
  }),
});

export const BlogCommentsValidations = {
  createBlogPostCommentZodSchema,
  updateBlogPostCommentZodSchema,
};
