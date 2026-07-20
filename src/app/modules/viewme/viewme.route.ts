import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ViewMeController } from "./viewme.controller";

const router = express.Router();

router
  .route("/")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    ViewMeController.getAllRecentlyViewedMe,
  );

export const ViewMeRoutes = router;
