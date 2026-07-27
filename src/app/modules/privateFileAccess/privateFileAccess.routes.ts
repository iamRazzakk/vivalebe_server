import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLES } from "../../../enums/user";
import { PrivateFileAccessController } from "./privateFileAccess.controller";
import { PrivateFileAccessValidations } from "./privateFileAccess.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    validateRequest(
      PrivateFileAccessValidations.createPrivateFileAccessZodSchema,
    ),
    PrivateFileAccessController.createPrivateFileAccess,
  )
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    PrivateFileAccessController.getMyPrivateFileAccess,
  );

router
  .route("/:id")
  .get(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    PrivateFileAccessController.getSinglePrivateFileAccess,
  )
  .patch(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    validateRequest(
      PrivateFileAccessValidations.updatePrivateFileAccessZodSchema,
    ),
    PrivateFileAccessController.updatePrivateFileAccess,
  )
  .delete(
    auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    PrivateFileAccessController.deletePrivateFileAccess,
  );

export const PrivateFileAccessRoutes = router;
