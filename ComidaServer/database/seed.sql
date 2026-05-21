INSERT INTO tbl_roles (cod_role, cod_empresa, role)
VALUES (1, 1, 'Administrador')
ON CONFLICT (cod_role) DO NOTHING;

-- Crear usuarios desde la API para generar password_hash con bcrypt.
-- Endpoint: POST /api/user
-- Body:
-- {
--   "usuario": "admin",
--   "nombre": "Eddy Cifuentes",
--   "cod_role": 1,
--   "password": "Admin123*"
-- }
