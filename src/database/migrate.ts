import { join } from 'node:path';
import { Logger } from '@nestjs/common';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { seedSystemRoles } from '../roles/system-roles.js';

/** ./drizzle at the project root, from both src/database and dist/database. */
export const MIGRATIONS_FOLDER = join(
  import.meta.dirname,
  '..',
  '..',
  'drizzle',
);

/**
 * Applies pending migrations, then seeds reference data.
 * Runs at startup because the Cloudways database only accepts local
 * connections. Safe with one app instance; with several, run it as a release
 * step instead.
 */
export async function migrateAndSeed(db: NodePgDatabase): Promise<void> {
  const logger = new Logger('Database');
  logger.log('Applying migrations...');
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  await seedSystemRoles(db);
  logger.log('Migrations applied and system roles seeded');
}
