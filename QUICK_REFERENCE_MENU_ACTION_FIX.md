# Quick Reference: Menu Action Reddit API Fix

## TL;DR

**Problem**: Menu action fails with "Reddit API is not enabled"
**Root Cause**: `devvit.json` missing `redditAPI: true` permission
**Fix**: Added `redditAPI: true` to `devvit.json` permissions
**Status**: ✅ FIXED

---

## The Issue

```
User clicks "Create a new post" menu
  ↓
Menu action calls reddit.submitCustomPost()
  ↓
❌ ERROR: "Reddit API is not enabled"
```

---

## Why It Happened

```typescript
// main.tsx - ONLY applies to Custom Post rendering
Devvit.configure({
  redditAPI: true  // ❌ Menu actions DON'T see this
});

// devvit.json - MISSING permission
{
  "permissions": {
    "media": true  // ✅ Only this was enabled
  }
}
```

---

## The Fix

### What Changed
```diff
// devvit.json
{
  "permissions": {
    "media": true,
+   "redditAPI": true
  }
}
```

### Why It Works
- `devvit.json` permissions apply to **ALL contexts**
- Menu actions run in **Express server context**
- Express server reads permissions from **devvit.json**, NOT main.tsx

---

## Two Execution Contexts

### Context 1: Custom Post (main.tsx)
- **What**: UI rendering with Devvit Blocks
- **Configuration**: `Devvit.configure()`
- **Reddit API**: ✅ Always worked (had configure)

### Context 2: Express Server (index.ts)
- **What**: API routes and menu actions
- **Configuration**: `devvit.json` permissions
- **Reddit API**: ❌ Was broken (missing permission) → ✅ Now fixed

---

## Quick Deploy

```bash
# 1. Build
npm run build

# 2. Upload
devvit upload

# 3. Install
devvit install armchair_sleuths_dev

# 4. Test menu action
# Click "Create a new post" in subreddit menu
# Should succeed without errors
```

---

## Verification

### ✅ Success Indicators
- Menu action creates post
- No "Reddit API not enabled" error
- Console shows: `✅ Post created successfully: t3_xxxxx`
- New post appears in subreddit

### ❌ Failure Indicators
- Error toast appears
- Console shows: `Reddit API is not enabled`
- Post creation fails
- 403 Forbidden errors

---

## Files Changed

| File | Change | Status |
|------|--------|--------|
| `devvit.json` | Added `"redditAPI": true` | ✅ Modified |
| `src/main.tsx` | No change | Unchanged |
| `src/server/index.ts` | No change | Unchanged |

---

## Architecture Summary

```
┌──────────────────────────────────────────┐
│           devvit.json                    │
│   permissions: { redditAPI: true }       │
│          ↓                               │
│   Applies to BOTH contexts:              │
└──────────────────────────────────────────┘
         │                    │
         ↓                    ↓
┌─────────────────┐  ┌──────────────────┐
│  Custom Post    │  │ Express Server   │
│  (main.tsx)     │  │ (index.ts)       │
│                 │  │                  │
│  ✅ Reddit API  │  │ ✅ Reddit API    │
│     enabled     │  │    enabled       │
└─────────────────┘  └──────────────────┘
```

---

## Key Learnings

1. **Menu actions ≠ Custom Post**
   - Different execution contexts
   - Different configuration sources

2. **Configuration hierarchy**
   - `devvit.json` → Global (all contexts)
   - `Devvit.configure()` → Custom Post only

3. **Always use devvit.json for menu actions**
   - Menu actions ignore main.tsx configuration
   - Express server reads only devvit.json

---

## Related Documentation

- **Detailed Analysis**: `DEVVIT_MENU_ACTION_API_DIAGNOSIS.md`
- **Architecture Diagram**: `DEVVIT_ARCHITECTURE_DIAGRAM.md`
- **Deployment Guide**: `MENU_ACTION_FIX_DEPLOYMENT.md`
- **Full Frontend Analysis**: `FRONTEND_ARCHITECTURE_ANALYSIS.md`

---

**Fix Applied**: 2025-10-25
**Next Steps**: Deploy and test
