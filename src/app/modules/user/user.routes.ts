import express from "express";
import { USER_ROLES } from "../../../enums/user";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import {
  getSingleFilePath,
  getUploadFields,
} from "../../middlewares/fileUploaderHandlar";

const router = express.Router();

router.get(
  "/profile",
  auth(USER_ROLES.ADMIN, USER_ROLES.USER),
  UserController.getUserProfile,
);

router
  .route("/bulk")
  .post(auth(USER_ROLES.SUPER_ADMIN), UserController.insertBulkUsers);

router
  .route("/")
  .post(
    getUploadFields(),
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser,
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    getUploadFields(),
    async (req, _res, next) => {
      try {
        const data = req.body;
        const profilePath = getSingleFilePath(
          req.files as Record<string, Express.Multer.File[]>,
          "image",
        );
        if (profilePath) {
          data.profile = profilePath;
        }
        req.body = data;
        next();
      } catch (error) {
        next(error);
      }
    },
    validateRequest(UserValidation.updateProfileZodSchema),
    UserController.updateProfile,
  );

router
  .route("/onboarding")
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    validateRequest(UserValidation.onboardingCompleteZodSchema),
    UserController.updateOnboardingComplete,
  );

router
  .route("/matches")
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.USER),
    UserController.userMatchingUsers,
  );

router
  .route("/:id")
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.USER), UserController.getSingleUser);

export const UserRoutes = router;
