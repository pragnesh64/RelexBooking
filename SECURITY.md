# Security Best Practices - RelexBooking

This document outlines the security architecture and best practices implemented in the RelexBooking application.

## Authentication & Authorization Architecture

### AWS Amplify + Cognito

We use **AWS Amplify** with **Amazon Cognito User Pools** for managed authentication:

- **Access Tokens**: Short-lived (1 hour), stored in memory by Amplify SDK
- **Refresh Tokens**: Long-lived, managed by AWS (httpOnly cookies in production)
- **ID Tokens**: Contains user claims including Cognito groups
- **Token Refresh**: Automatic via `fetchAuthSession()` - Amplify handles this

### Token Storage

✅ **SECURE (Current Implementation)**:
- Tokens stored by Amplify SDK (secure storage on native, memory/sessionStorage for web)
- Access tokens kept in memory ref (`accessTokenRef`) to minimize exposure
- No manual localStorage usage for sensitive tokens

❌ **INSECURE (Avoid)**:
- Storing tokens in localStorage manually
- Storing refresh tokens client-side
- Exposing tokens in URL parameters

## Role-Based Access Control (RBAC)

### Cognito Groups

User roles implemented via Cognito User Pool Groups:
- `User` - Regular attendees
- `Organizer` - Event organizers (create events, scan tickets)
- `Admin` - System administrators
- `SuperAdmin` - Full access
- `Pending` - Unverified users

Groups are attached to users in Cognito and appear in token claims as `cognito:groups`.

### Client-Side Guards

**Purpose**: UX convenience only - NOT security enforcement

Components:
- `ProtectedRoute` - Requires authentication
- `RequireRole` - Requires specific Cognito groups
- `GuestOnly` - Prevents authenticated users from accessing login pages

**IMPORTANT**: These guards improve UX but DO NOT provide security. Attackers can bypass client-side checks.

### Server-Side Enforcement

✅ **REQUIRED for Security**:

1. **AppSync GraphQL** - Use `@auth` directives:
   ```graphql
   type Booking @model @auth(rules: [
     { allow: owner },
     { allow: groups, groups: ["Admin", "Organizer"] }
   ]) {
     id: ID!
     # ...
   }
   ```

2. **API Gateway** - Configure Cognito Authorizer:
   - Validates JWT signature
   - Checks expiration
   - Provides claims to Lambda

3. **Lambda Functions** - Validate groups from context:
   ```js
   const groups = event.requestContext.authorizer.claims['cognito:groups'];
   if (!groups.includes('Admin')) {
     return { statusCode: 403, body: 'Forbidden' };
   }
   ```

## Token Refresh Flow

```
1. User authenticated → Access token issued (1 hour TTL)
2. API call → Attach Bearer token
3. Token expires → fetchAuthSession() refreshes automatically
4. Refresh fails → User redirected to login
```

### Multi-Tab Synchronization

We use Amplify Hub to sync auth state across tabs:

```ts
Hub.listen('auth', ({ payload }) => {
  switch (payload.event) {
    case 'signedIn':     // User logged in
    case 'signedOut':    // User logged out
    case 'tokenRefresh': // Token refreshed
  }
});
```

This ensures that signing out in one tab logs out all tabs.

## API Security

### REST API Calls

Use the provided `apiClient` utility:

```ts
import { apiClient } from '@/lib/apiClient';

// Automatically attaches Bearer token
const events = await apiClient.get('/api/events');
```

### GraphQL (AppSync)

Amplify client automatically attaches tokens:

```ts
import { generateClient } from 'aws-amplify/api';

const client = generateClient();
const result = await client.graphql({ query: listEvents });
```

## Common Vulnerabilities & Mitigations

### 1. XSS (Cross-Site Scripting)

**Risk**: Attacker injects malicious scripts to steal tokens

**Mitigation**:
- ✅ React escapes content by default
- ✅ Avoid `dangerouslySetInnerHTML`
- ✅ Use Content Security Policy (CSP) headers
- ✅ Sanitize user input before rendering

### 2. CSRF (Cross-Site Request Forgery)

**Risk**: Attacker tricks user into making unauthorized requests

**Mitigation**:
- ✅ Use `SameSite=Strict` for cookies
- ✅ Verify origin headers on server
- ✅ Use CSRF tokens for state-changing operations
- ✅ Amplify uses CORS properly configured

### 3. Token Theft

**Risk**: Attacker steals access/refresh tokens

**Mitigation**:
- ✅ Tokens stored by Amplify SDK (not manually in localStorage)
- ✅ Access tokens short-lived (1 hour)
- ✅ Refresh tokens httpOnly (production)
- ✅ Use HTTPS only in production
- ⚠️ Consider additional MFA for admin roles

### 4. Replay Attacks

**Risk**: Attacker reuses stolen tokens

**Mitigation**:
- ✅ Short-lived access tokens
- ✅ Token rotation on refresh
- ✅ Cognito device tracking (optional)
- ⚠️ Consider implementing nonce/timestamp validation for critical operations

### 5. Privilege Escalation

**Risk**: User gains unauthorized access to admin features

**Mitigation**:
- ✅ Server-side group validation (AppSync @auth, API Gateway)
- ✅ Principle of least privilege for IAM roles
- ✅ Audit logs for sensitive operations
- ⚠️ Regular access reviews

## Security Checklist

### Application Level

- [x] Client-side route guards for UX
- [x] Server-side authorization via AppSync @auth
- [x] API Gateway Cognito authorizer configured
- [x] Tokens stored securely via Amplify SDK
- [x] HTTPS enforced in production
- [x] Hub listener for auth state sync
- [ ] Content Security Policy (CSP) headers
- [ ] MFA enabled for admin roles
- [ ] Rate limiting on sensitive endpoints
- [ ] Audit logging for check-ins and admin actions

### Infrastructure Level

- [x] Cognito User Pool configured
- [x] Password policy enforced (min length, complexity)
- [x] IAM roles with least privilege
- [ ] CloudWatch alarms for auth failures
- [ ] VPC for Lambda functions (if needed)
- [ ] Secrets Manager for sensitive config
- [ ] DDoS protection via CloudFront
- [ ] WAF rules for API Gateway

### Development Practices

- [x] No secrets in git repository
- [x] Environment variables for config
- [ ] Security code review process
- [ ] Dependency scanning (npm audit, Snyk)
- [ ] SAST/DAST in CI/CD pipeline
- [ ] Penetration testing before major releases

## Incident Response

### If Credentials Compromised

1. **Immediate**:
   - Revoke user sessions in Cognito
   - Rotate API keys and secrets
   - Review CloudWatch logs for suspicious activity

2. **Short-term**:
   - Force password reset for affected users
   - Investigate scope of breach
   - Notify affected users

3. **Long-term**:
   - Review and strengthen security controls
   - Update incident response plan
   - Consider security audit

### Monitoring & Alerting

Set up CloudWatch alarms for:
- Failed login attempts (> 10/minute)
- Token refresh failures spike
- 403 errors spike (unauthorized access attempts)
- Unusual API call patterns

## Testing

### Security Testing

1. **Authentication Flows**:
   ```bash
   npm run test:auth
   ```
   - Test login/logout
   - Test token refresh
   - Test multi-tab sync

2. **Authorization Tests**:
   - Test role-based route access
   - Test API endpoint permissions
   - Test GraphQL @auth directives

3. **E2E Security Tests**:
   ```bash
   npm run test:e2e:security
   ```
   - Test XSS protection
   - Test CSRF protection
   - Test unauthorized access attempts

## Resources

- [AWS Amplify Security Best Practices](https://docs.amplify.aws/lib/auth/security/q/platform/js/)
- [Cognito User Pool Security](https://docs.aws.amazon.com/cognito/latest/developerguide/security.html)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Contact

For security concerns or to report vulnerabilities:
- Email: security@relexbooking.com
- Use GitHub Security Advisories (private disclosure)

**DO NOT** post security issues publicly on GitHub Issues.
