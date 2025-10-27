/**
 * MilestoneCelebration.tsx
 *
 * Celebration effects for evidence collection milestones
 * Shows special messages at 25%, 50%, 75%, and 100% completion
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ConfettiExplosion } from '../effects/ConfettiExplosion';

export interface MilestoneConfig {
  threshold: number; // Percentage (25, 50, 75, 100)
  title: string;
  message: string;
  emoji: string;
  color: 'blue' | 'purple' | 'orange' | 'gold';
  intensity: 'low' | 'medium' | 'high';
}

const MILESTONE_CONFIGS: MilestoneConfig[] = [
  {
    threshold: 25,
    title: '좋은 출발!',
    message: '증거 수집의 첫 걸음을 내딛었습니다. 계속하세요!',
    emoji: '👍',
    color: 'blue',
    intensity: 'low',
  },
  {
    threshold: 50,
    title: '절반 완료!',
    message: '진실에 한 걸음 더 가까워지고 있어요!',
    emoji: '⚡',
    color: 'purple',
    intensity: 'medium',
  },
  {
    threshold: 75,
    title: '거의 다 왔어요!',
    message: '마지막 증거들만 찾으면 됩니다. 조금만 더!',
    emoji: '🔥',
    color: 'orange',
    intensity: 'medium',
  },
  {
    threshold: 100,
    title: '완벽합니다!',
    message: '모든 증거를 수집했습니다! 이제 추리를 시작하세요!',
    emoji: '🎉',
    color: 'gold',
    intensity: 'high',
  },
];

const COLOR_CONFIGS = {
  blue: {
    bg: 'from-blue-600/20 to-blue-800/20',
    border: 'border-blue-500',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/50',
  },
  purple: {
    bg: 'from-purple-600/20 to-purple-800/20',
    border: 'border-purple-500',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/50',
  },
  orange: {
    bg: 'from-orange-600/20 to-orange-800/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
    glow: 'shadow-orange-500/50',
  },
  gold: {
    bg: 'from-yellow-600/20 to-yellow-800/20',
    border: 'border-yellow-500',
    text: 'text-yellow-400',
    glow: 'shadow-yellow-500/50',
  },
};

export interface MilestoneCelebrationProps {
  currentProgress: number; // 0-100
  previousProgress: number; // 0-100
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Auto-close duration in ms
}

/**
 * Determine which milestone was just reached
 */
function getMilestoneReached(
  currentProgress: number,
  previousProgress: number
): MilestoneConfig | null {
  // Find the highest milestone that was just crossed
  const reachedMilestone = MILESTONE_CONFIGS
    .reverse()
    .find(m => currentProgress >= m.threshold && previousProgress < m.threshold);

  return reachedMilestone || null;
}

/**
 * MilestoneCelebration Component
 *
 * Shows a full-screen celebration when a milestone is reached
 */
export function MilestoneCelebration({
  currentProgress,
  previousProgress,
  isOpen,
  onClose,
  duration = 4000,
}: MilestoneCelebrationProps) {
  const [milestone, setMilestone] = useState<MilestoneConfig | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const reached = getMilestoneReached(currentProgress, previousProgress);
      if (reached) {
        setMilestone(reached);
        setShowConfetti(true);

        // Auto-close after duration
        const timer = setTimeout(() => {
          handleClose();
        }, duration);

        // Stop confetti after a bit
        const confettiDuration = reached.intensity === 'high' ? 3000 : 2000;
        const confettiTimer = setTimeout(() => {
          setShowConfetti(false);
        }, confettiDuration);

        return () => {
          clearTimeout(timer);
          clearTimeout(confettiTimer);
        };
      }
    }
  }, [isOpen, currentProgress, previousProgress, duration]);

  const handleClose = () => {
    setShowConfetti(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!milestone) return null;

  const colorConfig = COLOR_CONFIGS[milestone.color];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti */}
          <ConfettiExplosion
            trigger={showConfetti}
            intensity={milestone.intensity}
            duration={milestone.intensity === 'high' ? 3000 : 2000}
          />

          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleClose}
            aria-label="닫기"
          />

          {/* Celebration card */}
          <div className="fixed inset-0 z-[51] flex items-center justify-center p-4">
            <motion.div
              className={`
                bg-gradient-to-br ${colorConfig.bg}
                border-2 ${colorConfig.border}
                rounded-2xl
                shadow-2xl ${colorConfig.glow}
                max-w-md w-full
                overflow-hidden
              `}
              initial={{ scale: 0, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 10, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="milestone-title"
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 1.5,
                  delay: 0.3,
                  repeat: milestone.threshold === 100 ? Infinity : 0,
                  repeatDelay: 2,
                }}
              />

              {/* Content */}
              <div className="relative p-8 text-center">
                {/* Emoji */}
                <motion.div
                  className="text-8xl mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  {milestone.emoji}
                </motion.div>

                {/* Title */}
                <motion.h2
                  id="milestone-title"
                  className={`text-3xl font-bold mb-3 ${colorConfig.text}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {milestone.title}
                </motion.h2>

                {/* Progress percentage */}
                <motion.div
                  className="text-6xl font-bold text-white mb-4"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                >
                  {milestone.threshold}%
                </motion.div>

                {/* Message */}
                <motion.p
                  className="text-lg text-gray-300 mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  {milestone.message}
                </motion.p>

                {/* Progress bar */}
                <motion.div
                  className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden mb-4"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.div
                    className={`h-full bg-gradient-to-r ${colorConfig.bg.replace('/20', '')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${currentProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                  />
                </motion.div>

                {/* Continue button */}
                <motion.button
                  onClick={handleClose}
                  className={`
                    px-6 py-3
                    ${colorConfig.border} border-2
                    ${colorConfig.text}
                    hover:bg-white/10
                    rounded-lg font-bold
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                  `}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {milestone.threshold === 100 ? '추리 시작하기' : '계속하기'}
                </motion.button>
              </div>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="
                  absolute top-4 right-4
                  text-gray-400 hover:text-white
                  transition-colors duration-200
                  p-2 rounded-lg hover:bg-white/10
                  focus:outline-none focus:ring-2 focus:ring-white
                "
                aria-label="닫기"
                type="button"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to track milestone progress
 */
export function useMilestoneTracking(currentProgress: number) {
  const [previousProgress, setPreviousProgress] = useState(currentProgress);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Check if a milestone was crossed
    const milestone = getMilestoneReached(currentProgress, previousProgress);

    if (milestone) {
      setShowCelebration(true);
    }

    // Update previous progress after checking
    setPreviousProgress(currentProgress);
  }, [currentProgress]);

  const handleClose = () => {
    setShowCelebration(false);
  };

  return {
    showCelebration,
    previousProgress,
    handleClose,
  };
}
