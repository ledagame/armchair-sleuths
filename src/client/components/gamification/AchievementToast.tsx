/**
 * AchievementToast.tsx
 *
 * Toast notification for achievement unlocks
 * Provides delightful feedback when players earn badges
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Achievement } from '../../utils/evidenceRarity';
import { ConfettiExplosion } from '../effects/ConfettiExplosion';

export interface AchievementToastProps {
  achievement: Achievement | null;
  onClose?: () => void;
  duration?: number; // Auto-close duration in ms
}

/**
 * AchievementToast Component
 *
 * Shows a celebratory toast when an achievement is unlocked
 * Features:
 * - Slide-in animation from top
 * - Confetti burst
 * - Auto-dismiss after duration
 * - Manual dismiss on click
 * - Accessible with ARIA live region
 */
export function AchievementToast({
  achievement,
  onClose,
  duration = 5000,
}: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      setShowConfetti(true);

      // Auto-dismiss after duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      // Stop confetti after 2 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    } else {
      setIsVisible(false);
    }
  }, [achievement, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300); // Wait for exit animation
  };

  if (!achievement) return null;

  return (
    <>
      {/* Confetti Effect */}
      <ConfettiExplosion
        trigger={showConfetti}
        intensity="high"
        duration={2000}
      />

      {/* Toast */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            <motion.div
              className="
                bg-gradient-to-r from-detective-gold/20 to-yellow-600/20
                border-2 border-detective-gold
                rounded-lg shadow-2xl
                overflow-hidden
                cursor-pointer
                backdrop-blur-md
              "
              onClick={handleClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.5, delay: 0.2 }}
              />

              {/* Content */}
              <div className="relative p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Achievement icon */}
                  <motion.div
                    className="flex-shrink-0 text-5xl sm:text-6xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    {achievement.emoji}
                  </motion.div>

                  {/* Text content */}
                  <div className="flex-1 min-w-0">
                    <motion.div
                      className="flex items-center gap-2 mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <span className="text-xs font-bold text-detective-gold uppercase tracking-wide">
                        업적 달성!
                      </span>
                      <span className="text-xl">🎉</span>
                    </motion.div>

                    <motion.h3
                      className="text-lg sm:text-xl font-bold text-white mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      {achievement.name}
                    </motion.h3>

                    <motion.p
                      className="text-sm text-gray-300"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {achievement.description}
                    </motion.p>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClose();
                    }}
                    className="
                      flex-shrink-0 text-gray-400 hover:text-white
                      transition-colors duration-200
                      p-1 rounded
                      focus:outline-none focus:ring-2 focus:ring-detective-gold
                    "
                    aria-label="닫기"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
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
                </div>

                {/* Progress bar */}
                <motion.div
                  className="mt-3 h-1 bg-gray-700/50 rounded-full overflow-hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.div
                    className="h-full bg-detective-gold"
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * AchievementToastManager Component
 *
 * Manages a queue of achievement toasts to prevent overlapping
 */
interface AchievementToastManagerProps {
  achievements: Achievement[];
  onDismiss?: (achievementId: string) => void;
}

export function AchievementToastManager({
  achievements,
  onDismiss,
}: AchievementToastManagerProps) {
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Add new achievements to queue
  useEffect(() => {
    const newAchievements = achievements.filter(a => a.unlocked);
    if (newAchievements.length > 0) {
      setQueue(prev => [...prev, ...newAchievements]);
    }
  }, [achievements]);

  // Show next achievement from queue
  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentAchievement(next);
      setQueue(rest);
    }
  }, [currentAchievement, queue]);

  const handleClose = () => {
    if (currentAchievement) {
      onDismiss?.(currentAchievement.id);
      setCurrentAchievement(null);
    }
  };

  return (
    <AchievementToast
      achievement={currentAchievement}
      onClose={handleClose}
      duration={5000}
    />
  );
}
