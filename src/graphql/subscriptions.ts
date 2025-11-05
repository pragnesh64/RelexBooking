/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateBooking = /* GraphQL */ `subscription OnCreateBooking(
  $filter: ModelSubscriptionBookingFilterInput
  $userID: String
) {
  onCreateBooking(filter: $filter, userID: $userID) {
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
` as GeneratedSubscription<
  APITypes.OnCreateBookingSubscriptionVariables,
  APITypes.OnCreateBookingSubscription
>;
export const onCreateEvent = /* GraphQL */ `subscription OnCreateEvent($filter: ModelSubscriptionEventFilterInput) {
  onCreateEvent(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateEventSubscriptionVariables,
  APITypes.OnCreateEventSubscription
>;
export const onCreateUserProfile = /* GraphQL */ `subscription OnCreateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $userID: String
) {
  onCreateUserProfile(filter: $filter, userID: $userID) {
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
` as GeneratedSubscription<
  APITypes.OnCreateUserProfileSubscriptionVariables,
  APITypes.OnCreateUserProfileSubscription
>;
export const onDeleteBooking = /* GraphQL */ `subscription OnDeleteBooking(
  $filter: ModelSubscriptionBookingFilterInput
  $userID: String
) {
  onDeleteBooking(filter: $filter, userID: $userID) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteBookingSubscriptionVariables,
  APITypes.OnDeleteBookingSubscription
>;
export const onDeleteEvent = /* GraphQL */ `subscription OnDeleteEvent($filter: ModelSubscriptionEventFilterInput) {
  onDeleteEvent(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteEventSubscriptionVariables,
  APITypes.OnDeleteEventSubscription
>;
export const onDeleteUserProfile = /* GraphQL */ `subscription OnDeleteUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $userID: String
) {
  onDeleteUserProfile(filter: $filter, userID: $userID) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteUserProfileSubscriptionVariables,
  APITypes.OnDeleteUserProfileSubscription
>;
export const onUpdateBooking = /* GraphQL */ `subscription OnUpdateBooking(
  $filter: ModelSubscriptionBookingFilterInput
  $userID: String
) {
  onUpdateBooking(filter: $filter, userID: $userID) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateBookingSubscriptionVariables,
  APITypes.OnUpdateBookingSubscription
>;
export const onUpdateEvent = /* GraphQL */ `subscription OnUpdateEvent($filter: ModelSubscriptionEventFilterInput) {
  onUpdateEvent(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateEventSubscriptionVariables,
  APITypes.OnUpdateEventSubscription
>;
export const onUpdateUserProfile = /* GraphQL */ `subscription OnUpdateUserProfile(
  $filter: ModelSubscriptionUserProfileFilterInput
  $userID: String
) {
  onUpdateUserProfile(filter: $filter, userID: $userID) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateUserProfileSubscriptionVariables,
  APITypes.OnUpdateUserProfileSubscription
>;
