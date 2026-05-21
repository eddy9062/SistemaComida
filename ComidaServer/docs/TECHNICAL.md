# Documentacion tecnica - ComidaServer

## Objetivo

`ComidaServer` es un backend nuevo y separado del backend existente. Usa la logica de referencia de `LibreriaServer`, pero cambia la persistencia de MySQL a PostgreSQL y organiza el codigo por capas.

No se reutilizan archivos del backend anterior. Las rutas principales se conservan para facilitar compatibilidad con clientes existentes.

## Estructura de carpetas

```text
ComidaServer/
  database/
    schema.sql
    seed.sql
  docs/
    TECHNICAL.md
  src/
    config/
      env.js
    controllers/
      auth.controller.js
      dynamic-sql.controller.js
      movimientos.controller.js
      roles.controller.js
      users.controller.js
    database/
      pool.js
    middleware/
      auth.middleware.js
      error.middleware.js
    routes/
      auth.routes.js
      dynamic-sql.routes.js
      index.js
      movimientos.routes.js
      roles.routes.js
      users.routes.js
    services/
      dynamic-sql.service.js
      movimientos.service.js
      roles.service.js
      users.service.js
    utils/
      async-handler.js
      parse-parametros.js
    app.js
    server.js
  .env.example
  .gitignore
  package.json
  README.md
```

## Librerias utilizadas

- `express`: servidor HTTP y definicion de rutas.
- `pg`: conexion a PostgreSQL mediante pool.
- `jsonwebtoken`: creacion y validacion de JWT.
- `bcryptjs`: hash y comparacion de contrasenas.
- `dotenv`: carga de variables de entorno.
- `cors`: configuracion CORS.
- `helmet`: cabeceras basicas de seguridad.
- `morgan`: logs HTTP en desarrollo y produccion.
- `nodemon`: recarga en desarrollo.

## Configuracion del proyecto

El proyecto usa ES Modules con `"type": "module"` en `package.json`.

Scripts:

- `npm run dev`: ejecuta `nodemon src/server.js`.
- `npm start`: ejecuta `node src/server.js`.

Version de Node.js:

- Requiere Node.js `>=20.0.0`.

## Variables de entorno necesarias

Crear `.env` desde `.env.example`:

```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=comidadb
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

JWT_SECRET=cambiar_esta_clave_en_produccion
JWT_EXPIRES_IN=15d
CORS_ORIGIN=*
JSON_LIMIT=50mb
```

## Conexion a PostgreSQL

La conexion esta en `src/database/pool.js`.

Se usa `pg.Pool` con estos valores:

- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`

Tambien se incluye `withTransaction(callback)` para operaciones atomicas, por ejemplo creacion de movimientos con detalle.

## Endpoints disponibles

Base URL: `/api`

Autenticacion:

- `POST /api/login`
- `GET /api/verificaToken`

Usuarios:

- `GET /api/user`
- `GET /api/user/:id`
- `POST /api/user`
- `PATCH /api/user/:id`
- `DELETE /api/user/:id`

Actualizar usuario:

```js
usersRouter.patch('/user/:id', verifyToken, updateUsuario);
```

Endpoint protegido por JWT para actualizar parcialmente un usuario existente.

```http
PATCH /api/user/:id
Authorization: Bearer <token>
Content-Type: application/json
```

Campos permitidos en el body:

- `usuario`
- `nombre`
- `cod_role` o `role`
- `password`
- `status`

Ejemplo:

```json
{
  "usuario": "admin",
  "nombre": "Administrador",
  "cod_role": 1,
  "status": "A"
}
```

Roles:

- `GET /api/roles`
- `GET /api/role/:id`
- `POST /api/role`
- `PATCH /api/role/:id`
- `DELETE /api/role/:id`

Movimientos:

- `GET /api/mov_articulos/:texto`
- `GET /api/movimiento/:id`
- `POST /api/movimiento`
- `POST /api/resumen`
- `DELETE /api/movimiento`
- `POST /api/mov`
- `POST /api/existenciaMin`

SQL configurado:

- `POST /api/getapi`
- `POST /api/getapiMulti`
- `POST /api/getapiMultiSetting`

Salud:

- `GET /health`

## Flujo de autenticacion con JWT

1. El cliente envia `POST /api/login` con `usuario` y `password`.
2. El servidor busca un usuario activo en PostgreSQL.
3. Se compara `password` contra `password_hash` usando `bcryptjs`.
4. Si la credencial es valida, se emite un JWT con:
   - `id_usuario`
   - `usuario`
   - `clave`: hash actual de la contrasena
   - `groups`: arreglo con el rol
5. En rutas protegidas, el cliente envia:

```http
Authorization: Bearer <token>
```

6. El middleware valida la firma del JWT y verifica que el usuario siga activo y que el hash de contrasena no haya cambiado.
7. Si el usuario cambia de contrasena o se desactiva, el token anterior deja de ser valido.

## Diferencias principales respecto al backend anterior

- Base de datos: cambia de MySQL (`mysql2/promise`) a PostgreSQL (`pg`).
- Estructura: se separan rutas, controladores, servicios, middleware, configuracion y base de datos.
- SQL: se reemplazan `?` e `IFNULL` por sintaxis PostgreSQL como `$1` y `COALESCE`.
- Transacciones: la creacion de movimientos usa transaccion explicita con `BEGIN`, `COMMIT` y `ROLLBACK`.
- Seguridad: se agrega `helmet` y se centraliza el manejo de errores.
- Configuracion: no hay claves ni passwords reales en codigo fuente; todo queda en `.env`.
- Documentacion: se agrega `README.md`, `docs/TECHNICAL.md`, `database/schema.sql` y `database/seed.sql`.
- Puerto por defecto: `3001`, para evitar colision con el backend anterior.

## Notas sobre el modulo getapi

El backend anterior obtiene SQL desde una tabla y lo ejecuta dinamicamente. Este comportamiento se conserva por compatibilidad en `dynamic-sql.service.js`.

En PostgreSQL, los SQL almacenados en `tbl_api_sql.sqlapi` y `tbl_api_sql.sqlapicomb` deben usar placeholders `$1`, `$2`, `$3`, etc. No deben usar `?`.

Este modulo debe usarse con cuidado: solo usuarios autorizados deberian poder crear o modificar registros en `tbl_api_sql`.

Las llamadas dinamicas aceptan `idapp` en el body. Si no se envia, el backend usa `2` por defecto.

## Pasos para instalar y ejecutar

1. Entrar al proyecto:

```bash
cd ComidaServer
```

2. Instalar dependencias:

```bash
npm install
```

3. Crear `.env`:

```bash
copy .env.example .env
```

4. Crear base de datos PostgreSQL:

```sql
CREATE DATABASE comida_db;
```

5. Ejecutar scripts SQL:

```bash
psql -U postgres -d comida_db -f database/schema.sql
psql -U postgres -d comida_db -f database/seed.sql
```

6. Crear usuario inicial con API:

```http
POST http://localhost:3001/api/user
Content-Type: application/json

{
  "usuario": "admin",
  "nombre": "Administrador",
  "cod_role": 1,
  "password": "Admin123*"
}
```

7. Iniciar servidor:

```bash
npm run dev
```

8. Probar login:

```http
POST http://localhost:3001/api/login
Content-Type: application/json

{
  "usuario": "admin",
  "password": "Admin123*"
}
```
