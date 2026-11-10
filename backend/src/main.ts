import { NestFactory } from '@nestjs/core';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { corsOrigins } from './config/database.config';
import { describeWriteMode } from './common/write-access';

/** Shared app setup, also used by the e2e tests. */
export function configureApp(app: INestApplication) {
  // Render and most PaaS hosts add exactly one proxy hop. Trusting one makes
  // req.ip the real client address for the rate limiter; trusting all would let
  // a caller spoof X-Forwarded-For and bypass it entirely.
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(
    helmet({
      // A JSON API on a different origin from the SPA: nothing here is ever
      // loaded as a subresource, so deny everything.
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          'default-src': ["'none'"],
          'frame-ancestors': ["'none'"],
          'base-uri': ["'none'"],
          'form-action': ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'no-referrer' },
    }),
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 600,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { message: 'Too many requests, please try again later.' },
    }),
  );

  app.enableCors({
    origin: corsOrigins(),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key'],
    maxAge: 86_400,
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

/** Mount Swagger UI at /api-docs. */
export function configureDocs(app: INestApplication) {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Job Management API')
      .setDescription(
        'REST API for the job board. Reads are public; writes require the ' +
          'x-admin-key header when ADMIN_API_KEY is configured on the server.',
      )
      .setVersion('1.0')
      .addApiKey(
        { type: 'apiKey', name: 'x-admin-key', in: 'header' },
        'admin-key',
      )
      .build(),
  );
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'Job Management API',
    swaggerOptions: { persistAuthorization: true },
  });
  return app;
}

/**
 * Bind address. Loopback by default, so a development server is never
 * reachable from the local network; managed platforms route traffic into the
 * container and need all interfaces, so they are detected by their own env
 * markers. HOST overrides both.
 */
export function bindHost(env: NodeJS.ProcessEnv = process.env): string {
  if (env.HOST) return env.HOST;
  const managed =
    env.RENDER || env.FLY_APP_NAME || env.RAILWAY_ENVIRONMENT || env.DYNO;
  return managed ? '0.0.0.0' : '127.0.0.1';
}

async function bootstrap() {
  const logger = new Logger('bootstrap');
  try {
    const app = configureDocs(
      configureApp(await NestFactory.create(AppModule)),
    );
    // Lets TypeORM close its pool on SIGTERM instead of being killed mid-query.
    app.enableShutdownHooks();

    const port = Number(process.env.PORT) || 3001;
    const host = bindHost();

    // Say out loud whether writes are protected, so a misconfigured deploy
    // shows up in the logs rather than being discovered by whoever finds it.
    logger.log(describeWriteMode());

    await app.listen(port, host);
    logger.log(`API listening on http://${host}:${port} (docs at /api-docs)`);
  } catch (error) {
    logger.error(
      `Error starting the application: ${error instanceof Error ? error.message : error}`,
    );
    process.exit(1);
  }
}

if (require.main === module) {
  bootstrap();
}
