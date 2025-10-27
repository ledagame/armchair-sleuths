# Menu Action Visibility Analysis: Devvit Web Framework

**Date**: 2025-10-26
**Issue**: Imperative menu actions (`Devvit.addMenuItem()`) don't appear in UI for Web Framework apps
**Status**: Root cause identified, solution implemented

---

## Executive Summary

In Devvit Web Framework applications, **imperative menu actions registered via `Devvit.addMenuItem()` in main.tsx DO NOT appear in the UI**. Only **declarative menu actions defined in devvit.json are visible and functional**.

This is not a bug - it's an architectural design constraint of the Devvit Web Framework's dual-context execution model.

**Solution**: Always use declarative menu actions in `devvit.json` for Web Framework apps.

---

## Timeline of Events

### 1. Original State (Working)
```json
// devvit.json
{
  "menu": {
    "items": [{
      "label": "Create a new post",
      "location": "subreddit",
      "forUserType": "moderator",
      "endpoint": "/internal/menu/post-create"
    }]
  }
}
```
**Status**: Menu action VISIBLE in UI ✅
**Issue**: Triggered Reddit API permission error (separate issue)

### 2. Attempted Fix (Failed)
```typescript
// src/main.tsx
Devvit.addMenuItem({
  label: 'Create a new post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    // Handler code...
  },
});
```
**Status**: Menu action DISAPPEARED from UI ❌
**Outcome**: Moved to imperative style to try fixing Reddit API error, but menu vanished entirely

### 3. Current State (Fixed)
- Restored declarative menu action to `devvit.json` ✅
- Implemented scheduler job bridge pattern for Reddit API access ✅
- Menu action now visible and functional ✅

---

## Root Cause: Why Imperative Menu Actions Don't Show

### 1. Dual-Context Architecture

Devvit Web Framework apps run in **TWO separate execution contexts**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Devvit Platform                           │
├─────────────────────────┬───────────────────────────────────┤
│   CONTEXT 1: Main       │   CONTEXT 2: Server               │
│   (dist/main.js)        │   (dist/server/index.cjs)         │
├─────────────────────────┼───────────────────────────────────┤
│ • Custom Post rendering │ • Express route handlers          │
│ • Scheduler jobs        │ • Menu action endpoints           │
│ • Triggers              │ • API request processing          │
│ • Reddit API access ✅  │ • Redis access                    │
│                         │ • NO Reddit API access ❌          │
└─────────────────────────┴───────────────────────────────────┘
```

### 2. Build System Separation

```bash
npm run build
  ↓
├── build:client  (src/client → dist/client)      # React UI
├── build:server  (src/server → dist/server)      # Express routes
└── build:main    (src/main.tsx → dist/main.js)   # Custom Post + Config
```

**Three separate bundles** are built independently:
- Each has its own execution context
- No shared state between bundles
- Configuration in one bundle doesn't affect others

### 3. Menu Action Registration Timing

```
Platform Startup Sequence:
  1. Load devvit.json (declarative config)         ← Menu actions registered HERE
  2. Load dist/main.js (Custom Post definition)    ← Too late for menu UI
  3. Load dist/server/index.cjs (Express routes)
  4. Render subreddit UI with registered menus     ← Already decided
  5. Execute main.tsx code                         ← addMenuItem() runs now (too late)
```

**The problem**: By the time `main.tsx` executes and calls `Devvit.addMenuItem()`, the platform has already:
- Parsed `devvit.json`
- Registered menu actions from declarative config
- Rendered the subreddit menu UI

### 4. Context Mismatch

```typescript
// src/main.tsx - Custom Post Context
Devvit.addMenuItem({
  label: 'Test',
  location: 'subreddit',  // ← Trying to control subreddit menu
  onPress: async (event, context) => {
    // This runs in... which context?
    // Custom Post context? Server context?
    // Platform doesn't know where to route this!
  }
});
```

**The issue**:
- `main.tsx` controls **Custom Post rendering** (inside post view)
- Subreddit menu is controlled at **platform level** (outside post view)
- Imperative menu actions in Custom Post context can't reach subreddit UI layer

---

## Comparison: Standard Devvit vs Web Framework

### Standard Devvit (Single Context) - Works ✅

```typescript
// main.ts (single bundle, single context)

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Imperative menu action - WORKS
Devvit.addMenuItem({
  label: 'Test Menu',
  location: 'subreddit',
  onPress: async (event, context) => {
    // ✅ Works because:
    // 1. Single execution context
    // 2. Menu registration happens before UI render
    // 3. Unified configuration applies
    await context.reddit.submitPost({...});
  }
});

Devvit.addCustomPostType({
  name: 'MyPost',
  render: (context) => {
    // Same context as menu action above
    return <vstack><text>Hello</text></vstack>;
  }
});
```

**Why it works**:
- One bundle (`dist/main.js`)
- One context (everything runs together)
- Menu action registration happens early
- Configuration applies to everything

### Web Framework (Dual Context) - Doesn't Work ❌

```typescript
// src/main.tsx (Custom Post bundle)

Devvit.configure({
  redditAPI: true,  // Only applies to THIS context
  redis: true,
});

// Imperative menu action - DOESN'T SHOW
Devvit.addMenuItem({
  label: 'Test Menu',
  location: 'subreddit',
  onPress: async (event, context) => {
    // ❌ Doesn't work because:
    // 1. main.tsx controls Custom Post, not subreddit menu
    // 2. Subreddit menu controlled at platform level
    // 3. Registration timing mismatch
    // 4. Context isolation prevents propagation
  }
});

Devvit.addCustomPostType({
  name: 'MyPost',
  render: (context) => {
    // This works fine - same context
    return <vstack><text>Hello</text></vstack>;
  }
});
```

```typescript
// src/server/index.ts (Server bundle - SEPARATE CONTEXT)

import { reddit, scheduler } from '@devvit/web/server';
// ↑ Different package import = different instance = no shared state

router.post('/internal/menu/post-create', async (req, res) => {
  // This handler runs in server context
  // Has NO access to Devvit.configure() from main.tsx
  // Cannot use reddit.submitPost() directly

  // Must use scheduler bridge:
  await scheduler.runJob({
    name: 'case-generation',
    data: {...}
  });
});
```

**Why it doesn't work**:
- Two bundles (main + server)
- Two contexts (isolated from each other)
- Menu actions route to server context (not main context)
- Configuration doesn't propagate between contexts

---

## Technical Deep Dive: Build System Analysis

### Build Configuration

```typescript
// vite.main.config.ts - Main bundle build
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['es'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: ['@devvit/public-api'],  // Don't bundle Devvit SDK
    },
  },
});
```

### Bundle Contents Verification

```bash
# Check if addMenuItem is in built bundle
$ grep -n "addMenuItem" dist/main.js
3920:i.addMenuItem({
```

**Finding**: The code IS compiled into the bundle, but it's **executed in the wrong context at the wrong time**.

### Platform Loading Sequence

```
1. Platform reads devvit.json
   ├─ Parses menu actions (declarative)
   ├─ Creates menu UI elements
   └─ Maps endpoints to routes

2. Platform loads dist/main.js
   ├─ Registers Custom Post type
   ├─ Sets up scheduler jobs
   ├─ Executes Devvit.configure()
   └─ Executes Devvit.addMenuItem()  ← TOO LATE, WRONG CONTEXT

3. Platform loads dist/server/index.cjs
   ├─ Starts Express server
   └─ Maps devvit.json endpoints to handlers

4. User sees subreddit menu
   └─ Only shows menu actions from step 1 (devvit.json)
```

---

## Solution: Declarative Menu Actions + Scheduler Bridge

### Correct Pattern for Web Framework Apps

```json
// devvit.json - Declarative menu action
{
  "menu": {
    "items": [{
      "label": "Create a new post",
      "description": "Generate a new murder mystery case",
      "location": "subreddit",
      "forUserType": "moderator",
      "endpoint": "/internal/menu/post-create"
    }]
  }
}
```

```typescript
// src/server/index.ts - Menu action handler (server context)
router.post('/internal/menu/post-create', async (req, res) => {
  try {
    // Can't use reddit.submitPost() here (no Reddit API access)
    // Instead, trigger scheduler job that runs in main context

    await scheduler.runJob({
      name: 'daily-case-generation',
      runAt: new Date(Date.now() + 1000),  // Run in 1 second
      data: {
        source: 'menu-action',
        triggeredBy: 'moderator',
      }
    });

    // Return success response to menu action
    res.send({
      success: true,
      message: 'Case generation started',
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});
```

```typescript
// src/main.tsx - Scheduler job (main context with Reddit API access)
Devvit.addSchedulerJob({
  name: 'daily-case-generation',
  onRun: async (event, context) => {
    // ✅ This runs in main context with Reddit API access

    const apiKey = await context.settings.get('geminiApiKey');
    const caseData = await generateCase(apiKey);

    // Store in Redis
    await context.redis.set('case:current', JSON.stringify(caseData));

    // Create Reddit post
    const post = await context.reddit.submitPost({
      title: `New Mystery: ${caseData.victim.name}`,
      subredditName: context.subredditName,
      preview: <vstack><text>Mystery Preview</text></vstack>,
    });

    console.log('Post created:', post.id);
  }
});
```

### Architecture Diagram: Scheduler Bridge Pattern

```
┌──────────────────────────────────────────────────────────────┐
│                        User Action                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  Subreddit Menu: "Create a new post" clicked                 │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  devvit.json: Maps to /internal/menu/post-create             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVER CONTEXT (dist/server/index.cjs)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Express Route: POST /internal/menu/post-create        │  │
│  │                                                        │  │
│  │ await scheduler.runJob({                             │  │
│  │   name: 'daily-case-generation',                     │  │
│  │   data: { source: 'menu' }                           │  │
│  │ });                                                   │  │
│  │                                                        │  │
│  │ return { success: true };                            │  │
│  └────────────────────┬───────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                         │
                         │ Scheduler Bridge
                         │ (crosses context boundary)
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  MAIN CONTEXT (dist/main.js)                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Scheduler Job: daily-case-generation                  │  │
│  │                                                        │  │
│  │ // ✅ Has Reddit API access                           │  │
│  │ const post = await context.reddit.submitPost({       │  │
│  │   title: 'New Mystery',                               │  │
│  │   subredditName: 'armchair_sleuths_dev'               │  │
│  │ });                                                    │  │
│  │                                                        │  │
│  │ // ✅ Has settings access                             │  │
│  │ const apiKey = await context.settings.get(...);       │  │
│  │                                                        │  │
│  │ // ✅ Has Redis access                                │  │
│  │ await context.redis.set('case:current', data);        │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Best Practices for Menu Actions in Web Framework Apps

### 1. Always Use Declarative Menu Actions

**Do this** ✅:
```json
// devvit.json
{
  "menu": {
    "items": [{
      "label": "My Action",
      "location": "subreddit",
      "endpoint": "/my-action"
    }]
  }
}
```

**Don't do this** ❌:
```typescript
// src/main.tsx
Devvit.addMenuItem({
  label: 'My Action',  // Won't show in UI
  onPress: async () => {}
});
```

### 2. Menu Actions Route to Server Context

**Understand**:
- Menu action clicks → Express route handlers
- Express handlers run in server context
- Server context has NO Reddit API access
- Must use scheduler bridge for Reddit operations

### 3. Use Scheduler Jobs for Reddit API

**Pattern**:
```typescript
// Server: Trigger job
router.post('/menu-action', async (req, res) => {
  await scheduler.runJob({ name: 'my-job' });
  res.send({ success: true });
});

// Main: Execute with Reddit API
Devvit.addSchedulerJob({
  name: 'my-job',
  onRun: async (event, context) => {
    await context.reddit.submitPost({...});
  }
});
```

### 4. Keep Business Logic in Server Context

**Good separation**:
```typescript
// Server: Business logic + data processing
router.post('/menu-action', async (req, res) => {
  // ✅ Complex logic here
  const caseData = await generateMystery();
  await redis.set('case:current', caseData);

  // Trigger Reddit post creation
  await scheduler.runJob({ name: 'create-post', data: caseData });
});

// Main: Reddit API calls only
Devvit.addSchedulerJob({
  name: 'create-post',
  onRun: async (event, context) => {
    // ✅ Minimal logic, just Reddit API
    await context.reddit.submitPost({
      title: event.data.title,
      ...
    });
  }
});
```

### 5. Handle Async Operations Properly

**Menu actions support async workflows**:
```typescript
router.post('/menu-action', async (req, res) => {
  // Start long-running operation
  await scheduler.runJob({
    name: 'long-task',
    runAt: new Date(Date.now() + 1000)
  });

  // Return immediately (don't wait for job to finish)
  res.send({
    success: true,
    message: 'Task started, check back in 30 seconds'
  });
});
```

---

## Verification Steps

### 1. Check Menu Action Visibility

```bash
# Start playtest
devvit playtest

# In browser:
1. Go to r/armchair_sleuths_dev
2. Click "..." menu button
3. Look for "Create a new post" option
   ✅ Should be visible if using devvit.json
   ❌ Won't show if using Devvit.addMenuItem()
```

### 2. Check Build Artifacts

```bash
# Verify main bundle contains Custom Post
grep -n "addCustomPostType" dist/main.js

# Verify server bundle contains Express routes
grep -n "router.post" dist/server/index.cjs

# Check if imperative menu actions are in bundle (won't work even if present)
grep -n "addMenuItem" dist/main.js
```

### 3. Check Logs

```bash
# Platform logs
devvit logs --app armchair-sleuths

# Look for:
# ✅ "Menu action registered: Create a new post" (from devvit.json)
# ❌ No logs about imperative menu actions (they don't register)
```

---

## Common Misconceptions

### Misconception 1: "Menu actions are just buttons"
**Reality**: Menu actions are platform-level UI elements registered during app initialization, not runtime components.

### Misconception 2: "Devvit.configure() applies everywhere"
**Reality**: Configuration only applies to the context where it's called (main.tsx). Server context has separate configuration via devvit.json.

### Misconception 3: "I can call Reddit API from Express routes"
**Reality**: Server context has NO Reddit API access. Must use scheduler bridge to main context.

### Misconception 4: "Imperative menu actions should work like Custom Posts"
**Reality**: Custom Posts render in main context. Menu actions execute in server context. Different contexts, different capabilities.

### Misconception 5: "The build system is stripping my code"
**Reality**: The code compiles fine, but runs in the wrong context at the wrong time.

---

## Migration Guide: Imperative → Declarative

If you have imperative menu actions in `main.tsx`, follow these steps:

### Step 1: Extract menu action metadata

```typescript
// FROM: main.tsx
Devvit.addMenuItem({
  label: 'Create Post',        // ← Extract this
  location: 'subreddit',       // ← Extract this
  forUserType: 'moderator',    // ← Extract this
  onPress: async (event, context) => {
    // Handler code                 ← Move this to server
  }
});
```

### Step 2: Add to devvit.json

```json
{
  "menu": {
    "items": [{
      "label": "Create Post",
      "location": "subreddit",
      "forUserType": "moderator",
      "endpoint": "/internal/menu/create-post"
    }]
  }
}
```

### Step 3: Create Express route

```typescript
// src/server/index.ts
router.post('/internal/menu/create-post', async (req, res) => {
  try {
    // Move handler logic here
    // If needs Reddit API, use scheduler bridge

    await scheduler.runJob({
      name: 'my-job',
      data: { source: 'menu' }
    });

    res.send({ success: true });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
```

### Step 4: Create scheduler job (if needed)

```typescript
// src/main.tsx
Devvit.addSchedulerJob({
  name: 'my-job',
  onRun: async (event, context) => {
    // Reddit API calls here
    await context.reddit.submitPost({...});
  }
});
```

### Step 5: Remove imperative menu action

```typescript
// src/main.tsx
// DELETE THIS:
Devvit.addMenuItem({ ... });
```

### Step 6: Test

```bash
npm run build
devvit playtest

# Verify menu action appears in UI
# Test end-to-end flow
```

---

## FAQ

### Q: Will Devvit ever support imperative menu actions in Web Framework apps?
**A**: Unknown. This is a platform architecture decision. For now, use declarative menu actions.

### Q: Can I use both declarative and imperative menu actions?
**A**: Declarative (devvit.json) will work. Imperative (addMenuItem in main.tsx) will not show in UI. Stick to declarative only.

### Q: What if I need dynamic menu actions?
**A**: Menu actions are static (defined at build time). If you need dynamic behavior, handle it in the menu action handler logic, not in menu registration.

### Q: Can I use Devvit.addMenuItem() in src/server/index.ts?
**A**: No. Server context uses Express routes, not Devvit SDK. Use devvit.json for menu actions.

### Q: Why does the build system include addMenuItem code if it doesn't work?
**A**: The code compiles successfully (it's valid TypeScript), but the Devvit platform doesn't execute it in the right context/timing for menu registration.

### Q: Can I work around this with eval() or dynamic imports?
**A**: No. This is a platform architecture constraint, not a code execution issue.

---

## Related Documentation

- **Root Cause Analysis**: `C:\Users\hpcra\armchair-sleuths\DEVVIT_WEB_FRAMEWORK_REDDIT_API_ANALYSIS.md`
- **Architecture Diagram**: `C:\Users\hpcra\armchair-sleuths\DEVVIT_WEB_FRAMEWORK_ARCHITECTURE_DIAGRAM.md`
- **Menu Action API Diagnosis**: `C:\Users\hpcra\armchair-sleuths\DEVVIT_MENU_ACTION_API_DIAGNOSIS.md`
- **Scheduler Bridge Implementation**: `C:\Users\hpcra\armchair-sleuths\DEVVIT_ARCHITECTURE_ANALYSIS.md`

---

## Summary

### Key Takeaways

1. **Imperative menu actions don't work in Devvit Web Framework apps**
   - Not a bug, it's an architectural constraint
   - Dual-context execution model prevents proper registration

2. **Always use declarative menu actions in devvit.json**
   - Only declarative menu actions show in UI
   - Platform reads devvit.json before executing main.tsx

3. **Menu actions route to server context (no Reddit API access)**
   - Must use scheduler bridge to access Reddit API
   - Server context → Scheduler job → Main context (Reddit API)

4. **Build system compiles code but context mismatch prevents execution**
   - Code exists in bundle but runs in wrong context at wrong time
   - Platform doesn't know where to route imperative menu actions

5. **Follow the scheduler bridge pattern**
   - Declarative menu (devvit.json) → Express handler (server) → Scheduler job (main) → Reddit API

### Current Implementation Status

✅ **Fixed**: Restored declarative menu action to `devvit.json`
✅ **Working**: Menu action visible in subreddit UI
✅ **Implemented**: Scheduler bridge pattern for Reddit API access
✅ **Documented**: Architecture patterns and best practices

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**Author**: Frontend Development Analysis Team
