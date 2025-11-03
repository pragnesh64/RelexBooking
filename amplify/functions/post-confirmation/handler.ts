import { PostConfirmationTriggerHandler } from 'aws-lambda';
import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  CreateGroupCommand,
  GetGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';

const cognitoClient = new CognitoIdentityProviderClient({});

// SuperAdmin email - automatically gets SuperAdmin role
const SUPERADMIN_EMAIL = 'prajapatipragnesh6464@gmail.com';

// Define all groups that should exist
const GROUPS = [
  { name: 'User', description: 'Default users - can browse and book events' },
  { name: 'Organizer', description: 'Event organizers - can create and manage events' },
  { name: 'Admin', description: 'Administrators - can manage users and approve KYC' },
  { name: 'SuperAdmin', description: 'Super administrators - full system access' },
];

/**
 * Ensures a Cognito group exists, creates it if it doesn't
 */
async function ensureGroupExists(userPoolId: string, groupName: string, description: string): Promise<void> {
  try {
    // Check if group exists
    await cognitoClient.send(new GetGroupCommand({
      UserPoolId: userPoolId,
      GroupName: groupName,
    }));
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      // Group doesn't exist, create it
      try {
        await cognitoClient.send(new CreateGroupCommand({
          UserPoolId: userPoolId,
          GroupName: groupName,
          Description: description,
        }));
        console.log(`✓ Created group ${groupName}`);
      } catch (createError) {
        console.error(`Failed to create group ${groupName}:`, createError);
        throw createError;
      }
    } else {
      throw error;
    }
  }
}

/**
 * Post Confirmation Lambda Trigger
 *
 * This function runs after a user confirms their email/signs up.
 * It automatically:
 * 1. Creates Cognito groups if they don't exist
 * 2. Assigns users to appropriate groups:
 *    - SuperAdmin: prajapatipragnesh6464@gmail.com
 *    - User: All other users (default)
 */
export const handler: PostConfirmationTriggerHandler = async (event) => {
  console.log('Post Confirmation Trigger Event:', JSON.stringify(event, null, 2));

  const userPoolId = event.userPoolId;
  const username = event.userName;
  const userEmail = event.request.userAttributes.email?.toLowerCase();

  try {
    // Ensure all groups exist (only creates them if they don't exist)
    for (const group of GROUPS) {
      await ensureGroupExists(userPoolId, group.name, group.description);
    }

    // Determine which group to assign
    let groupName = 'User'; // Default group

    // Check if this is the SuperAdmin email
    if (userEmail === SUPERADMIN_EMAIL.toLowerCase()) {
      groupName = 'SuperAdmin';
      console.log(`🔐 SuperAdmin detected: ${userEmail}`);
    }

    // Add user to appropriate group
    await cognitoClient.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username,
      GroupName: groupName,
    }));

    console.log(`✅ Successfully added user ${username} (${userEmail}) to group ${groupName}`);
    return event;
  } catch (error) {
    console.error('❌ Error in post-confirmation handler:', error);
    // Don't fail signup if group assignment fails - log and continue
    return event;
  }
};

