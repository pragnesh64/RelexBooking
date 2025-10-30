# 📊 How to Check Your Database (DynamoDB)

Your RelexBooking project uses **AWS DynamoDB** tables created by Amplify Gen2. Here are multiple ways to check/view your database:

## 🔍 Method 1: AWS Console - DynamoDB (Recommended)

### Step 1: Find Your Table Names
1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **CloudFormation** → Find your Amplify stack
3. Look for DynamoDB table resources (names like `Event-xxxxx`, `Booking-xxxxx`)

### Step 2: View Tables Directly
1. Go to **DynamoDB** service in AWS Console
2. Select your region: **ap-south-1** (Mumbai)
3. Click **Tables** in the left sidebar
4. Find tables with names like:
   - `Event-<some-id>`
   - `Booking-<some-id>`
   - `UserProfile-<some-id>`

### Step 3: View Data
- Click on a table name
- Click **Explore table items** tab
- View all records in the table

## 🔍 Method 2: AWS AppSync Console (GraphQL Explorer)

1. Go to [AWS AppSync Console](https://console.aws.amazon.com/appsync/)
2. Select your region: **ap-south-1**
3. Find your API (it should match the URL in `amplify_outputs.json`)
4. Click **Queries** in the left sidebar
5. Use GraphQL queries to fetch data:

```graphql
# Query all events
query ListEvents {
  listEvents {
    items {
      id
      title
      description
      date
      location
      price
      organizerID
      status
    }
  }
}

# Query all bookings
query ListBookings {
  listBookings {
    items {
      id
      eventID
      userID
      status
      ticketCount
      totalAmount
    }
  }
}
```

## 🔍 Method 3: AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Navigate to **Backend** → **Data** section
4. View your GraphQL schema and test queries

## 🔍 Method 4: Using AWS CLI

```bash
# List all DynamoDB tables
aws dynamodb list-tables --region ap-south-1

# Scan a specific table (replace TABLE_NAME)
aws dynamodb scan --table-name Event-xxxxx --region ap-south-1

# Get table details
aws dynamodb describe-table --table-name Event-xxxxx --region ap-south-1
```

## 🔍 Method 5: Using Your App's GraphQL Client

You can query from your React app:

```typescript
import { getAmplifyClient } from '@/lib/amplifyClient';

const client = getAmplifyClient();
if (client) {
  const { data } = await client.models.Event.list();
  console.log('Events:', data);
}
```

## 📋 Quick Reference

- **Region**: `ap-south-1` (Mumbai)
- **GraphQL API URL**: `https://wueasew45nf45l26r5ik4bhelq.appsync-api.ap-south-1.amazonaws.com/graphql`
- **API Key**: Found in `amplify_outputs.json` (for public access)

## 🛠️ Current Tables (Based on Schema)

Your schema defines these tables:
1. **Event** - Stores event information
2. **Booking** - Stores booking records
3. **UserProfile** - Stores extended user profiles

## ⚠️ Note

If you haven't deployed yet, run:
```bash
npx ampx sandbox
```

This will create the DynamoDB tables in your AWS account.

