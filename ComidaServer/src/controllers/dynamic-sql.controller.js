import { asyncHandler } from '../utils/async-handler.js';
import {
  executeConfiguredSql,
  executeConfiguredSqlMulti,
  executeConfiguredSqlMultiSetting
} from '../services/dynamic-sql.service.js';

export const executeSql = asyncHandler(async (req, res) => {
  res.json(await executeConfiguredSql({ ...req.body, codEmpresa: req.user.cod_empresa }));
});

export const executeSqlMulti = asyncHandler(async (req, res) => {
  res.json(await executeConfiguredSqlMulti({ ...req.body, codEmpresa: req.user.cod_empresa }));
});

export const executeSqlMultiSetting = asyncHandler(async (req, res) => {
  res.json(await executeConfiguredSqlMultiSetting({ ...req.body, codEmpresa: req.user.cod_empresa }));
});
