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
