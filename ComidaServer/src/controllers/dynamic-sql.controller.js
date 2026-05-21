import { asyncHandler } from '../utils/async-handler.js';
import {
  executeConfiguredSql,
  executeConfiguredSqlMulti,
  executeConfiguredSqlMultiSetting
} from '../services/dynamic-sql.service.js';

export const executeSql = asyncHandler(async (req, res) => {
  res.json(await executeConfiguredSql(req.body));
});

export const executeSqlMulti = asyncHandler(async (req, res) => {
  res.json(await executeConfiguredSqlMulti(req.body));
});

export const executeSqlMultiSetting = asyncHandler(async (req, res) => {
  res.json(await executeConfiguredSqlMultiSetting(req.body));
});
