import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { RegistrationModule } from '../registration/registration.module';
import { GraphQLService } from './graphql.service';

@Module({
    imports: [EventModule, RegistrationModule],
    providers: [GraphQLService],
})
export class GraphQLModule { }
