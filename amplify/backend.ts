import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement, Effect, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { CfnUserPool, CfnUserPoolGroup } from 'aws-cdk-lib/aws-cognito';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { postConfirmation } from './functions/post-confirmation/resource';

/**
 * Backend Configuration
 *
 * Includes:
 * - Authentication (Cognito)
 * - Data (AppSync + DynamoDB)
 * - Storage (S3)
 * - Post Confirmation Lambda (auto role assignment)
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  postConfirmation,
});

// Get the underlying CFN User Pool resource
const cfnUserPool = backend.auth.resources.userPool.node.defaultChild as CfnUserPool;

// Add the post-confirmation Lambda trigger
cfnUserPool.lambdaConfig = {
  postConfirmation: backend.postConfirmation.resources.lambda.functionArn,
};

// Grant the Lambda permission to be invoked by Cognito
backend.postConfirmation.resources.lambda.addPermission('CognitoInvoke', {
  principal: new ServicePrincipal('cognito-idp.amazonaws.com'),
  sourceArn: backend.auth.resources.userPool.userPoolArn,
});

// Grant the Lambda permission to add users to Cognito groups
backend.postConfirmation.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'cognito-idp:AdminAddUserToGroup',
      'cognito-idp:GetGroup',
      'cognito-idp:CreateGroup',
    ],
    resources: [backend.auth.resources.userPool.userPoolArn],
  })
);

// Create Cognito User Pool Groups manually using CDK
// This avoids circular dependency while making groups available for data schema auth rules
const userPoolId = backend.auth.resources.userPool.userPoolId;

new CfnUserPoolGroup(backend.auth.resources.userPool, 'UserGroup', {
  userPoolId: userPoolId,
  groupName: 'User',
  description: 'Default users - can browse and book events',
});

new CfnUserPoolGroup(backend.auth.resources.userPool, 'OrganizerGroup', {
  userPoolId: userPoolId,
  groupName: 'Organizer',
  description: 'Event organizers - can create and manage events',
});

new CfnUserPoolGroup(backend.auth.resources.userPool, 'AdminGroup', {
  userPoolId: userPoolId,
  groupName: 'Admin',
  description: 'Administrators - can manage users and approve KYC',
});

new CfnUserPoolGroup(backend.auth.resources.userPool, 'SuperAdminGroup', {
  userPoolId: userPoolId,
  groupName: 'SuperAdmin',
  description: 'Super administrators - full system access',
});

export default backend;
