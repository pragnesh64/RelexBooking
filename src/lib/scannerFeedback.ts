/**
 * Scanner Feedback Utilities
 *
 * Provides audio and haptic feedback for QR scanner results:
 * - Success sounds (beep/ding)
 * - Error sounds (buzz)
 * - Vibration patterns (if supported)
 * - Visual flash effects
 */

/**
 * Audio context for Web Audio API
 * (More reliable than HTML5 Audio for short sounds)
 */
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }
  return audioContext;
}

/**
 * Play success beep sound (high-pitched, pleasant)
 */
export function playSuccessSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Create oscillator for beep sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Success sound: High-pitched pleasant beep (800Hz then 1000Hz)
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
    oscillator.type = 'sine';

    // Volume envelope (fade in and out)
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);

    // Play
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch (error) {
    console.warn('Failed to play success sound:', error);
  }
}

/**
 * Play error buzz sound (low-pitched, attention-grabbing)
 */
export function playErrorSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Create oscillator for buzz sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Error sound: Low buzz (200Hz)
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.type = 'sawtooth'; // Harsher sound for error

    // Volume envelope
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);

    // Play
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.warn('Failed to play error sound:', error);
  }
}

/**
 * Trigger device vibration (mobile devices)
 *
 * @param pattern - Vibration pattern in milliseconds
 *   - Single number: vibrate for that duration
 *   - Array: [vibrate, pause, vibrate, pause, ...]
 */
export function vibrate(pattern: number | number[]): void {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }
}

/**
 * Success vibration pattern (short, pleasant)
 */
export function vibrateSuccess(): void {
  vibrate([50, 50, 50]); // Short-pause-short
}

/**
 * Error vibration pattern (longer, attention-grabbing)
 */
export function vibrateError(): void {
  vibrate([200, 100, 200]); // Long-pause-long
}

/**
 * Flash the screen with a color (visual feedback)
 *
 * @param color - CSS color (e.g., 'green', '#00ff00', 'rgba(0, 255, 0, 0.3)')
 * @param duration - Duration in milliseconds
 */
export function flashScreen(color: string, duration: number = 200): void {
  try {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: ${color};
      opacity: 0.3;
      z-index: 9999;
      pointer-events: none;
      transition: opacity ${duration}ms ease-out;
    `;

    document.body.appendChild(overlay);

    // Fade out and remove
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, duration);
    }, 50);
  } catch (error) {
    console.warn('Failed to flash screen:', error);
  }
}

/**
 * Complete success feedback (sound + vibration + flash)
 */
export function triggerSuccessFeedback(): void {
  playSuccessSound();
  vibrateSuccess();
  flashScreen('rgba(34, 197, 94, 0.3)', 300); // Green flash
}

/**
 * Complete error feedback (sound + vibration + flash)
 */
export function triggerErrorFeedback(): void {
  playErrorSound();
  vibrateError();
  flashScreen('rgba(239, 68, 68, 0.3)', 400); // Red flash
}

/**
 * Warning feedback (moderate sound + vibration)
 */
export function triggerWarningFeedback(): void {
  const ctx = getAudioContext();
  if (ctx) {
    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Warning sound: Mid-range tone (500Hz)
      oscillator.frequency.setValueAtTime(500, ctx.currentTime);
      oscillator.type = 'triangle';

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.warn('Failed to play warning sound:', error);
    }
  }

  vibrate([100]); // Single medium vibration
  flashScreen('rgba(234, 179, 8, 0.3)', 300); // Yellow flash
}

/**
 * Request audio context activation (must be called from user interaction)
 * Call this on first user button click to enable audio on iOS/mobile
 */
export function activateAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch((error) => {
      console.warn('Failed to activate audio context:', error);
    });
  }
}

/**
 * Check if audio is supported
 */
export function isAudioSupported(): boolean {
  return getAudioContext() !== null;
}

/**
 * Check if vibration is supported
 */
export function isVibrationSupported(): boolean {
  return 'vibrate' in navigator;
}
