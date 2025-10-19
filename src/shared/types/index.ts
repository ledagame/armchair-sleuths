/**
 * Shared TypeScript types
 * Used by both client and server
 */

// ============================================================================
// Intro Narration Types
// ============================================================================

/**
 * 나레이션 페이즈 타입
 * - atmosphere: 분위기 설정 (50-80 단어)
 * - incident: 사건 발생 (50-80 단어)
 * - stakes: 플레이어 역할 (50-90 단어)
 */
export type NarrationPhase = 'atmosphere' | 'incident' | 'stakes';

/**
 * 인트로 나레이션 데이터
 * Gemini API로 생성되며 케이스별로 맞춤화됨
 */
export interface IntroNarration {
  /** 장소와 분위기 설정 (50-80 단어) */
  atmosphere: string;
  /** 사건 발생 설명 (50-80 단어) */
  incident: string;
  /** 플레이어 역할과 임무 (50-90 단어) */
  stakes: string;
}

// ============================================================================
// Cinematic Intro Types
// ============================================================================

/**
 * 시네마틱 씬 타입 (최적화: 3개 핵심 씬만)
 */
export type CinematicSceneType = 'establishing' | 'confrontation' | 'action';

/**
 * 시네마틱 인트로 이미지 맵 (최적화: 3개 핵심 씬)
 * Gemini API로 생성된 시네마틱 이미지 URL
 */
export interface CinematicImages {
  /** Establishing (Discovery) 씬 이미지 - 범죄 현장 발견 */
  establishing?: string;
  /** Confrontation (Evidence) 씬 이미지 - 증거 대면 */
  confrontation?: string;
  /** Action (Beginning) 씬 이미지 - 수사 시작 */
  action?: string;
}

// ============================================================================
// Image Generation Status Types
// ============================================================================

/**
 * 이미지 생성 상태 타입
 * - pending: 이미지 생성 대기 중
 * - generating: 이미지 생성 진행 중
 * - completed: 모든 이미지 생성 완료
 * - partial: 일부 이미지만 생성 완료
 * - failed: 이미지 생성 실패
 */
export type ImageGenerationStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'partial'
  | 'failed';

/**
 * 이미지 생성 메타데이터
 * 백그라운드 이미지 생성 진행 상황 추적용
 */
export interface ImageGenerationMeta {
  /** 생성 시작 시간 (타임스탬프) */
  startedAt?: number;
  /** 생성 완료 시간 (타임스탬프) */
  completedAt?: number;
  /** 실패 사유 */
  failureReason?: string;
  /** 재시도 횟수 */
  retryCount?: number;
  /** 개별 이미지 생성 상태 */
  progress?: {
    establishing?: 'pending' | 'generating' | 'completed' | 'failed';
    confrontation?: 'pending' | 'generating' | 'completed' | 'failed';
    action?: 'pending' | 'generating' | 'completed' | 'failed';
  };
}
