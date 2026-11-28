import { Test } from '@nestjs/testing';
import { RolesController } from './roles.controller.js';
import { RolesService } from './roles.service.js';

describe('RolesController', () => {
  it('returns public role fields only', async () => {
    const listSystemRoles = vi.fn().mockResolvedValue([
      {
        id: 'b1c0f6a8-0000-4000-8000-000000000000',
        key: 'super_admin',
        name: 'Super Admin',
        description: 'Full control',
        scope: 'platform',
        vendorId: null,
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    const module = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: { listSystemRoles } }],
    }).compile();

    const result = await module.get(RolesController).list();

    expect(result).toEqual([
      {
        key: 'super_admin',
        name: 'Super Admin',
        description: 'Full control',
        scope: 'platform',
        isSystem: true,
      },
    ]);
  });
});
