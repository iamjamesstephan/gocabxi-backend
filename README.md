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
`DATABASE_URL` or `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_SSL`, and
`REDIS_HOST`/`REDIS_PORT`/`REDIS_USERNAME`/`REDIS_PASSWORD`/`REDIS_PREFIX`.

Tables are defined in `src/database/schema.ts`. After changing them:

```bash
npm run db:generate   # writes SQL migrations to ./drizzle (commit them)
npm run db:migrate    # applies pending migrations to the database
npm run db:studio     # optional: browse the database
```

## Tests

```bash
npm run test       # unit tests
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
