export const typeDefs = `  type Event {
    id: ID!
    title: String!
    description: String!
    eventDate: DateTime!
    location: String!
    participantLimit: Int
    validated: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    organizer: User!
    host: User!
    category: Category!
    registrations: [Registration!]!
    currentParticipants: Int!
    isFull: Boolean!
    isAvailable: Boolean!
  }
  type User {
    id: ID!
    fullName: String
    email: String!
    role: UserRole!
    organizedEvents: [Event!]!
    registrations: [Registration!]!
    hostedevents: [Event!]!
  }

  type Registration {
    id: ID!
    event: Event!
    user: User!
    confirmed: Boolean!
  }

  type Category {
    id: ID!
    name: String!
    events: [Event!]!
  }

  enum UserRole {
    ADMIN
    ORGANIZER
    ATTENDEE
  }

  enum RegistrationStatus {
    PENDING
    CONFIRMED
    CANCELLED
  }

  scalar DateTime
  type Query {
    events: [Event!]!
    eventsWithFilter(filter: EventsFilterInput): EventsResult!
    event(id: ID!): Event
    users: [User!]!
    user(id: ID!): User
    registrations: [Registration!]!
    registration(id: ID!): Registration
    categories: [Category!]!
    category(id: ID!): Category
    filterEvents(filter: EventFilterInput): [Event!]!
  }

  type EventsResult {
    data: [Event!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type Mutation {
    createEvent(input: CreateEventInput!): Event!
    updateEvent(id: ID!, input: UpdateEventInput!): Event!
    deleteEvent(id: ID!): ID!
    registerForEvent(eventId: ID!): Registration!
    createUser(input: CreateUserInput!): User!
    createCategory(name: String!): Category!
  }
  type Subscription {
  eventCreated: Event!
  eventUpdated: Event!
  eventDeleted: ID! 
}
  input CreateEventInput {
    title: String!
    description: String!
    startDate: DateTime!
    endDate: DateTime!
    location: String!
    organizerId: ID!
    categoryIds: [ID!]!
  }

  input CreateUserInput {
    username: String!
    email: String!
    password: String!
    role: UserRole
  }
  input UpdateEventInput {
    title: String
    description: String
    startDate: DateTime
    endDate: DateTime
    location: String
    categoryIds: [ID!]
  }  input EventFilterInput {
  id: ID
  titleContains: String
  dateFrom: DateTime
  dateTo: DateTime
  categoryIds: [ID!]
  availableOnly: Boolean
  minAvailableSpots: Int
  maxParticipants: Int
}

  input EventsFilterInput {
    search: String
    category: String
    date: String
    startDate: String
    endDate: String
    hostId: String
    upcoming: Boolean
    page: Int
    limit: Int
    sortBy: EventSortField
    sortOrder: SortOrder
  }

  enum EventSortField {
    TITLE
    EVENT_DATE
    LOCATION
    CREATED_AT
    PARTICIPANT_COUNT
  }

  enum SortOrder {
    ASC
    DESC
  }
`;