import express from "express";
import { USER_ROLES } from "../../../../enums/user";
import auth from "../../../middlewares/auth";
import { AnalyticsController } from "./analytics.controller";

const router = express.Router();

router.get(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getWeeklySwipeAnalytics,
);
router.get(
  "/revenue",
  auth(USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getMonthlyRevenueAnalytics,
);
router.get(
  "/plan-distribution",
  auth(USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getPlanDistributionAnalytics,
);
router.get(
  "/gender-distribution",
  auth(USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getGenderDistributionAnalytics,
);
router.get(
  "/age-distribution",
  auth(USER_ROLES.SUPER_ADMIN),
  AnalyticsController.getAgeDistributionAnalytics,
);

export const AnalyticsRoutes = router;
