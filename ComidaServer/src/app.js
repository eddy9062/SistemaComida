import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: env.jsonLimit }));
app.use(express.urlencoded({ limit: env.jsonLimit, extended: true }));
// Las imágenes son recursos públicos consumidos por Ionic desde otro origen en desarrollo.
// Helmet permanece activo para el resto de rutas; solo este contenido estático permite uso cross-origin.
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(env.uploadsDir), { fallthrough: false, maxAge: '7d' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ComidaServer' });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
