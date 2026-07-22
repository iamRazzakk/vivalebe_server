import express, { NextFunction, Request, Response } from "express";
import { USER_ROLES } from "../../../enums/user";
import auth from "../../middlewares/auth";
import { MessageController } from "./message.controller";
import { fileUploadHandler } from "../../../shared/fileUploadHandler";
import { getMultipleFilesPath } from "../../middlewares/fileUploaderHandlarWithR2";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";

const router = express.Router();

router.post(
  "/",
  fileUploadHandler(),
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  requirePremiumMembership,
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const image = await getMultipleFilesPath(
        req.files as unknown as Record<string, Express.Multer.File[]>,
        "image",
      );
      data.image = image as string[];
      req.body = data;
      next();
    } catch (error) {
      next(error);
    }
  },
  MessageController.sendMessage,
);

router.get(
  "/:id",
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
  MessageController.getMessage,
);

export const MessageRoutes = router;
