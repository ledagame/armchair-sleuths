/**
 * IntroNarration.tsx
 *
 * Phase 1-3 통합 인트로 나레이션 컴포넌트
 * - Phase 1: react-type-animation 문자 단위 타이핑 (120-180ms/char)
 * - Phase 2: Se7en 스타일 시각적 효과 (jitter, keyword emphasis)
 * - Phase 3: 3단계 페이싱 최적화 (atmosphere/incident/stakes)
 */

'use client';

import { useEffect } from 'react';
import { TypeAnimation } from 'react-type-animation';
import { useIntroNarration } from '../../hooks/useIntroNarration';
import type { IntroNarration as IntroNarrationData } from '../../../shared/types';

/**
 * IntroNarration 컴포넌트 Props
 */
interface IntroNarrationProps {
  /** 표시할 나레이션 데이터 */
  narration: IntroNarrationData;
  /** 나레이션 완료 시 호출될 콜백 */
  onComplete: () => void;
}

/**
 * 핵심 살인 미스터리 키워드
 * Phase 2: 키워드 강조용
 */
const MURDER_KEYWORDS = [
  '살인', '범인', '증거', '사건', '의문',
  '피해자', '용의자', '알리바이', '동기',
  '비밀', '진실', '거짓', '함정', '범죄',
  '시체', '현장', '수사', '혐의', '용의'
];

/**
 * Phase별 시각적 프로파일
 * Phase 2: 배경색, 텍스트 색상, jitter 강도
 */
const PHASE_VISUAL_PROFILES = {
  atmosphere: {
    textColor: '#d0d0d0',
    jitterClass: 'jitter-low',
    background: 'radial-gradient(ellipse at center, rgba(30, 30, 35, 1) 0%, rgba(0, 0, 0, 1) 100%)'
  },
  incident: {
    textColor: '#ffffff',
    jitterClass: 'jitter-high',
    background: 'radial-gradient(ellipse at center, rgba(50, 30, 30, 1) 0%, rgba(0, 0, 0, 1) 100%)'
  },
  stakes: {
    textColor: '#ff6b6b',
    jitterClass: 'jitter-medium',
    background: 'radial-gradient(ellipse at center, rgba(35, 25, 35, 1) 0%, rgba(0, 0, 0, 1) 100%)'
  }
} as const;

/**
 * IntroNarration 컴포넌트
 *
 * 케이스 시작 시 몰입감 있는 3단계 나레이션을 표시합니다:
 * 1. Atmosphere (분위기 설정)
 * 2. Incident (사건 발생)
 * 3. Stakes (플레이어 역할)
 */
export function IntroNarration({ narration, onComplete }: IntroNarrationProps) {
  // ============================================================================
  // Hooks
  // ============================================================================

  const { sequence, currentPhase, isComplete, currentPacingProfile, skip } =
    useIntroNarration(narration);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * 완료 시 onComplete 콜백 호출 (1초 후)
   */
  useEffect(() => {
    if (isComplete) {
      const timeout = setTimeout(() => {
        onComplete();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [isComplete, onComplete]);

  /**
   * 키보드 이벤트 처리 (Space/Enter로 skip)
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        skip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [skip]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const phaseIndex = currentPhase === 'atmosphere' ? 1 : currentPhase === 'incident' ? 2 : 3;
  const visualProfile = PHASE_VISUAL_PROFILES[currentPhase];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className="
        fixed inset-0
        flex flex-col items-center justify-center
        p-6 md:p-12 lg:p-16
        transition-all duration-1000
      "
      style={{
        background: visualProfile.background,
        animation: 'fadeIn 1.5s ease-in',
      }}
    >
      {/* 나레이션 텍스트 - TypeAnimation */}
      <div className="max-w-4xl w-full text-center mb-24 px-4">
        <div
          className={`
            cinematic-narration-text
            ${visualProfile.jitterClass}
            text-xl md:text-2xl lg:text-3xl
            font-serif
          `}
          style={{
            color: visualProfile.textColor,
            letterSpacing: '0.05em',
            lineHeight: '2.5',
            wordBreak: 'keep-all',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
            minHeight: '250px',
            transition: 'color 1s ease-in-out',
          }}
          role="status"
          aria-live="polite"
        >
          <TypeAnimation
            sequence={sequence}
            speed={currentPacingProfile.speed}
            wrapper="p"
            cursor={true}
            repeat={0}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre-wrap',
            }}
          />
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-4 md:gap-6">
        {/* Phase 인디케이터 */}
        <div
          className="
            flex items-center gap-2
            px-3 py-2 md:px-4 md:py-2
            bg-black bg-opacity-40
            border border-white border-opacity-20
            rounded-full
            backdrop-blur-md
            transition-all duration-300
          "
        >
          <span
            className="text-gray-300 text-xs md:text-sm font-mono"
            aria-label={`Phase ${phaseIndex} of 3`}
          >
            Phase {phaseIndex}/3
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`
                  w-1.5 h-1.5 md:w-2 md:h-2 rounded-full
                  transition-all duration-300
                  ${i === phaseIndex
                    ? 'bg-white scale-125'
                    : 'bg-white bg-opacity-30'
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* Skip 버튼 */}
        <button
          onClick={skip}
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
          aria-label="Skip narration"
        >
          <span className="flex items-center gap-2">
            Skip
            <span className="text-lg group-hover:translate-x-0.5 transition-transform">
              ⏭️
            </span>
          </span>
        </button>
      </div>

      {/* CSS 애니메이션 정의 */}
      <style>{`
        /* 기본 애니메이션 */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 10px 25px -5px rgba(255, 255, 255, 0.1);
          }
          50% {
            box-shadow: 0 10px 35px -5px rgba(255, 255, 255, 0.2);
          }
        }

        /* Phase 2: Se7en 스타일 Jitter 애니메이션 */
        @keyframes subtleNervousJitter {
          0%, 100% {
            transform: translate3d(0, 0, 0) skewX(0deg);
          }
          10% {
            transform: translate3d(-0.5px, 0.3px, 0) skewX(-0.3deg);
          }
          20% {
            transform: translate3d(0.5px, -0.3px, 0) skewX(0.3deg);
          }
          30% {
            transform: translate3d(-0.3px, 0.5px, 0) skewX(-0.2deg);
          }
          40% {
            transform: translate3d(0.3px, -0.5px, 0) skewX(0.2deg);
          }
          50% {
            transform: translate3d(-0.2px, 0.2px, 0) skewX(-0.1deg);
          }
          60% {
            transform: translate3d(0.2px, -0.2px, 0) skewX(0.1deg);
          }
          70% {
            transform: translate3d(-0.4px, 0.4px, 0) skewX(-0.25deg);
          }
          80% {
            transform: translate3d(0.4px, -0.4px, 0) skewX(0.25deg);
          }
          90% {
            transform: translate3d(-0.1px, 0.1px, 0) skewX(-0.15deg);
          }
        }

        @keyframes mediumJitter {
          0%, 100% {
            transform: translate3d(0, 0, 0) skewX(0deg);
          }
          25% {
            transform: translate3d(-0.7px, 0.5px, 0) skewX(-0.4deg);
          }
          50% {
            transform: translate3d(0.7px, -0.5px, 0) skewX(0.4deg);
          }
          75% {
            transform: translate3d(-0.5px, 0.7px, 0) skewX(-0.3deg);
          }
        }

        @keyframes highJitter {
          0%, 100% {
            transform: translate3d(0, 0, 0) skewX(0deg);
          }
          20% {
            transform: translate3d(-1px, 0.8px, 0) skewX(-0.5deg);
          }
          40% {
            transform: translate3d(1px, -0.8px, 0) skewX(0.5deg);
          }
          60% {
            transform: translate3d(-0.8px, 1px, 0) skewX(-0.4deg);
          }
          80% {
            transform: translate3d(0.8px, -1px, 0) skewX(0.4deg);
          }
        }

        /* Jitter 강도별 클래스 */
        .jitter-low {
          animation: subtleNervousJitter 2s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        .jitter-medium {
          animation: mediumJitter 1.5s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        .jitter-high {
          animation: highJitter 1s ease-in-out infinite;
          will-change: transform;
          backface-visibility: hidden;
        }

        /* GPU 가속 최적화 */
        .cinematic-narration-text {
          transform: translate3d(0, 0, 0);
          will-change: transform, color;
          backface-visibility: hidden;
        }

        /* 접근성: 고대비 모드 */
        @media (prefers-contrast: high) {
          .cinematic-narration-text {
            color: #ffffff !important;
            text-shadow: none !important;
          }
          button {
            border: 2px solid #ffffff !important;
            background: rgba(255, 255, 255, 0.2) !important;
          }
        }

        /* 접근성: 애니메이션 감소 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
          .cinematic-narration-text {
            line-height: 2.2 !important;
            letter-spacing: 0.03em !important;
          }
        }
      `}</style>
    </div>
  );
}
