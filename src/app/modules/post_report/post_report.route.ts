import express, { NextFunction, Request, Response } from "express";
import { PostReportController } from "./post_report.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import validateRequest from "../../middlewares/validateRequest";
import { PostReportValidations } from "./post_report.validation";
import {
  getUploadFields,
  getMultipleFilesPath,
} from "../../middlewares/fileUploaderHandlarWithR2";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    getUploadFields(),
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const data = req.body;
        const image = await getMultipleFilesPath(
          req.files as Record<string, Express.Multer.File[]>,
          "image",
        );
        if (image) data.image = image;
        req.body = data;
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(PostReportValidations.postReportValidation),
    PostReportController.createReportedPost,
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    PostReportController.getAllReportedPost,
  );

router
  .route("/:id")
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    PostReportController.updateReportedPostStatus,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    PostReportController.deleteReportedPost,
  );
export const PostReportRoutes = router;
