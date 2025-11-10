/**
 * Professional Scan Result Card Component
 *
 * Displays ticket validation results with:
 * - Animated success/error states
 * - User and booking details
 * - Color-coded feedback
 * - Auto-dismiss functionality
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, User, Ticket, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export type ScanResultType = 'success' | 'error' | 'warning';

export interface ScanResultData {
  type: ScanResultType;
  message: string;
  bookingDetails?: {
    id: string;
    userName: string;
    userEmail: string;
    ticketCount: number;
    eventTitle: string;
    checkedInAt?: string;
  };
  timestamp: string;
}

interface ScanResultCardProps {
  result: ScanResultData | null;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number; // milliseconds
}

export function ScanResultCard({
  result,
  onDismiss,
  autoDismiss = true,
  autoDismissDelay = 3000,
}: ScanResultCardProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss timer
  useEffect(() => {
    if (result && autoDismiss && result.type === 'success') {
      timerRef.current = setTimeout(() => {
        onDismiss?.();
      }, autoDismissDelay);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [result, autoDismiss, autoDismissDelay, onDismiss]);

  // Auto-scroll result into view
  useEffect(() => {
    if (result && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [result]);

  if (!result) {
    return null;
  }

  const { type, message, bookingDetails, timestamp } = result;

  // Configuration per result type
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      borderColor: 'border-green-500',
      textColor: 'text-green-900 dark:text-green-100',
      iconColor: 'text-green-600 dark:text-green-400',
      iconBgColor: 'bg-green-100 dark:bg-green-900/50',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      borderColor: 'border-red-500',
      textColor: 'text-red-900 dark:text-red-100',
      iconColor: 'text-red-600 dark:text-red-400',
      iconBgColor: 'bg-red-100 dark:bg-red-900/50',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-900 dark:text-yellow-100',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      iconBgColor: 'bg-yellow-100 dark:bg-yellow-900/50',
    },
  }[type];

  const Icon = config.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <Card
          className={`${config.bgColor} ${config.borderColor} border-l-4 shadow-lg overflow-hidden`}
        >
          <div className="p-6">
            {/* Header with icon and message */}
            <div className="flex items-start gap-4">
              {/* Animated icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className={`${config.iconBgColor} rounded-full p-3 flex-shrink-0`}
              >
                <Icon className={`${config.iconColor} h-8 w-8`} />
              </motion.div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className={`${config.textColor} text-xl font-bold mb-1`}
                >
                  {type === 'success' ? '✅ Ticket Verified!' : type === 'error' ? '❌ Invalid Ticket' : '⚠️ Warning'}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`${config.textColor} opacity-90 text-base`}
                >
                  {message}
                </motion.p>
              </div>
            </div>

            {/* Booking details (only for success) */}
            {type === 'success' && bookingDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-6 pt-4 border-t border-green-200 dark:border-green-800 space-y-3"
              >
                {/* User name */}
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-2">
                    <User className="h-5 w-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Attendee
                    </p>
                    <p className="text-base text-green-900 dark:text-green-100 font-semibold">
                      {bookingDetails.userName}
                    </p>
                    {bookingDetails.userEmail && (
                      <p className="text-sm text-green-700 dark:text-green-300 opacity-80">
                        {bookingDetails.userEmail}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ticket count */}
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-2">
                    <Ticket className="h-5 w-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Tickets
                    </p>
                    <p className="text-base text-green-900 dark:text-green-100 font-semibold">
                      {bookingDetails.ticketCount} {bookingDetails.ticketCount === 1 ? 'ticket' : 'tickets'}
                    </p>
                  </div>
                </div>

                {/* Check-in time */}
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-2">
                    <Clock className="h-5 w-5 text-green-700 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                      Checked in at
                    </p>
                    <p className="text-base text-green-900 dark:text-green-100 font-semibold">
                      {new Date(timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Booking ID (small print) */}
                <div className="mt-4 pt-3 border-t border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-400 font-mono">
                    Booking ID: {bookingDetails.id}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Timestamp */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 flex items-center justify-between"
            >
              <p className={`${config.textColor} opacity-60 text-sm`}>
                {new Date(timestamp).toLocaleString()}
              </p>

              {/* Dismiss button for errors */}
              {type === 'error' && onDismiss && (
                <button
                  onClick={onDismiss}
                  className={`${config.textColor} opacity-60 hover:opacity-100 transition-opacity text-sm font-medium underline`}
                >
                  Dismiss
                </button>
              )}
            </motion.div>

            {/* Progress bar for auto-dismiss (success only) */}
            {type === 'success' && autoDismiss && (
              <motion.div
                className="mt-4 h-1 bg-green-200 dark:bg-green-900 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  className="h-full bg-green-600 dark:bg-green-400"
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: autoDismissDelay / 1000, ease: 'linear' }}
                />
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
