# Image Upload Diagnostic Guide

## Issue
Cannot upload images when creating events. Error message: "Failed to upload image. Please try again or use an image URL instead."

## Changes Made

### 1. Enhanced Error Logging
Added comprehensive console logging to track the upload process:
- Storage path and file details
- User authentication status
- Upload progress
- Detailed error messages with specific failure reasons

### 2. Improved Error Messages
- Access denied errors
- Network errors
- Path validation errors
- Generic error fallback with actual error message

### 3. File Extension Sanitization
- Sanitized file extensions to prevent invalid characters in S3 paths
- Lowercase conversion and special character removal

## How to Diagnose

### Step 1: Open Browser DevTools
1. Open your application in the browser
2. Press F12 or right-click → "Inspect" to open DevTools
3. Go to the "Console" tab

### Step 2: Attempt Image Upload
1. Log in as an Organizer or Admin
2. Click "Create Event"
3. Fill in the required fields
4. Select the "Upload File" tab
5. Choose an image file (JPEG, PNG, or WebP, max 5MB)
6. Click "Create Event"

### Step 3: Check Console Logs

You should see logs in this order:

**Successful upload:**
```
[CreateEvent] Starting image upload...
[CreateEvent] User authenticated: { userId: "...", email: "..." }
[CreateEvent] File details: { name: "image.jpg", size: 12345, type: "image/jpeg" }
[Storage] Uploading event image: { fileName: "temp-123456-12345.jpg", path: "events/temp-123456-12345.jpg", fileSize: 12345 }
[Storage] Starting upload with path: events/temp-123456-12345.jpg
[Storage] Upload progress: 25%
[Storage] Upload progress: 50%
[Storage] Upload progress: 75%
[Storage] Upload progress: 100%
[Storage] Upload completed, result: { ... }
[Storage] Got URL: https://...
[CreateEvent] Image upload successful: https://...
```

**Failed upload (look for specific error):**
```
[CreateEvent] Starting image upload...
[CreateEvent] User authenticated: { userId: "...", email: "..." }
[CreateEvent] File details: { name: "image.jpg", size: 12345, type: "image/jpeg" }
[Storage] Uploading event image: { ... }
[Storage] Starting upload with path: events/...
[Storage] File upload failed: Error: ...
[Storage] Error details: { message: "...", name: "...", stack: "..." }
[CreateEvent] Image upload failed: Error: ...
[CreateEvent] Error details: { ... }
```

### Step 4: Identify the Issue

Based on the error message, here are common issues and solutions:

#### **"Access Denied" or "Forbidden"**

**Cause:** User doesn't have permission to upload to S3

**Solution:**
1. Verify you're logged in
2. Check AWS Amplify deployment completed successfully
3. Verify storage configuration:
```bash
cat amplify_outputs.json | grep -A 30 "storage"
```

Expected: `"authenticated": ["get", "list", "write", "delete"]` for `events/*` path

**Fix if needed:**
```bash
# Redeploy storage with correct permissions
npx ampx sandbox
```

#### **"Network Error" or "Failed to fetch"**

**Cause:** Network connection issue or CORS problem

**Solution:**
1. Check internet connection
2. Verify S3 bucket CORS configuration
3. Check browser network tab for failed requests

**To check CORS:**
```bash
aws s3api get-bucket-cors --bucket amplify-amplifyvitereactt-relexbookingstoragebucke-e6pmtr0edeo4 --region ap-south-1
```

#### **"Invalid file path" or path-related errors**

**Cause:** File extension contains invalid characters

**Solution:** Already fixed with sanitization. If still occurs:
- Use only alphanumeric characters in filename
- Supported extensions: jpg, jpeg, png, webp

#### **"User is not authenticated"**

**Cause:** AWS Amplify authentication session expired or not configured

**Solution:**
1. Log out and log back in
2. Check if `amplify_outputs.json` has auth configuration
3. Verify Amplify.configure() is called in main.tsx

#### **No error logs at all**

**Cause:** Build not deployed or old code cached

**Solution:**
```bash
# Clear browser cache and rebuild
npm run build

# Or hard refresh in browser
# Chrome/Firefox: Ctrl+Shift+R (Cmd+Shift+R on Mac)
# Safari: Cmd+Option+E, then Cmd+R
```

## Common Fixes

### Fix 1: Verify Authentication
```bash
# Check if user is authenticated
# In browser console:
import { getCurrentUser } from 'aws-amplify/auth';
getCurrentUser().then(user => console.log('User:', user));
```

### Fix 2: Verify Storage Configuration
```bash
# Check S3 bucket exists and has correct permissions
aws s3 ls s3://amplify-amplifyvitereactt-relexbookingstoragebucke-e6pmtr0edeo4/events/ --region ap-south-1
```

### Fix 3: Test with Small File
Try uploading a very small image (< 100KB) to rule out file size issues.

### Fix 4: Use Image URL Instead
As a workaround, use the "Image URL" tab and provide a direct link to an image:
1. Upload image to any public image host (imgur.com, imgbb.com, etc.)
2. Copy the direct image URL
3. Paste in "Image URL" field

### Fix 5: Check AWS Amplify Console
1. Go to AWS Amplify Console
2. Select your app
3. Check latest deployment status
4. Look for storage-related errors in build logs

## Testing Checklist

- [ ] Browser console shows no errors before attempting upload
- [ ] User is logged in (check top-right user menu)
- [ ] File is valid image type (JPEG/PNG/WebP)
- [ ] File is under 5MB
- [ ] Console shows `[CreateEvent] Starting image upload...`
- [ ] Console shows user authentication details
- [ ] Console shows `[Storage] Starting upload with path:`
- [ ] Upload progress shows in console
- [ ] Error message appears with specific details (if failing)

## Report Back

After testing, please provide:

1. **Full console logs** (copy all logs from browser DevTools)
2. **Error message** shown in alert
3. **User role** (Organizer/Admin/SuperAdmin)
4. **File details** (name, size, type)
5. **Network tab** showing S3 PUT request (if any)

## Next Steps

Based on the diagnostic results, we can:
- Fix authentication issues
- Update storage permissions
- Configure CORS properly
- Add retry logic for network errors
- Implement chunked uploads for large files

---

**Note:** The changes are already deployed to GitHub. Make sure to:
1. Pull latest changes: `git pull origin main`
2. Rebuild: `npm run build`
3. Clear browser cache
4. Test again with DevTools open
