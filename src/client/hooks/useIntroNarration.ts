/**
 * useIntroNarration Hook
 *
 * Phase 1-3 통합: react-type-animation 기반 시네마틱 타이핑
 * - Phase 1: 문자 단위 타이핑 (120-180ms/char)
 * - Phase 2: Se7en 스타일 jitter 효과
 * - Phase 3: 3단계 페이싱 최적화
 */

import { useMemo, useState, useCallback } from 'react';
import type { IntroNarration, NarrationPhase, MysteryStyle } from '../../shared/types';

/**
 * Style별 전체 프로파일
 */
interface StyleProfile {
  /** 기본 속도 */
  baseSpeed: number;
  /** Pause 배수 (1.0 = 기본) */
  pauseMultiplier: number;
  /** Jitter 강도 */
  jitterIntensity: 'none' | 'low' | 'medium' | 'high';
  /** 색상 스킴 */
  colorScheme: {
    atmosphere: string;
    incident: string;
    stakes: string;
  };
}

/**
 * Mystery Style별 프로파일
 */
const STYLE_PROFILES: Record<MysteryStyle, StyleProfile> = {
  classic: {
    baseSpeed: 50,
    pauseMultiplier: 1.2,
    jitterIntensity: 'low',
    colorScheme: {
      atmosphere: '#d0d0d0',
      incident: '#ffffff',
      stakes: '#ff6b6b'
    }
  },
  noir: {
    baseSpeed: 45,
    pauseMultiplier: 0.8,
    jitterIntensity: 'medium',
    colorScheme: {
      atmosphere: '#888888',
      incident: '#ff4444',
      stakes: '#ffaa00'
    }
  },
  cozy: {
    baseSpeed: 55,
    pauseMultiplier: 1.5,
    jitterIntensity: 'none',
    colorScheme: {
      atmosphere: '#e8d4b8',
      incident: '#d46a6a',
      stakes: '#8b7355'
    }
  },
  nordic: {
    baseSpeed: 52,
    pauseMultiplier: 1.8,
    jitterIntensity: 'low',
    colorScheme: {
      atmosphere: '#6a7a8a',
      incident: '#4a5a6a',
      stakes: '#5a6a7a'
    }
  },
  honkaku: {
    baseSpeed: 48,
    pauseMultiplier: 1.0,
    jitterIntensity: 'none',
    colorScheme: {
      atmosphere: '#e0e0e0',
      incident: '#ffffff',
      stakes: '#c0c0c0'
    }
  }
};

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
  /** 색상 (Style-aware) */
  color: string;
  /** Jitter 강도 (Style-aware) */
  jitterIntensity: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Style에 따른 Phase별 페이싱 프로파일 생성
 */
function generatePacingProfiles(style: MysteryStyle = 'classic'): Record<NarrationPhase, PacingProfile> {
  const styleProfile = STYLE_PROFILES[style];

  return {
    // Atmosphere: 느리게, 분위기 조성
    atmosphere: {
      speed: styleProfile.baseSpeed,
      pauseAfterSentence: Math.round(1000 * styleProfile.pauseMultiplier),
      pauseAfterPhase: Math.round(1500 * styleProfile.pauseMultiplier),
      mood: 'calm-ominous',
      color: styleProfile.colorScheme.atmosphere,
      jitterIntensity: styleProfile.jitterIntensity
    },
    // Incident: 빠르게, 긴장감
    incident: {
      speed: styleProfile.baseSpeed,
      pauseAfterSentence: Math.round(400 * styleProfile.pauseMultiplier),
      pauseAfterPhase: Math.round(800 * styleProfile.pauseMultiplier),
      mood: 'urgent-panic',
      color: styleProfile.colorScheme.incident,
      jitterIntensity: styleProfile.jitterIntensity
    },
    // Stakes: 중간, 중요성 강조
    stakes: {
      speed: styleProfile.baseSpeed,
      pauseAfterSentence: Math.round(700 * styleProfile.pauseMultiplier),
      pauseAfterPhase: Math.round(1200 * styleProfile.pauseMultiplier),
      mood: 'heavy-dramatic',
      color: styleProfile.colorScheme.stakes,
      jitterIntensity: styleProfile.jitterIntensity
    }
  };
}

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
  pacingProfiles: Record<NarrationPhase, PacingProfile>,
  onPhaseChange: (phase: NarrationPhase) => void,
  onComplete: () => void
): SequenceArray {
  const sequence: SequenceArray = [];

  // Phase 순서
  const phases: NarrationPhase[] = ['atmosphere', 'incident', 'stakes'];

  phases.forEach((phase, phaseIndex) => {
    const text = narration[phase];
    const profile = pacingProfiles[phase];

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
  // Style-aware Pacing Profiles
  // ============================================================================

  const pacingProfiles = useMemo(() => {
    const style = narration.mysteryStyle || 'classic';
    return generatePacingProfiles(style);
  }, [narration.mysteryStyle]);

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
      pacingProfiles,
      handlePhaseChange,
      handleComplete
    );
  }, [narration, pacingProfiles, skipRequested, handlePhaseChange, handleComplete]);

  // ============================================================================
  // 현재 Phase 프로파일
  // ============================================================================

  const currentPacingProfile = pacingProfiles[currentPhase];

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
