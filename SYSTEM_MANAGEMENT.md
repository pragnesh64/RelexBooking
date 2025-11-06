# 🎯 RelexBooking - Complete System Management Guide

**Version:** 1.0
**Last Updated:** November 2025
**Maintainer:** Pragnesh Prajapati

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Initial Setup](#initial-setup)
4. [User Management](#user-management)
5. [Event Management](#event-management)
6. [QR Ticketing System](#qr-ticketing-system)
7. [Payments & Transactions](#payments--transactions)
8. [File Storage Management](#file-storage-management)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Security Management](#security-management)
11. [Database Management](#database-management)
12. [Backup & Recovery](#backup--recovery)
13. [Scaling & Performance](#scaling--performance)
14. [Troubleshooting](#troubleshooting)
15. [Development Workflow](#development-workflow)
16. [CI/CD & Deployment](#cicd--deployment)
17. [Cost Management](#cost-management)
18. [Disaster Recovery](#disaster-recovery)

---

## System Overview

### What is RelexBooking?

RelexBooking is a comprehensive event booking and ticketing platform built on AWS Amplify with:
- **Event Management** - Create, manage, and publish events
- **Ticket Booking** - Secure booking with payment integration
- **QR Ticketing** - Generate and scan QR codes for entry
- **Role-Based Access** - User, Organizer, Admin, SuperAdmin roles
- **KYC Verification** - User verification for organizers
- **File Management** - Event images and documents storage
- **Analytics** - Real-time event and booking analytics

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- React Router v6 (routing)
- TailwindCSS (styling)
- html5-qrcode (QR scanning)

**Backend:**
- AWS Amplify Gen 2
- Amazon Cognito (authentication)
- AWS AppSync (GraphQL API)
- Amazon DynamoDB (database)
- Amazon S3 (file storage)
- AWS Lambda (business logic)

**Development:**
- Node.js 20+
- npm/npx
- TypeScript 5+
- ESLint + Prettier

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CloudFront (CDN)                        │
│                    https://relexbooking.com                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼──────┐          ┌──────▼──────┐
        │   Amplify    │          │   Amplify   │
        │   Hosting    │          │   Backend   │
        │  (Frontend)  │          │  Sandbox    │
        └──────────────┘          └──────┬──────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            ┌───────▼────────┐  ┌────────▼───────┐  ┌────────▼───────┐
            │   Cognito      │  │    AppSync     │  │      S3        │
            │  User Pools    │  │   (GraphQL)    │  │  File Storage  │
            │ Authentication │  │      API       │  │    (Images)    │
            └────────────────┘  └────────┬───────┘  └────────────────┘
                                         │
                                ┌────────▼────────┐
                                │   DynamoDB      │
                                │   (Database)    │
                                │  - Users        │
                                │  - Events       │
                                │  - Bookings     │
                                │  - KYC Data     │
                                └─────────────────┘
```

### Data Model

```
User
├── id (PK)
├── email
├── name
├── phoneNumber
├── groups: [User, Organizer, Admin, SuperAdmin]
├── kycStatus: [Pending, Approved, Rejected]
├── kycDocuments → S3
└── organizedEvents → [Event]

Event
├── id (PK)
├── title
├── description
├── date
├── location
├── capacity
├── ticketsAvailable
├── price
├── organizerID (FK → User)
├── organizerEmail
├── images → S3
├── status: [Draft, Published, Cancelled, Completed]
└── bookings → [Booking]

Booking
├── id (PK)
├── eventID (FK → Event)
├── userID (FK → User)
├── userName
├── userEmail
├── ticketCount
├── totalAmount
├── status: [Pending, Confirmed, Cancelled]
├── paymentStatus: [Pending, Completed, Failed]
├── checkedIn: boolean
├── checkedInAt: timestamp
├── qrCode: encrypted string
└── createdAt: timestamp

KYCRequest
├── id (PK)
├── userID (FK → User)
├── documentType: [Aadhar, PAN, Passport]
├── documentNumber
├── documentURL → S3
├── status: [Pending, Approved, Rejected]
├── reviewedBy: User (Admin)
├── reviewNotes
└── submittedAt: timestamp
```

---

## Initial Setup

### Prerequisites

```bash
# Check versions
node --version  # Should be 20+
npm --version   # Should be 10+
aws --version   # AWS CLI v2+
```

### Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/RelexBooking.git
cd RelexBooking
npm install
```

### Step 2: Configure AWS Credentials

```bash
# Option A: AWS CLI
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output: json

# Option B: Environment Variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

### Step 3: Deploy Backend (Sandbox)

```bash
# Start Amplify sandbox (development)
npx ampx sandbox

# Wait for:
# ✅ Sandbox deployed successfully
# ✅ GraphQL endpoint: https://xxxxx.appsync-api.us-east-1.amazonaws.com/graphql
# ✅ User Pool ID: us-east-1_xxxxxx
```

**Note:** Keep this terminal open - sandbox stays active

### Step 4: Setup Cognito Groups

```bash
# New terminal
# Copy User Pool ID from sandbox output

# Option A: Use script (recommended)
npx tsx scripts/setup-cognito-groups.ts <USER_POOL_ID>

# Option B: Manual via AWS Console
# 1. Go to https://console.aws.amazon.com/cognito
# 2. Select your User Pool
# 3. Navigate to Groups tab
# 4. Create groups:
#    - SuperAdmin (Precedence: 1)
#    - Admin (Precedence: 2)
#    - Organizer (Precedence: 3)
#    - User (Precedence: 4)
```

### Step 5: Start Frontend

```bash
# New terminal
npm run dev

# Opens at: http://localhost:5173
```

### Step 6: Create SuperAdmin Account

1. Navigate to http://localhost:5173/signup
2. Sign up with your email
3. Verify email (check inbox)
4. Sign in

**Add to SuperAdmin group:**
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <YOUR_EMAIL> \
  --group-name SuperAdmin
```

### Step 7: Verify Setup

After signing in:
- ✅ Dashboard loads
- ✅ "Admin" menu visible
- ✅ "Organizer" menu visible
- ✅ Can access `/admin`
- ✅ Can access `/organizer`
- ✅ Can access `/scan-ticket`

---

## User Management

### User Roles & Permissions

| Role | Permissions |
|------|------------|
| **User** | - View events<br>- Book tickets<br>- View own bookings<br>- Manage profile |
| **Organizer** | User permissions +<br>- Create events<br>- Manage own events<br>- View event bookings<br>- Scan tickets at events<br>- Requires KYC approval |
| **Admin** | Organizer permissions +<br>- Approve KYC requests<br>- View all users<br>- Manage user groups<br>- View system analytics |
| **SuperAdmin** | Admin permissions +<br>- Manage admins<br>- System configuration<br>- Full database access |

### Adding Users to Groups

**Via AWS CLI:**
```bash
# Add user to group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL> \
  --group-name <GROUP_NAME>

# Remove user from group
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL> \
  --group-name <GROUP_NAME>

# List user's groups
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL>
```

**Via Admin Dashboard:**
1. Login as Admin/SuperAdmin
2. Navigate to `/admin`
3. Click "User Management"
4. Select user
5. Click "Manage Groups"
6. Add/Remove groups

### KYC Approval Process

**For Users:**
1. User submits KYC request with documents
2. Documents uploaded to S3 (private bucket)
3. Admin notified of pending request

**For Admins:**
1. Navigate to `/admin/kyc-requests`
2. Review document:
   - View uploaded documents
   - Verify information
   - Check document authenticity
3. Actions:
   - **Approve**: User becomes Organizer
   - **Reject**: User stays as regular user
   - **Request More Info**: Ask for additional documents

**Approval Script (Bulk):**
```bash
# scripts/approve-kyc.ts
npx tsx scripts/approve-kyc.ts <USER_ID>
```

### Disabling Users

```bash
# Disable user account
aws cognito-idp admin-disable-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL>

# Enable user account
aws cognito-idp admin-enable-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL>

# Delete user (permanent)
aws cognito-idp admin-delete-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL>
```

### Password Reset (Admin)

```bash
# Force password reset
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username <USER_EMAIL> \
  --password <NEW_PASSWORD> \
  --permanent
```

---

## Event Management

### Event Lifecycle

```
Draft → Published → Active → Completed/Cancelled
  ↓         ↓          ↓           ↓
Edit    Bookings   Check-in    Archive
        Open       Active
```

### Creating Events (Organizer)

1. Navigate to `/organizer/create-event`
2. Fill details:
   - Title, Description
   - Date, Time, Location
   - Capacity, Price
   - Upload event images
3. Save as Draft or Publish
4. Published events appear in event listings

### Event States

| State | Description | Actions Available |
|-------|-------------|-------------------|
| **Draft** | Not visible to users | Edit, Publish, Delete |
| **Published** | Visible, bookings open | Edit (limited), Cancel |
| **Active** | Event date has passed | Check-in only |
| **Completed** | Event finished | View only, Archive |
| **Cancelled** | Event cancelled | Refund processing |

### Managing Event Capacity

**Auto-management:**
- Tickets available = capacity - confirmed bookings
- Real-time updates on booking
- Prevents overbooking

**Manual adjustments:**
```graphql
mutation UpdateEventCapacity {
  updateEvent(input: {
    id: "event-id"
    capacity: 500
  }) {
    id
    capacity
    ticketsAvailable
  }
}
```

### Event Analytics

**View stats:**
1. Navigate to `/organizer/events/:id`
2. Click "Analytics" tab
3. See:
   - Total bookings
   - Revenue generated
   - Check-in rate
   - Demographics
   - Booking timeline

**Export reports:**
```bash
npx tsx scripts/export-event-report.ts <EVENT_ID>
# Generates CSV with booking details
```

---

## QR Ticketing System

### How It Works

```
1. User books ticket
   ↓
2. System generates unique QR code
   - Contains: booking ID, user ID, event ID, signature
   - Encrypted with secret key
   ↓
3. User receives QR code
   - In booking confirmation
   - In email
   - Can download/print
   ↓
4. At event entrance:
   - Staff scans QR code
   - System validates:
     * QR signature
     * Booking exists
     * Event matches
     * Not already checked in
   ↓
5. Check-in successful
   - Booking marked as checkedIn
   - Entry granted
```

### QR Code Format

```typescript
// QR Code Payload (encrypted)
{
  bookingId: "booking-123",
  eventId: "event-456",
  userId: "user-789",
  ticketCount: 2,
  timestamp: 1699123456789,
  signature: "hmac-sha256-signature"
}
```

### Scanning Tickets

**Using Web App:**
1. Navigate to `/scan-ticket`
2. Click "Start Scanning"
3. Point camera at QR code
4. System validates and shows result:
   - ✅ Valid: User name, ticket count, check-in time
   - ❌ Invalid: Error reason

**Offline Mode (Coming Soon):**
- Download event bookings before event
- Scan offline
- Sync check-ins when back online

### QR Code Security

- **Encrypted payload**: AES-256 encryption
- **HMAC signature**: Prevents tampering
- **One-time use**: Can't reuse after check-in
- **Time-bound**: Expires after event
- **Event-specific**: Can't use for different events

### Troubleshooting QR Scans

**Issue: QR code not scanning**
```bash
# Check booking status
npx tsx scripts/check-booking.ts <BOOKING_ID>

# Regenerate QR code
npx tsx scripts/regenerate-qr.ts <BOOKING_ID>
```

**Issue: Already checked in**
```bash
# View check-in history
npx tsx scripts/check-in-history.ts <EVENT_ID>

# Undo check-in (if mistake)
npx tsx scripts/undo-check-in.ts <BOOKING_ID>
```

---

## Payments & Transactions

### Payment Flow

```
1. User selects tickets
   ↓
2. Calculates total amount
   ↓
3. Redirects to payment gateway
   ↓
4. Payment processed
   ↓
5. Webhook receives confirmation
   ↓
6. Booking status → Confirmed
   ↓
7. Generate QR code
   ↓
8. Send confirmation email
```

### Payment Integration

**Current Setup:** Ready for integration (Stripe/Razorpay)

**To integrate Stripe:**
```bash
# Install Stripe
npm install stripe @stripe/stripe-js

# Add environment variables
VITE_STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx  # Backend only
```

**Payment webhook:**
```typescript
// amplify/functions/payment-webhook/handler.ts
export const handler = async (event) => {
  const { bookingId, status, amount, transactionId } = JSON.parse(event.body);

  if (status === 'success') {
    // Update booking
    await updateBooking(bookingId, {
      paymentStatus: 'Completed',
      status: 'Confirmed',
      transactionId
    });

    // Generate QR code
    await generateQRCode(bookingId);

    // Send email
    await sendConfirmationEmail(bookingId);
  }

  return { statusCode: 200 };
};
```

### Refund Processing

**Via Admin Dashboard:**
1. Navigate to `/admin/bookings`
2. Find booking
3. Click "Issue Refund"
4. Select refund amount (full/partial)
5. Confirm

**Via Script:**
```bash
npx tsx scripts/process-refund.ts <BOOKING_ID> [--amount=100]
```

### Transaction Reports

**Generate reports:**
```bash
# Daily transactions
npx tsx scripts/reports/daily-transactions.ts 2025-11-06

# Monthly summary
npx tsx scripts/reports/monthly-summary.ts 2025-11

# Export to CSV
npx tsx scripts/reports/export-transactions.ts \
  --start=2025-11-01 \
  --end=2025-11-30 \
  --output=transactions.csv
```

---

## File Storage Management

### S3 Bucket Structure

```
relexbooking-storage-[env]/
├── public/
│   ├── events/
│   │   ├── event-123/
│   │   │   ├── cover.jpg
│   │   │   ├── gallery/
│   │   │   │   ├── img1.jpg
│   │   │   │   └── img2.jpg
│   │   └── event-456/
│   └── profiles/
│       └── user-789.jpg
└── private/
    └── kyc/
        └── user-789/
            ├── aadhar-front.jpg
            ├── aadhar-back.jpg
            └── pan.jpg
```

### Upload Limits

- **Event images**: 5MB per file, max 10 files
- **Profile pictures**: 2MB per file
- **KYC documents**: 10MB per file
- **Allowed formats**: JPG, PNG, PDF

### Managing Storage

**View storage usage:**
```bash
aws s3 ls s3://relexbooking-storage-dev/ --recursive --human-readable --summarize
```

**Clean up old files:**
```bash
# Delete files older than 90 days
npx tsx scripts/cleanup-storage.ts --days=90 --dry-run

# Actually delete
npx tsx scripts/cleanup-storage.ts --days=90
```

**S3 Lifecycle Policies:**
```json
{
  "Rules": [
    {
      "Id": "DeleteOldKYCDocuments",
      "Status": "Enabled",
      "Prefix": "private/kyc/",
      "Expiration": {
        "Days": 365
      }
    },
    {
      "Id": "TransitionOldEvents",
      "Status": "Enabled",
      "Prefix": "public/events/",
      "Transitions": [
        {
          "Days": 180,
          "StorageClass": "GLACIER"
        }
      ]
    }
  ]
}
```

---

## Monitoring & Analytics

### CloudWatch Dashboards

**Create custom dashboard:**
1. Go to CloudWatch Console
2. Create Dashboard: "RelexBooking-Production"
3. Add widgets:
   - API Request Count (AppSync)
   - Error Rate (Lambda)
   - DynamoDB Read/Write Units
   - S3 Storage Size
   - Cognito User Count

### Key Metrics to Monitor

| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| API Error Rate | < 1% | 1-5% | > 5% |
| Lambda Duration | < 1s | 1-3s | > 3s |
| DynamoDB Throttles | 0 | 1-10/hr | > 10/hr |
| Storage Growth | < 10GB/day | 10-50GB/day | > 50GB/day |
| Active Users | - | - | - |

### Setting Up Alarms

```bash
# High error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name RelexBooking-HighErrorRate \
  --alarm-description "Alert when API error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/AppSync \
  --statistic Average \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Application Logs

**View logs:**
```bash
# API logs
aws logs tail /aws/appsync/apis/[API_ID] --follow

# Lambda logs
aws logs tail /aws/lambda/[FUNCTION_NAME] --follow

# Filter for errors
aws logs filter-log-events \
  --log-group-name /aws/appsync/apis/[API_ID] \
  --filter-pattern "ERROR"
```

### Analytics Dashboard

**User Analytics:**
- Total users
- New signups (daily/weekly/monthly)
- Active users
- User retention rate
- Geographic distribution

**Event Analytics:**
- Total events
- Events by category
- Average attendance
- Popular venues
- Peak booking times

**Revenue Analytics:**
- Total revenue
- Revenue by event
- Average ticket price
- Revenue trends
- Refund rate

**Access analytics:**
1. Navigate to `/admin/analytics`
2. Select date range
3. View charts and metrics
4. Export reports

---

## Security Management

### Security Checklist

**Authentication:**
- [x] Cognito User Pools configured
- [x] MFA available (optional for users)
- [x] Password policy enforced
- [x] Account lockout after failed attempts
- [x] Email verification required

**Authorization:**
- [x] Role-based access control (RBAC)
- [x] AppSync @auth directives
- [x] API Gateway authorizers
- [x] Client-side route guards

**Data Protection:**
- [x] Encryption at rest (DynamoDB, S3)
- [x] Encryption in transit (HTTPS/TLS)
- [x] Private S3 buckets for sensitive data
- [x] Signed URLs for file access

**Network Security:**
- [ ] WAF rules configured
- [ ] DDoS protection (CloudFront)
- [ ] VPC for Lambda functions
- [ ] Security groups configured

**Monitoring:**
- [ ] CloudWatch alarms set up
- [ ] CloudTrail logging enabled
- [ ] GuardDuty enabled
- [ ] Security Hub configured

### Security Incident Response

**If breach detected:**

1. **Immediate Actions:**
   ```bash
   # Disable affected users
   aws cognito-idp admin-disable-user \
     --user-pool-id <USER_POOL_ID> \
     --username <USER_EMAIL>

   # Revoke all sessions
   aws cognito-idp admin-user-global-sign-out \
     --user-pool-id <USER_POOL_ID> \
     --username <USER_EMAIL>

   # Rotate API keys
   npx tsx scripts/rotate-api-keys.ts
   ```

2. **Investigation:**
   ```bash
   # Check CloudTrail logs
   aws cloudtrail lookup-events \
     --lookup-attributes AttributeKey=Username,AttributeValue=<USER_EMAIL> \
     --max-results 50

   # Check access logs
   aws logs filter-log-events \
     --log-group-name /aws/appsync/apis/[API_ID] \
     --filter-pattern "<USER_EMAIL>"
   ```

3. **Recovery:**
   - Force password reset for all users
   - Review and update security policies
   - Patch vulnerabilities
   - Notify affected users

4. **Post-Incident:**
   - Document incident
   - Update security procedures
   - Conduct security audit
   - Train team on new procedures

### Regular Security Tasks

**Daily:**
- Review CloudWatch alarms
- Check for suspicious login attempts
- Monitor API error rates

**Weekly:**
- Review IAM policies
- Check for unused access keys
- Audit user permissions

**Monthly:**
- Security vulnerability scan
- Review CloudTrail logs
- Update dependencies
- Review backup integrity

**Quarterly:**
- Penetration testing
- Security training
- Policy review
- Disaster recovery drill

---

## Database Management

### DynamoDB Tables

| Table | Purpose | Indexes |
|-------|---------|---------|
| User | User accounts | email, groups |
| Event | Events | organizerID, status, date |
| Booking | Bookings | userID, eventID, status |
| KYCRequest | KYC submissions | userID, status |

### Backup Strategy

**Automated Backups:**
```bash
# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name User \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Enable for all tables
for table in User Event Booking KYCRequest; do
  aws dynamodb update-continuous-backups \
    --table-name $table \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
done
```

**Manual Backups:**
```bash
# Create on-demand backup
aws dynamodb create-backup \
  --table-name User \
  --backup-name User-$(date +%Y%m%d)
```

### Data Exports

**Export table data:**
```bash
# Export to S3
npx tsx scripts/export-table.ts User --output=users.json

# Export specific date range
npx tsx scripts/export-table.ts Booking \
  --from=2025-11-01 \
  --to=2025-11-30 \
  --output=bookings-nov.csv
```

### Database Maintenance

**Cleanup old data:**
```bash
# Delete old bookings (> 2 years)
npx tsx scripts/cleanup-old-bookings.ts --days=730 --dry-run

# Archive old events
npx tsx scripts/archive-old-events.ts --days=365
```

**Optimize queries:**
1. Review slow queries in CloudWatch
2. Check for missing indexes
3. Add secondary indexes if needed
4. Update query patterns

---

## Backup & Recovery

### Backup Schedule

| Component | Frequency | Retention | Method |
|-----------|-----------|-----------|--------|
| DynamoDB | Continuous | 35 days | PITR |
| DynamoDB | Daily | 90 days | Snapshots |
| S3 Files | Continuous | 90 days | Versioning |
| Code | Every commit | Permanent | Git |
| Config | Weekly | 30 days | Parameter Store |

### Full System Backup

```bash
# Backup everything
npx tsx scripts/full-backup.ts

# Creates:
# - DynamoDB snapshots
# - S3 bucket sync
# - Configuration export
# - User pool export
```

### Restore from Backup

**DynamoDB Restore:**
```bash
# Restore specific table
aws dynamodb restore-table-from-backup \
  --target-table-name User-restored \
  --backup-arn arn:aws:dynamodb:...:backup/User/...

# Restore to point in time
aws dynamodb restore-table-to-point-in-time \
  --source-table-name User \
  --target-table-name User-restored \
  --restore-date-time 2025-11-05T12:00:00Z
```

**S3 Restore:**
```bash
# Restore specific file version
aws s3api get-object \
  --bucket relexbooking-storage \
  --key events/event-123/cover.jpg \
  --version-id [VERSION_ID] \
  --output-file cover-restored.jpg
```

### Testing Backups

**Monthly backup test:**
```bash
# 1. Restore to test environment
npx tsx scripts/restore-to-test.ts --backup-date=2025-11-01

# 2. Verify data integrity
npx tsx scripts/verify-backup.ts --environment=test

# 3. Test application functionality
npm run test:e2e -- --env=test

# 4. Cleanup test environment
npx tsx scripts/cleanup-test-env.ts
```

---

## Scaling & Performance

### Current Capacity

**DynamoDB:**
- Read Capacity: Auto-scaling (min 5, max 100)
- Write Capacity: Auto-scaling (min 5, max 100)

**Lambda:**
- Concurrent Executions: 1000 (account limit)
- Memory: 1024 MB per function
- Timeout: 30 seconds

**S3:**
- Unlimited storage
- Request rate: 3,500 PUT/POST/DELETE, 5,500 GET/HEAD per second

### Scaling Triggers

**Auto-scale when:**
- DynamoDB read/write utilization > 70%
- Lambda concurrent executions > 800
- API latency > 2 seconds

**Manual scaling:**
```bash
# Increase DynamoDB capacity
aws dynamodb update-table \
  --table-name Event \
  --provisioned-throughput ReadCapacityUnits=100,WriteCapacityUnits=50

# Increase Lambda concurrency
aws lambda put-function-concurrency \
  --function-name booking-processor \
  --reserved-concurrent-executions 500
```

### Performance Optimization

**Database:**
- Use indexes for frequent queries
- Implement caching (ElastiCache)
- Batch operations when possible
- Use DynamoDB Accelerator (DAX) for hot data

**API:**
- Enable AppSync caching
- Implement pagination
- Use DataLoader for batching
- Compress responses

**Frontend:**
- Code splitting
- Lazy loading
- Image optimization
- CDN caching

**Monitoring performance:**
```bash
# Check API latency
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppSync \
  --metric-name Latency \
  --dimensions Name=GraphQLAPIId,Value=[API_ID] \
  --statistics Average \
  --start-time 2025-11-06T00:00:00Z \
  --end-time 2025-11-06T23:59:59Z \
  --period 3600
```

---

## Troubleshooting

### Common Issues

#### Issue: Backend not deploying

**Symptoms:** `npx ampx sandbox` fails

**Solutions:**
```bash
# 1. Check AWS credentials
aws sts get-caller-identity

# 2. Clear Amplify cache
rm -rf .amplify node_modules package-lock.json
npm install

# 3. Check for TypeScript errors
npm run build

# 4. Reset sandbox
npx ampx sandbox delete
npx ampx sandbox
```

#### Issue: Users can't sign in

**Symptoms:** Login fails with "User not found" or "Incorrect password"

**Solutions:**
```bash
# 1. Check if user exists
aws cognito-idp admin-get-user \
  --user-pool-id <USER_POOL_ID> \
  --username <EMAIL>

# 2. Check if email is verified
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username <EMAIL> \
  --password <TEMP_PASSWORD> \
  --permanent

# 3. Check Cognito User Pool settings
aws cognito-idp describe-user-pool \
  --user-pool-id <USER_POOL_ID>
```

#### Issue: QR scanner not working

**Symptoms:** Camera doesn't start or QR codes won't scan

**Solutions:**
```bash
# 1. Check browser permissions (Chrome)
# chrome://settings/content/camera

# 2. Use HTTPS (required for camera access)
# Add to vite.config.ts:
server: {
  https: true,
  host: true
}

# 3. Check html5-qrcode version
npm list html5-qrcode

# 4. Clear browser cache
# Ctrl+Shift+Delete
```

#### Issue: Files not uploading

**Symptoms:** Upload fails or times out

**Solutions:**
```bash
# 1. Check S3 bucket permissions
aws s3api get-bucket-policy --bucket relexbooking-storage-dev

# 2. Check CORS configuration
aws s3api get-bucket-cors --bucket relexbooking-storage-dev

# 3. Check file size
# Max size: 5MB for event images, 10MB for KYC

# 4. Check S3 bucket quota
aws s3 ls s3://relexbooking-storage-dev/ --recursive --summarize
```

#### Issue: High API latency

**Symptoms:** Slow page loads, timeout errors

**Solutions:**
```bash
# 1. Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/AppSync \
  --metric-name Latency \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# 2. Enable AppSync caching
# In AppSync Console: Caching > Enable

# 3. Check for N+1 queries
# Use DataLoader pattern

# 4. Check DynamoDB throttling
aws dynamodb describe-table --table-name Event | grep Throttle
```

### Debug Mode

**Enable debug logging:**
```bash
# Frontend
VITE_DEBUG=true npm run dev

# View logs in browser console

# Backend
aws logs tail /aws/lambda/[FUNCTION_NAME] --follow --format short
```

### Getting Help

1. **Check documentation**: `START_HERE.md`, `SECURITY.md`, this file
2. **Check logs**: CloudWatch, browser console
3. **GitHub Issues**: Open issue with logs and steps to reproduce
4. **AWS Support**: For infrastructure issues

---

## Development Workflow

### Branching Strategy

```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name
fix/bug-name
hotfix/critical-fix
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/payment-integration

# 2. Make changes and commit
git add .
git commit -m "feat: add Stripe payment integration"

# 3. Push to remote
git push origin feature/payment-integration

# 4. Create pull request
# On GitHub: compare feature/payment-integration → develop

# 5. After review and approval, merge
# Squash and merge or merge commit

# 6. Deploy to staging
npx ampx pipeline deploy --branch develop

# 7. Test in staging
npm run test:staging

# 8. Merge to main
git checkout main
git merge develop
git push origin main

# 9. Deploy to production
npx ampx pipeline deploy --branch main
```

### Code Review Checklist

- [ ] Code follows style guide (ESLint, Prettier)
- [ ] All tests pass
- [ ] No console.logs or debug code
- [ ] TypeScript errors resolved
- [ ] Security best practices followed
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] Database migrations tested
- [ ] API changes backward compatible

### Testing

**Run tests:**
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

**Write tests:**
```typescript
// Component test
import { render, screen } from '@testing-library/react';
import { EventCard } from './EventCard';

test('renders event details', () => {
  const event = { title: 'Test Event', date: '2025-12-01' };
  render(<EventCard event={event} />);
  expect(screen.getByText('Test Event')).toBeInTheDocument();
});

// API test
import { apiClient } from '@/lib/apiClient';

test('fetches events successfully', async () => {
  const events = await apiClient.get('/api/events');
  expect(events).toHaveLength(10);
});
```

---

## CI/CD & Deployment

### Deployment Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | feature/* | localhost:5173 | Local development |
| Staging | develop | staging.relexbooking.com | Testing |
| Production | main | relexbooking.com | Live site |

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Deploy to Amplify
        run: |
          npx ampx pipeline deploy \
            --branch ${{ github.ref_name }} \
            --app-id ${{ secrets.AMPLIFY_APP_ID }}
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Manual Deployment

**Deploy frontend:**
```bash
# Build
npm run build

# Deploy to Amplify Hosting
npx ampx pipeline deploy --branch main

# Or deploy to custom hosting
aws s3 sync dist/ s3://my-hosting-bucket/
aws cloudfront create-invalidation \
  --distribution-id [DISTRIBUTION_ID] \
  --paths "/*"
```

**Deploy backend:**
```bash
# Deploy to cloud
npx ampx pipeline deploy --branch main

# Sandbox (development)
npx ampx sandbox
```

### Deployment Checklist

**Before deployment:**
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Backup created
- [ ] Staging tested
- [ ] Documentation updated
- [ ] Change log updated

**After deployment:**
- [ ] Smoke tests pass
- [ ] Monitor for errors
- [ ] Check key metrics
- [ ] Verify critical features
- [ ] Notify team

**Rollback plan:**
```bash
# Rollback frontend
npx ampx pipeline rollback --version [PREVIOUS_VERSION]

# Rollback database
aws dynamodb restore-table-to-point-in-time \
  --source-table-name Event \
  --target-table-name Event \
  --restore-date-time [TIMESTAMP]
```

---

## Cost Management

### Cost Breakdown (Estimated)

**Monthly costs for 10,000 users:**

| Service | Usage | Cost |
|---------|-------|------|
| Amplify Hosting | 50GB transfer | $0.15/GB = $7.50 |
| Cognito | 10,000 MAUs | Free (< 50,000) |
| AppSync | 1M requests | $4/M = $4 |
| DynamoDB | 10GB storage, on-demand | $2.50/GB = $25 |
| S3 | 100GB storage | $0.023/GB = $2.30 |
| Lambda | 1M invocations | Free (< 1M) |
| CloudFront | 100GB transfer | $0.085/GB = $8.50 |
| **Total** | | **~$47.30/month** |

**At scale (100,000 users):**
- Estimated: $300-500/month
- Add: ElastiCache ($50/month)
- Add: RDS backup ($20/month)

### Cost Optimization

**DynamoDB:**
```bash
# Switch to on-demand pricing for variable workloads
aws dynamodb update-table \
  --table-name Event \
  --billing-mode PAY_PER_REQUEST

# Or use provisioned with auto-scaling for predictable workloads
aws dynamodb update-table \
  --table-name Event \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

**S3:**
```bash
# Enable intelligent tiering
aws s3api put-bucket-intelligent-tiering-configuration \
  --bucket relexbooking-storage \
  --id IntelligentTieringConfig \
  --intelligent-tiering-configuration '...'

# Set lifecycle policy (move old files to Glacier)
aws s3api put-bucket-lifecycle-configuration \
  --bucket relexbooking-storage \
  --lifecycle-configuration file://lifecycle.json
```

**Lambda:**
- Right-size memory allocation
- Use reserved concurrency
- Enable X-Ray only when debugging

**CloudFront:**
- Increase cache TTL
- Enable compression
- Use origin shield for high traffic

### Cost Monitoring

```bash
# Set up billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name HighBillingAlert \
  --alarm-description "Alert when estimated charges exceed $100" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1

# View current costs
aws ce get-cost-and-usage \
  --time-period Start=2025-11-01,End=2025-11-30 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=SERVICE
```

---

## Disaster Recovery

### Recovery Time Objective (RTO)

| Component | RTO | RPO |
|-----------|-----|-----|
| Frontend | < 30 min | 0 |
| Backend API | < 1 hour | < 5 min |
| Database | < 2 hours | < 1 hour |
| File Storage | < 1 hour | < 24 hours |

### Disaster Scenarios

#### Scenario 1: Region Failure

**Impact:** All AWS services in region unavailable

**Recovery:**
```bash
# 1. Activate backup region
export AWS_REGION=us-west-2

# 2. Restore DynamoDB tables from backup
for table in User Event Booking; do
  aws dynamodb restore-table-from-backup \
    --target-table-name $table \
    --backup-arn [BACKUP_ARN] \
    --region us-west-2
done

# 3. Sync S3 from backup
aws s3 sync s3://relexbooking-storage-backup/ \
  s3://relexbooking-storage-west/ \
  --region us-west-2

# 4. Deploy backend
npx ampx pipeline deploy --branch main --region us-west-2

# 5. Update DNS (Route 53)
aws route53 change-resource-record-sets \
  --hosted-zone-id [ZONE_ID] \
  --change-batch file://dns-failover.json

# 6. Verify services
npx tsx scripts/verify-services.ts --region us-west-2
```

#### Scenario 2: Data Corruption

**Impact:** Invalid data in database

**Recovery:**
```bash
# 1. Identify affected tables/items
npx tsx scripts/identify-corruption.ts

# 2. Stop writes to affected resources
aws dynamodb update-table \
  --table-name Event \
  --billing-mode PROVISIONED \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=0

# 3. Restore from point-in-time backup
aws dynamodb restore-table-to-point-in-time \
  --source-table-name Event \
  --target-table-name Event-temp \
  --restore-date-time [LAST_GOOD_TIMESTAMP]

# 4. Verify restored data
npx tsx scripts/verify-data.ts --table Event-temp

# 5. Swap tables
npx tsx scripts/swap-tables.ts Event Event-temp

# 6. Resume normal operations
aws dynamodb update-table \
  --table-name Event \
  --billing-mode PAY_PER_REQUEST
```

#### Scenario 3: Security Breach

**Impact:** Unauthorized access to system

**Response:**
```bash
# 1. Immediate lockdown
# Disable all API access
aws appsync update-api \
  --api-id [API_ID] \
  --authentication-type AWS_IAM

# 2. Force logout all users
npx tsx scripts/force-logout-all.ts

# 3. Rotate all credentials
npx tsx scripts/rotate-credentials.ts

# 4. Review access logs
aws cloudtrail lookup-events \
  --max-results 1000 \
  --output json > security-audit.json

# 5. Identify compromised accounts
npx tsx scripts/analyze-breach.ts --input security-audit.json

# 6. Disable compromised accounts
npx tsx scripts/disable-accounts.ts --list compromised.txt

# 7. Restore from clean backup
# (Follow Scenario 2 steps)

# 8. Re-enable services with new credentials
# Update all environment variables
# Deploy with new configuration

# 9. Notify affected users
npx tsx scripts/notify-breach.ts --template security-breach
```

### DR Testing

**Quarterly DR drill:**
```bash
# 1. Schedule maintenance window
# 2. Execute DR scenario
npx tsx scripts/dr-drill.ts --scenario region-failure

# 3. Measure metrics
# - Time to detect
# - Time to activate backup
# - Time to full recovery
# - Data loss (if any)

# 4. Document lessons learned
# 5. Update DR procedures
```

---

## Appendix

### Useful Scripts

All scripts located in `scripts/` directory:

| Script | Purpose |
|--------|---------|
| `setup-cognito-groups.ts` | Create Cognito user groups |
| `approve-kyc.ts` | Bulk approve KYC requests |
| `check-booking.ts` | Verify booking status |
| `regenerate-qr.ts` | Regenerate QR code |
| `export-table.ts` | Export DynamoDB table to JSON/CSV |
| `cleanup-storage.ts` | Delete old S3 files |
| `full-backup.ts` | Complete system backup |
| `verify-backup.ts` | Verify backup integrity |
| `process-refund.ts` | Issue refund for booking |
| `rotate-credentials.ts` | Rotate API keys and secrets |

### Environment Variables

```bash
# Frontend (.env)
VITE_API_URL=https://api.relexbooking.com
VITE_S3_BUCKET=relexbooking-storage
VITE_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxx
VITE_APP_CLIENT_ID=xxxxxxxxxxxxx
VITE_DEBUG=false

# Backend (AWS Systems Manager Parameter Store)
/relexbooking/prod/database/connection
/relexbooking/prod/stripe/secret_key
/relexbooking/prod/qr/encryption_key
/relexbooking/prod/email/smtp_password
```

### Contact & Support

**Technical Issues:**
- GitHub Issues: https://github.com/yourusername/RelexBooking/issues
- Email: tech@relexbooking.com

**Security Issues:**
- Security email: security@relexbooking.com
- DO NOT post security issues publicly

**Business Inquiries:**
- Email: contact@relexbooking.com

---

## Changelog

### Version 1.0 (November 2025)
- Initial system deployment
- Core features: Events, Bookings, QR Ticketing
- User roles and permissions
- KYC verification system
- Admin dashboard

### Planned Features (Q1 2026)
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API webhooks
- [ ] Third-party integrations

---

**Document Version:** 1.0
**Last Updated:** November 6, 2025
**Maintained By:** RelexBooking Team
