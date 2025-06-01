import { EventService } from '../event/event.service';
import { UserService } from '../user/user.service';
import { RegistrationService } from '../registration/registration.service';
import { CategoryService } from '../category/category.service';
import { IncomingMessage } from 'http';
import { PubSub } from 'graphql-yoga';

export interface GraphQLContext {
  req: IncomingMessage;
  eventService: EventService;
  userService: UserService;
  registrationService: RegistrationService;
  categoryService: CategoryService;
  pubSub: PubSub<any>;
}