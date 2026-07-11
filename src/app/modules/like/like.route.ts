import express from 'express';
import { LikeController } from './like.controller';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { LikeValidations } from './like.validation';

const router = express.Router();

router.post('/', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    validateRequest(LikeValidations.createLikeZodSchema),
    LikeController.createLike);

router.get('/:postId', auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN),
    LikeController.getAllLikesByPost);

export const LikeRoutes = router;
