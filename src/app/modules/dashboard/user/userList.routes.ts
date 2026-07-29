import express from "express";
import { UserListController } from "./userList.controller";
import auth from "../../../middlewares/auth";
import { USER_ROLES } from "../../../../enums/user";
const router = express.Router();

router.get("/", auth(USER_ROLES.SUPER_ADMIN), UserListController.getUserList);

router.get(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  UserListController.getSingleUser,
);

router.patch(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN),
  UserListController.banThisUser,
);

export const UserListRoutes = router;
