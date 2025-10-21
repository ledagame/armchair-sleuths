/**
 * NarrationValidationService
 *
 * AI-generated 나레이션 품질 검증 레이어
 *
 * Responsibilities:
 * - Word count validation per phase (50-80/50-80/50-90)
 * - Total word count validation (150-250)
 * - Sensory richness detection (minimum 2 senses)
 * - Korean text word counting
 * - Retry logic with regeneration
 * - Fallback narration
 */

import type { IntroNarration, NarrationKeywords, EmotionalArcHints, MysteryStyle } from '../../../shared/types';

/**
 * Word count thresholds per phase
 * Adjusted for Korean word counting (slightly more lenient)
 */
const WORD_COUNT_THRESHOLDS = {
  atmosphere: { min: 45, max: 80 },
  incident: { min: 45, max: 80 },
  stakes: { min: 45, max: 90 }
} as const;

/**
 * Total word count threshold
 * Adjusted for Korean word counting (slightly more lenient)
 */
const TOTAL_WORD_COUNT = {
  min: 135,
  max: 250
} as const;

/**
 * Minimum required senses
 */
const MINIMUM_SENSES = 2;

/**
 * Validation result for a single phase
 */
interface PhaseValidation {
  phase: 'atmosphere' | 'incident' | 'stakes';
  wordCount: number;
  minWords: number;
  maxWords: number;
  isValid: boolean;
  issue?: string;
}

/**
 * Sensory detection result
 */
interface SensoryAnalysis {
  detectedSenses: string[];
  isValid: boolean;
  issue?: string;
}

/**
 * Overall validation result
 */
export interface ValidationResult {
  isValid: boolean;
  totalWordCount: number;
  phaseValidations: PhaseValidation[];
  sensoryAnalysis: SensoryAnalysis;
  issues: string[];
}

/**
 * NarrationValidationService
 *
 * Validates AI-generated narration for quality and compliance
 */
export class NarrationValidationService {
  /**
   * Count words in Korean/English text
   *
   * Korean: Split by spaces, filter out empty strings and punctuation
   * English: Split by whitespace
   */
  private countWords(text: string): number {
    // Remove leading/trailing whitespace
    const trimmed = text.trim();
    if (!trimmed) return 0;

    // Split by whitespace and filter
    const words = trimmed
      .split(/\s+/)
      .filter(word => {
        // Filter out pure punctuation tokens
        return word.length > 0 && !/^[.,!?;:'"()[\]{}…。、]*$/.test(word);
      });

    return words.length;
  }

  /**
   * Detect senses in narration text
   *
   * Looks for sensory keywords across all three phases
   */
  private detectSenses(narration: IntroNarration): string[] {
    const allText = `${narration.atmosphere} ${narration.incident} ${narration.stakes}`.toLowerCase();

    const sensoryKeywords = {
      visual: [
        // Korean
        '보', '눈', '색', '밝', '어둡', '빛', '그림자', '모습', '모양',
        // English
        'see', 'look', 'watch', 'color', 'light', 'dark', 'shadow', 'bright', 'dim'
      ],
      auditory: [
        // Korean
        '소리', '들', '귀', '조용', '시끄럽', '울', '외침', '속삭', '말',
        // English
        'sound', 'hear', 'listen', 'quiet', 'loud', 'noise', 'voice', 'whisper', 'shout'
      ],
      olfactory: [
        // Korean
        '냄새', '향기', '악취', '맡', '코',
        // English
        'smell', 'scent', 'odor', 'fragrance', 'stink', 'aroma'
      ],
      tactile: [
        // Korean
        '차갑', '뜨겁', '부드럽', '거칠', '딱딱', '촉감', '만지', '느낌',
        // English
        'touch', 'feel', 'cold', 'hot', 'warm', 'rough', 'smooth', 'soft', 'hard'
      ],
      gustatory: [
        // Korean
        '맛', '달', '쓴', '짠', '신', '매운',
        // English
        'taste', 'flavor', 'sweet', 'bitter', 'sour', 'salty'
      ]
    };

    const detectedSenses: string[] = [];

    for (const [sense, keywords] of Object.entries(sensoryKeywords)) {
      const hasKeyword = keywords.some(keyword => allText.includes(keyword));
      if (hasKeyword) {
        detectedSenses.push(sense);
      }
    }

    return detectedSenses;
  }

  /**
   * Validate a single phase word count
   */
  private validatePhase(
    phase: 'atmosphere' | 'incident' | 'stakes',
    text: string
  ): PhaseValidation {
    const wordCount = this.countWords(text);
    const { min, max } = WORD_COUNT_THRESHOLDS[phase];
    const isValid = wordCount >= min && wordCount <= max;

    return {
      phase,
      wordCount,
      minWords: min,
      maxWords: max,
      isValid,
      issue: isValid
        ? undefined
        : `Phase "${phase}" has ${wordCount} words (expected ${min}-${max})`
    };
  }

  /**
   * Validate sensory richness
   */
  private validateSensoryRichness(narration: IntroNarration): SensoryAnalysis {
    const detectedSenses = this.detectSenses(narration);
    const isValid = detectedSenses.length >= MINIMUM_SENSES;

    return {
      detectedSenses,
      isValid,
      issue: isValid
        ? undefined
        : `Only ${detectedSenses.length} senses detected (minimum ${MINIMUM_SENSES} required)`
    };
  }

  /**
   * Main validation method
   *
   * @param narration - IntroNarration to validate
   * @returns ValidationResult with detailed issues
   */
  public validate(narration: IntroNarration): ValidationResult {
    // Phase validations
    const phaseValidations = [
      this.validatePhase('atmosphere', narration.atmosphere),
      this.validatePhase('incident', narration.incident),
      this.validatePhase('stakes', narration.stakes)
    ];

    // Total word count
    const totalWordCount =
      phaseValidations[0].wordCount +
      phaseValidations[1].wordCount +
      phaseValidations[2].wordCount;

    const totalWordCountValid =
      totalWordCount >= TOTAL_WORD_COUNT.min &&
      totalWordCount <= TOTAL_WORD_COUNT.max;

    // Sensory analysis
    const sensoryAnalysis = this.validateSensoryRichness(narration);

    // Collect issues
    const issues: string[] = [];

    // Phase issues
    phaseValidations.forEach(pv => {
      if (!pv.isValid && pv.issue) {
        issues.push(pv.issue);
      }
    });

    // Total word count issue
    if (!totalWordCountValid) {
      issues.push(
        `Total word count ${totalWordCount} outside range ${TOTAL_WORD_COUNT.min}-${TOTAL_WORD_COUNT.max}`
      );
    }

    // Sensory issue
    if (!sensoryAnalysis.isValid && sensoryAnalysis.issue) {
      issues.push(sensoryAnalysis.issue);
    }

    // Overall validity
    const isValid =
      phaseValidations.every(pv => pv.isValid) &&
      totalWordCountValid &&
      sensoryAnalysis.isValid;

    return {
      isValid,
      totalWordCount,
      phaseValidations,
      sensoryAnalysis,
      issues
    };
  }

  /**
   * Determine if narration needs regeneration
   *
   * @param validation - ValidationResult
   * @returns true if regeneration is needed
   */
  public needsRegeneration(validation: ValidationResult): boolean {
    return !validation.isValid;
  }

  /**
   * Get default fallback narration (Korean)
   *
   * Used when all regeneration attempts fail
   */
  public getDefaultNarration(): IntroNarration {
    return {
      atmosphere:
        '밤의 정적이 고급 저택을 감싸고 있었다. 비가 창문을 두드리는 소리만이 어둠을 깨뜨렸다. 희미한 촛불이 긴 복도를 비추며, 불길한 그림자를 만들어냈다. 공기는 무겁고 차가웠다. 이곳에 무언가 잘못되었다는 느낌이 스며들었다.',
      incident:
        '저명한 사업가 김민준이 서재에서 발견되었다. 그는 책상에 쓰러져 있었고, 머리에는 둔기로 맞은 흔적이 있었다. 방문은 안쪽에서 잠겨 있었다. 창문 역시 닫혀 있었다. 어떻게 범인이 들어왔는지, 그리고 어떻게 나갔는지 알 수 없었다.',
      stakes:
        '당신은 이 사건을 맡은 탐정이다. 증거를 수집하고, 용의자들을 심문하며, 진실을 밝혀내야 한다. 시간은 촉박하다. 범인은 아직 이 저택 안에 있을지도 모른다. 당신의 추리력이 시험받는 순간이다. 사건의 실마리를 찾아내고, 정의를 실현하라.'
    };
  }

  /**
   * Extract thematic keywords from narration
   *
   * Organizes keywords by emphasis level for frontend rendering
   */
  public extractKeywords(narration: IntroNarration): NarrationKeywords {
    const allText = `${narration.atmosphere} ${narration.incident} ${narration.stakes}`;

    // Critical: violence, culprit, mystery core
    const criticalPatterns = [
      /살인|범인|증거|사건|의문/g,
      /피해자|용의자|알리바이|동기/g,
      /비밀|진실|거짓|함정|범죄/g,
      /시체|피|총성|칼|독/g,
      /밀실|트릭|논리|모순/g
    ];

    // Atmospheric: environment, mood, emotion
    const atmosphericPatterns = [
      /어둠|밤|그림자|침묵|고요/g,
      /긴장|불안|공포|의심|소름/g,
      /비|폭풍|바람|냉기|눈|안개/g,
      /저택|방|복도|서재|창문/g
    ];

    // Sensory: detected senses from validation
    const detectedSenses = this.detectSenses(narration);
    const sensoryWords = this.extractSensoryWords(allText, detectedSenses);

    return {
      critical: this.matchPatterns(allText, criticalPatterns),
      atmospheric: this.matchPatterns(allText, atmosphericPatterns),
      sensory: sensoryWords
    };
  }

  /**
   * Match regex patterns and extract unique words
   */
  private matchPatterns(text: string, patterns: RegExp[]): string[] {
    const matches = new Set<string>();
    patterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) found.forEach(m => matches.add(m));
    });
    return Array.from(matches);
  }

  /**
   * Extract sensory words based on detected senses
   */
  private extractSensoryWords(text: string, senses: string[]): string[] {
    const words = new Set<string>();

    const sensoryPatterns: Record<string, RegExp[]> = {
      visual: [/보|눈|색|빛|그림자|모습/g],
      auditory: [/소리|들|귀|조용|시끄럽|울|외침|속삭/g],
      olfactory: [/냄새|향기|악취|맡/g],
      tactile: [/차갑|뜨겁|부드럽|거칠|딱딱|촉감|만지|느낌/g],
      gustatory: [/맛|달|쓴|짠|신|매운/g]
    };

    senses.forEach(sense => {
      const patterns = sensoryPatterns[sense];
      if (patterns) {
        patterns.forEach(pattern => {
          const found = text.match(pattern);
          if (found) found.forEach(m => words.add(m));
        });
      }
    });

    return Array.from(words);
  }

  /**
   * Generate emotional arc hints based on narration structure and style
   */
  public generateEmotionalArc(
    narration: IntroNarration,
    style: MysteryStyle
  ): EmotionalArcHints {
    const totalLength =
      narration.atmosphere.length +
      narration.incident.length +
      narration.stakes.length;

    const atmosphereEnd = narration.atmosphere.length / totalLength;
    const incidentEnd = atmosphereEnd + (narration.incident.length / totalLength);

    // Style-specific arc profiles
    const arcProfiles: Record<MysteryStyle, EmotionalArcHints> = {
      classic: {
        intensityCurve: [
          { position: 0, intensity: 0.3 },              // Calm opening
          { position: atmosphereEnd, intensity: 0.5 },  // Rising tension
          { position: incidentEnd, intensity: 1.0 },    // Peak at incident
          { position: 1.0, intensity: 0.7 }             // Resolve to mission
        ],
        climaxPosition: incidentEnd,
        pacing: 'steady'
      },
      noir: {
        intensityCurve: [
          { position: 0, intensity: 0.6 },              // Start tense
          { position: atmosphereEnd, intensity: 0.8 },
          { position: incidentEnd, intensity: 1.0 },
          { position: 1.0, intensity: 0.9 }             // Stay tense
        ],
        climaxPosition: incidentEnd,
        pacing: 'quick-tension'
      },
      cozy: {
        intensityCurve: [
          { position: 0, intensity: 0.2 },              // Gentle start
          { position: atmosphereEnd, intensity: 0.4 },
          { position: incidentEnd, intensity: 0.7 },    // Moderate peak
          { position: 1.0, intensity: 0.5 }
        ],
        climaxPosition: incidentEnd,
        pacing: 'slow-burn'
      },
      nordic: {
        intensityCurve: [
          { position: 0, intensity: 0.4 },              // Dark opening
          { position: atmosphereEnd, intensity: 0.7 },
          { position: incidentEnd, intensity: 1.0 },    // Bleak peak
          { position: 1.0, intensity: 0.8 }             // Heavy ending
        ],
        climaxPosition: incidentEnd,
        pacing: 'slow-burn'
      },
      honkaku: {
        intensityCurve: [
          { position: 0, intensity: 0.3 },              // Precise opening
          { position: atmosphereEnd, intensity: 0.5 },
          { position: incidentEnd, intensity: 0.9 },    // Logic peak
          { position: 1.0, intensity: 0.6 }             // Resolution
        ],
        climaxPosition: incidentEnd,
        pacing: 'steady'
      }
    };

    return arcProfiles[style];
  }
}
