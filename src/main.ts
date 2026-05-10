import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');

  const allowedOrigins = [frontendUrl, 'http://localhost:3000'].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['set-cookie'],
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API running on port ${port}`);
}

bootstrap();
