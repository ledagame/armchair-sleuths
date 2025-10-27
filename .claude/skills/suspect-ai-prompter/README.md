# Suspect AI Prompter - Professional Prompt Engineering Skill

**Version**: 2.2.0
**Type**: Meta-Skill (Prompt Engineering Tool)
**Purpose**: Create and improve suspect character prompts for murder mystery games

**Latest Update**: Quality Validation, Multilingual Support, and Workflow Orchestration (Tasks 1-7 Complete)

---

## Overview

The Suspect AI Prompter is a specialized Claude skill that enables prompt engineering for suspect character AI systems. It provides tools, references, and workflows for creating believable, consistent suspect characters with realistic interrogation behavior across emotional states.

### What Makes This a Meta-Skill?

Unlike typical skills that help with application development, this is a **meta-skill** - a skill for creating and improving AI prompts themselves. Think of it as "a skill that makes skills better."

**Key Capabilities**:
- 🎭 Generate new character archetypes with personality, vocabulary, and speech patterns
- 📊 Validate prompt quality across 4 dimensions (character, emotion, content, naturalness)
- 💬 Create few-shot dialogue examples for training AI models
- 🔧 Analyze and improve existing prompts with actionable recommendations
- ✅ Real-time quality validation integrated into suspect response generation
- 🌍 Multilingual support (English and Korean) with language-specific quality criteria
- 🔄 Automated workflow orchestration for archetype creation and validation
- 📈 Performance optimization with caching and async validation

---

## Quick Start

### 1. Activate the Skill

In Claude Code, invoke the skill:

```bash
/skill suspect-ai-prompter
```

This loads the PROMPT.md and activates Claude's prompt engineering expertise.

### 2. Use Automation Scripts

Run npm scripts for common tasks:

```bash
# Generate a new archetype
npm run suspect:add-archetype

# Analyze PROMPT.md for improvements
npm run suspect:improve-prompt

# Create few-shot dialogue examples
npm run suspect:generate-examples

# Validate a suspect response
npm run suspect:validate

# NEW: Workflow orchestration
npm run suspect:workflow:new-archetype      # Complete archetype creation workflow
npm run suspect:workflow:batch-validate     # Validate all examples
npm run suspect:workflow:improve-prompt     # Analyze and improve prompts
```

### 3. Ask for Help

Once the skill is active, you can ask Claude:

- "Create a new archetype for a suspicious lawyer"
- "Analyze the suspect-personality-core PROMPT.md"
- "Generate examples for the Wealthy Heir in DEFENSIVE state"
- "Validate this suspect response: [paste response]"

---

## File Structure

```
skills/suspect-ai-prompter/
├── SKILL.yaml                      # Skill metadata and configuration
├── PROMPT.md                       # Meta-skill system prompt
├── README.md                       # This file
├── FEW_SHOT_WRITING_GUIDE.md      # Guide for writing 40 examples
├── scripts/                        # Automation tools
│   ├── types.ts                   # TypeScript type definitions
│   ├── FewShotExampleGenerator.ts # Few-shot example generator class
│   ├── generate-archetype.ts      # Interactive archetype creator
│   ├── improve-prompt.ts          # PROMPT.md analyzer
│   ├── generate-examples.ts       # Few-shot example generator (updated)
│   └── validate-quality.ts        # Response quality scorer
└── references/                     # Domain knowledge base
    ├── archetypes/                # Character archetype definitions
    │   ├── wealthy-heir.md
    │   ├── loyal-butler.md
    │   ├── talented-artist.md
    │   ├── business-partner.md
    │   └── former-police-officer.md
    ├── emotional-system.md        # 4-tier emotional state system
    ├── quality-criteria.md        # Quality scoring framework
    └── prompt-engineering-guide.md # Quick reference guide
```

---

## Core Concepts

### The Suspect Response Formula

```
Quality = Character Consistency × Emotional Alignment × Information Content × Natural Dialogue
```

Every suspect response must pass 4 quality dimensions:

| Dimension | Threshold | What It Measures |
|-----------|-----------|------------------|
| **Character Consistency** | ≥ 60 | Matches archetype personality and vocabulary |
| **Emotional Alignment** | ≥ 60 | Tone matches suspicion level (0-100) |
| **Information Content** | ≥ 50 | Appropriate amount for guilt status |
| **Natural Dialogue** | ≥ 60 | Sounds like real human conversation |

**Overall Score** must be ≥ 65 to pass.

### 5 Archetypes

1. **Wealthy Heir**: Privileged, entitled, dismissive - threatens with connections and lawyers
2. **Loyal Butler**: Discreet, formal, conflicted - torn between duty and truth
3. **Talented Artist**: Emotional, passionate, dramatic - prone to artistic expression
4. **Business Partner**: Calculating, transactional - focuses on legal protections
5. **Former Police Officer**: Analytical, procedural - critiques investigation methods

### 4 Emotional States

| State | Suspicion | Length | Cooperation |
|-------|-----------|--------|-------------|
| COOPERATIVE | 0-25 | 40-80 words | High |
| NERVOUS | 26-50 | 30-60 words | Medium |
| DEFENSIVE | 51-75 | 15-40 words | Low |
| AGGRESSIVE | 76-100 | 10-30 words | Minimal |

### Guilty vs. Innocent Behavior

**Innocent suspects**:
- Provide specific, verifiable details
- Express genuine confusion/frustration
- Offer evidence freely

**Guilty suspects**:
- Vague about specifics ("I think", "maybe")
- Strategic information disclosure
- Deflect or invoke legal protections

---

## New Features (v2.2.0)

### Quality Validation System

실시간 품질 검증 시스템이 SuspectAIService에 통합되었습니다.

**주요 기능**:
- ✅ 4차원 자동 품질 평가 (Character, Emotional, Information, Natural)
- ✅ 개발 환경에서 상세 피드백 제공
- ✅ 프로덕션 환경에서 자동 로깅
- ✅ 품질 메트릭 추적 및 분석
- ✅ 50ms 이하의 낮은 오버헤드

**사용 방법**:
```typescript
// 환경 변수로 활성화
ENABLE_QUALITY_VALIDATION=true

// SuspectAIService에서 자동으로 실행됨
const response = await suspectAIService.generateResponse({
  suspect,
  question,
  suspicionLevel,
  conversationHistory
});

// 응답에 품질 점수 포함
console.log(response.qualityScore); // { character: 85, emotional: 90, ... }
console.log(response.qualityPassed); // true/false
```

**품질 기준**:
- Character Consistency: ≥ 60
- Emotional Alignment: ≥ 60
- Information Content: ≥ 50
- Natural Dialogue: ≥ 60
- Overall Score: ≥ 65

### Multilingual Support

영어와 한국어를 지원하며, 언어별 최적화된 품질 기준을 적용합니다.

**주요 기능**:
- 🌍 언어별 PROMPT 템플릿 (PROMPT.en.md, PROMPT.ko.md)
- 🌍 언어별 단어 수 범위 (한국어는 영어의 75%)
- 🌍 언어별 품질 검증 기준
- 🌍 언어별 Few-Shot 예시

**단어 수 범위**:
| Emotional State | English | Korean |
|----------------|---------|--------|
| COOPERATIVE | 40-80 | 30-60 |
| NERVOUS | 30-60 | 22-45 |
| DEFENSIVE | 15-40 | 11-30 |
| AGGRESSIVE | 10-30 | 7-22 |

**사용 방법**:
```typescript
// 언어 선택
const response = await suspectAIService.generateResponse({
  suspect,
  question,
  suspicionLevel,
  conversationHistory,
  language: 'ko' // 'en' or 'ko'
});
```

**새로운 언어 추가**:
자세한 가이드는 [TRANSLATION_GUIDE.md](./TRANSLATION_GUIDE.md)를 참조하세요.

### Workflow Orchestration

아키타입 생성부터 검증까지 자동화된 워크플로우를 제공합니다.

**주요 기능**:
- 🔄 새 아키타입 생성 워크플로우 (generate → examples → validate)
- 🔄 배치 검증 워크플로우 (모든 예시 자동 검증)
- 🔄 프롬프트 개선 워크플로우 (분석 → 제안 → 영향 추정)
- 🔄 CI/CD 통합 (품질 기준 미달 시 빌드 실패)

**사용 방법**:
```bash
# 새 아키타입 생성 (전체 워크플로우)
npm run suspect:workflow:new-archetype

# 모든 예시 배치 검증
npm run suspect:workflow:batch-validate

# 프롬프트 개선 분석
npm run suspect:workflow:improve-prompt
```

**배치 검증 결과**:
```typescript
{
  totalExamples: 40,
  passedExamples: 38,
  failedExamples: 2,
  archetypeStats: {
    "Wealthy Heir": { averageScore: 82, passRate: 100% },
    "Loyal Butler": { averageScore: 78, passRate: 87.5% },
    // ...
  }
}
```

### Performance Optimization

성능 최적화로 빠르고 효율적인 실행을 보장합니다.

**주요 개선사항**:
- ⚡ 아키타입 데이터 캐싱 (< 100ms 로딩)
- ⚡ 품질 검증 비동기 실행 (< 50ms 오버헤드)
- ⚡ 유사 응답 캐싱
- ⚡ 배치 검증 최적화 (40개 예시 < 2초)

---

## Capabilities

### 1. PROMPT.md Analysis & Improvement

Analyzes existing prompts for:
- ✅ Archetype definitions
- ✅ Emotional state coverage
- ✅ Few-shot examples (need 8 minimum)
- ✅ Word count guidance
- ✅ Guilty/innocent differentiation
- ✅ Template variables
- ✅ Quality criteria

**Usage**:
```bash
npm run suspect:improve-prompt
```

Or ask Claude:
```
"Analyze suspect-personality-core PROMPT.md and suggest improvements"
```

**Output**: Prioritized list of improvements with impact estimates.

### 2. Archetype Generation

Creates new archetype files with:
- Core character profile
- Speech patterns by emotional state
- Vocabulary lists
- Few-shot example templates

**Usage**:
```bash
npm run suspect:add-archetype
```

Or ask Claude:
```
"Create YAML archetype for 'Suspicious Lawyer' based on references"
```

**Output**: Complete markdown file ready for customization.

### 3. Few-Shot Example Creation

Generates dialogue examples covering:
- All 4 emotional states
- Both guilty and innocent variations
- Proper word counts
- Analysis templates

**Usage**:
```bash
npm run suspect:generate-examples
```

Or ask Claude:
```
"Generate 4 examples for Wealthy Heir in DEFENSIVE state"
```

**Output**: Formatted markdown with analysis placeholders.

### 4. Quality Validation

Scores responses across 4 dimensions:
- Character consistency
- Emotional alignment
- Information content
- Natural dialogue

**Usage**:
```bash
npm run suspect:validate
```

Or ask Claude:
```
"Validate this response: [paste text]"
```

**Output**: Pass/fail result with specific feedback.

---

## Usage Examples

### Example 1: Creating a New Archetype

```
User: Create a new archetype for a "Paranoid Hacker" character

Claude: I'll create a Paranoid Hacker archetype. Let me gather the key details:

Core Traits:
- Tech-savvy and secretive
- Distrusts authority and surveillance
- Speaks in tech jargon
- Paranoid about being tracked

[Generates complete archetype file with speech patterns and examples]

The new archetype has been saved to:
references/archetypes/paranoid-hacker.md

Next steps:
1. Review and customize the speech patterns
2. Add 8 few-shot dialogue examples
3. Test with validate-quality.ts
```

### Example 2: Improving Existing Prompt

```
User: Analyze suspect-personality-core PROMPT.md

Claude: Analyzing PROMPT.md...

✅ STRENGTHS
  • Contains archetype definitions
  • Includes all 4 emotional states

🔧 HIGH PRIORITY IMPROVEMENTS
  1. Only 3 few-shot examples (need at least 8)
     Solution: Add examples covering all states × guilty/innocent
     Impact: Critical for teaching proper response patterns

  2. No word count targets specified
     Solution: Add ranges by emotional state
     Impact: Ensures appropriate response length

📊 ESTIMATED IMPACT
  Character Consistency: +25-35%
  Emotional Alignment: +30-40%
  Overall Quality: +25-35%
```

### Example 3: Generating Examples

```
User: Generate 2 DEFENSIVE examples for Business Partner (1 guilty, 1 innocent)

Claude: Generating examples for Business Partner in DEFENSIVE state...

### Example 1: DEFENSIVE - INNOCENT

**Detective:** "Explain the $500K withdrawal."

**Richard Chen (Business Partner):** "That was the Henderson acquisition—completely documented. I can provide the purchase agreement, wire transfer records, and escrow docs. It was legitimate business. This looks suspicious only if you ignore the paper trail."

**[Analysis]**
- Character: Business vocabulary ("acquisition", "documented")
- Emotion: DEFENSIVE - frustrated but provides facts (35 words)
- Innocent: Specific transaction name, offers documentation
- Natural: "paper trail" idiom, assertive tone

### Example 2: DEFENSIVE - GUILTY

**Detective:** "Explain the $500K withdrawal."

**Patricia Walsh (Business Partner):** "That was a business expense. I'd need to review our financial records for specifics. Large transactions are routine in our work. Perhaps I should consult with our accountant before providing incomplete information?"

**[Analysis]**
- Character: Business vocabulary but vague ("expense", "routine")
- Emotion: DEFENSIVE - deflects to others (38 words)
- Guilty: No specifics, defers to accountant, buys time
- Natural: "incomplete information" hedge, question deflection
```

### Example 4: Validating Quality

```
User: Validate this response:
"I was at home watching TV. I don't really remember what time. Maybe around 9? I'm not sure. I live alone so nobody can verify."

Claude: Analyzing response quality...

📊 SCORES
  Character Consistency: 45/100
  Emotional Alignment: 35/100
  Information Content: 70/100 (appropriate for guilty)
  Natural Dialogue: 55/100

  Overall: 51/100 (Poor)

❌ RESULT: FAIL

📝 FEEDBACK
  ❌ Character Consistency (45) - No archetype-specific vocabulary
  ❌ Emotional Alignment (35) - No emotional state markers
  ✓ Information Content (70) - Appropriately vague for guilty suspect
  ❌ Natural Dialogue (55) - Too many hedges, lacks contractions

💡 RECOMMENDATIONS
  1. Add archetype-specific vocabulary
  2. Specify emotional state and match tone
  3. Use more natural contractions ("I'm", "don't")
  4. Filter vagueness through character personality
```

---

## Development Workflow

### Creating a New Archetype

1. **Brainstorm Character**:
   - Define core personality traits
   - Identify key vocabulary
   - Determine background and fears

2. **Generate Structure**:
   ```bash
   npm run suspect:add-archetype
   ```
   Follow interactive prompts.

3. **Add Examples**:
   ```bash
   npm run suspect:generate-examples
   ```
   Create 8 dialogue examples.

4. **Validate Quality**:
   ```bash
   npm run suspect:validate
   ```
   Test examples meet quality thresholds.

5. **Integrate**:
   - Copy to suspect-personality-core/archetypes/
   - Update archetype loader code
   - Test in application

### Improving an Existing Prompt

1. **Analyze Current State**:
   ```bash
   npm run suspect:improve-prompt path/to/PROMPT.md
   ```

2. **Address High Priority Items**:
   - Review feedback
   - Make changes to PROMPT.md
   - Add missing elements

3. **Revalidate**:
   ```bash
   npm run suspect:improve-prompt path/to/PROMPT.md
   ```
   Confirm improvements.

4. **Test in Application**:
   - Generate suspect responses
   - Validate with quality checker
   - Iterate as needed

---

## Integration Guide

### For TypeScript/JavaScript Applications

#### Load Archetype Data

```typescript
import fs from 'fs';
import yaml from 'yaml';

interface Archetype {
  name: string;
  definition: string;
  personality: string[];
  vocabulary: {
    primary: string[];
    secondary: string[];
  };
  speechPatterns: Record<EmotionalState, SpeechPattern>;
}

function loadArchetype(name: string): Archetype {
  const filePath = `./archetypes/${name}.yaml`;
  const content = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(content);
}
```

#### Build Suspect Prompt

```typescript
function buildSuspectPrompt(params: {
  suspect: Suspect;
  archetype: Archetype;
  conversationHistory: Message[];
  currentQuestion: string;
  suspicionLevel: number;
  isGuilty: boolean;
}): string {
  const emotionalState = getEmotionalState(params.suspicionLevel);
  const [minWords, maxWords] = calculateWordCountRange(emotionalState);

  return `
# Character: ${params.suspect.name}

## Archetype
${params.archetype.definition}

## Current Emotional State
State: ${emotionalState}
Suspicion Level: ${params.suspicionLevel}/100
Response Length: ${minWords}-${maxWords} words

## Guilt Status
${params.isGuilty ? 'GUILTY' : 'INNOCENT'}

## Conversation History
${formatHistory(params.conversationHistory)}

## Current Question
Detective: "${params.currentQuestion}"

## Instructions
Respond as ${params.suspect.name} in the ${emotionalState} state.
${params.suspect.name}:`;
}
```

#### Validate Response

```typescript
import { validateResponse } from './scripts/validate-quality';

const result = validateResponse(
  suspectResponse,
  archetype,
  emotionalState,
  isGuilty,
  suspicionLevel,
  vocabulary
);

if (!result.passed) {
  console.warn('Quality check failed:', result.feedback);
}
```

### For Claude API

```typescript
import Anthropic from '@anthropic-ai/sdk';

async function getSuspectResponse(
  prompt: string
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 300,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  return message.content[0].text;
}
```

---

## Troubleshooting

### Problem: Character responses don't match archetype

**Symptoms**: Wealthy Heir sounds like Loyal Butler, vocabulary mixing

**Diagnosis**:
```bash
npm run suspect:validate
```

**Solution**:
- Review archetype vocabulary list
- Add more archetype-specific few-shot examples
- Check for conflicting vocabulary in prompt

### Problem: Emotional states not transitioning properly

**Symptoms**: Instant jumps from COOPERATIVE to AGGRESSIVE

**Diagnosis**: Check suspicion level calculation

**Solution**:
- Implement transition delay (1-3 questions)
- Review emotional progression notes in archetype
- Test with gradual suspicion increases

### Problem: Guilty suspects too specific, innocent too vague

**Symptoms**: Quality validation shows wrong information content

**Diagnosis**:
```bash
npm run suspect:validate
```

**Solution**:
- Review "Guilty vs. Innocent Behavior Differences" in archetype
- Add more examples showing proper information disclosure
- Clarify IS_GUILTY flag in prompt

### Problem: Responses sound unnatural or stilted

**Symptoms**: Low "Natural Dialogue" scores

**Diagnosis**: Check for overly formal language

**Solution**:
- Use more contractions ("I'm" not "I am")
- Add natural idioms and colloquialisms
- Remove formal phrasing ("shall not", "one must")
- Review few-shot examples for natural speech

---

## Best Practices

### Do's ✅

- **Start with clear character foundation**: Define archetype, background, guilt status
- **Use few-shot examples**: 8 minimum, covering all states and guilt variations
- **Maintain conversation history**: Track suspicion level and previous responses
- **Apply emotional progression naturally**: Gradual transitions with 1-3 question delay
- **Differentiate guilty vs innocent clearly**: Specific vs vague, helpful vs evasive
- **Validate frequently**: Use quality checker during development

### Don'ts ❌

- **Don't mix archetype vocabularies**: Wealthy Heir shouldn't sound like Loyal Butler
- **Don't jump emotional states**: No instant COOPERATIVE → AGGRESSIVE
- **Don't ignore word counts**: Respect limits by emotional state
- **Don't use overly formal English**: "shall not" → "won't", "I am" → "I'm"
- **Don't make guilty suspects generically evasive**: Filter through archetype personality
- **Don't skip quality validation**: Always check before integration

---

## Contributing

### Adding a New Archetype

1. Fork the repository
2. Run `npm run suspect:add-archetype`
3. Fill in character details
4. Add 8 few-shot examples
5. Validate with `npm run suspect:validate`
6. Submit pull request with:
   - Archetype markdown file
   - Examples and analysis
   - Test results

### Improving Existing Archetypes

1. Identify improvement opportunity
2. Reference `prompt-engineering-guide.md`
3. Make changes
4. Validate with quality checker
5. Submit PR with before/after scores

### Reporting Issues

Include:
- What you were trying to do
- What went wrong
- Steps to reproduce
- Quality scores if available

---

## Resources

### Reference Files

- **Archetypes**: `references/archetypes/[name].md` - Complete character definitions
- **Emotional System**: `references/emotional-system.md` - 4-tier state model
- **Quality Criteria**: `references/quality-criteria.md` - Scoring framework
- **Engineering Guide**: `references/prompt-engineering-guide.md` - Quick reference

### Scripts

- `scripts/generate-archetype.ts` - Interactive archetype creator
- `scripts/improve-prompt.ts` - PROMPT.md analyzer
- `scripts/generate-examples.ts` - Example generator
- `scripts/validate-quality.ts` - Quality validator

### Related Skills

- **suspect-personality-core**: Runtime data (product of this meta-skill)
- **suspect-portrait-prompter**: Image generation for suspect portraits
- **scene-atmosphere-prompter**: Scene and evidence image generation

---

## Version History

### v2.2.0 (2025-01-24)

**Quality Validation, Multilingual Support, and Workflow Orchestration (Tasks 1-7 Complete)**

#### Task 1: Few-Shot Example System ✅
- ✨ Added TypeScript type definitions (`types.ts`)
- ✨ Implemented `FewShotExampleGenerator` class
- ✨ Updated `generate-examples.ts` script
- ✨ Integrated Few-Shot examples into PROMPT.md
- ✨ Updated all 5 archetype YAML files with example templates
- 📝 Created `FEW_SHOT_WRITING_GUIDE.md`

#### Task 2: Quality Validation System ✅
- ✨ Created `QualityValidator` class with 4-dimensional scoring
  - `scoreCharacterConsistency()` - Archetype vocabulary validation
  - `scoreEmotionalAlignment()` - Word count and tone validation
  - `scoreInformationContent()` - Guilty/innocent pattern detection
  - `scoreNaturalDialogue()` - Natural language validation
- ✨ Integrated into `SuspectAIService` with environment variable control
- ✨ Implemented `QualityLogger` for metrics tracking
- ✨ Development vs production mode handling

#### Task 3: Response Length Control ✅
- ✨ Defined word count ranges by emotional state and language
- ✨ Implemented word count validation in quality scoring
- ✨ Integrated into Emotional Alignment scoring

#### Task 5: Multilingual Support ✅
- ✨ Created language configuration system (English and Korean)
- ✨ Language-specific word count ranges (Korean: 75% of English)
- ✨ Added language parameter to `SuspectAIService.generateResponse()`
- 📝 Created `TRANSLATION_GUIDE.md` for adding new languages

#### Task 6: Workflow Orchestration ✅
- ✨ Implemented `WorkflowOrchestrator` class
  - `createNewArchetype()` - Complete archetype creation workflow
  - `batchValidate()` - Validate all examples with statistics
  - `improvePrompt()` - Analyze and suggest improvements
- ✨ Added npm scripts for workflow automation
- ✨ CI/CD integration for quality checks

#### Task 7: Performance Optimization ✅
- ⚡ Archetype data caching (< 100ms loading time)
- ⚡ Async quality validation (< 50ms overhead)
- ⚡ Similar response caching
- ⚡ Batch validation optimization (< 2s for 40 examples)

#### Task 8: Documentation ✅
- 📝 Updated README with all new features
- 📝 Created TRANSLATION_GUIDE.md
- 📝 Created DEPLOYMENT.md with phase-by-phase deployment guide

**Status**: Ready for production deployment

### v2.1.0 (2025-01-23)

**Few-Shot Example System Implementation (Task 1 Complete)**

- ✨ Added TypeScript type definitions (`types.ts`)
  - `FewShotExample` interface with full analysis structure
  - `EmotionalState` enum
  - `Analysis` interface for 4-dimensional quality evaluation
  - Word count ranges for English and Korean
  
- ✨ Implemented `FewShotExampleGenerator` class
  - `generateExample()` - Create single example with analysis
  - `generateAllExamples()` - Generate 8 examples per archetype
  - `formatAsMarkdown()` - Format examples for documentation
  - Automatic word count validation
  
- ✨ Updated `generate-examples.ts` script
  - Now uses `FewShotExampleGenerator` class
  - Improved type safety with new interfaces
  - Better error handling and validation
  
- ✨ Integrated Few-Shot examples into PROMPT.md
  - Added `{{FEW_SHOT_EXAMPLES}}` variable section
  - Positioned before "RESPONSE QUALITY EXAMPLES"
  - Ready for example content insertion
  
- ✨ Updated all 5 archetype YAML files
  - Added `fewShotExamples` field structure
  - 8 example templates per archetype (40 total)
  - Includes placeholders for questions, responses, and analysis
  
- 📝 Created `FEW_SHOT_WRITING_GUIDE.md`
  - Complete guide for writing 40 examples
  - Word count guidelines by emotional state
  - Character consistency tips per archetype
  - Guilty vs innocent behavior patterns
  - Example templates and validation checklist

### v2.0.0 (2025-01-20)

- ✨ Complete refactoring using Claude Skills pattern
- ✨ Added 4 automation scripts
- ✨ Split archetypes into individual files
- ✨ Created comprehensive prompt engineering guide
- ✨ Added SKILL.yaml metadata
- ✨ Improved PROMPT.md with meta-skill capabilities

### v1.0.0 (2024)

- Initial framework with 5 archetypes
- Emotional system design
- Quality criteria definition
- Basic prompt templates

---

## License

MIT License - See LICENSE file for details

---

## Support

For questions, issues, or feature requests:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review `references/prompt-engineering-guide.md`
3. Open an issue on GitHub
4. Ask Claude via `/skill suspect-ai-prompter`

---

**Made with ❤️ for creating believable, engaging murder mystery suspects**
