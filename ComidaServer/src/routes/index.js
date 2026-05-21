import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { dynamicSqlRouter } from './dynamicSqlRouter.js';
import { movimientosRouter } from './movimientos.routes.js';
import { rolesRouter } from './roles.routes.js';
import { usersRouter } from './users.routes.js';

export const apiRouter = Router();

apiRouter.use(authRouter);
apiRouter.use(dynamicSqlRouter);
apiRouter.use(usersRouter);
apiRouter.use(rolesRouter);
apiRouter.use(movimientosRouter);
