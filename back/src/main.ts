import { loadEnvFile } from 'process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import cookieParser from 'cookie-parser';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CLIENT_URL;
  if (corsOrigin) {
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });
  }
  app.use(cookieParser());
  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
