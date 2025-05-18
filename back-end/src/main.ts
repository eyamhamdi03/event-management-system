import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { GraphQLService } from './graphql/graphql.service';
import { INestApplication } from '@nestjs/common';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // GraphQL Yoga setup
  const graphQLService = app.get(GraphQLService);
  const yoga = graphQLService.createYogaHandler();

  // It's important to use a raw body parser for Yoga
  // and to disable the default body parser for the /graphql endpoint
  app.use('/graphql', yoga);

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
