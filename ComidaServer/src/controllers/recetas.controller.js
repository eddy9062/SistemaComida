import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { asyncHandler } from '../utils/async-handler.js';
import { query } from '../database/pool.js';
import { env } from '../config/env.js';

const recipesDir = path.resolve(env.uploadsDir, 'recetas');
const allowedFormats = new Set(['jpeg', 'png', 'webp']);
const recipeId = (value) => Number.parseInt(value, 10);
const safeImagePath = (url) => {
  if (!url) return null;
  const pathname = new URL(url, 'http://local').pathname;
  const prefix = '/uploads/recetas/';
  if (!pathname.startsWith(prefix)) return null;
  const filename = path.basename(pathname);
  return filename.endsWith('.webp') ? path.join(recipesDir, filename) : null;
};
const recipeImageUrl = (filename) => `/uploads/recetas/${filename}`;

export const uploadRecetaImage = asyncHandler(async (req, res) => {
  const id = recipeId(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0 || !req.file) {
    return res.status(400).json({ message: 'Debe indicar una receta y una imagen válida.' });
  }

  let metadata;
  try {
    metadata = await sharp(req.file.buffer, { failOn: 'error' }).metadata();
  } catch {
    return res.status(400).json({ message: 'El archivo no contiene una imagen válida.' });
  }
  if (!allowedFormats.has(metadata.format)) {
    return res.status(400).json({ message: 'Solo se permiten imágenes JPEG, PNG o WebP válidas.' });
  }
  const found = await query('SELECT imagen_url FROM ct_recetas WHERE id_receta = $1', [id]);
  if (!found.rowCount) return res.status(404).json({ message: 'Receta no existe.' });

  await fs.mkdir(recipesDir, { recursive: true });
  const filename = `${crypto.randomUUID()}.webp`;
  const finalPath = path.join(recipesDir, filename);
  await sharp(req.file.buffer, { failOn: 'error' }).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(finalPath);

  const imagen_url = recipeImageUrl(filename);
  try {
    await query('UPDATE ct_recetas SET imagen_url = $1 WHERE id_receta = $2', [imagen_url, id]);
  } catch (error) {
    await fs.unlink(finalPath).catch(() => undefined);
    throw error;
  }
  await fs.unlink(safeImagePath(found.rows[0].imagen_url)).catch(() => undefined);
  res.status(201).json({ imagen_url });
});

export const deleteRecetaImage = asyncHandler(async (req, res) => {
  const id = recipeId(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ message: 'Receta inválida.' });
  const result = await query('UPDATE ct_recetas SET imagen_url = NULL WHERE id_receta = $1 RETURNING imagen_url', [id]);
  if (!result.rowCount) return res.status(404).json({ message: 'Receta no existe.' });
  await fs.unlink(safeImagePath(result.rows[0].imagen_url)).catch(() => undefined);
  res.sendStatus(204);
});
