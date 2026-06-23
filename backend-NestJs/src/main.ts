import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth/auth.setup';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';

config();

const betterAuthHandler = toNodeHandler(auth);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/auth/')) {
      void betterAuthHandler(req, res);
    } else {
      next();
    }
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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
  SwaggerModule.setup('api/openapi.json', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`VanSport API running on http://localhost:${port}`);
  console.log(`API Docs available at http://localhost:${port}/api-docs`);
  console.log(`OpenAPI JSON at http://localhost:${port}/api/openapi.json`);
}

bootstrap();
