import { defineFunction } from '@aws-amplify/backend';
import { auth } from '../auth/resource';

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
  environmentVariables: {
    DEFAULT_GROUP: 'Pending', // Change to "User" for immediate access
  },
});

// Attach to auth Post Confirmation trigger
auth.resources.userPool.addTrigger('PostConfirmation', postConfirmation);
