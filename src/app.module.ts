import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health/health.controller.js';
import { RedisModule } from './redis/redis.module.js';
import { RolesModule } from './roles/roles.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    RedisModule,
    RolesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
