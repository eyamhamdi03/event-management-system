import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { UserModule } from '../user/user.module';
import { RegistrationModule } from '../registration/registration.module';
import { CategoryModule } from '../category/category.module';
import { GraphQLService } from './graphql.service';
import { GraphQLController } from './graphql.controller';

@Module({
  imports: [EventModule, UserModule, RegistrationModule, CategoryModule],
  controllers: [GraphQLController],
  providers: [GraphQLService],
  exports: [GraphQLService],
})
export class GraphQLModule { }
