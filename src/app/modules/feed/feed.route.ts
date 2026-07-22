import express from "express";
import { FeedController } from "./feed.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router
  .route("/")
  .get(auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), FeedController.getMyFeed);

export const FeedRoutes = router;
