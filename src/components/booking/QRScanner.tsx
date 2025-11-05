import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseBookingQRCode, validateBookingQRCode } from '@/lib/qrcode';
import { getAmplifyClient } from '@/lib/amplifyClient';
import type { Booking } from '@/types/graphql';

interface ScanResult {
  type: 'success' | 'error' | 'warning';
  message: string;
  booking?: Booking;
}

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'qr-reader';

  const checkCameraPermission = async (): Promise<'granted' | 'denied' | 'prompt'> => {
    // Try to check permission state first (if supported)
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        return permissionStatus.state as 'granted' | 'denied' | 'prompt';
      } catch (err) {
        console.log('Permission API not fully supported, will request directly');
      }
    }
    return 'prompt';
  };

  const startScanning = async () => {
    try {
      setCameraError(null);
      setScanResult(null);

      // Check if running on HTTPS or localhost
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
        const errorMsg = 'Camera access requires HTTPS. Please access the site via HTTPS.';
        setCameraError(errorMsg);
        alert(errorMsg);
        return;
      }

      // Check if browser supports camera
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = 'Your browser does not support camera access. Please use a modern browser like Chrome, Safari, or Firefox.';
        setCameraError(errorMsg);
        alert(errorMsg);
        return;
      }

      // Check current permission state
      const permissionState = await checkCameraPermission();
      console.log('Camera permission state:', permissionState);

      if (permissionState === 'denied') {
        const errorMsg = 'Camera permission is blocked. Please enable camera access in your browser settings:\n\n' +
          '• Android: Settings → Apps → Browser → Permissions → Camera → Allow\n' +
          '• iOS: Settings → Safari → Camera → Allow\n\n' +
          'Then reload this page.';
        setCameraError(errorMsg);
        alert(errorMsg);
        return;
      }

      // Request camera permission explicitly first
      let stream: MediaStream | null = null;
      try {
        console.log('Requesting camera permission...');
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        console.log('Camera permission granted');

        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr: any) {
        console.error('Camera permission error:', permErr);
        let errorMsg = '';

        if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission was denied. Please click "Allow" when prompted, or enable camera access in your browser settings:\n\n' +
            '• Android: Settings → Apps → Browser → Permissions → Camera → Allow\n' +
            '• iOS: Settings → Safari → Camera → Allow\n\n' +
            'Then try again.';
        } else if (permErr.name === 'NotFoundError' || permErr.name === 'DevicesNotFoundError') {
          errorMsg = 'No camera was found on this device. Please ensure your device has a working camera.';
        } else if (permErr.name === 'NotReadableError' || permErr.name === 'TrackStartError') {
          errorMsg = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
        } else if (permErr.name === 'OverconstrainedError') {
          errorMsg = 'Camera constraints could not be satisfied. Your device may not support the rear camera.';
        } else if (permErr.name === 'SecurityError') {
          errorMsg = 'Camera access is blocked due to security settings. Please ensure you are using HTTPS.';
        } else {
          errorMsg = `Camera error: ${permErr.message || 'Unable to access camera'}.\n\nPlease check your browser permissions and try again.`;
        }

        setCameraError(errorMsg);
        alert(errorMsg);
        return;
      }

      // Initialize html5-qrcode if needed
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerDivId);
      }

      // Start scanning with both rear camera preference and fallback
      console.log('Starting QR code scanner...');
      try {
        await html5QrCodeRef.current.start(
          { facingMode: { ideal: 'environment' } },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          onScanSuccess,
          onScanError
        );

        setIsScanning(true);
        console.log('Scanner started successfully');
      } catch (scannerErr: any) {
        console.error('Scanner initialization error:', scannerErr);

        let errorMsg = '';
        if (scannerErr.name === 'NotAllowedError') {
          errorMsg = 'Camera permission was denied. Please reload the page and click "Allow" when prompted.';
        } else if (scannerErr.message?.includes('permission') || scannerErr.message?.includes('Permission')) {
          errorMsg = 'Camera permission is required. Please enable camera access in your browser settings and try again.';
        } else if (scannerErr.message) {
          errorMsg = `Scanner error: ${scannerErr.message}`;
        } else {
          errorMsg = 'Failed to start scanner. Please check camera permissions and try again.';
        }

        setCameraError(errorMsg);
        alert(errorMsg);
      }
    } catch (err: any) {
      console.error('Unexpected error in startScanning:', err);
      const errorMsg = `Failed to access camera: ${err.message || 'Unknown error'}. Please check permissions and try again.`;
      setCameraError(errorMsg);
      alert(errorMsg);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning immediately to prevent multiple scans
    await stopScanning();

    // Parse QR code
    const parsed = parseBookingQRCode(decodedText);
    if (!parsed) {
      setScanResult({
        type: 'error',
        message: 'Invalid QR code format',
      });
      return;
    }

    // Fetch booking from database
    try {
      const client = getAmplifyClient();
      if (!client) {
        throw new Error('Amplify client not configured');
      }

      const result = await client.models.Booking.get({ id: parsed.bookingId });

      if (!result.data) {
        setScanResult({
          type: 'error',
          message: 'Booking not found',
        });
        return;
      }

      const booking = result.data as unknown as Booking;

      // Validate booking
      const validation = validateBookingQRCode(decodedText, {
        id: booking.id,
        eventID: booking.eventID,
        userID: booking.userID,
        status: booking.status,
        checkedIn: booking.checkedIn ?? null,
      });

      if (!validation.valid) {
        setScanResult({
          type: 'error',
          message: validation.reason || 'Invalid ticket',
        });
        return;
      }

      // Mark as checked in
      await client.models.Booking.update({
        id: booking.id,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
      });

      setScanResult({
        type: 'success',
        message: `Successfully checked in ${booking.userName || 'guest'}`,
        booking,
      });
    } catch (err) {
      console.error('Failed to validate booking:', err);
      setScanResult({
        type: 'error',
        message: 'Failed to validate ticket',
      });
    }
  };

  const onScanError = (errorMessage: string) => {
    // Ignore frequent scanning errors (just waiting for QR code)
    if (!errorMessage.includes('NotFoundException')) {
      console.debug('Scan error:', errorMessage);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.clear();
        } catch (err) {
          console.error('Failed to clear scanner:', err);
        }
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scan Event Ticket</h3>
            {isScanning ? (
              <Button onClick={stopScanning} variant="destructive" size="sm">
                <XCircle className="mr-2 h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button onClick={startScanning} size="sm">
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </Button>
            )}
          </div>

          {cameraError && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg space-y-3">
              <p className="text-sm font-semibold text-red-800 dark:text-red-400 whitespace-pre-line">{cameraError}</p>
              <Button
                onClick={startScanning}
                size="sm"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          <div
            id={scannerDivId}
            className={`rounded-lg overflow-hidden ${isScanning ? 'block' : 'hidden'}`}
          />

          {!isScanning && !scanResult && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Camera className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click "Start Scanning" to check in attendees
              </p>
            </div>
          )}
        </div>
      </Card>

      {scanResult && (
        <Card
          className={`p-6 ${
            scanResult.type === 'success'
              ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold mb-2 ${
                  scanResult.type === 'success'
                    ? 'text-green-900 dark:text-green-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {scanResult.type === 'success' ? 'Check-in Successful' : 'Check-in Failed'}
              </h4>
              <p
                className={`text-sm mb-4 ${
                  scanResult.type === 'success'
                    ? 'text-green-800 dark:text-green-300'
                    : 'text-red-800 dark:text-red-300'
                }`}
              >
                {scanResult.message}
              </p>

              {scanResult.booking && (
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">Name:</span> {scanResult.booking.userName}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {scanResult.booking.userEmail}
                  </p>
                  <p>
                    <span className="font-medium">Tickets:</span> {scanResult.booking.ticketCount}
                  </p>
                  {scanResult.booking.event && (
                    <p>
                      <span className="font-medium">Event:</span> {scanResult.booking.event.title}
                    </p>
                  )}
                </div>
              )}

              <Button
                onClick={() => {
                  setScanResult(null);
                  void startScanning();
                }}
                className="mt-4"
                size="sm"
              >
                Scan Next Ticket
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
