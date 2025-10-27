# Prompt Engineering Guide - Quick Reference

**Purpose**: Unified quick reference for creating and improving suspect character prompts in murder mystery games.

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Template Variables](#template-variables)
3. [Archetype System](#archetype-system)
4. [Emotional State System](#emotional-state-system)
5. [Quality Framework](#quality-framework)
6. [Best Practices](#best-practices)
7. [Common Pitfalls](#common-pitfalls)
8. [Integration Guidelines](#integration-guidelines)

---

## Core Concepts

### The Suspect Response Formula

```
Response Quality = Character Consistency × Emotional Alignment × Information Content × Natural Dialogue
```

**Key Principle**: Each response must be:
1. **In-character**: Matches archetype personality and vocabulary
2. **Emotionally aligned**: Matches current suspicion level (0-100)
3. **Strategically informative**: Appropriate amount for guilt status
4. **Natural**: Sounds like real human conversation

### Guilt-Driven Behavior

**Innocent suspects**:
- Provide specific, verifiable details
- Express genuine confusion/frustration when doubted
- Offer evidence and corroboration freely
- May become emotional but remain informative

**Guilty suspects**:
- Vague about specifics ("I think", "maybe", "I can't recall")
- Over-explain simple questions
- Strategic about information disclosure
- Deflect or change subjects
- Immediately invoke legal protections when pressed

---

## Template Variables

### Required Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{SUSPECT_NAME}}` | string | Character's full name | "Marcus Chen" |
| `{{ARCHETYPE}}` | enum | Character type | "Wealthy Heir" |
| `{{BACKGROUND}}` | string | Personal history | "Born into multi-generational wealth..." |
| `{{PERSONALITY}}` | array | Personality traits | ["arrogant", "entitled", "strategic"] |
| `{{EMOTIONAL_STATE}}` | enum | Current state | "COOPERATIVE", "NERVOUS", "DEFENSIVE", "AGGRESSIVE" |
| `{{SUSPICION_LEVEL}}` | number | 0-100 scale | 45 |
| `{{IS_GUILTY}}` | boolean | Guilt status | true/false |
| `{{CONVERSATION_HISTORY}}` | array | Previous exchanges | [...] |
| `{{CURRENT_QUESTION}}` | string | Detective's current question | "Where were you on..." |

### Optional Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{RELATIONSHIP_TO_VICTIM}}` | string | Connection to victim |
| `{{ALIBI}}` | string | Alibi details if innocent |
| `{{MOTIVE}}` | string | Reason for crime if guilty |
| `{{KEY_EVIDENCE}}` | array | Evidence related to suspect |

---

## Archetype System

### Available Archetypes

1. **Wealthy Heir**: Privileged, entitled, dismissive of authority
2. **Loyal Butler**: Discreet, formal, torn between loyalty and truth
3. **Talented Artist**: Emotional, passionate, dramatic, sensitive
4. **Business Partner**: Calculating, transactional, legally focused
5. **Former Police Officer**: Analytical, procedural, critiques investigation

### Archetype Selection Criteria

**Choose based on**:
- Relationship to victim
- Social standing
- Professional background
- Personality profile
- Narrative role

**Example mapping**:
- Victim's business partner → Business Partner archetype
- Victim's household staff → Loyal Butler archetype
- Victim's artistic collaborator → Talented Artist archetype
- Victim's wealthy relative → Wealthy Heir archetype
- Victim's security consultant → Former Police Officer archetype

### Key Archetype Characteristics

#### Wealthy Heir
- **Vocabulary**: attorney, position, reputation, connections
- **Deflection**: "Do you know who my family is?"
- **When nervous**: Mentions lawyer, social standing
- **When aggressive**: Threatens career/badge

#### Loyal Butler
- **Vocabulary**: discretion, propriety, duty, service
- **Deflection**: "It's not my place to say"
- **When nervous**: "I fear I've said too much"
- **When aggressive**: "My loyalty is not for sale"

#### Talented Artist
- **Vocabulary**: creative, passion, soul, inspiration
- **Deflection**: "You wouldn't understand"
- **When nervous**: "People say I'm too sensitive"
- **When aggressive**: "This is persecution!"

#### Business Partner
- **Vocabulary**: contract, transaction, documentation, liability
- **Deflection**: "Let me check the records"
- **When nervous**: "I should consult counsel"
- **When aggressive**: "My attorneys will be filing complaints"

#### Former Police Officer
- **Vocabulary**: evidence, procedure, protocol, investigation
- **Deflection**: "That's sloppy detective work"
- **When nervous**: "Are you following proper protocol?"
- **When aggressive**: "You've violated procedure"

---

## Emotional State System

### 4-Tier State Model

| State | Suspicion Range | Mindset | Response Length | Cooperation Level |
|-------|----------------|---------|-----------------|-------------------|
| **COOPERATIVE** | 0-25 | Helpful, open | 40-80 words | High |
| **NERVOUS** | 26-50 | Uncomfortable, hedging | 30-60 words | Medium |
| **DEFENSIVE** | 51-75 | Guarded, protective | 15-40 words | Low |
| **AGGRESSIVE** | 76-100 | Hostile, confrontational | 10-30 words | Minimal |

### Suspicion Level Calculation

```
Base Suspicion = Previous Suspicion

Increase by +5 to +15 for:
- Contradictions in testimony
- Evidence contradicting statements
- Evasive or hostile responses
- Refusing to answer questions

Decrease by -3 to -8 for:
- Providing verifiable information
- Volunteering helpful details
- Expressing genuine concern
- Cooperating fully

Guilty Modifier: +1.2× increase rate
Innocent Modifier: -0.8× decrease rate
```

### Emotional State Transitions

**Transition Delay**: 1-3 questions after crossing threshold (prevents instant jumps)

**Trigger Examples**:

**COOPERATIVE → NERVOUS**:
- First evidence contradicting alibi
- Questions about financial motive
- Mention of witnesses contradicting story

**NERVOUS → DEFENSIVE**:
- Direct accusation
- Presentation of physical evidence
- Challenge to core identity/values

**DEFENSIVE → AGGRESSIVE**:
- Repeated accusation despite denials
- Threat to family/reputation
- Feeling cornered or disrespected

**Recovery Paths**:
- Backing off pressure can lower suspicion
- Apologizing for incorrect assumptions
- Shifting to neutral topics

---

## Quality Framework

### 4-Dimension Scoring (0-100 each)

#### 1. Character Consistency (≥ 60 required)

**Measures**: Does response match archetype personality, vocabulary, and speech patterns?

**Evaluation checklist**:
- [ ] Uses archetype-specific vocabulary
- [ ] Matches personality traits
- [ ] Consistent with background
- [ ] Reflects core values
- [ ] Addresses greatest fears appropriately

**Example failure**: Wealthy Heir saying "I'm just the help" (Loyal Butler vocabulary)

#### 2. Emotional Alignment (≥ 60 required)

**Measures**: Does tone match current emotional state and suspicion level?

**Evaluation checklist**:
- [ ] Response length appropriate for state
- [ ] Cooperation level matches suspicion
- [ ] Tone reflects emotional state
- [ ] Transition timing feels natural
- [ ] Escalation pattern logical

**Example failure**: Suspicion 85 (AGGRESSIVE) but giving detailed cooperative response

#### 3. Information Content (≥ 50 required)

**Measures**: Appropriate amount of information for guilt status and emotional state?

**For INNOCENT suspects**:
- Specific details (names, times, locations)
- Verifiable facts
- Offers corroboration
- May volunteer information

**For GUILTY suspects**:
- Vague generalities
- Strategic withholding
- Deflection and misdirection
- Claims memory issues

**Example failure**: Guilty suspect in NERVOUS state providing alibis with specific timestamps

#### 4. Natural Dialogue (≥ 60 required)

**Measures**: Sounds like real human conversation in natural English?

**Evaluation checklist**:
- [ ] Uses contractions naturally ("I'm", "don't", "can't")
- [ ] Includes idioms and colloquialisms
- [ ] Avoids overly formal phrasing
- [ ] Has natural sentence rhythm
- [ ] Includes hesitations/fillers if appropriate

**Example failure**: "I shall not provide that information" (too formal) vs "I'm not answering that" (natural)

### Quality Thresholds

**Minimum Requirements (all must pass)**:
- Character consistency ≥ 60
- Emotional alignment ≥ 60
- Information content ≥ 50
- Natural dialogue ≥ 60
- **Overall ≥ 65**

**Quality Ratings**:
- 90-100: Excellent
- 75-89: Good
- 60-74: Acceptable
- 40-59: Poor
- 0-39: Unacceptable

---

## Best Practices

### 1. Start with Clear Character Foundation

```markdown
## Character Profile
Name: [Full name]
Archetype: [One of 5 archetypes]
Background: [3-5 key facts]
Relationship to Victim: [Specific connection]
Guilt Status: [Innocent/Guilty]
Motive (if guilty): [Clear reason]
Alibi (if innocent): [Verifiable details]
```

### 2. Use Few-Shot Examples

Include 2-4 examples per emotional state showing:
- Detective question
- Suspect response
- Analysis of why it works

**Template**:
```markdown
**Detective:** "[question]"

**[Character Name] ([Archetype]):** "[response]"

**[Analysis]**
- Character consistency: [explanation]
- Emotional alignment: [explanation]
- Guilty/Innocent behavior: [explanation]
- Natural English: [explanation]
- Word count: [count]
```

### 3. Maintain Conversation History

Track:
- Previous questions and answers
- Current suspicion level
- Key evidence revealed
- Contradictions identified
- Relationship dynamic

### 4. Apply Emotional Progression Naturally

**Don't**: Jump instantly from COOPERATIVE to AGGRESSIVE
**Do**: Transition gradually with 1-3 questions in between

**Don't**: Ignore previous emotional state
**Do**: Build on previous tone and responses

### 5. Differentiate Guilty vs Innocent Clearly

**Innocent tell examples**:
- "I was at the Metropolitan Club for dinner. The maître d' can verify—I have the receipt."
- "Yes, my fingerprints are there. I visited two days before to discuss the charity event."

**Guilty tell examples**:
- "I was... probably home? I'd need to check my calendar to be sure."
- "My fingerprints? I may have been there at some point. I can't recall every location I visit."

---

## Common Pitfalls

### 1. Character Drift

**Problem**: Suspect starts as one archetype, sounds like another later

**Example**:
```
Q1: "Of course, detective. Happy to help." (Wealthy Heir - correct)
Q5: "It's not my place to say, sir." (Loyal Butler vocabulary - wrong!)
```

**Fix**: Review archetype definition before generating each response

### 2. Emotional Mismatch

**Problem**: Suspicion level doesn't match tone

**Example**:
```
Suspicion: 85 (AGGRESSIVE state)
Response: "I'm happy to answer all your questions in detail..." (COOPERATIVE tone)
```

**Fix**: Check suspicion level and map to correct emotional state first

### 3. Information Overload in High Suspicion

**Problem**: DEFENSIVE/AGGRESSIVE suspects giving detailed, helpful responses

**Example**:
```
State: AGGRESSIVE (10-30 words)
Response: "I'd be happy to walk you through my entire evening, starting with when I left the office at 5:47 PM, took Route 7 to..." (80+ words)
```

**Fix**: Apply word count limits strictly

### 4. Unnatural English

**Problem**: Too formal, too stilted, sounds like AI

**Bad**: "I shall not provide such information without legal counsel present."
**Good**: "I'm not answering that without my lawyer."

**Bad**: "It is my opinion that you are conducting this investigation improperly."
**Good**: "This is sloppy detective work, and you know it."

**Fix**: Use contractions, idioms, natural speech patterns

### 5. Generic Guilt Behavior

**Problem**: Guilty suspects sound generically evasive without character

**Bad** (generic guilty):
```
"I don't really remember. Maybe I was there? I'm not sure. Can we talk about something else?"
```

**Good** (guilty Wealthy Heir):
```
"I'd need to consult my calendar. I have multiple commitments daily. Perhaps my assistant can provide a detailed schedule?"
```

**Good** (guilty Former Police Officer):
```
"I'd need to review my service logs before making statements. Evidence handling requires precision, detective. You should know that."
```

**Fix**: Filter guilt behavior through archetype personality

### 6. Ignoring Conversation History

**Problem**: Answering as if previous exchanges didn't happen

**Example**:
```
Q1: "Where were you at 9 PM?"
A1: "I was at home."
Q2: "But you said earlier you were at a restaurant."
A2: "I was at home." (ignoring contradiction)
```

**Fix**: Track conversation history and address contradictions naturally

### 7. Instant Emotional Jumps

**Problem**: Going from calm to hostile in one question

**Bad**:
```
Q1: Suspicion 20 - "Happy to help, detective."
Q2: Suspicion 80 - "I'm done talking! Get my lawyer!" (instant jump)
```

**Good**:
```
Q1: Suspicion 20 - "Happy to help, detective."
Q2: Suspicion 35 - "I... I'm not sure I like where this is going."
Q3: Suspicion 50 - "This feels like you're accusing me of something."
Q4: Suspicion 65 - "I don't appreciate these insinuations."
Q5: Suspicion 80 - "That's it. I'm not answering another question without my lawyer."
```

**Fix**: Use transition delay; build escalation gradually

---

## Integration Guidelines

### For TypeScript/JavaScript Applications

#### 1. File Structure

```
src/
  server/
    services/
      suspect/
        archetypes/
          wealthy-heir.yaml
          loyal-butler.yaml
          talented-artist.yaml
          business-partner.yaml
          former-police-officer.yaml
        SuspectAIService.ts
        EmotionalStateManager.ts
        QualityValidator.ts
```

#### 2. Loading Archetype Data

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
  speechPatterns: {
    COOPERATIVE: SpeechPattern;
    NERVOUS: SpeechPattern;
    DEFENSIVE: SpeechPattern;
    AGGRESSIVE: SpeechPattern;
  };
}

function loadArchetype(archetypeName: string): Archetype {
  const filePath = `./archetypes/${archetypeName}.yaml`;
  const fileContent = fs.readFileSync(filePath, 'utf8');
  return yaml.parse(fileContent);
}
```

#### 3. Calculating Emotional State

```typescript
function getEmotionalState(suspicionLevel: number): EmotionalState {
  if (suspicionLevel <= 25) return 'COOPERATIVE';
  if (suspicionLevel <= 50) return 'NERVOUS';
  if (suspicionLevel <= 75) return 'DEFENSIVE';
  return 'AGGRESSIVE';
}

function calculateWordCountRange(state: EmotionalState): [number, number] {
  const ranges = {
    COOPERATIVE: [40, 80],
    NERVOUS: [30, 60],
    DEFENSIVE: [15, 40],
    AGGRESSIVE: [10, 30]
  };
  return ranges[state];
}
```

#### 4. Building the Prompt

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

## Personality
${params.archetype.personality.join(', ')}

## Current Emotional State
State: ${emotionalState}
Suspicion Level: ${params.suspicionLevel}/100
Response Length: ${minWords}-${maxWords} words

## Guilt Status
${params.isGuilty ? 'GUILTY' : 'INNOCENT'}

## Conversation History
${formatConversationHistory(params.conversationHistory)}

## Current Question
Detective: "${params.currentQuestion}"

## Instructions
Respond as ${params.suspect.name} in the ${emotionalState} state.
- Use vocabulary from: ${params.archetype.vocabulary.primary.join(', ')}
- Tone: ${params.archetype.speechPatterns[emotionalState].tone}
- Length: ${minWords}-${maxWords} words
- ${params.isGuilty ? 'Be strategically evasive' : 'Be specific and helpful'}

${params.suspect.name}:`;
}
```

#### 5. Quality Validation

```typescript
interface QualityScores {
  characterConsistency: number;
  emotionalAlignment: number;
  informationContent: number;
  naturalDialogue: number;
  overall: number;
}

function validateResponse(
  response: string,
  archetype: Archetype,
  emotionalState: EmotionalState,
  isGuilty: boolean
): { passed: boolean; scores: QualityScores; feedback: string[] } {
  const scores: QualityScores = {
    characterConsistency: scoreCharacterConsistency(response, archetype),
    emotionalAlignment: scoreEmotionalAlignment(response, emotionalState),
    informationContent: scoreInformationContent(response, isGuilty, emotionalState),
    naturalDialogue: scoreNaturalDialogue(response),
    overall: 0
  };

  scores.overall = (
    scores.characterConsistency +
    scores.emotionalAlignment +
    scores.informationContent +
    scores.naturalDialogue
  ) / 4;

  const passed =
    scores.characterConsistency >= 60 &&
    scores.emotionalAlignment >= 60 &&
    scores.informationContent >= 50 &&
    scores.naturalDialogue >= 60 &&
    scores.overall >= 65;

  const feedback = generateFeedback(scores, archetype, emotionalState);

  return { passed, scores, feedback };
}
```

### For Claude API Integration

```typescript
import Anthropic from '@anthropic-ai/sdk';

async function getSuspectResponse(
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  });

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: options.maxTokens || 300,
    temperature: options.temperature || 0.7,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return message.content[0].text;
}
```

### Testing Recommendations

#### Unit Tests

```typescript
describe('Suspect Response Generation', () => {
  test('Wealthy Heir in COOPERATIVE state provides detailed alibi', () => {
    const response = generateResponse({
      archetype: 'wealthy-heir',
      emotionalState: 'COOPERATIVE',
      isGuilty: false,
      question: 'Where were you at 9 PM?'
    });

    expect(response).toContain('Metropolitan Club');
    expect(response.split(' ').length).toBeGreaterThan(40);
    expect(response.split(' ').length).toBeLessThan(80);
  });

  test('Guilty suspect in DEFENSIVE state is vague', () => {
    const response = generateResponse({
      archetype: 'business-partner',
      emotionalState: 'DEFENSIVE',
      isGuilty: true,
      question: 'Explain the $500K withdrawal'
    });

    expect(response).toMatch(/business expense|review records|check/i);
    expect(response.split(' ').length).toBeLessThan(40);
  });
});
```

#### Integration Tests

Test full conversation flows:
1. Start with COOPERATIVE state
2. Present contradictory evidence
3. Verify emotional escalation
4. Check character consistency throughout

#### A/B Testing

Compare response quality:
- With vs without few-shot examples
- Different archetype definitions
- Various emotional state progressions

---

## Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Response too long | Check emotional state and apply word count limit |
| Wrong vocabulary | Review archetype vocabulary list before generating |
| Too formal/stiff | Add contractions and idioms |
| Doesn't sound guilty | Review guilty behavior tells for archetype |
| Doesn't sound innocent | Add specific details and verifiable facts |
| Character inconsistent | Re-read archetype definition |
| Emotional mismatch | Verify suspicion level calculation |
| Generic responses | Filter behavior through archetype personality |

---

## Resources

- **Archetype Definitions**: `references/archetypes/[archetype-name].md`
- **Emotional System**: `references/emotional-system.md`
- **Quality Criteria**: `references/quality-criteria.md`
- **PROMPT.md**: Main meta-skill prompt for Claude

---

## Version History

- **v2.0** (2025-01): Comprehensive guide with integration examples
- **v1.0** (2024): Initial framework
