/**
 * SceneManager.tsx
 *
 * 5단계 시네마틱 씬 전환 관리자
 * - Scene 1: Discovery (범죄 현장 발견)
 * - Scene 2: Entry (현장 진입)
 * - Scene 3: Confrontation (증거 대면)
 * - Scene 4: Suspects (용의자들)
 * - Scene 5: Action (수사 시작)
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, ReactNode } from 'react';

/**
 * 씬 타입
 */
export type SceneType = 'establishing' | 'entry' | 'confrontation' | 'suspects' | 'action';

/**
 * 전환 효과 타입
 */
export type TransitionType = 'dissolve' | 'wipe' | 'zoom' | 'slide';

/**
 * 씬 데이터
 */
export interface CinematicScene {
  /** 씬 타입 */
  type: SceneType;

  /** 배경 이미지 URL */
  imageUrl?: string;

  /** 씬 지속 시간 (초) */
  duration: number;

  /** 전환 효과 타입 */
  transition: TransitionType;

  /** 씬 컨텐츠 (텍스트, 컴포넌트 등) */
  content: ReactNode;
}

/**
 * SceneManager Props
 */
export interface SceneManagerProps {
  /** 씬 목록 */
  scenes: CinematicScene[];

  /** 현재 씬 인덱스 (외부 제어용) */
  currentSceneIndex?: number;

  /** 씬 변경 콜백 */
  onSceneChange?: (index: number) => void;

  /** 전체 완료 콜백 */
  onComplete?: () => void;

  /** Skip 콜백 */
  onSkip?: () => void;

  /** 자동 진행 여부 (기본: true) */
  autoProgress?: boolean;

  /** Skip 버튼 표시 여부 (기본: true) */
  showSkipButton?: boolean;
}

/**
 * 전환 효과 Variants
 */
const transitionVariants: Record<TransitionType, any> = {
  dissolve: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 1.5, ease: 'easeInOut' }
  },

  wipe: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: { duration: 1.2, ease: [0.6, 0.01, 0.05, 0.95] as const }
  },

  zoom: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
    transition: { duration: 1.8, ease: 'easeInOut' }
  },

  slide: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
    transition: { duration: 1, ease: 'easeInOut' }
  }
};

/**
 * SceneManager 컴포넌트
 *
 * 여러 씬을 순서대로 표시하고 전환 효과를 제공합니다.
 */
export function SceneManager({
  scenes,
  currentSceneIndex: externalIndex,
  onSceneChange,
  onComplete,
  onSkip,
  autoProgress = true,
  showSkipButton = true
}: SceneManagerProps) {
  // ============================================================================
  // State
  // ============================================================================

  const [internalIndex, setInternalIndex] = useState(0);
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const currentScene = scenes[currentIndex];

  // ============================================================================
  // Auto Progress
  // ============================================================================

  useEffect(() => {
    if (!autoProgress || !currentScene) return;

    const timer = setTimeout(() => {
      if (currentIndex < scenes.length - 1) {
        const nextIndex = currentIndex + 1;
        setInternalIndex(nextIndex);
        onSceneChange?.(nextIndex);
      } else {
        onComplete?.();
      }
    }, currentScene.duration * 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, currentScene, scenes.length, autoProgress, onSceneChange, onComplete]);

  // ============================================================================
  // Skip Handler
  // ============================================================================

  const handleSkip = useCallback(() => {
    onSkip?.();
    onComplete?.();
  }, [onSkip, onComplete]);

  // ============================================================================
  // Keyboard Handler
  // ============================================================================

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSkip]);

  // ============================================================================
  // Progress Calculation
  // ============================================================================

  const totalScenes = scenes.length;
  const progressPercentage = ((currentIndex + 1) / totalScenes) * 100;

  // ============================================================================
  // Render
  // ============================================================================

  if (!currentScene) return null;

  const variant = transitionVariants[currentScene.transition];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      {/* 씬 컨테이너 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={variant.transition}
          className="absolute inset-0"
        >
          {/* 배경 이미지 */}
          {currentScene.imageUrl && (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${currentScene.imageUrl})`,
              }}
              aria-hidden="true"
            >
              {/* 어두운 오버레이 (텍스트 가독성 향상) */}
              <div className="absolute inset-0 bg-black bg-opacity-40" />
            </div>
          )}

          {/* 씬 컨텐츠 */}
          <div className="relative z-10 h-full flex items-center justify-center p-6 md:p-12">
            <div className="max-w-4xl w-full text-center">
              {currentScene.content}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 하단 컨트롤 */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-4 md:gap-6 z-50">
        {/* 진행 상황 인디케이터 */}
        <div
          className="
            flex flex-col items-end gap-2
            px-3 py-2 md:px-4 md:py-2
            bg-black bg-opacity-40
            border border-white border-opacity-20
            rounded-full
            backdrop-blur-md
            transition-all duration-300
          "
        >
          <span className="text-gray-300 text-xs md:text-sm font-mono">
            Scene {currentIndex + 1}/{totalScenes}
          </span>

          {/* 프로그레스 바 */}
          <div className="w-24 md:w-32 h-1 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* 씬 인디케이터 도트 */}
          <div className="flex gap-1.5">
            {scenes.map((_, i) => (
              <div
                key={i}
                className={`
                  w-1.5 h-1.5 md:w-2 md:h-2 rounded-full
                  transition-all duration-300
                  ${
                    i === currentIndex
                      ? 'bg-white scale-125'
                      : i < currentIndex
                      ? 'bg-white bg-opacity-60'
                      : 'bg-white bg-opacity-30'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Skip 버튼 */}
        {showSkipButton && (
          <button
            onClick={handleSkip}
            className="
              group
              px-5 py-2.5 md:px-7 md:py-3.5
              bg-white bg-opacity-10 hover:bg-opacity-20 active:bg-opacity-30
              border border-white border-opacity-30 hover:border-opacity-60
              rounded-xl
              text-white text-sm md:text-base font-bold
              transition-all duration-200
              backdrop-blur-md
              focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-black
              hover:scale-105 active:scale-95
              shadow-lg hover:shadow-xl
            "
            style={{
              animation: 'pulse 2s ease-in-out infinite',
            }}
            aria-label="Skip cinematic intro"
          >
            <span className="flex items-center gap-2">
              Skip
              <span className="text-lg group-hover:translate-x-0.5 transition-transform">
                ⏭️
              </span>
            </span>
          </button>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 10px 35px -5px rgba(255, 255, 255, 0.2);
          }
        }

        /* 접근성: 애니메이션 감소 모드 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
