# Devvit Application Architecture - Execution Contexts

## Context Isolation Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEVVIT APPLICATION                             │
│                     armchair-sleuths (Reddit Game)                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌────────────────────┐          ┌────────────────────┐
        │  CONTEXT A         │          │  CONTEXT B         │
        │  Custom Post       │          │  Express Server    │
        │  (Frontend UI)     │          │  (Backend API)     │
        └────────────────────┘          └────────────────────┘
                    │                               │
                    │                               │
        ┌───────────┴───────────┐       ┌───────────┴──────────┐
        │                       │       │                      │
        ▼                       ▼       ▼                      ▼
┌─────────────┐       ┌─────────────┐ ┌─────────────┐  ┌─────────────┐
│  main.tsx   │       │ Blocks API  │ │ index.ts    │  │ Express     │
│             │       │ Rendering   │ │             │  │ HTTP Server │
│ Line 4-8:   │       │             │ │ Line 1:     │  │             │
│ Devvit      │       │ Uses context│ │ import      │  │ Routes to   │
│ .configure({│       │ .reddit     │ │ { reddit }  │  │ menu        │
│   redditAPI │       │ .getCurrent│ │             │  │ actions     │
│   : true    │       │ User()      │ │ Line 150:   │  │             │
│ })          │       │             │ │ /internal/  │  │             │
│             │       │ ✅ WORKS    │ │ menu/       │  │             │
│             │       │             │ │ post-create │  │             │
└─────────────┘       └─────────────┘ └─────────────┘  └─────────────┘
      │                     │                 │               │
      │                     │                 │               │
      ├─────────────────────┘                 └───────────────┤
      │                                                       │
      ▼                                                       ▼
┌─────────────────────────┐                    ┌──────────────────────┐
│  Reddit API Available   │                    │ Reddit API NOT       │
│  ✅ Can call:           │                    │ Available            │
│  - getCurrentUser()     │                    │ ❌ Error on:         │
│  - submitCustomPost()   │                    │ - submitCustomPost() │
│  - moderator checks     │                    │ - getCurrentUser()   │
└─────────────────────────┘                    └──────────────────────┘
```

---

## Configuration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      devvit.json                                 │
│                 (Global Configuration)                           │
│                                                                  │
│  {                                                               │
│    "permissions": {                                              │
│      "media": true,        ← Currently enabled                  │
│      "redditAPI": true     ← ❌ MISSING - causes the error      │
│    },                                                            │
│    "menu": {                                                     │
│      "items": [{                                                 │
│        "endpoint": "/internal/menu/post-create"                 │
│      }]                                                          │
│    }                                                             │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Applies to both contexts:
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
┌───────────────────────┐           ┌───────────────────────┐
│   Custom Post         │           │   Express Server      │
│   (main.tsx)          │           │   (index.ts)          │
│                       │           │                       │
│   Devvit.configure()  │           │   No configuration    │
│   ↓                   │           │   needed - inherits   │
│   OVERRIDES           │           │   from devvit.json    │
│   devvit.json         │           │                       │
│   for this context    │           │                       │
└───────────────────────┘           └───────────────────────┘
```

---

## Menu Action Error Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. User Interaction                                            │
│     User clicks: "Create a new post" (Subreddit menu)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. Devvit Routing Layer                                        │
│     Devvit runtime reads devvit.json → Routes to endpoint       │
│     Endpoint: /internal/menu/post-create                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. Express Server Handler                                      │
│     File: src/server/index.ts                                   │
│     Line: 150-252                                               │
│                                                                 │
│     router.post('/internal/menu/post-create', async ...)       │
│     ↓                                                           │
│     Generates case with Gemini                                  │
│     ↓                                                           │
│     Calls: await createPost({ ... })                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. createPost Function                                         │
│     File: src/server/core/post.ts                               │
│     Line: 43                                                    │
│                                                                 │
│     const result = await reddit.submitCustomPost(payload);      │
│                                                                 │
│     ❌ ERROR: "Reddit API is not enabled"                       │
│                                                                 │
│     Reason: devvit.json missing "redditAPI": true               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. Error Response                                              │
│     Returns to user: Toast with error message                   │
│     Post creation FAILS                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Devvit.configure() Doesn't Apply to Menu Actions

```
┌──────────────────────────────────────────────────────────────────┐
│                        main.tsx                                  │
│                                                                  │
│  import { Devvit } from '@devvit/public-api';                   │
│                                                                  │
│  Devvit.configure({           ← Configuration                   │
│    redis: true,                                                 │
│    http: true,                                                  │
│    redditAPI: true            ← Only applies to scope below     │
│  });                                                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  SCOPE: Custom Post Rendering Context                  │    │
│  │                                                         │    │
│  │  Devvit.addCustomPostType({                            │    │
│  │    name: 'Armchair Sleuths',                           │    │
│  │    render: (context) => {                              │    │
│  │                                                         │    │
│  │      ✅ context.reddit.getCurrentUser()  WORKS         │    │
│  │      ✅ context.redis.get()              WORKS         │    │
│  │                                                         │    │
│  │      return <blocks>...</blocks>;                      │    │
│  │    }                                                    │    │
│  │  });                                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ❌ DOES NOT APPLY TO:                                          │
│     - Express routes in src/server/                             │
│     - Menu actions                                              │
│     - Triggers                                                  │
│     - Scheduler jobs                                            │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    src/server/index.ts                           │
│                                                                  │
│  import { reddit, redis } from '@devvit/web/server';            │
│                                                                  │
│  ❌ NO Devvit.configure() here                                  │
│  ❌ Separate runtime context                                    │
│  ❌ Different imports                                           │
│                                                                  │
│  router.post('/internal/menu/post-create', ...) {              │
│    // This handler runs in Express context                     │
│    // NOT in Custom Post context                               │
│    // main.tsx configuration DOES NOT APPLY                    │
│                                                                  │
│    ❌ await reddit.submitCustomPost() → ERROR                  │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Correct Architecture (After Fix)

```
┌──────────────────────────────────────────────────────────────────┐
│                      devvit.json                                 │
│                                                                  │
│  {                                                               │
│    "permissions": {                                              │
│      "media": true,                                              │
│      "redditAPI": true     ← ✅ ADDED - enables for all         │
│    }                                                             │
│  }                                                               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Global permission grant
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
┌───────────────────────┐           ┌───────────────────────┐
│   Custom Post         │           │   Express Server      │
│   ✅ reddit API       │           │   ✅ reddit API       │
│      enabled          │           │      enabled          │
│                       │           │                       │
│   getCurrentUser()    │           │   submitCustomPost()  │
│   works               │           │   works               │
└───────────────────────┘           └───────────────────────┘
            │                                   │
            │                                   │
            └─────────────┬─────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │   Menu Action Works!     │
            │   ✅ Post Created        │
            │   ✅ No Errors           │
            └──────────────────────────┘
```

---

## File Locations Reference

```
armchair-sleuths/
│
├── devvit.json                    ← Global configuration (MISSING redditAPI)
│
├── src/
│   ├── main.tsx                   ← Custom Post (has Devvit.configure)
│   │   └── Line 4-8: Configuration scope limited to Custom Post
│   │
│   └── server/
│       ├── index.ts               ← Express server (NO configuration)
│       │   └── Line 150: Menu action handler
│       │
│       └── core/
│           └── post.ts            ← Post creation (uses reddit API)
│               └── Line 43: reddit.submitCustomPost() fails
│
└── dist/
    └── main.js                    ← Build output (Custom Post bundle)
```

---

## Summary

**Problem**: Menu actions run in **Express server context**, NOT Custom Post context.

**Current State**:
- `main.tsx` has `Devvit.configure({ redditAPI: true })`
- This ONLY applies to Custom Post rendering
- Express server has NO configuration
- Menu action tries to use Reddit API → FAILS

**Solution**:
- Add `"redditAPI": true` to `devvit.json` permissions
- This enables Reddit API for ALL contexts (Custom Post + Express)
- Rebuild, re-upload, reinstall app
- Menu action will now work
