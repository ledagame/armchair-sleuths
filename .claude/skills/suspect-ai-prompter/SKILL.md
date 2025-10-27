---
name: suspect-ai-prompter
description: Optimize AI suspect conversation prompts, test emotional responses, and manage suspect archetypes. This skill should be used when improving suspect dialogue quality, testing AI responses, adding new suspect archetypes, or tuning emotional state transitions.
---

# Suspect AI Prompter

## Overview

This skill optimizes AI suspect conversation prompts, tests emotional state systems, and manages suspect archetypes for the Armchair Sleuths mystery game.

## When to Use This Skill

**This skill should be used when:**
- Improving suspect prompts: "용의자 프롬프트 개선" / "Improve suspect prompts"
- Testing AI responses: "AI 응답 테스트" / "Test AI responses"
- Adding new suspect archetypes: "새 용의자 원형 추가" / "Add new suspect archetype"
- Tuning emotional states: "감정 상태 튜닝" / "Tune emotional states"
- Validating suspect dialogue quality: "용의자 대화 품질 검증" / "Validate suspect dialogue quality"

## Core Features

### 1. Suspect Prompt System

Generates character-consistent prompts with:
- Suspect identity (name, archetype, background, personality)
- Guilty/innocent status awareness
- Current emotional state integration
- Conversation history context
- Response rules enforcement

See `references/archetypes.md` for complete prompt templates.

### 2. Emotional State System

Four-tier emotional progression based on suspicion level:
- **COOPERATIVE** (0-25): Calm, helpful responses
- **NERVOUS** (26-50): Hesitant, defensive tone
- **DEFENSIVE** (51-75): Guarded, short answers
- **AGGRESSIVE** (76-100): Hostile, confrontational

See `references/emotional-system.md` for detailed logic and transitions.

### 3. Suspect Archetypes

Five pre-built archetypes with distinct personalities:
1. **Wealthy Heir**: Arrogant, entitled
2. **Loyal Butler**: Polite, observant
3. **Talented Artist**: Emotional, creative
4. **Business Partner**: Calculating, pragmatic
5. **Former Police Officer**: Analytical, direct

See `references/archetypes.md` for complete archetype details and speech patterns.

## Quick Start

### Test Suspect Responses

```bash
# Test specific suspect
npx tsx scripts/test-suspect-responses.ts --suspect-id suspect-123

# Test with custom questions
npx tsx scripts/test-suspect-responses.ts --suspect-id suspect-123 --questions questions.json

# Test emotional progression
npx tsx scripts/test-suspect-responses.ts --suspect-id suspect-123 --test-emotions
```

### Add New Archetype

```bash
# Interactive mode
npx tsx scripts/add-suspect-archetype.ts

# With parameters
npx tsx scripts/add-suspect-archetype.ts \
  --name "의심스러운 변호사" \
  --traits "교활함,언변,논리적" \
  --keywords "법률,계약,변론"
```

## Integration with Project

```
armchair-sleuths/
├── skills/suspect-ai-prompter/
├── scripts/
│   ├── test-suspect-responses.ts
│   └── add-suspect-archetype.ts
├── src/server/services/
│   ├── SuspectAIService.ts
│   └── EmotionalStateManager.ts
└── package.json
```

**Recommended npm scripts:**
```json
{
  "scripts": {
    "suspect:test": "tsx scripts/test-suspect-responses.ts",
    "suspect:add": "tsx scripts/add-suspect-archetype.ts"
  }
}
```

## Skill Dependencies

- **mystery-case-generator**: Provides suspect data for testing
- **Gemini AI**: Powers suspect conversation responses

## References

For detailed information, see the references directory:

- **archetypes.md**: Complete archetype descriptions, speech patterns, and prompt templates
- **emotional-system.md**: Emotional state logic, transitions, and suspicion calculation
- **quality-criteria.md**: Response quality standards and evaluation metrics
- **prompt-templates.md**: Base prompt structures and customization guide
