# GoCabxi Backend

Minimal NestJS (TypeScript) starter for GoCabxi.

- API base path: `/api/v1`
- Health check: `GET /api/v1/health` (process is up)
- Readiness check: `GET /api/v1/health/ready` (PostgreSQL and Redis reachable, otherwise 503)
- Swagger docs: `/api/docs`
- Database: PostgreSQL with Drizzle ORM (`@nestjs/drizzle`); cache/queues: Redis (`ioredis`)

## Install

```bash
npm install
cp .env.example .env
```

## Run in development

```bash
npm run start:dev
```

The app listens on `PORT` from `.env` (default `3000`).

## Database and Redis

Connection settings come from environment variables (see `.env.example`):
`DATABASE_URL` or `PGHOST`/`PGPORT`/`PGDATABASE`/`PGUSER`/`PGPASSWORD` (the names Cloudways creates) plus optional `DB_SSL`, and
`REDIS_HOST`/`REDIS_PORT`/`REDIS_USERNAME`/`REDIS_PASSWORD`/`REDIS_PREFIX`.

Tables are defined in `src/database/schema.ts`. After changing them:

```bash
npm run db:generate -- --name=<what_changed>   # writes SQL to ./drizzle (read it, commit it)
npm run db:migrate                             # applies pending migrations manually
npm run db:studio                              # optional: browse the database
```

On startup the app applies pending migrations and seeds the system roles
(`src/roles/system-roles.ts`), then starts serving. If that fails it exits rather
than run on an out-of-date schema. Set `DB_MIGRATE_ON_START=false` to skip this,
for example when no local database is running.

Current tables: `roles` (10 system roles from the SRS; vendors can later add custom roles).
`GET /api/v1/roles` lists them. It is public only until authentication is added.

## Tests

```bash
npm run test       # unit tests (roles tests run the real migrations on in-process PostgreSQL via PGlite)
npm run test:e2e   # end-to-end tests
```

## Build

```bash
npm run build
npm run start:prod   # runs node dist/main
```

## Docker

```bash
docker build -t gocabxi-backend .
docker run -p 3000:3000 --env-file .env gocabxi-backend
```
