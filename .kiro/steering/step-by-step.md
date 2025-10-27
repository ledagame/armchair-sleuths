---
inclusion: always
---
# 🚨 Step-by-Step Development Process (MANDATORY)

**Status**: ALWAYS FOLLOW  
**Full Documentation**: `#[[file:.kiro/docs.md/step-by-step.md]]`

---

## ⚠️ CRITICAL: Three-Phase Process

**MUST follow this exact order for EVERY task:**

```
Phase 1: Codebase Exploration
   ↓
Phase 2: Implementation Planning
   ↓
Phase 3: Implementation Execution
```

**NO SHORTCUTS. NO SKIPPING PHASES.**

---

## 📋 Phase 1: Codebase Exploration (MANDATORY)

### Purpose
Understand existing code before making changes

### Required Steps

```
1. List Relevant Files
   ├─ Use listDirectory to see project structure
   ├─ Use fileSearch to find related files
   └─ Document file locations

2. Analyze Conventions
   ├─ Read existing similar files
   ├─ Identify naming patterns
   ├─ Note code style
   └─ Document conventions

3. Document Patterns
   ├─ Identify architectural patterns
   ├─ Note design decisions
   ├─ Find reusable components
   └─ Document for planning phase
```

### Completion Checklist

```
[ ] Listed all relevant files
[ ] Read existing similar implementations
[ ] Identified naming conventions
[ ] Documented code patterns
[ ] Noted architectural decisions
[ ] Found reusable components
[ ] Ready to plan implementation
```

**If ANY checkbox is unchecked, Phase 1 is incomplete.**

---

## 📐 Phase 2: Implementation Planning (MANDATORY)

### Purpose
Create detailed roadmap before writing code

### Required Steps

```
1. Create Detailed Roadmap
   ├─ Break task into subtasks
   ├─ Define order of implementation
   ├─ Identify dependencies
   └─ Estimate complexity

2. Define Acceptance Criteria
   ├─ What does "done" mean?
   ├─ How to verify correctness?
   ├─ What tests are needed?
   └─ What edge cases to handle?

3. Break Into Modules
   ├─ Identify logical components
   ├─ Define interfaces
   ├─ Plan data flow
   └─ Document module boundaries
```

### Planning Template

```markdown
## Implementation Plan: [Task Name]

### Subtasks
1. [ ] Subtask 1
   - Files to create/modify: [list]
   - Dependencies: [list]
   - Estimated complexity: [low/medium/high]

2. [ ] Subtask 2
   - Files to create/modify: [list]
   - Dependencies: [list]
   - Estimated complexity: [low/medium/high]

### Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Modules
- Module A: [purpose]
  - Interface: [definition]
  - Dependencies: [list]

- Module B: [purpose]
  - Interface: [definition]
  - Dependencies: [list]

### Testing Strategy
- Unit tests: [what to test]
- Integration tests: [what to test]
- Manual testing: [what to verify]
```

### Completion Checklist

```
[ ] Created detailed roadmap
[ ] Defined all subtasks
[ ] Identified dependencies
[ ] Defined acceptance criteria
[ ] Broke into logical modules
[ ] Planned data flow
[ ] Documented interfaces
[ ] Ready to implement
```

**If ANY checkbox is unchecked, Phase 2 is incomplete.**

---

## 💻 Phase 3: Implementation Execution (MANDATORY)

### Purpose
Implement following the plan, verify as you go

### Required Steps

```
1. Implement Following Plan
   ├─ Follow roadmap exactly
   ├─ Complete one subtask at a time
   ├─ Test each subtask before moving on
   └─ Document as you go

2. Verify Acceptance Criteria
   ├─ Check each criterion after implementation
   ├─ Run tests
   ├─ Verify edge cases
   └─ Document verification

3. Maintain Quality Standards
   ├─ No TypeScript errors
   ├─ Follow code conventions
   ├─ Add proper error handling
   └─ Write clear comments
```

### Implementation Checklist

```
[ ] Followed implementation plan
[ ] Completed all subtasks
[ ] Tested each subtask
[ ] All acceptance criteria met
[ ] No TypeScript errors
[ ] Followed code conventions
[ ] Added error handling
[ ] Wrote documentation
[ ] Verified edge cases
[ ] Ready for review
```

**If ANY checkbox is unchecked, Phase 3 is incomplete.**

---

## 🔍 Self-Verification Protocol

**Before starting Phase 1:**
```
[ ] Do I understand the task requirements?
[ ] Do I know which files to explore?
[ ] Am I ready to analyze the codebase?
```

**Before starting Phase 2:**
```
[ ] Did I complete Phase 1?
[ ] Do I understand existing patterns?
[ ] Am I ready to create a plan?
```

**Before starting Phase 3:**
```
[ ] Did I complete Phase 2?
[ ] Do I have a detailed plan?
[ ] Are acceptance criteria clear?
[ ] Am I ready to implement?
```

**Before marking task complete:**
```
[ ] Did I complete all 3 phases?
[ ] Are all acceptance criteria met?
[ ] Did I test the implementation?
[ ] Is documentation complete?
```

---

## 🚨 Enforcement Rules

### Rule 1: No Skipping Phases
```
IF (tempted to skip exploration):
  → STOP
  → Complete Phase 1 first
  → THEN proceed to Phase 2
```

### Rule 2: No Implementation Without Plan
```
IF (starting to code without plan):
  → STOP
  → Complete Phase 2 first
  → THEN proceed to Phase 3
```

### Rule 3: Verify Each Phase
```
AFTER each phase:
  → Check completion checklist
  → Verify all items complete
  → THEN proceed to next phase
```

---

## ⚠️ Common Violations & Fixes

### Violation 1: Skipping Exploration
```
❌ BAD:
User: "Add a new feature"
Agent: [Immediately starts coding]

✅ GOOD:
User: "Add a new feature"
Agent: [Phase 1: Explores codebase]
Agent: [Phase 2: Creates plan]
Agent: [Phase 3: Implements]
```

### Violation 2: No Planning
```
❌ BAD:
Agent: [Reads a few files]
Agent: [Starts implementing immediately]

✅ GOOD:
Agent: [Completes Phase 1 exploration]
Agent: [Creates detailed Phase 2 plan]
Agent: [Shows plan to user]
Agent: [Implements in Phase 3]
```

### Violation 3: No Verification
```
❌ BAD:
Agent: [Implements feature]
Agent: "Done!"

✅ GOOD:
Agent: [Implements feature]
Agent: [Verifies acceptance criteria]
Agent: [Runs tests]
Agent: [Checks for errors]
Agent: "Done and verified!"
```

---

## 📊 Progress Tracking

**Use this format:**

```markdown
## Task: [Task Name]

### Phase 1: Codebase Exploration ✅
- [x] Listed relevant files
- [x] Analyzed conventions
- [x] Documented patterns

### Phase 2: Implementation Planning ✅
- [x] Created detailed roadmap
- [x] Defined acceptance criteria
- [x] Broke into modules

### Phase 3: Implementation Execution ⏳
- [x] Subtask 1
- [x] Subtask 2
- [ ] Subtask 3 (in progress)

**Status**: In Progress - Phase 3
```

---

## 🎯 Benefits

**Why follow this process:**

1. **Fewer Mistakes**: Understand before changing
2. **Better Quality**: Plan before implementing
3. **Faster Development**: Clear roadmap
4. **Easier Debugging**: Know what you built
5. **Better Documentation**: Document as you go
6. **Maintainable Code**: Follow existing patterns

---

## 📖 Full Documentation

**Complete guidelines with examples:**
`#[[file:.kiro/docs.md/step-by-step.md]]`

**Related documentation:**
- Serial development: `#[[file:.kiro/docs.md/serial-development-protocol.md]]`
- Atomic development: `#[[file:.kiro/docs.md/atomic-development-principles.md]]`

---

**Status**: ✅ ALWAYS FOLLOW  
**Last Updated**: 2025-10-25  
**Enforcement**: MANDATORY - NO EXCEPTIONS
