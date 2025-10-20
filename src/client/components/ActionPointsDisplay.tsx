/**
 * ActionPointsDisplay.tsx
 *
 * Displays current action points with visual feedback
 * Shows progress bar and color-coded status
 */

import { motion } from 'framer-motion';

export interface ActionPointsDisplayProps {
  currentAP: number;
  maxAP: number;
  compact?: boolean;
}

/**
 * ActionPointsDisplay Component
 *
 * Features:
 * - Color-coded status (green/yellow/red based on percentage)
 * - Animated progress bar
 * - Battery emoji indicator
 * - Compact mode for mobile
 */
export function ActionPointsDisplay({
  currentAP,
  maxAP,
  compact = false,
}: ActionPointsDisplayProps) {
  // Calculate percentage
  const percentage = maxAP > 0 ? (currentAP / maxAP) * 100 : 0;

  // Determine color based on percentage
  const getColor = () => {
    if (percentage > 50) return 'text-green-400';
    if (percentage > 25) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getBarColor = () => {
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBatteryEmoji = () => {
    if (percentage > 75) return '🔋';
    if (percentage > 50) return '🔋';
    if (percentage > 25) return '🪫';
    return '🪫';
  };

  if (compact) {
    return (
      <motion.div
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 rounded-lg border border-gray-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-lg">{getBatteryEmoji()}</span>
        <span className={`font-bold ${getColor()}`}>
          {currentAP}/{maxAP}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gray-800 rounded-lg border-2 border-gray-700 p-4 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getBatteryEmoji()}</span>
          <span className="text-sm font-medium text-gray-400">액션 포인트</span>
        </div>
        <span className={`text-xl font-bold ${getColor()}`}>
          {currentAP} / {maxAP}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className={`h-3 rounded-full ${getBarColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Status text */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        {percentage > 50 && '충분한 포인트'}
        {percentage <= 50 && percentage > 25 && '포인트가 부족해지고 있습니다'}
        {percentage <= 25 && percentage > 0 && '⚠️ 포인트가 거의 없습니다'}
        {percentage === 0 && '❌ 포인트가 모두 소진되었습니다'}
      </div>
    </motion.div>
  );
}
