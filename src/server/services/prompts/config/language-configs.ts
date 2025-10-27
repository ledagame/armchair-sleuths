/**
 * language-configs.ts
 * 
 * 지원 언어별 설정 정의
 * Requirements: 5.1, 5.2, 5.3
 */

import type { LanguageConfig, WordCountRanges } from '../types/language-config';

/**
 * 영어 설정
 */
export const ENGLISH_CONFIG: LanguageConfig = {
  code: 'en',
  name: 'English',
  wordCountMultiplier: 1.0,
  promptFile: 'PROMPT.md',
  qualityCriteria: {
    characterConsistency: 60,
    emotionalAlignment: 60,
    informationContent: 50,
    naturalDialogue: 60,
    overall: 65
  }
};

/**
 * 한국어 설정
 * 
 * 한국어는 영어 대비 약 75%의 단어 수로 동일한 의미 전달 가능
 * Requirements: 5.3
 */
export const KOREAN_CONFIG: LanguageConfig = {
  code: 'ko',
  name: '한국어',
  wordCountMultiplier: 0.75,
  promptFile: 'PROMPT.ko.md',
  qualityCriteria: {
    characterConsistency: 60,
    emotionalAlignment: 60,
    informationContent: 50,
    naturalDialogue: 60,
    overall: 65
  }
};

/**
 * 영어 단어 수 범위
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export const ENGLISH_WORD_COUNT_RANGES: WordCountRanges = {
  cooperative: { min: 40, max: 80 },
  nervous: { min: 30, max: 60 },
  defensive: { min: 15, max: 40 },
  aggressive: { min: 10, max: 30 }
};

/**
 * 한국어 단어 수 범위
 * 영어 대비 75% 적용
 * Requirements: 5.3
 */
export const KOREAN_WORD_COUNT_RANGES: WordCountRanges = {
  cooperative: { min: 30, max: 60 },
  nervous: { min: 22, max: 45 },
  defensive: { min: 11, max: 30 },
  aggressive: { min: 7, max: 22 }
};

/**
 * 지원 언어 목록
 */
export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  ENGLISH_CONFIG,
  KOREAN_CONFIG
];

/**
 * 언어 코드로 설정 조회
 */
export function getLanguageConfig(languageCode: string): LanguageConfig {
  const config = SUPPORTED_LANGUAGES.find(lang => lang.code === languageCode);
  
  if (!config) {
    console.warn(`Language ${languageCode} not supported, falling back to English`);
    return ENGLISH_CONFIG;
  }
  
  return config;
}

/**
 * 언어별 단어 수 범위 조회
 */
export function getWordCountRanges(languageCode: string): WordCountRanges {
  switch (languageCode) {
    case 'ko':
      return KOREAN_WORD_COUNT_RANGES;
    case 'en':
    default:
      return ENGLISH_WORD_COUNT_RANGES;
  }
}
