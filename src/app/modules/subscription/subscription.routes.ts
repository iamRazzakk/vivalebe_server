import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { SubscriptionController } from "./subscription.controller";
const router = express.Router();

router.get(
  "/",
  auth(USER_ROLES.SUPER_ADMIN),
  SubscriptionController.subscriptions,
);

router.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  SubscriptionController.subscriptionDetails,
);

export const SubscriptionRoutes = router;
