/**
 * ParallaxLayer.tsx
 *
 * 3D Parallax 효과 컴포넌트
 * - 깊이감 있는 레이어 시스템
 * - 마우스/스크롤에 반응하는 3D 변환
 * - 여러 레이어를 조합하여 입체감 표현
 */

'use client';

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from 'framer-motion';
import { useEffect, useRef, ReactNode } from 'react';

/**
 * ParallaxLayer Props
 */
export interface ParallaxLayerProps {
  /** 레이어 컨텐츠 */
  children: ReactNode;

  /** 깊이 레벨 (0-1, 0=가장 뒤, 1=가장 앞, 기본: 0.5) */
  depth?: number;

  /** 수평 이동 강도 (기본: 50) */
  moveX?: number;

  /** 수직 이동 강도 (기본: 30) */
  moveY?: number;

  /** 회전 강도 (기본: 10) */
  rotateIntensity?: number;

  /** 스케일 변화 강도 (기본: 0.1) */
  scaleIntensity?: number;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 3D perspective 값 (기본: 1000px) */
  perspective?: number;
}

/**
 * ParallaxLayer 컴포넌트
 *
 * 깊이값에 따라 다르게 움직이는 3D 레이어를 생성합니다.
 * 여러 레이어를 겹쳐서 입체감 있는 장면을 만들 수 있습니다.
 *
 * @example
 * <div style={{ perspective: '1000px' }}>
 *   <ParallaxLayer depth={0.2}>배경 텍스트</ParallaxLayer>
 *   <ParallaxLayer depth={0.5}>중간 텍스트</ParallaxLayer>
 *   <ParallaxLayer depth={0.8}>전경 텍스트</ParallaxLayer>
 * </div>
 */
export function ParallaxLayer({
  children,
  depth = 0.5,
  moveX = 50,
  moveY = 30,
  rotateIntensity = 10,
  scaleIntensity = 0.1,
  className = '',
  perspective = 1000
}: ParallaxLayerProps) {
  // ============================================================================
  // Motion Values
  // ============================================================================

  const mouseX = useMotionValue(0.5); // 0-1 normalized
  const mouseY = useMotionValue(0.5); // 0-1 normalized

  const containerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // Spring Configuration
  // ============================================================================

  const springConfig = {
    damping: 25,
    stiffness: 150,
    mass: 0.5
  };

  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // ============================================================================
  // Transform Calculations
  // ============================================================================

  // 깊이에 따른 이동량 계산
  const depthFactor = 1 - depth; // 깊이가 낮을수록 더 많이 움직임

  const translateX = useTransform(
    smoothMouseX,
    [0, 1],
    [-moveX * depthFactor, moveX * depthFactor]
  );

  const translateY = useTransform(
    smoothMouseY,
    [0, 1],
    [-moveY * depthFactor, moveY * depthFactor]
  );

  const rotateX = useTransform(
    smoothMouseY,
    [0, 1],
    [rotateIntensity * depthFactor, -rotateIntensity * depthFactor]
  );

  const rotateY = useTransform(
    smoothMouseX,
    [0, 1],
    [-rotateIntensity * depthFactor, rotateIntensity * depthFactor]
  );

  const scale = useTransform(
    smoothMouseX,
    [0, 0.5, 1],
    [1 - scaleIntensity * depth, 1, 1 + scaleIntensity * depth]
  );

  // Z축 깊이 (depth가 낮을수록 더 뒤로)
  const translateZ = -perspective * (1 - depth);

  // ============================================================================
  // Mouse Tracking
  // ============================================================================

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();

      // 마우스 위치를 0-1로 정규화
      const normalizedX = (e.clientX - rect.left) / rect.width;
      const normalizedY = (e.clientY - rect.top) / rect.height;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    const handleMouseLeave = () => {
      // 마우스가 벗어나면 중앙으로 복귀
      mouseX.set(0.5);
      mouseY.set(0.5);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [mouseX, mouseY]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <motion.div
      ref={containerRef}
      style={{
        x: translateX,
        y: translateY,
        rotateX,
        rotateY,
        scale,
        z: translateZ,
        transformStyle: 'preserve-3d',
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
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .will-change-transform {
            transform: none !important;
            animation: none !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

/**
 * ParallaxContainer
 *
 * 여러 ParallaxLayer를 담는 컨테이너
 * perspective를 설정하여 3D 효과를 활성화합니다.
 */
export interface ParallaxContainerProps {
  /** 자식 요소 (ParallaxLayer들) */
  children: ReactNode;

  /** 3D perspective 값 (기본: 1000px) */
  perspective?: number;

  /** 추가 CSS 클래스 */
  className?: string;
}

export function ParallaxContainer({
  children,
  perspective = 1000,
  className = ''
}: ParallaxContainerProps) {
  return (
    <div
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
      }}
      className={`relative ${className}`}
    >
      {children}
    </div>
  );
}
