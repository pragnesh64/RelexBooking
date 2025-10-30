import { PostConfirmationTriggerHandler } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand } from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

/**
 * Post Confirmation Lambda Trigger
 * 
 * This function runs after a user confirms their email/signs up.
 * It automatically assigns new users to the "Pending" group,
 * which requires admin approval before they can use the app.
 * 
 * Alternative: Assign to "User" group directly for immediate access
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('Post Confirmation Trigger Event:', JSON.stringify(event, null, 2));

  const userPoolId = event.userPoolId;
  const username = event.userName;
  const defaultGroup = process.env.DEFAULT_GROUP || 'Pending'; // Can be "User" for immediate access

  try {
    // Add user to default group
    const command = new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username,
      GroupName: defaultGroup,
    });

    await cognitoClient.send(command);
    console.log(`Successfully added user ${username} to group ${defaultGroup}`);

    return event;
  } catch (error) {
    console.error('Error adding user to group:', error);
    // Don't fail signup if group assignment fails - log and continue
    return event;
  }
};

