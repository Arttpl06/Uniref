import { Router } from 'express';
import { preview } from './citations.controller.js';

const router = Router();

router.post('/preview', preview);

export default router;
