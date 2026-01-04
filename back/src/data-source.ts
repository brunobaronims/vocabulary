import 'reflect-metadata';
import { existsSync } from 'fs';
import { resolve, join } from 'path';
import { loadEnvFile } from 'process';
import { DataSource } from 'typeorm';

const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath)) {
  loadEnvFile(envPath);
}

const srcDir = resolve(process.cwd(), 'src');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(srcDir, '**', '*.entity.{ts,js}')],
  migrations: [join(srcDir, 'migrations/*{.ts,.js}')],
  migrationsTransactionMode: 'each',
  synchronize: false,
});
