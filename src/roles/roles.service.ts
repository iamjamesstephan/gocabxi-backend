import { Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { asc, isNull } from 'drizzle-orm';
import type { Database } from '../database/database.module.js';
import { roles, type Role } from '../database/schema.js';

@Injectable()
export class RolesService {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  /** System roles (not vendor custom roles), grouped by scope. */
  listSystemRoles(): Promise<Role[]> {
    return this.db
      .select()
      .from(roles)
      .where(isNull(roles.vendorId))
      .orderBy(asc(roles.scope), asc(roles.createdAt), asc(roles.key));
  }
}
