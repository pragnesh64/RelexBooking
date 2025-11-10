/**
 * Manual Check-In Component
 *
 * Fallback method for checking in attendees when:
 * - QR code is damaged/unreadable
 * - Camera is unavailable
 * - Manual override is needed
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export interface ManualCheckInData {
  bookingId?: string;
  userEmail?: string;
  userName?: string;
}

interface ManualCheckInProps {
  onSubmit: (data: ManualCheckInData) => Promise<void>;
  eventId?: string;
  loading?: boolean;
  className?: string;
}

export function ManualCheckIn({
  onSubmit,
  eventId,
  loading = false,
  className = '',
}: ManualCheckInProps) {
  const [searchType, setSearchType] = useState<'bookingId' | 'email' | 'name'>('bookingId');
  const [searchValue, setSearchValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!searchValue.trim()) {
      setError('Please enter a value to search');
      return;
    }

    try {
      const data: ManualCheckInData = {};

      if (searchType === 'bookingId') {
        data.bookingId = searchValue.trim();
      } else if (searchType === 'email') {
        data.userEmail = searchValue.trim();
      } else {
        data.userName = searchValue.trim();
      }

      await onSubmit(data);

      // Clear on success
      setSearchValue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <Card className="bg-white dark:bg-gray-800 p-6 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg p-2">
            <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Manual Check-In
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use this if QR code is damaged or unavailable
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Type Selector */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setSearchType('bookingId');
                setSearchValue('');
                setError(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === 'bookingId'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Booking ID
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType('email');
                setSearchValue('');
                setError(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === 'email'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType('name');
                setSearchValue('');
                setError(null);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                searchType === 'name'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Name
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type={searchType === 'email' ? 'email' : 'text'}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setError(null);
              }}
              placeholder={
                searchType === 'bookingId'
                  ? 'Enter booking ID (e.g., booking-abc123)'
                  : searchType === 'email'
                  ? 'Enter email address'
                  : 'Enter attendee name'
              }
              className="pl-10 h-12 text-base"
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3"
            >
              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || !searchValue.trim()}
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Find & Check In
              </>
            )}
          </Button>
        </form>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Manual check-in requires Admin/Organizer approval.
            The system will search for bookings matching your input
            {eventId && ' for this event'}.
          </p>
        </motion.div>
      </Card>
    </motion.div>
  );
}
