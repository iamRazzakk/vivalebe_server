import express, { NextFunction, Request, Response } from 'express';
import { PostsController } from './posts.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PostsValidations } from './posts.validation';
import { getMultipleFilesPath, getUploadFields } from '../../middlewares/fileUploaderHandlar';

const router = express.Router();
router.route("/")
    .post(auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
        getUploadFields(),
        async (req: Request, _res: Response, next: NextFunction) => {
            try {
                const data = req.body;
                const user = req.user;
                const content = getMultipleFilesPath(
                    req.files as Record<string, Express.Multer.File[]>,
                    "content",
                );
                if (content) {
                    data.content = content;
                }
                req.body = { ...data, user: user.id };
                next();
            } catch (error) {
                next(error);
            }
        },
        validateRequest(PostsValidations.createPostValidation as any),
        PostsController.createPost)
    .get(auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), PostsController.getAllPosts);





export const PostsRoutes = router;
