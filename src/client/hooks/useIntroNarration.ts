import { useState, useEffect, useCallback } from 'react';
import type { IntroNarration, NarrationPhase } from '../../shared/types';

/**
 * useIntroNarration Hook 반환 타입
 */
interface UseIntroNarrationReturn {
  /** 현재 표시 중인 텍스트 */
  displayedText: string;
  /** 현재 나레이션 페이즈 */
  currentPhase: NarrationPhase | null;
  /** 모든 페이즈 완료 여부 */
  isComplete: boolean;
  /** 현재 페이즈 스킵 함수 */
  skip: () => void;
  /** 다음 페이즈로 진행 함수 */
  nextPhase: () => void;
}

/**
 * 인트로 나레이션 표시 Hook
 * 
 * 3단계 나레이션을 타이핑 효과로 순차 표시합니다:
 * 1. Atmosphere (분위기 설정)
 * 2. Incident (사건 발생)
 * 3. Stakes (플레이어 역할)
 * 
 * @param narration - 표시할 나레이션 데이터
 * @returns 나레이션 상태 및 제어 함수
 * 
 * @example
 * ```tsx
 * const { displayedText, currentPhase, isComplete, skip } = useIntroNarration(narration);
 * 
 * if (isComplete) {
 *   return <div>Complete!</div>;
 * }
 * 
 * return (
 *   <div>
 *     <p>{displayedText}</p>
 *     <button onClick={skip}>Skip</button>
 *   </div>
 * );
 * ```
 */
export function useIntroNarration(
  narration: IntroNarration
): UseIntroNarrationReturn {
  // ============================================================================
  // 상태 관리
  // ============================================================================
  
  const [currentPhase, setCurrentPhase] = useState<NarrationPhase>('atmosphere');
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isSkipped, setIsSkipped] = useState<boolean>(false);

  // ============================================================================
  // Skip 함수 - 현재 페이즈 전체 텍스트 즉시 표시
  // ============================================================================
  
  const skip = useCallback(() => {
    setIsSkipped(true);
  }, []);

  // ============================================================================
  // NextPhase 함수 - 다음 페이즈로 진행
  // ============================================================================
  
  const nextPhase = useCallback(() => {
    if (currentPhase === 'atmosphere') {
      setCurrentPhase('incident');
      setDisplayedText('');
      setIsSkipped(false);
    } else if (currentPhase === 'incident') {
      setCurrentPhase('stakes');
      setDisplayedText('');
      setIsSkipped(false);
    } else {
      // stakes 완료 → 전체 완료
      setIsComplete(true);
    }
  }, [currentPhase]);

  // ============================================================================
  // 스트리밍 로직 - 200ms 간격으로 단어 추가
  // ============================================================================
  
  useEffect(() => {
    // 완료 상태면 실행하지 않음
    if (isComplete) return;

    // 현재 페이즈의 텍스트 가져오기
    const phaseText = narration[currentPhase];
    const words = phaseText.split(' ');
    let currentIndex = 0;

    // Skip 상태면 전체 텍스트 즉시 표시
    if (isSkipped) {
      setDisplayedText(phaseText);
      
      // 1초 후 다음 페이즈로 전환
      const skipTimeout = setTimeout(() => {
        nextPhase();
      }, 1000);
      
      return () => clearTimeout(skipTimeout);
    }

    // 단어 단위 스트리밍 (350ms 간격 - 한국어 긴 문장에 최적화)
    const interval = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(words.slice(0, currentIndex + 1).join(' '));
        currentIndex++;
      } else {
        // 모든 단어 표시 완료
        clearInterval(interval);

        // 1초 대기 후 다음 페이즈로 전환
        const completeTimeout = setTimeout(() => {
          nextPhase();
        }, 1000);

        // Cleanup: timeout 정리
        return () => clearTimeout(completeTimeout);
      }
    }, 350);

    // Cleanup: interval 정리
    return () => clearInterval(interval);
  }, [currentPhase, isSkipped, narration, isComplete, nextPhase]);

  // ============================================================================
  // Return
  // ============================================================================
  
  return {
    displayedText,
    currentPhase,
    isComplete,
    skip,
    nextPhase
  };
}
