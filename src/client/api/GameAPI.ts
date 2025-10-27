/**
 * GameAPI.ts
 *
 * 게임 API 인터페이스 정의
 * 모든 백엔드 통신을 추상화하여 비즈니스 로직과 분리
 *
 * 목적:
 * 1. 타입 안전성: 모든 API 호출에 대한 타입 보장
 * 2. 테스트 가능성: Mock 구현을 통한 단위 테스트 지원
 * 3. 유지보수성: API 변경 시 인터페이스만 수정하면 됨
 * 4. 일관성: 모든 API 호출이 동일한 패턴 따름
 */

import type { CaseData, W4HAnswer, ScoringResult } from '../types';
import type {
  InterrogationResponse,
  SearchLocationResponse,
  ImageGenerationStatusResponse,
  APStatusResponse,
} from '../../shared/types/api';
import type { SearchLocationRequest } from '../../shared/types/Discovery';

/**
 * GameAPI 인터페이스
 *
 * 모든 게임 관련 API 호출을 정의
 * HTTPGameAPIClient와 MockGameAPIClient는 이 인터페이스를 구현
 */
export interface GameAPI {
  // ===========================================================================
  // Case Management (케이스 관리)
  // ===========================================================================

  /**
   * 오늘의 케이스 조회
   *
   * @returns 오늘의 케이스 데이터
   * @throws APIError - 케이스 조회 실패 시
   */
  getCaseToday(): Promise<CaseData>;

  /**
   * 특정 케이스 조회 (아카이브용)
   *
   * @param caseId - 케이스 ID
   * @returns 케이스 데이터
   * @throws APIError - 케이스 조회 실패 시
   */
  getCaseById(caseId: string): Promise<CaseData>;

  /**
   * 새로운 케이스 생성
   *
   * @returns 생성된 케이스 ID
   * @throws APIError - 케이스 생성 실패 시
   */
  generateCase(): Promise<{ caseId: string }>;

  /**
   * 케이스 이미지 생성 상태 조회
   *
   * @param caseId - 케이스 ID
   * @returns 이미지 생성 상태
   * @throws APIError - 상태 조회 실패 시
   */
  getImageStatus(caseId: string): Promise<ImageGenerationStatusResponse>;

  // ===========================================================================
  // Suspect Management (용의자 관리)
  // ===========================================================================

  /**
   * 용의자에게 질문하기 (AI 채팅)
   *
   * @param suspectId - 용의자 ID
   * @param message - 질문 메시지
   * @param userId - 사용자 ID
   * @param caseId - 케이스 ID
   * @param conversationId - 대화 ID (선택적)
   * @returns AI 응답 및 AP 상태
   * @throws APIError - 질문 전송 실패 시
   */
  askSuspect(
    suspectId: string,
    message: string,
    userId: string,
    caseId: string,
    conversationId?: string
  ): Promise<InterrogationResponse>;

  /**
   * 용의자 대화 기록 조회
   *
   * @param suspectId - 용의자 ID
   * @param userId - 사용자 ID
   * @returns 대화 메시지 목록
   * @throws APIError - 대화 기록 조회 실패 시
   */
  getConversation(suspectId: string, userId: string): Promise<{
    messages: Array<{
      role: 'user' | 'suspect';
      content: string;
      timestamp: number;
    }>;
  }>;

  // ===========================================================================
  // Evidence Discovery (증거 발견)
  // ===========================================================================

  /**
   * 장소 탐색 (증거 발견)
   *
   * @param request - 탐색 요청 데이터
   * @returns 탐색 결과 및 발견된 증거
   * @throws APIError - 탐색 실패 시
   */
  searchLocation(request: SearchLocationRequest): Promise<SearchLocationResponse>;

  // ===========================================================================
  // Submission (답안 제출)
  // ===========================================================================

  /**
   * 최종 답안 제출 및 채점
   *
   * @param userId - 사용자 ID
   * @param caseId - 케이스 ID
   * @param answers - 5W1H 답안
   * @returns 채점 결과
   * @throws APIError - 제출 실패 시
   */
  submitAnswer(userId: string, caseId: string, answers: W4HAnswer): Promise<ScoringResult>;

  // ===========================================================================
  // Player State (플레이어 상태)
  // ===========================================================================

  /**
   * 플레이어 상태 조회 (AP 등)
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   * @returns 플레이어 AP 상태
   * @throws APIError - 상태 조회 실패 시
   */
  getPlayerState(caseId: string, userId: string): Promise<APStatusResponse>;
}

/**
 * API 에러 클래스
 *
 * HTTP 에러 정보를 포함하는 커스텀 에러
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * API 응답 타입 가드
 *
 * @param response - 검증할 응답
 * @returns 에러 응답이면 true
 */
export function isAPIError(response: unknown): response is { error: string; message: string } {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    'message' in response
  );
}
