---
inclusion: always
---

# Reddit Defense Skills Reference - MANDATORY USAGE

## 🚨 CRITICAL: Mandatory Skill Consultation

**BEFORE doing ANYTHING related to Reddit Defense, you MUST:**

1. ✅ **Identify which skills apply** to the current task
2. ✅ **Read the relevant skill files** in `.kiro/skills/[skill-name]/SKILL.md`
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

#### Phaser/Game Development
- "scene", "Phaser", "game", "sprite", "animation", "physics"
- "combat", "enemy", "unit", "tower defense", "wave"
- "UI", "HUD", "button", "modal", "menu"
- "particle", "effect", "explosion", "visual"
- "mobile", "touch", "responsive", "performance"
- "asset", "texture", "atlas", "loading"
- "gacha", "pull", "reveal", "rarity"

#### Reddit Integration
- "Devvit", "Reddit", "Snoo", "avatar", "Karma"
- "postMessage", "bridge", "communication"
- "subreddit", "leaderboard", "post"

#### Game Balance
- "wave", "difficulty", "balance", "DPS", "HP"
- "spawn rate", "enemy count", "scaling"
- "simulation", "formula", "calculation"

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
  → Still check if Reddit Defense related
  → If yes, consult skills
```

**Bottom line: If it's Reddit Defense work, consult skills. Period.**

---

This project has specialized skill documentation in the `.kiro/skills/` directory. When working on Reddit Defense features, **you MUST reference the appropriate skill files** - this is not optional.

## Available Skills

### Core Phaser Skills
- **`phaser-scene-architecture-new`** - Scene management, transitions, lifecycle
- **`phaser-combat-physics-new`** - Tower defense combat, collisions, pathfinding
- **`phaser-ui-scene-patterns-new`** - HUD, modals, buttons, animations
- **`phaser-particle-effects-new`** - Visual effects, explosions, polish
- **`phaser-mobile-optimization-new`** - Touch controls, responsive scaling, performance
- **`phaser-asset-optimization-new`** - Texture atlases, loading, WebP conversion
- **`phaser-gacha-choreography-new`** - 6-stage reveal system (30% dev time priority!)

### Reddit Integration Skills
- **`devvit-phaser-bridge-new`** - postMessage communication, 30s timeout workarounds
- **`reddit-snoo-integration-new`** - "Your Snoo is Your Unit" mechanic, Karma stats

### Game Balance Skills
- **`wave-balance-simulator-new`** - Mathematical formulas, Python simulation, DPS calculations

## 📖 Mandatory Usage Protocol

### BEFORE Starting ANY Task:

1. **Identify Relevant Skills** (use Quick Lookup below)
2. **Read the FULL skill file** in `.kiro/skills/[skill-name]/SKILL.md`
3. **Extract key patterns, formulas, and best practices**
4. **Reference the skill in your response** (e.g., "Per `phaser-gacha-choreography-new`...")

### During Planning/Spec Creation:

- ✅ **MUST** consult skills to understand technical constraints
- ✅ **MUST** use documented formulas (e.g., wave balance: HP = base × 1.15^wave)
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

## Quick Skill Lookup

**Need to...**
- Set up Phaser scenes? → `phaser-scene-architecture-new`
- Add combat mechanics? → `phaser-combat-physics-new`
- Create UI elements? → `phaser-ui-scene-patterns-new`
- Add visual effects? → `phaser-particle-effects-new`
- Optimize for mobile? → `phaser-mobile-optimization-new`
- Reduce load times? → `phaser-asset-optimization-new`
- Build gacha system? → `phaser-gacha-choreography-new` ⭐ HIGH PRIORITY
- Connect to Devvit? → `devvit-phaser-bridge-new`
- Use Reddit avatars? → `reddit-snoo-integration-new`
- Balance difficulty? → `wave-balance-simulator-new`

## 🎯 Critical Priorities & Constraints

### Non-Negotiable Rules:

1. **Gacha Choreography = 30% Dev Time** ⭐ HIGHEST PRIORITY
   - 6-stage reveal system is the core differentiator
   - MUST allocate 30% of total development time
   - Consult `phaser-gacha-choreography-new` for EVERY gacha-related task

2. **Mobile-First = 70% of Users** 📱 CRITICAL
   - 70% of Reddit users are on mobile
   - MUST optimize for mobile in every feature
   - Consult `phaser-mobile-optimization-new` for ALL UI/UX decisions

3. **30-Second Timeout Limit** ⏱️ HARD CONSTRAINT
   - Devvit has 30-second execution limit
   - Game loop MUST run client-side only
   - Consult `devvit-phaser-bridge-new` for ALL server communication

4. **Texture Atlases = 70% Size Reduction** 📦 MANDATORY
   - MUST use texture atlases for all sprites
   - Achieves 70% size reduction
   - Consult `phaser-asset-optimization-new` for ALL asset work

5. **Wave Balance Formulas = Mathematically Proven** 🔢 DO NOT MODIFY
   - HP = base × 1.15^wave (exponential scaling)
   - Formulas are simulation-tested
   - Consult `wave-balance-simulator-new` for ALL balance decisions
   - NEVER guess or modify formulas without simulation

### Violation Consequences:

- ❌ Skipping skills = Incorrect implementation
- ❌ Modifying formulas = Broken game balance
- ❌ Ignoring mobile = 70% of users have bad experience
- ❌ Breaking 30s limit = Game doesn't work on Devvit
- ❌ Not using atlases = Slow loading, poor performance

## 📂 Skill File Locations

All skills are in: `.kiro/skills/[skill-name]/SKILL.md`

Example: `.kiro/skills/phaser-gacha-choreography-new/SKILL.md`

---

## 🔍 Enforcement & Verification

### 🚨 MANDATORY Pre-Response Protocol:

**BEFORE writing ANY response about Reddit Defense, you MUST:**

#### Step 1: Detect Context (Automatic)
```
Am I working on:
- Spec files (.kiro/specs/)? → YES = CONSULT SKILLS
- Task execution? → YES = CONSULT SKILLS  
- Implementation? → YES = CONSULT SKILLS
- Planning/design? → YES = CONSULT SKILLS
- Reddit Defense anything? → YES = CONSULT SKILLS
```

#### Step 2: Identify Skills (Required)
```
Which skills apply to this work?
- List at least 1-3 relevant skills
- If unsure, check Quick Skill Lookup
- If still unsure, read ALL skill names
```

#### Step 3: Read Skills (Required)
```
Open and read:
- .kiro/skills/[skill-name]/SKILL.md
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

**Every Reddit Defense response MUST include:**

1. **Skill Citation**: "Per `[skill-name]`..." or "According to `[skill-name]`..."
2. **Pattern Reference**: Show you followed documented patterns
3. **Formula Usage**: Use exact formulas from skills (e.g., HP = base × 1.15^wave)
4. **Constraint Awareness**: Acknowledge constraints (30s timeout, mobile-first, etc.)

**If your response lacks these, it's incomplete.**

---

## 📢 MANDATORY: Skill Activation Banner

**EVERY Reddit Defense response MUST start with this banner:**

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
5. **Acknowledge constraints** (30s timeout, mobile-first, etc.)

### Example Banners:

#### For Spec Creation:
```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED - Spec Creation                         ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: phaser-gacha-choreography-new,                ║
║               wave-balance-simulator-new,                    ║
║               phaser-mobile-optimization-new                 ║
║  ✅ Patterns: 6-stage reveal, exponential scaling            ║
║  🔢 Formulas: HP = base × 1.15^wave                          ║
║  ⚠️  Constraints: 30s timeout, 70% mobile users, 30% gacha   ║
╚══════════════════════════════════════════════════════════════╝
```

#### For Implementation:
```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED - Implementation                        ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: phaser-combat-physics-new,                    ║
║               phaser-scene-architecture-new                  ║
║  ✅ Patterns: Arcade Physics groups, object pooling          ║
║  🔢 Formulas: N/A                                            ║
║  ⚠️  Constraints: Client-side game loop only                 ║
╚══════════════════════════════════════════════════════════════╝
```

#### For Planning:
```
╔══════════════════════════════════════════════════════════════╗
║  🎯 SKILLS ACTIVATED - Planning                              ║
╠══════════════════════════════════════════════════════════════╣
║  📚 Consulted: phaser-asset-optimization-new,                ║
║               devvit-phaser-bridge-new                       ║
║  ✅ Patterns: Texture atlases, postMessage bridge            ║
║  🔢 Formulas: 70% size reduction via atlases                 ║
║  ⚠️  Constraints: 30s Devvit timeout, 5s load time target    ║
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

### 🚫 Common Violations to Avoid:

#### Spec Creation Violations:
❌ **"Let me create requirements.md..."** without consulting skills first
❌ **"Here's the design.md..."** without referencing architectural patterns from skills
❌ **"I'll break this into tasks..."** without checking implementation patterns in skills
❌ **Writing ANY spec file** without skill consultation

#### Implementation Violations:
❌ **"I'll implement a gacha system..."** without consulting `phaser-gacha-choreography-new`
❌ **"Let me create a combat system..."** without consulting `phaser-combat-physics-new`
❌ **"I'll balance the waves..."** without consulting `wave-balance-simulator-new`
❌ **"Here's a UI design..."** without consulting `phaser-ui-scene-patterns-new`

#### Planning Violations:
❌ **"We should use this approach..."** without checking if skills document a better pattern
❌ **"I estimate this will take..."** without understanding complexity from skills
❌ **"Let's design it like this..."** without consulting architectural patterns

### ✅ Correct Approach Examples:

#### Spec Creation:
✅ **"Before creating requirements.md, I consulted `phaser-gacha-choreography-new` and `wave-balance-simulator-new`. Per these skills, we need..."**
✅ **"For design.md, `phaser-scene-architecture-new` documents the scene flow pattern. Following this..."**
✅ **"Breaking down tasks based on `phaser-asset-optimization-new`, which shows texture atlas creation requires..."**

#### Implementation:
✅ **"Per `phaser-gacha-choreography-new`, the 6-stage reveal system requires..."**
✅ **"Following `wave-balance-simulator-new`, the HP formula is: base × 1.15^wave..."**
✅ **"According to `phaser-mobile-optimization-new`, we need 44x44 touch targets..."**

#### Planning:
✅ **"Consulting `devvit-phaser-bridge-new`, the 30s timeout constraint means we must..."**
✅ **"Per `phaser-asset-optimization-new`, texture atlases achieve 70% size reduction, so..."**
✅ **"`phaser-gacha-choreography-new` allocates 30% dev time to gacha, therefore..."**

### Quality Indicators:

**Good Response:**
- Cites specific skills by name
- References exact formulas/patterns from skills
- Follows documented best practices
- Shows understanding of constraints

**Bad Response:**
- No skill references
- Generic advice not from skills
- Modified formulas without justification
- Ignores documented constraints

---

## 🚨 Final Warning

**Skills are not suggestions. They are MANDATORY documentation.**

- Every pattern has been tested
- Every formula has been simulated
- Every constraint has a reason
- Every best practice prevents a known issue

**Ignoring skills = Wasting time on problems already solved.**

**ALWAYS consult skills. ALWAYS follow patterns. ALWAYS cite sources.**
