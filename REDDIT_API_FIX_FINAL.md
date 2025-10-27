# 🔧 Reddit API Error - Final Fix

**Date**: 2025-10-25
**Issue**: "Fatal Unhandled Promise rejected: Error: Reddit API is not enabled"
**Status**: ✅ **SOLUTION IDENTIFIED**

---

## 📋 Executive Summary

The game creation works correctly (case generated, images created), but **post creation fails** due to Reddit API access error in menu action context.

### Root Cause
Menu actions defined in `devvit.json` with `forUserType: "moderator"` run in the **Express server context**, which doesn't have access to the `Devvit.configure({ redditAPI: true })` defined in `main.tsx`.

### Solution
Move menu action definition from **declarative** (devvit.json) to **imperative** (main.tsx code) so it runs in the context that has Reddit API enabled.

---

## 🔍 Deep Analysis (by 4 Specialist Agents)

### Agent Findings Summary

**1. root-cause-analyst** ✅
- Identified entry point mismatch issue
- Found that `redditAPI` config exists in main.tsx but not applied to server context

**2. debugger** ✅
- Traced error to moderator check in menu action middleware
- Confirmed TWO separate Devvit instances (client and server)
- Timing issue: middleware runs before server initialization

**3. backend-architect** ✅
- Explained architecture: Custom Post vs Express server contexts
- Proposed scheduler job bridge pattern as alternative
- Documented that menu actions need config in their execution context

**4. frontend-architect** ✅
- Initially suggested adding `redditAPI: true` to devvit.json permissions (INVALID)
- Discovered that permissions field doesn't support redditAPI
- Confirmed menu actions run separately from Custom Post context

---

## ❌ What DOESN'T Work

### Attempt 1: Add redditAPI to devvit.json permissions
```json
"permissions": {
  "media": true,
  "redditAPI": true  // ❌ NOT VALID - causes upload error
}
```

**Error**: `permissions is not allowed to have the additional property "redditAPI"`

### Attempt 2: Rely on main.tsx Devvit.configure()
```typescript
// src/main.tsx
Devvit.configure({
  redditAPI: true  // ✅ Valid but doesn't apply to menu actions in server context
});
```

**Issue**: Menu action handlers run in Express server context, not Custom Post context.

---

## ✅ The Solution

### Option A: Imperative Menu Actions (Recommended)

Move menu action definition from `devvit.json` to `src/main.tsx` using `Devvit.addMenuItem()`:

**Remove from devvit.json**:
```json
"menu": {
  "items": [
    {
      "label": "Create a new post",
      "location": "subreddit",
      "forUserType": "moderator",
      "endpoint": "/internal/menu/post-create"  // ❌ Remove this
    }
  ]
}
```

**Add to src/main.tsx** (after Devvit.configure):
```typescript
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,  // ← This WILL apply to menu actions defined here
});

// Add menu action imperatively
Devvit.addMenuItem({
  label: 'Create a new post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      console.log('🎮 Creating new unique game case from menu...');

      // Generate unique case ID
      const timestamp = Date.now();
      const caseId = `case-${new Date().toISOString().split('T')[0]}-${timestamp}`;

      // Call the post creation function via HTTP
      const response = await fetch('/internal/menu/post-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId })
      });

      if (response.ok) {
        context.ui.showToast({ text: '✅ Game created successfully!', appearance: 'success' });
      } else {
        context.ui.showToast({ text: '❌ Failed to create game', appearance: 'neutral' });
      }
    } catch (error) {
      console.error('Menu action error:', error);
      context.ui.showToast({
        text: error instanceof Error ? error.message : 'Unknown error',
        appearance: 'neutral'
      });
    }
  },
});
```

**Why This Works**:
- ✅ Menu action defined in main.tsx runs in Custom Post context
- ✅ Has access to `Devvit.configure({ redditAPI: true })`
- ✅ Moderator check works (Reddit API available)
- ✅ Can still call Express server endpoint for actual game generation

---

### Option B: Remove Moderator Restriction (Quick Fix)

If moderator check isn't critical, change `devvit.json`:

```json
"menu": {
  "items": [{
    "forUserType": "all",  // Changed from "moderator"
    "endpoint": "/internal/menu/post-create"
  }]
}
```

**Pros**: Minimal code changes
**Cons**: Any user can create posts (not just moderators)

---

### Option C: Scheduler Job Bridge (Complex but Robust)

Use scheduler jobs to bridge contexts:

**main.tsx**:
```typescript
Devvit.addSchedulerJob({
  name: 'create-game-post',
  onRun: async (event, context) => {
    const { caseId, title } = event.data;

    // This runs in main context with Reddit API enabled ✅
    await context.reddit.submitCustomPost({
      title,
      subredditName: context.subredditName,
      preview: context.ui.webView({ id: 'preview' }),
    });
  },
});
```

**Server (src/server/index.ts)**:
```typescript
router.post('/internal/menu/post-create', async (_req, res) => {
  // Trigger scheduler job instead of calling reddit.submitCustomPost directly
  await context.scheduler.runJob({
    name: 'create-game-post',
    data: { caseId, title },
    runAt: new Date(),
  });

  res.json({ success: true });
});
```

**Pros**: Clean separation of concerns
**Cons**: More complex, async execution

---

## 🚀 Implementation Steps (Option A - Recommended)

### Step 1: Edit src/main.tsx

Add after `Devvit.configure()`:

```typescript
Devvit.addMenuItem({
  label: 'Create a new post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    try {
      const response = await fetch('/internal/menu/post-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: `case-${Date.now()}`
        })
      });

      const data = await response.json();

      if (response.ok && data.showToast) {
        context.ui.showToast(data.showToast);
      } else {
        context.ui.showToast({
          text: '✅ Game post created!',
          appearance: 'success'
        });
      }
    } catch (error) {
      console.error('Menu action error:', error);
      context.ui.showToast({
        text: 'Failed to create post',
        appearance: 'neutral'
      });
    }
  },
});
```

### Step 2: Edit devvit.json

Remove the menu action definition:

```json
{
  "menu": {
    "items": [
      // Remove the "Create a new post" item - now defined in main.tsx
      {
        "label": "🧪 Test Media Upload API",
        "description": "Run validation tests for context.media.upload()",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/test-media-upload"
      }
    ]
  }
}
```

### Step 3: Rebuild

```bash
npm run build
```

### Step 4: Upload

```bash
devvit upload
```

### Step 5: Test

1. Go to https://www.reddit.com/r/armchair_sleuths_dev
2. Look for menu option "Create a new post"
3. Click it
4. **Expected**: ✅ Game created successfully (no Reddit API error)

---

## 📊 Verification Checklist

After implementing the fix:

- [ ] Build succeeds without errors
- [ ] Upload succeeds (no permission errors)
- [ ] Menu action appears in subreddit menu
- [ ] Clicking menu action shows "Creating..." indicator
- [ ] No "Reddit API is not enabled" error in logs
- [ ] Game case generated successfully
- [ ] Post created in subreddit
- [ ] Toast message shows success

---

## 🎓 Technical Insights

### Why This Issue Occurred

**Devvit Architecture**:
```
┌─────────────────────────────────────────────────────────┐
│  Devvit Runtime                                         │
│                                                          │
│  ┌──────────────────────┐      ┌──────────────────────┐│
│  │  Custom Post         │      │  Express Server      ││
│  │  (main.tsx)          │      │  (server/index.ts)   ││
│  │                      │      │                      ││
│  │  Devvit.configure({  │      │  NO configuration    ││
│  │    redditAPI: true   │      │  menu handlers here  ││
│  │  })                  │      │  ❌ Reddit API fails ││
│  │                      │      │                      ││
│  │  ✅ Reddit API works │      │                      ││
│  └──────────────────────┘      └──────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Menu Action Execution**:
- **Declarative** (devvit.json): Runs in server/middleware context
- **Imperative** (main.tsx): Runs in Custom Post context with config

### Key Learnings

1. **Two Execution Contexts**: Custom Post and Express server are separate
2. **Configuration Scope**: `Devvit.configure()` only applies to its own file's context
3. **Menu Actions**: Imperative definitions inherit configuration, declarative don't
4. **Permissions Field**: Limited to specific properties (media, etc.), NOT redditAPI

---

## 📚 Related Documentation

Created during investigation:
- `DEVVIT_ARCHITECTURE_ANALYSIS.md` (backend-architect)
- `DEVVIT_FIX_IMPLEMENTATION.md` (backend-architect)
- `FRONTEND_ARCHITECTURE_ANALYSIS.md` (frontend-architect)
- `DEVVIT_MENU_ACTION_API_DIAGNOSIS.md` (frontend-architect)
- `ROOT_CAUSE_ANALYSIS_DEVVIT_CONFIG.md` (root-cause-analyst)

Official Devvit docs:
- [Menu Actions](https://developers.reddit.com/docs/menu_actions)
- [Custom Posts](https://developers.reddit.com/docs/custom_posts)
- [Configuration](https://developers.reddit.com/docs/configuration)

---

## ✅ Status

**Current State**:
- ❌ Reddit API error still occurs with declarative menu actions
- ✅ Solution identified and documented
- ⏳ Waiting for implementation of Option A (imperative menu actions)

**Next Action**:
Implement Option A fix in src/main.tsx and remove declarative menu action from devvit.json.

**Expected Result**:
Menu action will successfully create game posts without Reddit API errors.

---

**Document Created**: 2025-10-25
**Analysis By**: root-cause-analyst, debugger, backend-architect, frontend-architect
**Compiled By**: Claude Code
