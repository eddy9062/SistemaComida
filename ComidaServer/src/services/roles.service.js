import { query } from '../database/pool.js';

export const listRoles = async () => {
  const { rows } = await query(
    `SELECT cod_empresa, cod_role, role, created_at, updated_at
     FROM roles
     ORDER BY cod_role`
  );

  return rows;
};

export const getRoleById = async (codRole) => {
  const { rows } = await query(
    `SELECT cod_empresa, cod_role, role, created_at, updated_at
     FROM roles
     WHERE cod_role = $1`,
    [codRole]
  );

  return rows[0] || null;
};

export const createRoleRecord = async ({ cod_empresa, cod_role, role }) => {
  const { rows } = await query(
    `INSERT INTO roles (cod_empresa, cod_role, role)
     VALUES ($1, $2, $3)
     RETURNING cod_empresa, cod_role, role, created_at`,
    [cod_empresa || 1, cod_role, role]
  );

  return rows[0];
};

export const updateRoleRecord = async (codRole, { cod_empresa, role }) => {
  const { rows } = await query(
    `UPDATE roles
     SET cod_empresa = COALESCE($1, cod_empresa),
         role = COALESCE($2, role),
         updated_at = now()
     WHERE cod_role = $3
     RETURNING cod_empresa, cod_role, role, updated_at`,
    [cod_empresa || null, role || null, codRole]
  );

  return rows[0] || null;
};

export const deleteRoleRecord = async (codRole) => {
  const { rowCount } = await query('DELETE FROM roles WHERE cod_role = $1', [codRole]);
  return rowCount;
};
