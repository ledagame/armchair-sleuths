# Devvit Web Framework: Reddit API Access Comprehensive Analysis

**Date**: 2025-10-26
**Issue**: Menu action "Create a new post" disappeared after troubleshooting Reddit API error
**Architecture**: Devvit Web Framework (NOT standard Devvit)
**Status**: ✅ ROOT CAUSE IDENTIFIED + SOLUTION PROVIDED

---

## Executive Summary

### The Problem Chain
1. **Original Issue**: Menu action worked but triggered `Error: Reddit API is not enabled`
2. **Failed Fix Attempt**: Moved menu action to imperative style (`Devvit.addMenuItem()`) → Menu disappeared entirely
3. **Current State**: Restored declarative menu action (devvit.json) but Reddit API error persists

### Root Cause Discovery
The Devvit Web Framework has **TWO COMPLETELY SEPARATE EXECUTION CONTEXTS**:

```
┌─────────────────────────────────────────────────────────────┐
│ Context A: Custom Post (main.tsx)                          │
├─────────────────────────────────────────────────────────────┤
│ • Has: Devvit.configure({ redditAPI: true }) ✅            │
│ • Runtime: Devvit Blocks renderer                          │
│ • Purpose: Render game UI                                  │
│ • Reddit API: AVAILABLE via context.reddit                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Context B: Express Server (src/server/index.ts)            │
├─────────────────────────────────────────────────────────────┤
│ • Has: NO Devvit.configure() ❌                            │
│ • Runtime: Express HTTP server                             │
│ • Purpose: Handle API routes + menu actions                │
│ • Reddit API: NOT AVAILABLE (imports reddit from package)  │
└─────────────────────────────────────────────────────────────┘
```

**Critical Finding**: `Devvit.configure()` in main.tsx ONLY applies to Custom Post context, NOT to Express server routes.

---

## Question 1: Why Does the Reddit API Error Occur?

### Execution Flow Analysis

```typescript
// devvit.json (Declarative Menu Action)
{
  "menu": {
    "items": [{
      "label": "Create a new post",
      "location": "subreddit",
      "forUserType": "moderator",
      "endpoint": "/internal/menu/post-create"  // ← Routes to Express server
    }]
  }
}
```

**When user clicks menu action:**

```
User clicks "Create a new post"
  ↓
Devvit runtime routes to: POST /internal/menu/post-create
  ↓
CONTEXT SWITCH: Enters Express server context ⚠️
  ↓
src/server/index.ts:150 - Menu action handler executes
  ↓
Calls: createPost({ caseId, title, subredditName })
  ↓
src/server/core/post.ts:43 - await reddit.submitCustomPost(payload)
  ↓
❌ ERROR: "Reddit API is not enabled. You can enable it by passing redditAPI: true to Devvit.configure"
```

### Why the Error Occurs

**Line 1 (src/server/index.ts)**:
```typescript
import { redis, reddit, createServer, context, getServerPort, settings }
  from '@devvit/web/server';
```

**Line 43 (src/server/core/post.ts)**:
```typescript
const result = await reddit.submitCustomPost(payload);
```

**The Issue**:
- The `reddit` object imported from `@devvit/web/server` is a **separate instance** from the Custom Post context
- This instance has NO configuration applied to it
- `Devvit.configure({ redditAPI: true })` in main.tsx does NOT propagate to the Express server

**Verification**:
```typescript
// main.tsx - Line 4-8 (Custom Post Context)
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,  // ✅ ONLY applies to Custom Post's context.reddit
});

// src/server/index.ts (Express Server Context)
// ❌ NO Devvit.configure() call anywhere in this file
// The imported 'reddit' object has no configuration
```

---

## Question 2: How Do Web Framework Apps Handle Reddit API Access?

### Architecture Comparison

#### Standard Devvit App (Single Context)
```typescript
// main.ts
Devvit.configure({
  redditAPI: true  // Applies globally
});

Devvit.addMenuItem({
  location: 'subreddit',
  onPress: async (event, context) => {
    // context.reddit is available ✅
    await context.reddit.submitPost({ ... });
  }
});
```

#### Web Framework App (Dual Context)
```typescript
// src/main.tsx (Custom Post)
Devvit.configure({
  redditAPI: true  // Only for Custom Post render()
});

Devvit.addCustomPostType({
  render: (context) => {
    // context.reddit is available ✅
    context.reddit.getCurrentUser();
  }
});

// src/server/index.ts (Express Server)
import { reddit } from '@devvit/web/server';

router.post('/internal/menu/post-create', async (_req, res) => {
  // reddit from package import - NO CONFIG ❌
  await reddit.submitCustomPost({ ... });  // FAILS
});
```

### Web Framework-Specific Patterns

**1. Server Configuration is Separate**

In Web Framework apps, the Express server runs independently and requires its own configuration. The `@devvit/web/server` package provides context objects, but they are NOT configured by `Devvit.configure()` from main.tsx.

**2. Menu Actions Route to Express**

Declarative menu actions in `devvit.json` with `endpoint` property route directly to the Express server:

```json
{
  "endpoint": "/internal/menu/post-create"
  // ↑ This bypasses main.tsx entirely
}
```

**3. No Server-Side Reddit API in Standard Pattern**

The Web Framework documentation doesn't show direct `reddit.submitCustomPost()` usage in Express routes. This suggests it's NOT the intended pattern.

---

## Question 3: What's the Proper Fix?

### Solution Analysis: 3 Options

#### ❌ OPTION A: Add Devvit.configure() to Server (INVALID)

```typescript
// src/server/index.ts
import Devvit from '@devvit/public-api';

Devvit.configure({
  redditAPI: true
});
```

**Why This Doesn't Work**:
- Server bundles use `@devvit/web/server`, not `@devvit/public-api`
- The bundler separates client and server builds (`dist/client`, `dist/server`)
- Server context doesn't execute Devvit.configure() lifecycle

**Tested**: Previous documentation shows this was attempted and failed

---

#### ❌ OPTION B: Add redditAPI to devvit.json permissions (INVALID)

```json
{
  "permissions": {
    "media": true,
    "redditAPI": true  // ❌ NOT VALID
  }
}
```

**Error**: `permissions is not allowed to have the additional property "redditAPI"`

The `permissions` field only supports: `media`, `websocket` (per schema)

---

#### ✅ OPTION C: Scheduler Job Bridge (RECOMMENDED)

**Pattern**: Use scheduler jobs to execute Reddit API calls in main.tsx context

**Step 1**: Define scheduler job in main.tsx (has Reddit API access)

```typescript
// src/main.tsx
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,  // ✅ Available to scheduler jobs
});

// Scheduler job runs in main.tsx context with Reddit API
Devvit.addSchedulerJob({
  name: 'create-game-post-job',
  onRun: async (event, context) => {
    const { caseId, title, subredditName } = event.data;

    console.log('🎮 [Scheduler] Creating game post...');
    console.log(`   Case ID: ${caseId}`);
    console.log(`   Title: ${title}`);

    // ✅ context.reddit IS available here (main.tsx context)
    const post = await context.reddit.submitCustomPost({
      title,
      subredditName,
      preview: {
        // Custom Post preview
        gameState: 'initial',
        score: 0,
        caseId: caseId,
      },
    });

    console.log(`✅ [Scheduler] Post created: ${post.id}`);

    return {
      success: true,
      postId: post.id,
      postUrl: post.url,
    };
  },
});
```

**Step 2**: Trigger scheduler job from Express menu action

```typescript
// src/server/index.ts
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new unique game case from menu...');

    // 1. Generate case (existing logic)
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.json({
        showToast: {
          text: 'Gemini API key not configured',
          appearance: 'neutral'
        }
      });
      return;
    }

    const now = new Date();
    const timestamp = Date.now();
    const customCaseId = `case-${now.toISOString().split('T')[0]}-${timestamp}`;

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const newCase = await caseGenerator.generateCase({
      date: now,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8,
      customCaseId: customCaseId
    });

    console.log(`✅ Case generated: ${newCase.id}`);

    // 2. Trigger scheduler job for post creation (instead of direct reddit.submitCustomPost)
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${now.toISOString().split('T')[0]} 미스터리 | 용의자: ${suspectNames}`;

    console.log(`📮 Triggering scheduler job to create post: ${postTitle}`);

    // Schedule job to run immediately (in main.tsx context)
    const jobId = await context.scheduler.runJob({
      name: 'create-game-post-job',
      runAt: new Date(Date.now() + 1000), // Run in 1 second
      data: {
        caseId: newCase.id,
        title: postTitle,
        subredditName: context.subredditName,
      },
    });

    console.log(`✅ Scheduler job triggered: ${jobId}`);

    // 3. Return success (note: post creation is async via scheduler)
    res.json({
      showToast: {
        text: '🎮 Game case generated! Post being created...',
        appearance: 'success'
      }
    });

  } catch (error) {
    console.error(`❌ [menu/post-create] Error:`, error);
    res.json({
      showToast: {
        text: error instanceof Error ? error.message : 'Failed to create post',
        appearance: 'neutral'
      }
    });
  }
});
```

**Why This Works**:
- ✅ Scheduler jobs defined in main.tsx have access to `Devvit.configure({ redditAPI: true })`
- ✅ Express server CAN trigger scheduler jobs (this is supported)
- ✅ Clean separation: Server generates case, main.tsx creates post
- ✅ Async execution is fine (menu actions support async workflows)

**Trade-off**:
- Post creation is asynchronous (slight delay)
- User gets toast notification immediately, but post appears 1-2 seconds later
- This matches Reddit's actual post creation latency anyway

---

#### ⚠️ OPTION D: Remove Moderator Restriction (QUICK BUT INSECURE)

```json
// devvit.json
{
  "menu": {
    "items": [{
      "label": "Create a new post",
      "location": "subreddit",
      "forUserType": "all",  // Changed from "moderator"
      "endpoint": "/internal/menu/post-create"
    }]
  }
}
```

**Why This "Works"**:
- Moderator check requires Reddit API access to verify user role
- Changing to `"all"` bypasses the moderator check
- No Reddit API call needed until post creation

**Why This is NOT Recommended**:
- ❌ Security issue: Any user can create game posts
- ❌ Doesn't fix the underlying Reddit API access issue
- ❌ reddit.submitCustomPost() will still fail with same error

---

## Question 4: Why Don't Imperative Menu Actions Show in UI?

### The Mystery: Imperative Menu Actions Not Rendering

**Your Attempt**:
```typescript
// src/main.tsx
Devvit.addMenuItem({
  label: 'Create a new post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    // ... handler code
  },
});
```

**Result**: Menu action disappeared from UI

### Root Cause Analysis

**1. Build System Architecture**

Devvit Web Framework uses a **dual-bundle system**:

```
npm run build
  ↓
├── build:client (src/client → dist/client)
├── build:server (src/server → dist/server)
└── build:main   (src/main.tsx → dist/main.js)
```

**The Issue**:
```typescript
// package.json - Line 12-13
"build:main": "vite build --config vite.main.config.ts",
"build": "npm run build:client && npm run build:server && npm run build:main",
```

The `dist/main.js` bundle is built separately and may not include imperative menu actions properly.

**2. Execution Timing Issue**

```
Devvit Platform Startup:
  1. Load devvit.json (declarative config) ✅
  2. Load dist/main.js (Custom Post registration) ⏱️
  3. Load dist/server/index.cjs (Express routes) ⏱️
  4. Register menu actions from devvit.json ✅
  5. Register menu actions from Devvit.addMenuItem() ❓
```

**Hypothesis**: Imperative menu actions (`Devvit.addMenuItem()`) registered in main.tsx may execute:
- Too late (after menu UI is rendered)
- In wrong context (Custom Post context doesn't control subreddit menu)
- Not at all (build system strips them out)

**3. Web Framework Limitation**

Standard Devvit apps have a single entry point (main.ts), but Web Framework apps split into:
- Custom Post (main.tsx) - UI rendering context
- Server (src/server/index.ts) - Request handling context

**The pattern mismatch**:
```typescript
// Standard Devvit (single context) - ✅ Works
Devvit.addMenuItem({
  onPress: async (event, context) => {
    // Runs in same context as configure()
  }
});

// Web Framework (dual context) - ❌ May not work
// main.tsx (Custom Post context)
Devvit.addMenuItem({
  onPress: async (event, context) => {
    // Which context does this run in?
    // Custom Post or Server?
  }
});
```

### Verification Steps to Confirm

**1. Check Built Bundle**:
```bash
# Check if addMenuItem is in dist/main.js
grep -n "addMenuItem" dist/main.js

# Check if it's stripped by bundler
grep -n "Create a new post" dist/main.js
```

**2. Check Platform Logs**:
```bash
devvit logs --app armchair-sleuths
# Look for:
# - "Menu action registered: Create a new post"
# - Or absence of such log
```

**3. Test Different Locations**:
```typescript
// Try registering in different location values
Devvit.addMenuItem({
  label: 'Test Menu',
  location: 'post',     // Instead of 'subreddit'
  onPress: async () => { /* ... */ }
});
```

---

## Comprehensive Solution: Step-by-Step Implementation

### Phase 1: Implement Scheduler Job Bridge (Recommended)

**File 1: Update src/main.tsx**

```typescript
// After Devvit.configure(), add scheduler job
Devvit.addSchedulerJob({
  name: 'create-game-post-job',
  onRun: async (event, context) => {
    const { caseId, title, subredditName } = event.data;

    console.log('🎮 [Scheduler] Creating game post...');
    console.log(`   Case ID: ${caseId}`);
    console.log(`   Title: ${title}`);
    console.log(`   Subreddit: ${subredditName}`);

    try {
      // Create post using Reddit API (available in main.tsx context)
      const post = await context.reddit.submitCustomPost({
        title,
        subredditName,
        preview: (
          <vstack padding="medium" gap="medium">
            <text size="large" weight="bold">🔍 New Mystery Case</text>
            <text size="medium">A new case is ready to investigate!</text>
            <text size="small" color="gray">Case ID: {caseId}</text>
          </vstack>
        ),
      });

      console.log(`✅ [Scheduler] Post created: ${post.id}`);
      console.log(`   URL: ${post.url}`);

      // Store post ID in Redis for reference
      await context.redis.set(`case:${caseId}:postId`, post.id);

      return {
        success: true,
        postId: post.id,
        postUrl: post.url,
      };
    } catch (error) {
      console.error('❌ [Scheduler] Post creation failed:', error);
      throw error;
    }
  },
});
```

**File 2: Update src/server/index.ts**

Replace direct `createPost()` call with scheduler trigger:

```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new unique game case from menu...');

    // 1. Validate API key
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.json({
        showToast: {
          text: 'Gemini API key not configured. Please set it in app settings.',
          appearance: 'neutral'
        }
      });
      return;
    }

    // 2. Generate unique case ID
    const now = new Date();
    const timestamp = Date.now();
    const customCaseId = `case-${now.toISOString().split('T')[0]}-${timestamp}`;

    console.log(`📝 Generating case with ID: ${customCaseId}`);

    // 3. Generate case data
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const newCase = await caseGenerator.generateCase({
      date: now,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8,
      customCaseId: customCaseId
    });

    console.log(`✅ Case generated: ${newCase.id}`);
    console.log(`   - Victim: ${newCase.victim.name}`);
    console.log(`   - Suspects: ${newCase.suspects.map(s => s.name).join(', ')}`);
    console.log(`   - Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);

    // 4. Prepare post data
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${now.toISOString().split('T')[0]} 미스터리 | 용의자: ${suspectNames}`;

    console.log(`📮 Triggering post creation via scheduler: ${postTitle}`);

    // 5. Trigger scheduler job (runs in main.tsx context with Reddit API)
    const jobId = await context.scheduler.runJob({
      name: 'create-game-post-job',
      runAt: new Date(Date.now() + 2000), // Run in 2 seconds
      data: {
        caseId: newCase.id,
        title: postTitle,
        subredditName: context.subredditName || 'armchair_sleuths_dev',
      },
    });

    console.log(`✅ Scheduler job triggered: ${jobId}`);

    // 6. Return success response
    res.json({
      showToast: {
        text: '🎮 Game case generated! Creating post...',
        appearance: 'success'
      }
    });

  } catch (error) {
    console.error(`❌ [menu/post-create] Error:`, error);
    if (error instanceof Error) {
      console.error(`   - Error type: ${error.constructor.name}`);
      console.error(`   - Error message: ${error.message}`);
      console.error(`   - Error stack: ${error.stack}`);
    }

    res.json({
      showToast: {
        text: error instanceof Error ? error.message : 'Failed to create post',
        appearance: 'neutral'
      }
    });
  }
});
```

**File 3: Update devvit.json (Keep Declarative Menu Action)**

```json
{
  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "description": "Generate a new mystery case",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/post-create"
      }
    ]
  }
}
```

### Phase 2: Deploy and Test

```bash
# 1. Build
npm run build

# 2. Upload
devvit upload

# 3. Test on dev subreddit
# - Click menu action "Create a new post"
# - Verify toast: "Game case generated! Creating post..."
# - Wait 2-3 seconds
# - Check if new post appears in subreddit
```

### Phase 3: Monitor and Validate

**Check Logs**:
```bash
devvit logs --app armchair-sleuths --tail
```

**Expected Log Flow**:
```
🎮 Creating new unique game case from menu...
📝 Generating case with ID: case-2025-10-26-1730012345678
✅ Case generated: case-2025-10-26-1730012345678
   - Victim: John Doe
   - Suspects: Alice, Bob, Charlie
   - Images: 3/3
📮 Triggering post creation via scheduler: 🔍 2025-10-26 미스터리 | 용의자: Alice, Bob, Charlie
✅ Scheduler job triggered: job-abc123
🎮 [Scheduler] Creating game post...
   Case ID: case-2025-10-26-1730012345678
   Title: 🔍 2025-10-26 미스터리 | 용의자: Alice, Bob, Charlie
   Subreddit: armchair_sleuths_dev
✅ [Scheduler] Post created: post-xyz789
   URL: https://reddit.com/r/armchair_sleuths_dev/comments/xyz789
```

---

## Technical Deep Dive: Why Scheduler Jobs Work

### Context Inheritance in Devvit

```typescript
// main.tsx
Devvit.configure({
  redditAPI: true  // ← Configuration applied
});

// Scheduler job inherits this configuration
Devvit.addSchedulerJob({
  name: 'my-job',
  onRun: async (event, context) => {
    // context.reddit IS available ✅
    // Inherits redditAPI: true from Devvit.configure()
  }
});
```

### Why This Works vs Direct Server Call

**Direct Server Call (FAILS)**:
```
User Action → Express Route → reddit.submitCustomPost()
                ↑
        No Devvit.configure() context
```

**Scheduler Bridge (WORKS)**:
```
User Action → Express Route → context.scheduler.runJob()
                                        ↓
                              Main.tsx Scheduler Job
                                        ↓
                              context.reddit.submitCustomPost() ✅
                                        ↑
                        Has Devvit.configure({ redditAPI: true })
```

### Devvit Platform Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Devvit Platform Runtime                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │ Main Context     │         │ Server Context   │        │
│  │ (main.tsx)       │         │ (Express)        │        │
│  ├──────────────────┤         ├──────────────────┤        │
│  │ Devvit.configure │         │ No configuration │        │
│  │ Custom Post      │         │ API routes       │        │
│  │ Scheduler Jobs ✅│◄────────┤ Menu actions     │        │
│  │ Triggers         │  bridge  │                  │        │
│  └──────────────────┘         └──────────────────┘        │
│         ↑                                                   │
│         │ Inherits redditAPI: true                        │
│         │                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: The Complete Picture

### Problem Diagnosis

1. **Architecture Mismatch**: Web Framework apps have dual contexts (main.tsx + Express server)
2. **Configuration Scope**: `Devvit.configure()` only applies to the context where it's defined
3. **Menu Action Routing**: Declarative menu actions (`devvit.json`) route to Express server
4. **Missing Bridge**: Express server can't directly access Reddit API without configuration

### Solution Strategy

**Use Scheduler Jobs as Bridge** between contexts:
- Express server generates game case (no Reddit API needed)
- Express triggers scheduler job with case data
- Scheduler job (in main.tsx context) creates Reddit post
- User gets immediate feedback, post appears async

### Implementation Checklist

- [x] Understand dual-context architecture
- [x] Identify Reddit API access issue
- [ ] Add scheduler job to main.tsx
- [ ] Update menu action handler to trigger scheduler
- [ ] Deploy and test
- [ ] Monitor logs to confirm success

### Key Learnings

1. **Web Framework ≠ Standard Devvit**: Different architecture requires different patterns
2. **Context Boundaries**: `Devvit.configure()` is context-specific, not global
3. **Scheduler Jobs**: Powerful tool for bridging contexts in Web Framework apps
4. **Imperative Menu Actions**: May not work reliably in Web Framework (use declarative + scheduler bridge)

---

## Next Steps

1. **Implement scheduler job bridge** (Phase 1 above)
2. **Test thoroughly** on dev subreddit
3. **Document pattern** for future menu actions
4. **Consider**: Extract scheduler job pattern into reusable utility

---

## References

- [Devvit Web Framework Docs](https://developers.reddit.com/docs/web)
- Internal Analysis: `DEVVIT_MENU_ACTION_API_DIAGNOSIS.md`
- Internal Analysis: `REDDIT_API_FIX_FINAL.md`
- Code: `src/main.tsx` (Custom Post + Scheduler Jobs)
- Code: `src/server/index.ts` (Express Routes + Menu Actions)
- Code: `src/server/core/post.ts` (Reddit API Usage)
