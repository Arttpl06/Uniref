import { Router } from 'express';
import { authenticateFirebase } from '../../middlewares/authenticateFirebase.js';
import { sync, me } from './auth.controller.js';

const router = Router();

router.post('/sync', authenticateFirebase, sync);
router.get('/me', authenticateFirebase, me);

export default router;