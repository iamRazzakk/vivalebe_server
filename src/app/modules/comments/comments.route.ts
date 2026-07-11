import express from 'express';
import { CommentsController } from './comments.controller';

const router = express.Router();

router.get('/', CommentsController); 

export const CommentsRoutes = router;
