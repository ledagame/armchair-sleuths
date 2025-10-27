# Design Document

## Overview

본 문서는 용의자 프롬프트 시스템 개선을 위한 설계를 정의합니다. 기존 suspect-ai-prompter 스킬(v2.0.0)을 기반으로 Few-Shot 예시 완성, 품질 검증 강화, 다국어 지원을 추가합니다.

### 설계 목표

1. **완성도**: 40개 Few-Shot 예시 작성 및 PROMPT.md 통합
2. **자동화**: 품질 검증을 SuspectAIService에 실시간 통합
3. **확장성**: 다국어 지원 및 새 아키타입 추가 용이성
4. **일관성**: 모든 아키타입이 동일한 품질 기준 충족
5. **효율성**: 통합 워크플로우로 개발 시간 단축

## Architecture

### 시스템 구성도

```
┌─────────────────────────────────────────────────────────────┐
│                    Suspect Prompt System                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  PROMPT.md       │      │  Archetype YAML  │            │
│  │  (Template)      │◄─────│  (Data)          │            │
│  └──────────────────┘      └──────────────────┘            │
│           │                         │                        │
│           ▼                         ▼                        │
│  ┌──────────────────────────────────────────┐              │
│  │      SuspectAIService                     │              │
│  │  - Load Template                          │              │
│  │  - Load Archetype Data                    │              │
│  │  - Variable Substitution                  │              │
│  │  - Generate AI Response                   │              │
│  │  - Quality Validation (NEW)               │              │
│  └──────────────────────────────────────────┘              │
│           │                                                   │
│           ▼                                                   │
│  ┌──────────────────────────────────────────┐              │
│  │      Quality Validation System            │              │
│  │  - Character Consistency                  │              │
│  │  - Emotional Alignment                    │              │
│  │  - Information Content                    │              │
│  │  - Natural Dialogue                       │              │
│  └──────────────────────────────────────────┘              │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              Development Tools (suspect-ai-prompter)         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ generate-        │  │ generate-        │                │
│  │ archetype.ts     │  │ examples.ts      │                │
│  └──────────────────┘  └──────────────────┘                │
│           │                      │                           │
│           ▼                      ▼                           │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ improve-         │  │ validate-        │                │
│  │ prompt.ts        │  │ quality.ts       │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Few-Shot Example System

#### FewShotExample Interface

```typescript
interface FewShotExample {
  id: string;
  archetype: string;
  emotionalState: EmotionalState;
  isGuilty: boolean;
  question: string;
  response: string;
  analysis: {
    characterConsistency: string;
    emotionalAlignment: string;
    informationContent: string;
    naturalDialogue: string;
    wordCount: number;
    targetRange: [number, number];
  };
}
```

#### FewShotExampleGenerator Class

```typescript
class FewShotExampleGenerator {
  generateExample(
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean
  ): FewShotExample;

  generateAllExamples(archetype: string): FewShotExample[];

  formatAsMarkdown(example: FewShotExample): string;
}
```

### 2. Quality Validation System

#### QualityValidator Interface

```typescript
interface QualityScores {
  characterConsistency: number;
  emotionalAlignment: number;
  informationContent: number;
  naturalDialogue: number;
  overall: number;
}

interface ValidationResult {
  passed: boolean;
  scores: QualityScores;
  feedback: string[];
  rating: 'Excellent' | 'Good' | 'Acceptable' | 'Poor' | 'Unacceptable';
}

class QualityValidator {
  validate(
    response: string,
    archetype: string,
    emotionalState: EmotionalState,
    isGuilty: boolean,
    suspicionLevel: number,
    vocabulary: string[]
  ): ValidationResult;

  scoreCharacterConsistency(
    response: string,
    archetype: string,
    vocabulary: string[]
  ): number;

  scoreEmotionalAlignment(
    response: string,
    emotionalState: EmotionalState,
    suspicionLevel: number
  ): number;

  scoreInformationContent(
    response: string,
    isGuilty: boolean,
    emotionalState: EmotionalState
  ): number;

  scoreNaturalDialogue(response: string): number;
}
```


### 3. Multilingual Support System

```typescript
interface LanguageConfig {
  code: string; // 'en', 'ko'
  name: string; // 'English', '한국어'
  wordCountMultiplier: number; // 1.0 for English, 0.75 for Korean
  promptFile: string; // 'PROMPT.en.md', 'PROMPT.ko.md'
  qualityCriteria: {
    characterConsistency: number;
    emotionalAlignment: number;
    informationContent: number;
    naturalDialogue: number;
    overall: number;
  };
}

class MultilingualPromptManager {
  getSupportedLanguages(): LanguageConfig[];
  loadPromptTemplate(languageCode: string): string;
  calculateWordCountRange(
    emotionalState: EmotionalState,
    languageCode: string
  ): [number, number];
  getQualityCriteria(languageCode: string): LanguageConfig['qualityCriteria'];
}
```

### 4. Archetype Management System

```typescript
interface ArchetypeData {
  name: {
    en: string;
    ko: string;
  };
  aliases: string[];
  definition: string;
  personality: string[];
  background: string[];
  coreValues: string[];
  greatestFears: string[];
  vocabulary: {
    primary: string[];
    secondary: string[];
  };
  characteristicPhrases: string[]; // NEW
  speechPatterns: {
    [key in EmotionalState]: {
      mindset: string;
      tone: string;
      patterns: string[];
    };
  };
  fewShotExamples?: FewShotExample[]; // NEW
}

class ArchetypeManager {
  loadArchetype(name: string): ArchetypeData;
  loadAllArchetypes(): ArchetypeData[];
  checkVocabularyConflict(
    archetype1: ArchetypeData,
    archetype2: ArchetypeData
  ): {
    conflictRate: number;
    conflicts: string[];
  };
  validateNewArchetype(archetype: ArchetypeData): ValidationResult;
}
```

### 5. Integrated Workflow System

```typescript
class WorkflowOrchestrator {
  async createNewArchetype(
    name: string,
    interactive: boolean = true
  ): Promise<{
    archetypePath: string;
    examplesGenerated: number;
    validationResults: ValidationResult[];
  }>;

  async batchValidate(): Promise<{
    totalExamples: number;
    passedExamples: number;
    failedExamples: number;
    archetypeStats: Map<string, {
      averageScore: number;
      minScore: number;
      maxScore: number;
      failureRate: number;
    }>;
  }>;

  async improvePrompt(
    promptPath: string
  ): Promise<{
    improvements: string[];
    estimatedImpact: {
      characterConsistency: string;
      emotionalAlignment: string;
      overall: string;
    };
  }>;
}
```

## Data Models

### 1. Archetype YAML Structure

```yaml
name:
  en: "Archetype Name"
  ko: "아키타입 이름"

aliases:
  - "Archetype Name"
  - "아키타입 이름"

definition: "One-sentence character definition"

personality:
  - "Trait 1"
  - "Trait 2"

background:
  - "Background fact 1"
  - "Background fact 2"

coreValues:
  - "Value 1"
  - "Value 2"

greatestFears:
  - "Fear 1"
  - "Fear 2"

vocabulary:
  primary:
    - "word1"
    - "word2"
    - "word3"
    - "word4"
    - "word5"
    - "word6"
    - "word7"
    - "word8"
  secondary:
    - "word9"
    - "word10"
    - "word11"
    - "word12"

characteristicPhrases:
  - "Phrase 1"
  - "Phrase 2"
  - "Phrase 3"
  - "Phrase 4"
  - "Phrase 5"

speechPatterns:
  COOPERATIVE:
    mindset: "How they think in this state"
    tone: "How they sound"
    patterns:
      - "Example pattern 1"
      - "Example pattern 2"
  NERVOUS:
    mindset: "How they think in this state"
    tone: "How they sound"
    patterns:
      - "Example pattern 1"
      - "Example pattern 2"
  DEFENSIVE:
    mindset: "How they think in this state"
    tone: "How they sound"
    patterns:
      - "Example pattern 1"
      - "Example pattern 2"
  AGGRESSIVE:
    mindset: "How they think in this state"
    tone: "How they sound"
    patterns:
      - "Example pattern 1"
      - "Example pattern 2"
```

### 2. PROMPT.md Structure (Enhanced)

```markdown
# Suspect Personality Core - AI Conversation Template

## SYSTEM ROLE
[AI role definition]

## CHARACTER IDENTITY
{{SUSPECT_NAME}}
{{ARCHETYPE}}
{{BACKGROUND}}

## CORE PERSONALITY & VALUES
{{PERSONALITY_TRAITS}}
{{CHARACTER_DEFINITION}}
{{CORE_VALUES}}

## CURRENT EMOTIONAL STATE
{{SUSPICION_LEVEL}}/100
{{EMOTIONAL_STATE}}
{{MINDSET}}
{{TONE_GUIDANCE}}

## GUILTY/INNOCENT STATUS & RESPONSE STRATEGY
{{GUILTY_OR_INNOCENT_BLOCK}}

## SPEECH PATTERNS & LINGUISTIC STYLE
{{SPEECH_PATTERNS}}
{{VOCABULARY}}
{{CHARACTERISTIC_PHRASES}}

## CONVERSATION CONTEXT
{{CONVERSATION_HISTORY}}

## RESPONSE GUIDELINES
[7 guidelines with examples]

## FEW-SHOT EXAMPLES (NEW)

### Example 1: COOPERATIVE - INNOCENT
**Detective:** "[question]"
**{{SUSPECT_NAME}}:** "[response]"
**[Analysis]**
- Character consistency: [evaluation]
- Emotional alignment: [evaluation]
- Information content: [evaluation]
- Natural dialogue: [evaluation]
- Word count: [X words, target Y-Z]

[... 7 more examples ...]

## RESPONSE QUALITY EXAMPLES
[Good vs Bad examples]

## YOUR TASK
[Final instruction]
```

### 3. Quality Validation Data Model

```typescript
interface QualityMetrics {
  timestamp: Date;
  archetype: string;
  emotionalState: EmotionalState;
  isGuilty: boolean;
  suspicionLevel: number;
  response: string;
  scores: QualityScores;
  passed: boolean;
  feedback: string[];
}

interface QualityStatistics {
  totalValidations: number;
  passRate: number;
  averageScores: QualityScores;
  archetypeBreakdown: Map<string, {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  }>;
  emotionalStateBreakdown: Map<EmotionalState, {
    validations: number;
    passRate: number;
    averageScores: QualityScores;
  }>;
}
```

## Error Handling

### 1. Template Loading Errors

```typescript
class PromptTemplateError extends Error {
  constructor(
    public templatePath: string,
    public reason: string
  ) {
    super(`Failed to load prompt template: ${templatePath} - ${reason}`);
  }
}

// Fallback strategy
try {
  template = await loadPromptTemplate(languageCode);
} catch (error) {
  console.error('Failed to load template:', error);
  template = await loadPromptTemplate('en'); // Fallback to English
}
```

### 2. Archetype Data Errors

```typescript
class ArchetypeDataError extends Error {
  constructor(
    public archetypeName: string,
    public missingFields: string[]
  ) {
    super(`Invalid archetype data: ${archetypeName} - Missing: ${missingFields.join(', ')}`);
  }
}

function validateArchetypeData(data: ArchetypeData): void {
  const requiredFields = [
    'name', 'definition', 'personality', 'vocabulary',
    'speechPatterns', 'characteristicPhrases'
  ];

  const missing = requiredFields.filter(field => !data[field]);

  if (missing.length > 0) {
    throw new ArchetypeDataError(data.name.en, missing);
  }
}
```

### 3. Quality Validation Errors

```typescript
class QualityValidationError extends Error {
  constructor(
    public response: string,
    public reason: string
  ) {
    super(`Quality validation failed: ${reason}`);
  }
}

// Graceful degradation
try {
  const result = qualityValidator.validate(response, ...params);
  if (!result.passed) {
    console.warn('Quality check failed:', result.feedback);
  }
} catch (error) {
  console.error('Quality validation error:', error);
  // Continue without validation in production
}
```

## Testing Strategy

### 1. Unit Tests

```typescript
describe('FewShotExampleGenerator', () => {
  it('should generate example with correct structure', () => {
    const generator = new FewShotExampleGenerator();
    const example = generator.generateExample('Wealthy Heir', 'COOPERATIVE', false);

    expect(example).toHaveProperty('question');
    expect(example).toHaveProperty('response');
    expect(example).toHaveProperty('analysis');
    expect(example.analysis).toHaveProperty('wordCount');
  });

  it('should generate 8 examples for archetype', () => {
    const generator = new FewShotExampleGenerator();
    const examples = generator.generateAllExamples('Wealthy Heir');

    expect(examples).toHaveLength(8);
  });
});

describe('QualityValidator', () => {
  it('should score character consistency correctly', () => {
    const validator = new QualityValidator();
    const response = "I'll have my attorney review this matter.";
    const vocabulary = ['attorney', 'position', 'reputation'];

    const score = validator.scoreCharacterConsistency(
      response,
      'Wealthy Heir',
      vocabulary
    );

    expect(score).toBeGreaterThanOrEqual(60);
  });

  it('should detect wrong archetype vocabulary', () => {
    const validator = new QualityValidator();
    const response = "Sir, I must maintain discretion."; // Butler vocabulary
    const vocabulary = ['attorney', 'position']; // Wealthy Heir

    const score = validator.scoreCharacterConsistency(
      response,
      'Wealthy Heir',
      vocabulary
    );

    expect(score).toBeLessThan(60);
  });
});
```

### 2. Integration Tests

```typescript
describe('SuspectAIService with Quality Validation', () => {
  it('should validate response quality automatically', async () => {
    const service = new SuspectAIService();
    const response = await service.generateResponse({
      suspect: mockSuspect,
      question: "Where were you at 9 PM?",
      suspicionLevel: 25
    });

    expect(response).toHaveProperty('text');
    expect(response).toHaveProperty('qualityScore');
    expect(response.qualityScore.overall).toBeGreaterThanOrEqual(65);
  });
});
```

### 3. End-to-End Tests

```typescript
describe('Complete Archetype Creation Workflow', () => {
  it('should create, validate, and integrate new archetype', async () => {
    const orchestrator = new WorkflowOrchestrator();

    const result = await orchestrator.createNewArchetype('Test Archetype', false);

    expect(result.archetypePath).toBeDefined();
    expect(result.examplesGenerated).toBe(8);
    expect(result.validationResults).toHaveLength(8);
    
    const passedCount = result.validationResults.filter(r => r.passed).length;
    expect(passedCount).toBeGreaterThanOrEqual(6); // 75% pass rate
  });
});
```

### 4. Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should load archetype data within 100ms', async () => {
    const start = Date.now();
    const archetype = await loadArchetype('Wealthy Heir');
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('should validate quality within 50ms', () => {
    const validator = new QualityValidator();
    const start = Date.now();

    validator.validate(mockResponse, ...mockParams);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50);
  });

  it('should handle batch validation of 40 examples within 2s', async () => {
    const orchestrator = new WorkflowOrchestrator();
    const start = Date.now();

    await orchestrator.batchValidate();

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(2000);
  });
});
```

## Implementation Details

### 1. Few-Shot Example Generation

**COOPERATIVE - INNOCENT Example:**
```markdown
### Example 1: COOPERATIVE - INNOCENT - Alibi Question

**Detective:** "Where were you when the victim was killed?"

**Marcus Chen (Wealthy Heir):** "I was at the Metropolitan Club with the board of directors. We had a dinner meeting scheduled for 7:30 PM that ran until 11 PM. The maître d' can confirm my reservation, and I have the receipt. We were discussing quarterly earnings—it's all documented in the meeting minutes."

**[Analysis]**
- Character consistency: ✓ Uses upper-class vocabulary ("Metropolitan Club", "board of directors", "maître d'")
- Emotional alignment: ✓ COOPERATIVE tone, detailed explanation (58 words, target 40-80)
- Information content: ✓ INNOCENT behavior - specific times, verifiable details, offers evidence
- Natural dialogue: ✓ Contractions ("it's"), natural flow, confident tone
- Word count: 58 words (target: 40-80) ✓
```

**AGGRESSIVE - GUILTY Example:**
```markdown
### Example 8: AGGRESSIVE - GUILTY - Final Confrontation

**Detective:** "All evidence points to you. Why shouldn't we charge you?"

**Patricia Walsh (Business Partner):** "Charge me? With what evidence? You're grasping at straws. I want my attorney. Now."

**[Analysis]**
- Character consistency: ✓ Business vocabulary ("evidence", "attorney"), assertive tone
- Emotional alignment: ✓ AGGRESSIVE tone, minimal cooperation (16 words, target 10-30)
- Information content: ✓ GUILTY behavior - deflects, demands lawyer, no specifics
- Natural dialogue: ✓ Short sentences, rhetorical question, commanding tone
- Word count: 16 words (target: 10-30) ✓
```

### 2. Quality Validation Integration

```typescript
class SuspectAIService {
  private qualityValidator: QualityValidator;
  private qualityLogger: QualityLogger;

  async generateResponse(params: {
    suspect: Suspect;
    question: string;
    suspicionLevel: number;
    conversationHistory: Message[];
  }): Promise<{
    text: string;
    qualityScore?: QualityScores;
    qualityPassed?: boolean;
  }> {
    const response = await this.callGeminiAPI(prompt);

    // NEW: Quality validation
    if (process.env.ENABLE_QUALITY_VALIDATION === 'true') {
      const archetype = this.getArchetypeData(params.suspect.archetype);
      const emotionalState = this.getEmotionalState(params.suspicionLevel);

      const validation = this.qualityValidator.validate(
        response,
        params.suspect.archetype,
        emotionalState,
        params.suspect.isGuilty,
        params.suspicionLevel,
        archetype.vocabulary.primary
      );

      this.qualityLogger.log({
        timestamp: new Date(),
        archetype: params.suspect.archetype,
        emotionalState,
        isGuilty: params.suspect.isGuilty,
        suspicionLevel: params.suspicionLevel,
        response,
        scores: validation.scores,
        passed: validation.passed,
        feedback: validation.feedback
      });

      if (!validation.passed) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Quality check failed:', validation.feedback);
        } else {
          console.log('Quality check failed (logged)');
        }
      }

      return {
        text: response,
        qualityScore: validation.scores,
        qualityPassed: validation.passed
      };
    }

    return { text: response };
  }
}
```

### 3. Multilingual Implementation

```typescript
const WORD_COUNT_RANGES = {
  en: {
    COOPERATIVE: [40, 80],
    NERVOUS: [30, 60],
    DEFENSIVE: [15, 40],
    AGGRESSIVE: [10, 30]
  },
  ko: {
    COOPERATIVE: [30, 60],  // 75% of English
    NERVOUS: [22, 45],
    DEFENSIVE: [11, 30],
    AGGRESSIVE: [7, 22]
  }
};

function calculateWordCountRange(
  emotionalState: EmotionalState,
  languageCode: string
): [number, number] {
  return WORD_COUNT_RANGES[languageCode][emotionalState];
}

function scoreNaturalDialogueKorean(response: string): number {
  let score = 70;

  // Check for appropriate honorifics
  const hasHonorific = /습니다|세요|시|요$/.test(response);
  if (hasHonorific) {
    score += 10;
  }

  // Check for natural sentence endings
  const naturalEndings = ['요', '죠', '네요', '군요', '는데요'];
  const endingCount = naturalEndings.filter(ending =>
    response.includes(ending)
  ).length;
  score += Math.min(10, endingCount * 3);

  // Penalty for overly formal endings
  const formalEndings = ['하옵니다', '하오', '하게'];
  const formalCount = formalEndings.filter(ending =>
    response.includes(ending)
  ).length;
  score -= formalCount * 10;

  return Math.max(0, Math.min(100, score));
}
```

### 4. Workflow Orchestration

```typescript
class WorkflowOrchestrator {
  async batchValidate(): Promise<BatchValidationResult> {
    const archetypes = await this.archetypeManager.loadAllArchetypes();
    const results: QualityMetrics[] = [];

    for (const archetype of archetypes) {
      if (!archetype.fewShotExamples) {
        console.warn(`No examples found for ${archetype.name.en}`);
        continue;
      }

      for (const example of archetype.fewShotExamples) {
        const validation = this.qualityValidator.validate(
          example.response,
          archetype.name.en,
          example.emotionalState,
          example.isGuilty,
          this.getSuspicionLevel(example.emotionalState),
          archetype.vocabulary.primary
        );

        results.push({
          timestamp: new Date(),
          archetype: archetype.name.en,
          emotionalState: example.emotionalState,
          isGuilty: example.isGuilty,
          suspicionLevel: this.getSuspicionLevel(example.emotionalState),
          response: example.response,
          scores: validation.scores,
          passed: validation.passed,
          feedback: validation.feedback
        });
      }
    }

    return this.generateStatistics(results);
  }
}
```

## Conclusion

This design provides a comprehensive framework for enhancing the suspect prompt system with:

1. **Complete Few-Shot Examples**: 40 examples (5 archetypes × 8) with detailed analysis
2. **Automated Quality Validation**: Real-time 4-dimensional scoring integrated into SuspectAIService
3. **Precise Response Length Control**: Emotional state-based word count ranges with validation
4. **Enhanced Archetype Guidelines**: Characteristic phrases and vocabulary conflict detection
5. **Multilingual Support**: Korean PROMPT.md and language-specific quality criteria
6. **Integrated Workflow**: Automated scripts for efficient prompt development

The system ensures consistent, high-quality AI responses while maintaining character authenticity and emotional progression throughout player interrogations.


## Risks and Mitigations

### Risk 1: Quality Validation Performance Impact

**Risk**: Quality validation adds latency to response generation

**Mitigation**:
- Run validation asynchronously in production
- Cache validation results for similar responses
- Optimize scoring algorithms
- Make validation optional via environment variable (`ENABLE_QUALITY_VALIDATION`)

### Risk 2: Few-Shot Example Quality

**Risk**: Poorly written examples teach AI bad patterns

**Mitigation**:
- Peer review of all examples before integration
- A/B testing of example sets
- Regular review and updates based on player feedback
- All examples must pass quality validation (Overall >= 65)

### Risk 3: Multilingual Complexity

**Risk**: Different languages have different quality criteria and cultural nuances

**Mitigation**:
- Language-specific quality thresholds
- Native speaker review for Korean examples
- Gradual rollout (English first, then Korean)
- Separate quality validation per language

### Risk 4: Archetype Vocabulary Conflicts

**Risk**: Similar archetypes use overlapping vocabulary, reducing distinctiveness

**Mitigation**:
- Minimum 50% unique vocabulary requirement
- Automated conflict detection via `checkVocabularyConflict()`
- Regular archetype review
- Clear differentiation guidelines in archetype definitions

## Success Metrics

### Quantitative Metrics

1. **Quality Pass Rate**: >= 90% of responses pass validation
2. **Average Quality Score**: >= 75 overall
3. **Character Consistency**: >= 80 average
4. **Emotional Alignment**: >= 80 average
5. **Performance**: Quality validation < 50ms overhead

### Qualitative Metrics

1. **Player Feedback**: Positive sentiment about character consistency
2. **Developer Experience**: Easy to add new archetypes
3. **Maintainability**: Clear documentation and examples
4. **Extensibility**: Easy to add new languages

## Deployment Strategy

### Phase 1: Few-Shot Example Completion (Weeks 1-2)

**Tasks:**
1. Write 40 Few-Shot examples (5 archetypes × 8 examples)
2. Validate all examples with validate-quality.ts
3. Integrate examples into PROMPT.md
4. Update archetype YAML files with fewShotExamples field

**Success Criteria:**
- All 40 examples written
- All examples pass quality validation (Overall >= 65)
- PROMPT.md includes Few-Shot section
- Examples are accessible to AI during generation

### Phase 2: Quality Validation Integration (Week 3)

**Tasks:**
1. Integrate QualityValidator into SuspectAIService
2. Add quality logging system
3. Implement development/production mode handling
4. Add quality metrics dashboard (optional)

**Success Criteria:**
- Quality validation runs automatically in development
- Quality metrics are logged in production
- No performance degradation (< 50ms overhead)

### Phase 3: Multilingual Support (Week 4)

**Tasks:**
1. Create PROMPT.ko.md (Korean version)
2. Write Korean Few-Shot examples
3. Implement language-specific quality criteria
4. Add language selection to SuspectAIService

**Success Criteria:**
- Korean prompt generates natural Korean responses
- Korean quality validation works correctly
- Language switching is seamless

### Phase 4: Workflow Automation (Week 5)

**Tasks:**
1. Implement WorkflowOrchestrator
2. Add batch validation script
3. Create CI/CD integration
4. Add quality monitoring dashboard

**Success Criteria:**
- Batch validation runs successfully
- CI/CD fails on quality regression
- Quality trends are visible on dashboard

## Maintenance and Monitoring

### Weekly Tasks

**Weekly:**
- Review quality metrics dashboard
- Investigate failed validations
- Update Few-Shot examples if needed

**Monthly:**
- Analyze quality trends
- Update archetype definitions based on feedback
- Improve PROMPT.md based on data

**Quarterly:**
- Review all archetypes
- Update quality thresholds based on data
- Add new archetypes if needed

### Quality Dashboard Metrics

```typescript
interface QualityDashboard {
  // Real-time metrics
  currentPassRate: number;
  averageScores: QualityScores;

  // Trends (last 7 days)
  scoreTrend: {
    characterConsistency: number[];
    emotionalAlignment: number[];
    informationContent: number[];
    naturalDialogue: number[];
    overall: number[];
  };

  // Archetype breakdown
  archetypePerformance: Map<string, {
    passRate: number;
    averageScore: number;
  }>;

  // Alerts
  alerts: {
    type: 'quality_drop' | 'archetype_issue' | 'validation_failure';
    message: string;
    timestamp: Date;
  }[];
}
```

## Design Decisions and Rationale

### 1. Why 4-Dimensional Quality Validation?

**Decision**: Use 4 separate dimensions (Character, Emotional, Information, Natural) instead of a single score

**Rationale**:
- Provides granular feedback for improvement
- Each dimension addresses a specific quality aspect
- Allows targeted optimization
- Industry best practice (OpenAI, Anthropic use similar approaches)

### 2. Why 8 Few-Shot Examples per Archetype?

**Decision**: 8 examples (4 emotional states × 2 guilt states)

**Rationale**:
- Covers all emotional state variations
- Differentiates guilty vs innocent behavior
- Sufficient for AI pattern learning (research shows 5-10 examples optimal)
- Manageable for manual creation and review

### 3. Why YAML for Archetype Data?

**Decision**: Use YAML files instead of JSON or TypeScript

**Rationale**:
- Human-readable and easy to edit
- Supports comments for documentation
- No compilation required (hot-reload friendly)
- Industry standard for configuration (Kubernetes, Docker Compose)

### 4. Why Separate PROMPT.md per Language?

**Decision**: Create PROMPT.en.md and PROMPT.ko.md instead of single multilingual file

**Rationale**:
- Cleaner separation of concerns
- Easier to maintain and update
- Allows language-specific examples and guidance
- Prevents template bloat

### 5. Why Real-Time Quality Validation?

**Decision**: Validate responses in real-time during generation

**Rationale**:
- Immediate feedback for debugging
- Catches quality issues before they reach players
- Enables data-driven prompt improvement
- Optional (can be disabled in production for performance)

## Future Enhancements

### Phase 5: Advanced Features (Future)

1. **Dynamic Difficulty Adjustment**
   - Adjust suspect behavior based on player skill
   - Easier suspects for beginners, harder for experts

2. **Personality Drift Detection**
   - Monitor for character consistency over long conversations
   - Alert if suspect "breaks character"

3. **Adaptive Few-Shot Selection**
   - Dynamically select most relevant examples based on context
   - Improve response quality for edge cases

4. **Multi-Turn Conversation Optimization**
   - Optimize for conversation coherence across multiple turns
   - Remember and reference earlier statements

5. **Player Behavior Analysis**
   - Track which questions lead to confessions
   - Optimize suspect responses based on player patterns

## References

### Related Documents
- `skills/suspect-personality-core/PROMPT.md` - Current prompt template
- `src/server/services/prompts/archetypes/*.yaml` - Archetype data files
- `docs/PROMPT_SYSTEM_EXPLAINED.md` - Comprehensive prompt system guide
- `docs/AI_PROMPT_TEMPLATES_COMPARISON.md` - Template comparison and best practices

### External Resources
- OpenAI Prompt Engineering Guide: https://platform.openai.com/docs/guides/prompt-engineering
- Anthropic Claude Prompt Guide: https://docs.anthropic.com/claude/docs/prompt-engineering
- Few-Shot Learning Research: https://arxiv.org/abs/2005.14165

## Appendix: Scoring Algorithm Details

### Character Consistency Scoring

```typescript
function scoreCharacterConsistency(
  response: string,
  archetype: string,
  vocabulary: string[]
): number {
  let score = 70; // Base score

  // Primary vocabulary usage (+5 per match, max +30)
  const primaryMatches = vocabulary.filter(word =>
    response.toLowerCase().includes(word.toLowerCase())
  ).length;
  score += Math.min(30, primaryMatches * 5);

  // Wrong archetype vocabulary (-10 per match)
  const otherArchetypes = getAllArchetypes().filter(a => a !== archetype);
  for (const other of otherArchetypes) {
    const wrongVocab = other.vocabulary.primary.filter(word =>
      response.toLowerCase().includes(word.toLowerCase())
    ).length;
    score -= wrongVocab * 10;
  }

  return Math.max(0, Math.min(100, score));
}
```

### Emotional Alignment Scoring

```typescript
function scoreEmotionalAlignment(
  response: string,
  emotionalState: EmotionalState,
  suspicionLevel: number
): number {
  let score = 70;

  // Word count check (30 points)
  const wordCount = response.split(/\s+/).length;
  const [min, max] = WORD_COUNT_RANGES[emotionalState];

  if (wordCount >= min && wordCount <= max) {
    score += 30;
  } else {
    const deviation = Math.min(
      Math.abs(wordCount - min),
      Math.abs(wordCount - max)
    ) / max;
    score += 30 * (1 - deviation);
  }

  // Tone markers (bonus points)
  const toneMarkers = TONE_MARKERS[emotionalState];
  const markerCount = toneMarkers.filter(marker =>
    response.toLowerCase().includes(marker.toLowerCase())
  ).length;
  score += Math.min(10, markerCount * 5);

  return Math.max(0, Math.min(100, score));
}
```

### Information Content Scoring

```typescript
function scoreInformationContent(
  response: string,
  isGuilty: boolean,
  emotionalState: EmotionalState
): number {
  let score = 60;

  // Specificity markers (times, dates, amounts, names)
  const specificityMarkers = [
    /\d{1,2}:\d{2}/,     // Time (9:45)
    /\d{4}/,             // Year
    /\$[\d,]+/,          // Money
    /"[^"]+"/            // Quotes
  ];

  const specificCount = specificityMarkers.filter(pattern =>
    pattern.test(response)
  ).length;

  if (isGuilty) {
    // Guilty: should be vague
    if (specificCount > 2) {
      score -= (specificCount - 2) * 15;
    } else {
      score += 20;
    }

    // Guilty behavior markers
    const guiltyMarkers = ['think', 'maybe', 'probably', "can't recall"];
    const guiltyCount = guiltyMarkers.filter(m =>
      response.toLowerCase().includes(m)
    ).length;
    score += guiltyCount * 7;

  } else {
    // Innocent: should be specific
    score += specificCount * 10;

    // Innocent behavior markers
    const innocentMarkers = ['can provide', 'documented', 'verify', 'evidence'];
    const innocentCount = innocentMarkers.filter(m =>
      response.toLowerCase().includes(m)
    ).length;
    score += innocentCount * 5;
  }

  return Math.max(0, Math.min(100, score));
}
```

### Natural Dialogue Scoring

```typescript
function scoreNaturalDialogue(response: string): number {
  let score = 70;

  // Contractions (+5 each, max +15)
  const contractions = ["I'm", "don't", "can't", "won't", "didn't", "I'll", "it's"];
  const contractionCount = contractions.filter(c =>
    response.includes(c)
  ).length;
  score += Math.min(15, contractionCount * 5);

  // Overly formal phrases (-10 each)
  const formalPhrases = [/shall not/i, /I am not/, /it is my/i];
  const formalCount = formalPhrases.filter(p =>
    p.test(response)
  ).length;
  score -= formalCount * 10;

  // Natural idioms (+8 each, max +15)
  const idioms = ['field day', 'grasping at straws', 'cut to the chase'];
  const idiomCount = idioms.filter(i =>
    response.toLowerCase().includes(i)
  ).length;
  score += Math.min(15, idiomCount * 8);

  return Math.max(0, Math.min(100, score));
}
```

---

**Document Version**: 1.0
**Last Updated**: 2025-01-23
**Status**: Ready for Review
