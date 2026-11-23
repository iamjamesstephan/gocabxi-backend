# GoCabxi Backend

Minimal NestJS (TypeScript) starter for GoCabxi.

- API base path: `/api/v1`
- Health check: `GET /api/v1/health`
- Swagger docs: `/api/docs`

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
