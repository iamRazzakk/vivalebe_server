import express from "express";
import { SuccessStoryController } from "./success_story.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import {
  getMultipleFilesPath,
  getUploadFields,
} from "../../middlewares/fileUploaderHandlarWithR2";
import { SuccessStoryValidations } from "./success_story.validation";
import validateRequest from "../../middlewares/validateRequest";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    getUploadFields(),
    async (req, res, next) => {
      try {
        const data = req.body;
        const media = await getMultipleFilesPath(
          req.files as Record<string, Express.Multer.File[]>,
          "media",
        );
        if (!media) {
          res.json({ success: false, message: "Media is required" });
          return;
        }
        req.body = { ...data, media };
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(SuccessStoryValidations.createSuccessStorySchema),
    SuccessStoryController.createSuccessStory,
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryController.getAllSuccessStories,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryController.getSingleSuccessStory,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    getUploadFields(),
    async (req, _res, next) => {
      try {
        const data = req.body;
        const media = await getMultipleFilesPath(
          req.files as Record<string, Express.Multer.File[]>,
          "media",
        );
        req.body = media ? { ...data, media } : data;
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(SuccessStoryValidations.updateSuccessStorySchema),
    SuccessStoryController.updateSuccessStory,
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    SuccessStoryController.deleteSuccessStory,
  );

export const SuccessStoryRoutes = router;
