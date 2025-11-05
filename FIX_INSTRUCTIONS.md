# Fix: DynamoDB Table Not Found Error

## Problem
The Event creation fails with "DynamoDB:ResourceNotFoundException" because the DynamoDB table doesn't exist or isn't properly connected to AppSync.

## Root Cause
Using `npx ampx sandbox --once` doesn't properly manage persistent resources like DynamoDB tables in development.

## Solution Steps

### Step 1: Clear Browser Data
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Under **Storage**, click **Clear site data**
4. OR manually:
   - Clear **Local Storage** → `https://localhost:5173`
   - Clear **Session Storage**
   - Clear **Cookies** for localhost

### Step 2: Stop Any Running Sandbox
```bash
# Find and kill any running amplify sandbox processes
pkill -f "ampx sandbox"
```

### Step 3: Start Persistent Sandbox (Choose One)

**Option A: Start Sandbox and Keep It Running** (Recommended for Development)
```bash
npx ampx sandbox
```
This will:
- Create and manage DynamoDB tables
- Keep them running while you develop
- Auto-update on schema changes
- Press Ctrl+C to stop when done

**Option B: Deploy Once (For Testing Only)**
```bash
npx ampx sandbox --once --outputs-out-dir ./
```

### Step 4: Verify amplify_outputs.json
Check that the file has the correct backend URL:
```bash
cat amplify_outputs.json | grep "user_pool_id"
```
Should show: `ap-south-1_ZgQvCae8v`

### Step 5: Restart Dev Server
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

### Step 6: Test Event Creation
1. Go to http://localhost:5173
2. **Sign out** if logged in
3. **Sign in** again (to get fresh JWT token)
4. Navigate to `/organizer`
5. Click "Create Event"
6. Fill the form and submit

## Alternative: Use AWS Console to Check Table

1. Go to [DynamoDB Console](https://ap-south-1.console.aws.amazon.com/dynamodbv2/home?region=ap-south-1#tables)
2. Look for tables starting with `Event-` or containing "pragnesh-sandbox"
3. If no tables exist, the sandbox needs to create them

## Important Notes

- **For Development**: Always use `npx ampx sandbox` (without --once)
- **For CI/CD**: Use `npx ampx sandbox --once`
- **After Schema Changes**: The sandbox auto-deploys, wait for completion
- **Token Expiry**: JWT tokens expire after 1 hour - sign in again if needed

## Check User Group

Your JWT shows you're in **"Organizer"** group. To become SuperAdmin:

### AWS Console Method:
1. [Cognito Console](https://ap-south-1.console.aws.amazon.com/cognito/v2/home?region=ap-south-1)
2. User Pool: `ap-south-1_ZgQvCae8v`
3. Users → Your email
4. "Add user to group" → Select "SuperAdmin"

### AWS CLI Method:
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-south-1_ZgQvCae8v \
  --username prajapatipragnesh6464@gmail.com \
  --group-name SuperAdmin \
  --region ap-south-1
```

After adding to SuperAdmin group, **sign out and sign in** to get updated JWT token.

## Debugging Tips

### Check JWT Token Groups
Look at your access token in browser DevTools → Application → Local Storage
```javascript
// Decode the JWT token manually
const token = "your-jwt-token";
JSON.parse(atob(token.split('.')[1]));
```
Should see `"cognito:groups": ["SuperAdmin"]` or `["Organizer"]`

### Check API Endpoint
```bash
curl https://i33umv4fevdy3drap7v64htozy.appsync-api.ap-south-1.amazonaws.com/graphql \
  -H "x-api-key: da2-eutogulxijf5pg4zdf234g6pue" \
  -H "Content-Type: application/json" \
  --data '{"query": "{ __typename }"}'
```
Should return `{"data":{"__typename":"Query"}}`

### Verify Schema Deployment
```bash
cat amplify_outputs.json | jq '.data.model_introspection.models.Event'
```
Should show Event model with all fields

## If Still Not Working

### Nuclear Option: Full Reset
```bash
# 1. Delete CloudFormation stack
npx ampx sandbox delete

# 2. Clean local files
rm -rf .amplify amplify_outputs.json node_modules/.cache

# 3. Reinstall dependencies
npm install

# 4. Start fresh sandbox
npx ampx sandbox

# 5. In browser: Clear all data and sign in again
```

## Success Criteria

✅ Sandbox shows "Deployment completed"
✅ amplify_outputs.json updated with latest timestamp
✅ Browser local storage cleared
✅ Signed out and signed in with fresh token
✅ Can see Events page without errors
✅ Can open Create Event modal
✅ Event creation succeeds (no DynamoDB error)
✅ New event appears in events list
