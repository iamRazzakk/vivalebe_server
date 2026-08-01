import express from "express";
import { EventBookingController } from "./eventbooking.controller";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
const router = express.Router();

router.post(
  "/create",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  EventBookingController.createBooking,
);

router.get(
  "/my",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  EventBookingController.getMyBookings,
);

router.get(
  "/:id",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  EventBookingController.getSingleBooking,
);

router.get(
  "/event/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  EventBookingController.getAllBookings,
);

router.patch(
  "/:id/request",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  EventBookingController.updateBookingRequest,
);

export const EventBookingRoutes = router;
