import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { NotificationController } from "./notification.controller";
const router = express.Router();

router.get(
  "/",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  NotificationController.getNotificationFromDB,
);

router.patch(
  "/:id",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  NotificationController.readNotification,
);

export const NotificationRoutes = router;
