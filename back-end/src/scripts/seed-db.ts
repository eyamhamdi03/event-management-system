import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Seeder } from '../bd/seeder';
import * as dotenv from 'dotenv';
import { Category } from '../category/entities/category.entity';
import { Registration } from '../registration/entities/registration.entity';
import { User } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';
import { typeOrmConfig } from 'src/ormconfig';
import * as path from 'path';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function bootstrap() {
  console.log('Loading environment variables...');
  console.log('Current working directory:', process.cwd());
  console.log('__dirname:', __dirname);

  // Try to load env file from multiple locations
  const envPaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../../../.env')
  ];

  for (const envPath of envPaths) {
    console.log(`Trying to load .env from: ${envPath}`);
    try {
      const result = dotenv.config({ path: envPath });
      if (result.parsed) {
        console.log('Successfully loaded .env file');
        break;
      }
    } catch (error) {
      console.log(`Failed to load from ${envPath}:`, error.message);
    }
  }

  console.log('Environment variables after loading:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_PORT:', process.env.DB_PORT);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD === '' ? 'EMPTY' : process.env.DB_PASSWORD ? 'SET' : 'NOT SET');
  console.log('DB_NAME:', process.env.DB_NAME);

  // Create config manually for XAMPP defaults if env vars are not set
  const dbConfig = {
    ...typeOrmConfig,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'event_management_db'
  };

  console.log('Final database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password === '' ? 'EMPTY' : 'SET',
    database: dbConfig.database
  });

  const dataSource = new DataSource(dbConfig);

  await dataSource.initialize();
  const seeder = new Seeder(dataSource);
  await seeder.seed();
  await dataSource.destroy();
}

bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});