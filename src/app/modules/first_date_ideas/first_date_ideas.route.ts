import express from "express";
import { FirstDateIdeaController } from "./first_date_ideas.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import {
  getMultipleFilesPath,
  getSingleFilePath,
  getUploadFields,
} from "../../middlewares/fileUploaderHandlarWithR2";
import { FirstDateIdeasValidations } from "./first_date_ideas.validation";
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
          res.json({
            success: false,
            message: "Media is required",
          });
          return;
        }
        req.body = { ...data, media, user: req.user!.id };
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(FirstDateIdeasValidations.createFirstDateIdeasSchema),
    FirstDateIdeaController.createFirstDateIdea,
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    FirstDateIdeaController.getAllFirstDateIdeas,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    FirstDateIdeaController.getSingleFirstDateIdea,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    getUploadFields(),
    async (req, _res, next) => {
      try {
        const data = req.body;
        const media = await getSingleFilePath(
          req.files as Record<string, Express.Multer.File[]>,
          "media",
        );
        req.body = { ...data, media, user: req.user!.id };
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(FirstDateIdeasValidations.updateFirstDateIdeasSchema),
    FirstDateIdeaController.updateFirstDateIdea,
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    FirstDateIdeaController.deleteFirstDateIdea,
  );

export const FirstDateIdeasRoutes = router;
