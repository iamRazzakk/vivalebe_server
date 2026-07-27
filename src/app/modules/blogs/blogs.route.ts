import express, { NextFunction, Request, Response } from "express";
import { BlogsController } from "./blogs.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import {
  getSingleFilePath,
  getUploadFields,
} from "../../middlewares/fileUploaderHandlarWithR2";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";

const router = express.Router();

router
  .route("/")
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    requirePremiumMembership,
    getUploadFields(),
    async (req: Request, _res: Response, next: NextFunction) => {
      try {
        const data = req.body;
        const imageUrl = await getSingleFilePath(
          req.files as Record<string, Express.Multer.File[]>,
          "imageUrl",
        );
        if (imageUrl) {
          data.imageUrl = imageUrl;
        }
        req.body = data;
        next();
      } catch (error) {
        next(error);
      }
    },
    BlogsController.createBlog,
  )
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER),
    BlogsController.getAllBlogs,
  );
router.get(
  "/my",
  auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
  BlogsController.myBlogs,
);

export const BlogsRoutes = router;
