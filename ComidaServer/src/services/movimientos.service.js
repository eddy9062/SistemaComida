import { query, withTransaction } from '../database/pool.js';

export const searchArticulos = async (texto) => {
  const { rows } = await query(
    `SELECT cod_articulo,
            cod_det_articulo,
            descripcion,
            precio_venta,
            unidades,
            cant_mayoreo,
            precio_mayoreo
     FROM detalle_articulos
     WHERE concat(cod_articulo, descripcion) ILIKE $1
     ORDER BY descripcion
     LIMIT 50`,
    [`%${texto}%`]
  );

  return rows;
};

export const createMovimiento = async (data) => {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO movimientos (fecha, tipo_operacion, nit, id_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_operacion`,
      [data.fecha, data.tipo_operacion, String(data.nit), data.id_usuario]
    );

    const idOperacion = rows[0].id_operacion;

    for (const item of data.det || []) {
      await client.query(
        `INSERT INTO detalle_movimientos
           (id_operacion, tipo_operacion, cod_articulo, cod_det_articulo, cod_bodega, cantidad, precio)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          idOperacion,
          data.tipo_operacion,
          item.cod_articulo,
          item.cod_det_articulo,
          item.cod_bodega,
          item.cantidad,
          item.precio_final
        ]
      );
    }

    return { message: 'Ok', id_operacion: idOperacion };
  });
};

export const getMovimientoById = async (idOperacion) => {
  const { rows } = await query(
    `SELECT DISTINCT
       m.id_operacion,
       m.fecha,
       m.tipo_operacion,
       dm.cod_bodega,
       m.nit,
       COALESCE(c.nombre, p.nombre) AS descripcion
     FROM movimientos m
     INNER JOIN detalle_movimientos dm ON dm.id_operacion = m.id_operacion
     LEFT JOIN clientes c ON c.cod_cliente = m.nit AND m.tipo_operacion = 2
     LEFT JOIN proveedores p ON p.cod_proveedor = m.nit AND m.tipo_operacion = 1
     WHERE m.id_operacion = $1`,
    [idOperacion]
  );

  if (rows.length === 0) return null;

  const { rows: det } = await query(
    `SELECT
       dm.cod_articulo,
       dm.cod_det_articulo,
       da.descripcion,
       dm.cod_bodega,
       dm.cantidad,
       dm.precio AS precio_final
     FROM detalle_movimientos dm
     INNER JOIN detalle_articulos da
       ON da.cod_articulo = dm.cod_articulo
      AND da.cod_det_articulo = dm.cod_det_articulo
     WHERE dm.id_operacion = $1
     ORDER BY dm.id_det_movimiento`,
    [idOperacion]
  );

  return { ...rows[0], det };
};

export const deleteMovimientoItem = async ({ id_operacion, cod_articulo, cod_det_articulo }) => {
  const { rowCount } = await query(
    `DELETE FROM detalle_movimientos
     WHERE id_operacion = $1 AND cod_articulo = $2 AND cod_det_articulo = $3`,
    [id_operacion, cod_articulo, cod_det_articulo]
  );

  return rowCount;
};

export const getResumenMovimientos = async ({ tipo_operacion, fecha_ini, fecha_fin, id_usuario }) => {
  const { rows } = await query(
    `SELECT cod_bodega,
            bodega,
            sum(total) AS total,
            sum(total_compra) AS total_compra
     FROM v_movimientos
     WHERE tipo_operacion = $1
       AND fecha BETWEEN $2 AND $3
       AND ($4::int = 0 OR id_usuario = $4)
     GROUP BY cod_bodega, bodega
     ORDER BY bodega`,
    [tipo_operacion, fecha_ini, fecha_fin, id_usuario || 0]
  );

  return rows;
};

export const listMovimientos = async ({ tipo_operacion, fecha_ini, fecha_fin }) => {
  const { rows } = await query(
    `SELECT fecha,
            id_operacion,
            bodega,
            cod_articulo,
            descripcion,
            cantidad,
            precio,
            total
     FROM v_movimientos
     WHERE tipo_operacion = $1 AND fecha BETWEEN $2 AND $3
     ORDER BY fecha, id_operacion`,
    [tipo_operacion, fecha_ini, fecha_fin]
  );

  return rows;
};

export const getExistenciaMinima = async () => {
  const { rows } = await query(
    `SELECT a.cat_articulo,
            ca.descripcion AS categoria,
            a.cod_articulo,
            a.descripcion,
            ae.existencia,
            a.cant_minima
     FROM articulos a
     INNER JOIN categorias_articulo ca ON ca.cat_articulo = a.cat_articulo
     INNER JOIN articulo_existencia ae ON ae.cod_articulo = a.cod_articulo
     WHERE COALESCE(ae.existencia, 0) <= COALESCE(a.cant_minima, 0)
       AND a.cant_minima IS NOT NULL
     ORDER BY a.descripcion`
  );

  return rows;
};
