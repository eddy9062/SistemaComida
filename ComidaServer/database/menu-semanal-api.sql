-- Contrato 150: listado semanal con datos visuales de la receta.
-- Revisar el SELECT inicial y ejecutar únicamente en la base objetivo.
-- Alcance deliberadamente limitado: cod_empresa = 1, idapp = 2, codigo = 150.

BEGIN;

SELECT cod_empresa, idapp, codigo, descripcion, sqlapi
  FROM public.tbl_api_sql
 WHERE cod_empresa = 1
   AND idapp = 2
   AND codigo = 150;

UPDATE public.tbl_api_sql
   SET sqlapi = $contract$
SELECT m.id_menu,
       m.fecha,
       m.id_receta,
       r.nombre AS receta,
       r.imagen_url,
       r.tipo_comida,
       r.tiempo_preparacion,
       m.cantidad_personas
  FROM ct_menu_semanal m
  INNER JOIN ct_recetas r ON r.id_receta = m.id_receta
 WHERE m.fecha BETWEEN $1 AND $2
 ORDER BY m.fecha
$contract$
 WHERE cod_empresa = 1
   AND idapp = 2
   AND codigo = 150;

SELECT cod_empresa, idapp, codigo, sqlapi
  FROM public.tbl_api_sql
 WHERE cod_empresa = 1
   AND idapp = 2
   AND codigo = 150;

COMMIT;
