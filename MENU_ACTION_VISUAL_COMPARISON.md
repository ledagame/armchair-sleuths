# Menu Action Visual Comparison: Imperative vs Declarative

**Quick Reference**: Why imperative menu actions don't show in Devvit Web Framework apps

---

## Visual Evidence: UI Screenshot Analysis

### Expected UI (Declarative Menu Action - WORKS)

```
┌─────────────────────────────────────────────────┐
│  r/armchair_sleuths_dev                         │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Mod Tools  │  Create Post  │  [•••]    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  When [•••] clicked:                            │
│  ┌──────────────────────────────────────────┐  │
│  │  ✅ Create a new post                     │  │ ← VISIBLE
│  │  ✅ 🧪 Test Media Upload API              │  │ ← VISIBLE
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

devvit.json (declarative):
{
  "menu": {
    "items": [{
      "label": "Create a new post",
      "endpoint": "/internal/menu/post-create"
    }]
  }
}
```

### Actual UI (Imperative Menu Action - DOESN'T WORK)

```
┌─────────────────────────────────────────────────┐
│  r/armchair_sleuths_dev                         │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  Mod Tools  │  Create Post  │  [•••]    │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  When [•••] clicked:                            │
│  ┌──────────────────────────────────────────┐  │
│  │  ✅ 🧪 Test Media Upload API              │  │ ← VISIBLE (from devvit.json)
│  │  ❌ "Create a new post" MISSING           │  │ ← INVISIBLE
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

main.tsx (imperative):
Devvit.addMenuItem({
  label: 'Create a new post',
  onPress: async () => { ... }
});
```

**User Report**: "Menu action disappeared after moving to imperative style"

---

## Execution Flow Comparison

### Standard Devvit (Single Context) - Imperative WORKS ✅

```
┌─────────────────────────────────────────────────────────┐
│              Standard Devvit Architecture                │
│                    (Single Context)                      │
└─────────────────────────────────────────────────────────┘

Build Output:
  dist/main.js  (single bundle)

Execution:
  ┌─────────────────────────────────────────────┐
  │  Platform loads main.js                     │
  │                                             │
  │  ✅ Devvit.configure({ redditAPI: true })   │
  │  ✅ Devvit.addMenuItem({ ... })             │ ← Registered early
  │  ✅ Devvit.addCustomPostType({ ... })       │
  │                                             │
  │  Menu actions registered BEFORE UI render   │
  └─────────────────────────────────────────────┘
            ↓
  ┌─────────────────────────────────────────────┐
  │  Subreddit Menu UI                          │
  │  ✅ Shows imperative menu action            │
  └─────────────────────────────────────────────┘

Timeline:
  T0: Load main.js
  T1: Execute Devvit.addMenuItem()
  T2: Register menu action
  T3: Render UI with menu action
       ✅ Menu action VISIBLE
```

### Web Framework (Dual Context) - Imperative DOESN'T WORK ❌

```
┌─────────────────────────────────────────────────────────┐
│            Web Framework Architecture                    │
│                  (Dual Context)                          │
└─────────────────────────────────────────────────────────┘

Build Output:
  dist/main.js         (Custom Post bundle)
  dist/server/index.cjs (Express server bundle)

Execution:
  ┌──────────────────────────────────────────────┐
  │  Platform reads devvit.json                  │
  │  ✅ Declarative menu actions registered      │ ← Registered HERE
  └──────────────────────────────────────────────┘
            ↓
  ┌──────────────────────────────────────────────┐
  │  Platform renders subreddit UI               │
  │  ✅ Shows declarative menu actions           │
  └──────────────────────────────────────────────┘
            ↓
  ┌──────────────────────────────────────────────┐
  │  Platform loads main.js                      │
  │                                              │
  │  ✅ Devvit.configure({ redditAPI: true })    │
  │  ❌ Devvit.addMenuItem({ ... })              │ ← Too late!
  │  ✅ Devvit.addCustomPostType({ ... })        │
  │                                              │
  │  Menu UI already rendered!                   │
  └──────────────────────────────────────────────┘
            ↓
  ┌──────────────────────────────────────────────┐
  │  Platform loads server/index.cjs             │
  │  Express routes handle menu endpoints        │
  └──────────────────────────────────────────────┘

Timeline:
  T0: Load devvit.json
  T1: Register declarative menu actions
  T2: Render UI with menu actions
       ✅ Declarative menu actions VISIBLE
  T3: Load main.js
  T4: Execute Devvit.addMenuItem()
       ❌ Too late - UI already rendered
       ❌ Menu action NOT VISIBLE
```

---

## Code Comparison: What Works vs What Doesn't

### ❌ DOESN'T WORK: Imperative Menu Action

```typescript
// src/main.tsx
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,
});

// ❌ This does NOT show in UI
Devvit.addMenuItem({
  label: 'Create a new post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    try {
      const subreddit = await context.reddit.getCurrentSubreddit();
      await context.reddit.submitPost({
        title: 'New Mystery Case',
        subredditName: subreddit.name,
        preview: (
          <vstack>
            <text>Loading mystery...</text>
          </vstack>
        ),
      });

      context.ui.showToast('Post created!');
    } catch (error) {
      context.ui.showToast(`Error: ${error.message}`);
    }
  },
});
```

**Result**:
- ❌ Menu action does NOT appear in UI
- ❌ User can't click it
- ❌ Handler never executes
- ✅ Code compiles without errors (misleading!)
- ✅ Appears in built bundle (but doesn't register)

**Why it fails**:
1. Menu UI rendered before main.tsx executes
2. Custom Post context can't control subreddit-level menu
3. Platform doesn't route imperative menu actions from main.tsx

---

### ✅ WORKS: Declarative Menu Action + Scheduler Bridge

#### Step 1: Declare menu action in devvit.json

```json
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

**Result**:
- ✅ Menu action APPEARS in UI
- ✅ User can click it
- ✅ Routes to Express endpoint

#### Step 2: Handle menu action in server context

```typescript
// src/server/index.ts
import { reddit, scheduler, redis } from '@devvit/web/server';
import express from 'express';

const router = express.Router();

router.post('/internal/menu/post-create', async (req, res) => {
  try {
    console.log('📍 Menu action triggered');

    // ❌ Can't use reddit.submitPost() here - no Reddit API access
    // ✅ Instead, trigger scheduler job that runs in main context

    await scheduler.runJob({
      name: 'daily-case-generation',
      runAt: new Date(Date.now() + 1000), // Run in 1 second
      data: {
        source: 'menu-action',
        triggeredAt: new Date().toISOString(),
      }
    });

    console.log('✅ Scheduler job triggered');

    // Return success to menu action (shows toast)
    res.send({
      success: true,
      message: 'Case generation started! Check back in 30-60 seconds.',
    });
  } catch (error) {
    console.error('❌ Menu action error:', error);
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
});

export default router;
```

**Result**:
- ✅ Express handler executes when menu clicked
- ✅ Can access Redis, HTTP, settings
- ❌ Can't use Reddit API directly
- ✅ Scheduler job triggered successfully

#### Step 3: Execute Reddit API call in main context

```typescript
// src/main.tsx
import { Devvit } from '@devvit/public-api';
import { generateDailyCase } from './server/schedulers/DailyCaseScheduler.js';

Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true, // ✅ Reddit API available here
});

Devvit.addSchedulerJob({
  name: 'daily-case-generation',
  onRun: async (event, context) => {
    console.log('🎯 Scheduler job running');

    try {
      // ✅ Has Reddit API access
      const apiKey = await context.settings.get<string>('geminiApiKey');

      // Generate case data
      await generateDailyCase(apiKey);

      // ✅ Create Reddit post
      const subreddit = await context.reddit.getCurrentSubreddit();
      const post = await context.reddit.submitPost({
        title: 'New Mystery Case',
        subredditName: subreddit.name,
        preview: (
          <vstack>
            <text>Loading mystery...</text>
          </vstack>
        ),
      });

      console.log('✅ Post created:', post.id);
    } catch (error) {
      console.error('❌ Scheduler job error:', error);
      throw error;
    }
  }
});
```

**Result**:
- ✅ Scheduler job runs in main context
- ✅ Has Reddit API access
- ✅ Post created successfully
- ✅ User sees toast notification

---

## Architecture Diagrams: Context Separation

### Imperative Menu Action (Attempted - Fails)

```
┌─────────────────────────────────────────────────────────────┐
│                      User Action                             │
│  User clicks menu button → expects to see "Create a new post"│
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    ❌ NOT FOUND
                         │
                         │ (Menu action not registered)
                         │
┌─────────────────────────────────────────────────────────────┐
│  MAIN CONTEXT (dist/main.js)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Devvit.addMenuItem({                                  │  │
│  │   label: 'Create a new post',                         │  │
│  │   onPress: async () => { ... }                        │  │
│  │ });                                                    │  │
│  │                                                        │  │
│  │ ❌ Executes after UI render                           │  │
│  │ ❌ Wrong context for subreddit menu                   │  │
│  │ ❌ Platform doesn't route this to menu UI             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

RESULT: Menu action invisible to users
```

### Declarative Menu Action (Correct - Works)

```
┌──────────────────────────────────────────────────────────────┐
│                        User Action                            │
│  User clicks menu button → sees "Create a new post" → clicks  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  devvit.json (Platform Config)                               │
│  {                                                            │
│    "menu": {                                                  │
│      "items": [{                                              │
│        "label": "Create a new post",                          │
│        "endpoint": "/internal/menu/post-create"               │
│      }]                                                       │
│    }                                                          │
│  }                                                            │
│  ✅ Loaded at startup                                         │
│  ✅ Registers menu UI elements                                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ Routes to endpoint
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVER CONTEXT (dist/server/index.cjs)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ router.post('/internal/menu/post-create', async () => {│  │
│  │   await scheduler.runJob({ name: 'case-gen' });        │  │
│  │   return { success: true };                            │  │
│  │ });                                                     │  │
│  │                                                         │  │
│  │ ✅ Handles menu action                                 │  │
│  │ ✅ Triggers scheduler job                              │  │
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
│  │ Devvit.addSchedulerJob({                               │  │
│  │   name: 'case-gen',                                    │  │
│  │   onRun: async (event, context) => {                   │  │
│  │     await context.reddit.submitPost({ ... });          │  │
│  │   }                                                     │  │
│  │ });                                                     │  │
│  │                                                         │  │
│  │ ✅ Has Reddit API access                               │  │
│  │ ✅ Creates post successfully                           │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

RESULT: Menu action visible and functional
```

---

## Configuration Propagation Visual

### What Devvit.configure() Controls

```
┌─────────────────────────────────────────────────────────────┐
│  src/main.tsx                                               │
│                                                             │
│  Devvit.configure({                                         │
│    redis: true,                                             │
│    http: true,                                              │
│    redditAPI: true                                          │
│  });                                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
┌─────────────────────┐      ┌────────────────────────┐
│  APPLIES TO:        │      │  DOES NOT APPLY TO:    │
│  ✅ Custom Posts     │      │  ❌ Express routes      │
│  ✅ Scheduler jobs   │      │  ❌ Menu actions        │
│  ✅ Triggers         │      │  ❌ src/server/**       │
│  ✅ main.tsx code    │      │  ❌ @devvit/web/server  │
└─────────────────────┘      └────────────────────────┘
```

### Context Isolation

```
┌────────────────────────────────────────────────────────────┐
│                     CONTEXT 1: Main                        │
│                    (dist/main.js)                          │
│                                                            │
│  import { Devvit } from '@devvit/public-api';             │
│  Devvit.configure({ redditAPI: true });                   │
│                                                            │
│  ✅ context.reddit works here                             │
│  ✅ context.settings works here                           │
│  ✅ context.redis works here                              │
└────────────────────────────────────────────────────────────┘

              ⚠️  NO SHARED STATE  ⚠️

┌────────────────────────────────────────────────────────────┐
│                  CONTEXT 2: Server                         │
│               (dist/server/index.cjs)                      │
│                                                            │
│  import { reddit } from '@devvit/web/server';             │
│  // NO Devvit.configure() here                            │
│                                                            │
│  ❌ reddit.submitPost() fails                              │
│  ✅ scheduler.runJob() works                               │
│  ✅ redis.get() works                                      │
└────────────────────────────────────────────────────────────┘

Different package imports = Different instances = No shared config
```

---

## Side-by-Side Comparison Table

| Aspect | Imperative (addMenuItem) | Declarative (devvit.json) |
|--------|-------------------------|---------------------------|
| **Location** | src/main.tsx | devvit.json |
| **Visibility** | ❌ Not shown in UI | ✅ Shows in UI |
| **Registration Time** | After UI render | Before UI render |
| **Execution Context** | Main context (Custom Post) | Server context (Express) |
| **Reddit API Access** | ✅ Yes (via Devvit.configure) | ❌ No (needs scheduler bridge) |
| **Handler Style** | onPress callback | Express route endpoint |
| **Build Process** | Compiled to dist/main.js | Parsed at platform startup |
| **Platform Support** | Standard Devvit only | All Devvit apps |
| **Web Framework** | ❌ Doesn't work | ✅ Works correctly |
| **Dynamic Registration** | ❌ Can't register after load | ❌ Static only |
| **Best Practice** | ❌ Don't use in Web Framework | ✅ Use always |

---

## Timeline Visualization: Why Imperative Fails

```
Platform Startup Timeline:

T0 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Platform loads devvit.json
    ├─ Parses menu actions
    ├─ Registers menu UI elements
    └─ Creates menu action buttons
         ✅ "🧪 Test Media Upload API" registered
         ✅ "Create a new post" registered (if in devvit.json)

T1 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Platform renders subreddit UI
    └─ Menu buttons drawn based on T0 registrations
         ✅ Declarative menu actions visible
         ❌ Imperative menu actions not registered yet

T2 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Platform loads dist/main.js
    ├─ Executes Devvit.configure()
    ├─ Registers Custom Post type
    └─ Executes Devvit.addMenuItem()  ← TOO LATE!
         ❌ Menu UI already rendered at T1
         ❌ Can't add menu items retroactively
         ❌ Menu action not shown to users

T3 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Platform loads dist/server/index.cjs
    └─ Express routes ready to handle menu endpoints

T4 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    User opens subreddit
    └─ Sees menu buttons from T1 registration
         ✅ Declarative menu actions visible
         ❌ Imperative menu actions invisible

┌────────────────────────────────────────────────────────┐
│  KEY INSIGHT:                                          │
│  Menu actions must be registered BEFORE T1             │
│  Imperative actions register at T2 (too late)          │
│  Only declarative actions register at T0 (correct)     │
└────────────────────────────────────────────────────────┘
```

---

## Quick Decision Tree

```
Need to add a menu action to Web Framework app?
  │
  ├─ Want it to show in UI? ─── YES ──→ Use declarative (devvit.json) ✅
  │                            │
  │                            NO ──→ Don't add menu action ❌
  │
  ├─ Need Reddit API access? ── YES ──→ Use scheduler bridge pattern ✅
  │                            │
  │                            NO ──→ Handle directly in Express route ✅
  │
  └─ Consider imperative? ────── NO ──→ Will not show in UI ❌
                                │
                                YES ─→ Switch to Standard Devvit (not Web Framework)
```

---

## Verification Checklist

After implementing menu actions, verify:

```
□ Menu action defined in devvit.json (declarative)
□ Menu action appears in subreddit "..." menu
□ Menu action clickable by moderators
□ Express route handles endpoint correctly
□ Scheduler job registered in main.tsx (if needed)
□ Reddit API calls work via scheduler bridge
□ Error handling implemented
□ Logging added for debugging
□ Toast notifications show to user
□ No Devvit.addMenuItem() calls in main.tsx
```

---

## Summary: The Mental Model

**Wrong Mental Model**:
```
My app = One thing with configuration
  └─ All features share configuration
       ✅ Works in Standard Devvit
       ❌ Doesn't work in Web Framework
```

**Correct Mental Model**:
```
My app = Two separate contexts
  ├─ Main context (dist/main.js)
  │    ✅ Has configuration
  │    ✅ Has Reddit API
  │    ✅ Renders Custom Posts
  │    ✅ Runs scheduler jobs
  │
  └─ Server context (dist/server/index.cjs)
       ❌ Has no configuration
       ❌ No Reddit API access
       ✅ Handles menu actions
       ✅ Uses scheduler bridge to reach main context
```

**The Bridge Pattern**:
```
User clicks menu
  → Server context (handles click)
    → Scheduler job (bridges contexts)
      → Main context (has Reddit API)
        → Creates post
          → User sees result
```

---

**Document Version**: 1.0
**Last Updated**: 2025-10-26
**See Also**: `MENU_ACTION_VISIBILITY_ANALYSIS.md` for detailed technical analysis
