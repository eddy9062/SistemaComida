# ComidaServer

Backend nuevo e independiente basado en la logica de `LibreriaServer`, creado con Node.js, Express, JWT y PostgreSQL.

## Instalacion rapida

```bash
cd ComidaServer
npm install
copy .env.example .env
```

Crear la base de datos en PostgreSQL y ejecutar:

```bash
psql -U postgres -d comida_db -f database/schema.sql
psql -U postgres -d comida_db -f database/seed.sql
```

Ejecutar en desarrollo:

```bash
npm run dev
```

Ejecutar en produccion/local:

```bash
npm start
```

Servidor por defecto: `http://localhost:3001`.

## Documentacion

La documentacion tecnica completa esta en `docs/TECHNICAL.md`.
