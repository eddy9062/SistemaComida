import bcrypt from 'bcryptjs';
import { query } from '../database/pool.js';

export const findActiveUserByUsername = async (usuario) => {
console.log(usuario)

  const { rows } = await query(
    `SELECT u.cod_empresa,
       u.usuario,
       u.nombre,
       u.cod_role,
       r.role,
       u.password_hash,
       u.status
FROM tbl_sucursal s
JOIN tbl_users u
  ON u.cod_empresa = s.cod_empresa
 LEFT JOIN tbl_roles r 
	        ON r.cod_empresa = u.cod_empresa
		   AND r.cod_role = u.cod_role 
WHERE u.cod_empresa = 1
  AND u.usuario =  $1
  AND s.estado = 'A'
  AND (
      u.acceso_todas_sucursales = 'S'
      OR EXISTS (
          SELECT 1
          FROM tbl_usuario_sucursal us
          WHERE us.cod_empresa = s.cod_empresa
            AND us.cod_sucursal = s.cod_sucursal
            AND us.usuario = u.usuario
            AND us.estado = 'A'
      )
  );`,
    [usuario]
  );

  return rows[0] || null;
};

export const listUsers = async () => {
  const { rows } = await query(
    `SELECT
       u.cod_empresa,
       u.usuario,
       u.nombre,
       u.cod_role,
       r.role,
       u.status,
       u.created_at,
       u.updated_at
     FROM tbl_users u
     LEFT JOIN tbl_roles r ON r.cod_role = u.cod_role
     ORDER BY u.id_usuario`
  );

  return rows;
};

export const getUserById = async (id) => {
  const { rows } = await query(
    `SELECT cod_empresa, usuario, nombre, cod_role, status, created_at, updated_at
     FROM tbl_users a
     WHERE id_usuario = $1`,
    [id]
  );

  return rows[0] || null;
};

export const createUser = async ({ cod_empresa,usuario, nombre,role, cod_role, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const finalRole = cod_role || role;

  console.log(cod_empresa)
  console.log(usuario)
  console.log(nombre)
  console.log(cod_role)
  console.log(password)

  const { rows } = await query(
    `INSERT INTO tbl_users (cod_empresa,usuario, nombre, cod_role, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING cod_empresa, usuario, nombre, cod_role, status, created_at`,
    [cod_empresa,usuario, nombre, finalRole, passwordHash]
  );

  return rows[0];
};

export const updateUser = async (id, { usuario, nombre, role, cod_role, password, status }) => {
  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const finalRole = cod_role || role || null;

  const { rows } = await query(
    `UPDATE tbl_users
     SET usuario = COALESCE($1, usuario),
         nombre = COALESCE($2, nombre),
         cod_role = COALESCE($3, cod_role),
         password_hash = COALESCE($4, password_hash),
         status = COALESCE($5, status),
         updated_at = now()
     WHERE id_usuario = $6
     RETURNING id_usuario, usuario, nombre, cod_role, status, updated_at`,
    [usuario || null, nombre || null, finalRole, passwordHash, status || null, id]
  );

  return rows[0] || null;
};

export const deleteUser = async (id) => {
  const { rowCount } = await query('DELETE FROM tbl_users WHERE id_usuario = $1', [id]);
  return rowCount;
};
