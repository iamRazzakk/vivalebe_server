import express from "express";
import { WinkController } from "./wink.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    WinkController.createWink,
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    WinkController.getAllWinksForMe,
  );

router
  .route("/:id")
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    WinkController.updateWinkMatchStatus,
  );
export const WinkRoutes = router;
