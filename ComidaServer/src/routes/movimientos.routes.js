import { Router } from 'express';
import {
  createMov,
  deleteItem,
  getArticulos,
  getExistenciaMin,
  getMov,
  getMovi,
  getResumen
} from '../controllers/movimientos.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

export const movimientosRouter = Router();

movimientosRouter.get('/mov_articulos/:texto', verifyToken, getArticulos);
movimientosRouter.get('/movimiento/:id', verifyToken, getMov);
movimientosRouter.post('/movimiento', verifyToken, createMov);
movimientosRouter.post('/resumen', verifyToken, getResumen);
movimientosRouter.delete('/movimiento', verifyToken, deleteItem);
movimientosRouter.post('/mov', verifyToken, getMovi);
movimientosRouter.post('/existenciaMin', verifyToken, getExistenciaMin);
