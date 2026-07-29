import express from "express";
import { SuccessStoryCommentController } from "./success_story_comment.controller";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryCommentController.createSuccessStoryComment,
  )
//   .get(
//     auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
//     SuccessStoryCommentController.getSuccessStoryComments,
//   );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryCommentController.getSuccessStoryComments,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryCommentController.updateSuccessStoryComment,
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryCommentController.deleteSuccessStoryComment,
  );

export const SuccessStoryCommentRoutes = router;
