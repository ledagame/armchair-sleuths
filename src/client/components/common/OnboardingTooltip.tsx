/**
 * OnboardingTooltip.tsx
 *
 * Progressive onboarding tooltips for first-time users
 * Provides contextual help with dismissible tooltips
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipStep {
  id: string;
  title: string;
  content: string;
  targetSelector?: string; // CSS selector for target element
  position?: 'top' | 'bottom' | 'left' | 'right';
  emoji?: string;
}

export interface OnboardingTooltipProps {
  steps: TooltipStep[];
  onComplete?: () => void;
  storageKey: string; // LocalStorage key for persistence
}

/**
 * OnboardingTooltip Component
 */
export function OnboardingTooltip({
  steps,
  onComplete,
  storageKey,
}: OnboardingTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Check if user has already completed onboarding
  useEffect(() => {
    const completed = localStorage.getItem(storageKey);
    if (completed === 'true') {
      setHasCompleted(true);
    } else {
      // Show first tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setIsVisible(false);
    setHasCompleted(true);
    localStorage.setItem(storageKey, 'true');
    onComplete?.();
  };

  // Reset onboarding (for testing or user preference)
  const resetOnboarding = () => {
    localStorage.removeItem(storageKey);
    setHasCompleted(false);
    setCurrentStep(0);
    setIsVisible(true);
  };

  // Make reset function available globally for testing
  useEffect(() => {
    (window as any).__resetOnboarding = resetOnboarding;
    return () => {
      delete (window as any).__resetOnboarding;
    };
  }, []);

  if (hasCompleted || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop with spotlight effect */}
          <motion.div
            className="fixed inset-0 z-[9998] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </motion.div>

          {/* Tooltip */}
          <motion.div
            className="fixed z-[9999] max-w-md"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="bg-gray-900 border-2 border-detective-gold rounded-lg shadow-2xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {step.emoji && <span className="text-3xl">{step.emoji}</span>}
                  <h3 className="text-xl font-bold text-detective-gold">
                    {step.title}
                  </h3>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-white transition-colors p-1 rounded
                           focus:outline-none focus:ring-2 focus:ring-detective-gold"
                  aria-label="건너뛰기"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <p className="text-gray-300 leading-relaxed mb-6">
                {step.content}
              </p>

              {/* Progress indicator */}
              <div className="flex items-center gap-2 mb-4">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-detective-gold'
                        : index < currentStep
                          ? 'bg-detective-gold/50'
                          : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-gray-400">
                  {currentStep + 1} / {steps.length}
                </div>
                <div className="flex items-center gap-2">
                  {!isFirstStep && (
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg
                               transition-all focus:outline-none focus:ring-2 focus:ring-detective-gold"
                    >
                      이전
                    </button>
                  )}
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-detective-gold hover:bg-detective-gold/90 text-noir-charcoal
                             font-bold rounded-lg transition-all transform hover:scale-105 active:scale-95
                             focus:outline-none focus:ring-2 focus:ring-detective-gold"
                  >
                    {isLastStep ? '시작하기' : '다음'}
                  </button>
                </div>
              </div>

              {/* Skip all link */}
              <div className="mt-4 text-center">
                <button
                  onClick={handleSkip}
                  className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
                >
                  튜토리얼 건너뛰기
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Default onboarding steps for Evidence System
 */
export const EVIDENCE_ONBOARDING_STEPS: TooltipStep[] = [
  {
    id: 'welcome',
    title: '증거 시스템에 오신 것을 환영합니다',
    content: '장소를 탐색하고, 증거를 수집하며, 사건을 해결하는 방법을 알아보세요.',
    emoji: '👋',
  },
  {
    id: 'locations',
    title: '장소 탐색',
    content: '각 장소를 탐색하여 증거를 찾을 수 있습니다. 더 철저한 탐색일수록 더 많은 증거를 발견합니다.',
    emoji: '🗺️',
  },
  {
    id: 'action-points',
    title: '액션 포인트',
    content: '탐색에는 액션 포인트가 필요합니다. 용의자와 대화하거나 특정 조건을 만족하면 추가 포인트를 얻을 수 있습니다.',
    emoji: '⚡',
  },
  {
    id: 'evidence-notebook',
    title: '수사 노트',
    content: '발견한 모든 증거는 수사 노트에 저장됩니다. 증거를 클릭하면 상세 정보를 확인할 수 있습니다.',
    emoji: '📋',
  },
  {
    id: 'rarity',
    title: '증거 희귀도',
    content: '증거는 희귀도에 따라 분류됩니다. 핵심 증거(⭐)를 찾는 것이 사건 해결의 열쇠입니다.',
    emoji: '💎',
  },
  {
    id: 'ready',
    title: '준비 완료!',
    content: '이제 본격적으로 수사를 시작할 준비가 되었습니다. 행운을 빕니다, 탐정님!',
    emoji: '🎉',
  },
];
