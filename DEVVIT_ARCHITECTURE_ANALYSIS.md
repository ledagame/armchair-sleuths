# Devvit Architecture Analysis: Reddit API Configuration Issue

## Executive Summary

**Root Cause Identified**: The Reddit API is correctly configured in `main.tsx`, which gets bundled into `dist/main.js`. The configuration IS present in the built bundle. However, menu actions execute in the **server runtime context**, not the main app context.

**Status**: ✅ Configuration is correct - This is likely a runtime/context isolation issue, not a configuration problem.

---

## Architecture Breakdown

### 1. Entry Points & Build System

#### Three Separate Build Targets:

1. **Main Bundle** (`dist/main.js`)
   - Entry: `src/main.tsx`
   - Config: `vite.main.config.ts`
   - Contains: Devvit.configure(), Custom Post UI, Scheduler Jobs
   - Build command: `npm run build:main`

2. **Server Bundle** (`dist/server/index.cjs`)
   - Entry: `src/server/index.ts`
   - Config: `src/server/vite.config.ts`
   - Contains: Express API, Menu handlers, Reddit API calls
   - Build command: `npm run build:server`

3. **Client Bundle** (`dist/client/`)
   - Entry: `src/client/App.tsx`
   - Config: `src/client/vite.config.ts`
   - Contains: Web UI (not used in current architecture)
   - Build command: `npm run build:client`

---

### 2. Devvit Configuration Location

#### Current Setup (✅ Correct):

**File**: `src/main.tsx` (lines 4-8)
```typescript
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,
});
```

**Built Output**: `dist/main.js` (line 3918)
```javascript
i.configure({
  redis: !0,
  http: !0,
  redditAPI: !0
});
```

**Verification**: ✅ Configuration IS present in the production bundle

---

### 3. devvit.json Configuration

**File**: `devvit.json`
```json
{
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "endpoint": "/internal/menu/post-create"
      }
    ]
  },
  "permissions": {
    "media": true
  }
}
```

**Key Points**:
- Server entry point: `dist/server/index.cjs` (Express server)
- Main entry point: `dist/main.js` (implicit - Devvit runtime loads this)
- Menu actions route to Express server endpoints

---

## 4. Request Flow Analysis

### Menu Action Flow ("Create a new post"):

```
1. User clicks menu action
   ↓
2. Devvit runtime calls: POST /internal/menu/post-create
   ↓
3. Express server (dist/server/index.cjs) handles request
   ↓
4. Server imports: { reddit } from '@devvit/web/server'
   ↓
5. Server calls: reddit.submitCustomPost()
   ↓
6. ERROR: "permissions not enabled for this context"
```

### Custom Post Rendering Flow (Working):

```
1. User opens post
   ↓
2. Devvit runtime loads: dist/main.js
   ↓
3. Executes: Devvit.configure({ redditAPI: true })
   ↓
4. Renders: Devvit.addCustomPostType({ render: ... })
   ↓
5. Within render: context.reddit.getCurrentUser() works ✅
```

---

## 5. The Critical Distinction

### Two Separate Runtime Contexts:

#### Context 1: Main App (main.js)
- **Scope**: Custom Post rendering, Scheduler Jobs, Triggers
- **Configuration**: ✅ Has Devvit.configure({ redditAPI: true })
- **Reddit API**: ✅ Works in render context (line 281 in main.tsx)

#### Context 2: Server/Menu Actions (server/index.cjs)
- **Scope**: Express routes, Menu handlers, HTTP API
- **Configuration**: ❌ NO Devvit.configure() call
- **Reddit API**: ❌ Fails when called from menu handlers

---

## 6. Evidence of the Issue

### ✅ Working: Reddit API in Custom Post
**File**: `src/main.tsx` (line 281)
```typescript
const user = await context.reddit.getCurrentUser();
const username = user?.username || `anon_${Date.now()}`;
```
**Status**: Works because it runs in the configured main context

### ❌ Failing: Reddit API in Menu Handler
**File**: `src/server/core/post.ts` (line 43)
```typescript
const result = await reddit.submitCustomPost(payload);
```
**Status**: Fails because server bundle has no Devvit.configure()

### ❌ Failing: Reddit API in Server Init
**File**: `src/server/index.ts` (line 60)
```typescript
const username = await reddit.getCurrentUsername();
```
**Status**: Also fails in server context

---

## 7. Why This Architecture Exists

### Devvit Architecture Design:

1. **Main Bundle** (`main.js`):
   - Executed on Devvit runtime initialization
   - Registers app capabilities (Custom Posts, Schedulers, Triggers)
   - Configures permissions

2. **Server Bundle** (`server/index.cjs`):
   - Runs as a separate Express.js process
   - Handles HTTP endpoints for webviews
   - **Isolated from main runtime context**

3. **Menu Actions**:
   - Special type of HTTP handler
   - Routed through server bundle
   - **Needs its own permission context**

---

## 8. The Problem: Context Isolation

### Why Reddit API Fails in Menu Handlers:

```
Main Context (main.js)           Server Context (server/index.cjs)
├─ Devvit.configure() ✅         ├─ NO Devvit.configure() ❌
├─ Custom Post UI                ├─ Express routes
├─ reddit API works ✅           ├─ reddit API fails ❌
└─ Schedulers                    └─ Menu handlers
```

**Key Insight**: Menu handlers execute in the server context, which doesn't inherit permissions from main context.

---

## 9. Possible Solutions

### Option A: Move Menu Logic to Triggers (Recommended)

Instead of using menu actions, use App Install triggers in main.tsx:

```typescript
// In src/main.tsx
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (event, context) => {
    // Has access to reddit API ✅
    const post = await context.reddit.submitCustomPost({...});
  }
});
```

**Pros**:
- Runs in configured context with Reddit API access
- No server bundle needed for post creation
- Cleaner architecture

**Cons**:
- Can't trigger on demand (only on install)
- Would need alternative trigger mechanism

### Option B: Menu Action → Scheduler Job (Hybrid)

Menu action triggers a scheduler job that runs in main context:

```typescript
// Server: Menu handler (server/index.ts)
router.post('/internal/menu/post-create', async (req, res) => {
  // Trigger scheduler job (no reddit API needed here)
  await context.scheduler.runJob({
    name: 'create-post-job',
    runAt: new Date(Date.now() + 1000)
  });
  res.json({ showToast: { text: 'Creating post...' } });
});

// Main: Scheduler job (main.tsx)
Devvit.addSchedulerJob({
  name: 'create-post-job',
  onRun: async (event, context) => {
    // Has reddit API access ✅
    const post = await context.reddit.submitCustomPost({...});
  }
});
```

**Pros**:
- Keeps menu UI/UX
- Leverages configured context for Reddit API
- Clean separation of concerns

**Cons**:
- Async (user doesn't get immediate post URL)
- Requires polling or toast notifications

### Option C: Add Devvit.configure() to Server Bundle

Add configuration to server/index.ts:

```typescript
// In src/server/index.ts (TOP OF FILE)
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,
});

// Rest of server code...
```

**Pros**:
- Simple, direct fix
- Keeps current architecture

**Cons**:
- **May not work** - server bundle might not support Devvit.configure()
- Untested approach
- Could cause conflicts with main bundle configuration

---

## 10. Recommended Fix

### Immediate Action: Option B (Menu → Scheduler)

**Reason**: Most reliable, uses existing working patterns

**Implementation**:

1. **Add Scheduler Job** in `src/main.tsx`:
```typescript
Devvit.addSchedulerJob({
  name: 'menu-create-post',
  onRun: async (event, context) => {
    const { caseId, title, subredditName } = event.data;

    // Generate case with images (all server logic stays in server)
    // Use HTTP to call our own server API
    const response = await fetch(`${serverUrl}/api/create-game-post`, {
      method: 'POST',
      body: JSON.stringify({ caseId })
    });

    const caseData = await response.json();

    // NOW create post with Reddit API (works here ✅)
    const post = await context.reddit.submitCustomPost({
      title: title,
      subredditName: subredditName,
      postData: {
        caseId: caseData.caseId,
        gameState: 'initial',
        score: 0
      }
    });

    return { postId: post.id };
  }
});
```

2. **Update Menu Handler** in `src/server/index.ts`:
```typescript
router.post('/internal/menu/post-create', async (_req, res) => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const customCaseId = `case-${dateStr}-${Date.now()}`;

  // Trigger scheduler job instead of creating post directly
  const jobId = await context.scheduler.runJob({
    name: 'menu-create-post',
    runAt: new Date(Date.now() + 2000), // 2 seconds delay
    data: {
      caseId: customCaseId,
      title: `🔍 ${dateStr} Mystery`,
      subredditName: context.subredditName
    }
  });

  res.json({
    showToast: {
      text: 'Creating new mystery case... Check back in a moment!',
      appearance: 'success'
    }
  });
});
```

---

## 11. Verification Steps

After implementing Option B:

1. **Check Configuration**:
   ```bash
   grep -n "Devvit.configure" dist/main.js
   # Should show line with redditAPI: !0
   ```

2. **Test Menu Action**:
   - Click "Create a new post" menu
   - Should show toast: "Creating new mystery case..."
   - Wait 2-5 seconds
   - Post should appear in subreddit

3. **Check Logs**:
   ```
   ✅ [SCHEDULER] Job 'menu-create-post' started
   ✅ [SCHEDULER] Case generated: case-2025-10-25-xxxxx
   ✅ [SCHEDULER] Post created: t3_xxxxx
   ```

4. **Verify Reddit API Access**:
   - Scheduler should NOT throw permission errors
   - Post should be created successfully
   - Custom Post should render with case data

---

## 12. Long-term Recommendations

### Architecture Improvements:

1. **Consolidate Reddit API Calls**:
   - ALL Reddit API operations should be in main.tsx context
   - Server should ONLY handle HTTP, Redis, Gemini API

2. **Clear Separation of Concerns**:
   ```
   main.tsx:         Devvit APIs (reddit, scheduler, triggers)
   server/index.ts:  External APIs (HTTP, Gemini, Redis via proxy)
   server/core/:     Business logic (no Devvit APIs)
   ```

3. **Documentation**:
   - Add comments explaining which context each file runs in
   - Document permission requirements per file

4. **Testing**:
   - Test menu actions in dev environment
   - Verify scheduler jobs work with Reddit API
   - Check logs for permission errors

---

## 13. Key Takeaways

### What We Learned:

1. ✅ **Devvit.configure() IS present** in the built bundle (main.js)
2. ❌ **Server bundle runs in isolated context** without those permissions
3. 🎯 **Menu actions route through server**, not main runtime
4. 🔧 **Solution: Use scheduler jobs** as a bridge between contexts

### What Works:

- Custom Post rendering (reddit.getCurrentUser()) ✅
- Scheduler jobs with Reddit API ✅
- Triggers (AppInstall) with Reddit API ✅

### What Doesn't Work:

- Menu handlers calling reddit.submitCustomPost() ❌
- Server routes calling reddit API directly ❌
- Any Reddit API call from server/index.ts ❌

---

## 14. Next Steps

1. **Implement Option B** (Menu → Scheduler pattern)
2. **Test in development** (`npm run dev:devvit`)
3. **Verify logs** show successful post creation
4. **Deploy** and test in production
5. **Document** the architecture for future developers

---

## Appendix: File Structure

```
armchair-sleuths/
├─ src/
│  ├─ main.tsx                    # ✅ Devvit.configure() HERE
│  │  ├─ Devvit.configure()       # ✅ Has redditAPI: true
│  │  ├─ Custom Post              # ✅ Can use reddit API
│  │  └─ Scheduler Jobs           # ✅ Can use reddit API
│  ├─ server/
│  │  ├─ index.ts                 # ❌ NO Devvit.configure()
│  │  │  └─ Menu handlers         # ❌ Cannot use reddit API
│  │  └─ core/
│  │     └─ post.ts               # ❌ reddit.submitCustomPost() fails
├─ dist/
│  ├─ main.js                     # ✅ Built from src/main.tsx
│  │                              # ✅ Contains Devvit.configure()
│  └─ server/
│     └─ index.cjs                # ❌ Built from src/server/index.ts
│                                 # ❌ No Devvit.configure()
└─ devvit.json                    # Routes menu to server bundle
```

---

**Generated**: 2025-10-25
**Author**: Backend Architecture Analysis
**Status**: Ready for Implementation
