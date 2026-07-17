import express from "express";
import { BlogLikeController } from "./blog_like.controller";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/:id")
  .post(auth(USER_ROLES.USER), BlogLikeController.createBlogLike);

export const BlogLikeRoutes = router;
