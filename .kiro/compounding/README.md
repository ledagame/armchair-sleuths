# Compounding Engineering - Lessons Learned

**Purpose**: Store accumulated learnings from each task for efficient context usage

**Structure**: Similar to `/skills` folder - only loaded when needed

---

## 📁 Folder Structure

```
.kiro/compounding/
├── README.md                           # This file
├── core-principles/
│   ├── separation-of-concerns.md      # Principle details with examples
│   ├── typescript-type-safety.md
│   └── framework-integration.md
├── design-patterns/
│   ├── business-logic-first.md
│   ├── interface-driven-design.md
│   └── event-driven-architecture.md
├── anti-patterns/
│   ├── framework-dependencies.md
│   ├── any-type-usage.md
│   └── god-classes.md
└── task-learnings/
    ├── task-3-combat-system.md        # Individual task learnings
    └── [future tasks...]
```

---

## 🎯 Usage Pattern (Like Skills)

### When to Reference

**Automatic Reference** (via steering rules):
1. **Task Validation**: After completing a task
2. **Spec Planning**: When creating requirements/design/tasks
3. **Task Execution**: When implementing any task
4. **Code Review**: When reviewing implementations

**Manual Reference**:
- Use `#[[file:.kiro/compounding/[category]/[file].md]]` in steering documents
- Reference specific learnings when needed

---

## 📊 Benefits vs Steering

### Steering (Always Loaded)
- ❌ Heavy context usage
- ❌ All patterns loaded even if not needed
- ❌ Grows unbounded over time

### Compounding Folder (On-Demand)
- ✅ Light context usage
- ✅ Only load relevant patterns
- ✅ Scalable to hundreds of learnings
- ✅ Similar to skills folder pattern

---

## 🔄 Auto-Update Process

After each task validation:
1. Extract learnings from validation report
2. Create/update relevant files in compounding folder
3. Update task-learnings with new entry
4. Steering only references what's needed

---

## 📚 Current Learnings

### Task 3: Combat System (2025-10-24)
- **File**: `task-learnings/task-3-combat-system.md`
- **Patterns**: Separation of Concerns, Interface-Driven Design, Event-Driven
- **Anti-Patterns**: No framework deps in core, No 'any' types, No god classes
- **Quality**: S (Excellent)

---

## 🎓 How to Use

### For Developers

**Before Starting Task**:
```
1. Check task-learnings/ for similar tasks
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

## 🔍 Search & Discovery

### Find Relevant Learnings

**By Category**:
- Core principles: `.kiro/compounding/core-principles/`
- Design patterns: `.kiro/compounding/design-patterns/`
- Anti-patterns: `.kiro/compounding/anti-patterns/`

**By Task**:
- Task history: `.kiro/compounding/task-learnings/`

**By Topic**:
- Use file search or grep within compounding folder

---

**Note**: This folder is NOT automatically loaded. Reference specific files only when needed, just like the `/skills` folder.
