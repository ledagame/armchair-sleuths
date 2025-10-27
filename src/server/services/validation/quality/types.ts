/**
 * Quality Validation Types
 * 
 * 용의자 AI 응답의 품질을 평가하기 위한 타입 정의
 */

/**
 * 감정 상태 (Suspicion Level 기반)
 */
export type EmotionalState = 'COOPERATIVE' | 'NERVOUS' | 'DEFENSIVE' | 'AGGRESSIVE';

/**
 * 4차원 품질 점수
 */
export interface QualityScores {
  /** 캐릭터 일관성 (0-100) */
  characterConsistency: number;
  
  /** 감정 정렬 (0-100) */
  emotionalAlignment: number;
  
  /** 정보 내용 (0-100) */
  informationContent: number;
  
  /** 자연스러운 대화 (0-100) */
  naturalDialogue: number;
  
  /** 전체 점수 (0-100) */
  overall: number;
}

/**
 * 검증 결과
 */
export interface ValidationResult {
  /** 검증 통과 여부 */
  passed: boolean;
  
  /** 4차원 점수 */
  scores: QualityScores;
  
  /** 피드백 메시지 목록 */
  feedback: string[];
  
  /** 품질 등급 */
  rating: 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Unacceptable';
}

/**
 * 품질 메트릭 (로깅용)
 */
export interface QualityMetrics {
  /** 타임스탬프 */
  timestamp: Date;
  
  /** 아키타입 */
  archetype: string;
  
  /** 감정 상태 */
  emotionalState: EmotionalState;
  
  /** 유죄 여부 */
  isGuilty: boolean;
  
  /** 의심 수치 */
  suspicionLevel: number;
  
  /** AI 응답 */
  response: string;
  
  /** 품질 점수 */
  scores: QualityScores;
  
  /** 검증 통과 여부 */
  passed: boolean;
  
  /** 피드백 */
  feedback: string[];
}

/**
 * 품질 통계
 */
export interface QualityStatistics {
  /** 총 검증 횟수 */
  totalValidations: number;
  
  /** 통과율 (0-1) */
  passRate: number;
  
  /** 평균 점수 */
  averageScores: QualityScores;
  
  /** 아키타입별 통계 */
  archetypeBreakdown: Map<string, {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  }>;
  
  /** 감정 상태별 통계 */
  emotionalStateBreakdown: Map<EmotionalState, {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  }>;
}
