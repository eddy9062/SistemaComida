import { Router } from 'express';
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole
} from '../controllers/roles.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

export const rolesRouter = Router();

rolesRouter.get('/roles', verifyToken, getRoles);
rolesRouter.get('/role/:id', verifyToken, getRole);
rolesRouter.post('/role', createRole);
rolesRouter.patch('/role/:id', verifyToken, updateRole);
rolesRouter.delete('/role/:id', verifyToken, deleteRole);
