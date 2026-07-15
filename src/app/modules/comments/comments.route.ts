import express from 'express';
import { CommentsController } from './comments.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { CommentsValidations } from './comments.validation';

const router = express.Router();

router.route('/')
    .post(
        auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
        validateRequest(CommentsValidations.createCommentZodSchema),
        CommentsController.createComments
    );

router.route('/:postId')
    .get(
        auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
        CommentsController.getCommentsByPostId
    );

router.route('/:id')
    .patch(
        auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
        validateRequest(CommentsValidations.updateCommentsZodSchema),
        CommentsController.updateComments
    )
    .delete(
        auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
        CommentsController.deleteComments
    );

export const CommentsRoutes = router;
