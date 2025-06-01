import { DateTimeResolver } from 'graphql-scalars';
import { pubSub } from './pubsub';
import { EventFilterInput } from './types';

export const resolvers = {
  DateTime: DateTimeResolver,

  Query: {
    events: (_, __, { eventService }) => eventService.findAll(),
    event: (_, { id }, { eventService }) => eventService.findById(id),
    filterEvents: async (_: any, { filter }: { filter: EventFilterInput }, { eventService }) => {
      return eventService.filterEvents(filter);
    },
    users: (_, __, { userService }) => userService.findAll(),
    user: (_, { id }, { userService }) => userService.findById(id),
    registrations: (_, __, { registrationService }) => registrationService.findAll(),
    registration: (_, { id }, { registrationService }) => registrationService.findById(id),
    categories: (_, __, { categoryService }) => categoryService.findAll(),
    category: (_, { id }, { categoryService }) => categoryService.findById(id),
  },

  Mutation: {
    createEvent: async (_, { input }, { eventService, pubSub }) => {
      const event = await eventService.create(input);
      await pubSub.publish('EVENT_CREATED', { eventCreated: event });
      return event;
    },
    updateEvent: async (_, { id, input }, { eventService, pubSub }) => {
        const updatedEvent = await eventService.update(id, input);
        await pubSub.publish('EVENT_UPDATED', { eventUpdated: updatedEvent });
        return updatedEvent;
    },

    deleteEvent: async (_, { id }, { eventService, pubSub }) => {
        await eventService.delete(id);
        await pubSub.publish('EVENT_DELETED', { eventDeleted: id });
        return id;
    },
    registerForEvent: async (_, { eventId }, { registrationService, user, pubSub }) => {
      const registration = await registrationService.create({ 
        eventId, 
        userId: user.id 
      });
      await pubSub.publish('REGISTRATION_CREATED', { 
        registrationCreated: registration,
        eventId 
      });
      return registration;
    },
    createUser: (_, { input }, { userService }) => userService.create(input),
    createCategory: (_, { name }, { categoryService }) => categoryService.create({ name }),
  },

  Event: {
    organizer: (parent, _, { userService }) => userService.findById(parent.organizerId),
    categories: (parent, _, { categoryService }) => 
      categoryService.findByEventId(parent.id),
    registrations: (parent, _, { registrationService }) => 
      registrationService.findByEventId(parent.id),
  },

  User: {
    organizedEvents: (parent, _, { eventService }) => 
      eventService.findByOrganizerId(parent.id),
    registrations: (parent, _, { registrationService }) => 
      registrationService.findByUserId(parent.id),
  },

  Registration: {
    event: (parent, _, { eventService }) => eventService.findById(parent.eventId),
    user: (parent, _, { userService }) => userService.findById(parent.userId),
  },

  Category: {
    events: (parent, _, { eventService }) => eventService.findByCategoryId(parent.id),
  },
  Subscription: {
  eventCreated: {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator('EVENT_CREATED'),
  },
  eventUpdated: {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator('EVENT_UPDATED'),
  },
  eventDeleted: {
    subscribe: (_, __, { pubSub }) => pubSub.asyncIterator('EVENT_DELETED'),
  },
},
};