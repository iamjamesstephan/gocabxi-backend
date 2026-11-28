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
        host: env.DB_HOST ?? 'localhost',
        port: Number(env.DB_PORT ?? 5432),
        database: env.DB_NAME ?? '',
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        ssl: env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      },
});
