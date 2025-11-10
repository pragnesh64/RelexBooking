import { defineFunction } from '@aws-amplify/backend';

export const checkInBooking = defineFunction({
  name: 'check-in-booking',
  entry: './handler.ts',
  environment: {
    // This will be set by the backend configuration
    BOOKING_TABLE_NAME: 'Booking',
  },
  timeoutSeconds: 10,
  runtime: 20, // Node.js 20
});
