import { Router } from 'express';
import {
  createUsuario,
  deleteUsuario,
  getUsuario,
  getUsuarios,
  updateUsuario
} from '../controllers/users.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

export const usersRouter = Router();

usersRouter.get('/user', verifyToken, getUsuarios);
usersRouter.get('/user/:id', verifyToken, getUsuario);
usersRouter.post('/user', createUsuario);
usersRouter.patch('/user/:id', verifyToken, updateUsuario);
usersRouter.delete('/user/:id', verifyToken, deleteUsuario);
