# Devvit Architecture Flow Diagram

## Current Architecture (BROKEN)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Devvit Runtime                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────────────┐
                            ▼                             ▼
        ┌───────────────────────────┐      ┌────────────────────────┐
        │   Main Bundle (main.js)   │      │ Server Bundle (CJS)    │
        │                           │      │                        │
        │ Entry: src/main.tsx       │      │ Entry: server/index.ts │
        │                           │      │                        │
        │ ✅ Devvit.configure({    │      │ ❌ NO Devvit.configure│
        │      redditAPI: true      │      │                        │
        │    })                     │      │ Imports:               │
        │                           │      │ - express              │
        │ Contains:                 │      │ - @devvit/web/server   │
        │ - Custom Post UI          │      │                        │
        │ - Scheduler Jobs          │      │ Routes:                │
        │ - App Install Trigger     │      │ - /api/*               │
        │                           │      │ - /internal/menu/*     │
        │ Reddit API: ✅ WORKS     │      │                        │
        │                           │      │ Reddit API: ❌ FAILS   │
        └───────────────────────────┘      └────────────────────────┘
                    │                                    │
                    │                                    │
                    ▼                                    ▼
        ┌───────────────────────┐          ┌────────────────────────┐
        │  Custom Post Render   │          │   Menu Action Handler  │
        │                       │          │                        │
        │ const user = await    │          │ const post = await     │
        │   context.reddit      │          │   reddit.submitCustom  │
        │   .getCurrentUser();  │          │   Post({...});         │
        │                       │          │                        │
        │ ✅ SUCCESS            │          │ ❌ ERROR:              │
        │                       │          │   "permissions not     │
        │                       │          │    enabled for this    │
        │                       │          │    context"            │
        └───────────────────────┘          └────────────────────────┘
```

---

## Fixed Architecture (WORKING)

```
┌─────────────────────────────────────────────────────────────────┐
│                         Devvit Runtime                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ├─────────────────────────────┐
                            ▼                             ▼
        ┌───────────────────────────┐      ┌────────────────────────┐
        │   Main Bundle (main.js)   │      │ Server Bundle (CJS)    │
        │                           │      │                        │
        │ ✅ Devvit.configure({    │      │ (No Reddit API calls)  │
        │      redditAPI: true      │      │                        │
        │    })                     │      │ Handles:               │
        │                           │      │ - Case generation      │
        │ NEW Scheduler Job:        │◄─────┤ - Gemini API           │
        │                           │      │ - Redis storage        │
        │ 'menu-create-post'        │      │ - Trigger scheduler    │
        │   onRun: async (event) => │      │                        │
        │     const post = await    │      │ Menu Handler:          │
        │       context.reddit      │      │   1. Generate case     │
        │       .submitCustomPost() │      │   2. Save to Redis     │
        │                           │      │   3. Trigger scheduler │
        │   ✅ WORKS (has perms)   │      │   4. Return toast      │
        └───────────────────────────┘      └────────────────────────┘
                    │                                    │
                    ▲                                    │
                    │                                    │
                    │ Triggered by                       │
                    │ context.scheduler.runJob()         │
                    │                                    │
                    └────────────────────────────────────┘
                           (Bridge Pattern)

        ┌─────────────────────────────────────────────┐
        │           Execution Flow                    │
        └─────────────────────────────────────────────┘

        1. User clicks "Create a new post" menu
                            ▼
        2. POST /internal/menu/post-create (server bundle)
           - Generate case with Gemini ✅
           - Save case to Redis ✅
           - Trigger scheduler job ✅
                            ▼
        3. Show toast: "Creating mystery case..."
                            ▼
        4. Wait 3 seconds...
                            ▼
        5. Scheduler job runs (main bundle)
           - Read case ID from event.data ✅
           - Call reddit.submitCustomPost() ✅
           - Post created ✅
                            ▼
        6. Post appears in subreddit feed ✅
```

---

## Context Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                       MAIN CONTEXT                              │
│  Has: Devvit.configure({ redditAPI: true })                    │
│                                                                 │
│  Files:                                                         │
│  - src/main.tsx                                                 │
│  - dist/main.js                                                 │
│                                                                 │
│  Available APIs:                                                │
│  ✅ context.reddit.submitCustomPost()                          │
│  ✅ context.reddit.getCurrentUser()                            │
│  ✅ context.scheduler.runJob()                                 │
│  ✅ context.redis.*                                            │
│  ✅ context.settings.get()                                     │
│                                                                 │
│  Components:                                                    │
│  - Custom Post (render function)                               │
│  - Scheduler Jobs                                              │
│  - Triggers (AppInstall, etc.)                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      SERVER CONTEXT                             │
│  Has: NO Devvit.configure()                                    │
│                                                                 │
│  Files:                                                         │
│  - src/server/index.ts                                         │
│  - dist/server/index.cjs                                       │
│                                                                 │
│  Available APIs:                                                │
│  ✅ fetch() - HTTP requests                                    │
│  ✅ context.redis.* (via @devvit/web/server)                  │
│  ✅ context.settings.get()                                     │
│  ✅ context.scheduler.runJob()                                 │
│  ❌ context.reddit.* (NOT AVAILABLE)                           │
│                                                                 │
│  Components:                                                    │
│  - Express routes (/api/*)                                     │
│  - Menu handlers (/internal/menu/*)                            │
│  - Business logic (case generation, AI services)               │
└─────────────────────────────────────────────────────────────────┘

          Bridge: context.scheduler.runJob()
          (Server context → Main context)
```

---

## Data Flow

### Before Fix (BROKEN):

```
User
  │
  ├─ Clicks menu: "Create a new post"
  │
  ▼
devvit.json
  │
  ├─ Routes to: POST /internal/menu/post-create
  │
  ▼
Server Bundle (dist/server/index.cjs)
  │
  ├─ 1. Generate case with Gemini ✅
  ├─ 2. Save case to Redis ✅
  ├─ 3. Call reddit.submitCustomPost()
  │
  ▼
ERROR: "permissions not enabled for this context" ❌
  │
  └─ (Server context doesn't have redditAPI permission)
```

### After Fix (WORKING):

```
User
  │
  ├─ Clicks menu: "Create a new post"
  │
  ▼
devvit.json
  │
  ├─ Routes to: POST /internal/menu/post-create
  │
  ▼
Server Bundle (dist/server/index.cjs)
  │
  ├─ 1. Generate case with Gemini ✅
  ├─ 2. Save case to Redis ✅
  ├─ 3. Trigger scheduler job:
  │      context.scheduler.runJob({
  │        name: 'menu-create-post',
  │        runAt: new Date(Date.now() + 3000),
  │        data: { caseId, title, subredditName }
  │      })
  │
  ├─ 4. Return toast: "Creating mystery case..." ✅
  │
  ▼
Main Bundle (dist/main.js)
  │
  ├─ Scheduler Job: 'menu-create-post'
  │
  ├─ 5. Read data from event.data
  ├─ 6. Call reddit.submitCustomPost() ✅
  │      (Has redditAPI permission in main context)
  │
  ▼
Reddit API
  │
  ├─ Post created successfully ✅
  │
  ▼
Subreddit Feed
  │
  └─ New post appears ✅
```

---

## Build Output Structure

```
armchair-sleuths/
├─ src/
│  ├─ main.tsx ────────────────┐
│  │                           │ Vite Build
│  │  Devvit.configure()       │ (vite.main.config.ts)
│  │  Custom Post              │
│  │  Scheduler Jobs           │
│  │                           ▼
│  │                      dist/main.js
│  │                      (Main Bundle - Has Reddit API)
│  │
│  └─ server/
│     └─ index.ts ─────────────┐
│                              │ Vite Build
│        Express app           │ (server/vite.config.ts)
│        Menu handlers         │
│        API routes            │
│                              ▼
│                         dist/server/index.cjs
│                         (Server Bundle - NO Reddit API)
│
└─ devvit.json
   │
   ├─ server.entry: "dist/server/index.cjs" ← Express server
   ├─ menu.items[].endpoint: "/internal/menu/*" ← Routes to server
   └─ (Implicit: main.js loaded by Devvit runtime)
```

---

## Permission Matrix

| Context        | File                | redditAPI | redis | http | scheduler |
|----------------|---------------------|-----------|-------|------|-----------|
| Main           | dist/main.js        | ✅        | ✅    | ✅   | ✅        |
| Server         | dist/server/index.cjs| ❌       | ✅    | ✅   | ✅        |
| Custom Post    | (rendered by main)  | ✅        | ✅    | ✅   | ✅        |
| Scheduler Job  | (executed in main)  | ✅        | ✅    | ✅   | ✅        |
| Menu Handler   | (executed in server)| ❌        | ✅    | ✅   | ✅        |
| Trigger        | (executed in main)  | ✅        | ✅    | ✅   | ✅        |

**Key Insight**: Menu handlers run in server context, NOT main context!

---

## Solution Summary

### The Problem:
- Menu action needs to create Reddit post
- Menu handler runs in server context
- Server context doesn't have `redditAPI` permission

### The Solution:
- Menu handler triggers scheduler job
- Scheduler job runs in main context
- Main context HAS `redditAPI` permission
- Post creation succeeds ✅

### The Pattern:
```typescript
// Server Context (can't use reddit API)
await context.scheduler.runJob({
  name: 'menu-create-post',
  data: { caseId, title }
});

// Main Context (can use reddit API)
Devvit.addSchedulerJob({
  name: 'menu-create-post',
  onRun: async (event, context) => {
    await context.reddit.submitCustomPost({...});
  }
});
```

---

## Related Documentation

- `DEVVIT_ARCHITECTURE_ANALYSIS.md` - Detailed technical analysis
- `DEVVIT_FIX_IMPLEMENTATION.md` - Step-by-step implementation guide
- `REDDIT_API_ERROR_SUMMARY.md` - Quick reference
- `devvit.json` - Devvit configuration
- `src/main.tsx` - Main bundle entry point
- `src/server/index.ts` - Server bundle entry point

---

**Visual Aid Status**: Complete
**Architecture**: Fully documented
**Fix**: Ready to implement
