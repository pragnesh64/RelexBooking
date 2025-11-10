# Event Editing Guide

## Overview

You can now edit and delete events from the Organizer Dashboard. This guide explains how to use the new event management features.

## Features Implemented

### 1. Event List Display
- **Location:** Organizer Dashboard (`/organizer`)
- **What you'll see:**
  - All your created events (Organizers see only their events, Admins see all)
  - Event cards with thumbnails, title, description, date, location, capacity
  - Status badges (Published/Draft)
  - Price tags (Free or dollar amount)

### 2. Statistics Dashboard
- **Total Events:** Count of all your events
- **Upcoming Events:** Events with future dates
- **Published:** Events with status "published"
- **Draft:** Events with status "draft"

### 3. Edit Event
Click the "Edit" button on any event card to:
- Update event title and description
- Change date and time
- Modify location
- Update price and capacity
- Change category
- Upload new image or change image URL
- Keep existing image if not changed

### 4. Delete Event
Click the "Delete" button to permanently remove an event:
- Confirmation dialog appears
- Event and all associated data will be deleted
- **Warning:** This action cannot be undone!

## How to Edit an Event

### Step 1: Navigate to Organizer Dashboard
1. Log in as Organizer, Admin, or SuperAdmin
2. Click "Organizer" in the navigation menu
3. You'll see your events list

### Step 2: Click Edit Button
1. Find the event you want to edit
2. Click the "Edit" button on the right side
3. Edit Event dialog will open with pre-filled data

### Step 3: Make Changes
**Text Fields:**
- Update any text field (title, description, location, category)
- Modify date and time using date/time pickers
- Change price (0 for free) or capacity numbers

**Image Update:**
You have two options:

**Option A: Upload New Image**
1. Click "Upload File" tab
2. Select an image file (JPEG, PNG, WebP, max 5MB)
3. Image preview will appear
4. Original image will be replaced on save

**Option B: Change Image URL**
1. Click "Image URL" tab
2. Enter or paste a new image URL
3. Image preview will update
4. Original image will be replaced on save

**Keep Existing Image:**
- Don't upload a new file or change the URL
- Existing image will be preserved

### Step 4: Save Changes
1. Review your changes
2. Click "Update Event" button
3. Wait for "Event updated successfully!" message
4. Event list will refresh automatically

## How to Delete an Event

### Step 1: Find the Event
Navigate to Organizer Dashboard and find the event to delete

### Step 2: Click Delete Button
1. Click the red "Delete" button
2. Confirmation dialog will appear: "Are you sure you want to delete this event? This action cannot be undone."

### Step 3: Confirm Deletion
1. Click "OK" to confirm
2. Click "Cancel" to abort
3. If confirmed, event will be deleted immediately
4. Success message: "Event deleted successfully!"
5. Event list refreshes automatically

## Role-Based Access

### Organizer
- Can see only their own created events
- Can edit only their events
- Can delete only their events
- Filter: `organizerID = current user ID`

### Admin / SuperAdmin
- Can see **all events** from all organizers
- Can edit any event
- Can delete any event
- No filter applied

## Technical Details

### Edit Form Features
- **Pre-filled Data:** Form automatically loads current event values
- **Date/Time Parsing:** Converts ISO timestamps to date and time fields
- **Image Handling:**
  - Existing image shown in preview
  - Can upload new file or use URL
  - Image only updates if changed
- **Auth Verification:** Checks authentication session before image upload
- **Error Handling:** Detailed error messages with console logs

### API Calls
```typescript
// Fetch events
client.models.Event.list({
  filter: { organizerID: { eq: userId } } // or no filter for admins
})

// Update event
client.models.Event.update({
  id: eventId,
  title: "New Title",
  // ... other fields
})

// Delete event
client.models.Event.delete({ id: eventId })
```

### Console Logging
Open browser DevTools → Console to see:
```
[EditEvent] Starting image upload...
[EditEvent] User authenticated: { userId: "...", email: "..." }
[EditEvent] File details: { name: "...", size: ..., type: "..." }
[EditEvent] Auth session valid: { hasTokens: true, ... }
[Storage] Uploading event image: { fileName: "...", path: "..." }
[EditEvent] Image upload successful: https://...
Updating event with data: { id: "...", title: "...", ... }
```

## Troubleshooting

### Event List Not Loading
**Issue:** Events don't appear on Organizer Dashboard

**Solutions:**
1. Check you're logged in as Organizer/Admin/SuperAdmin
2. Verify AWS Amplify deployment completed
3. Check browser console for errors
4. Try refreshing the page

### Edit Form Not Opening
**Issue:** Click Edit but dialog doesn't appear

**Solutions:**
1. Check browser console for errors
2. Hard refresh: Ctrl+Shift+R (Cmd+Shift+R on Mac)
3. Clear browser cache

### Changes Not Saving
**Issue:** Click "Update Event" but changes don't persist

**Solutions:**
1. Check all required fields are filled
2. Verify date and time are valid
3. Check browser console for API errors
4. Ensure you have permission to edit the event

### Image Upload Fails
**Issue:** New image doesn't upload

**Solutions:**
1. Check file size < 5MB
2. Use supported formats: JPEG, PNG, WebP
3. Verify authentication session (log out and back in)
4. Use "Image URL" tab as workaround
5. Check IMAGE_UPLOAD_DIAGNOSTIC.md for detailed troubleshooting

### Delete Confirmation Not Appearing
**Issue:** Click Delete but no confirmation dialog

**Solutions:**
1. Check browser allows popups/dialogs
2. Try different browser
3. Check browser console for errors

## Testing Checklist

- [ ] Log in as Organizer
- [ ] Navigate to Organizer Dashboard
- [ ] See "Create Event" button
- [ ] See statistics cards with correct counts
- [ ] See list of your events (or "No events" message)
- [ ] Click "Edit" on an event
- [ ] Edit Event dialog opens with pre-filled data
- [ ] Modify some fields
- [ ] Click "Update Event"
- [ ] See success message
- [ ] Event list refreshes with updated data
- [ ] Event card shows new values
- [ ] Click "Delete" on an event
- [ ] See confirmation dialog
- [ ] Confirm deletion
- [ ] See success message
- [ ] Event removed from list
- [ ] Statistics update

## Example Workflow

### Scenario: Update Event Image and Price

1. **Navigate:** Go to `/organizer`
2. **Find Event:** Locate "Summer Music Festival"
3. **Edit:** Click "Edit" button
4. **Update Price:** Change from $50 to $45
5. **Update Image:**
   - Click "Image URL" tab
   - Paste new image URL: `https://example.com/new-image.jpg`
   - See preview update
6. **Save:** Click "Update Event"
7. **Verify:** Event card now shows $45 and new image

### Scenario: Delete Old Event

1. **Navigate:** Go to `/organizer`
2. **Find Event:** Locate "Outdated Workshop"
3. **Delete:** Click "Delete" button
4. **Confirm:** Click "OK" in confirmation dialog
5. **Verify:** Event removed from list, Total Events count decreased

## Best Practices

1. **Before Editing:**
   - Review all fields carefully
   - Have new image ready if changing
   - Note the event ID in case of issues

2. **Image Updates:**
   - Use high-quality images (recommended: 1200x600px)
   - Optimize file size before upload
   - Test image URL loads correctly before saving

3. **Before Deleting:**
   - Export event data if needed
   - Check if there are existing bookings (consider canceling first)
   - Consider marking as "draft" instead of deleting

4. **Testing Changes:**
   - After editing, visit event page to verify
   - Test booking flow still works
   - Check image loads on all devices

## Security Notes

- **Authentication:** Must be logged in as Organizer/Admin/SuperAdmin
- **Authorization:** Can only edit events you created (unless Admin)
- **Session Validation:** Auth session checked before image uploads
- **Audit Trail:** Updates logged with timestamps in DynamoDB
- **Confirmation:** Delete requires explicit confirmation

## Future Enhancements

Potential improvements for future versions:
- Bulk edit multiple events
- Duplicate event feature
- Draft/Publish toggle
- Event templates
- Image cropper
- Rich text editor for description
- Cancel event (keep data but mark inactive)
- Restore deleted events (soft delete)

---

**Need Help?**
- Check browser console for detailed error messages
- Review IMAGE_UPLOAD_DIAGNOSTIC.md for image issues
- Verify AWS Amplify deployment status
- Test in incognito mode to rule out cache issues
