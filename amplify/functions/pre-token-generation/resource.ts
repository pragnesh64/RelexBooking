import { defineFunction } from '@aws-amplify/backend';

/**
 * Pre Token Generation Lambda Function
 *
 * Injects fine-grained permissions into Cognito ID tokens during authentication.
 * This Lambda is triggered BEFORE token generation and adds custom claims to tokens.
 *
 * Functionality:
 * - Reads user's Cognito groups (User, Organizer, Admin, SuperAdmin)
 * - Maps groups to permissions using ROLE_PERMISSIONS
 * - Adds 'custom:permissions' claim to ID token
 * - Frontend reads permissions for UI/UX and access control
 *
 * Configuration:
 * - Timeout: 10 seconds (fast operation, doesn't need 30s)
 * - Memory: 256 MB (lightweight permission mapping)
 * - Resource Group: 'auth' (to avoid circular dependencies)
 *
 * IMPORTANT:
 * - This Lambda must be configured as Cognito trigger in auth/resource.ts
 * - Keep ROLE_PERMISSIONS in sync with src/types/permissions.ts
 * - Backend MUST validate permissions independently
 */
export const preTokenGeneration = defineFunction({
  name: 'preTokenGeneration',
  entry: './handler.ts',
  timeoutSeconds: 10,
  memoryMB: 256,
  resourceGroupName: 'auth',
});
