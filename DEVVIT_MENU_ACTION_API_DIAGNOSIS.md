# Devvit Menu Action "Reddit API Not Enabled" - Root Cause Analysis

**Date**: 2025-10-25
**Issue**: Menu action `/internal/menu/post-create` triggers "Reddit API is not enabled" error
**Status**: ✅ DIAGNOSED - Architecture Mismatch

---

## Executive Summary

The "Reddit API is not enabled" error occurs because **menu actions and Custom Posts run in DIFFERENT execution contexts** in Devvit architecture. The `Devvit.configure({ redditAPI: true })` in `main.tsx` ONLY applies to Custom Post rendering, NOT to Express server routes.

### Critical Finding

```
❌ WRONG ASSUMPTION:
   main.tsx Devvit.configure() → Applies globally

✅ ACTUAL BEHAVIOR:
   main.tsx Devvit.configure() → Only for Custom Post render() function
   Express routes in src/server/index.ts → Need separate configuration
```

---

## Architecture Analysis

### 1. **Two Separate Runtime Contexts**

#### Context A: Custom Post (main.tsx)
- **File**: `src/main.tsx`
- **Runtime**: Devvit Blocks renderer (client-side execution)
- **Purpose**: Renders the game UI using Blocks API
- **Configuration**:
  ```typescript
  Devvit.configure({
    redis: true,
    http: true,
    redditAPI: true  // ✅ Only applies to Custom Post
  });
  ```
- **Scope**: ONLY the `render()` function in `Devvit.addCustomPostType()`

#### Context B: Express Server (src/server/index.ts)
- **File**: `src/server/index.ts`
- **Runtime**: Express HTTP server (server-side execution)
- **Purpose**: Handles API routes and menu actions
- **Configuration**: ❌ **NONE** - Uses imported contexts directly
- **Scope**: All Express routes including `/internal/menu/*`

---

## 2. **Menu Action Execution Flow**

### Current Implementation (BROKEN)
```
User clicks "Create a new post" (devvit.json menu)
  ↓
Devvit runtime routes to: /internal/menu/post-create
  ↓
Express handler in src/server/index.ts (line 150)
  ↓
Calls createPost() → Uses reddit.submitCustomPost() (line 43)
  ↓
❌ ERROR: "Reddit API is not enabled"
  ↓
Reason: Express server context has NO Devvit.configure()
```

### Where Reddit API is Used
- **Line 216** (`src/server/index.ts`): `await createPost({ ... })`
- **Line 43** (`src/server/core/post.ts`): `await reddit.submitCustomPost(payload)`

The `reddit` object from `@devvit/web/server` requires explicit permission configuration.

---

## 3. **Configuration Scope Verification**

### devvit.json Configuration
```json
{
  "permissions": {
    "media": true  // ✅ Only media enabled
    // ❌ Missing: redditAPI: true
  }
}
```

**Problem**: `devvit.json` does NOT have `redditAPI` permission enabled.

### main.tsx Configuration (Custom Post ONLY)
```typescript
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true  // ✅ Works for Custom Post context.reddit
});
```

**Scope**: This configuration is ISOLATED to the Custom Post rendering context.
**Does NOT apply to**: Express server routes, menu actions, triggers.

---

## 4. **Why Menu Actions are Different**

### Custom Post vs Menu Action Execution

| Aspect | Custom Post | Menu Action |
|--------|-------------|-------------|
| **Entry Point** | `main.tsx` → `addCustomPostType()` | `devvit.json` → Express route |
| **Runtime** | Blocks renderer | Express HTTP server |
| **Context** | `context` from render function | `context` from `@devvit/web/server` |
| **Configuration** | `Devvit.configure()` applies | `Devvit.configure()` DOES NOT apply |
| **Reddit API** | ✅ Enabled via config | ❌ Not enabled (no config) |

### Menu Action Handler Location
```typescript
// src/server/index.ts:150
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  // This runs in Express context, NOT Custom Post context
  // Devvit.configure() from main.tsx does NOT apply here

  const post = await createPost({  // ← Uses reddit.submitCustomPost()
    caseId: newCase.id,
    title: postTitle,
    subredditName: context.subredditName
  });
});
```

---

## 5. **Evidence from Codebase**

### Import Analysis
```typescript
// src/server/index.ts:3
import { redis, reddit, createServer, context, getServerPort, settings }
  from '@devvit/web/server';
```

These imported objects (`redis`, `reddit`) are **separate instances** from the Custom Post context.

### Custom Post Context (Working)
```typescript
// main.tsx:280-283
const user = await context.reddit.getCurrentUser();
// ✅ This WORKS because Devvit.configure({ redditAPI: true })
//    was called in main.tsx for Custom Post scope
```

### Express Server Context (Broken)
```typescript
// src/server/core/post.ts:43
const result = await reddit.submitCustomPost(payload);
// ❌ This FAILS because Express server has no Devvit.configure()
```

---

## Root Cause Summary

### ❌ What's Broken
1. **devvit.json** does NOT enable `redditAPI` permission
2. **main.tsx** `Devvit.configure()` only applies to Custom Post, not Express server
3. **Express server routes** (including menu actions) have NO configuration
4. **Menu action handler** tries to use `reddit.submitCustomPost()` without permission

### ✅ What Works
- Custom Post rendering (`main.tsx`) CAN use Reddit API
- Custom Post `context.reddit.getCurrentUser()` works (line 281)
- Express server CAN use `redis`, `settings` (no special permission needed)

---

## Solution Options

### Option 1: Enable redditAPI in devvit.json (RECOMMENDED)
```json
{
  "permissions": {
    "media": true,
    "redditAPI": true  // ← Add this
  }
}
```

**Pros**:
- Clean declarative configuration
- Applies to ALL runtime contexts (Custom Post + Express)
- Standard Devvit pattern

**Cons**:
- Requires app re-upload and reinstall

---

### Option 2: Move menu action logic to main.tsx
```typescript
// main.tsx
Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Create a new post',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    // This context HAS redditAPI enabled
    const post = await context.reddit.submitCustomPost({ ... });
  }
});
```

**Pros**:
- Uses existing Custom Post configuration
- No devvit.json changes needed

**Cons**:
- Cannot use Express routes for complex logic
- Limited to Devvit API (no Gemini client, no case generation)
- Menu actions in devvit.json won't work

---

### Option 3: Hybrid - Use Devvit triggers instead of menu
```typescript
// main.tsx
Devvit.addTrigger({
  event: 'PostSubmit',
  onEvent: async (event, context) => {
    // Trigger-based post creation with redditAPI enabled
  }
});
```

**Pros**:
- Automated workflow
- Has access to configured permissions

**Cons**:
- Not user-initiated (different UX)
- Requires changing from menu action to trigger pattern

---

## Recommended Fix

### Step 1: Update devvit.json
```json
{
  "permissions": {
    "media": true,
    "redditAPI": true  // ← ADD THIS
  },
  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "description": "armchair-sleuths",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/post-create"
      }
    ]
  }
}
```

### Step 2: Verify Express route has access
```typescript
// src/server/index.ts:150
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    // reddit object will now have permissions enabled
    const post = await createPost({ ... });

    res.json({
      navigateTo: post,
    });
  } catch (error) {
    console.error('Menu action error:', error);
    res.json({
      showToast: {
        text: error.message,
        appearance: 'neutral'
      }
    });
  }
});
```

### Step 3: Rebuild and reinstall
```bash
npm run build
devvit upload
devvit install <subreddit>
```

---

## Verification Checklist

- [ ] `devvit.json` has `"redditAPI": true` in permissions
- [ ] App rebuilt after configuration change
- [ ] App re-uploaded to Reddit
- [ ] App reinstalled on test subreddit
- [ ] Menu action "Create a new post" works without error
- [ ] `context.reddit.submitCustomPost()` succeeds in menu handler

---

## Architecture Recommendations

### Current Architecture (Problematic)
```
main.tsx (Custom Post)  ← Has Devvit.configure()
  ↓
src/server/index.ts (Express)  ← NO configuration
  ↓
Calls reddit API  ← FAILS
```

### Fixed Architecture
```
devvit.json  ← Global permissions configuration
  ↓
main.tsx (Custom Post)  ← Can use reddit API
  ↓
src/server/index.ts (Express)  ← Can use reddit API
  ↓
Calls reddit API  ← SUCCEEDS
```

---

## Key Takeaways

1. **`Devvit.configure()` is context-specific**, not global
2. **devvit.json `permissions`** is the global configuration mechanism
3. **Menu actions run in Express context**, separate from Custom Post
4. **Express server needs explicit permissions** via devvit.json
5. **Always rebuild + re-upload + reinstall** after permission changes

---

## References

- **devvit.json**: `C:\Users\hpcra\armchair-sleuths\devvit.json`
- **main.tsx**: `C:\Users\hpcra\armchair-sleuths\src\main.tsx` (line 4-8)
- **Menu handler**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts` (line 150-252)
- **createPost**: `C:\Users\hpcra\armchair-sleuths\src\server\core\post.ts` (line 43)

---

**Next Steps**: Implement Option 1 (devvit.json permission) and test.
