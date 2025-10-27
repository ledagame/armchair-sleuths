/**
 * language-config.ts
 * 
 * 다국어 프롬프트 시스템을 위한 언어 설정 인터페이스
 * Requirements: 5.1, 5.2
 */

import type { EmotionalTone } from '../../suspect/EmotionalStateManager';

/**
 * 언어별 설정 인터페이스
 */
export interface LanguageConfig {
  /** 언어 코드 (ISO 639-1) */
  code: string;
  
  /** 언어 이름 */
  name: string;
  
  /** 단어 수 배율 (영어 기준 1.0) */
  wordCountMultiplier: number;
  
  /** 프롬프트 파일 경로 */
  promptFile: string;
  
  /** 언어별 품질 기준 */
  qualityCriteria: QualityCriteria;
}

/**
 * 품질 검증 기준
 */
export interface QualityCriteria {
  /** 캐릭터 일관성 최소 점수 */
  characterConsistency: number;
  
  /** 감정 정렬 최소 점수 */
  emotionalAlignment: number;
  
  /** 정보 내용 최소 점수 */
  informationContent: number;
  
  /** 자연스러운 대화 최소 점수 */
  naturalDialogue: number;
  
  /** 전체 최소 점수 */
  overall: number;
}

/**
 * 감정 상태별 단어 수 범위
 */
export interface WordCountRange {
  min: number;
  max: number;
}

/**
 * 언어별 단어 수 범위 맵
 */
export type WordCountRanges = {
  [key in EmotionalTone]: WordCountRange;
};
