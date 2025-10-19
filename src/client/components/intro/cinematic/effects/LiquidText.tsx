/**
 * LiquidText.tsx
 *
 * Liquid Morphing 효과 컴포넌트
 * - SVG 필터를 사용한 유동적 변형
 * - Metaball 블롭 효과
 * - 부드러운 애니메이션 전환
 */

'use client';

import { motion } from 'framer-motion';
import { ReactNode, useId } from 'react';

/**
 * LiquidText Props
 */
export interface LiquidTextProps {
  /** 표시할 텍스트 또는 컴포넌트 */
  children: ReactNode;

  /** 블러 강도 (0-50, 기본: 20) */
  blurIntensity?: number;

  /** 색상 매트릭스 강도 (0-1, 기본: 0.7) */
  colorMatrixIntensity?: number;

  /** 애니메이션 지속 시간 (초, 기본: 3) */
  duration?: number;

  /** 애니메이션 반복 (기본: Infinity) */
  repeat?: number;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 색상 (기본: currentColor) */
  color?: string;
}

/**
 * LiquidText 컴포넌트
 *
 * SVG 필터를 사용하여 텍스트가 유동적으로 변형되는 효과를 만듭니다.
 * Metaball 블롭 효과로 몰입감 있는 비주얼을 제공합니다.
 *
 * @example
 * <LiquidText blurIntensity={25} duration={4}>
 *   피가 흐른다...
 * </LiquidText>
 */
export function LiquidText({
  children,
  blurIntensity = 20,
  colorMatrixIntensity = 0.7,
  duration = 3,
  repeat = Infinity,
  className = '',
  color = 'currentColor'
}: LiquidTextProps) {
  // ============================================================================
  // Unique ID for SVG filter
  // ============================================================================

  const filterId = useId();
  const uniqueFilterId = `liquid-filter-${filterId}`;

  // ============================================================================
  // Animation Variants
  // ============================================================================

  const liquidVariants = {
    initial: {
      filter: `url(#${uniqueFilterId})`,
    },
    animate: {
      filter: [
        `url(#${uniqueFilterId})`,
        `url(#${uniqueFilterId})`,
        `url(#${uniqueFilterId})`,
      ],
      transition: {
        duration,
        repeat,
        ease: 'easeInOut',
      },
    },
  };

  // ============================================================================
  // SVG Filter Animation Values
  // ============================================================================

  // feGaussianBlur의 stdDeviation 값을 애니메이션
  const blurValues = [
    blurIntensity * 0.5,
    blurIntensity,
    blurIntensity * 0.5
  ];

  // feColorMatrix의 alpha 값을 애니메이션
  const alphaValues = [
    colorMatrixIntensity * 0.8,
    colorMatrixIntensity,
    colorMatrixIntensity * 0.8
  ];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      {/* SVG 필터 정의 */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={uniqueFilterId} x="-50%" y="-50%" width="200%" height="200%">
            {/* Gaussian Blur */}
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurIntensity}>
              <animate
                attributeName="stdDeviation"
                values={blurValues.join(';')}
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </feGaussianBlur>

            {/* Color Matrix for Metaball Effect */}
            <feColorMatrix
              type="matrix"
              values={`
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 ${colorMatrixIntensity} 0
              `}
            >
              <animate
                attributeName="values"
                values={alphaValues.map(a => `
                  1 0 0 0 0
                  0 1 0 0 0
                  0 0 1 0 0
                  0 0 0 ${a} 0
                `).join(';')}
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </feColorMatrix>

            {/* Composite */}
            <feComposite operator="in" in2="SourceGraphic" />

            {/* Morphology for blob effect */}
            <feMorphology operator="dilate" radius="2">
              <animate
                attributeName="radius"
                values="1;3;1"
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </feMorphology>
          </filter>
        </defs>
      </svg>

      {/* 텍스트 컨테이너 */}
      <motion.div
        variants={liquidVariants}
        initial="initial"
        animate="animate"
        className={`
          will-change-filter
          ${className}
        `}
        style={{
          color,
          filter: `url(#${uniqueFilterId})`,
        }}
        aria-live="polite"
      >
        {children}
      </motion.div>

      {/* 접근성: 애니메이션 감소 모드 */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .will-change-filter {
            filter: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}

/**
 * LiquidBlob
 *
 * 순수 블롭 효과만 제공하는 컴포넌트
 * 배경 효과나 데코레이션용
 */
export interface LiquidBlobProps {
  /** 블롭 색상 */
  color?: string;

  /** 블롭 크기 (px) */
  size?: number;

  /** 블러 강도 */
  blurIntensity?: number;

  /** 애니메이션 지속 시간 */
  duration?: number;

  /** 추가 CSS 클래스 */
  className?: string;
}

export function LiquidBlob({
  color = '#ff6b6b',
  size = 100,
  blurIntensity = 30,
  duration = 4,
  className = ''
}: LiquidBlobProps) {
  const filterId = useId();
  const uniqueFilterId = `blob-filter-${filterId}`;

  return (
    <>
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={uniqueFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blurIntensity}>
              <animate
                attributeName="stdDeviation"
                values={`${blurIntensity};${blurIntensity * 1.5};${blurIntensity}`}
                dur={`${duration}s`}
                repeatCount="indefinite"
              />
            </feGaussianBlur>
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
            />
          </filter>
        </defs>
      </svg>

      <motion.div
        className={`rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          filter: `url(#${uniqueFilterId})`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />
    </>
  );
}
