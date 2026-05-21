import { config } from 'dotenv';

config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3001),
  jsonLimit: process.env.JSON_LIMIT || '50mb',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  jwtSecret: process.env.JWT_SECRET || 'secretkeyjireh',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15d',
  db: {
    host: process.env.DB_HOST || '172.25.147.240',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_DATABASE || 'comida_db',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'Atilas123*',
    ssl: process.env.DB_SSL === 'true'
  }
};
