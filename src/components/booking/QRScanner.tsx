import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, XCircle, Maximize, SwitchCamera } from 'lucide-react';
import { validateBookingQRCode } from '@/lib/qrcode';
import { getAmplifyClient } from '@/lib/amplifyClient';
import { triggerSuccessFeedback, triggerErrorFeedback, triggerWarningFeedback, activateAudio } from '@/lib/scannerFeedback';
import { ScanResultCard, type ScanResultData } from './ScanResultCard';
import { useAuth } from '@/hooks/useAuth';
import type { Booking } from '@/types/graphql';

interface QRScannerProps {
  eventId?: string; // Optional: filter by specific event
  onSuccessCallback?: (booking: Booking) => void;
  onErrorCallback?: (error: string) => void;
  showFullscreenButton?: boolean;
  showCameraSwitchButton?: boolean;
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

export function QRScanner({
  eventId,
  onSuccessCallback,
  onErrorCallback,
  showFullscreenButton = true,
  showCameraSwitchButton = true,
}: QRScannerProps = {}) {
  const { user } = useAuth(); // Get current user for check-in tracking
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<any[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanningLockRef = useRef(false);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerDivId = 'qr-reader';

  const chooseCameraAndStart = async () => {
    if (!html5QrCodeRef.current) {
      console.log('Creating Html5Qrcode instance');
      html5QrCodeRef.current = new Html5Qrcode(scannerDivId, { verbose: false }); // Set verbose false for production
    }

    // Wait for container to be visible (html5-qrcode requires visible container)
    const el = await waitForElementVisible(scannerDivId, 3000);
    if (!el) {
      throw new Error('Scanner container not visible or not in DOM');
    }

    // Get available cameras
    let cameras: any[] = [];
    try {
      cameras = await Html5Qrcode.getCameras();
      console.log('Available cameras:', cameras);
      setAvailableCameras(cameras);
    } catch (err) {
      console.warn('getCameras failed:', err);
      cameras = [];
    }

    let cameraIdOrConfig: string | { facingMode: string } = { facingMode: 'environment' };

    if (cameras && cameras.length > 0) {
      // Use selected camera or prefer back/rear camera
      if (currentCameraIndex < cameras.length) {
        cameraIdOrConfig = cameras[currentCameraIndex].id;
      } else {
        const back = cameras.find((c: any) => /back|rear|environment/i.test(c.label || ''));
        cameraIdOrConfig = (back && back.id) || cameras[0].id;
      }
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

    // Activate audio context on user interaction
    activateAudio();

    // Basic HTTPS and feature checks
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      const msg = 'Camera access requires HTTPS. Please use HTTPS or run on localhost.';
      setCameraError(msg);
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const msg = 'Camera not supported. Use Chrome/Edge/Firefox/Safari with camera support.';
      setCameraError(msg);
      return;
    }

    // Request a quick permission to make sure user gesture flow is respected
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop());
    } catch (permErr: any) {
      const friendly = `Camera permission error: ${permErr?.message || permErr?.name || 'unknown'}`;
      setCameraError(friendly);
      return;
    }

    // Make sure scanner div is visible in DOM before starting
    const scannerDiv = document.getElementById(scannerDivId);
    if (!scannerDiv) {
      setCameraError('Scanner container not found. Refresh the page.');
      return;
    }

    // Make sure the scanner container is visible
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
      html5QrCodeRef.current.clear();
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
          html5QrCodeRef.current.pause(true);
        } catch (pauseErr) {
          // Ignore if not supported
        }
      }

      // Show processing state
      setScanResult({
        type: 'warning',
        message: 'Validating ticket...',
        timestamp: new Date().toISOString(),
      });
      triggerWarningFeedback();

      // Fetch booking
      const client = getAmplifyClient();
      if (!client) {
        throw new Error('Amplify client not configured');
      }

      // Parse QR to get booking ID (supports both secure and legacy formats)
      const { parseQRCode } = await import('@/lib/ticketSecurity');
      const parsed = parseQRCode(decodedText);

      if (!parsed) {
        throw new Error('Invalid QR code format');
      }

      const bookingId = parsed.type === 'secure' ? parsed.payload!.bid : parsed.legacy!.bookingId;

      // Fetch booking with event details
      let bookingResult = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const res = await client.models.Booking.get({ id: bookingId }, {
            selectionSet: ['id', 'eventID', 'userID', 'userName', 'userEmail', 'status', 'ticketCount', 'checkedIn', 'checkedInAt', 'event.id', 'event.title']
          });
          bookingResult = res;
          break;
        } catch (e) {
          console.warn('Booking fetch failed attempt', attempt + 1, e);
          // eslint-disable-next-line no-await-in-loop
          await new Promise(r => setTimeout(r, 500));
        }
      }

      if (!bookingResult || !bookingResult.data) {
        throw new Error('Booking not found in database');
      }

      const booking = bookingResult.data as unknown as Booking;

      // Optional: Filter by eventId if specified
      if (eventId && booking.eventID !== eventId) {
        throw new Error('This ticket is for a different event');
      }

      // CRITICAL CHECK 1: Initial validation
      const validation = await validateBookingQRCode(decodedText, {
        id: booking.id,
        eventID: booking.eventID,
        userID: booking.userID,
        status: booking.status,
        checkedIn: booking.checkedIn ?? null,
        userName: booking.userName,
        userEmail: booking.userEmail,
        ticketCount: booking.ticketCount,
        event: booking.event,
      });

      if (!validation.valid) {
        throw new Error(validation.reason || 'Invalid ticket');
      }

      // CRITICAL: Enhanced protection with immediate re-fetch before update
      // This significantly reduces the race condition window
      const checkedInBy = user?.userId || 'unknown';
      const checkedInByName = user?.name || user?.email || 'Staff';

      console.log('[SECURITY] Re-fetching booking for race condition protection...');

      // Re-fetch booking immediately before update to get freshest state
      const freshBookingResult = await client.models.Booking.get({ id: booking.id });

      if (!freshBookingResult.data) {
        throw new Error('Booking disappeared - cannot check in');
      }

      const freshBooking = freshBookingResult.data as unknown as Booking;

      // CRITICAL CHECK: Verify AGAIN that checkedIn is still false
      if (freshBooking.checkedIn === true) {
        console.warn('[SECURITY] Race condition detected - booking already checked in');
        throw new Error('Already checked in - ticket was used by another scanner');
      }

      // If we reach here, proceed with update
      console.log('[SECURITY] Booking confirmed available, updating...');

      const updateResult = await client.models.Booking.update({
        id: booking.id,
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy,
        checkedInByName,
        status: 'checked_in',
      });

      if (!updateResult.data) {
        throw new Error('Update failed - please try again');
      }

      // Final verification
      console.log('[SECURITY] Verifying check-in was recorded...');
      const verifyResult = await client.models.Booking.get({ id: booking.id });

      if (verifyResult.data?.checkedIn !== true) {
        console.error('[SECURITY] Verification failed - checkedIn not set');
        throw new Error('Check-in verification failed - please scan again');
      }

      console.log('[SECURITY] Check-in successful and verified');

      // Success! Trigger feedback
      triggerSuccessFeedback();

      const resultData: ScanResultData = {
        type: 'success',
        message: `Welcome! Check-in successful`,
        bookingDetails: validation.bookingDetails,
        timestamp: new Date().toISOString(),
      };

      setScanResult(resultData);

      // Call success callback if provided
      if (onSuccessCallback) {
        onSuccessCallback(booking);
      }
    } catch (e: any) {
      console.error('Error processing scan:', e);

      // Error feedback
      triggerErrorFeedback();

      setScanResult({
        type: 'error',
        message: e.message || 'Failed to process QR code',
        timestamp: new Date().toISOString(),
      });

      // Call error callback if provided
      if (onErrorCallback) {
        onErrorCallback(e.message || 'Failed to process QR code');
      }
    } finally {
      // Cleanup scanner instance so user can press "Scan Next"
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.stop();
          try {
            html5QrCodeRef.current.clear();
          } catch {
            // Ignore cleanup errors
          }
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

  // Switch camera function
  const switchCamera = async () => {
    if (availableCameras.length <= 1) return;

    const nextIndex = (currentCameraIndex + 1) % availableCameras.length;
    setCurrentCameraIndex(nextIndex);

    // Restart with new camera
    await stopScanning();
    await startScanning();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!scannerContainerRef.current) return;

    if (!document.fullscreenElement) {
      scannerContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('Failed to enter fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.warn('Failed to exit fullscreen:', err);
      });
    }
  };

  useEffect(() => {
    // Fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      // Ensure camera & instance cleaned up on unmount
      void stopScanning();
    };
  }, []);

  return (
    <div className="space-y-4" ref={scannerContainerRef}>
      <Card className="p-6">
        <div className="space-y-4">
          {/* Header with controls */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Ticket Scanner
            </h3>
            <div className="flex items-center gap-2">
              {/* Camera switch button */}
              {showCameraSwitchButton && availableCameras.length > 1 && isScanning && (
                <Button
                  onClick={switchCamera}
                  variant="outline"
                  size="sm"
                  disabled={!isScanning}
                >
                  <SwitchCamera className="mr-2 h-4 w-4" />
                  Switch
                </Button>
              )}

              {/* Fullscreen button */}
              {showFullscreenButton && (
                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  size="sm"
                >
                  <Maximize className="mr-2 h-4 w-4" />
                  {isFullscreen ? 'Exit' : 'Fullscreen'}
                </Button>
              )}

              {/* Start/Stop button */}
              {isScanning ? (
                <Button onClick={stopScanning} variant="destructive" size="sm">
                  <XCircle className="mr-2 h-4 w-4" />
                  Stop Scanner
                </Button>
              ) : (
                <Button onClick={startScanning} size="sm">
                  {scanResult ? (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Scan Next
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Start Scanner
                    </>
                  )}
                </Button>
              )}
            </div>
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

      {/* Scan Result Card */}
      <ScanResultCard
        result={scanResult}
        onDismiss={() => setScanResult(null)}
        autoDismiss={scanResult?.type === 'success'}
        autoDismissDelay={4000}
      />

      {/* Ready to scan next button (after result is shown) */}
      {scanResult && !isScanning && (
        <div className="flex justify-center">
          <Button
            onClick={() => {
              setScanResult(null);
              void startScanning();
            }}
            size="lg"
            className="shadow-lg"
          >
            <Camera className="mr-2 h-5 w-5" />
            Scan Next Ticket
          </Button>
        </div>
      )}
    </div>
  );
}
