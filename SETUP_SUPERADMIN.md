# 🔐 SuperAdmin Setup Guide

## Automatic SuperAdmin Assignment

Your email **`prajapatipragnesh6464@gmail.com`** is configured to automatically become **SuperAdmin** when you sign up!

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Deploy Backend & Create Groups

```bash
# Start Amplify sandbox
npx ampx sandbox

# Wait for deployment to complete (2-5 minutes)
# You'll see: ✅ Sandbox deployed successfully
```

### Step 2: Create Cognito Groups

**Option A: Using AWS Console (Recommended)**

1. Go to **AWS Console** → **Amazon Cognito**
2. Select your User Pool (starts with `relexBookingAuth-`)
3. Go to **Groups** tab
4. Click **Create group** for each:
   - `SuperAdmin` (Precedence: 1)
   - `Admin` (Precedence: 2)
   - `Organizer` (Precedence: 3)
   - `User` (Precedence: 4)

**Option B: Using Script**

```bash
# Install AWS SDK if needed
npm install @aws-sdk/client-cognito-identity-provider

# Get your User Pool ID from Amplify outputs
# Look for it in the sandbox terminal output or AWS Console

# Run setup script
npx tsx scripts/setup-cognito-groups.ts <YOUR_USER_POOL_ID>
```

### Step 3: Sign Up with Your Email

```bash
# Start frontend
npm run dev

# Open browser at http://localhost:5173
```

1. Click **Sign Up**
2. Enter:
   - **Email**: `prajapatipragnesh6464@gmail.com`
   - **Password**: Your secure password
   - **Name**: Pragnesh Prajapati (or your preferred name)
3. Click **Sign Up**
4. Check your email for verification code
5. Enter the code on the verification page
6. **Done!** You're now a SuperAdmin! 🎉

---

## ✅ Verification

### Check Your Role:

After signing in, you should see:
- ✅ "Admin" link in the sidebar
- ✅ "Scan Ticket" link (Organizer access)
- ✅ "Organizer" link
- ✅ All user features

### Test SuperAdmin Access:

1. Navigate to `/admin`
2. You should see the Admin Dashboard
3. Try accessing `/organizer` - should work
4. Try accessing `/scan-ticket` - should work

---

## 🔧 How It Works

### Post-Confirmation Lambda

When you verify your email, the Lambda function:

```typescript
// In amplify/functions/post-confirmation/handler.ts

const SUPERADMIN_EMAIL = 'prajapatipragnesh6464@gmail.com';

if (userEmail === SUPERADMIN_EMAIL) {
  groupName = 'SuperAdmin'; // ← Automatic SuperAdmin
} else {
  groupName = 'User'; // ← Everyone else gets User
}
```

### Group Assignment Flow:

```
Sign Up → Email Verification → Post-Confirmation Trigger
    ↓
Check email === 'prajapatipragnesh6464@gmail.com'?
    ↓                           ↓
   YES                         NO
    ↓                           ↓
Add to SuperAdmin Group    Add to User Group
    ↓                           ↓
SuperAdmin Access          Regular User Access
```

---

## 👥 Other Users

### Regular Users:
- **Email**: Any other email
- **Default Role**: User
- **Can do**: Browse events, book tickets
- **Cannot do**: Create events, scan tickets, access admin

### Promote to Organizer:
1. User signs up normally
2. Submits KYC request (to be implemented)
3. You (SuperAdmin) approve via `/admin`
4. User becomes Organizer

### Promote to Admin:
1. Go to `/admin` → User Management
2. Find the user
3. Click "Promote" → Select "Admin"
4. User gets Admin access

---

## 🐛 Troubleshooting

### Problem: Not Automatically SuperAdmin

**Check 1: Email Spelling**
- Make sure you signed up with **exactly**: `prajapatipragnesh6464@gmail.com`
- Check for typos, spaces, or capital letters

**Check 2: Groups Exist**
- Go to AWS Console → Cognito → Your User Pool → Groups
- Verify "SuperAdmin" group exists

**Check 3: Lambda Logs**
```bash
# Check CloudWatch Logs
# Look for: "🔐 SuperAdmin detected: prajapatipragnesh6464@gmail.com"
```

**Manual Fix:**
1. Go to AWS Console → Cognito
2. Select your User Pool
3. Go to Users → Find your user
4. Click on user → Groups tab
5. Click "Add user to group"
6. Select "SuperAdmin"
7. Refresh your app

### Problem: "Unauthorized" When Accessing Admin

**Solution 1: Sign Out and Back In**
```
Settings → Sign Out → Sign In Again
```

**Solution 2: Check Cognito Group**
- Verify you're in "SuperAdmin" group in Cognito Console

**Solution 3: Clear Browser Cache**
```
Chrome: Ctrl+Shift+Delete → Clear cache
Safari: Cmd+Option+E
```

### Problem: Groups Don't Exist

**Solution: Create Manually**
1. AWS Console → Cognito → User Pool
2. Groups tab → Create group
3. Create all 4 groups (SuperAdmin, Admin, Organizer, User)

**Or Run Script:**
```bash
npx tsx scripts/setup-cognito-groups.ts <USER_POOL_ID>
```

---

## 🔒 Security Notes

### SuperAdmin Email Hardcoded:
- ✅ Only **one** email gets automatic SuperAdmin
- ✅ Configured in Lambda function (secure)
- ✅ Cannot be changed without redeploying backend

### To Add More SuperAdmins:
```typescript
// Edit: amplify/functions/post-confirmation/handler.ts

const SUPERADMIN_EMAILS = [
  'prajapatipragnesh6464@gmail.com',
  'another-superadmin@example.com',
];

if (SUPERADMIN_EMAILS.includes(userEmail)) {
  groupName = 'SuperAdmin';
}
```

### To Remove SuperAdmin:
1. AWS Console → Cognito → User Pool
2. Users → Your user
3. Groups tab → Remove from "SuperAdmin"
4. Add to appropriate group (Admin, Organizer, or User)

---

## 📊 Group Precedence

Lower number = Higher priority:

| Group | Precedence | Description |
|-------|-----------|-------------|
| SuperAdmin | 1 | Full system access |
| Admin | 2 | User & KYC management |
| Organizer | 3 | Create & manage events |
| User | 4 | Browse & book events |

---

## 🎯 Next Steps After Setup

1. ✅ Sign up as SuperAdmin
2. ✅ Verify email
3. ✅ Sign in and test admin access
4. ✅ Create a test event (as Organizer)
5. ✅ Create a regular user account (different email)
6. ✅ Book an event with regular user
7. ✅ Scan the QR code (as SuperAdmin)
8. ✅ Promote the test user to Organizer (via Admin panel)

---

## 🚀 Production Deployment

When deploying to production:

```bash
# Deploy to AWS
npx ampx deploy --branch main

# After deployment:
1. Create Cognito groups (via Console or script)
2. Sign up with prajapatipragnesh6464@gmail.com
3. Automatic SuperAdmin access ✅
```

---

## 📞 Support

**If you encounter issues:**

1. **Check Lambda Logs**: CloudWatch → Log Groups → /aws/lambda/post-confirmation
2. **Check Cognito**: Verify groups exist and user is assigned
3. **Check Auth**: Sign out and back in to refresh tokens

**Common Log Messages:**
- `🔐 SuperAdmin detected: prajapatipragnesh6464@gmail.com` ← Success!
- `✅ Successfully added user ... to group SuperAdmin` ← Working!
- `❌ Error adding user to group` ← Check if group exists

---

**You're all set! Sign up and enjoy SuperAdmin access! 🎉**
