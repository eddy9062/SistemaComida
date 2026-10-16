-- Contrato 150: listado semanal con datos visuales de la receta.
-- Limitado al API Executor local de empresa 1/idapp 2.
UPDATE public.tbl_api_sql
SET sqlapi =
'SELECT m.id_menu,
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
  ORDER BY m.fecha'
WHERE cod_empresa = 1 AND idapp = 2 AND codigo = 150;
