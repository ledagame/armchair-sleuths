---
inclusion: always
---
# 🚨 Serial Development Protocol (MANDATORY)

**Status**: ALWAYS ENFORCED  
**Full Documentation**: `#[[file:.kiro/docs.md/serial-development-protocol.md]]`

---

## ⚠️ CRITICAL: Core Rule

**Vertical Slice First** - Complete one full slice before horizontal expansion

```
❌ WRONG: Build all APIs, then all components, then test
✅ RIGHT: Build one complete feature (DB → API → UI → Test), then next feature
```

---

## 📐 Vertical Slice = 4 Layers (MANDATORY)

### Complete in this exact order:

```
1. Database Layer
   ├─ Schema definition
   ├─ Migration file
   ├─ Apply migration immediately
   └─ Test data insertion

2. API Layer
   ├─ Endpoint implementation
   ├─ Database connection
   ├─ Request/response types
   └─ Error handling

3. Frontend Layer
   ├─ Component implementation
   ├─ API integration
   ├─ State management
   └─ UI rendering

4. Integration Test
   ├─ End-to-end test
   ├─ User flow validation
   ├─ Error case testing
   └─ Performance check
```

---

## ✅ Completion Checklist (MANDATORY)

**Before moving to next feature:**

```
[ ] Database schema created and applied
[ ] Database works (verified with test queries)
[ ] API endpoint implemented
[ ] API works with database (tested with curl/Postman)
[ ] Frontend component implemented
[ ] Frontend works with API (tested in browser)
[ ] Integration test passes
[ ] Deployed and validated in dev environment
[ ] User flow demonstrable (can show working feature)
[ ] All TypeScript errors resolved
[ ] No console errors in browser
```

**If ANY checkbox is unchecked, DO NOT proceed to next feature.**

---

## ❌ NEVER Do Simultaneously

**These are FORBIDDEN:**

```
❌ Multiple API endpoints at once
❌ Multiple components at once
❌ Multiple database tables at once
❌ Multiple domains/features at once
❌ Frontend + incomplete backend
❌ Backend + incomplete database
❌ Testing + incomplete implementation
```

**Why forbidden:**
- Creates integration hell
- Hard to debug
- Wastes time on rework
- Blocks other work
- Causes merge conflicts

---

## ✅ ALWAYS Do Serially

**Strict order:**

```
Database → API → Frontend → Test → Deploy → Next Feature

Example:
1. User Login Feature
   ├─ users table → auth API → login form → test → deploy
   └─ ✅ COMPLETE

2. User Profile Feature
   ├─ profiles table → profile API → profile page → test → deploy
   └─ ✅ COMPLETE

3. Settings Feature
   ├─ settings table → settings API → settings page → test → deploy
   └─ ✅ COMPLETE
```

---

## 🔍 Self-Verification Protocol

**Before starting work:**

```
[ ] Am I working on ONE feature only?
[ ] Have I completed the previous feature's 4 layers?
[ ] Is the previous feature deployed and working?
[ ] Am I starting with the database layer?
```

**During work:**

```
[ ] Am I still on the same feature?
[ ] Have I completed the current layer before moving to next?
[ ] Am I testing each layer as I complete it?
[ ] Am I documenting as I go?
```

**Before moving to next feature:**

```
[ ] Is the current feature 100% complete?
[ ] Does it pass all 4 layers?
[ ] Is it deployed and demonstrable?
[ ] Have I documented what I built?
```

---

## 🚨 Enforcement Rules

### Rule 1: One Feature at a Time
```
IF (working on multiple features):
  → STOP immediately
  → Complete current feature first
  → Then start next feature
```

### Rule 2: Complete All 4 Layers
```
IF (moving to next feature):
  → VERIFY all 4 layers complete
  → VERIFY integration test passes
  → VERIFY deployed and working
  → THEN proceed
```

### Rule 3: No Horizontal Expansion
```
IF (tempted to build multiple APIs):
  → STOP
  → Complete one full vertical slice
  → THEN build next API
```

---

## 📊 Progress Tracking

**Use this format:**

```markdown
## Feature: User Authentication

### Layer 1: Database ✅
- [x] users table schema
- [x] Migration applied
- [x] Test data inserted
- [x] Verified with SQL query

### Layer 2: API ✅
- [x] POST /api/auth/login endpoint
- [x] Database connection working
- [x] Request/response types defined
- [x] Error handling implemented
- [x] Tested with curl

### Layer 3: Frontend ✅
- [x] LoginForm component
- [x] API integration
- [x] State management
- [x] UI rendering
- [x] Tested in browser

### Layer 4: Integration Test ✅
- [x] End-to-end test written
- [x] User flow validated
- [x] Error cases tested
- [x] Performance acceptable

### Deployment ✅
- [x] Deployed to dev
- [x] Smoke tested
- [x] User flow demonstrable

**Status**: ✅ COMPLETE - Ready for next feature
```

---

## ⚠️ Common Violations & Fixes

### Violation 1: Building Multiple APIs
```
❌ BAD:
- Implement /api/users
- Implement /api/posts
- Implement /api/comments
- Then build frontend

✅ GOOD:
- Complete /api/users + frontend + test
- Then complete /api/posts + frontend + test
- Then complete /api/comments + frontend + test
```

### Violation 2: Frontend Before Backend
```
❌ BAD:
- Build all UI components
- Then connect to APIs later

✅ GOOD:
- Build database + API
- Then build UI component
- Test integration immediately
```

### Violation 3: No Integration Testing
```
❌ BAD:
- Build feature
- Move to next feature
- Test later

✅ GOOD:
- Build feature
- Test integration immediately
- Verify working
- Then move to next feature
```

---

## 🎯 Benefits of Serial Development

**Proven advantages:**

1. **Early Integration**: Catch issues immediately
2. **Demonstrable Progress**: Always have working features
3. **Easier Debugging**: Small, isolated changes
4. **Better Planning**: See actual progress
5. **Reduced Risk**: No big-bang integration
6. **Faster Delivery**: Ship features incrementally
7. **Better Quality**: Test as you go

---

## 📖 Full Documentation

**Complete guidelines with examples:**
`#[[file:.kiro/docs.md/serial-development-protocol.md]]`

**Related documentation:**
- Atomic development: `#[[file:.kiro/docs.md/atomic-development-principles.md]]`
- Step-by-step process: `#[[file:.kiro/docs.md/step-by-step.md]]`

---

**Status**: ✅ ALWAYS ENFORCED  
**Last Updated**: 2025-10-25  
**Enforcement**: MANDATORY - NO EXCEPTIONS
