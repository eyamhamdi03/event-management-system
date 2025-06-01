import { Injectable } from '@nestjs/common';
import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './graphql.schema';
import { resolvers } from './graphql.resolvers';
import { useGraphQlJit } from '@envelop/graphql-jit';
import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';
import { RegistrationService } from '../registration/registration.service';
import { CategoryService } from '../category/category.service';
import { GraphQLContext } from './graphql.context'; 
import { PubSub } from 'graphql-subscriptions';
import { pubSub } from './pubsub';

@Injectable()
export class GraphQLService {
  public yoga;

  constructor(
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly registrationService: RegistrationService,
    private readonly categoryService: CategoryService,
  ) {
    this.yoga = createYoga<GraphQLContext>({
      schema: createSchema<GraphQLContext>({
        typeDefs,
        resolvers,
      }),
      graphqlEndpoint: '/graphql',
      graphiql: {
        title: 'Event Management System',
      },
      plugins: [useGraphQlJit()],
      context: ({ request }) => ({
        req: request,
        eventService: this.eventService,
        userService: this.userService,
        registrationService: this.registrationService,
        categoryService: this.categoryService,
        pubSub,
      }),
    });
  }

  getHandler() {
    return this.yoga;
  }
}
