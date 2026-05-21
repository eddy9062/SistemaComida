import { asyncHandler } from '../utils/async-handler.js';
import {
  createMovimiento,
  deleteMovimientoItem,
  getExistenciaMinima,
  getMovimientoById,
  getResumenMovimientos,
  listMovimientos,
  searchArticulos
} from '../services/movimientos.service.js';

export const getArticulos = asyncHandler(async (req, res) => {
  res.json(await searchArticulos(req.params.texto));
});

export const createMov = asyncHandler(async (req, res) => {
  res.status(201).json(await createMovimiento(req.body));
});

export const getMov = asyncHandler(async (req, res) => {
  const movimiento = await getMovimientoById(req.params.id);

  if (!movimiento) {
    return res.status(404).json({ message: 'Movimiento no existe' });
  }

  res.json(movimiento);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const deleted = await deleteMovimientoItem(req.body);

  if (deleted <= 0) {
    return res.status(404).json({ message: 'Item no Existe' });
  }

  res.sendStatus(204);
});

export const getResumen = asyncHandler(async (req, res) => {
  res.json(await getResumenMovimientos(req.body));
});

export const getMovi = asyncHandler(async (req, res) => {
  res.json(await listMovimientos(req.body));
});

export const getExistenciaMin = asyncHandler(async (req, res) => {
  res.json(await getExistenciaMinima());
});
