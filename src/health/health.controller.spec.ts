import { ServiceUnavailableException } from '@nestjs/common';
import { getDrizzleToken } from '@nestjs/drizzle';
import { Test, TestingModule } from '@nestjs/testing';
import { REDIS } from '../redis/redis.module.js';
import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  let controller: HealthController;
  const db = { execute: vi.fn() };
  const redis = { ping: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: getDrizzleToken(), useValue: db },
        { provide: REDIS, useValue: redis },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('returns status ok with an ISO timestamp', () => {
    const result = controller.check();
    expect(result.status).toBe('ok');
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('is ready when the database and Redis respond', async () => {
    db.execute.mockResolvedValue({ rows: [] });
    redis.ping.mockResolvedValue('PONG');
    await expect(controller.ready()).resolves.toEqual({
      status: 'ok',
      database: 'up',
      redis: 'up',
    });
  });

  it('answers 503 and names the failing dependency', async () => {
    db.execute.mockRejectedValue(new Error('connection refused'));
    redis.ping.mockResolvedValue('PONG');
    const error = await controller.ready().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ServiceUnavailableException);
    expect((error as ServiceUnavailableException).getResponse()).toEqual({
      status: 'error',
      database: 'down',
      redis: 'up',
    });
  });
});
