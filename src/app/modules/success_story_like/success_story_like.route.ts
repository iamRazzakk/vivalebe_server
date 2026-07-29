import express from "express";
import { SuccessStoryLikeController } from "./success_story_like.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();
router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryLikeController.createSuccessStoryLike,
  );
router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryLikeController.getSuccessStoryLikes,
  );
export const SuccessStoryLikeRoutes = router;
