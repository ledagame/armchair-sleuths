/**
 * CinematicScenes.tsx
 *
 * 5단계 시네마틱 씬 컴포넌트들
 * - Scene 1: EstablishingScene (Discovery) - 범죄 현장 발견
 * - Scene 2: EntryScene - 현장 진입
 * - Scene 3: ConfrontationScene - 증거 대면
 * - Scene 4: SuspectsScene - 용의자들
 * - Scene 5: ActionScene - 수사 시작
 */

'use client';

import { motion } from 'framer-motion';
import { MotionText } from '../effects/MotionText';
import { ParallaxLayer, ParallaxContainer } from '../effects/ParallaxLayer';
import { LiquidText } from '../effects/LiquidText';
import type { IntroNarration } from '../../../../shared/types';

/**
 * Scene Props 기본 타입
 */
interface BaseSceneProps {
  /** 나레이션 데이터 */
  narration: IntroNarration;
}

// ============================================================================
// Scene 1: EstablishingScene (Discovery)
// ============================================================================

/**
 * Scene 1: 범죄 현장 발견
 *
 * - 효과: Motion Tracking (마우스 추적)
 * - 분위기: 불길한, 어두운
 * - 지속: 15초
 * - 전환: Dissolve
 */
export function EstablishingScene({ narration }: BaseSceneProps) {
  return (
    <MotionText mode="mouse" intensity={0.1} smoothness={0.4}>
      <motion.p
        className="text-2xl md:text-4xl lg:text-5xl font-serif text-gray-300"
        style={{
          letterSpacing: '0.05em',
          lineHeight: '2',
          textShadow: '0 4px 12px rgba(0, 0, 0, 0.9)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      >
        {narration.atmosphere}
      </motion.p>
    </MotionText>
  );
}

// ============================================================================
// Scene 2: EntryScene (Entry)
// ============================================================================

/**
 * Scene 2: 현장 진입
 *
 * - 효과: 3D Parallax (깊이감)
 * - 분위기: 긴장감, 탐색
 * - 지속: 15초
 * - 전환: Wipe (좌→우)
 */
export function EntryScene({ narration }: BaseSceneProps) {
  // 텍스트를 단어 단위로 분할
  const words = narration.incident.split(' ');
  const midPoint = Math.floor(words.length / 2);

  const firstHalf = words.slice(0, midPoint).join(' ');
  const secondHalf = words.slice(midPoint).join(' ');

  return (
    <ParallaxContainer perspective={1200}>
      <div className="relative">
        {/* 배경 레이어 (깊이 0.3 = 뒤쪽) */}
        <ParallaxLayer depth={0.3} moveX={60} moveY={40}>
          <motion.p
            className="text-xl md:text-3xl lg:text-4xl font-serif text-gray-400"
            style={{
              letterSpacing: '0.08em',
              lineHeight: '2.2',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1.5 }}
          >
            {firstHalf}
          </motion.p>
        </ParallaxLayer>

        {/* 전경 레이어 (깊이 0.8 = 앞쪽) */}
        <ParallaxLayer depth={0.8} moveX={30} moveY={20}>
          <motion.p
            className="text-2xl md:text-4xl lg:text-5xl font-serif text-white mt-4"
            style={{
              letterSpacing: '0.05em',
              lineHeight: '2',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.9)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            {secondHalf}
          </motion.p>
        </ParallaxLayer>
      </div>
    </ParallaxContainer>
  );
}

// ============================================================================
// Scene 3: ConfrontationScene (Evidence)
// ============================================================================

/**
 * Scene 3: 증거 대면
 *
 * - 효과: Liquid Morphing (유동적 변형)
 * - 분위기: 충격, 혼란
 * - 지속: 20초
 * - 전환: Zoom In
 */
export function ConfrontationScene({ narration }: BaseSceneProps) {
  // 텍스트를 문장 단위로 분할
  const sentences = narration.stakes.split(/([.!?。])/);
  const mainText = sentences.slice(0, 3).join('');
  const subText = sentences.slice(3).join('');

  return (
    <div className="space-y-8">
      {/* 메인 텍스트 - Liquid 효과 */}
      <LiquidText blurIntensity={25} duration={4} color="#ff6b6b">
        <motion.p
          className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold"
          style={{
            letterSpacing: '0.05em',
            lineHeight: '2',
            textShadow: '0 4px 20px rgba(255, 107, 107, 0.6)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
        >
          {mainText}
        </motion.p>
      </LiquidText>

      {/* 서브 텍스트 - 일반 페이드인 */}
      {subText && (
        <motion.p
          className="text-lg md:text-2xl lg:text-3xl font-serif text-gray-300"
          style={{
            letterSpacing: '0.05em',
            lineHeight: '2',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, delay: 1 }}
        >
          {subText}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// Scene 4: SuspectsScene (Mission)
// ============================================================================

/**
 * Scene 4: 용의자들
 *
 * - 효과: Motion Tracking + Parallax 조합
 * - 분위기: 수수께끼, 신비
 * - 지속: 20초
 * - 전환: Slide Up
 */
export function SuspectsScene({ narration }: BaseSceneProps) {
  // 재조합: stakes의 일부를 용의자 소개로 사용
  const text = narration.stakes;

  return (
    <ParallaxContainer perspective={1000}>
      <MotionText mode="hybrid" intensity={0.15}>
        <div className="space-y-6">
          {/* 타이틀 */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
          >
            <ParallaxLayer depth={0.9} rotateIntensity={5}>
              <h2
                className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-400 mb-6"
                style={{
                  letterSpacing: '0.15em',
                  textShadow: '0 2px 12px rgba(234, 179, 8, 0.6)',
                }}
              >
                용의자들
              </h2>
            </ParallaxLayer>
          </motion.div>

          {/* 본문 텍스트 */}
          <ParallaxLayer depth={0.6} moveX={40} moveY={30}>
            <motion.p
              className="text-lg md:text-2xl lg:text-3xl font-serif text-gray-200"
              style={{
                letterSpacing: '0.05em',
                lineHeight: '2.2',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
            >
              {text}
            </motion.p>
          </ParallaxLayer>
        </div>
      </MotionText>
    </ParallaxContainer>
  );
}

// ============================================================================
// Scene 5: ActionScene (Beginning)
// ============================================================================

/**
 * Scene 5: 수사 시작
 *
 * - 효과: 모든 효과 조합 (Motion + Parallax + Liquid)
 * - 분위기: 결의, 시작
 * - 지속: 20초
 * - 전환: Dissolve to Game
 */
export function ActionScene({ narration }: BaseSceneProps) {
  return (
    <ParallaxContainer perspective={1200}>
      <MotionText mode="scroll" intensity={0.2}>
        <div className="space-y-10">
          {/* 상단: Parallax 텍스트 */}
          <ParallaxLayer depth={0.7} moveX={50}>
            <motion.p
              className="text-xl md:text-3xl lg:text-4xl font-serif text-gray-300"
              style={{
                letterSpacing: '0.08em',
                lineHeight: '2',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)',
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 2 }}
            >
              진실을 밝혀라.
            </motion.p>
          </ParallaxLayer>

          {/* 중간: Liquid 강조 텍스트 */}
          <LiquidText blurIntensity={20} duration={3} color="#60a5fa">
            <motion.p
              className="text-3xl md:text-5xl lg:text-6xl font-bold"
              style={{
                letterSpacing: '0.05em',
                lineHeight: '1.8',
                textShadow: '0 4px 20px rgba(96, 165, 250, 0.6)',
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2.5, delay: 0.5 }}
            >
              수사를 시작한다.
            </motion.p>
          </LiquidText>

          {/* 하단: 추가 텍스트 */}
          <ParallaxLayer depth={0.5} moveY={40}>
            <motion.p
              className="text-lg md:text-2xl lg:text-3xl font-serif text-gray-400"
              style={{
                letterSpacing: '0.05em',
                lineHeight: '2',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.7)',
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay: 1 }}
            >
              모든 증거는 말하고 있다...
            </motion.p>
          </ParallaxLayer>
        </div>
      </MotionText>
    </ParallaxContainer>
  );
}
