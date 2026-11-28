import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DrizzleModule } from '@nestjs/drizzle';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { PoolConfig } from 'pg';

export type Database = NodePgDatabase;

/** DATABASE_URL wins if set; otherwise the DB_* variables are used. */
export function databaseConnection(config: ConfigService): string | PoolConfig {
  const url = config.get<string>('DATABASE_URL');
  if (url) return url;
  return {
    host: config.get<string>('DB_HOST', 'localhost'),
    port: Number(config.get<string>('DB_PORT', '5432')),
    database: config.get<string>('DB_NAME'),
    user: config.get<string>('DB_USER'),
    password: config.get<string>('DB_PASSWORD'),
    ssl:
      config.get<string>('DB_SSL') === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
    max: Number(config.get<string>('DB_POOL_MAX', '10')),
  };
}

@Module({
  imports: [
    DrizzleModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        drizzle,
        connection: databaseConnection(config),
      }),
    }),
  ],
})
export class DatabaseModule {}
