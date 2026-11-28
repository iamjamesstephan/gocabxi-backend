// Drizzle table definitions. After changing them, run `npm run db:generate`,
// read the generated SQL in ./drizzle and commit it.
import { sql } from 'drizzle-orm';
import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/** Which kind of account a role belongs to (SRS §5). */
export const roleScope = pgEnum('role_scope', [
  'platform',
  'vendor',
  'driver',
  'customer',
]);

export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Stable machine name, e.g. `super_admin`. Code refers to roles by key. */
    key: varchar('key', { length: 64 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: text('description'),
    scope: roleScope('scope').notNull(),
    /** Set only for a vendor's custom roles; the FK is added with the vendors table. */
    vendorId: uuid('vendor_id'),
    /** Built-in roles are seeded by the app and cannot be deleted. */
    isSystem: boolean('is_system').notNull().default(false),
    ...timestamps,
  },
  (t) => [
    // System roles: key is unique platform-wide.
    uniqueIndex('roles_key_system_unique')
      .on(t.key)
      .where(sql`${t.vendorId} is null`),
    // Custom vendor roles: key is unique within one vendor.
    uniqueIndex('roles_vendor_key_unique')
      .on(t.vendorId, t.key)
      .where(sql`${t.vendorId} is not null`),
  ],
);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
