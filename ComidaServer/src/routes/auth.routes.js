import { Router } from 'express';
import { login, tokenValido } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/verificaToken', verifyToken, tokenValido);
