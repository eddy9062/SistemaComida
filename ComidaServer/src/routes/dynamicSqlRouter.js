import { Router } from 'express';
import {
  executeSql,
  executeSqlMulti,
  executeSqlMultiSetting
} from '../controllers/dynamic-sql.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

export const dynamicSqlRouter = Router();

dynamicSqlRouter.post('/getapi', verifyToken, executeSql);
dynamicSqlRouter.post('/getapiMulti', verifyToken, executeSqlMulti);
dynamicSqlRouter.post('/getapiMultiSetting', verifyToken, executeSqlMultiSetting);
