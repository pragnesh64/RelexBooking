/**
 * Add User to Cognito Group Script
 *
 * This script adds an existing Cognito user to a specified group.
 *
 * Usage:
 * tsx scripts/add-user-to-group.ts <USER_POOL_ID> <EMAIL> <GROUP_NAME>
 *
 * Example:
 * tsx scripts/add-user-to-group.ts ap-south-1_P4jbmDO0M prajapatipragnesh6464@gmail.com SuperAdmin
 */

import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});

async function getUserGroups(userPoolId: string, username: string): Promise<string[]> {
  try {
    const response = await client.send(new AdminListGroupsForUserCommand({
      UserPoolId: userPoolId,
      Username: username,
    }));
    return response.Groups?.map(g => g.GroupName || '') || [];
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
}

async function addUserToGroup(userPoolId: string, email: string, groupName: string) {
  console.log('\n🔐 Adding user to group...\n');
  console.log(`User Pool ID: ${userPoolId}`);
  console.log(`Email: ${email}`);
  console.log(`Group: ${groupName}\n`);

  try {
    // First, verify the user exists
    const userResponse = await client.send(new AdminGetUserCommand({
      UserPoolId: userPoolId,
      Username: email, // In this setup, username is the email
    }));

    const username = userResponse.Username;
    console.log(`✓ User found: ${username}`);

    // Check current groups
    const currentGroups = await getUserGroups(userPoolId, username!);
    if (currentGroups.length > 0) {
      console.log(`  Current groups: ${currentGroups.join(', ')}`);
    } else {
      console.log('  Current groups: None');
    }

    // Check if already in group
    if (currentGroups.includes(groupName)) {
      console.log(`\n⚠️  User is already in the "${groupName}" group!`);
      return;
    }

    // Add to group
    await client.send(new AdminAddUserToGroupCommand({
      UserPoolId: userPoolId,
      Username: username!,
      GroupName: groupName,
    }));

    console.log(`\n✅ Successfully added user to "${groupName}" group!`);

    // Show updated groups
    const updatedGroups = await getUserGroups(userPoolId, username!);
    console.log(`\nUpdated groups: ${updatedGroups.join(', ')}\n`);
  } catch (error: any) {
    if (error.name === 'UserNotFoundException') {
      console.error(`\n❌ Error: User with email "${email}" not found in the user pool.`);
      console.log('\nMake sure the user has signed up and confirmed their email.\n');
    } else if (error.name === 'ResourceNotFoundException') {
      console.error(`\n❌ Error: Group "${groupName}" not found.`);
      console.log('\nAvailable groups: User, Organizer, Admin, SuperAdmin');
      console.log('Run the setup-cognito-groups.ts script first to create groups.\n');
    } else {
      console.error('\n❌ Error:', error);
    }
    process.exit(1);
  }
}

// Main execution
const userPoolId = process.argv[2];
const email = process.argv[3];
const groupName = process.argv[4];

if (!userPoolId || !email || !groupName) {
  console.error('\n❌ Error: Missing required arguments\n');
  console.log('Usage: tsx scripts/add-user-to-group.ts <USER_POOL_ID> <EMAIL> <GROUP_NAME>\n');
  console.log('Example:');
  console.log('  tsx scripts/add-user-to-group.ts ap-south-1_P4jbmDO0M user@example.com SuperAdmin\n');
  console.log('Available groups: User, Organizer, Admin, SuperAdmin\n');
  process.exit(1);
}

addUserToGroup(userPoolId, email, groupName).catch(error => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
