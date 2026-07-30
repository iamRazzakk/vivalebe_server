import express from "express";
import { USER_ROLES } from "../../../../enums/user";
import { ReportsController } from "./reports.controller";
import auth from "../../../middlewares/auth";
const router = express.Router();

router.get("/", auth(USER_ROLES.SUPER_ADMIN), ReportsController.getAllReports);

router.get(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  ReportsController.getSingleReport,
);
router.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  ReportsController.updateReportStatus,
);
router.delete(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  ReportsController.deleteReport,
);

export const ReportsRoutes = router;
