import express, { NextFunction, Request, Response } from "express";
import auth from "../../middlewares/auth";
import { ChatController } from "./chat.controller";
import { USER_ROLES } from "../../../enums/user";
import { isAdminVerified } from "../../../shared/adminVerified";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";
const router = express.Router();

router.post(
  "/:id",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      req.body = data;
      next();
    } catch (error) {
      next(error);
    }
  },
  ChatController.createChat,
);
router.get(
  "/",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  ChatController.getChat,
);
router.get(
  "/:id",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  ChatController.getSingleChat,
);
export const ChatRoutes = router;
