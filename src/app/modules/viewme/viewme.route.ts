import express from 'express';
import { ViewmeController } from './viewme.controller';

const router = express.Router();

router.get('/', ViewmeController); 

export const ViewmeRoutes = router;
