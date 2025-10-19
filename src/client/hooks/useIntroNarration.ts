/**
 * useIntroNarration Hook
 *
 * Phase 1-3 통합: react-type-animation 기반 시네마틱 타이핑
 * - Phase 1: 문자 단위 타이핑 (120-180ms/char)
 * - Phase 2: Se7en 스타일 jitter 효과
 * - Phase 3: 3단계 페이싱 최적화
 */

import { useMemo, useState, useCallback } from 'react';
import type { IntroNarration, NarrationPhase } from '../../shared/types';

/**
 * Phase별 페이싱 프로파일
 *
 * speed: react-type-animation speed (1-99, 낮을수록 빠름)
 * - 40-45 = ~120ms/char (빠름)
 * - 50-55 = ~150ms/char (중간)
 * - 60-65 = ~180ms/char (느림)
 */
interface PacingProfile {
  /** react-type-animation speed 값 */
  speed: number;
  /** 문장 종료 후 기본 pause (ms) */
  pauseAfterSentence: number;
  /** Phase 종료 후 pause (ms) */
  pauseAfterPhase: number;
  /** 분위기 태그 */
  mood: string;
}

/**
 * Phase별 최적 속도 프로파일
 */
const PACING_PROFILES: Record<NarrationPhase, PacingProfile> = {
  // Atmosphere: 느리게, 분위기 조성
  atmosphere: {
    speed: 65,
    pauseAfterSentence: 800,
    pauseAfterPhase: 1200,
    mood: 'calm-ominous'
  },
  // Incident: 빠르게, 긴장감
  incident: {
    speed: 45,
    pauseAfterSentence: 500,
    pauseAfterPhase: 1000,
    mood: 'urgent-panic'
  },
  // Stakes: 중간, 중요성 강조
  stakes: {
    speed: 55,
    pauseAfterSentence: 900,
    pauseAfterPhase: 1500,
    mood: 'heavy-dramatic'
  }
};

/**
 * TypeAnimation sequence 타입
 */
type SequenceElement = string | number | ((element: HTMLElement | null) => void | Promise<void>);
type SequenceArray = SequenceElement[];

/**
 * Hook 반환 타입
 */
interface UseIntroNarrationReturn {
  /** TypeAnimation에 전달할 sequence */
  sequence: SequenceArray;
  /** 현재 Phase */
  currentPhase: NarrationPhase;
  /** 전체 완료 여부 */
  isComplete: boolean;
  /** 현재 Phase 속도 프로파일 */
  currentPacingProfile: PacingProfile;
  /** Skip 함수 */
  skip: () => void;
}

/**
 * 구두점 기반 추가 pause 계산
 */
function getPunctuationPause(text: string): number {
  const trimmed = text.trim();

  if (trimmed.endsWith('...')) return 500;
  if (trimmed.endsWith('!') || trimmed.endsWith('?')) return 300;
  if (trimmed.endsWith('.') || trimmed.endsWith('。')) return 200;
  if (trimmed.endsWith(',') || trimmed.endsWith('、')) return 100;

  return 0;
}

/**
 * 문장 길이 기반 동적 pause 계산
 */
function calculateDynamicPause(
  sentence: string,
  baselinePause: number
): number {
  const length = sentence.trim().length;

  // 짧은 문장 (< 20자): 70% pause
  if (length < 20) return Math.round(baselinePause * 0.7);

  // 긴 문장 (> 60자): 130% pause
  if (length > 60) return Math.round(baselinePause * 1.3);

  // 보통 문장: 기본 pause
  return baselinePause;
}

/**
 * TypeAnimation sequence 생성
 */
function generateNarrationSequence(
  narration: IntroNarration,
  onPhaseChange: (phase: NarrationPhase) => void,
  onComplete: () => void
): SequenceArray {
  const sequence: SequenceArray = [];

  // Phase 순서
  const phases: NarrationPhase[] = ['atmosphere', 'incident', 'stakes'];

  phases.forEach((phase, phaseIndex) => {
    const text = narration[phase];
    const profile = PACING_PROFILES[phase];

    // Phase 시작 콜백
    if (phaseIndex > 0) {
      sequence.push(() => onPhaseChange(phase));
    }

    // 문장 분할 (마침표, 느낌표, 물음표 기준)
    const sentences = text.split(/([.!?。])/);
    let currentSentence = '';

    sentences.forEach((segment, idx) => {
      if (segment.trim()) {
        currentSentence += segment;

        // 구두점이면 문장 완성
        if (['.', '!', '?', '。'].includes(segment)) {
          // 문장 추가
          sequence.push(currentSentence);

          // 동적 pause 계산
          const basePause = profile.pauseAfterSentence;
          const dynamicPause = calculateDynamicPause(currentSentence, basePause);
          const punctuationPause = getPunctuationPause(currentSentence);

          const totalPause = dynamicPause + punctuationPause;
          sequence.push(totalPause);

          currentSentence = '';
        }
      }
    });

    // 남은 텍스트 처리 (구두점 없는 경우)
    if (currentSentence.trim()) {
      sequence.push(currentSentence);
      sequence.push(profile.pauseAfterSentence);
    }

    // Phase 완료 pause
    sequence.push(profile.pauseAfterPhase);
  });

  // 전체 완료 콜백
  sequence.push(() => onComplete());

  return sequence;
}

/**
 * useIntroNarration Hook
 *
 * @param narration - 인트로 나레이션 데이터
 * @returns sequence, currentPhase, isComplete, skip
 */
export function useIntroNarration(
  narration: IntroNarration
): UseIntroNarrationReturn {
  // ============================================================================
  // State
  // ============================================================================

  const [currentPhase, setCurrentPhase] = useState<NarrationPhase>('atmosphere');
  const [isComplete, setIsComplete] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);

  // ============================================================================
  // Callbacks
  // ============================================================================

  /**
   * Phase 변경 핸들러
   */
  const handlePhaseChange = useCallback((phase: NarrationPhase) => {
    setCurrentPhase(phase);
  }, []);

  /**
   * 완료 핸들러
   */
  const handleComplete = useCallback(() => {
    setIsComplete(true);
  }, []);

  /**
   * Skip 함수
   */
  const skip = useCallback(() => {
    setSkipRequested(true);
    setIsComplete(true);
  }, []);

  // ============================================================================
  // Sequence 생성 (useMemo로 최적화)
  // ============================================================================

  const sequence = useMemo(() => {
    // Skip 요청 시 빈 sequence 반환 (즉시 완료)
    if (skipRequested) {
      return [() => handleComplete()];
    }

    return generateNarrationSequence(
      narration,
      handlePhaseChange,
      handleComplete
    );
  }, [narration, skipRequested, handlePhaseChange, handleComplete]);

  // ============================================================================
  // 현재 Phase 프로파일
  // ============================================================================

  const currentPacingProfile = PACING_PROFILES[currentPhase];

  // ============================================================================
  // Return
  // ============================================================================

  return {
    sequence,
    currentPhase,
    isComplete,
    currentPacingProfile,
    skip
  };
}
