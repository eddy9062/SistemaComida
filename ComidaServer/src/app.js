import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: env.jsonLimit }));
app.use(express.urlencoded({ limit: env.jsonLimit, extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ComidaServer' });
});

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
