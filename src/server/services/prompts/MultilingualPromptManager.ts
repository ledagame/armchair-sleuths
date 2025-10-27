/**
 * MultilingualPromptManager.ts
 * 
 * 다국어 프롬프트 관리 시스템
 * Requirements: 5.2, 5.3, 5.8
 */

import * as fs from 'fs';
import * as path from 'path';
import type { EmotionalTone } from '../suspect/EmotionalStateManager';
import type { LanguageConfig, WordCountRange } from './types/language-config';
import {
  SUPPORTED_LANGUAGES,
  getLanguageConfig,
  getWordCountRanges
} from './config/language-configs';

/**
 * 다국어 프롬프트 관리자
 */
export class MultilingualPromptManager {
  private promptCache: Map<string, string> = new Map();
  
  /**
   * 지원 언어 목록 조회
   * Requirements: 5.2
   */
  getSupportedLanguages(): LanguageConfig[] {
    return SUPPORTED_LANGUAGES;
  }
  
  /**
   * 언어별 프롬프트 템플릿 로드
   * Requirements: 5.2, 5.8
   * 
   * @param languageCode 언어 코드 ('en', 'ko')
   * @returns 프롬프트 템플릿 문자열
   */
  loadPromptTemplate(languageCode: string): string {
    // 캐시 확인
    if (this.promptCache.has(languageCode)) {
      return this.promptCache.get(languageCode)!;
    }
    
    const config = getLanguageConfig(languageCode);
    const promptPath = path.join(
      process.cwd(),
      'skills',
      'suspect-personality-core',
      config.promptFile
    );
    
    try {
      const template = fs.readFileSync(promptPath, 'utf-8');
      this.promptCache.set(languageCode, template);
      
      console.log(`✅ Loaded ${config.name} prompt template from ${config.promptFile}`);
      return template;
    } catch (error) {
      console.error(`❌ Failed to load prompt template for ${languageCode}:`, error);
      
      // Fallback to English
      if (languageCode !== 'en') {
        console.warn(`Falling back to English prompt template`);
        return this.loadPromptTemplate('en');
      }
      
      throw new Error(`Failed to load prompt template: ${error}`);
    }
  }
  
  /**
   * 언어별 단어 수 범위 계산
   * Requirements: 5.3
   * 
   * @param emotionalTone 감정 상태
   * @param languageCode 언어 코드
   * @returns 단어 수 범위 { min, max }
   */
  calculateWordCountRange(
    emotionalTone: EmotionalTone,
    languageCode: string
  ): WordCountRange {
    const ranges = getWordCountRanges(languageCode);
    return ranges[emotionalTone];
  }
  
  /**
   * 언어별 품질 기준 조회
   * Requirements: 5.8
   * 
   * @param languageCode 언어 코드
   * @returns 품질 기준 객체
   */
  getQualityCriteria(languageCode: string) {
    const config = getLanguageConfig(languageCode);
    return config.qualityCriteria;
  }
  
  /**
   * 프롬프트 캐시 초기화
   */
  clearCache(): void {
    this.promptCache.clear();
    console.log('🗑️ Prompt cache cleared');
  }
  
  /**
   * 특정 언어의 프롬프트 캐시 제거
   */
  clearLanguageCache(languageCode: string): void {
    this.promptCache.delete(languageCode);
    console.log(`🗑️ Cleared cache for language: ${languageCode}`);
  }
}

/**
 * 싱글톤 인스턴스
 */
export const multilingualPromptManager = new MultilingualPromptManager();
