import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'relexBookingStorage',
  access: (allow) => ({
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    'protected/{entity_id}/*': [
      allow.authenticated.to(['read']),
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete'])
    ],
    // Event images - public read, organizers can write
    'events/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write'])
    ],
    // KYC documents - private, only owner and admins can read
    'kyc/*': [
      allow.authenticated.to(['read', 'write']),
      allow.groups(['Admin', 'SuperAdmin']).to(['read'])
    ],
  })
});
