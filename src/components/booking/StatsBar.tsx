/**
 * Scanner Statistics Bar Component
 *
 * Displays real-time scanning statistics:
 * - Total capacity
 * - Checked-in count
 * - Remaining capacity
 * - Progress visualization
 */

import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface StatsBarProps {
  eventTitle: string;
  totalCapacity: number;
  checkedInCount: number;
  eventDate?: string;
  className?: string;
}

export function StatsBar({
  eventTitle,
  totalCapacity,
  checkedInCount,
  eventDate,
  className = '',
}: StatsBarProps) {
  const remaining = totalCapacity - checkedInCount;
  const percentage = totalCapacity > 0 ? (checkedInCount / totalCapacity) * 100 : 0;

  // Color coding based on attendance percentage
  const getProgressColor = () => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getProgressTextColor = () => {
    if (percentage >= 90) return 'text-red-600 dark:text-red-400';
    if (percentage >= 75) return 'text-yellow-600 dark:text-yellow-400';
    if (percentage >= 50) return 'text-blue-600 dark:text-blue-400';
    return 'text-green-600 dark:text-green-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Event Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {eventTitle}
        </h2>
        {eventDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(eventDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Capacity */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-lg p-2.5">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                Total Capacity
              </p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {totalCapacity}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Checked In */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-lg p-2.5">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                Checked In
              </p>
              <motion.p
                key={checkedInCount}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-2xl font-bold text-green-900 dark:text-green-100"
              >
                {checkedInCount}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Remaining */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-3">
            <div className="bg-purple-500 rounded-lg p-2.5">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">
                Remaining
              </p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {remaining}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${getProgressTextColor()}`} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Attendance Progress
            </span>
          </div>
          <span className={`text-lg font-bold ${getProgressTextColor()}`}>
            {percentage.toFixed(1)}%
          </span>
        </div>

        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
            className={`h-full ${getProgressColor()} rounded-full relative overflow-hidden`}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
                delay: 1,
              }}
            />
          </motion.div>
        </div>

        {/* Attendance status message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center"
        >
          {percentage >= 90 ? (
            <span className="text-red-600 dark:text-red-400 font-semibold">
              ⚠️ Nearly full capacity!
            </span>
          ) : percentage >= 75 ? (
            <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
              📊 High attendance
            </span>
          ) : percentage >= 50 ? (
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              📈 Good attendance
            </span>
          ) : (
            <span className="text-green-600 dark:text-green-400 font-semibold">
              🎟️ Plenty of room available
            </span>
          )}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
