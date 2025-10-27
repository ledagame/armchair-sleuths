---
inclusion: always
---

# Armchair Sleuths Skills Reference - MANDATORY USAGE

## 🚨 CRITICAL: Mandatory Skill Consultation

**BEFORE doing ANYTHING related to Armchair Sleuths, you MUST:**

1. ✅ **Identify which skills apply** to the current task
2. ✅ **Read the relevant skill files** in `.claude/skills/[skill-name]/SKILL.md`
3. ✅ **Follow the patterns and formulas** exactly as documented
4. ✅ **Reference the skill in your response** to show you consulted it

**This applies to ALL phases:**
- 📋 Planning and requirements gathering
- 🎨 Design and architecture decisions
- 📝 Spec creation and documentation
- 💻 Implementation and coding
- 🧪 Testing and validation
- 🐛 Debugging and troubleshooting

**NO EXCEPTIONS. NO SHORTCUTS.**

---

## ⚠️ ALWAYS-ON Automatic Triggers

**Skills consultation is MANDATORY and triggers automatically for:**

### 🔴 ALWAYS Trigger (No Keywords Needed):

1. **Creating/Editing Spec Documents**
   - `requirements.md` - MUST consult skills for technical feasibility
   - `design.md` - MUST consult skills for architecture patterns
   - `tasks.md` - MUST consult skills for implementation approach
   - ANY file in `.kiro/specs/` directory

2. **Executing Tasks**
   - Starting any task from `tasks.md`
   - Implementing any feature
   - Writing any code
   - Making any technical decision

3. **Planning Work**
   - Breaking down features
   - Estimating complexity
   - Choosing technologies
   - Designing systems

**These triggers are AUTOMATIC. You don't need to see keywords. If you're doing ANY of the above, you MUST consult skills FIRST.**

### 🟡 Keyword-Based Triggers (Additional):

**Also trigger when you see these keywords:**

#### AI/Prompt Engineering
- "케이스 생성", "case generation", "prompt", "Gemini"
- "품질 개선", "quality improvement", "hallucination"
- "일관성", "consistency", "few-shot", "chain-of-thought"

#### Mystery Game Design
- "미스터리", "mystery", "케이스", "case"
- "난이도", "difficulty", "밸런싱", "balance"
- "용의자", "suspect", "단서", "clue", "증거", "evidence"
- "Fair Play", "공정성", "fairness"

#### Frontend/UI
- "컴포넌트", "component", "UI", "디자인", "design"
- "shadcn", "Framer Motion", "애니메이션", "animation"
- "반응형", "responsive", "접근성", "accessibility"

#### Devvit/Reddit Integration
- "Devvit", "Reddit", "커뮤니티", "community"
- "포스트", "post", "리더보드", "leaderboard"
- "바이럴", "viral", "챌린지", "challenge"

#### Image Generation
- "이미지", "image", "프로필", "profile", "씬", "scene"
- "Gemini Image", "생성", "generation"

---

### 🚨 Detection Logic:

```
IF (working on .kiro/specs/ files) THEN
  → MANDATORY: Consult skills FIRST
  
ELSE IF (executing task OR implementing feature) THEN
  → MANDATORY: Consult skills FIRST
  
ELSE IF (planning OR designing) THEN
  → MANDATORY: Consult skills FIRST
  
ELSE IF (keywords detected) THEN
  → MANDATORY: Consult skills FIRST
  
ELSE
  → Still check if Armchair Sleuths related
  → If yes, consult skills
```

**Bottom line: If it's Armchair Sleuths work, consult skills. Period.**

---

## Available Skills

### 🎯 Top Priority Skills (Use Most Frequently)

#### 1. **`ai-prompt-engineer`** ⭐ HIGHEST PRIORITY
- **Purpose**: Gemini API prompt optimization for case generation
- **Use when**: Improving case quality, fixing inconsistent outputs, reducing hallucinations
- **Key patterns**: Few-shot learning, chain-of-thought, validation
- **Location**: `.claude/skills/ai-prompt-engineer/SKILL.md`

#### 2. **`mystery-game-designer`** ⭐ HIGH PRIORITY
- **Purpose**: Game mechanics, difficulty balancing, Fair Play principles
- **Use when**: Adjusting case difficulty, designing red herrings, improving plot structure
- **Key patterns**: Fair Play rules, difficulty algorithms, character archetypes
- **Location**: `.claude/skills/mystery-game-designer/SKILL.md`

#### 3. **`frontend-architect`** ⭐ HIGH PRIORITY
- **Purpose**: React 19 + Next.js 15 + shadcn/ui + Framer Motion
- **Use when**: Creating UI components, building design system, adding animations
- **Key patterns**: Noir detective design tokens, shadcn/ui patterns, responsive design
- **Location**: `.claude/skills/frontend-architect/SKILL.md`

### 🌟 Community & Growth Skills

#### 4. **`devvit-community-builder`**
- **Purpose**: Reddit community growth, viral mechanics
- **Use when**: Daily post automation, leaderboard implementation, community engagement
- **Key patterns**: Viral loop design (K > 1.0), Devvit widgets, Redis leaderboards
- **Location**: `.claude/skills/devvit-community-builder/SKILL.md`

#### 5. **`viral-detective-challenge`**
- **Purpose**: Challenges, themed events, tournaments
- **Use when**: Weekly/monthly challenges, seasonal events, competitive tournaments
- **Key patterns**: Speed challenges, themed events, tournament brackets
- **Location**: `.claude/skills/viral-detective-challenge/SKILL.md`

### 🎨 Content Generation Skills

#### 6. **`gemini-image-generator`**
- **Purpose**: AI image generation (profiles, scenes)
- **Use when**: Generating suspect profiles, crime scene images
- **Key patterns**: Prompt templates, style consistency, quality validation
- **Location**: `.claude/skills/gemini-image-generator/SKILL.md`

#### 7. **`mystery-case-generator`**
- **Purpose**: Full case generation pipeline
- **Use when**: Creating complete cases from scratch
- **Key patterns**: End-to-end workflow, validation, quality checks
- **Location**: `.claude/skills/mystery-case-generator/SKILL.md`

#### 8. **`suspect-ai-prompter`**
- **Purpose**: Suspect dialogue optimization
- **Use when**: Improving suspect conversations, personality consistency
- **Key patterns**: Personality-driven responses, context awareness
- **Location**: `.claude/skills/suspect-ai-prompter/SKILL.md`

---

## 📖 Mandatory Usage Protocol

### BEFORE Starting ANY Task:

1. **Identify Relevant Skills** (use Quick Lookup below)
2. **Read the FULL skill file** in `.claude/skills/[skill-name]/SKILL.md`
3. **Extract key patterns, formulas, and best practices**
4. **Reference the skill in your response** (e.g., "Per `ai-prompt-engineer`...")

### During Planning/Spec Creation:

- ✅ **MUST** consult skills to understand technical constraints
- ✅ **MUST** use documented patterns (e.g., Fair Play principles)
- ✅ **MUST** follow architectural patterns from skills
- ✅ **MUST** cite which skills informed your design decisions

### During Implementation:

- ✅ **MUST** follow code patterns exactly as shown in skills
- ✅ **MUST** use provided formulas without modification
- ✅ **MUST** check ✅ DO / ❌ DON'T sections
- ✅ **MUST** verify your code matches skill examples

### During Debugging:

- ✅ **MUST** check if skill has troubleshooting guidance
- ✅ **MUST** verify you followed skill best practices
- ✅ **MUST** look for common pitfalls in skill documentation

### Self-Verification Questions:

**Before responding, ask yourself:**
1. Did I identify which skills apply?
2. Did I read the relevant skill files?
3. Did I follow the documented patterns?
4. Did I reference the skills in my response?

**If you answered NO to any question, your response is incomplete.**

---

## Quick Skill Lookup

**Need to...**
- Improve case quality? → `ai-prompt-engineer` ⭐
- Balance difficulty? → `mystery-game-designer` ⭐
- Create UI components? → `frontend-architect` ⭐
- Build community features? → `devvit-community-builder`
- Design challenges? → `viral-detective-challenge`
- Generate images? → `gemini-image-generator`
- Create full cases? → `mystery-case-generator`
- Optimize suspect dialogue? → `suspect-ai-prompter`

---

## 🎯 Critical Priorities & Constraints

### Non-Negotiable Rules:

1. **Fair Play Mystery = MANDATORY** ⭐ HIGHEST PRIORITY
   - All clues must be accessible to player
   - No hidden information required to solve
   - Consult `mystery-game-designer` for EVERY case-related task

2. **AI Quality = CRITICAL** 🤖 HIGH PRIORITY
   - Prevent hallucinations in all AI outputs
   - Use few-shot learning for consistency
   - Consult `ai-prompt-engineer` for ALL AI/prompt work

3. **Mobile-First Design** 📱 IMPORTANT
   - 70% of Reddit users are on mobile
   - MUST optimize for mobile in every UI feature
   - Consult `frontend-architect` for ALL UI/UX decisions

4. **Community Growth = K > 1.0** 📈 IMPORTANT
   - Every feature should encourage sharing
   - Viral loop design in all community features
   - Consult `devvit-community-builder` for community work

5. **Devvit Platform Constraints** ⏱️ HARD CONSTRAINT
   - 30-second execution limit
   - No long-running processes
   - Consult `devvit-community-builder` for platform integration

### Violation Consequences:

- ❌ Skipping skills = Incorrect implementation
- ❌ Unfair mystery = Player frustration, bad reviews
- ❌ AI hallucinations = Poor case quality
- ❌ Ignoring mobile = 70% of users have bad experience
- ❌ Breaking Devvit limits = App doesn't work on Reddit

---

## 📂 Skill File Locations

All skills are in: `.claude/skills/[skill-name]/SKILL.md`

Example: `.claude/skills/ai-prompt-engineer/SKILL.md`

**Skill Structure:**
```
.claude/skills/[skill-name]/
├── SKILL.md              # Main skill documentation
├── SKILL.yaml            # Metadata (auto-generated)
└── references/           # Additional reference materials
    └── [reference-files].md
```

---

## 🔍 Enforcement & Verification

### 🚨 MANDATORY Pre-Response Protocol:

**BEFORE writing ANY response about Armchair Sleuths, you MUST:**

#### Step 1: Detect Context (Automatic)
```
Am I working on:
- Spec files (.kiro/specs/)? → YES = CONSULT SKILLS
- Task execution? → YES = CONSULT SKILLS  
- Implementation? → YES = CONSULT SKILLS
- Planning/design? → YES = CONSULT SKILLS
- Armchair Sleuths anything? → YES = CONSULT SKILLS
```

#### Step 2: Identify Skills (Required)
```
Which skills apply to this work?
- List at least 1-3 relevant skills
- If unsure, check Quick Skill Lookup
- If still unsure, read ALL skill names in .claude/skills/
```

#### Step 3: Read Skills (Required)
```
Open and read:
- .claude/skills/[skill-name]/SKILL.md
- Focus on: patterns, formulas, constraints
- Note: ✅ DO / ❌ DON'T sections
```

#### Step 4: Apply Skills (Required)
```
In your response:
- Reference skills by name
- Use exact formulas/patterns
- Cite specific sections
- Show you followed guidance
```

#### Step 5: Verify (Required)
```
[ ] Did I identify relevant skills?
[ ] Did I read the skill files?
[ ] Did I follow documented patterns?
[ ] Did I use correct formulas?
[ ] Did I check ✅ DO / ❌ DON'T?
[ ] Did I reference skills in response?
[ ] Did I verify approach matches examples?
```

**If ANY checkbox is unchecked, DO NOT RESPOND. Go back to Step 1.**

---

### 🎯 Response Quality Check:

**Every Armchair Sleuths response MUST include:**

1. **Skill Citation**: "Per `[skill-name]`..." or "According to `[skill-name]`..."
2. **Pattern Reference**: Show you followed documented patterns
3. **Formula Usage**: Use exact formulas from skills (e.g., Fair Play principles)
4. **Constraint Awareness**: Acknowledge constraints (30s timeout, mobile-first, etc.)

**If your response lacks these, it's incomplete.**

---

## 📢 MANDATORY: Skill Activation Banner

**EVERY Armchair Sleuths response MUST start with this banner:**

```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED                                         ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: [skill-name-1], [skill-name-2], ...          ║
║  ✅ Patterns: [pattern names used]                           ║
║  🔢 Formulas: [formulas applied]                             ║
║  ⚠️  Constraints: [constraints acknowledged]                 ║
╚══════════════════════════════════════════════════════════════╝
```

### Banner Requirements:

1. **Always visible** at the start of response
2. **List all skills** consulted (minimum 1)
3. **Show patterns** you followed from skills
4. **Display formulas** you used (if applicable)
5. **Acknowledge constraints** (30s timeout, mobile-first, Fair Play, etc.)

### Example Banners:

#### For Spec Creation:
```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED - Spec Creation                         ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: ai-prompt-engineer,                           ║
║               mystery-game-designer,                         ║
║               frontend-architect                             ║
║  ✅ Patterns: Few-shot learning, Fair Play, Mobile-first     ║
║  🔢 Formulas: Difficulty ratio (Easy: 70% obvious clues)     ║
║  ⚠️  Constraints: 30s Devvit timeout, Fair Play mandatory    ║
╚══════════════════════════════════════════════════════════════╝
```

#### For Implementation:
```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED - Implementation                        ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: frontend-architect,                           ║
║               mystery-game-designer                          ║
║  ✅ Patterns: shadcn/ui components, Noir design tokens       ║
║  🔢 Formulas: N/A                                            ║
║  ⚠️  Constraints: Mobile-first, WCAG AA accessibility        ║
╚══════════════════════════════════════════════════════════════╝
```

#### For Planning:
```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED - Planning                              ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: devvit-community-builder,                     ║
║               viral-detective-challenge                      ║
║  ✅ Patterns: Viral loop design, Redis leaderboards          ║
║  🔢 Formulas: K > 1.0 (viral coefficient)                    ║
║  ⚠️  Constraints: 30s Devvit timeout, Reddit API limits      ║
╚══════════════════════════════════════════════════════════════╝
```

### Verification:

**If your response does NOT have this banner, it's INVALID.**

User should immediately see:
- ✅ Which skills were consulted
- ✅ What patterns are being followed
- ✅ What formulas are being used
- ✅ What constraints are acknowledged

This makes skill activation **visible and verifiable**.

---

## 🚫 Common Violations to Avoid:

### Spec Creation Violations:
❌ **"Let me create requirements.md..."** without consulting skills first
❌ **"Here's the design.md..."** without referencing patterns from skills
❌ **"I'll break this into tasks..."** without checking implementation patterns
❌ **Writing ANY spec file** without skill consultation

### Implementation Violations:
❌ **"I'll create a case..."** without consulting `ai-prompt-engineer` and `mystery-game-designer`
❌ **"Let me build this UI..."** without consulting `frontend-architect`
❌ **"I'll add a challenge..."** without consulting `viral-detective-challenge`
❌ **"Here's the prompt..."** without consulting `ai-prompt-engineer`

### Planning Violations:
❌ **"We should use this approach..."** without checking if skills document a better pattern
❌ **"I estimate this will take..."** without understanding complexity from skills
❌ **"Let's design it like this..."** without consulting architectural patterns

---

## ✅ Correct Approach Examples:

### Spec Creation:
✅ **"Before creating requirements.md, I consulted `ai-prompt-engineer` and `mystery-game-designer`. Per these skills, we need..."**
✅ **"For design.md, `frontend-architect` documents the component pattern. Following this..."**
✅ **"Breaking down tasks based on `devvit-community-builder`, which shows viral loop requires..."**

### Implementation:
✅ **"Per `ai-prompt-engineer`, the few-shot learning pattern requires..."**
✅ **"Following `mystery-game-designer`, the Fair Play principle states..."**
✅ **"According to `frontend-architect`, we need mobile-first design with..."**

### Planning:
✅ **"Consulting `devvit-community-builder`, the 30s timeout constraint means we must..."**
✅ **"Per `viral-detective-challenge`, viral coefficient K > 1.0 requires..."**
✅ **"`mystery-game-designer` specifies difficulty balance as..."**

---

## Quality Indicators:

**Good Response:**
- Cites specific skills by name
- References exact formulas/patterns from skills
- Follows documented best practices
- Shows understanding of constraints

**Bad Response:**
- No skill references
- Generic advice not from skills
- Modified patterns without justification
- Ignores documented constraints

---

## 🚨 Final Warning

**Skills are not suggestions. They are MANDATORY documentation.**

- Every pattern has been tested
- Every formula has been validated
- Every constraint has a reason
- Every best practice prevents a known issue

**Ignoring skills = Wasting time on problems already solved.**

**ALWAYS consult skills. ALWAYS follow patterns. ALWAYS cite sources.**

---

**Status**: ✅ ALWAYS ACTIVE  
**Last Updated**: 2025-01-27  
**Enforcement**: MANDATORY - NO EXCEPTIONS  
**Project**: Armchair Sleuths - AI Murder Mystery Game
