import { Router } from 'express';
import { preview } from './references.controller.js';

const router = Router();

router.post('/preview', preview);

export default router;
