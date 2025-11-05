/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createBooking = /* GraphQL */ `mutation CreateBooking(
  $condition: ModelBookingConditionInput
  $input: CreateBookingInput!
) {
  createBooking(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateBookingMutationVariables,
  APITypes.CreateBookingMutation
>;
export const createEvent = /* GraphQL */ `mutation CreateEvent(
  $condition: ModelEventConditionInput
  $input: CreateEventInput!
) {
  createEvent(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateEventMutationVariables,
  APITypes.CreateEventMutation
>;
export const createUserProfile = /* GraphQL */ `mutation CreateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: CreateUserProfileInput!
) {
  createUserProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.CreateUserProfileMutationVariables,
  APITypes.CreateUserProfileMutation
>;
export const deleteBooking = /* GraphQL */ `mutation DeleteBooking(
  $condition: ModelBookingConditionInput
  $input: DeleteBookingInput!
) {
  deleteBooking(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteBookingMutationVariables,
  APITypes.DeleteBookingMutation
>;
export const deleteEvent = /* GraphQL */ `mutation DeleteEvent(
  $condition: ModelEventConditionInput
  $input: DeleteEventInput!
) {
  deleteEvent(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteEventMutationVariables,
  APITypes.DeleteEventMutation
>;
export const deleteUserProfile = /* GraphQL */ `mutation DeleteUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: DeleteUserProfileInput!
) {
  deleteUserProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.DeleteUserProfileMutationVariables,
  APITypes.DeleteUserProfileMutation
>;
export const updateBooking = /* GraphQL */ `mutation UpdateBooking(
  $condition: ModelBookingConditionInput
  $input: UpdateBookingInput!
) {
  updateBooking(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateBookingMutationVariables,
  APITypes.UpdateBookingMutation
>;
export const updateEvent = /* GraphQL */ `mutation UpdateEvent(
  $condition: ModelEventConditionInput
  $input: UpdateEventInput!
) {
  updateEvent(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateEventMutationVariables,
  APITypes.UpdateEventMutation
>;
export const updateUserProfile = /* GraphQL */ `mutation UpdateUserProfile(
  $condition: ModelUserProfileConditionInput
  $input: UpdateUserProfileInput!
) {
  updateUserProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<
  APITypes.UpdateUserProfileMutationVariables,
  APITypes.UpdateUserProfileMutation
>;
