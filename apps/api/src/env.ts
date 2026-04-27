import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env.development');
console.log('Cargando env desde:', envPath);

dotenv.config({ path: envPath });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'CARGADA ✓' : 'VACÍA ✗');

export const env = {
  PORT: process.env.PORT ? parseInt(process.env.PORT) : 3001,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DATABASE_URL: process.env.DATABASE_URL ?? '',
};