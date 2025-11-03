import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

// SuperAdmin email - automatically gets SuperAdmin role
const SUPERADMIN_EMAIL = 'prajapatipragnesh6464@gmail.com';

/**
 * Post Confirmation Lambda Trigger
 *
 * This function runs after a user confirms their email/signs up.
 * It automatically assigns users to appropriate Cognito groups:
 * - SuperAdmin: prajapatipragnesh6464@gmail.com
 * - User: All other users (default)
 *
 * Note: Groups are created by auth/resource.ts configuration
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('Post Confirmation Trigger Event:', JSON.stringify(event, null, 2));

  const userPoolId = event.userPoolId;
  const username = event.userName;
  const userEmail = event.request.userAttributes.email?.toLowerCase();

  // Determine which group to assign
  let groupName = 'User'; // Default group

  // Check if this is the SuperAdmin email
  if (userEmail === SUPERADMIN_EMAIL.toLowerCase()) {
    groupName = 'SuperAdmin';
    console.log(`🔐 SuperAdmin detected: ${userEmail}`);
  }

  try {
    // Add user to appropriate group
    const command = new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username,
      GroupName: groupName,
    });

    await cognitoClient.send(command);
    console.log(`✅ Successfully added user ${username} (${userEmail}) to group ${groupName}`);

    return event;
  } catch (error) {
    console.error('❌ Error adding user to group:', error);
    // Don't fail signup if group assignment fails - log and continue
    return event;
  }
};

