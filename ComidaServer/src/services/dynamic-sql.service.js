import { query, withTransaction } from '../database/pool.js';
import { parseParametros } from '../utils/parse-parametros.js';

const getIdApp = (idapp) => Number(idapp || 2);

export const executeConfiguredSql = async ({ idapp, codigoSQL, parametro }) => {
  const { rows } = await query(
    'SELECT sqlapi FROM public.tbl_api_sql WHERE idapp = $1 AND codigo = $2',
    [getIdApp(idapp), String(codigoSQL)]
  );

  console.log(getIdApp(idapp))
console.log(rows)

  if (rows.length === 0) {
    const error = new Error('No se encontro SQL para el codigo proporcionado.');
    error.statusCode = 404;
    throw error;
  }

  const params = parseParametros(parametro);
  const result = await query(rows[0].sqlapi, params);
  return result.rows;
};

export const executeConfiguredSqlMulti = async ({ idapp, codigoSQL, encabezado }) => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT sqlapi, sqlapicomb FROM public.tbl_api_sql WHERE idapp = $1 AND codigo = $2',
      [getIdApp(idapp), String(codigoSQL)]
    );

    if (rows.length === 0) {
      const error = new Error('No se encontro SQL para el codigo proporcionado.');
      error.statusCode = 404;
      throw error;
    }

    let lastCode = null;

    for (const item of encabezado || []) {
      const headerParams = parseParametros(item.parametro);
      const headerResult = await client.query(rows[0].sqlapi, headerParams);
      lastCode = headerResult.rows[0]?.p_id || headerResult.rows[0]?.id_operacion || null;

      for (const detalle of item.detalle || []) {
        const detailParams = parseParametros(detalle.parametro);

        if (detailParams[0] === null || detailParams[0] === 0) {
          detailParams[0] = Number(lastCode);
        }

        await client.query(rows[0].sqlapicomb, detailParams);
      }
    }

    return { message: 'Ok', codigo: lastCode };
  });
};

export const executeConfiguredSqlMultiSetting = async ({ idapp, codigoSQL, encabezado }) => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      'SELECT sqlapi, sqlapicomb FROM public.tbl_api_sql WHERE idapp = $1 AND codigo = $2',
      [getIdApp(idapp), String(codigoSQL)]
    );

    if (rows.length === 0) {
      const error = new Error('No se encontro SQL para el codigo proporcionado.');
      error.statusCode = 404;
      throw error;
    }

    const headerResult = await client.query(rows[0].sqlapi, [
      encabezado.id_operacion,
      encabezado.fecha,
      encabezado.tipo_operacion,
      String(encabezado.nit),
      encabezado.id_usuario
    ]);

    const codigo = headerResult.rows[0]?.p_id || headerResult.rows[0]?.id_operacion;

    for (const detalle of encabezado.det || []) {
      await client.query(rows[0].sqlapicomb, [
        codigo,
        detalle.tipo_operacion || encabezado.tipo_operacion,
        detalle.cod_articulo,
        detalle.cod_det_articulo,
        detalle.cod_bodega,
        detalle.cantidad,
        detalle.precio_final
      ]);
    }

    return { message: 'Ok', codigo };
  });
};
