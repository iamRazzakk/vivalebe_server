import express, { NextFunction, Request, Response } from "express";
import { PrivateAlbumController } from "./private_album.controller";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import {
  getMultipleFilesPath,
  getUploadFields,
} from "../../middlewares/fileUploaderHandlarWithR2";
import { createBlurredImage } from "../../../shared/protectedFile";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    getUploadFields(),
    requirePremiumMembership,
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const data = req.body;
        const imageFiles =
          (req.files as Record<string, Express.Multer.File[]>)?.image ?? [];

        const images =
          (await getMultipleFilesPath(
            req.files as Record<string, Express.Multer.File[]>,
            "image",
          )) ?? [];
        const media =
          (await getMultipleFilesPath(
            req.files as Record<string, Express.Multer.File[]>,
            "media",
          )) ?? [];

        const protectedImages: string[] = [];
        for (const file of imageFiles) {
          if (file.mimetype.startsWith("image/")) {
            const blurPath = await createBlurredImage(file);
            if (blurPath) protectedImages.push(blurPath);
          }
        }

        req.body = {
          ...data,
          images,
          media,
          user: req.user!.id,
          protectedImages,
        };
        next();
      } catch (error) {
        next(error);
      }
    },
    PrivateAlbumController.createPrivateAlbum,
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    PrivateAlbumController.getPrivateAlbumForMe,
  );

export const PrivateAlbumRoutes = router;
