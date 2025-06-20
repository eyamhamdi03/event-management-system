import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendPort = process.env.Frontend_PORT || 3001;

  app.enableCors({
    origin: `http://localhost:${frontendPort}`,
    credentials: true,
  });


  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
