import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';

export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
}
