# Devvit Web Framework Architecture - Visual Explanation

**Purpose**: Explain why Reddit API error occurs and how scheduler job bridge fixes it

---

## The Two-Brain Problem

### Before Understanding (Your Mental Model)

```
┌────────────────────────────────────────────────┐
│ Devvit App (Single Unified System)            │
├────────────────────────────────────────────────┤
│                                                │
│  Devvit.configure({ redditAPI: true })        │
│                                                │
│  ✅ Everything has Reddit API access          │
│                                                │
│  - Custom Post renders UI                     │
│  - Menu actions create posts                  │
│  - Everything works together                  │
│                                                │
└────────────────────────────────────────────────┘
```

**Assumption**: Configuration applies globally to entire app

---

### After Understanding (Reality)

```
┌──────────────────────────────────────────────────────────────────────┐
│ Devvit Web Framework App (Dual Context System)                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────┐    ┌─────────────────────────┐        │
│  │ BRAIN 1                 │    │ BRAIN 2                 │        │
│  │ Custom Post Context     │    │ Express Server Context  │        │
│  ├─────────────────────────┤    ├─────────────────────────┤        │
│  │ File: main.tsx          │    │ File: src/server/       │        │
│  │                         │    │       index.ts          │        │
│  │ ✅ Devvit.configure({  │    │ ❌ NO configuration     │        │
│  │    redditAPI: true      │    │                         │        │
│  │ })                      │    │                         │        │
│  │                         │    │                         │        │
│  │ Purpose:                │    │ Purpose:                │        │
│  │ - Render game UI        │    │ - Handle API routes     │        │
│  │ - Custom Post Blocks    │    │ - Menu action handlers  │        │
│  │ - Scheduler jobs        │    │ - Business logic        │        │
│  │                         │    │                         │        │
│  │ Reddit API:             │    │ Reddit API:             │        │
│  │ ✅ context.reddit       │    │ ❌ imported reddit      │        │
│  │    (configured)         │    │    (NOT configured)     │        │
│  │                         │    │                         │        │
│  │ Build Output:           │    │ Build Output:           │        │
│  │ dist/main.js            │    │ dist/server/index.cjs   │        │
│  └─────────────────────────┘    └─────────────────────────┘        │
│         ↑                                  ↑                        │
│         │ Separate execution contexts     │                        │
│         │ NO shared configuration         │                        │
│         │                                  │                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Reality**: Two completely separate contexts with independent configurations

---

## The Problem Flow

### User Action → Error Path

```
┌─────────────────────────────────────────────────────────────────────┐
│ Step 1: User clicks "Create a new post" menu action                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 2: devvit.json declarative menu action definition             │
│                                                                     │
│  {                                                                  │
│    "menu": {                                                        │
│      "items": [{                                                    │
│        "endpoint": "/internal/menu/post-create"  ← Routes to Brain 2│
│      }]                                                             │
│    }                                                                │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3: CONTEXT SWITCH - Enters Brain 2 (Express Server)           │
│                                                                     │
│  ⚠️  NO Devvit.configure() in this context                         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 4: Menu action handler executes                                │
│                                                                     │
│  // src/server/index.ts:150                                         │
│  router.post('/internal/menu/post-create', async () => {           │
│    const post = await createPost({ ... });  ← Calls Brain 2 code   │
│  });                                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 5: createPost() tries to use Reddit API                       │
│                                                                     │
│  // src/server/core/post.ts:43                                      │
│  import { reddit } from '@devvit/web/server';                       │
│                                                                     │
│  const result = await reddit.submitCustomPost(payload);            │
│                       ↑                                             │
│                       └─ Unconfigured reddit instance              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 6: ❌ ERROR                                                    │
│                                                                     │
│  Error: Reddit API is not enabled. You can enable it by passing    │
│  `redditAPI: true` to `Devvit.configure`.                          │
│                                                                     │
│  Reason: Brain 2 context has no configuration                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Solution Flow

### Scheduler Job Bridge Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│ Step 1: User clicks "Create a new post" menu action                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 2: Routes to Brain 2 (Express Server)                         │
│                                                                     │
│  router.post('/internal/menu/post-create', async () => {           │
│    // Generate game case (no Reddit API needed)                    │
│    const newCase = await caseGenerator.generateCase({ ... });      │
│                                                                     │
│    console.log('Case generated:', newCase.id);                     │
│  });                                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 3: Brain 2 triggers scheduler job (sends message to Brain 1)  │
│                                                                     │
│  await context.scheduler.runJob({                                  │
│    name: 'create-game-post-job',  ← Job defined in Brain 1        │
│    data: {                                                          │
│      caseId: newCase.id,                                            │
│      title: postTitle,                                              │
│      subredditName: context.subredditName                           │
│    }                                                                │
│  });                                                                │
│                                                                     │
│  // Return success immediately                                      │
│  res.json({ showToast: { text: 'Creating post...' } });           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 4: CONTEXT SWITCH - Enters Brain 1 (main.tsx)                 │
│                                                                     │
│  ✅ Devvit.configure({ redditAPI: true }) IS active here           │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 5: Scheduler job executes in Brain 1 context                  │
│                                                                     │
│  Devvit.addSchedulerJob({                                           │
│    name: 'create-game-post-job',                                    │
│    onRun: async (event, context) => {                               │
│      const { caseId, title, subredditName } = event.data;           │
│                                                                     │
│      // context.reddit IS available (Brain 1 has config)           │
│      const post = await context.reddit.submitCustomPost({          │
│        title,                                                       │
│        subredditName,                                               │
│        preview: <blocks>...</blocks>                                │
│      });                                                            │
│                                                                     │
│      console.log('Post created:', post.id);                         │
│    }                                                                │
│  });                                                                │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Step 6: ✅ SUCCESS                                                  │
│                                                                     │
│  Post created and appears in subreddit                              │
│  No Reddit API error                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## The Bridge Pattern Visualized

### Before Fix (Direct Call - BROKEN)

```
┌──────────────────┐
│ User clicks menu │
└────────┬─────────┘
         ↓
┌────────────────────────────────────────────┐
│ Brain 2 (Express Server)                   │
│                                            │
│  Menu Action Handler                       │
│    ↓                                       │
│  Generate Game Case ✅                     │
│    ↓                                       │
│  reddit.submitCustomPost() ❌              │
│    └─ No Reddit API config                │
│         ↓                                  │
│       ERROR                                │
└────────────────────────────────────────────┘
```

### After Fix (Scheduler Bridge - WORKING)

```
┌──────────────────┐
│ User clicks menu │
└────────┬─────────┘
         ↓
┌────────────────────────────────────────────┐
│ Brain 2 (Express Server)                   │
│                                            │
│  Menu Action Handler                       │
│    ↓                                       │
│  Generate Game Case ✅                     │
│    ↓                                       │
│  Trigger Scheduler Job ✅                  │
│    └─ Send message to Brain 1             │
└────────┬───────────────────────────────────┘
         │
         │ Scheduler Job Execution
         │
         ↓
┌────────────────────────────────────────────┐
│ Brain 1 (main.tsx)                         │
│                                            │
│  Scheduler Job Receives Message            │
│    ↓                                       │
│  context.reddit.submitCustomPost() ✅      │
│    └─ Has Reddit API config                │
│         ↓                                  │
│       SUCCESS                              │
└────────────────────────────────────────────┘
```

---

## Code Mapping to Architecture

### Brain 1 (main.tsx) - Has Reddit API

```typescript
// src/main.tsx

// ========================================
// CONFIGURATION (applies to Brain 1 only)
// ========================================
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,  // ✅ Available in this context
});

// ========================================
// SCHEDULER JOB (runs in Brain 1 context)
// ========================================
Devvit.addSchedulerJob({
  name: 'create-game-post-job',
  onRun: async (event, context) => {
    // This executes in Brain 1 context
    // Therefore: context.reddit IS available ✅

    const post = await context.reddit.submitCustomPost({
      title: event.data.title,
      subredditName: event.data.subredditName,
      preview: <vstack>...</vstack>
    });

    return { success: true, postId: post.id };
  }
});

// ========================================
// CUSTOM POST (runs in Brain 1 context)
// ========================================
Devvit.addCustomPostType({
  render: (context) => {
    // This also executes in Brain 1 context
    // context.reddit IS available ✅

    const user = await context.reddit.getCurrentUser();
    // ... render UI
  }
});
```

### Brain 2 (src/server/index.ts) - NO Reddit API

```typescript
// src/server/index.ts

// ========================================
// IMPORTS (separate package)
// ========================================
import { redis, reddit, context, scheduler }
  from '@devvit/web/server';
  //     ^^^^^^
  //     This 'reddit' object is NOT configured
  //     It's a separate instance from Brain 1

// ========================================
// NO CONFIGURATION HERE
// ========================================
// Devvit.configure() does NOT exist in this file
// Brain 2 has no configuration mechanism

// ========================================
// MENU ACTION HANDLER
// ========================================
router.post('/internal/menu/post-create', async (_req, res) => {
  // This executes in Brain 2 context

  // ✅ Can do business logic
  const newCase = await generateCase();

  // ❌ BROKEN: Direct Reddit API call
  // const post = await reddit.submitCustomPost({ ... });
  //                    ^^^^^^
  //                    Unconfigured instance → ERROR

  // ✅ WORKING: Trigger Brain 1 via scheduler
  await context.scheduler.runJob({
    name: 'create-game-post-job',  // Defined in Brain 1
    data: { caseId, title, subredditName }
  });

  res.json({ success: true });
});
```

---

## Build System Separation

### Build Command Flow

```bash
npm run build
```

**Executes**:
```
build:client  → Vite builds src/client/**    → dist/client/
build:server  → Vite builds src/server/**    → dist/server/index.cjs
build:main    → Vite builds src/main.tsx     → dist/main.js
```

**Result**:
```
dist/
├── client/
│   └── (React app assets)
├── server/
│   └── index.cjs          ← Brain 2 bundle (NO Devvit.configure)
└── main.js                ← Brain 1 bundle (HAS Devvit.configure)
```

### Devvit Platform Loading

```
Devvit Platform Startup:
  1. Load devvit.json (config)
  2. Load dist/main.js (Custom Post + Scheduler jobs)
     ↑ Executes: Devvit.configure({ redditAPI: true })
  3. Load dist/server/index.cjs (Express routes)
     ↑ NO configuration execution
  4. Platform ready
```

**Key insight**: Two separate bundle files = Two separate execution contexts

---

## Why Imperative Menu Actions Don't Show

### Standard Devvit (Single Context)

```typescript
// main.ts (single bundle)

Devvit.configure({ redditAPI: true });

// Imperative menu action
Devvit.addMenuItem({
  label: 'Test Menu',
  location: 'subreddit',
  onPress: async (event, context) => {
    // Works because:
    // 1. Single context
    // 2. Menu registration happens early
    // 3. Execution context = configuration context
  }
});
```

**Works because**: Single bundle, single context, unified execution

### Web Framework (Dual Context)

```typescript
// src/main.tsx (Custom Post bundle)

Devvit.configure({ redditAPI: true });

// Imperative menu action (DOESN'T SHOW)
Devvit.addMenuItem({
  label: 'Test Menu',
  location: 'subreddit',
  onPress: async (event, context) => {
    // Doesn't work because:
    // 1. main.tsx is Custom Post context
    // 2. Subreddit menu is controlled elsewhere
    // 3. Build system may strip this out
    // 4. Execution timing mismatch
  }
});
```

**Doesn't work because**:
1. **Context mismatch**: main.tsx controls Custom Post, not subreddit menu
2. **Build separation**: Build system treats menu actions specially
3. **Timing issue**: May execute too late to register in UI
4. **Architecture pattern**: Web Framework expects declarative menus

**Solution**: Use declarative menu (devvit.json) + scheduler bridge

---

## Configuration Propagation Chart

### What `Devvit.configure()` Applies To

```
src/main.tsx:
  Devvit.configure({
    redis: true,
    http: true,
    redditAPI: true
  });

Applies to:
  ✅ Custom Post render() function
  ✅ Scheduler jobs defined in main.tsx
  ✅ Triggers defined in main.tsx
  ✅ Any code in main.tsx file

Does NOT apply to:
  ❌ Express routes (src/server/index.ts)
  ❌ Menu action handlers (endpoints in devvit.json)
  ❌ Imported 'reddit' from @devvit/web/server
  ❌ Any code in src/server/** files
```

### Why Configuration Doesn't Propagate

**Technical reason**:
```typescript
// Brain 1 (main.tsx)
import { Devvit } from '@devvit/public-api';
Devvit.configure({ ... });
// ↑ Sets internal state in @devvit/public-api package

// Brain 2 (src/server/index.ts)
import { reddit } from '@devvit/web/server';
// ↑ Different package, different state, no configuration
```

**They are different package imports** → Separate instances → No shared state

---

## Summary: The Mental Model Shift

### Old Mental Model (Wrong)
```
My App = Single Thing
  ├─ Has configuration
  └─ Everything uses it
```

### New Mental Model (Correct)
```
My App = Two Independent Things

Thing 1 (main.tsx):
  ├─ Has configuration ✅
  ├─ Renders UI
  ├─ Runs scheduler jobs
  └─ Can use Reddit API

Thing 2 (src/server/index.ts):
  ├─ Has NO configuration ❌
  ├─ Handles API routes
  ├─ Runs menu actions
  └─ Cannot use Reddit API directly
      (needs scheduler bridge to Thing 1)
```

---

## Quick Reference

### When to Use What

| Task | Use | Context |
|------|-----|---------|
| Render game UI | Custom Post (main.tsx) | Brain 1 ✅ |
| Handle API requests | Express routes (server/index.ts) | Brain 2 ❌ |
| Menu actions | devvit.json (declarative) | Routes to Brain 2 |
| Reddit API calls | Scheduler job (main.tsx) | Brain 1 ✅ |
| Business logic | Express routes | Brain 2 ❌ |
| Bridge contexts | Scheduler job trigger | Brain 2 → Brain 1 |

### Pattern Library

**Pattern 1: Menu Action + Reddit API**
```typescript
// Brain 2: Trigger scheduler
router.post('/menu-action', async () => {
  await scheduler.runJob({ name: 'my-job', data: {...} });
});

// Brain 1: Execute Reddit API
Devvit.addSchedulerJob({
  name: 'my-job',
  onRun: async (event, context) => {
    await context.reddit.doSomething();
  }
});
```

**Pattern 2: Custom Post + Reddit API**
```typescript
// Brain 1: Direct access
Devvit.addCustomPostType({
  render: (context) => {
    await context.reddit.doSomething();  // ✅ Works directly
  }
});
```

**Pattern 3: Express Route + Business Logic**
```typescript
// Brain 2: No Reddit API needed
router.post('/api/something', async () => {
  // Process data, call external APIs, etc.
  // ✅ Works directly (no Reddit API needed)
});
```

---

## Files to Read

1. **This file**: Architecture understanding
2. **REDDIT_API_ISSUE_EXECUTIVE_SUMMARY.md**: High-level explanation
3. **REDDIT_API_FIX_IMPLEMENTATION_GUIDE.md**: Step-by-step fix
4. **DEVVIT_WEB_FRAMEWORK_REDDIT_API_ANALYSIS.md**: Deep technical analysis

**Start here** → Move to summary → Then implementation guide
