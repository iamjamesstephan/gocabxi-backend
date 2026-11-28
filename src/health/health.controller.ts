import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { ApiTags } from '@nestjs/swagger';
import { sql } from 'drizzle-orm';
import type { Redis } from 'ioredis';
import type { Database } from '../database/database.module.js';
import { REDIS } from '../redis/redis.module.js';

type Status = 'up' | 'down';

function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms).unref(),
    ),
  ]);
}

@ApiTags('health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  constructor(
    @InjectDrizzle() private readonly db: Database,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  /** Liveness: the process is up. Never touches the database. */
  @Get()
  check(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness: PostgreSQL and Redis are reachable; 503 if either is not. */
  @Get('ready')
  async ready(): Promise<{ status: string; database: Status; redis: Status }> {
    const [database, redis] = await Promise.all([
      this.probe(() => this.db.execute(sql`select 1`)),
      this.probe(() => this.redis.ping()),
    ]);
    const ok = database === 'up' && redis === 'up';
    const body = { status: ok ? 'ok' : 'error', database, redis };
    if (!ok) throw new ServiceUnavailableException(body);
    return body;
  }

  private async probe(fn: () => Promise<unknown>): Promise<Status> {
    try {
      await withTimeout(fn());
      return 'up';
    } catch {
      return 'down';
    }
  }
}
