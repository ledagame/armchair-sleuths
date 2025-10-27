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
 * 미스터리 스타일 타입
 * - classic: 고전 추리 (Christie/Queen) - 논리적, 정중한, 지적
 * - noir: 하드보일드 느와르 (Chandler) - 냉소적, 거친, 도시적
 * - cozy: 코지 미스터리 - 따뜻한, 유머러스, 일상적
 * - nordic: 노르딕 느와르 - 어둡고, 심리적, 사회비판적
 * - honkaku: 일본 본격 추리 - 트릭 중심, 퍼즐적, 논리적
 */
export type MysteryStyle = 'classic' | 'noir' | 'cozy' | 'nordic' | 'honkaku';

/**
 * 강조 키워드 분류
 */
export interface NarrationKeywords {
  /** 핵심 키워드 (높은 강조 - 빨강/금색) */
  critical: string[];
  /** 분위기 키워드 (중간 강조 - 청록/청록) */
  atmospheric: string[];
  /** 감각 키워드 (낮은 강조 - 미묘한 강조) */
  sensory: string[];
}

/**
 * 감정 곡선 힌트
 */
export interface EmotionalArcHints {
  /** 감정 강도 곡선 (주요 위치에서 0-1) */
  intensityCurve: Array<{ position: number; intensity: number }>;
  /** 권장 클라이맥스 위치 (0-1, 정규화) */
  climaxPosition: number;
  /** 전체 페이싱 제안 */
  pacing: 'slow-burn' | 'quick-tension' | 'steady';
}

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
  /** 미스터리 스타일 (선택 사항) */
  mysteryStyle?: MysteryStyle;
  /** 강조 키워드 (선택 사항) */
  keywords?: NarrationKeywords;
  /** 감정 곡선 힌트 (선택 사항) */
  emotionalArc?: EmotionalArcHints;
}

// ============================================================================
// NEW: 3-Slide Intro Types
// ============================================================================

/**
 * Export new 3-slide intro types
 * Replaces old IntroNarration {atmosphere, incident, stakes}
 */
export type {
  IntroSlides,
  Slide1Discovery,
  Slide2Suspects,
  Slide3Challenge,
  SuspectCard,
  IntroSlidesValidationResult
} from './IntroSlides';

// ============================================================================
// Cinematic Intro Types (UPDATED for 3-slide system)
// ============================================================================

/**
 * 시네마틱 씬 타입 (3-slide 매핑)
 * - discovery: Slide 1 배경 이미지
 * - suspects: Slide 2 배경 이미지
 * - challenge: Slide 3 배경 이미지
 */
export type CinematicSceneType = 'discovery' | 'suspects' | 'challenge';

/**
 * 시네마틱 인트로 이미지 맵 (3-slide system)
 * Gemini API로 생성된 시네마틱 이미지 URL
 */
export interface CinematicImages {
  /** Discovery (Slide 1) 이미지 - 범죄 현장 발견 */
  discovery?: string;
  /** Suspects (Slide 2) 이미지 - 용의자들 */
  suspects?: string;
  /** Challenge (Slide 3) 이미지 - 수사 시작 도전 */
  challenge?: string;
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
  /** 개별 이미지 생성 상태 (3-slide system) */
  progress?: {
    discovery?: 'pending' | 'generating' | 'completed' | 'failed';
    suspects?: 'pending' | 'generating' | 'completed' | 'failed';
    challenge?: 'pending' | 'generating' | 'completed' | 'failed';
  };
}

// ============================================================================
// Evidence & Location Image Types (from Image.ts)
// ============================================================================

/**
 * Re-export image types for evidence and location image generation
 * These types are used by both client (UI state) and server (generation tracking)
 */
export type {
  EvidenceImageStatusResponse,
  LocationImageStatusResponse,
  ImageGenerationOptions
} from './Image';

// ============================================================================
// API Types (from api.ts)
// ============================================================================

/**
 * Re-export API types including the new unified image status endpoint
 */
export type {
  InitResponse,
  IncrementResponse,
  DecrementResponse,
  APAcquisitionBreakdown,
  PlayerAPState,
  InterrogationResponse,
  SearchLocationResponse,
  APStatusResponse,
  ImageTypeStatus,
  ImageGenerationStatusResponse
} from './api';
