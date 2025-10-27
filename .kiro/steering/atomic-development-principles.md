---
inclusion: always
---

# Atomic Development - Quick Reference

**Full Guidelines**: `#[[file:.kiro/docs.md/atomic-development-principles.md]]`

---

## Core Rule

**One Item at a Time** - Never work on multiple items simultaneously

---

## Quick Checklist

### Before Starting
- [ ] Can describe task in one sentence?
- [ ] Single logical unit?
- [ ] Can test independently?

### During Work
- [ ] Only one item
- [ ] Test written first
- [ ] Build compiles

### Before Completion
- [ ] Test passes
- [ ] Build succeeds
- [ ] Single atomic commit

---

## What is "One Item"?
- ✅ Single component
- ✅ Single API endpoint
- ✅ Single utility function
- ❌ Multiple components
- ❌ Entire module
- ❌ Frontend + backend together

---

**For full guidelines**: `.kiro/docs.md/atomic-development-principles.md`
