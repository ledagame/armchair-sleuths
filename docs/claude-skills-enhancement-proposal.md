# Claude Skills Enhancement Proposal
## Applying Claude Skills Pattern to Armchair Sleuths AI Prompting System

**Date**: 2025-01-20
**Status**: Proposal
**Priority**: High Impact, Medium Effort

---

## Executive Summary

Armchair Sleuths uses AI prompting extensively across case generation, suspect conversations, and image generation. This proposal outlines how to apply the **Claude Skills pattern** (Markdown + YAML + optional scripts) to enhance prompting quality, consistency, and maintainability.

**Key Insight**: Skills work as a **prompt middleware layer** - dynamically loaded, composable enhancements that improve AI outputs without replacing existing infrastructure.

**Expected Benefits**:
- 🎯 +15-30% improvement in AI output quality
- 🔧 Easier prompt iteration (no code changes needed)
- 🧩 Composable, reusable prompting components
- 📊 A/B testing capability for continuous improvement
- 🚀 Community contribution potential (future)

---

## 1. Current State Analysis

### Existing Skills Structure

The project already has 9 skills in `skills/` directory:
1. `ai-prompt-engineer` - Prompt optimization patterns
2. `frontend-architect` - UI/UX patterns
3. `mystery-game-designer` - Game mechanics and balancing
4. `devvit-community-builder` - Community growth
5. `viral-detective-challenge` - Engagement mechanics
6. `gemini-image-generator` - Image generation prompts
7. `mystery-case-generator` - Case generation pipeline
8. `suspect-ai-prompter` - Suspect conversation optimization
9. `evidence-system-architect` - Evidence mechanics

### Gap Analysis

**Current**: Skills are comprehensive documentation files
**Claude Skills Pattern**: Dynamic, trigger-based, composable components

**What's Missing**:
- ❌ Dynamic loading based on context
- ❌ Trigger-based activation
- ❌ Atomic, composable skills
- ❌ Runtime prompt enhancement
- ❌ Skill orchestration patterns
- ❌ Validation and versioning

---

## 2. Proposed Architecture

### Skills as Prompt Middleware

```
User Request → Service Layer → [SKILLS MIDDLEWARE] → AI API → Response
                                      ↓
                            1. Trigger Matching
                            2. Skill Loading
                            3. Prompt Enhancement
                            4. Orchestration
```

### Core Components

**SkillLoader**
```typescript
class SkillLoader {
  private skills: Map<string, Skill> = new Map();

  async loadSkill(skillName: string): Promise<Skill> {
    const skillPath = `./skills/${skillName}/SKILL.md`;
    const content = await fs.readFile(skillPath, 'utf-8');
    return this.parseSkill(content);
  }

  getActiveSkills(context: string): Skill[] {
    return Array.from(this.skills.values())
      .filter(skill => this.matchesTriggers(skill, context));
  }
}
```

**PromptEnhancer**
```typescript
class PromptEnhancer {
  async enhance(
    basePrompt: string,
    context: {
      operation: string;
      triggers: string[];
      context?: any;
    }
  ): Promise<string> {
    // Load relevant skills based on triggers
    const activeSkills = this.skillLoader.getActiveSkills(context);

    // Compose skill instructions
    const skillInstructions = activeSkills
      .map(skill => skill.instructions)
      .join('\n\n');

    return `${skillInstructions}\n\n${basePrompt}`;
  }
}
```

**SkillOrchestrator**
```typescript
class SkillOrchestrator {
  async executeOrchestration(
    orchestratorSkill: Skill,
    context: any
  ): Promise<any> {
    // Support sequential, parallel, and conditional composition
    if (orchestratorSkill.execution_mode === 'sequential') {
      return this.executeSequential(orchestratorSkill.pipeline, context);
    }
    // ... parallel, conditional modes
  }
}
```

---

## 3. Enhanced Skill Structure

### Atomic Skills (vs Monolithic)

**Current** (Monolithic):
```
suspect-ai-prompter/
└── SKILL.md (3000+ lines covering everything)
```

**Proposed** (Atomic):
```
suspect-personality-core/
├── SKILL.md (focused on archetype-based responses)
suspect-emotional-reactor/
├── SKILL.md (focused on emotional state transitions)
suspect-clue-revealer/
├── SKILL.md (focused on strategic information sharing)
suspect-consistency-validator/
├── SKILL.md (focused on character consistency)
```

### Enhanced YAML Frontmatter

```yaml
---
name: suspect-emotional-reactor
description: Updates suspect emotional state based on conversation pressure
version: 2.0.0
type: ai-prompting
category: suspect-interaction

# Trigger patterns for dynamic loading
triggers:
  keywords: [emotional state, suspicion level, conversation pressure]
  contexts: [suspect interrogation, suspect chat]

# Dependencies on other skills
dependencies:
  required: [suspect-personality-core]
  optional: [suspect-clue-revealer]

# Composability metadata
composability:
  can_combine_with: [suspect-clue-revealer, suspect-consistency-validator]
  execution_order: after-personality-core

# Performance metadata
token_cost:
  estimated_tokens: 500
  priority: high

# Validation schema
output_schema:
  type: object
  properties:
    suspicionLevel: {type: number, min: 0, max: 100}
    tone: {type: string, enum: [cooperative, nervous, defensive, aggressive]}

# Test cases
test_cases:
  - input: "aggressive questioning about alibi"
    expected_output: "suspicion increase, defensive tone"
---
```

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Deliverables**:
- `src/server/services/skills/SkillLoader.ts`
- `src/server/services/skills/PromptEnhancer.ts`
- `src/server/services/skills/SkillOrchestrator.ts`
- `src/server/services/skills/SkillValidator.ts`
- `src/server/services/skills/types.ts`
- `scripts/skills/validate-skill.ts`
- `scripts/skills/package-skill.ts`
- Feature flags in `.env`
- Unit tests (>80% coverage)

**Feature Flags**:
```env
ENABLE_SKILLS=false
ENABLE_SKILLS_CASE_GEN=false
ENABLE_SKILLS_SUSPECT=false
ENABLE_SKILLS_IMAGE=false
```

### Phase 2: Skill Restructuring (Week 3-4)

**Restructure Existing Skills**:

1. `suspect-ai-prompter` → 4 atomic skills
   - `suspect-personality-core`
   - `suspect-emotional-reactor`
   - `suspect-clue-revealer`
   - `suspect-consistency-validator`

2. `mystery-case-generator` → orchestrator + atomic skills
   - `case-element-selector`
   - `case-story-weaver`
   - `case-fair-play-validator`
   - `case-generation-orchestrator`

3. `gemini-image-generator` → specialized skills
   - `suspect-portrait-prompter`
   - `scene-atmosphere-prompter`
   - `evidence-forensic-prompter`

**Validation**: All skills pass `validate-skill.ts`

### Phase 3: Integration (Week 5-6)

**Gradual Rollout Strategy**:

1. **Start with Images** (Lowest Risk)
   ```typescript
   // In EvidenceGeneratorService
   const enhancedPrompt = await this.promptEnhancer.enhance(basePrompt, {
     operation: 'evidence-image-generation',
     triggers: ['forensic photography', 'evidence image']
   });
   ```
   - Run 100 A/B comparisons
   - Measure quality improvement
   - Enable via `ENABLE_SKILLS_IMAGE=true`

2. **Then Suspect Conversations** (Medium Risk)
   ```typescript
   // In SuspectConversationService
   const enhancedPrompt = await this.promptEnhancer.enhance(basePrompt, {
     operation: 'suspect-interrogation',
     triggers: ['suspect response', 'character consistency'],
     context: {
       suspicionLevel: suspect.emotionalState.suspicionLevel,
       archetype: suspect.archetype
     }
   });
   ```

3. **Finally Case Generation** (Highest Risk)
   - Use orchestrator pattern for complex composition
   - Extensive validation before rollout

### Phase 4: New Skills Creation (Week 7-8)

**5 New Skills**:

1. **dynamic-difficulty-adjuster**
   - Analyzes player performance
   - Recommends difficulty adjustments
   - Improves retention

2. **cross-case-continuity**
   - Ensures consistency across daily cases
   - Builds recurring characters/locations
   - Creates ongoing storylines

3. **viral-moment-generator**
   - Creates shareable, meme-worthy moments
   - Designs unexpected plot twists
   - Drives organic growth

4. **accessibility-enhancer**
   - Ensures diverse cognitive accessibility
   - Provides multiple solution paths
   - Expands audience

5. **thematic-event-coordinator**
   - Generates themed mystery events
   - Coordinates holiday cases
   - Creates engagement spikes

### Phase 5: Production Rollout (Week 9+)

**Full Deployment**:
- Enable `ENABLE_SKILLS=true`
- Monitor production metrics
- Document learnings
- Team training
- Community contribution framework
- Deprecate legacy prompting

---

## 5. Success Metrics

### Quality Improvements (Target)
- Case quality score: **+15%**
- Suspect conversation coherence: **+20%**
- Image generation consistency: **+10%**
- Fair Play compliance: **+15%**

### Performance (Maintain or Improve)
- Token efficiency: Neutral or **+5%**
- Generation time: < **+20%** (acceptable)

### Engagement (Target)
- Player solve rate: Maintained or **+5%**
- Community engagement: **+25%**
- Daily active users: **+10%**

### Validation Framework

**A/B Testing**:
```typescript
class SkillABTester {
  async compareOutputs(
    operation: string,
    iterations: number = 100
  ): Promise<ComparisonResult> {
    // Generate with skills vs without
    // Evaluate quality via LLM
    // Calculate statistical significance
    // Make recommendation
  }
}
```

**Quality Evaluation** (LLM-based):
- Fair Play compliance (0-100)
- Narrative coherence (0-100)
- Character consistency (0-100)
- Style adherence (0-100)

---

## 6. Risk Mitigation

### Backward Compatibility

**Dual-Mode Support**:
```typescript
interface SkillConfig {
  mode: 'legacy' | 'claude-skills' | 'hybrid';
  enabledSkills?: string[];
}
```

**Feature Flags**: Instant rollback capability

**Versioning**: Semantic versioning with dependency pinning

### Gradual Rollout

1. **Start Low-Risk**: Image generation first
2. **Measure Everything**: A/B tests required
3. **Validate Before Expanding**: Prove value before next phase
4. **Rollback Plan**: Feature flags enable instant revert

### Testing Strategy

- Unit tests: >80% coverage
- Integration tests: All skill orchestrations
- A/B tests: Quality comparisons
- Human validation: Weekly sampling
- Performance tests: Token usage, generation time

---

## 7. Tooling and Automation

### Validation Script

```bash
# Validate single skill
npm run skills:validate -- suspect-emotional-reactor

# Validate all skills
npm run skills:validate:all

# Package skill for distribution
npm run skills:package -- suspect-emotional-reactor ./dist
```

### CI/CD Integration

```yaml
# .github/workflows/validate-skills.yml
name: Validate Skills
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate all skills
        run: npm run skills:validate:all
      - name: Run skill tests
        run: npm run skills:test
```

### Update Management

```bash
# Check for skill updates
npm run skills:check-updates

# Update specific skill
npm run skills:update -- suspect-emotional-reactor@2.1.0

# Update all skills (safe mode)
npm run skills:update:all --safe
```

---

## 8. Integration Examples

### Example 1: Case Generation

**Before**:
```typescript
async generateCase(): Promise<CaseData> {
  const prompt = this.buildCasePrompt();
  const response = await this.gemini.generateContent({...});
}
```

**After**:
```typescript
async generateCase(): Promise<CaseData> {
  const basePrompt = this.buildCasePrompt();

  const enhancedPrompt = await this.skillEnhancer.enhance(basePrompt, {
    operation: 'case-generation',
    triggers: ['mystery creation', 'story weaving', 'fair play']
  });

  const response = await this.gemini.generateContent({
    contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }]
  });
}
```

### Example 2: Suspect Conversation

**Before**:
```typescript
async generateResponse(message: string, suspect: Suspect): Promise<string> {
  const prompt = `You are ${suspect.name}...`;
  const response = await this.gemini.generateContent({...});
}
```

**After**:
```typescript
async generateResponse(message: string, suspect: Suspect): Promise<string> {
  const basePrompt = `You are ${suspect.name}...`;

  const enhancedPrompt = await this.skillEnhancer.enhance(basePrompt, {
    operation: 'suspect-interrogation',
    triggers: ['character consistency', 'emotional progression'],
    context: {
      suspicionLevel: suspect.emotionalState.suspicionLevel,
      archetype: suspect.archetype,
      conversationCount: this.getConversationCount()
    }
  });

  const response = await this.gemini.generateContent({
    contents: [{ role: 'user', parts: [{ text: enhancedPrompt }] }]
  });
}
```

---

## 9. Next Steps

### Immediate Actions

1. **Decision Point**: Approve overall approach?
2. **Proof of Concept**: Create SkillLoader + PromptEnhancer
3. **Pilot Skill**: Restructure `gemini-image-generator` as atomic skills
4. **A/B Test**: Run image generation comparison (100 iterations)
5. **Review**: Evaluate results and decide on full rollout

### Questions for Discussion

1. **Priority**: Which AI operation should we enhance first?
   - Image generation (lowest risk)
   - Suspect conversations (highest impact)
   - Case generation (highest complexity)

2. **Timeline**: Is 9-week roadmap acceptable?
   - Can compress to 6 weeks if needed
   - Can extend for more thorough validation

3. **Resources**: Who will own skill maintenance?
   - Dedicated skill engineer?
   - Distributed ownership?
   - Community contributions?

4. **Metrics**: Which success metrics matter most?
   - Quality improvements?
   - Player engagement?
   - Token efficiency?

---

## 10. Conclusion

The Claude Skills pattern is **exceptionally well-suited** for Armchair Sleuths because:

✅ **Fits existing architecture**: Skills work as middleware, not replacement
✅ **Improves quality**: Focused, composable prompts enhance consistency
✅ **Enables iteration**: Update prompts without code changes
✅ **Reduces risk**: Feature flags and gradual rollout
✅ **Future-proof**: Versioning and community contributions

**Core Philosophy Alignment**: "Simplicity with power" - Skills are just Markdown + YAML, yet they enable sophisticated prompt composition and quality improvement.

**Recommended Action**: Approve Phase 1 (Foundation) and Phase 2 (Restructuring) to create proof-of-concept. Run A/B tests on image generation. Evaluate results before committing to full rollout.

---

**Contact**: Ready to discuss and refine this proposal.
**Next Meeting**: Review implementation plan and assign ownership.
