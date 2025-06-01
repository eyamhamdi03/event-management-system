import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Seeder } from '../bd/seeder';
import * as dotenv from 'dotenv';
import { Category } from '../category/entities/category.entity';
import { Registration } from '../registration/entities/registration.entity';
import { User } from '../user/entities/user.entity';
import { Event } from '../event/entities/event.entity';
import { typeOrmConfig } from 'src/ormconfig';

dotenv.config();
async function bootstrap() {
  const dataSource = new DataSource(typeOrmConfig);
    
  await dataSource.initialize();
  const seeder = new Seeder(dataSource);
  await seeder.seed();
  await dataSource.destroy();
}

bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});