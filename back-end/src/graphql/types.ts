import { GraphQLResolveInfo } from 'graphql';import { Event } from '../event/entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Registration } from '../registration/entities/registration.entity';
import { Category } from '../category/entities/category.entity';
import { CreateEventInput } from '../event/dto/create-event.input';
import { CreateUserInput } from '../user/dto/create-user.input';

export interface Resolvers {
  Query: {
    events: () => Promise<Event[]>;
    event: (args: { id: string }) => Promise<Event>;
    users: () => Promise<User[]>;
    user: (args: { id: string }) => Promise<User>;
    registrations: () => Promise<Registration[]>;
    registration: (args: { id: string }) => Promise<Registration>;
    categories: () => Promise<Category[]>;
    category: (args: { id: string }) => Promise<Category>;
  };
  
  Mutation: {
    createEvent: (args: { input: CreateEventInput }) => Promise<Event>;
    registerForEvent: (args: { eventId: string }) => Promise<Registration>;
    createUser: (args: { input: CreateUserInput }) => Promise<User>;
    createCategory: (args: { name: string }) => Promise<Category>;
  };
  
  Event: {
    organizer: (parent: Event) => Promise<User>;
    categories: (parent: Event) => Promise<Category[]>;
    registrations: (parent: Event) => Promise<Registration[]>;
  };
  
  User: {
    organizedEvents: (parent: User) => Promise<Event[]>;
    registrations: (parent: User) => Promise<Registration[]>;
  };
  
  Registration: {
    event: (parent: Registration) => Promise<Event>;
    user: (parent: Registration) => Promise<User>;
  };
  
  Category: {
    events: (parent: Category) => Promise<Event[]>;
  };
  
  DateTime: any;
}