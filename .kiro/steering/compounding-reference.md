---
inclusion: manual
---

# Compounding Engineering Reference

**Purpose**: Lightweight reference to compounding learnings (loaded only when needed)

**Pattern**: Similar to skills folder - reference specific files when relevant

---

## 📁 Compounding Folder Structure

```
.kiro/compounding/
├── README.md                           # Overview and usage guide
├── core-principles/                    # Fundamental principles
│   ├── ai-prompt-optimization.md       # Gemini API 프롬프트 최적화
│   ├── mystery-game-balance.md         # 미스터리 게임 밸런싱
│   ├── devvit-integration.md           # Reddit Devvit 통합 패턴
│   └── typescript-type-safety.md       # TypeScript 타입 안전성
├── design-patterns/                    # Proven design patterns
│   ├── fair-play-mystery.md            # Fair Play 미스터리 원칙
│   ├── few-shot-learning.md            # Few-shot learning 패턴
│   ├── chain-of-thought.md             # Chain-of-thought prompting
│   ├── viral-loop-design.md            # 바이럴 루프 설계
│   └── progressive-disclosure.md       # 점진적 정보 공개
├── anti-patterns/                      # Patterns to avoid
│   ├── ai-hallucination.md             # AI Hallucination 방지
│   ├── unfair-mystery.md               # 불공정한 미스터리
│   ├── poor-difficulty-balance.md      # 잘못된 난이도 밸런싱
│   └── any-type-usage.md               # 'any' 타입 남용
└── task-learnings/                     # Individual task learnings
    ├── task-1-case-generation.md
    ├── task-2-suspect-dialogue.md
    └── [future tasks...]
```

---

## 🎯 When to Reference

### Automatic Reference (via other steering rules)

1. **Task Validation** (auto-task-validation.md):
   - After completing a task
   - Extract learnings and save to compounding folder
   - Reference: `#[[file:.kiro/compounding/task-learnings/task-[N]-[name].md]]`

2. **Spec Planning**:
   - When creating requirements.md
   - When creating design.md
   - When creating tasks.md
   - Reference relevant core-principles and design-patterns

3. **Task Execution**:
   - Before implementing any task
   - Reference similar task-learnings
   - Reference applicable patterns

4. **Code Review**:
   - Check if patterns were followed
   - Verify anti-patterns were avoided
   - Reference: `#[[file:.kiro/compounding/anti-patterns/[name].md]]`

---

## 📖 How to Reference

### In Steering Documents

Use file references (like skills):
```markdown
#[[file:.kiro/compounding/core-principles/separation-of-concerns.md]]
#[[file:.kiro/compounding/task-learnings/task-3-combat-system.md]]
```

### In Agent Instructions

**Before Task Execution**:
```
1. Check if similar task exists in task-learnings/
2. Read relevant core-principles/
3. Review applicable design-patterns/
4. Note anti-patterns/ to avoid
```

**During Implementation**:
```
- Follow referenced patterns
- Avoid documented anti-patterns
- Note new patterns discovered
```

**After Completion**:
```
- System auto-extracts learnings
- System auto-updates compounding folder
- Review and confirm accuracy
```

---

## 🔍 Quick Lookup

### By Category

**Core Principles** (Fundamental concepts):
- AI Prompt Optimization (Gemini API)
- Mystery Game Balance (난이도, 공정성)
- Devvit Integration (Reddit 플랫폼)
- TypeScript Type Safety

**Design Patterns** (Proven approaches):
- Fair Play Mystery (공정한 미스터리 원칙)
- Few-Shot Learning (예시 기반 학습)
- Chain-of-Thought (단계별 추론)
- Viral Loop Design (K > 1.0 목표)
- Progressive Disclosure (점진적 정보 공개)
- Redis for Leaderboards (리더보드 구현)

**Anti-Patterns** (What to avoid):
- AI Hallucination (환각 현상)
- Unfair Mystery (불공정한 미스터리)
- Poor Difficulty Balance (잘못된 난이도)
- Using 'any' Type (타입 안전성 위반)
- Blocking Operations (비동기 처리 실패)

### By Task

**Task 1 - Case Generation** (2025-01-20):
- Quality: A (Good)
- Patterns: Few-Shot Learning, Chain-of-Thought, Fair Play
- File: `task-learnings/task-1-case-generation.md`

**Task 2 - Suspect Dialogue** (2025-01-21):
- Quality: A (Good)
- Patterns: Personality Consistency, Context Awareness, Hallucination Prevention
- File: `task-learnings/task-2-suspect-dialogue.md`

---

## 📊 Current Stats

**Total Learnings**: 2 tasks  
**Core Principles**: 4 documented  
**Design Patterns**: 6 documented  
**Anti-Patterns**: 5 documented  
**Quality Average**: A (Good)  
**Project**: Armchair Sleuths - AI Murder Mystery Game

---

## 🚀 Benefits

### vs Always-Loaded Steering

**Steering (Always Loaded)**:
- ❌ Heavy context usage
- ❌ All patterns loaded even if not needed
- ❌ Grows unbounded over time
- ❌ Slows down every request

**Compounding Folder (On-Demand)**:
- ✅ Light context usage
- ✅ Only load relevant patterns
- ✅ Scalable to hundreds of learnings
- ✅ Fast - only load what's needed
- ✅ Similar to skills folder pattern

---

## 🔄 Auto-Update Process

After each task validation:

1. **Extract Learnings**: From validation report
2. **Create/Update Files**:
   - Update task-learnings/task-[N]-[name].md
   - Update relevant core-principles/ if new principle
   - Update relevant design-patterns/ if new pattern
   - Update relevant anti-patterns/ if new anti-pattern
3. **Update This Reference**: Add new task to stats
4. **No Heavy Steering**: Keep steering lightweight

---

## 💡 Usage Examples

### Example 1: Starting Task 3 (Image Generation)

**Agent should**:
1. Read `task-learnings/task-1-case-generation.md` (similar AI domain)
2. Read `core-principles/ai-prompt-optimization.md` (apply same pattern)
3. Read `design-patterns/few-shot-learning.md` (proven approach)
4. Avoid `anti-patterns/ai-hallucination.md` (known issue)

**Result**: Faster, higher quality implementation

---

### Example 2: Code Review

**Reviewer should**:
1. Check if `fair-play-mystery.md` principles were followed
2. Verify `typescript-type-safety.md` standards met
3. Confirm `anti-patterns/unfair-mystery.md` was avoided
4. Validate difficulty balance using `mystery-game-balance.md`

**Result**: Consistent quality across tasks

---

## 🎓 Philosophy

> **"Load only what you need, when you need it"**

This approach:
- Keeps context light
- Scales indefinitely
- Maintains fast response times
- Follows proven skills folder pattern

---

**Note**: This is a reference document. Actual learnings are in `.kiro/compounding/` folder. Reference specific files only when needed.

---

**Last Updated**: 2025-10-25
