/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Booking = {
  __typename: "Booking",
  cancelledAt?: string | null,
  checkedIn?: boolean | null,
  checkedInAt?: string | null,
  createdAt?: string | null,
  event?: Event | null,
  eventID: string,
  id: string,
  qrCode?: string | null,
  refundedAt?: string | null,
  status: string,
  ticketCount?: number | null,
  totalAmount?: number | null,
  updatedAt?: string | null,
  userEmail?: string | null,
  userID: string,
  userName?: string | null,
};

export type Event = {
  __typename: "Event",
  bookings?: ModelBookingConnection | null,
  capacity?: number | null,
  category?: string | null,
  createdAt?: string | null,
  date: string,
  description?: string | null,
  id: string,
  imageUrl?: string | null,
  location?: string | null,
  organizerID: string,
  organizerName?: string | null,
  price?: number | null,
  publishedAt?: string | null,
  status?: string | null,
  title: string,
  updatedAt?: string | null,
};

export type ModelBookingConnection = {
  __typename: "ModelBookingConnection",
  items:  Array<Booking | null >,
  nextToken?: string | null,
};

export type UserProfile = {
  __typename: "UserProfile",
  avatarUrl?: string | null,
  bio?: string | null,
  createdAt?: string | null,
  email?: string | null,
  id: string,
  kycDocumentUrl?: string | null,
  kycStatus?: string | null,
  name?: string | null,
  phone?: string | null,
  role?: string | null,
  updatedAt?: string | null,
  userID: string,
};

export type ModelBookingFilterInput = {
  and?: Array< ModelBookingFilterInput | null > | null,
  cancelledAt?: ModelStringInput | null,
  checkedIn?: ModelBooleanInput | null,
  checkedInAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  eventID?: ModelIDInput | null,
  id?: ModelIDInput | null,
  not?: ModelBookingFilterInput | null,
  or?: Array< ModelBookingFilterInput | null > | null,
  qrCode?: ModelStringInput | null,
  refundedAt?: ModelStringInput | null,
  status?: ModelStringInput | null,
  ticketCount?: ModelIntInput | null,
  totalAmount?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
  userEmail?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  userName?: ModelStringInput | null,
};

export type ModelStringInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  _null = "_null",
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
}


export type ModelSizeInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelBooleanInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelIDInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  size?: ModelSizeInput | null,
};

export type ModelIntInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelFloatInput = {
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
};

export type ModelEventFilterInput = {
  and?: Array< ModelEventFilterInput | null > | null,
  capacity?: ModelIntInput | null,
  category?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  description?: ModelStringInput | null,
  id?: ModelIDInput | null,
  imageUrl?: ModelStringInput | null,
  location?: ModelStringInput | null,
  not?: ModelEventFilterInput | null,
  or?: Array< ModelEventFilterInput | null > | null,
  organizerID?: ModelIDInput | null,
  organizerName?: ModelStringInput | null,
  price?: ModelFloatInput | null,
  publishedAt?: ModelStringInput | null,
  status?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type ModelEventConnection = {
  __typename: "ModelEventConnection",
  items:  Array<Event | null >,
  nextToken?: string | null,
};

export type ModelUserProfileFilterInput = {
  and?: Array< ModelUserProfileFilterInput | null > | null,
  avatarUrl?: ModelStringInput | null,
  bio?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  id?: ModelIDInput | null,
  kycDocumentUrl?: ModelStringInput | null,
  kycStatus?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelUserProfileFilterInput | null,
  or?: Array< ModelUserProfileFilterInput | null > | null,
  phone?: ModelStringInput | null,
  role?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userID?: ModelIDInput | null,
};

export type ModelUserProfileConnection = {
  __typename: "ModelUserProfileConnection",
  items:  Array<UserProfile | null >,
  nextToken?: string | null,
};

export type ModelBookingConditionInput = {
  and?: Array< ModelBookingConditionInput | null > | null,
  cancelledAt?: ModelStringInput | null,
  checkedIn?: ModelBooleanInput | null,
  checkedInAt?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  eventID?: ModelIDInput | null,
  not?: ModelBookingConditionInput | null,
  or?: Array< ModelBookingConditionInput | null > | null,
  qrCode?: ModelStringInput | null,
  refundedAt?: ModelStringInput | null,
  status?: ModelStringInput | null,
  ticketCount?: ModelIntInput | null,
  totalAmount?: ModelFloatInput | null,
  updatedAt?: ModelStringInput | null,
  userEmail?: ModelStringInput | null,
  userID?: ModelIDInput | null,
  userName?: ModelStringInput | null,
};

export type CreateBookingInput = {
  cancelledAt?: string | null,
  checkedIn?: boolean | null,
  checkedInAt?: string | null,
  createdAt?: string | null,
  eventID: string,
  id?: string | null,
  qrCode?: string | null,
  refundedAt?: string | null,
  status: string,
  ticketCount?: number | null,
  totalAmount?: number | null,
  updatedAt?: string | null,
  userEmail?: string | null,
  userID: string,
  userName?: string | null,
};

export type ModelEventConditionInput = {
  and?: Array< ModelEventConditionInput | null > | null,
  capacity?: ModelIntInput | null,
  category?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  date?: ModelStringInput | null,
  description?: ModelStringInput | null,
  imageUrl?: ModelStringInput | null,
  location?: ModelStringInput | null,
  not?: ModelEventConditionInput | null,
  or?: Array< ModelEventConditionInput | null > | null,
  organizerID?: ModelIDInput | null,
  organizerName?: ModelStringInput | null,
  price?: ModelFloatInput | null,
  publishedAt?: ModelStringInput | null,
  status?: ModelStringInput | null,
  title?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
};

export type CreateEventInput = {
  capacity?: number | null,
  category?: string | null,
  createdAt?: string | null,
  date: string,
  description?: string | null,
  id?: string | null,
  imageUrl?: string | null,
  location?: string | null,
  organizerID: string,
  organizerName?: string | null,
  price?: number | null,
  publishedAt?: string | null,
  status?: string | null,
  title: string,
  updatedAt?: string | null,
};

export type ModelUserProfileConditionInput = {
  and?: Array< ModelUserProfileConditionInput | null > | null,
  avatarUrl?: ModelStringInput | null,
  bio?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  email?: ModelStringInput | null,
  kycDocumentUrl?: ModelStringInput | null,
  kycStatus?: ModelStringInput | null,
  name?: ModelStringInput | null,
  not?: ModelUserProfileConditionInput | null,
  or?: Array< ModelUserProfileConditionInput | null > | null,
  phone?: ModelStringInput | null,
  role?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  userID?: ModelIDInput | null,
};

export type CreateUserProfileInput = {
  avatarUrl?: string | null,
  bio?: string | null,
  createdAt?: string | null,
  email?: string | null,
  id?: string | null,
  kycDocumentUrl?: string | null,
  kycStatus?: string | null,
  name?: string | null,
  phone?: string | null,
  role?: string | null,
  updatedAt?: string | null,
  userID: string,
};

export type DeleteBookingInput = {
  id: string,
};

export type DeleteEventInput = {
  id: string,
};

export type DeleteUserProfileInput = {
  id: string,
};

export type UpdateBookingInput = {
  cancelledAt?: string | null,
  checkedIn?: boolean | null,
  checkedInAt?: string | null,
  createdAt?: string | null,
  eventID?: string | null,
  id: string,
  qrCode?: string | null,
  refundedAt?: string | null,
  status?: string | null,
  ticketCount?: number | null,
  totalAmount?: number | null,
  updatedAt?: string | null,
  userEmail?: string | null,
  userID?: string | null,
  userName?: string | null,
};

export type UpdateEventInput = {
  capacity?: number | null,
  category?: string | null,
  createdAt?: string | null,
  date?: string | null,
  description?: string | null,
  id: string,
  imageUrl?: string | null,
  location?: string | null,
  organizerID?: string | null,
  organizerName?: string | null,
  price?: number | null,
  publishedAt?: string | null,
  status?: string | null,
  title?: string | null,
  updatedAt?: string | null,
};

export type UpdateUserProfileInput = {
  avatarUrl?: string | null,
  bio?: string | null,
  createdAt?: string | null,
  email?: string | null,
  id: string,
  kycDocumentUrl?: string | null,
  kycStatus?: string | null,
  name?: string | null,
  phone?: string | null,
  role?: string | null,
  updatedAt?: string | null,
  userID?: string | null,
};

export type ModelSubscriptionBookingFilterInput = {
  and?: Array< ModelSubscriptionBookingFilterInput | null > | null,
  cancelledAt?: ModelSubscriptionStringInput | null,
  checkedIn?: ModelSubscriptionBooleanInput | null,
  checkedInAt?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  eventID?: ModelSubscriptionIDInput | null,
  id?: ModelSubscriptionIDInput | null,
  or?: Array< ModelSubscriptionBookingFilterInput | null > | null,
  qrCode?: ModelSubscriptionStringInput | null,
  refundedAt?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  ticketCount?: ModelSubscriptionIntInput | null,
  totalAmount?: ModelSubscriptionFloatInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userEmail?: ModelSubscriptionStringInput | null,
  userID?: ModelStringInput | null,
  userName?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionStringInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionBooleanInput = {
  eq?: boolean | null,
  ne?: boolean | null,
};

export type ModelSubscriptionIDInput = {
  beginsWith?: string | null,
  between?: Array< string | null > | null,
  contains?: string | null,
  eq?: string | null,
  ge?: string | null,
  gt?: string | null,
  in?: Array< string | null > | null,
  le?: string | null,
  lt?: string | null,
  ne?: string | null,
  notContains?: string | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionIntInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionFloatInput = {
  between?: Array< number | null > | null,
  eq?: number | null,
  ge?: number | null,
  gt?: number | null,
  in?: Array< number | null > | null,
  le?: number | null,
  lt?: number | null,
  ne?: number | null,
  notIn?: Array< number | null > | null,
};

export type ModelSubscriptionEventFilterInput = {
  and?: Array< ModelSubscriptionEventFilterInput | null > | null,
  capacity?: ModelSubscriptionIntInput | null,
  category?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  date?: ModelSubscriptionStringInput | null,
  description?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  imageUrl?: ModelSubscriptionStringInput | null,
  location?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionEventFilterInput | null > | null,
  organizerID?: ModelStringInput | null,
  organizerName?: ModelSubscriptionStringInput | null,
  price?: ModelSubscriptionFloatInput | null,
  publishedAt?: ModelSubscriptionStringInput | null,
  status?: ModelSubscriptionStringInput | null,
  title?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
};

export type ModelSubscriptionUserProfileFilterInput = {
  and?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  avatarUrl?: ModelSubscriptionStringInput | null,
  bio?: ModelSubscriptionStringInput | null,
  createdAt?: ModelSubscriptionStringInput | null,
  email?: ModelSubscriptionStringInput | null,
  id?: ModelSubscriptionIDInput | null,
  kycDocumentUrl?: ModelSubscriptionStringInput | null,
  kycStatus?: ModelSubscriptionStringInput | null,
  name?: ModelSubscriptionStringInput | null,
  or?: Array< ModelSubscriptionUserProfileFilterInput | null > | null,
  phone?: ModelSubscriptionStringInput | null,
  role?: ModelSubscriptionStringInput | null,
  updatedAt?: ModelSubscriptionStringInput | null,
  userID?: ModelStringInput | null,
};

export type GetBookingQueryVariables = {
  id: string,
};

export type GetBookingQuery = {
  getBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type GetEventQueryVariables = {
  id: string,
};

export type GetEventQuery = {
  getEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type GetUserProfileQueryVariables = {
  id: string,
};

export type GetUserProfileQuery = {
  getUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};

export type ListBookingsQueryVariables = {
  filter?: ModelBookingFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListBookingsQuery = {
  listBookings?:  {
    __typename: "ModelBookingConnection",
    items:  Array< {
      __typename: "Booking",
      cancelledAt?: string | null,
      checkedIn?: boolean | null,
      checkedInAt?: string | null,
      createdAt?: string | null,
      eventID: string,
      id: string,
      qrCode?: string | null,
      refundedAt?: string | null,
      status: string,
      ticketCount?: number | null,
      totalAmount?: number | null,
      updatedAt?: string | null,
      userEmail?: string | null,
      userID: string,
      userName?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListEventsQueryVariables = {
  filter?: ModelEventFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListEventsQuery = {
  listEvents?:  {
    __typename: "ModelEventConnection",
    items:  Array< {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type ListUserProfilesQueryVariables = {
  filter?: ModelUserProfileFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListUserProfilesQuery = {
  listUserProfiles?:  {
    __typename: "ModelUserProfileConnection",
    items:  Array< {
      __typename: "UserProfile",
      avatarUrl?: string | null,
      bio?: string | null,
      createdAt?: string | null,
      email?: string | null,
      id: string,
      kycDocumentUrl?: string | null,
      kycStatus?: string | null,
      name?: string | null,
      phone?: string | null,
      role?: string | null,
      updatedAt?: string | null,
      userID: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type CreateBookingMutationVariables = {
  condition?: ModelBookingConditionInput | null,
  input: CreateBookingInput,
};

export type CreateBookingMutation = {
  createBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type CreateEventMutationVariables = {
  condition?: ModelEventConditionInput | null,
  input: CreateEventInput,
};

export type CreateEventMutation = {
  createEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type CreateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: CreateUserProfileInput,
};

export type CreateUserProfileMutation = {
  createUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};

export type DeleteBookingMutationVariables = {
  condition?: ModelBookingConditionInput | null,
  input: DeleteBookingInput,
};

export type DeleteBookingMutation = {
  deleteBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type DeleteEventMutationVariables = {
  condition?: ModelEventConditionInput | null,
  input: DeleteEventInput,
};

export type DeleteEventMutation = {
  deleteEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type DeleteUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: DeleteUserProfileInput,
};

export type DeleteUserProfileMutation = {
  deleteUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};

export type UpdateBookingMutationVariables = {
  condition?: ModelBookingConditionInput | null,
  input: UpdateBookingInput,
};

export type UpdateBookingMutation = {
  updateBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type UpdateEventMutationVariables = {
  condition?: ModelEventConditionInput | null,
  input: UpdateEventInput,
};

export type UpdateEventMutation = {
  updateEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type UpdateUserProfileMutationVariables = {
  condition?: ModelUserProfileConditionInput | null,
  input: UpdateUserProfileInput,
};

export type UpdateUserProfileMutation = {
  updateUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};

export type OnCreateBookingSubscriptionVariables = {
  filter?: ModelSubscriptionBookingFilterInput | null,
  userID?: string | null,
};

export type OnCreateBookingSubscription = {
  onCreateBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type OnCreateEventSubscriptionVariables = {
  filter?: ModelSubscriptionEventFilterInput | null,
};

export type OnCreateEventSubscription = {
  onCreateEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type OnCreateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  userID?: string | null,
};

export type OnCreateUserProfileSubscription = {
  onCreateUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};

export type OnDeleteBookingSubscriptionVariables = {
  filter?: ModelSubscriptionBookingFilterInput | null,
  userID?: string | null,
};

export type OnDeleteBookingSubscription = {
  onDeleteBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type OnDeleteEventSubscriptionVariables = {
  filter?: ModelSubscriptionEventFilterInput | null,
};

export type OnDeleteEventSubscription = {
  onDeleteEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type OnDeleteUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  userID?: string | null,
};

export type OnDeleteUserProfileSubscription = {
  onDeleteUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};

export type OnUpdateBookingSubscriptionVariables = {
  filter?: ModelSubscriptionBookingFilterInput | null,
  userID?: string | null,
};

export type OnUpdateBookingSubscription = {
  onUpdateBooking?:  {
    __typename: "Booking",
    cancelledAt?: string | null,
    checkedIn?: boolean | null,
    checkedInAt?: string | null,
    createdAt?: string | null,
    event?:  {
      __typename: "Event",
      capacity?: number | null,
      category?: string | null,
      createdAt?: string | null,
      date: string,
      description?: string | null,
      id: string,
      imageUrl?: string | null,
      location?: string | null,
      organizerID: string,
      organizerName?: string | null,
      price?: number | null,
      publishedAt?: string | null,
      status?: string | null,
      title: string,
      updatedAt?: string | null,
    } | null,
    eventID: string,
    id: string,
    qrCode?: string | null,
    refundedAt?: string | null,
    status: string,
    ticketCount?: number | null,
    totalAmount?: number | null,
    updatedAt?: string | null,
    userEmail?: string | null,
    userID: string,
    userName?: string | null,
  } | null,
};

export type OnUpdateEventSubscriptionVariables = {
  filter?: ModelSubscriptionEventFilterInput | null,
};

export type OnUpdateEventSubscription = {
  onUpdateEvent?:  {
    __typename: "Event",
    bookings?:  {
      __typename: "ModelBookingConnection",
      nextToken?: string | null,
    } | null,
    capacity?: number | null,
    category?: string | null,
    createdAt?: string | null,
    date: string,
    description?: string | null,
    id: string,
    imageUrl?: string | null,
    location?: string | null,
    organizerID: string,
    organizerName?: string | null,
    price?: number | null,
    publishedAt?: string | null,
    status?: string | null,
    title: string,
    updatedAt?: string | null,
  } | null,
};

export type OnUpdateUserProfileSubscriptionVariables = {
  filter?: ModelSubscriptionUserProfileFilterInput | null,
  userID?: string | null,
};

export type OnUpdateUserProfileSubscription = {
  onUpdateUserProfile?:  {
    __typename: "UserProfile",
    avatarUrl?: string | null,
    bio?: string | null,
    createdAt?: string | null,
    email?: string | null,
    id: string,
    kycDocumentUrl?: string | null,
    kycStatus?: string | null,
    name?: string | null,
    phone?: string | null,
    role?: string | null,
    updatedAt?: string | null,
    userID: string,
  } | null,
};
