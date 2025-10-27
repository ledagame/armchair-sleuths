# Steering to Docs.md Refactoring - Complete Guide

**Date**: 2025-10-24  
**Status**: In Progress

---

## 📋 Files to Refactor

### ✅ Completed
1. `clean-code.md` - Moved to docs.md, lightweight reference created
2. `step-by-step.md` - Moved to docs.md, lightweight reference created
3. `agents.md` - Moved to docs.md, lightweight reference created

### 🔄 To Be Completed
4. `atomic-development-principles.md`
5. `auto-task-validation.md`
6. `comprehensive-enforcement-system.md`
7. `devvit-platform-guide.md`
8. `general-best-practices.md`
9. `mvp-first-simplicity.md`
10. `no-assumptions-enforcement.md`
11. `serial-development-protocol.md`

### ⏭️ Keep as Lightweight (Already Good)
- `compounding-reference.md` - Already lightweight
- `product.md` - Project-specific, keep in steering
- `reddit-defense-skills.md` - Project-specific, keep in steering
- `structure.md` - Project-specific, keep in steering
- `tech.md` - Project-specific, keep in steering

---

## 🎯 Refactoring Pattern

### For Each Heavy Document:

1. **Move to docs.md**:
   ```
   .kiro/docs.md/[filename].md
   ```

2. **Create Lightweight Reference in Steering**:
   ```markdown
   ---
   inclusion: always
   ---
   
   # [Title] - Quick Reference
   
   **Full Guidelines**: `#[[file:.kiro/docs.md/[filename].md]]`
   
   ## Quick Rules
   [3-5 key points]
   
   **For full guidelines**: `.kiro/docs.md/[filename].md`
   ```

---

## 📊 Expected Results

### Before
- Heavy steering files (always loaded)
- Context usage: HIGH
- Scalability: LIMITED

### After
- Lightweight references (always loaded)
- Full docs (load when needed)
- Context usage: LOW
- Scalability: UNLIMITED

---

## 🚀 Next Steps

User should run a command to complete remaining files, or I can continue one by one.

**Recommendation**: Complete all at once for consistency.
