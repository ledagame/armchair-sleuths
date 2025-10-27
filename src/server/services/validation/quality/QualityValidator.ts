/**
 * QualityValidator.ts
 * 
 * 용의자 AI 응답의 품질을 4차원으로 평가하는 검증 시스템
 * 
 * 평가 차원:
 * 1. Character Consistency - 아키타입 고유 어휘 사용
 * 2. Emotional Alignment - 감정 상태에 맞는 응답 길이와 톤
 * 3. Information Content - 유죄/무죄 행동 패턴과 정보 구체성
 * 4. Natural Dialogue - 자연스러운 대화 표현
 * 
 * Task 7.2: Performance optimization with caching and async validation
 */

import type {
  EmotionalState,
  QualityScores,
  ValidationResult
} from './types';

/**
 * 품질 임계값
 */
const QUALITY_THRESHOLDS = {
  characterConsistency: 60,
  emotionalAlignment: 60,
  informationContent: 50,
  naturalDialogue: 60,
  overall: 65
};

/**
 * Task 7.2: Cache entry for validation results
 */
interface CachedValidationResult {
  result: ValidationResult;
  timestamp: number;
  cacheKey: string;
}

/**
 * Task 7.2: Performance metrics for validation
 */
export interface ValidationPerformanceMetrics {
  totalValidations: number;
  cacheHits: number;
  cacheMisses: number;
  averageValidationTime: number;
  maxValidationTime: number;
  minValidationTime: number;
  cacheHitRate: number;
}

/**
 * 감정 상태별 단어 수 범위
 */
const WORD_COUNT_RANGES: Record<EmotionalState, { en: [number, number]; ko: [number, number] }> = {
  COOPERATIVE: { en: [40, 80], ko: [30, 60] },
  NERVOUS: { en: [30, 60], ko: [22, 45] },
  DEFENSIVE: { en: [15, 40], ko: [11, 30] },
  AGGRESSIVE: { en: [10, 30], ko: [7, 22] }
};

/**
 * QualityValidator 클래스
 * Task 7.2: Enhanced with caching and performance optimization
 */
export class QualityValidator {
  // Task 7.2: Cache for validation results
  private validationCache: Map<string, CachedValidationResult> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hour
  private readonly MAX_CACHE_SIZE = 1000;
  
  // Task 7.2: Performance metrics
  private validationTimes: number[] = [];
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Task 7.2: Generate cache key for validation result
   */
  private generateCacheKey(
    response: string,
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean,
    suspicionLevel: number
  ): string {
    // Simple hash function for response text
    const responseHash = this.simpleHash(response);
    
    // Group suspicion level into ranges to increase cache hits
    const suspicionRange = Math.floor(suspicionLevel / 10) * 10;
    
    return `${archetype}:${emotionalState}:${isGuilty}:${suspicionRange}:${responseHash}`;
  }

  /**
   * Task 7.2: Simple hash function for strings
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Task 7.2: Check if cached result is still valid
   */
  private isCacheValid(cached: CachedValidationResult): boolean {
    const age = Date.now() - cached.timestamp;
    return age < this.CACHE_TTL;
  }

  /**
   * Task 7.2: Evict old cache entries if cache is too large
   */
  private evictOldCacheEntries(): void {
    if (this.validationCache.size <= this.MAX_CACHE_SIZE) {
      return;
    }

    // Sort by timestamp and remove oldest entries
    const entries = Array.from(this.validationCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const entriesToRemove = entries.slice(0, Math.floor(this.MAX_CACHE_SIZE * 0.2));
    
    for (const [key] of entriesToRemove) {
      this.validationCache.delete(key);
    }
    
    console.log(`🧹 Evicted ${entriesToRemove.length} old cache entries`);
  }

  /**
   * AI 응답의 품질을 검증
   * Task 7.2: Enhanced with caching
   */
  validate(
    response: string,
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean,
    suspicionLevel: number,
    vocabulary: string[]
  ): ValidationResult {
    const startTime = performance.now();
    
    // Task 7.2: Check cache first
    const cacheKey = this.generateCacheKey(
      response,
      archetype,
      emotionalState,
      isGuilty,
      suspicionLevel
    );
    
    const cached = this.validationCache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached)) {
      this.cacheHits++;
      
      const endTime = performance.now();
      const validationTime = endTime - startTime;
      this.validationTimes.push(validationTime);
      
      // Log cache hit (only in development)
      if (process.env.NODE_ENV === 'development' && validationTime < 1) {
        console.log(`✅ Cache hit for validation (${validationTime.toFixed(3)}ms)`);
      }
      
      return cached.result;
    }
    
    this.cacheMisses++;
    // 4차원 점수 계산
    const characterConsistency = this.scoreCharacterConsistency(
      response,
      archetype,
      vocabulary
    );
    
    const emotionalAlignment = this.scoreEmotionalAlignment(
      response,
      emotionalState,
      suspicionLevel
    );
    
    const informationContent = this.scoreInformationContent(
      response,
      isGuilty,
      emotionalState
    );
    
    const naturalDialogue = this.scoreNaturalDialogue(response);
    
    // 전체 점수 계산 (가중 평균)
    const overall = Math.round(
      (characterConsistency * 0.25 +
        emotionalAlignment * 0.25 +
        informationContent * 0.25 +
        naturalDialogue * 0.25)
    );
    
    const scores: QualityScores = {
      characterConsistency,
      emotionalAlignment,
      informationContent,
      naturalDialogue,
      overall
    };
    
    // 피드백 생성
    const feedback = this.generateFeedback(scores, emotionalState, response);
    
    // 검증 통과 여부
    const passed = this.checkPassed(scores);
    
    // 품질 등급
    const rating = this.calculateRating(overall);
    
    const result: ValidationResult = {
      passed,
      scores,
      feedback,
      rating
    };
    
    // Task 7.2: Cache the result
    this.validationCache.set(cacheKey, {
      result,
      timestamp: Date.now(),
      cacheKey
    });
    
    // Task 7.2: Evict old entries if needed
    this.evictOldCacheEntries();
    
    // Task 7.2: Record performance metrics
    const endTime = performance.now();
    const validationTime = endTime - startTime;
    this.validationTimes.push(validationTime);
    
    // Log if validation is slow
    if (validationTime > 50) {
      console.warn(
        `⚠️  Slow validation: ${validationTime.toFixed(2)}ms (target: < 50ms)`
      );
    }
    
    return result;
  }

  /**
   * Task 7.2: Async validation (for production use)
   * Returns a Promise that resolves with the validation result
   */
  async validateAsync(
    response: string,
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean,
    suspicionLevel: number,
    vocabulary: string[]
  ): Promise<ValidationResult> {
    // Wrap synchronous validation in Promise for async execution
    return new Promise((resolve) => {
      // Use setImmediate or setTimeout to avoid blocking
      if (typeof setImmediate !== 'undefined') {
        setImmediate(() => {
          const result = this.validate(
            response,
            archetype,
            emotionalState,
            isGuilty,
            suspicionLevel,
            vocabulary
          );
          resolve(result);
        });
      } else {
        setTimeout(() => {
          const result = this.validate(
            response,
            archetype,
            emotionalState,
            isGuilty,
            suspicionLevel,
            vocabulary
          );
          resolve(result);
        }, 0);
      }
    });
  }

  /**
   * Task 7.2: Get performance metrics
   */
  getPerformanceMetrics(): ValidationPerformanceMetrics {
    const totalValidations = this.cacheHits + this.cacheMisses;
    
    if (totalValidations === 0) {
      return {
        totalValidations: 0,
        cacheHits: 0,
        cacheMisses: 0,
        averageValidationTime: 0,
        maxValidationTime: 0,
        minValidationTime: 0,
        cacheHitRate: 0
      };
    }
    
    return {
      totalValidations,
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      averageValidationTime: this.validationTimes.reduce((a, b) => a + b, 0) / this.validationTimes.length,
      maxValidationTime: Math.max(...this.validationTimes),
      minValidationTime: Math.min(...this.validationTimes),
      cacheHitRate: (this.cacheHits / totalValidations) * 100
    };
  }

  /**
   * Task 7.2: Clear cache and reset metrics
   */
  clearCacheAndMetrics(): void {
    this.validationCache.clear();
    this.validationTimes = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('🧹 Validation cache and metrics cleared');
  }

  /**
   * Task 7.2: Get cache status
   */
  getCacheStatus(): {
    size: number;
    maxSize: number;
    ttl: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const entries = Array.from(this.validationCache.values());
    
    if (entries.length === 0) {
      return {
        size: 0,
        maxSize: this.MAX_CACHE_SIZE,
        ttl: this.CACHE_TTL,
        oldestEntry: null,
        newestEntry: null
      };
    }
    
    const timestamps = entries.map(e => e.timestamp);
    
    return {
      size: this.validationCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      ttl: this.CACHE_TTL,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps)
    };
  }
  
  /**
   * 1. Character Consistency 점수 계산
   * 아키타입 고유 어휘 사용 빈도 측정
   */
  scoreCharacterConsistency(
    response: string,
    archetype: string,
    vocabulary: string[]
  ): number {
    let score = 70; // 기본 점수
    
    const responseLower = response.toLowerCase();
    
    // 아키타입 고유 어휘 사용 빈도 체크
    let vocabularyMatches = 0;
    for (const word of vocabulary) {
      if (responseLower.includes(word.toLowerCase())) {
        vocabularyMatches++;
      }
    }
    
    // 어휘 사용 빈도에 따라 점수 추가
    // 1개 이상 사용: +10점
    // 2개 이상 사용: +20점
    // 3개 이상 사용: +30점
    if (vocabularyMatches >= 3) {
      score += 30;
    } else if (vocabularyMatches >= 2) {
      score += 20;
    } else if (vocabularyMatches >= 1) {
      score += 10;
    } else {
      // 어휘 사용 없음: -20점
      score -= 20;
    }
    
    // 다른 아키타입 어휘 혼입 체크 (간단한 버전)
    // 실제로는 모든 아키타입의 어휘를 체크해야 하지만,
    // 여기서는 일반적인 잘못된 표현만 체크
    const wrongVocabulary = [
      // Wealthy Heir가 아닌데 사용하면 안 되는 표현
      'attorney', 'estate', 'inheritance',
      // Loyal Butler가 아닌데 사용하면 안 되는 표현
      'sir', 'madam', 'discretion', 'propriety',
      // Talented Artist가 아닌데 사용하면 안 되는 표현
      'canvas', 'muse', 'inspiration', 'masterpiece',
      // Business Partner가 아닌데 사용하면 안 되는 표현
      'portfolio', 'investment', 'venture',
      // Former Police Officer가 아닌데 사용하면 안 되는 표현
      'protocol', 'jurisdiction', 'evidence'
    ];
    
    // 현재 아키타입의 어휘가 아닌 것이 포함되어 있는지 체크
    let wrongMatches = 0;
    for (const word of wrongVocabulary) {
      if (responseLower.includes(word.toLowerCase())) {
        // 현재 아키타입의 어휘인지 확인
        const isOwnVocabulary = vocabulary.some(v => 
          v.toLowerCase() === word.toLowerCase()
        );
        
        if (!isOwnVocabulary) {
          wrongMatches++;
        }
      }
    }
    
    // 잘못된 어휘 사용 시 감점
    score -= wrongMatches * 10;
    
    // 점수 범위 제한 (0-100)
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 2. Emotional Alignment 점수 계산
   * 단어 수 범위와 감정 톤 마커 검증
   */
  scoreEmotionalAlignment(
    response: string,
    emotionalState: EmotionalState,
    suspicionLevel: number
  ): number {
    let score = 70; // 기본 점수
    
    // 언어 감지 (한글 포함 여부)
    const isKorean = /[가-힣]/.test(response);
    const language = isKorean ? 'ko' : 'en';
    
    // 단어 수 계산
    const wordCount = this.countWords(response, language);
    
    // 목표 범위 가져오기
    const targetRange = WORD_COUNT_RANGES[emotionalState][language];
    const [minWords, maxWords] = targetRange;
    
    // 단어 수 범위 체크
    if (wordCount >= minWords && wordCount <= maxWords) {
      score += 20; // 범위 내: +20점
    } else if (wordCount < minWords) {
      // 너무 짧음: 차이에 비례하여 감점
      const deficit = minWords - wordCount;
      score -= Math.min(30, deficit * 2);
    } else {
      // 너무 김: 차이에 비례하여 감점
      const excess = wordCount - maxWords;
      score -= Math.min(30, excess * 1);
    }
    
    // 감정 톤 마커 체크
    const toneScore = this.checkToneMarkers(response, emotionalState, language);
    score += toneScore;
    
    // 점수 범위 제한 (0-100)
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 단어 수 계산 (언어별)
   */
  private countWords(text: string, language: 'ko' | 'en'): number {
    if (language === 'ko') {
      // 한국어: 공백 기준 + 문장 부호 제거
      const cleaned = text.replace(/[.,!?;:'"()]/g, ' ').trim();
      return cleaned.split(/\s+/).filter(word => word.length > 0).length;
    } else {
      // 영어: 공백 기준
      return text.split(/\s+/).filter(word => word.length > 0).length;
    }
  }
  
  /**
   * 감정 톤 마커 체크
   */
  private checkToneMarkers(
    response: string,
    emotionalState: EmotionalState,
    language: 'ko' | 'en'
  ): number {
    let toneScore = 0;
    
    const responseLower = response.toLowerCase();
    
    switch (emotionalState) {
      case 'COOPERATIVE':
        // 협조적: 긍정적 표현, 상세한 설명
        const cooperativeMarkers = language === 'ko'
          ? ['네', '그렇습니다', '말씀드리자면', '사실은', '확실히']
          : ['yes', 'certainly', 'of course', 'actually', 'indeed'];
        
        for (const marker of cooperativeMarkers) {
          if (responseLower.includes(marker.toLowerCase())) {
            toneScore += 5;
            break;
          }
        }
        break;
        
      case 'NERVOUS':
        // 긴장: 망설임, 불확실성 표현
        const nervousMarkers = language === 'ko'
          ? ['음', '글쎄', '아마', '잘 모르겠', '확실하지']
          : ['um', 'uh', 'maybe', 'i think', 'not sure', 'i guess'];
        
        for (const marker of nervousMarkers) {
          if (responseLower.includes(marker.toLowerCase())) {
            toneScore += 5;
            break;
          }
        }
        break;
        
      case 'DEFENSIVE':
        // 방어적: 부정, 반박 표현
        const defensiveMarkers = language === 'ko'
          ? ['아니', '그게 아니', '왜', '무슨', '말도 안']
          : ['no', 'not', 'why', 'what', "didn't", "wasn't", "that's not"];
        
        for (const marker of defensiveMarkers) {
          if (responseLower.includes(marker.toLowerCase())) {
            toneScore += 5;
            break;
          }
        }
        break;
        
      case 'AGGRESSIVE':
        // 공격적: 강한 부정, 명령형
        const aggressiveMarkers = language === 'ko'
          ? ['절대', '당신', '감히', '말도 안 돼', '그만']
          : ['never', 'you', 'how dare', 'ridiculous', 'stop', 'enough'];
        
        for (const marker of aggressiveMarkers) {
          if (responseLower.includes(marker.toLowerCase())) {
            toneScore += 5;
            break;
          }
        }
        break;
    }
    
    return Math.min(10, toneScore); // 최대 +10점
  }
  
  /**
   * 3. Information Content 점수 계산
   * 유죄/무죄 행동 패턴과 정보 구체성 측정
   */
  scoreInformationContent(
    response: string,
    isGuilty: boolean,
    emotionalState: EmotionalState
  ): number {
    let score = 70; // 기본 점수
    
    // 정보 구체성 마커 체크 (시간, 날짜, 금액, 장소 등)
    const specificityScore = this.checkSpecificity(response);
    score += specificityScore;
    
    // 유죄/무죄 행동 패턴 체크
    const behaviorScore = this.checkBehaviorPattern(response, isGuilty, emotionalState);
    score += behaviorScore;
    
    // 점수 범위 제한 (0-100)
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 정보 구체성 체크
   */
  private checkSpecificity(response: string): number {
    let score = 0;
    
    // 시간 표현 (예: 7:30 PM, 오후 7시 30분)
    const timePattern = /\d{1,2}:\d{2}|오전|오후|\d{1,2}시/;
    if (timePattern.test(response)) {
      score += 5;
    }
    
    // 날짜 표현 (예: January 15, 1월 15일)
    const datePattern = /\d{1,2}월|\d{1,2}일|january|february|march|april|may|june|july|august|september|october|november|december/i;
    if (datePattern.test(response)) {
      score += 5;
    }
    
    // 금액 표현 (예: $100, 100달러, 10만원)
    const amountPattern = /\$\d+|\d+달러|\d+원|\d+만원/;
    if (amountPattern.test(response)) {
      score += 5;
    }
    
    // 장소 표현 (구체적인 장소명)
    const locationPattern = /club|restaurant|office|hotel|street|avenue|building|room \d+/i;
    if (locationPattern.test(response)) {
      score += 5;
    }
    
    // 사람 이름 (대문자로 시작하는 단어)
    const namePattern = /\b[A-Z][a-z]+\s[A-Z][a-z]+\b/;
    if (namePattern.test(response)) {
      score += 5;
    }
    
    return Math.min(15, score); // 최대 +15점
  }
  
  /**
   * 유죄/무죄 행동 패턴 체크
   */
  private checkBehaviorPattern(
    response: string,
    isGuilty: boolean,
    emotionalState: EmotionalState
  ): number {
    let score = 0;
    
    const responseLower = response.toLowerCase();
    
    if (isGuilty) {
      // 유죄 행동 패턴
      
      // 회피적 표현
      const evasiveMarkers = [
        "i don't remember", "i'm not sure", "maybe", "i think",
        "기억이 안", "확실하지", "아마", "생각에는"
      ];
      
      for (const marker of evasiveMarkers) {
        if (responseLower.includes(marker.toLowerCase())) {
          score += 5;
          break;
        }
      }
      
      // 변명/정당화
      const justificationMarkers = [
        "but", "however", "because", "had to", "needed to",
        "하지만", "그러나", "왜냐하면", "해야 했", "필요했"
      ];
      
      for (const marker of justificationMarkers) {
        if (responseLower.includes(marker.toLowerCase())) {
          score += 5;
          break;
        }
      }
      
      // 너무 구체적인 알리바이 (의심스러움)
      if (this.checkSpecificity(response) > 10) {
        score += 5; // 유죄인데 너무 구체적 = 준비된 거짓말
      }
      
    } else {
      // 무죄 행동 패턴
      
      // 직접적이고 명확한 답변
      const directMarkers = [
        "i was", "i did", "i went", "yes", "no",
        "저는", "했습니다", "갔습니다", "네", "아니"
      ];
      
      for (const marker of directMarkers) {
        if (responseLower.includes(marker.toLowerCase())) {
          score += 5;
          break;
        }
      }
      
      // 검증 가능한 정보 제공
      const verifiableMarkers = [
        "can confirm", "check", "ask", "witness", "receipt",
        "확인할 수", "물어보", "증인", "영수증", "기록"
      ];
      
      for (const marker of verifiableMarkers) {
        if (responseLower.includes(marker.toLowerCase())) {
          score += 5;
          break;
        }
      }
      
      // 적절한 구체성 (무죄는 자연스럽게 구체적)
      const specificity = this.checkSpecificity(response);
      if (specificity >= 5 && specificity <= 15) {
        score += 5;
      }
    }
    
    return Math.min(15, score); // 최대 +15점
  }
  
  /**
   * 4. Natural Dialogue 점수 계산
   * 축약형, 자연스러운 표현, 형식적 표현 회피
   */
  scoreNaturalDialogue(response: string): number {
    let score = 70; // 기본 점수
    
    // 언어 감지
    const isKorean = /[가-힣]/.test(response);
    
    if (isKorean) {
      score += this.scoreNaturalDialogueKorean(response);
    } else {
      score += this.scoreNaturalDialogueEnglish(response);
    }
    
    // 점수 범위 제한 (0-100)
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 영어 자연스러운 대화 점수
   */
  private scoreNaturalDialogueEnglish(response: string): number {
    let score = 0;
    
    const responseLower = response.toLowerCase();
    
    // 축약형 사용 체크 (긍정적)
    const contractions = [
      "i'm", "you're", "he's", "she's", "it's", "we're", "they're",
      "i'll", "you'll", "he'll", "she'll", "we'll", "they'll",
      "i've", "you've", "we've", "they've",
      "isn't", "aren't", "wasn't", "weren't", "hasn't", "haven't",
      "didn't", "doesn't", "don't", "won't", "wouldn't", "couldn't", "shouldn't",
      "can't", "that's", "there's", "here's", "what's", "who's", "where's"
    ];
    
    let contractionCount = 0;
    for (const contraction of contractions) {
      if (responseLower.includes(contraction)) {
        contractionCount++;
      }
    }
    
    // 축약형 사용: +10점 (최소 1개 이상)
    if (contractionCount > 0) {
      score += 10;
    }
    
    // 자연스러운 관용구 체크
    const idioms = [
      "you know", "i mean", "to be honest", "frankly", "look",
      "well", "actually", "basically", "honestly", "seriously"
    ];
    
    for (const idiom of idioms) {
      if (responseLower.includes(idiom)) {
        score += 5;
        break;
      }
    }
    
    // 과도하게 형식적인 표현 체크 (부정적)
    const formalPhrases = [
      "i would like to inform you", "it is my understanding",
      "i wish to state", "permit me to", "i beg your pardon",
      "i am of the opinion", "it is imperative", "furthermore",
      "nevertheless", "henceforth", "heretofore", "wherein"
    ];
    
    let formalCount = 0;
    for (const phrase of formalPhrases) {
      if (responseLower.includes(phrase)) {
        formalCount++;
      }
    }
    
    // 형식적 표현 사용: -10점 (각각)
    score -= formalCount * 10;
    
    return Math.max(-20, Math.min(20, score)); // -20 ~ +20점
  }
  
  /**
   * 한국어 자연스러운 대화 점수
   */
  private scoreNaturalDialogueKorean(response: string): number {
    let score = 0;
    
    // 적절한 존댓말/반말 사용 체크
    const honorifics = /습니다|세요|시|요$/;
    if (honorifics.test(response)) {
      score += 10;
    }
    
    // 자연스러운 종결어미 체크
    const naturalEndings = ['요', '죠', '네요', '군요', '는데요', '거든요'];
    let naturalEndingCount = 0;
    for (const ending of naturalEndings) {
      if (response.includes(ending)) {
        naturalEndingCount++;
      }
    }
    
    if (naturalEndingCount > 0) {
      score += 5;
    }
    
    // 과도하게 형식적인 종결어미 체크 (부정적)
    const formalEndings = ['하옵니다', '하오', '하게', '하소서'];
    let formalCount = 0;
    for (const ending of formalEndings) {
      if (response.includes(ending)) {
        formalCount++;
      }
    }
    
    // 형식적 종결어미 사용: -10점 (각각)
    score -= formalCount * 10;
    
    // 자연스러운 접속사/부사 체크
    const naturalConnectors = ['그런데', '근데', '그래서', '그러니까', '아무튼', '어쨌든'];
    for (const connector of naturalConnectors) {
      if (response.includes(connector)) {
        score += 5;
        break;
      }
    }
    
    return Math.max(-20, Math.min(20, score)); // -20 ~ +20점
  }
  
  /**
   * 피드백 메시지 생성
   */
  private generateFeedback(
    scores: QualityScores,
    emotionalState: EmotionalState,
    response: string
  ): string[] {
    const feedback: string[] = [];
    
    if (scores.characterConsistency < QUALITY_THRESHOLDS.characterConsistency) {
      feedback.push(
        `Character consistency is low (${scores.characterConsistency}/100). ` +
        `Use more archetype-specific vocabulary.`
      );
    }
    
    if (scores.emotionalAlignment < QUALITY_THRESHOLDS.emotionalAlignment) {
      feedback.push(
        `Emotional alignment is low (${scores.emotionalAlignment}/100). ` +
        `Check word count and tone for ${emotionalState} state.`
      );
    }
    
    if (scores.informationContent < QUALITY_THRESHOLDS.informationContent) {
      feedback.push(
        `Information content is low (${scores.informationContent}/100). ` +
        `Add more specific details or adjust guilty/innocent behavior.`
      );
    }
    
    if (scores.naturalDialogue < QUALITY_THRESHOLDS.naturalDialogue) {
      feedback.push(
        `Natural dialogue is low (${scores.naturalDialogue}/100). ` +
        `Use more contractions and natural expressions.`
      );
    }
    
    if (scores.overall < QUALITY_THRESHOLDS.overall) {
      feedback.push(
        `Overall quality is below threshold (${scores.overall}/${QUALITY_THRESHOLDS.overall}).`
      );
    }
    
    return feedback;
  }
  
  /**
   * 검증 통과 여부 확인
   */
  private checkPassed(scores: QualityScores): boolean {
    return (
      scores.characterConsistency >= QUALITY_THRESHOLDS.characterConsistency &&
      scores.emotionalAlignment >= QUALITY_THRESHOLDS.emotionalAlignment &&
      scores.informationContent >= QUALITY_THRESHOLDS.informationContent &&
      scores.naturalDialogue >= QUALITY_THRESHOLDS.naturalDialogue &&
      scores.overall >= QUALITY_THRESHOLDS.overall
    );
  }
  
  /**
   * 품질 등급 계산
   */
  private calculateRating(overall: number): 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Unacceptable' {
    if (overall >= 90) return 'Excellent';
    if (overall >= 80) return 'Good';
    if (overall >= 65) return 'Acceptable';
    if (overall >= 50) return 'Poor';
    return 'Unacceptable';
  }
}
