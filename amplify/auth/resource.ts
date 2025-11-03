import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from '../functions/post-confirmation/resource';

/**
 * Define and configure your auth resource with Cognito Groups support
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 *
 * Groups defined below:
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
  // Define Cognito groups for authorization
  groups: {
    User: {
      description: 'Default users - can browse and book events',
    },
    Organizer: {
      description: 'Event organizers - can create and manage events',
    },
    Admin: {
      description: 'Administrators - can manage users and approve KYC',
    },
    SuperAdmin: {
      description: 'Super administrators - full system access',
    },
  },
  // Post-confirmation trigger to add users to groups
  triggers: {
    postConfirmation,
  },
  // Grant permissions to the function
  access: (allow) => [
    allow.resource(postConfirmation).to(['addUserToGroup']),
  ],
});
