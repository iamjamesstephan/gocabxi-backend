import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { getDrizzleToken } from '@nestjs/drizzle';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import type { Database } from './database/database.module.js';
import { migrateAndSeed } from './database/migrate.js';
import { setupApp } from './setup-app.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  setupApp(app);

  const config = app.get(ConfigService);
  if (config.get<string>('DB_MIGRATE_ON_START', 'true') !== 'false') {
    // Fail fast: an app on an out-of-date schema must not serve traffic.
    await migrateAndSeed(app.get<Database>(getDrizzleToken()));
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GoCabxi API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}
await bootstrap();
