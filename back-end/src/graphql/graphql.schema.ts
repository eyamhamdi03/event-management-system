import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Event {
    id: ID!
    name: String!
    description: String!
    date: String!
    location: String!
    // Add other event fields as needed
  }

  type Registration {
    id: ID!
    eventId: ID!
    userId: ID!
    // Add other registration fields as needed
  }

  type Query {
    events(search: String, filter: String): [Event!]
    participants(eventId: ID!, filter: String): [Registration!]
  }
`);
