import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from '../functions/post-confirmation/resource';

/**
 * Define and configure your auth resource with Cognito Groups support
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * Groups will be created dynamically by the post-confirmation Lambda:
 * - User (default for new signups)
 * - Organizer (can create/manage events)
 * - Admin (can moderate events, manage users)
 * - SuperAdmin (full access)
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  // Enable account recovery
  accountRecovery: 'EMAIL_ONLY',
  // Post-confirmation trigger to add users to groups
  triggers: {
    postConfirmation,
  },
  // Grant permissions to the function
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
  ],
});
