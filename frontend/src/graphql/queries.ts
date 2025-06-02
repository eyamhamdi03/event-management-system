import { gql } from 'graphql-request'

// Fragment for common event fields
export const EVENT_FRAGMENT = gql`
  fragment EventFields on Event {
    id
    title
    description
    eventDate
    location
    participantLimit
    validated
    createdAt
    updatedAt
    currentParticipants
    isFull
    isAvailable    category {
      id
      name
    }
    host {
      id
      fullName
      email
    }
    registrations {
      id
      confirmed
      user {
        id
        fullName
        email
      }
    }
  }
`

export const GET_EVENTS_WITH_FILTER = gql`
  ${EVENT_FRAGMENT}
  query GetEventsWithFilter($filter: EventsFilterInput) {
    eventsWithFilter(filter: $filter) {
      data {
        ...EventFields
      }
      total
      page
      limit
      totalPages
    }
  }
`

export const GET_ALL_EVENTS = gql`
  ${EVENT_FRAGMENT}
  query GetAllEvents {
    events {
      ...EventFields
    }
  }
`

export const GET_EVENT_BY_ID = gql`
  ${EVENT_FRAGMENT}
  query GetEventById($id: ID!) {
    event(id: $id) {
      ...EventFields
    }
  }
`

// Query for search and filtering with legacy support
export const FILTER_EVENTS = gql`
  ${EVENT_FRAGMENT}
  query FilterEvents($filter: EventFilterInput!) {
    filterEvents(filter: $filter) {
      ...EventFields
    }
  }
`

// Categories query for filter dropdown
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`

// Mutation to create an event
export const CREATE_EVENT = gql`
  ${EVENT_FRAGMENT}
  mutation CreateEvent($input: CreateEventInput!) {
    createEvent(input: $input) {
      ...EventFields
    }
  }
`

// Mutation to update an event
export const UPDATE_EVENT = gql`
  ${EVENT_FRAGMENT}
  mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
    updateEvent(id: $id, input: $input) {
      ...EventFields
    }
  }
`

// Mutation to delete an event
export const DELETE_EVENT = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
`

// Mutation to register for an event
export const REGISTER_FOR_EVENT = gql`
  mutation RegisterForEvent($eventId: ID!) {
    registerForEvent(eventId: $eventId) {
      id
      confirmed
      event {
        id
        title
      }
      user {
        id
        fullname
      }
    }
  }
`

// Subscription for real-time event updates
export const EVENT_CREATED_SUBSCRIPTION = gql`
  ${EVENT_FRAGMENT}
  subscription EventCreated {
    eventCreated {
      ...EventFields
    }
  }
`

export const EVENT_UPDATED_SUBSCRIPTION = gql`
  ${EVENT_FRAGMENT}
  subscription EventUpdated {
    eventUpdated {
      ...EventFields
    }
  }
`

export const EVENT_DELETED_SUBSCRIPTION = gql`
  subscription EventDeleted {
    eventDeleted
  }
`