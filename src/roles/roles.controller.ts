import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RolesService } from './roles.service.js';

// TEMPORARY: public so the first migration can be checked on the live server.
// Restrict to staff with the `users.view` permission once authentication exists.
@ApiTags('roles')
@Controller({ path: 'roles', version: '1' })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async list() {
    const rows = await this.rolesService.listSystemRoles();
    return rows.map(({ key, name, description, scope, isSystem }) => ({
      key,
      name,
      description,
      scope,
      isSystem,
    }));
  }
}
