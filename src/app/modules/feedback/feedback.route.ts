import express, { NextFunction, Request, Response } from "express";
import { FeedbackController } from "./feedback.controller";
import validateRequest from "../../middlewares/validateRequest";
import { FeedbackValidations } from "./feedback.validation";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { fileUploadHandler } from "../../../shared/fileUploadHandler";
import { getMultipleFilesPath } from "../../middlewares/fileUploaderHandlar";

const router = express.Router();
router
  .route("/")
  .post(
    fileUploadHandler(),
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const data = req.body;
        const media = getMultipleFilesPath(
          req.files as unknown as Record<string, Express.Multer.File[]>,
          "media",
        );
        data.media = media as string[];
        req.body = data;
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(FeedbackValidations.createFeedbackSchema),
    FeedbackController.createFeedback,
  )
  .get(auth(USER_ROLES.SUPER_ADMIN), FeedbackController.getFeedback);

router
  .route("/:id")
  .patch(auth(USER_ROLES.SUPER_ADMIN), FeedbackController.updateFeedback);
export const FeedbackRoutes = router;
