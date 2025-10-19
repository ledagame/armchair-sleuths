/**
 * MotionText.tsx
 *
 * Motion Tracking 텍스트 컴포넌트
 * - 마우스/스크롤 움직임에 반응하는 텍스트
 * - 부드러운 스프링 애니메이션
 * - GPU 가속 최적화
 */

'use client';

import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import { useEffect, useRef, ReactNode } from 'react';

/**
 * Motion Tracking 모드
 */
export type MotionTrackingMode = 'mouse' | 'scroll' | 'hybrid';

/**
 * MotionText Props
 */
export interface MotionTextProps {
  /** 표시할 텍스트 또는 컴포넌트 */
  children: ReactNode;

  /** Tracking 모드 (기본: mouse) */
  mode?: MotionTrackingMode;

  /** 움직임 강도 (0-1, 기본: 0.15) */
  intensity?: number;

  /** 스프링 부드러움 (0-1, 기본: 0.3) */
  smoothness?: number;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 접근성: 애니메이션 감소 모드 지원 (기본: true) */
  respectReducedMotion?: boolean;
}

/**
 * MotionText 컴포넌트
 *
 * 마우스 또는 스크롤 움직임에 반응하여 텍스트가 자연스럽게 움직입니다.
 *
 * @example
 * <MotionText mode="mouse" intensity={0.2}>
 *   살인사건 현장에 도착했다...
 * </MotionText>
 */
export function MotionText({
  children,
  mode = 'mouse',
  intensity = 0.15,
  smoothness = 0.3,
  className = '',
  respectReducedMotion = true
}: MotionTextProps) {
  // ============================================================================
  // Refs & Motion Values
  // ============================================================================

  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // ============================================================================
  // Spring Configuration
  // ============================================================================

  const springConfig = {
    damping: 20,
    stiffness: 100,
    mass: smoothness
  };

  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // ============================================================================
  // Scroll Tracking
  // ============================================================================

  const { scrollYProgress } = useScroll();
  const scrollX = useTransform(scrollYProgress, [0, 1], [0, 100 * intensity]);
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, -100 * intensity]);

  // ============================================================================
  // Mouse Tracking
  // ============================================================================

  useEffect(() => {
    if (mode === 'scroll') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // 마우스와 중심점 사이의 거리 계산
      const deltaX = (e.clientX - centerX) * intensity;
      const deltaY = (e.clientY - centerY) * intensity;

      mouseX.set(deltaX);
      mouseY.set(deltaY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mode, intensity, mouseX, mouseY]);

  // ============================================================================
  // Motion Values Selection
  // ============================================================================

  const motionX = mode === 'scroll' ? scrollX : mode === 'mouse' ? x : x;
  const motionY = mode === 'scroll' ? scrollY : mode === 'mouse' ? y : y;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <motion.div
      ref={containerRef}
      style={{
        x: motionX,
        y: motionY,
      }}
      className={`
        will-change-transform
        transform-gpu
        ${className}
      `}
      aria-live="polite"
    >
      {children}

      {/* 접근성: 애니메이션 감소 모드 */}
      {respectReducedMotion && (
        <style>{`
          @media (prefers-reduced-motion: reduce) {
            .will-change-transform {
              transform: none !important;
              animation: none !important;
            }
          }
        `}</style>
      )}
    </motion.div>
  );
}
