# 🚀 RelexBooking - Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- AWS account with Amplify CLI configured
- Git installed

---

## 1️⃣ Setup & Installation (First Time)

### Clone & Install:
```bash
cd /Users/pragnesh/Downloads/Code/AWS/Amplify/RelexBooking

# Install dependencies
npm install
```

### Start Amplify Backend:
```bash
# Start sandbox environment
npx ampx sandbox

# Wait for resources to deploy (2-5 minutes)
# You'll see: ✅ Sandbox deployed successfully
```

### Start Frontend:
```bash
# In a new terminal
npm run dev

# App will open at http://localhost:5173
```

---

## 2️⃣ Create Your First Admin User

### Option A: Via AWS Console (Recommended)
1. Go to **AWS Console** → **Cognito**
2. Find your User Pool (named: `relexBookingAuth-*`)
3. Go to **Groups** → **Create Group**:
   - Create these groups: `User`, `Organizer`, `Admin`, `SuperAdmin`
4. Go to **Users** → Sign up via app first
5. Select your user → **Add to Group** → `Admin`

### Option B: Automatic (Post-Setup)
- Promote users via Admin Dashboard once you have at least one admin

---

## 3️⃣ Testing the Complete Flow

### As a **User**:

1. **Sign Up**
   ```
   Navigate to: http://localhost:5173/signup
   - Enter email, password, name
   - Verify email with code sent to inbox
   ```

2. **Browse Events**
   ```
   Navigate to: /events
   - View all published events
   - Click on event for details
   ```

3. **Book an Event**
   ```
   From event detail page:
   - Click "Book Now"
   - Select ticket quantity
   - Enter payment details (demo mode - any values work)
   - Click "Pay Now"
   - Wait for confirmation
   ```

4. **View Ticket with QR Code**
   ```
   Navigate to: /bookings
   - Click on your booking
   - See QR code displayed
   - Click "Download Ticket"
   ```

### As an **Organizer**:

1. **Get Promoted to Organizer**
   ```
   Option A: Request via KYC (to be implemented)
   Option B: Admin promotes you manually
   ```

2. **Create an Event**
   ```
   Navigate to: /organizer
   - Fill event details:
     * Title: "Summer Music Festival"
     * Date: Future date
     * Location: "Central Park"
     * Price: 50.00
     * Capacity: 100
     * Category: "Music"
     * Description: "Amazing event!"
   - Click "Create Event"
   ```

3. **Scan Tickets at Event**
   ```
   Navigate to: /scan-ticket
   - Click "Start Scanning"
   - Allow camera access
   - Point camera at QR code
   - See check-in confirmation
   ```

### As an **Admin**:

1. **Access Admin Dashboard**
   ```
   Navigate to: /admin
   - View system metrics
   - See total users, events, revenue
   ```

2. **Manage Users**
   ```
   Go to "User Management" tab
   - Search for users
   - View user details
   - Click "Promote" to upgrade roles
   ```

3. **Approve KYC Requests**
   ```
   Go to "KYC Requests" tab
   - View pending applications
   - Click "View Documents"
   - Click "Approve" or "Reject"
   ```

---

## 4️⃣ Testing QR Code System

### Generate Test QR Code:
1. Create a booking (as User)
2. Go to `/bookings/:id`
3. Screenshot the QR code OR download it

### Test Scanner:
1. Log in as Organizer or Admin
2. Navigate to `/scan-ticket`
3. Click "Start Scanning"
4. Hold up the QR code (printed or on another device)
5. See check-in confirmation

### Expected Results:
- ✅ First scan: Success + attendee details shown
- ❌ Second scan: Error "Already checked in"
- ❌ Wrong event: Error "Event ID mismatch"

---

## 5️⃣ Common Scenarios to Test

### Scenario 1: Complete Booking Flow
```
User signs up → Verifies email → Browses events → Books ticket
→ Receives QR code → Downloads ticket → Attends event
→ Organizer scans QR → Marked as checked in
```

### Scenario 2: Event Management
```
Request organizer role → Admin approves → Create event
→ User books tickets → View booking list → Manage attendees
→ Scan tickets at entrance
```

### Scenario 3: Admin Operations
```
Admin logs in → Views metrics → Finds user → Promotes to organizer
→ Reviews KYC documents → Approves application → User becomes organizer
```

---

## 6️⃣ Verify Everything Works

### Checklist:
- [ ] User can sign up and verify email
- [ ] User can browse and view events
- [ ] User can book an event and see QR code
- [ ] User can download QR code as image
- [ ] Organizer can create events
- [ ] Organizer can scan QR codes
- [ ] QR validation works (prevents duplicate scans)
- [ ] Admin can view dashboard metrics
- [ ] Admin can search and manage users
- [ ] Admin can view KYC requests
- [ ] Dark mode toggle works
- [ ] Responsive design on mobile
- [ ] Protected routes redirect properly

---

## 7️⃣ Deploy to Production

### Deploy Backend:
```bash
# Deploy to AWS cloud
npx ampx deploy --branch main

# Wait for deployment (5-10 minutes)
```

### Deploy Frontend:

**Option A: Amplify Hosting**
```bash
# Connect to Amplify Console
# Push to Git, auto-deploys
```

**Option B: Vercel**
```bash
npm run build
# Upload dist/ to Vercel
```

**Option C: S3 + CloudFront**
```bash
npm run build
# Upload dist/ to S3
# Configure CloudFront distribution
```

---

## 8️⃣ Troubleshooting

### Backend Issues:

**Problem**: "Amplify client not configured"
```bash
# Re-generate Amplify config
npx ampx generate outputs
```

**Problem**: DynamoDB table not found
```bash
# Restart sandbox
npx ampx sandbox delete
npx ampx sandbox
```

### Frontend Issues:

**Problem**: Camera not working for QR scanner
- **Solution**: Use HTTPS (required for camera API)
- **Dev**: Create SSL cert or use ngrok
- **Prod**: Amplify/Vercel provide HTTPS automatically

**Problem**: QR code not displaying
- **Check**: Booking status is "confirmed" not "pending"
- **Check**: Browser console for errors

**Problem**: Can't access admin routes
- **Solution**: Ensure user is in "Admin" Cognito group

### Permission Issues:

**Problem**: "Access Denied" errors
- **Check**: Cognito groups are created
- **Check**: User is in correct group
- **Check**: Authorization rules in `amplify/data/resource.ts`

---

## 9️⃣ Environment Variables

Create `.env` file (optional, Amplify generates config):
```env
# Usually not needed - Amplify auto-configures
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_AWS_APP_CLIENT_ID=xxxxxxxxxxxxxxxxxx
```

---

## 🔟 Demo Data (Optional)

### Seed Test Data:

**Create Test Events** (via Organizer page):
```javascript
Events to create:
1. Summer Music Festival - $50 - Music
2. Tech Conference 2024 - $100 - Conference
3. Food & Wine Festival - $75 - Food
4. Startup Pitch Night - $25 - Networking
5. Marathon 2024 - $30 - Sports
```

**Create Test Users**:
```
User 1: user@test.com (User role)
User 2: organizer@test.com (Organizer role)
User 3: admin@test.com (Admin role)
```

---

## 💡 Quick Tips

### For Development:
- Use `npx ampx sandbox` for local development
- Keep sandbox running while developing
- Changes to Amplify config require sandbox restart
- Frontend HMR works without restarting

### For Testing:
- Use Chrome DevTools device mode for mobile testing
- Test QR scanner with physical device for best results
- Use Incognito mode to test as different users
- Check CloudWatch logs for backend errors

### For Production:
- Use `npx ampx deploy` to deploy to cloud
- Set up CI/CD with GitHub Actions
- Enable CloudWatch monitoring
- Set up alerts for errors

---

## 📱 Mobile Testing

### iOS Safari:
```
1. Open Safari
2. Navigate to your local IP: http://192.168.x.x:5173
3. Add to Home Screen (optional)
4. Test QR scanner (works perfectly)
```

### Android Chrome:
```
1. Open Chrome
2. Navigate to your local IP: http://192.168.x.x:5173
3. Enable camera permissions
4. Test QR scanner
```

---

## 🎯 Next Features to Build

Now that core features work, you can add:

1. **KYC Submission Form**
   - Page: `/request-organizer`
   - Upload documents via FileUpload component
   - Submit to admin for review

2. **Event Image Upload**
   - Add FileUpload to Organizer event form
   - Upload images to S3
   - Display in event cards

3. **Stripe Payment**
   - Replace demo payment with Stripe
   - Add Stripe publishable key
   - Handle real payments

4. **Email Notifications**
   - Configure AWS SES
   - Send booking confirmations
   - Attach QR code to email

5. **Analytics Dashboard**
   - Charts for organizers
   - Revenue tracking
   - Attendee insights

---

## 🆘 Getting Help

### Documentation:
- `ARCHITECTURE.md` - Complete system architecture
- `IMPLEMENTATION_SUMMARY.md` - Feature details
- [AWS Amplify Docs](https://docs.amplify.aws/)

### Logs:
- **Backend**: CloudWatch Logs in AWS Console
- **Frontend**: Browser DevTools console
- **Amplify**: `npx ampx sandbox` terminal output

### Common Commands:
```bash
# View Amplify resources
npx ampx sandbox status

# Reset everything
npx ampx sandbox delete
npx ampx sandbox

# Update dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ✅ You're All Set!

Your **RelexBooking** platform is ready to use! 🎉

Start by:
1. ✅ Running `npx ampx sandbox`
2. ✅ Running `npm run dev`
3. ✅ Creating an admin user
4. ✅ Testing the complete flow

**Happy booking! 🎫✨**
