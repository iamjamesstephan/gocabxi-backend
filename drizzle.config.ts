import { existsSync } from 'node:fs';
import { defineConfig } from 'drizzle-kit';

if (existsSync('.env')) process.loadEnvFile('.env');

const env = process.env;

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : {
        host: env.PGHOST ?? 'localhost',
        port: Number(env.PGPORT ?? 5432),
        database: env.PGDATABASE ?? '',
        user: env.PGUSER,
        password: env.PGPASSWORD,
        ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
});
