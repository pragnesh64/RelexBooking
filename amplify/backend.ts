import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { postConfirmation } from './functions/post-confirmation/resource';

/**
 * Backend Configuration
 *
 * Includes:
 * - Authentication (Cognito with User Pool Groups)
 * - Data (AppSync + DynamoDB)
 * - Storage (S3)
 * - Post Confirmation Lambda (auto role assignment)
 *
 * Note: The postConfirmation function is assigned to the auth stack and
 * Amplify automatically handles the Lambda trigger configuration and permissions.
 *
 * Check-in Lambda has been removed to avoid build issues with AWS SDK bundling.
 * Using enhanced client-side protection with re-fetch verification instead.
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  postConfirmation,
});

export default backend;
