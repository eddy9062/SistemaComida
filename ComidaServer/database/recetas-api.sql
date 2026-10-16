-- API Executor local: empresa 1 (la misma empresa que valida la autenticación actual).
-- Ejecute este archivo solo en comida_db después de verificar tbl_api_sql.
-- No modifica contratos de otras empresas ni clasifica recetas históricas.
BEGIN;

UPDATE public.tbl_api_sql SET sqlapi =
'SELECT id_receta, nombre, descripcion, porciones, imagen_url, instrucciones,
        tiempo_preparacion, tipo_comida, calorias_estimadas
   FROM ct_recetas
  ORDER BY nombre'
WHERE cod_empresa = 1 AND idapp = 2 AND codigo = '130';

UPDATE public.tbl_api_sql SET sqlapi =
'INSERT INTO ct_recetas (nombre, descripcion, tipo_comida, porciones, tiempo_preparacion, calorias_estimadas, instrucciones, imagen_url)
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
 RETURNING id_receta'
WHERE cod_empresa = 1 AND idapp = 2 AND codigo = '131';

UPDATE public.tbl_api_sql SET sqlapi =
'UPDATE ct_recetas
    SET nombre = $2, descripcion = $3, tipo_comida = $4, porciones = $5,
        tiempo_preparacion = $6, calorias_estimadas = $7, instrucciones = $8, imagen_url = $9
  WHERE id_receta = $1
 RETURNING id_receta'
WHERE cod_empresa = 1 AND idapp = 2 AND codigo = '132';

-- Inserta solo contratos ausentes de la empresa e idapp locales.
INSERT INTO public.tbl_api_sql (cod_empresa, idapp, codigo, descripcion, sqlapi)
SELECT 1, 2, v.codigo, v.descripcion, v.sqlapi
FROM (VALUES
  (130, 'Listar recetas', 'SELECT id_receta, nombre, descripcion, porciones, imagen_url, instrucciones, tiempo_preparacion, tipo_comida, calorias_estimadas FROM ct_recetas ORDER BY nombre'),
  (131, 'Crear receta', 'INSERT INTO ct_recetas (nombre, descripcion, tipo_comida, porciones, tiempo_preparacion, calorias_estimadas, instrucciones, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_receta'),
  (132, 'Actualizar receta', 'UPDATE ct_recetas SET nombre = $2, descripcion = $3, tipo_comida = $4, porciones = $5, tiempo_preparacion = $6, calorias_estimadas = $7, instrucciones = $8, imagen_url = $9 WHERE id_receta = $1 RETURNING id_receta')
) AS v(codigo, descripcion, sqlapi)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tbl_api_sql a
  WHERE a.cod_empresa = 1 AND a.idapp = 2 AND a.codigo = v.codigo
);

COMMIT;
