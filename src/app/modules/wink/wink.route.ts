import express from 'express';
import { WinkController } from './wink.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.USER, USER_ROLES.SUPER_ADMIN), WinkController.createWink)

export const WinkRoutes = router;
