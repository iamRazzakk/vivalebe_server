import express from "express";
import { SwipeController } from "./swipe.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { SwipeValidations } from "./swipe.validation";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    // validateRequest(SwipeValidations.swipeSchema),
    SwipeController.createSwipeUser,
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    SwipeController.getFeedUsers,
  );

router
  .route("/undo")
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    requirePremiumMembership,
    SwipeController.undoSwipeUser,
  );

router
  .route("/likes-you")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    requirePremiumMembership,
    SwipeController.likesYouUsers,
  );

router
  .route("/you-liked")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    requirePremiumMembership,
    SwipeController.youLikedUsers,
  );

export const SwipeRoutes = router;
