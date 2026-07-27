import express from "express";
import { BlockController } from "./block.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();
router
  .route("/")
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    BlockController.createBlock,
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    BlockController.getAllBlockedUsers,
  );

router
  .route("/hide")
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    BlockController.createHideUser,
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    BlockController.getAllHiddenUsers,
  );

export const BlockRoutes = router;
