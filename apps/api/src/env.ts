import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({
  path: path.resolve(process.cwd(), '.env.development'),
});

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.URL_DB ?? process.env.DATABASE_URL ?? '',
};