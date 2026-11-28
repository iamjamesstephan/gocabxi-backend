import { sql } from 'drizzle-orm';
import type { PgAsyncDatabase } from 'drizzle-orm/pg-core';
import { roles, type NewRole } from '../database/schema.js';

/** Built-in roles from SRS §5 and the Super Admin / Vendor UI documents. */
export const SYSTEM_ROLES = [
  {
    key: 'super_admin',
    name: 'Super Admin',
    scope: 'platform',
    description:
      'Full platform control: all modules, permissions, security, configuration and audit.',
  },
  {
    key: 'admin',
    name: 'Admin',
    scope: 'platform',
    description: 'Platform configuration and most operational controls.',
  },
  {
    key: 'operations_executive',
    name: 'Operations Executive',
    scope: 'platform',
    description:
      'Monitors bookings, dispatch and trips; can intervene and reassign.',
  },
  {
    key: 'customer_support',
    name: 'Customer Support',
    scope: 'platform',
    description:
      'Resolves customer and booking issues through support tickets.',
  },
  {
    key: 'finance',
    name: 'Finance',
    scope: 'platform',
    description: 'Payments, refunds, invoices and vendor settlements.',
  },
  {
    key: 'marketing',
    name: 'Marketing',
    scope: 'platform',
    description: 'Coupons, campaigns, offers and CMS content.',
  },
  {
    key: 'vendor_admin',
    name: 'Vendor Admin',
    scope: 'vendor',
    description:
      "Manages the vendor's profile, drivers, vehicles, bookings, documents and staff.",
  },
  {
    key: 'vendor_dispatcher',
    name: 'Vendor Dispatcher',
    scope: 'vendor',
    description:
      'Accepts or rejects booking offers and assigns drivers from the vendor pool.',
  },
  {
    key: 'driver',
    name: 'Driver',
    scope: 'driver',
    description: 'Executes assigned trips and updates trip status.',
  },
  {
    key: 'customer',
    name: 'Customer',
    scope: 'customer',
    description: 'Searches, books, pays for, tracks and reviews own trips.',
  },
] as const satisfies readonly Omit<NewRole, 'id' | 'isSystem' | 'vendorId'>[];

export type SystemRoleKey = (typeof SYSTEM_ROLES)[number]['key'];

/**
 * Inserts the system roles, or brings their name/description/scope up to date.
 * Safe to run on every start: it never duplicates rows or touches custom roles.
 */
export async function seedSystemRoles(
  db: PgAsyncDatabase<any, any>,
): Promise<void> {
  await db
    .insert(roles)
    .values(SYSTEM_ROLES.map((r) => ({ ...r, isSystem: true })))
    .onConflictDoUpdate({
      target: roles.key,
      targetWhere: sql`${roles.vendorId} is null`,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        scope: sql`excluded.scope`,
        isSystem: true,
        updatedAt: sql`now()`,
      },
    });
}
