import express from "express";
import { BlogCommentsController } from "./blogcomments.controller";
import validateRequest from "../../middlewares/validateRequest";
import { BlogCommentsValidations } from "./blogcomments.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    validateRequest(BlogCommentsValidations.createBlogPostCommentZodSchema),
    BlogCommentsController.createBlogComment,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    BlogCommentsController.getAllBlogCommentsBasedOnBlogId,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    validateRequest(BlogCommentsValidations.updateBlogPostCommentZodSchema),
    BlogCommentsController.updateBlogComment,
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    BlogCommentsController.deleteBlogComment,
  );

export const BlogCommentsRoutes = router;
