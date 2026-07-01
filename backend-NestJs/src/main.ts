import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth.setup';
import { Request, Response, NextFunction } from 'express';

const betterAuthHandler = toNodeHandler(auth);

const CORS_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';

function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(corsMiddleware);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/auth/')) {
      void betterAuthHandler(req, res);
    } else {
      next();
    }
  });

  app.enableCors({
    origin: CORS_ORIGIN,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VanSport API')
    .setDescription('VanSport e-commerce API powered by NestJS + BetterAuth + Drizzle')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  app.use('/api/openapi.json', (_req: Request, res: Response) => {
    res.json(document);
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`VanSport API running on http://localhost:${port}`);
  console.log(`API Docs available at http://localhost:${port}/api-docs`);
  console.log(`OpenAPI JSON at http://localhost:${port}/api/openapi.json`);
}

bootstrap();
