CREATE TABLE IF NOT EXISTS tbl_roles (
  cod_role integer PRIMARY KEY,
  cod_empresa integer NOT NULL DEFAULT 1,
  role varchar(100) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tbl_users (
  id_usuario bigserial PRIMARY KEY,
  cod_empresa integer  PRIMARY KEY,
  usuario varchar(80) NOT NULL UNIQUE,
  nombre varchar(150) NOT NULL,
  cod_role integer REFERENCES roles(cod_role),
  password_hash varchar(255) NOT NULL,
  status char(1) NOT NULL DEFAULT 'A',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tbl_api_sql (
  cod_emrpesa integer PRIMARY KEY,
  codigo varchar(80) PRIMARY KEY,
  idapp integer NOT NULL DEFAULT 1,
  descripcion varchar(200),
  sqlapi text NOT NULL,
  sqlapicomb text
);

CREATE INDEX IF NOT EXISTS idx_users_usuario_status ON tbl_users(usuario, status);

