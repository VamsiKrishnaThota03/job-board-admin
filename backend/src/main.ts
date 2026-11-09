import { NestFactory } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { corsOrigins } from './config/database.config';

/** Shared app setup, also used by the e2e tests. */
export function configureApp(app: INestApplication) {
  app.enableCors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  return app;
}

async function bootstrap() {
  try {
    const app = configureApp(await NestFactory.create(AppModule));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`API listening on port ${port}`);
  } catch (error) {
    console.error(
      'Error starting the application:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
