# Camera Access Setup for Mobile Testing

## Why HTTPS is Required

Modern browsers require HTTPS (secure connection) to access device cameras for security reasons. This is especially important when testing the QR code scanner on mobile devices.

## Quick Setup for Local HTTPS

### 1. Generate SSL Certificates

Run the provided script to generate self-signed SSL certificates:

```bash
./generate-cert.sh
```

This will create two files:
- `localhost-key.pem` (private key)
- `localhost.pem` (certificate)

### 2. Start the Development Server

Start your development server as usual:

```bash
npm run dev
```

The server will automatically detect the certificates and run in HTTPS mode.

### 3. Access from Mobile Device

#### On Your Computer
You'll see output like:
```
  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.1.100:5173/
```

#### On Your Mobile Device
1. Connect your mobile device to the same WiFi network as your computer
2. Open your mobile browser (Chrome, Safari, etc.)
3. Visit the **Network URL** shown in the terminal (e.g., `https://192.168.1.100:5173`)
4. **Accept the security warning** about the self-signed certificate:
   - On Android Chrome: Click "Advanced" → "Proceed to... (unsafe)"
   - On iOS Safari: Click "Show Details" → "visit this website"

### 4. Grant Camera Permission

When you click "Start Scanning" on the QR scanner page:
1. Your browser will prompt for camera permission
2. Click "Allow" or "OK"
3. The camera should now activate

## Troubleshooting

### "Failed to access camera" Error

**Check these common issues:**

1. **Not using HTTPS**: Make sure you're accessing via `https://` not `http://`
2. **Camera permission denied**:
   - Android: Settings → Apps → Browser → Permissions → Camera → Allow
   - iOS: Settings → Safari → Camera → Ask / Allow
3. **Camera already in use**: Close other apps using the camera
4. **Browser doesn't support camera**: Use Chrome, Safari, or Firefox (latest versions)

### Certificate Warnings

The browser shows a security warning because the certificate is self-signed. This is normal for local development and safe to accept.

### Network URL Not Accessible

If the Network URL doesn't work:
1. Check your computer's firewall settings
2. Make sure both devices are on the same WiFi network
3. Try accessing via your computer's local IP directly

### Finding Your Computer's IP Address

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig
```

Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

## Production Deployment

When you deploy to production (AWS Amplify, Vercel, Netlify, etc.), HTTPS is provided automatically. You don't need to do anything special.

## Alternative: Using ngrok

If you can't get local HTTPS working, you can use [ngrok](https://ngrok.com/) to create a secure tunnel:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server normally
npm run dev

# In another terminal, create a tunnel
ngrok http 5173
```

Use the HTTPS URL provided by ngrok on your mobile device.
