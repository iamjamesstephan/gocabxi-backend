import {
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const REDIS = Symbol('REDIS');

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Redis => {
        const logger = new Logger('Redis');
        const client = new Redis({
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: Number(config.get<string>('REDIS_PORT', '6379')),
          username: config.get<string>('REDIS_USERNAME') || undefined,
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          // Every key is stored as <prefix><key>; Cloudways requires its prefix.
          keyPrefix: config.get<string>('REDIS_PREFIX', ''),
          lazyConnect: true,
          maxRetriesPerRequest: 1,
        });
        client.on('error', (err: Error & { code?: string }) =>
          logger.warn(err.message || err.code || err.name),
        );
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.redis.status === 'wait' || this.redis.status === 'end') {
      this.redis.disconnect();
      return;
    }
    await this.redis.quit().catch(() => this.redis.disconnect());
  }
}
