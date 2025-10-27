/**
 * KoreanQualityValidator.ts
 * 
 * 한국어 특화 품질 검증 시스템
 * Requirements: 5.9
 */

/**
 * 한국어 존댓말 패턴
 */
const KOREAN_HONORIFICS = {
  formal: ['습니다', '세요', '십니다', '시', '요'],
  overly_formal: ['하옵니다', '하오', '하게', '하소서'],
  natural_endings: ['요', '죠', '네요', '군요', '거든요', '잖아요']
};

/**
 * 한국어 자연스러운 대화 점수 계산
 * Requirements: 5.9
 * 
 * @param response 응답 텍스트
 * @returns 0-100 점수
 */
export function scoreNaturalDialogueKorean(response: string): number {
  let score = 100;
  const penalties: string[] = [];
  
  // 1. 적절한 존댓말 사용 확인
  const hasAppropriateHonorifics = KOREAN_HONORIFICS.formal.some(ending => 
    response.includes(ending)
  );
  
  if (!hasAppropriateHonorifics) {
    score -= 20;
    penalties.push('Missing appropriate honorifics (습니다, 세요, etc.)');
  }
  
  // 2. 자연스러운 문장 종결어미 확인
  const hasNaturalEndings = KOREAN_HONORIFICS.natural_endings.some(ending =>
    response.includes(ending)
  );
  
  if (hasNaturalEndings) {
    score += 10; // 보너스 점수
  }
  
  // 3. 과도하게 격식적인 종결어미 패널티
  const hasOverlyFormal = KOREAN_HONORIFICS.overly_formal.some(ending =>
    response.includes(ending)
  );
  
  if (hasOverlyFormal) {
    score -= 30;
    penalties.push('Overly formal endings detected (하옵니다, 하오, etc.)');
  }
  
  // 4. 문장 길이 확인 (한국어는 영어보다 짧은 문장 선호)
  const sentences = response.split(/[.!?]/);
  const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
  
  if (avgLength > 50) {
    score -= 10;
    penalties.push('Sentences too long for natural Korean dialogue');
  }
  
  // 5. 반복적인 종결어미 패널티
  const endings = response.match(/[습세십]니다|[세]요|[네군]요/g) || [];
  const uniqueEndings = new Set(endings);
  
  if (endings.length > 3 && uniqueEndings.size < 2) {
    score -= 15;
    penalties.push('Repetitive sentence endings');
  }
  
  // 점수 범위 제한
  score = Math.max(0, Math.min(100, score));
  
  if (penalties.length > 0) {
    console.log(`🇰🇷 Korean dialogue quality: ${score}/100`);
    console.log(`   Penalties: ${penalties.join(', ')}`);
  }
  
  return score;
}

/**
 * 한국어 응답 품질 종합 평가
 * 
 * @param response 응답 텍스트
 * @param wordCount 단어 수
 * @param targetRange 목표 단어 수 범위
 * @returns 품질 점수 객체
 */
export function evaluateKoreanResponseQuality(
  response: string,
  wordCount: number,
  targetRange: { min: number; max: number }
) {
  const naturalDialogueScore = scoreNaturalDialogueKorean(response);
  
  // 단어 수 점수
  let wordCountScore = 100;
  if (wordCount < targetRange.min) {
    wordCountScore = (wordCount / targetRange.min) * 100;
  } else if (wordCount > targetRange.max) {
    const excess = wordCount - targetRange.max;
    wordCountScore = Math.max(0, 100 - (excess * 2));
  }
  
  // 종합 점수
  const overallScore = (naturalDialogueScore * 0.6) + (wordCountScore * 0.4);
  
  return {
    naturalDialogue: naturalDialogueScore,
    wordCount: wordCountScore,
    overall: Math.round(overallScore),
    isAcceptable: overallScore >= 60
  };
}

/**
 * 한국어 존댓말 패턴 분석
 * 
 * @param response 응답 텍스트
 * @returns 존댓말 사용 분석 결과
 */
export function analyzeKoreanHonorifics(response: string) {
  const analysis = {
    hasFormal: false,
    hasNatural: false,
    hasOverlyFormal: false,
    formalCount: 0,
    naturalCount: 0,
    overlyFormalCount: 0
  };
  
  // 격식체 확인
  KOREAN_HONORIFICS.formal.forEach(ending => {
    const matches = response.match(new RegExp(ending, 'g'));
    if (matches) {
      analysis.hasFormal = true;
      analysis.formalCount += matches.length;
    }
  });
  
  // 자연스러운 종결어미 확인
  KOREAN_HONORIFICS.natural_endings.forEach(ending => {
    const matches = response.match(new RegExp(ending, 'g'));
    if (matches) {
      analysis.hasNatural = true;
      analysis.naturalCount += matches.length;
    }
  });
  
  // 과도하게 격식적인 종결어미 확인
  KOREAN_HONORIFICS.overly_formal.forEach(ending => {
    const matches = response.match(new RegExp(ending, 'g'));
    if (matches) {
      analysis.hasOverlyFormal = true;
      analysis.overlyFormalCount += matches.length;
    }
  });
  
  return analysis;
}
