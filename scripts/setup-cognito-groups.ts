/**
 * Setup Cognito Groups Script
 *
 * This script creates the required Cognito groups for role-based access control.
 * Run this after deploying your Amplify backend.
 *
 * Usage:
 * 1. Deploy backend: npx ampx sandbox (or npx ampx deploy)
 * 2. Get User Pool ID from Amplify outputs
 * 3. Run: tsx scripts/setup-cognito-groups.ts <USER_POOL_ID>
 */

import {
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  GetGroupCommand,
  ListGroupsCommand
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient({});

const GROUPS = [
  {
    name: 'User',
    description: 'Default user role - can browse events and create bookings',
    precedence: 4,
  },
  {
    name: 'Organizer',
    description: 'Event organizers - can create and manage events',
    precedence: 3,
  },
  {
    name: 'Admin',
    description: 'Administrators - can manage users and approve KYC',
    precedence: 2,
  },
  {
    name: 'SuperAdmin',
    description: 'Super administrators - full system access',
    precedence: 1,
  },
];

async function groupExists(userPoolId: string, groupName: string): Promise<boolean> {
  try {
    await client.send(new GetGroupCommand({
      UserPoolId: userPoolId,
      GroupName: groupName,
    }));
    return true;
  } catch {
    return false;
  }
}

async function createGroup(userPoolId: string, group: typeof GROUPS[0]) {
  try {
    const exists = await groupExists(userPoolId, group.name);

    if (exists) {
      console.log(`✓ Group "${group.name}" already exists`);
      return;
    }

    await client.send(new CreateGroupCommand({
      UserPoolId: userPoolId,
      GroupName: group.name,
      Description: group.description,
      Precedence: group.precedence,
    }));

    console.log(`✓ Created group "${group.name}" (precedence: ${group.precedence})`);
  } catch (error) {
    console.error(`✗ Failed to create group "${group.name}":`, error);
  }
}

async function setupGroups(userPoolId: string) {
  console.log('\n🔐 Setting up Cognito Groups...\n');
  console.log(`User Pool ID: ${userPoolId}\n`);

  // Create all groups
  for (const group of GROUPS) {
    await createGroup(userPoolId, group);
  }

  // List all groups
  console.log('\n📋 Current Groups:');
  const listResponse = await client.send(new ListGroupsCommand({
    UserPoolId: userPoolId,
  }));

  if (listResponse.Groups) {
    listResponse.Groups.forEach(group => {
      console.log(`  - ${group.GroupName} (precedence: ${group.Precedence})`);
    });
  }

  console.log('\n✅ Setup complete!\n');
  console.log('Next steps:');
  console.log('1. Sign up with email: prajapatipragnesh6464@gmail.com');
  console.log('2. You will automatically become SuperAdmin');
  console.log('3. Other users will be assigned to "User" group by default\n');
}

// Main execution
const userPoolId = process.argv[2];

if (!userPoolId) {
  console.error('\n❌ Error: User Pool ID is required\n');
  console.log('Usage: tsx scripts/setup-cognito-groups.ts <USER_POOL_ID>\n');
  console.log('To find your User Pool ID:');
  console.log('1. Run: npx ampx sandbox (or check AWS Console)');
  console.log('2. Look for "User Pool ID" in the output');
  console.log('3. Or check amplify_outputs.json after deployment\n');
  process.exit(1);
}

setupGroups(userPoolId).catch(error => {
  console.error('\n❌ Error setting up groups:', error);
  process.exit(1);
});
