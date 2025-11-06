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

/**
 * Wait for element to be visible in DOM
 * html5-qrcode requires a visible container to render camera video
 */
const waitForElementVisible = async (id: string, timeout = 3000): Promise<HTMLElement | null> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = document.getElementById(id);
    if (el) {
      const style = getComputedStyle(el);
      if (style && style.display !== 'none' && style.visibility !== 'hidden' && el.clientHeight > 0) {
        return el;
      }
    }
    // Small yield to avoid blocking
    // eslint-disable-next-line no-await-in-loop
    await new Promise(r => setTimeout(r, 100));
  }
  return null;
};

export function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanningLockRef = useRef(false);
  const scannerDivId = 'qr-reader';

  const chooseCameraAndStart = async () => {
    if (!html5QrCodeRef.current) {
      console.log('Creating Html5Qrcode instance');
      // verbose: true helps debugging
      html5QrCodeRef.current = new Html5Qrcode(scannerDivId, { verbose: true });
    }

    // Wait for container to be visible (html5-qrcode requires visible container)
    const el = await waitForElementVisible(scannerDivId, 3000);
    if (!el) {
      throw new Error('Scanner container not visible or not in DOM');
    }

    let cameras: any[] = [];
    try {
      cameras = await Html5Qrcode.getCameras();
      console.log('Available cameras:', cameras);
    } catch (err) {
      console.warn('getCameras failed:', err);
      cameras = [];
    }

    let cameraIdOrConfig: string | { facingMode: string } = { facingMode: 'environment' };

    if (cameras && cameras.length > 0) {
      // Prefer back/rear camera when available
      const back = cameras.find((c: any) => /back|rear|environment/i.test(c.label || ''));
      cameraIdOrConfig = (back && back.id) || cameras[0].id;
      console.log('Selected cameraIdOrConfig:', cameraIdOrConfig);
    } else {
      console.log('No enumerated cameras, using facingMode fallback');
    }

    // Start scanning
    await html5QrCodeRef.current.start(
      cameraIdOrConfig,
      {
        fps: 20,
        qrbox: { width: 300, height: 300 },
        aspectRatio: 1.777778,
        disableFlip: false,
      },
      onScanSuccess,
      onScanError
    );

    setIsScanning(true);
    console.log('Scanner started');
  };

  const startScanning = async () => {
    setCameraError(null);
    setScanResult(null);

    // Basic HTTPS and feature checks
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      const msg = 'Camera access requires HTTPS. Please use HTTPS or run on localhost.';
      setCameraError(msg);
      alert(msg);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Camera not supported. Use Chrome/Edge/Firefox/Safari with camera support.';
      setCameraError(msg);
      alert(msg);
      return;
    }

    // Request a quick permission to make sure user gesture flow is respected
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop());
    } catch (permErr: any) {
      const friendly = `Camera permission error: ${permErr?.message || permErr?.name || 'unknown'}`;
      setCameraError(friendly);
      alert(friendly);
      return;
    }

    // Make sure scanner div is visible in DOM before starting
    const scannerDiv = document.getElementById(scannerDivId);
    if (!scannerDiv) {
      setCameraError('Scanner container not found. Refresh the page.');
      alert('Scanner container not found. Refresh the page.');
      return;
    }

    // Make sure the scanner container is visible (if your UI toggles 'hidden', show it first)
    scannerDiv.style.display = 'block';

    try {
      scanningLockRef.current = false; // Reset any stale lock
      await chooseCameraAndStart();
    } catch (err: any) {
      console.error('Failed to initialize scanner:', err);
      setCameraError(String(err?.message || err));
      // Cleanup
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.clear();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
      scanningLockRef.current = false;
    }
  };

  const stopScanning = async () => {
    if (!html5QrCodeRef.current) {
      setIsScanning(false);
      scanningLockRef.current = false;
      return;
    }
    try {
      // Stop camera feed (if running)
      await html5QrCodeRef.current.stop();
    } catch (err) {
      console.warn('stop() error (can be ignored if not started):', err);
    }
    try {
      // Clear any internal resources & UI
      await html5QrCodeRef.current.clear();
    } catch (err) {
      console.warn('clear() error (can be ignored):', err);
    }
    html5QrCodeRef.current = null;
    setIsScanning(false);
    scanningLockRef.current = false;
  };

  const onScanSuccess = async (decodedTextOrResult: any) => {
    const decodedText = typeof decodedTextOrResult === 'string'
      ? decodedTextOrResult
      : (decodedTextOrResult?.decodedText || decodedTextOrResult?.text || '');

    console.log('Raw decoded QR text:', decodedText);

    if (!decodedText) return;

    // Ensure single processing
    if (scanningLockRef.current) {
      console.log('Already processing a scan; ignoring new scan');
      return;
    }
    scanningLockRef.current = true;

    try {
      // Don't immediately clear instance — stop streaming gracefully
      if (html5QrCodeRef.current && isScanning) {
        try {
          await html5QrCodeRef.current.pause(); // Pause (if supported) before stop to be safe
        } catch (pauseErr) {
          // Ignore if not supported
        }
      }

      // Optional: local parse first (fast fail)
      const parsed = parseBookingQRCode(decodedText);
      if (!parsed) {
        setScanResult({ type: 'error', message: 'Invalid QR code format' });
        scanningLockRef.current = false;
        return;
      }

      setScanResult({ type: 'warning', message: 'Processing QR code...' });

      // Fetch booking (retry loop, but tighten errors)
      const client = getAmplifyClient();
      if (!client) {
        throw new Error('Amplify client not configured');
      }

      let bookingResult = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await client.models.Booking.get({ id: parsed.bookingId });
          bookingResult = res;
          break;
        } catch (e) {
          console.warn('Booking fetch failed attempt', attempt + 1, e);
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (!bookingResult || !bookingResult.data) {
        setScanResult({ type: 'error', message: 'Booking not found' });
        return;
      }

      const booking = bookingResult.data as unknown as Booking;

      // Validate the QR vs DB state
      const validation = validateBookingQRCode(decodedText, {
        id: booking.id,
        eventID: booking.eventID,
        userID: booking.userID,
        status: booking.status,
        checkedIn: booking.checkedIn ?? null,
      });

      if (!validation.valid) {
        setScanResult({ type: 'error', message: validation.reason || 'Invalid ticket' });
        return;
      }

      // Update booking checkedIn (ensure proper server permission)
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
    } catch (e: any) {
      console.error('Error processing scan:', e);
      setScanResult({ type: 'error', message: e.message || 'Failed to process QR code' });
    } finally {
      // Cleanup scanner instance so user can press "Scan Next"
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.stop(); // Stop camera
          await html5QrCodeRef.current.clear();
        }
      } catch (stopErr) {
        console.warn('Error stopping scanner after scan:', stopErr);
      }
      html5QrCodeRef.current = null;
      setIsScanning(false);
      scanningLockRef.current = false;
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
      // Ensure camera & instance cleaned up on unmount
      void stopScanning();
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
            className="rounded-lg overflow-hidden"
            style={{
              minHeight: '400px',
              width: '100%',
              position: 'relative',
              display: isScanning ? 'block' : 'none'
            }}
          />

          {isScanning && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-400 text-center">
                📷 Camera active - Point at QR code to scan automatically
              </p>
            </div>
          )}

          {!isScanning && !scanResult && !cameraError && (
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
              : scanResult.type === 'warning'
              ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-4">
            {scanResult.type === 'success' ? (
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : scanResult.type === 'warning' ? (
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4
                className={`font-semibold mb-2 ${
                  scanResult.type === 'success'
                    ? 'text-green-900 dark:text-green-100'
                    : scanResult.type === 'warning'
                    ? 'text-yellow-900 dark:text-yellow-100'
                    : 'text-red-900 dark:text-red-100'
                }`}
              >
                {scanResult.type === 'success'
                  ? 'Check-in Successful'
                  : scanResult.type === 'warning'
                  ? 'Processing...'
                  : 'Check-in Failed'}
              </h4>
              <p
                className={`text-sm mb-4 ${
                  scanResult.type === 'success'
                    ? 'text-green-800 dark:text-green-300'
                    : scanResult.type === 'warning'
                    ? 'text-yellow-800 dark:text-yellow-300'
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
