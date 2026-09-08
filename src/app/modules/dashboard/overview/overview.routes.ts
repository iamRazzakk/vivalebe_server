import express from "express";
import { OverviewController } from "./overview.controller";
import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";
const router = express.Router();

router.get(
  "/overview",
  auth(USER_ROLES.SUPER_ADMIN),
  OverviewController.getOverviewData,
);

// admin

router.get(
  "/user-activity",
  auth(USER_ROLES.SUPER_ADMIN),
  OverviewController.getUserActivity,
);

router.get(
  "/new-user-activity",
  auth(USER_ROLES.SUPER_ADMIN),
  OverviewController.getNewUserActivity,
);

router.get(
  "/recent-signup-users",
  auth(USER_ROLES.SUPER_ADMIN),
  OverviewController.getRecent10SignUpUser,
);

router.get(
  "/recent-reports",
  auth(USER_ROLES.SUPER_ADMIN),
  OverviewController.getRecent10Report,
);

router.get(
  "/recent-subscriptions",
  auth(USER_ROLES.SUPER_ADMIN),
  OverviewController.getRecent10SubscriptionUser,
);

export const OverviewRoutes = router;
