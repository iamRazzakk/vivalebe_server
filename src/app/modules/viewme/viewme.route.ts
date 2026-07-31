import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ViewMeController } from "./viewme.controller";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";

const router = express.Router();

router
  .route("/")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    requirePremiumMembership,
    ViewMeController.getAllRecentlyViewedMe,
  );

router
  .route("/count")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    ViewMeController.getAllViewedMe,
  );

router
  .route("/reset")
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    ViewMeController.resetViewedMe,
  );

export const ViewMeRoutes = router;
