/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getBooking = /* GraphQL */ `query GetBooking($id: ID!) {
  getBooking(id: $id) {
    cancelledAt
    checkedIn
    checkedInAt
    createdAt
    event {
      capacity
      category
      createdAt
      date
      description
      id
      imageUrl
      location
      organizerID
      organizerName
      price
      publishedAt
      status
      title
      updatedAt
      __typename
    }
    eventID
    id
    qrCode
    refundedAt
    status
    ticketCount
    totalAmount
    updatedAt
    userEmail
    userID
    userName
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetBookingQueryVariables,
  APITypes.GetBookingQuery
>;
export const getEvent = /* GraphQL */ `query GetEvent($id: ID!) {
  getEvent(id: $id) {
    bookings {
      nextToken
      __typename
    }
    capacity
    category
    createdAt
    date
    description
    id
    imageUrl
    location
    organizerID
    organizerName
    price
    publishedAt
    status
    title
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetEventQueryVariables, APITypes.GetEventQuery>;
export const getUserProfile = /* GraphQL */ `query GetUserProfile($id: ID!) {
  getUserProfile(id: $id) {
    avatarUrl
    bio
    createdAt
    email
    id
    kycDocumentUrl
    kycStatus
    name
    phone
    role
    updatedAt
    userID
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetUserProfileQueryVariables,
  APITypes.GetUserProfileQuery
>;
export const listBookings = /* GraphQL */ `query ListBookings(
  $filter: ModelBookingFilterInput
  $limit: Int
  $nextToken: String
) {
  listBookings(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      cancelledAt
      checkedIn
      checkedInAt
      createdAt
      eventID
      id
      qrCode
      refundedAt
      status
      ticketCount
      totalAmount
      updatedAt
      userEmail
      userID
      userName
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListBookingsQueryVariables,
  APITypes.ListBookingsQuery
>;
export const listEvents = /* GraphQL */ `query ListEvents(
  $filter: ModelEventFilterInput
  $limit: Int
  $nextToken: String
) {
  listEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      capacity
      category
      createdAt
      date
      description
      id
      imageUrl
      location
      organizerID
      organizerName
      price
      publishedAt
      status
      title
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListEventsQueryVariables,
  APITypes.ListEventsQuery
>;
export const listUserProfiles = /* GraphQL */ `query ListUserProfiles(
  $filter: ModelUserProfileFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      avatarUrl
      bio
      createdAt
      email
      id
      kycDocumentUrl
      kycStatus
      name
      phone
      role
      updatedAt
      userID
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListUserProfilesQueryVariables,
  APITypes.ListUserProfilesQuery
>;
