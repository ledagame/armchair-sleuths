/**
 * APHeader.tsx
 *
 * Film noir detective-themed AP header badge
 * Displays current action points with visual feedback
 */

import { motion } from 'framer-motion';

export interface APHeaderProps {
  current: number;
  maximum: number;
  className?: string;
}

/**
 * APHeader Component
 *
 * Features:
 * - Fixed position header badge showing current AP
 * - Color-coded status based on AP percentage
 * - Smooth animations on value changes
 * - Film noir detective aesthetic (dark, moody, gold accents)
 * - Energy bolt icon for visual recognition
 */
export function APHeader({ current, maximum, className = '' }: APHeaderProps) {
  // Calculate percentage for visual indicator
  const percentage = maximum > 0 ? (current / maximum) * 100 : 0;

  // Color coding based on AP level (detective theme)
  const getAPColor = () => {
    if (percentage >= 75) return 'text-green-400';
    if (percentage >= 40) return 'text-amber-400';
    if (percentage >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  // Background glow effect based on AP level
  const getGlowColor = () => {
    if (percentage >= 75) return 'shadow-green-500/20';
    if (percentage >= 40) return 'shadow-amber-500/20';
    if (percentage >= 20) return 'shadow-orange-500/20';
    return 'shadow-red-500/20';
  };

  return (
    <motion.div
      className={`ap-header fixed top-4 right-4 z-50 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div
        className={`
          ap-badge bg-noir-charcoal/90 backdrop-blur-sm
          border-2 border-detective-gold rounded-lg
          px-4 py-2 shadow-xl ${getGlowColor()}
          flex items-center gap-3
        `}
      >
        {/* Energy Icon */}
        <motion.svg
          className="w-6 h-6 text-detective-gold flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          animate={{
            scale: percentage < 20 ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: percentage < 20 ? Infinity : 0,
            repeatType: 'loop',
          }}
        >
          <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
        </motion.svg>

        {/* AP Count */}
        <div className="flex items-baseline gap-1">
          <motion.span
            key={current}
            className={`text-2xl font-bold tabular-nums ${getAPColor()}`}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
          >
            {current}
          </motion.span>
          <span className="text-sm text-gray-400">/ {maximum}</span>
        </div>

        {/* Label */}
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium hidden sm:inline">
          Action Points
        </span>

        {/* Mobile-only abbreviated label */}
        <span className="text-xs text-gray-400 uppercase tracking-wider font-medium sm:hidden">
          AP
        </span>
      </div>

      {/* Warning indicator for low AP */}
      {percentage < 20 && percentage > 0 && (
        <motion.div
          className="absolute -bottom-8 right-0 text-xs text-red-400 font-medium bg-red-900/50 px-2 py-1 rounded backdrop-blur-sm"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ⚠️ Low AP
        </motion.div>
      )}

      {/* Depleted indicator */}
      {percentage === 0 && (
        <motion.div
          className="absolute -bottom-8 right-0 text-xs text-red-400 font-bold bg-red-900/70 px-2 py-1 rounded backdrop-blur-sm"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ❌ AP Depleted
        </motion.div>
      )}
    </motion.div>
  );
}
