---
name: ai-prompt-engineer
description: Optimize Gemini API prompts for consistent, high-quality case generation. This skill should be used when improving case generation quality, fixing inconsistent outputs, reducing hallucinations, or implementing chain-of-thought reasoning for mystery cases.
---

# AI Prompt Engineering Specialist

## Overview

This skill specializes in optimizing Gemini 1.5 Pro prompts for Armchair Sleuths murder mystery case generation. It ensures consistent case quality, reduces AI hallucinations, and implements advanced prompting techniques like few-shot learning and chain-of-thought reasoning.

## When to Use This Skill

**Use this skill PROACTIVELY when:**
- 케이스 생성 품질 개선: "케이스 품질을 높여줘" / "Improve case generation quality"
- 일관성 없는 출력: "케이스 난이도가 들쭉날쭉해" / "Case difficulty is inconsistent"
- Hallucination 문제: "AI가 이상한 답변 생성" / "AI generating weird responses"
- 프롬프트 최적화: "Gemini 프롬프트 개선" / "Optimize Gemini prompts"
- 새로운 케이스 타입: "로맨스 미스터리 추가" / "Add romance mystery type"

## Core Principles

### 1. Few-Shot Learning

Use concrete examples to guide Gemini toward desired output structure:

```typescript
const CASE_EXAMPLES = {
  easy: {
    victim: {
      name: "박민준",
      background: "성공한 IT 기업 대표, 45세",
      relationship: "직원들에게 존경받음"
    },
    clues: [
      "피해자 책상 위에 '복수'라고 적힌 메모",
      "CCTV에 10시 47분 용의자 A 출입 기록",
      "피해자 손에 묻은 붉은 페인트"
    ],
    obviousClueRatio: 0.7, // 70% obvious clues
    difficulty: "easy"
  },
  hard: {
    victim: {
      name: "이서연",
      background: "미술관 큐레이터, 32세, 복잡한 인간관계",
      relationship: "동료들과 미묘한 갈등"
    },
    clues: [
      "피해자 일기장에 암호화된 메시지",
      "범행 시각 전후 3명의 용의자 알리바이 존재",
      "독약 성분이 피해자가 즐겨 먹던 차와 유사"
    ],
    obviousClueRatio: 0.3, // 30% obvious clues
    difficulty: "hard"
  }
};
```

### 2. Chain-of-Thought Prompting

Guide Gemini through logical reasoning steps:

```typescript
const CASE_GENERATION_PROMPT = `
You are a master mystery writer creating a fair-play murder mystery.

**Step 1: Define the Crime**
- Who is the victim? (Background, personality, relationships)
- What is the murder weapon? (Must be logical and leave evidence)
- Where did the murder occur? (Location creates constraints)

**Step 2: Create the Guilty Suspect**
- Name and archetype (scorned lover, greedy heir, etc.)
- Clear motive that connects to victim
- Opportunity to commit the crime
- Evidence trail that can be discovered

**Step 3: Create 2 Innocent Suspects**
- Each has plausible motive but alibi or lack of opportunity
- Create red herrings that seem suspicious but are false

**Step 4: Plant Fair-Play Clues**
- All essential clues must be accessible to the player
- Clues should follow logical causation
- Difficulty: {difficulty}
  - Easy: 70% obvious clues, 20% red herrings
  - Medium: 50% obvious, 30% red herrings
  - Hard: 30% obvious, 40% red herrings

**Step 5: Create 5W1H Solution**
- Who: Full name of guilty suspect
- What: Exact murder method
- Where: Specific location details
- When: Time window of the crime
- Why: Deep motive explanation
- How: Step-by-step execution method

Think through each step carefully before generating the case.
`;
```

### 3. Output Validation

Ensure consistent output structure:

```typescript
interface CaseValidationRules {
  requiredFields: string[];
  minClues: number;
  maxClues: number;
  suspectCount: 3;
  guiltySuspectCount: 1;
  w5h1Required: ['who', 'what', 'where', 'when', 'why', 'how'];
}

async function validateCaseOutput(caseData: any): Promise<ValidationResult> {
  const errors: string[] = [];

  // Validate suspect count
  if (caseData.suspects.length !== 3) {
    errors.push(`Expected 3 suspects, got ${caseData.suspects.length}`);
  }

  // Validate guilty suspect
  const guiltySuspects = caseData.suspects.filter(s => s.isGuilty);
  if (guiltySuspects.length !== 1) {
    errors.push(`Expected 1 guilty suspect, got ${guiltySuspects.length}`);
  }

  // Validate 5W1H completeness
  const w5h1 = caseData.solution;
  const required = ['who', 'what', 'where', 'when', 'why', 'how'];
  for (const field of required) {
    if (!w5h1[field] || w5h1[field].length < 10) {
      errors.push(`5W1H field '${field}' is missing or too short`);
    }
  }

  // Validate clue count based on difficulty
  const clueCount = caseData.clues?.length || 0;
  if (caseData.difficulty === 'easy' && clueCount < 5) {
    errors.push('Easy cases need at least 5 clues');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 4. Hallucination Prevention

Strategies to reduce AI hallucinations:

```typescript
const ANTI_HALLUCINATION_TECHNIQUES = {
  // 1. Explicit constraints
  constraints: `
    - Use only Korean names (성+이름 format)
    - Weapon must be realistic (no sci-fi weapons)
    - Location must be public or semi-public (no fantasy locations)
    - All suspects must have Korean backgrounds
  `,

  // 2. Grounding with case element library
  groundingPrompt: `
    Select from these pre-approved weapons:
    ${WEAPON_LIBRARY.map(w => `- ${w.name}: ${w.description}`).join('\n')}

    Select from these pre-approved locations:
    ${LOCATION_LIBRARY.map(l => `- ${l.name}: ${l.atmosphere}`).join('\n')}
  `,

  // 3. Repetition penalty
  repetitionCheck: `
    Ensure variety:
    - Do NOT reuse victim names from previous cases
    - Do NOT reuse exact motive descriptions
    - Create unique suspect personalities
  `,

  // 4. Fact-checking
  factCheck: `
    Verify scientific accuracy:
    - Poison effects should be medically plausible
    - Time of death should align with evidence
    - Alibis should be logically verifiable
  `
};
```

## Advanced Patterns

### Pattern 1: Difficulty-Adaptive Prompting

```typescript
function getDifficultyPrompt(difficulty: 'easy' | 'medium' | 'hard'): string {
  const difficultyConfig = {
    easy: {
      clueObviousness: '70% of clues directly point to guilty suspect',
      redHerringRatio: '20% red herrings that are easily eliminated',
      motiveClarity: 'Motive should be clear and straightforward',
      suspectDistinction: 'Guilty suspect should stand out with clear evidence'
    },
    medium: {
      clueObviousness: '50% of clues require basic deduction',
      redHerringRatio: '30% red herrings that seem plausible',
      motiveClarity: 'Motive requires some interpretation',
      suspectDistinction: 'All 3 suspects should seem equally suspicious initially'
    },
    hard: {
      clueObviousness: '30% of clues are subtle and require careful analysis',
      redHerringRatio: '40% red herrings that strongly mislead',
      motiveClarity: 'Motive is hidden and requires deep analysis',
      suspectDistinction: 'Innocent suspects have stronger apparent motives than guilty'
    }
  };

  const config = difficultyConfig[difficulty];

  return `
    Difficulty Level: ${difficulty.toUpperCase()}

    Clue Distribution:
    - ${config.clueObviousness}
    - ${config.redHerringRatio}

    Narrative Complexity:
    - ${config.motiveClarity}
    - ${config.suspectDistinction}
  `;
}
```

### Pattern 2: Iterative Refinement

```typescript
async function generateCaseWithRefinement(
  theme: string,
  difficulty: string
): Promise<CaseData> {
  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    const caseData = await generateCase(theme, difficulty);
    const validation = await validateCaseOutput(caseData);

    if (validation.isValid) {
      return caseData;
    }

    // Refine prompt based on validation errors
    const refinementPrompt = `
      Previous attempt had these issues:
      ${validation.errors.join('\n')}

      Please regenerate the case fixing these specific problems.
    `;

    attempt++;
  }

  throw new Error('Failed to generate valid case after 3 attempts');
}
```

### Pattern 3: Prompt Template Library

```typescript
const PROMPT_TEMPLATES = {
  // Base case generation
  caseGeneration: (params: CaseParams) => `
    Generate a murder mystery case with these parameters:

    Theme: ${params.theme}
    Difficulty: ${params.difficulty}
    Weapon: ${params.weapon}
    Location: ${params.location}

    ${getDifficultyPrompt(params.difficulty)}
    ${ANTI_HALLUCINATION_TECHNIQUES.constraints}
    ${CASE_GENERATION_PROMPT}
  `,

  // Suspect personality generation
  suspectPersonality: (suspect: Suspect) => `
    Create a unique personality for this suspect:

    Name: ${suspect.name}
    Archetype: ${suspect.archetype}
    Motive: ${suspect.motive}

    Generate:
    1. 3-4 unique personality traits
    2. Speech patterns (formal, casual, nervous, etc.)
    3. Emotional state during interrogation
    4. Background that justifies personality

    Make the personality distinct from these other suspects:
    ${OTHER_SUSPECTS.map(s => `- ${s.name}: ${s.personality}`).join('\n')}
  `,

  // Clue generation
  clueGeneration: (params: ClueParams) => `
    Generate clues for this mystery:

    Crime: ${params.crime}
    Guilty Suspect: ${params.guiltySuspect}
    Difficulty: ${params.difficulty}

    Create ${params.clueCount} clues that:
    1. Follow fair-play mystery rules
    2. Are logically connected to the crime
    3. Match the difficulty level
    4. Include both obvious and subtle clues

    For each clue, specify:
    - Description: What the player finds
    - Importance: Critical / Supporting / Red Herring
    - Discovery Method: How the player accesses it
  `
};
```

## Integration with Project

### Update CaseGeneratorService.ts

```typescript
// src/server/services/case/CaseGeneratorService.ts

import { PROMPT_TEMPLATES } from '@/skills/ai-prompt-engineer';

export class CaseGeneratorService {
  async generateCase(difficulty: 'easy' | 'medium' | 'hard'): Promise<CaseData> {
    // Select elements from library
    const weapon = selectWeapon();
    const location = selectLocation();
    const theme = selectTheme();

    // Use optimized prompt template
    const prompt = PROMPT_TEMPLATES.caseGeneration({
      theme,
      difficulty,
      weapon: weapon.name,
      location: location.name
    });

    // Generate with Gemini
    const response = await this.geminiClient.generateContent(prompt);
    const caseData = JSON.parse(response.text);

    // Validate output
    const validation = await validateCaseOutput(caseData);
    if (!validation.isValid) {
      throw new Error(`Case validation failed: ${validation.errors.join(', ')}`);
    }

    return caseData;
  }
}
```

### Add Validation Script

```bash
# scripts/validate-prompt-quality.ts
```

Run validation on generated cases:

```bash
npx tsx scripts/validate-prompt-quality.ts --case-id case-2025-01-19
```

## Quick Start

### 1. Test Current Prompt Quality

```bash
npx tsx scripts/generate-case.ts --difficulty easy --validate
```

### 2. Compare Prompt Versions

```bash
# Generate with old prompt
npx tsx scripts/generate-case.ts --prompt-version old --output old-case.json

# Generate with optimized prompt
npx tsx scripts/generate-case.ts --prompt-version new --output new-case.json

# Compare quality
npx tsx scripts/compare-prompts.ts old-case.json new-case.json
```

### 3. Batch Quality Testing

```bash
# Generate 10 cases and analyze quality consistency
npx tsx scripts/batch-test-prompts.ts --count 10 --difficulty medium
```

## Quality Metrics

Track these metrics to measure prompt effectiveness:

```typescript
interface PromptQualityMetrics {
  // Consistency
  difficultyConsistency: number; // 0-1, how often difficulty matches intent
  outputFormatConsistency: number; // 0-1, valid JSON output rate

  // Correctness
  validationPassRate: number; // 0-1, cases passing validation
  hallucinationRate: number; // 0-1, factually incorrect outputs

  // Quality
  averageClueQuality: number; // 0-10, manual rating
  plotCoherence: number; // 0-10, story makes sense
  suspectDistinction: number; // 0-10, suspects feel unique

  // Performance
  averageGenerationTime: number; // milliseconds
  retryRate: number; // 0-1, how often regeneration needed
}
```

## Troubleshooting

### Issue: Inconsistent Difficulty

**Problem:** Cases marked "easy" are actually hard

**Solution:**
```typescript
// Add explicit difficulty examples to prompt
const DIFFICULTY_EXAMPLES = {
  easy: "피해자 주머니에서 용의자 A의 명함 발견",
  hard: "피해자 일기의 암호화된 메시지가 용의자 A의 생일을 가리킴"
};
```

### Issue: Hallucinated Facts

**Problem:** AI invents unrealistic weapons or locations

**Solution:**
```typescript
// Ground with explicit library
const prompt = `
  You MUST select from this weapon list only:
  ${WEAPON_LIBRARY.map(w => w.name).join(', ')}

  You MUST NOT invent new weapons.
`;
```

### Issue: Repetitive Cases

**Problem:** Similar plots and characters

**Solution:**
```typescript
// Add variety enforcement
const recentCases = await getRecentCases(5);
const usedNames = recentCases.flatMap(c => [c.victim.name, ...c.suspects.map(s => s.name)]);

const prompt = `
  Do NOT use these names (already used recently):
  ${usedNames.join(', ')}

  Create completely new and unique characters.
`;
```

## References

See the references directory for:

- **prompt-templates.md**: Complete prompt template library
- **few-shot-examples.md**: Example cases for different difficulties
- **validation-rules.md**: Complete validation criteria
- **gemini-api-guide.md**: Gemini 1.5 Pro specific optimizations
- **quality-metrics.md**: How to measure and track prompt quality
- **troubleshooting-guide.md**: Common issues and solutions

## Skill Dependencies

- **mystery-case-generator**: Uses these optimized prompts
- **suspect-ai-prompter**: Similar prompting techniques for suspect dialogue

## Best Practices

1. **Always validate output** - Never skip validation step
2. **Use few-shot learning** - Provide 2-3 examples per difficulty
3. **Be explicit** - Vague prompts = inconsistent results
4. **Test iteratively** - Generate 10 cases, measure quality, refine
5. **Ground with libraries** - Use CaseElementLibrary to prevent hallucinations
6. **Track metrics** - Monitor quality over time
