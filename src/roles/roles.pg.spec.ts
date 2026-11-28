// Runs the real migrations and seed against an in-process PostgreSQL (PGlite).
import { PGlite } from '@electric-sql/pglite';
import { count, eq } from 'drizzle-orm';
import { drizzle, type PgliteDatabase } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import type { Database } from '../database/database.module.js';
import { MIGRATIONS_FOLDER } from '../database/migrate.js';
import { roles } from '../database/schema.js';
import { RolesService } from './roles.service.js';
import { SYSTEM_ROLES, seedSystemRoles } from './system-roles.js';

function pgErrorCode(error: unknown): string | undefined {
  for (let e: any = error; e; e = e.cause) {
    if (typeof e.code === 'string' && /^\d{5}$/.test(e.code)) return e.code;
  }
  return undefined;
}

describe('roles table (PostgreSQL)', () => {
  let client: PGlite;
  let db: PgliteDatabase;

  beforeAll(async () => {
    client = new PGlite();
    db = drizzle({ client });
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  });

  afterAll(async () => {
    await client.close();
  });

  it('seeds the 10 system roles, and re-seeding adds no duplicates', async () => {
    await seedSystemRoles(db);
    await seedSystemRoles(db);
    const [{ total }] = await db.select({ total: count() }).from(roles);
    expect(total).toBe(SYSTEM_ROLES.length);
    expect(SYSTEM_ROLES).toHaveLength(10);
  });

  it('re-seeding restores a changed system role name', async () => {
    await db
      .update(roles)
      .set({ name: 'Renamed' })
      .where(eq(roles.key, 'finance'));
    await seedSystemRoles(db);
    const [finance] = await db
      .select()
      .from(roles)
      .where(eq(roles.key, 'finance'));
    expect(finance.name).toBe('Finance');
    expect(finance.isSystem).toBe(true);
  });

  it('rejects a second system role with the same key', async () => {
    const error = await db
      .insert(roles)
      .values({ key: 'admin', name: 'Dup', scope: 'platform' })
      .catch((e: unknown) => e);
    expect(pgErrorCode(error)).toBe('23505');
  });

  it('allows the same key for a vendor custom role, once per vendor', async () => {
    const vendorId = '018f0000-0000-7000-8000-000000000001';
    await db
      .insert(roles)
      .values({
        key: 'admin',
        name: 'Vendor admin',
        scope: 'vendor',
        vendorId,
      });
    const error = await db
      .insert(roles)
      .values({ key: 'admin', name: 'Again', scope: 'vendor', vendorId })
      .catch((e: unknown) => e);
    expect(pgErrorCode(error)).toBe('23505');
  });

  it('RolesService lists only system roles, platform roles first', async () => {
    const service = new RolesService(db as unknown as Database);
    const list = await service.listSystemRoles();
    expect(list).toHaveLength(10);
    expect(list.every((r) => r.vendorId === null)).toBe(true);
    expect(list[0].scope).toBe('platform');
    expect(list.at(-1)?.scope).toBe('customer');
  });
});
