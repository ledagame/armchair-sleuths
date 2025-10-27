/**
 * FunFactsCarousel.tsx
 *
 * Displays rotating detective tips during image generation wait
 * Auto-rotates every 5 seconds with pagination dots
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DETECTIVE_TIPS = [
  '💡 팁: 용의자의 알리바이가 구체적일수록 신빙성이 높습니다.',
  '🔍 팁: 증거 탐색 시 Thorough Search는 70% 확률로 증거를 발견합니다.',
  '🎯 팁: 용의자와 대화할 때 핵심 질문을 하면 AP를 획득할 수 있습니다.',
  '⚡ 팁: 액션 포인트(AP)를 현명하게 사용하면 더 많은 증거를 발견할 수 있습니다.',
  '🏆 팁: 좋은 추리는 증거 기반이어야 합니다. 직감만으로는 부족합니다.',
  '📚 팁: 모든 용의자와 대화하면 사건의 전체 그림이 보입니다.',
  '🔬 팁: 과학적 증거(DNA, 지문)는 결정적 증거가 될 수 있습니다.',
  '🗣️ 팁: 용의자의 감정 상태를 관찰하세요. 거짓말은 긴장을 유발합니다.',
];

const ROTATION_INTERVAL = 5000; // 5 seconds

/**
 * FunFactsCarousel Component
 *
 * Features:
 * - Auto-rotates every 5 seconds
 * - Pagination dots showing current position
 * - Smooth fade transitions
 * - Film noir theme styling
 */
export function FunFactsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % DETECTIVE_TIPS.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tip display with animation */}
      <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 shadow-lg min-h-[100px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center text-lg text-amber-100 font-medium"
          >
            {DETECTIVE_TIPS[currentIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center gap-2 mt-4">
        {DETECTIVE_TIPS.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`
              w-2 h-2 rounded-full transition-all duration-300
              ${index === currentIndex ? 'bg-blue-500 w-6' : 'bg-gray-600 hover:bg-gray-500'}
            `}
            aria-label={`Go to tip ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
