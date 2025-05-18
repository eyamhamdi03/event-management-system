import { Injectable } from '@nestjs/common';
import { createYoga } from 'graphql-yoga';
import { EventService } from '../event/event.service';
import { RegistrationService } from '../registration/registration.service';
import { schema } from './graphql.schema';

@Injectable()
export class GraphQLService {
    constructor(
        private readonly eventService: EventService,
        private readonly registrationService: RegistrationService,
    ) { }

    createYogaHandler() {
        return createYoga({
            schema,
            context: () => ({
                eventService: this.eventService,
                registrationService: this.registrationService,
            }),
            graphqlEndpoint: '/graphql',
            logging: true,
            graphiql: true,
        });
    }
}
