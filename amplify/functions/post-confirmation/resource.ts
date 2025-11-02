import { defineFunction } from '@aws-amplify/backend';

/**
 * Post Confirmation Lambda Function
 *
 * Automatically assigns new users to Cognito groups after signup:
 * - SuperAdmin: prajapatipragnesh6464@gmail.com (automatic)
 * - User: All other users (default)
 *
 * The function checks the user's email and assigns the appropriate group.
 */
export const postConfirmation = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
});
