import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { GraphQLService } from './graphql/graphql.service';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const graphqlService = app.get(GraphQLService);
  app.use('/graphql', graphqlService.getHandler());
  const frontendPort = process.env.Frontend_PORT || 3001;

  app.enableCors({
    origin: `http://localhost:${frontendPort}`,

    credentials: true,
  });
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
