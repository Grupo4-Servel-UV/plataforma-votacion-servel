import * as path from 'path';
import * as dotenv from 'dotenv';
const envPath = path.join(__dirname, '../../.env.development');
dotenv.config({ path: envPath });
import { AppDataSource } from '@servel/database';

async function run() {
  try {
    console.log('Initializing data source...');
    await AppDataSource.initialize();
    console.log('Running migrations...');
    const res = await AppDataSource.runMigrations();
    console.log('Migrations applied:', res.map(r => r.name));
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

run();
