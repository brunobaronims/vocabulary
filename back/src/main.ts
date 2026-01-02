import { loadEnvFile } from 'process';
import { existsSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.API_PORT ?? 3000);
}
bootstrap();
