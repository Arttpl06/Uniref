import { Router } from 'express';

import { authenticateFirebase } from '../../middlewares/authenticateFirebase.js';

import {preview,carregarUsuario,create,list,getById,update,remove} from './references.controller.js';

const router = Router();

router.post('/preview', preview);

router.post('/', authenticateFirebase, carregarUsuario, create);

router.get('/', authenticateFirebase, carregarUsuario, list);

router.get('/:id', authenticateFirebase, carregarUsuario, getById);

router.put('/:id', authenticateFirebase, carregarUsuario, update);

router.delete('/:id', authenticateFirebase, carregarUsuario, remove);

export default router;