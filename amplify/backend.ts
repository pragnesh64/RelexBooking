import { defineBackend } from '@aws-amplify/backend';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { postConfirmation } from './functions/post-confirmation/resource';
import { checkInBooking } from './functions/check-in-booking/resource';

/**
 * Backend Configuration
 *
 * Includes:
 * - Authentication (Cognito with User Pool Groups)
 * - Data (AppSync + DynamoDB)
 * - Storage (S3)
 * - Post Confirmation Lambda (auto role assignment)
 * - Check-in Lambda (atomic ticket check-in with conditional updates)
 *
 * Note: The postConfirmation function is assigned to the auth stack and
 * Amplify automatically handles the Lambda trigger configuration and permissions.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  postConfirmation,
  checkInBooking,
});

// Grant check-in Lambda permission to update DynamoDB Booking table
const bookingTableName = backend.data.resources.tables['Booking'].tableName;

backend.checkInBooking.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      'dynamodb:UpdateItem',
      'dynamodb:GetItem',
    ],
    resources: [
      backend.data.resources.tables['Booking'].tableArn,
    ],
  })
);

// Set the actual table name as environment variable
backend.checkInBooking.addEnvironment('BOOKING_TABLE_NAME', bookingTableName);

export default backend;
