import { GraphQLResolveInfo } from 'graphql'; import { Event } from '../event/entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Registration } from '../registration/entities/registration.entity';
import { Category } from '../category/entities/category.entity';
import { CreateEventInput } from '../event/dto/create-event.input';
import { CreateUserInput } from '../user/dto/create-user.input';
import { EventFilterInput } from '../event/dto/filter-event.input';

export interface Resolvers {
  Query: {
    events: () => Promise<Event[]>;
    eventsWithFilter: (args: { filter?: EventsFilterInput }) => Promise<EventsResult>;
    event: (args: { id: string }) => Promise<Event>;
    filterEvents: (args: { filter: EventFilterInput }) => Promise<Event[]>;
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
    host: (parent: Event) => Promise<User>;
    category: (parent: Event) => Promise<Category>;
    registrations: (parent: Event) => Promise<Registration[]>;
    currentParticipants: (parent: Event) => number;
    isFull: (parent: Event) => boolean;
    isAvailable: (parent: Event) => boolean;
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

export interface EventsFilterInput {
  search?: string;
  category?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  hostId?: string;
  upcoming?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'TITLE' | 'EVENT_DATE' | 'LOCATION' | 'CREATED_AT' | 'PARTICIPANT_COUNT';
  sortOrder?: 'ASC' | 'DESC';
}

export interface EventsResult {
  data: Event[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export { EventFilterInput };
