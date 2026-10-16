import { Router } from 'express';
import multer from 'multer';
import { deleteRecetaImage, uploadRecetaImage } from '../controllers/recetas.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';

export const recetasRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageSizeBytes, files: 1 },
  fileFilter: (req, file, callback) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) return callback(null, true);
    const error = new Error('Solo se permiten imágenes JPEG, PNG o WebP.');
    error.statusCode = 400;
    return callback(error);
  }
});

recetasRouter.post('/recetas/:id/imagen', verifyToken, upload.single('imagen'), uploadRecetaImage);
recetasRouter.delete('/recetas/:id/imagen', verifyToken, deleteRecetaImage);
