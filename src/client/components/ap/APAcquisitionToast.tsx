/**
 * APAcquisitionToast.tsx
 *
 * Celebratory notification when AP is gained during interrogation
 * Shows amount, reason, and auto-dismisses
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface APGain {
  amount: number;
  reason: string;
  timestamp: number;
}

export interface APAcquisitionToastProps {
  apGain: APGain | null;
  onComplete?: () => void;
  autoHideDuration?: number; // milliseconds
}

/**
 * APAcquisitionToast Component
 *
 * Features:
 * - Smooth entrance/exit animations
 * - Auto-dismisses after specified duration
 * - Sparkle icon with rotation animation
 * - Film noir detective theme with gold accents
 * - Responsive design (mobile-friendly)
 */
export function APAcquisitionToast({
  apGain,
  onComplete,
  autoHideDuration = 3000,
}: APAcquisitionToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (apGain) {
      setVisible(true);

      // Auto-hide after duration
      const timer = setTimeout(() => {
        setVisible(false);
        // Call onComplete after exit animation finishes
        setTimeout(() => {
          onComplete?.();
        }, 300); // Match exit animation duration
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [apGain, onComplete, autoHideDuration]);

  return (
    <AnimatePresence>
      {visible && apGain && (
        <motion.div
          className="fixed top-20 right-4 z-50 max-w-sm"
          initial={{ scale: 0.8, opacity: 0, x: 50, y: -10 }}
          animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          <div
            className="
              bg-gradient-to-r from-detective-gold/20 to-amber-500/20
              backdrop-blur-md border-2 border-detective-gold
              rounded-lg px-6 py-4 shadow-2xl
              shadow-detective-gold/30
            "
          >
            <div className="flex items-center gap-4">
              {/* Sparkle Icon with rotation */}
              <motion.svg
                className="w-10 h-10 text-detective-gold flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 0.6, ease: 'easeInOut' },
                  scale: { duration: 0.6, ease: 'easeInOut' },
                }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Reason */}
                <div className="text-sm text-amber-200 font-medium mb-1">
                  {apGain.reason}
                </div>

                {/* AP Amount */}
                <div className="flex items-center gap-2">
                  <motion.span
                    className="text-3xl font-bold text-detective-gold"
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 10,
                      delay: 0.1,
                    }}
                  >
                    +{apGain.amount} AP
                  </motion.span>

                  <motion.div
                    className="text-xs text-amber-100 font-medium"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    획득!
                  </motion.div>
                </div>
              </div>

              {/* Close button (optional) */}
              <button
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => onComplete?.(), 300);
                }}
                className="
                  text-gray-400 hover:text-gray-200
                  transition-colors duration-150
                  p-1 rounded hover:bg-white/10
                "
                aria-label="Close notification"
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

            {/* Progress bar showing auto-hide timer */}
            <motion.div
              className="mt-3 h-1 bg-detective-gold/30 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="h-full bg-detective-gold rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{
                  duration: autoHideDuration / 1000,
                  ease: 'linear',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
