import { defineFunction } from '@aws-amplify/backend';

/**
 * Post Confirmation Lambda Function
 *
 * Automatically assigns new users to Cognito groups after signup.
 * Default: Assigns to "Pending" group (requires admin approval)
 *
 * To change: Set DEFAULT_GROUP environment variable to "User" for immediate access
 */
export const postConfirmation = defineFunction({
  name: 'post-confirmation',
  entry: './handler.ts',
  environment: {
    DEFAULT_GROUP: 'Pending', // Change to "User" for immediate access
  },
});
