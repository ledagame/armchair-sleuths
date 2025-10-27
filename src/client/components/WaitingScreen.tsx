/**
 * WaitingScreen.tsx
 *
 * Shows image generation progress with polling and engagement elements
 * Features progress bar, elapsed time, and fun facts carousel
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FunFactsCarousel } from './FunFactsCarousel';

interface WaitingScreenProps {
  caseId: string;
  onImagesReady: () => void;
  onImagesFailed: () => void;
}

interface ImageStatusResponse {
  status: 'unknown' | 'generating' | 'ready' | 'partial';
  elapsedTime: number | null;
  estimatedTimeRemaining: number;
}

const EXPECTED_DURATION = 70000; // 70 seconds
const TIMEOUT_DURATION = 150000; // 150 seconds
const POLL_INTERVAL = 3000; // 3 seconds
const WARNING_THRESHOLD = 90000; // 90 seconds

/**
 * WaitingScreen Component
 *
 * Features:
 * - Real-time progress tracking (0-95%, never 100% until ready)
 * - API polling every 3 seconds
 * - Estimated time remaining display
 * - Fun facts carousel for engagement
 * - Warning message after 90 seconds
 * - Timeout fallback at 150 seconds
 */
export function WaitingScreen({
  caseId,
  onImagesReady,
  onImagesFailed,
}: WaitingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [estimatedRemaining, setEstimatedRemaining] = useState(70);
  const [showWarning, setShowWarning] = useState(false);

  const checkStatus = useCallback(async (startTime: number) => {
    try {
      const response = await fetch(`/api/case/${caseId}/image-status`);
      const data: ImageStatusResponse = await response.json();

      const elapsed = Date.now() - startTime;

      // Update progress (0-95%, never reach 100% until actually ready)
      const calculatedProgress = Math.min(95, (elapsed / EXPECTED_DURATION) * 100);
      setProgress(calculatedProgress);

      // Update remaining time
      const remaining = Math.max(0, Math.floor((EXPECTED_DURATION - elapsed) / 1000));
      setEstimatedRemaining(remaining);

      // Show warning after 90 seconds
      if (elapsed > WARNING_THRESHOLD) {
        setShowWarning(true);
      }

      // Check completion
      if (data.status === 'ready' || data.status === 'partial') {
        console.log('✅ Images ready, status:', data.status);
        setProgress(100); // Only now set to 100%
        onImagesReady();
        return true;
      }

      // Timeout fallback
      if (elapsed > TIMEOUT_DURATION) {
        console.warn('⚠️ Image generation timeout, proceeding anyway');
        onImagesFailed();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to check image status:', error);
      // On error, continue polling (don't fail immediately)
      return false;
    }
  }, [caseId, onImagesReady, onImagesFailed]);

  useEffect(() => {
    const startTime = Date.now();
    let pollInterval: NodeJS.Timeout | null = null;

    const startPolling = async () => {
      // Initial check
      const completed = await checkStatus(startTime);
      if (completed) return;

      // Set up polling interval
      pollInterval = setInterval(async () => {
        const completed = await checkStatus(startTime);
        if (completed && pollInterval) {
          clearInterval(pollInterval);
        }
      }, POLL_INTERVAL);
    };

    startPolling();

    // CRITICAL: Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [checkStatus]);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full space-y-8">
        {/* Film noir header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4 animate-pulse">🎬</div>
          <h1 className="text-4xl font-bold mb-2">이미지를 생성하고 있습니다...</h1>
          <p className="text-gray-400 text-lg">
            AI가 사건 현장을 재구성하고 있습니다
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Progress percentage */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-400">진행률</span>
            <span className="text-xl font-bold text-blue-400">
              {Math.floor(progress)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden mb-4">
            <motion.div
              className="h-4 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
              }}
            />
          </div>

          {/* Estimated time */}
          <div className="text-center text-sm text-gray-400">
            {estimatedRemaining > 0 ? (
              <>예상 대기 시간: 약 {estimatedRemaining}초</>
            ) : (
              <>곧 완료됩니다...</>
            )}
          </div>

          {/* Warning message */}
          {showWarning && (
            <motion.div
              className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-sm text-yellow-400 text-center">
                ⏳ 평소보다 시간이 조금 걸리고 있습니다...
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Fun facts carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-center text-gray-400 text-sm mb-4 uppercase tracking-wide">
            기다리는 동안 탐정 팁을 확인하세요
          </h2>
          <FunFactsCarousel />
        </motion.div>

        {/* Film noir decoration */}
        <motion.div
          className="text-center text-6xl opacity-20"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          🎭
        </motion.div>
      </div>
    </div>
  );
}
