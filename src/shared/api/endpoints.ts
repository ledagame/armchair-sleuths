/**
 * API_ENDPOINTS.ts
 *
 * 모든 API 엔드포인트를 중앙화하여 관리
 * 타입 안전성과 유지보수성 향상
 *
 * 사용 예시:
 * ```typescript
 * const url = API_ENDPOINTS.CASE_TODAY;
 * const url = API_ENDPOINTS.CASE_BY_ID('case-123');
 * const url = API_ENDPOINTS.SUSPECT_ASK('suspect-456');
 * ```
 */

/**
 * API 엔드포인트 상수
 * as const를 사용하여 타입을 리터럴로 고정
 */
export const API_ENDPOINTS = {
  // =============================================================================
  // Case Management (케이스 관리)
  // =============================================================================

  /**
   * 오늘의 케이스 조회
   * GET /api/case/today
   */
  CASE_TODAY: '/api/case/today',

  /**
   * 특정 케이스 조회 (아카이브용)
   * GET /api/case/:caseId
   *
   * @param caseId - 케이스 ID
   */
  CASE_BY_ID: (caseId: string) => `/api/case/${caseId}`,

  /**
   * 새로운 케이스 생성
   * POST /api/case/generate
   */
  CASE_GENERATE: '/api/case/generate',

  /**
   * 케이스 이미지 생성 상태 조회
   * GET /api/case/:caseId/image-status
   *
   * @param caseId - 케이스 ID
   */
  CASE_IMAGE_STATUS: (caseId: string) => `/api/case/${caseId}/image-status`,

  /**
   * 케이스 증거 이미지 상태 조회
   * GET /api/case/:caseId/evidence-images/status
   *
   * @param caseId - 케이스 ID
   */
  CASE_EVIDENCE_IMAGES_STATUS: (caseId: string) =>
    `/api/case/${caseId}/evidence-images/status`,

  /**
   * 케이스 장소 이미지 상태 조회
   * GET /api/case/:caseId/location-images/status
   *
   * @param caseId - 케이스 ID
   */
  CASE_LOCATION_IMAGES_STATUS: (caseId: string) =>
    `/api/case/${caseId}/location-images/status`,

  /**
   * 케이스 시네마틱 이미지 상태 조회
   * GET /api/cases/:caseId/image-status
   *
   * @param caseId - 케이스 ID
   * @deprecated useCinematicImages.ts에서 사용 (향후 통합 예정)
   */
  CASES_IMAGE_STATUS: (caseId: string) => `/api/cases/${caseId}/image-status`,

  // =============================================================================
  // Suspect Management (용의자 관리)
  // =============================================================================

  /**
   * 용의자 심문 (AI 채팅)
   * POST /api/chat/:suspectId
   *
   * @param suspectId - 용의자 ID
   */
  SUSPECT_ASK: (suspectId: string) => `/api/chat/${suspectId}`,

  /**
   * 용의자 대화 기록 조회
   * GET /api/conversation/:suspectId/:userId
   *
   * @param suspectId - 용의자 ID
   * @param userId - 사용자 ID
   */
  SUSPECT_CONVERSATION: (suspectId: string, userId: string) =>
    `/api/conversation/${suspectId}/${userId}`,

  /**
   * 용의자 이미지 조회
   * GET /api/suspect-image/:suspectId
   *
   * @param suspectId - 용의자 ID
   */
  SUSPECT_IMAGE: (suspectId: string) => `/api/suspect-image/${suspectId}`,

  // =============================================================================
  // Evidence Discovery (증거 발견)
  // =============================================================================

  /**
   * 장소 탐색 (증거 발견)
   * POST /api/location/search
   */
  LOCATION_SEARCH: '/api/location/search',

  // =============================================================================
  // Submission (답안 제출)
  // =============================================================================

  /**
   * 최종 답안 제출 및 채점
   * POST /api/submit
   */
  SUBMIT_ANSWER: '/api/submit',

  // =============================================================================
  // Player State (플레이어 상태)
  // =============================================================================

  /**
   * 플레이어 상태 조회 (AP 등)
   * GET /api/player-state/:caseId/:userId
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   */
  PLAYER_STATE: (caseId: string, userId: string) =>
    `/api/player-state/${caseId}/${userId}`,

  // =============================================================================
  // Miscellaneous (기타)
  // =============================================================================

  /**
   * 초기화 (카운터 예시)
   * GET /api/init
   *
   * @deprecated 예시 코드용 엔드포인트
   */
  INIT: '/api/init',

  /**
   * 증가/감소 (카운터 예시)
   * POST /api/:action
   *
   * @param action - 'increment' | 'decrement'
   * @deprecated 예시 코드용 엔드포인트
   */
  COUNTER_ACTION: (action: 'increment' | 'decrement') => `/api/${action}`,
} as const;

/**
 * API 엔드포인트 타입
 */
export type APIEndpoint = typeof API_ENDPOINTS;

/**
 * 엔드포인트 키 타입
 */
export type APIEndpointKey = keyof APIEndpoint;
