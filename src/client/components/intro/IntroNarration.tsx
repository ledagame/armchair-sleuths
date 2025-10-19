/**
 * IntroNarration.tsx
 *
 * 인트로 나레이션 컴포넌트
 * 3단계 나레이션을 타이핑 효과로 표시하고 사용자 상호작용을 처리합니다.
 *
 * UX 개선사항:
 * - 향상된 타이포그래피 (글자/줄 간격 최적화)
 * - 타이핑 커서 깜빡임 효과
 * - 부드러운 Phase 전환 애니메이션
 * - 시각적으로 풍부한 배경 (그라데이션, 비네팅)
 * - 개선된 Skip 버튼 인터랙션
 * - 모바일 최적화
 */

import { useEffect, useState } from 'react';
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
 * IntroNarration 컴포넌트
 *
 * 케이스 시작 시 몰입감 있는 3단계 나레이션을 표시합니다:
 * 1. Atmosphere (분위기 설정)
 * 2. Incident (사건 발생)
 * 3. Stakes (플레이어 역할)
 *
 * @example
 * ```tsx
 * <IntroNarration
 *   narration={caseData.introNarration}
 *   onComplete={() => setCurrentScreen('case-overview')}
 * />
 * ```
 */
export function IntroNarration({ narration, onComplete }: IntroNarrationProps) {
  // ============================================================================
  // Hooks
  // ============================================================================

  const { displayedText, currentPhase, isComplete, skip } = useIntroNarration(narration);
  const [phaseKey, setPhaseKey] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

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
   * Phase 변경 시 페이드 애니메이션을 위한 key 업데이트
   */
  useEffect(() => {
    setPhaseKey(prev => prev + 1);
  }, [currentPhase]);

  /**
   * 타이핑 상태 추적 (커서 표시 여부)
   */
  useEffect(() => {
    const fullText = narration[currentPhase];
    setIsTyping(displayedText.length < fullText.length);
  }, [displayedText, currentPhase, narration]);

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

  /**
   * Phase 인디케이터 계산 (1/3, 2/3, 3/3)
   */
  const phaseIndex = currentPhase === 'atmosphere' ? 1 : currentPhase === 'incident' ? 2 : 3;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className="
        fixed inset-0
        flex flex-col items-center justify-center
        p-6 md:p-12 lg:p-16
      "
      style={{
        background: `
          radial-gradient(ellipse at center, rgba(30, 30, 35, 1) 0%, rgba(0, 0, 0, 1) 100%),
          radial-gradient(ellipse at center, transparent 60%, rgba(0, 0, 0, 0.8) 100%)
        `,
        animation: 'fadeIn 1.5s ease-in',
      }}
    >
      {/* 나레이션 텍스트 */}
      <div className="max-w-4xl w-full text-center mb-24 px-4">
        <p
          key={phaseKey}
          className="
            text-white
            text-xl md:text-2xl lg:text-3xl
            font-serif
            transition-opacity duration-500
          "
          style={{
            letterSpacing: '0.05em',
            lineHeight: '2.5',
            wordBreak: 'keep-all',
            textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
            minHeight: '250px',
            opacity: displayedText ? 1 : 0.3,
            animation: 'textFadeIn 0.5s ease-in',
          }}
          role="status"
          aria-live="polite"
        >
          {displayedText}
          {isTyping && (
            <span
              className="inline-block ml-1"
              style={{
                animation: 'blink 1s step-end infinite',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              |
            </span>
          )}
        </p>
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
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes textFadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
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

        /* 접근성: 고대비 모드 */
        @media (prefers-contrast: high) {
          .text-white {
            color: #ffffff;
            text-shadow: none;
          }
          button {
            border: 2px solid #ffffff;
            background: rgba(255, 255, 255, 0.2);
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
          p {
            line-height: 2.2 !important;
            letter-spacing: 0.03em !important;
          }
        }
      `}</style>
    </div>
  );
}
