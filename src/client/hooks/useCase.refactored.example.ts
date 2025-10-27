/**
 * useCase.refactored.example.ts
 *
 * ✨ 리팩토링된 useCase Hook 예시
 *
 * 변경 사항:
 * 1. ✅ fetch 직접 호출 → useGameAPI() 사용
 * 2. ✅ 하드코딩된 엔드포인트 → API_ENDPOINTS 사용
 * 3. ✅ window.__POST_DATA__ → DevvitMessenger.getPostData() 사용
 * 4. ✅ 타입 안전성 향상
 * 5. ✅ 에러 처리 개선
 *
 * 마이그레이션 방법:
 * 1. 이 파일을 참고하여 useCase.ts 수정
 * 2. 컴파일 에러 확인 후 수정
 * 3. 테스트 실행
 * 4. 기존 useCase.ts 백업 후 교체
 */

import { useState, useEffect, useCallback } from 'react';
import type { CaseData, UseCaseReturn } from '../types';
import { useGameAPI } from '../contexts/GameAPIContext';
import { DevvitMessenger } from '../utils/DevvitMessenger';
import { APIError } from '../api/GameAPI';

/**
 * ✨ 리팩토링된 useCase Hook
 *
 * GameAPI를 사용하여 케이스 데이터를 관리
 * - Devvit postData.caseId가 있으면 해당 케이스 로드 (아카이브)
 * - 없으면 오늘의 케이스 로드
 * - 케이스가 없으면 자동 생성
 */
export function useCase(): UseCaseReturn {
  // API 인스턴스 가져오기
  const api = useGameAPI();

  // State
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  /**
   * 케이스 생성
   */
  const generateCase = useCallback(async (): Promise<boolean> => {
    setGenerating(true);
    setError(null);

    try {
      console.log('[useCase] Generating case...');
      const result = await api.generateCase();
      console.log('[useCase] Case generated:', result.caseId);

      // 생성 후 잠시 대기 (케이스 저장 시간)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return true;
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Failed to generate case';
      setError(errorMessage);
      console.error('[useCase] Generation failed:', err);
      return false;
    } finally {
      setGenerating(false);
    }
  }, [api]);

  /**
   * 케이스 조회
   */
  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✨ NEW: DevvitMessenger로 postData 가져오기
      const postData = DevvitMessenger.getPostData();
      const specificCaseId = postData?.caseId;

      // 케이스 ID가 있으면 특정 케이스 로드, 없으면 오늘의 케이스
      if (specificCaseId) {
        console.log(`[useCase] Loading specific case: ${specificCaseId}`);
        const data = await api.getCaseById(specificCaseId);
        setCaseData(data);
        console.log(`[useCase] Case loaded: ${data.id} with ${data.suspects?.length || 0} suspects`);
      } else {
        console.log('[useCase] Loading today\'s case...');
        try {
          const data = await api.getCaseToday();
          setCaseData(data);
          console.log(`[useCase] Case loaded: ${data.id} with ${data.suspects?.length || 0} suspects`);
        } catch (err) {
          // 404 에러이고 케이스가 없는 경우 자동 생성
          if (err instanceof APIError && err.status === 404) {
            console.log('[useCase] No case found. Auto-generating...');
            const generated = await generateCase();

            if (generated) {
              // 생성 후 다시 조회
              const retryData = await api.getCaseToday();
              setCaseData(retryData);
              console.log(`[useCase] Case loaded after generation: ${retryData.id}`);
              return;
            }
          }

          // 다른 에러는 그대로 throw
          throw err;
        }
      }

      // 데이터 검증
      if (caseData && (!caseData.suspects || caseData.suspects.length === 0)) {
        console.warn('[useCase] ⚠️ Case has no suspects');
      }

      if (caseData && (!caseData.locations || caseData.locations.length === 0)) {
        console.warn('[useCase] ⚠️ Case has no locations - discovery system will use fallback');
      }
    } catch (err) {
      const errorMessage = err instanceof APIError ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('[useCase] Failed to fetch case:', err);
    } finally {
      setLoading(false);
    }
  }, [api, generateCase, caseData]);

  // 마운트 시 케이스 조회
  useEffect(() => {
    void fetchCase();
  }, [fetchCase]);

  return {
    caseData,
    loading,
    generating,
    error,
    refetch: fetchCase,
  };
}

/**
 * ✨ 마이그레이션 체크리스트
 *
 * [ ] 1. useGameAPI() 임포트 확인
 * [ ] 2. DevvitMessenger 임포트 확인
 * [ ] 3. API_ENDPOINTS 제거 (useGameAPI가 내부적으로 사용)
 * [ ] 4. fetch 호출을 api.* 호출로 변경
 * [ ] 5. window.__POST_DATA__ → DevvitMessenger.getPostData()
 * [ ] 6. 에러 처리를 APIError로 변경
 * [ ] 7. 타입 체크 통과 확인
 * [ ] 8. 테스트 실행
 * [ ] 9. 기존 코드 백업
 * [ ] 10. 실제 useCase.ts에 적용
 */

/**
 * ✨ 주요 개선 사항
 *
 * 1. 타입 안전성:
 *    - APIError 타입으로 에러 처리
 *    - DevvitPostData 타입으로 postData 검증
 *
 * 2. 유지보수성:
 *    - API 엔드포인트 중앙 관리
 *    - 비즈니스 로직과 통신 로직 분리
 *
 * 3. 테스트 가능성:
 *    - GameAPI를 Mock으로 교체 가능
 *    - 의존성 주입으로 격리된 테스트
 *
 * 4. 일관성:
 *    - 모든 API 호출이 동일한 패턴
 *    - 에러 처리가 일관됨
 */
