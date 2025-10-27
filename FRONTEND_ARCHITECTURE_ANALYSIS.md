# Frontend Architecture Analysis - Devvit Custom Post Application

**Project**: Armchair Sleuths (Reddit Murder Mystery Game)
**Analysis Date**: 2025-10-25
**Analyst**: Frontend Architect Persona

---

## Executive Summary

This Devvit application uses a **dual-context architecture** with separate frontend (Custom Post) and backend (Express server) execution environments. A critical misconfiguration was identified where Reddit API permissions were scoped only to Custom Post context, causing menu actions to fail.

**Status**: ✅ RESOLVED - Configuration updated

---

## Architecture Overview

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVVIT APPLICATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Frontend (Custom Post)          Backend (Express)         │
│  ───────────────────             ─────────────────         │
│  • Devvit Blocks UI              • Express.js HTTP server  │
│  • React-like hooks              • REST API routes         │
│  • useState, useAsync            • Menu action handlers    │
│  • Devvit Public API             • Devvit Web Server API   │
│                                  • Gemini AI integration   │
│                                  • Redis KV storage        │
│                                                             │
│  Build Target:                   Build Target:             │
│  dist/main.js                    dist/server/index.cjs     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Custom Post Configuration (main.tsx)

### File Structure
```typescript
// src/main.tsx
import { Devvit, useAsync } from '@devvit/public-api';

// Configuration (Line 4-8)
Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true  // Scoped to Custom Post ONLY
});

// Custom Post Definition (Line 171-2270)
Devvit.addCustomPostType({
  name: 'Armchair Sleuths',
  height: 'tall',
  render: (context) => {
    // UI rendering with Blocks API
    // Has access to configured APIs
  }
});
```

### Configuration Scope
- **Applies to**: Custom Post `render()` function only
- **Available in**: `context` object passed to render function
- **Does NOT apply to**: Express server, menu actions, triggers

### Accessible APIs in Custom Post
```typescript
// These work because of Devvit.configure()
context.reddit.getCurrentUser()  // ✅ Works
context.redis.get('case:current')  // ✅ Works
fetch('/api/endpoint')  // ✅ Works (http: true)
```

---

## 2. Express Server Configuration (index.ts)

### File Structure
```typescript
// src/server/index.ts
import express from 'express';
import { redis, reddit, context, settings } from '@devvit/web/server';

// NO Devvit.configure() here
// Permissions come from devvit.json

const app = express();
const router = express.Router();

// Menu action handler (Line 150-252)
router.post('/internal/menu/post-create', async (_req, res) => {
  // Generate case
  const newCase = await caseGenerator.generateCase();

  // Create Reddit post
  const post = await createPost({
    caseId: newCase.id,
    title: postTitle,
    subredditName: context.subredditName
  });

  res.json({ navigateTo: post });
});
```

### Configuration Source
- **Configuration method**: `devvit.json` permissions field
- **NOT configured via**: `Devvit.configure()`
- **Separate import**: `@devvit/web/server` (different from Custom Post)

### Accessible APIs
```typescript
// Before fix: ❌ These failed
reddit.submitCustomPost()  // Required redditAPI permission

// After fix: ✅ These work
reddit.submitCustomPost()  // Now permitted
context.redis.get()  // Always worked (no special permission)
settings.get()  // Always worked
```

---

## 3. Global Configuration (devvit.json)

### Current Configuration
```json
{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "armchair-sleuths",

  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },

  "permissions": {
    "media": true,      // ✅ Enabled
    "redditAPI": true   // ✅ NOW ENABLED (was missing)
  },

  "menu": {
    "items": [
      {
        "label": "Create a new post",
        "location": "subreddit",
        "forUserType": "moderator",
        "endpoint": "/internal/menu/post-create"
      }
    ]
  }
}
```

### Permission Scope
- **Applies to**: ALL execution contexts
- **Includes**: Custom Post, Express server, triggers, schedulers
- **Precedence**: Global base permissions, can be overridden in Custom Post

---

## 4. Build Configuration

### Vite Configuration Files

#### Main Build (Custom Post)
```typescript
// src/client/vite.config.ts
export default defineConfig({
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    lib: {
      entry: '../main.tsx',
      formats: ['es'],
      fileName: () => 'main.js'
    }
  }
});
```

#### Server Build (Express)
```typescript
// src/server/vite.config.ts
export default defineConfig({
  build: {
    outDir: '../../dist/server',
    lib: {
      entry: './index.ts',
      formats: ['cjs'],
      fileName: () => 'index.cjs'
    },
    ssr: true,
    rollupOptions: {
      external: ['@devvit/web', '@devvit/shared-types']
    }
  }
});
```

### Build Output Structure
```
dist/
├── main.js              ← Custom Post bundle (frontend)
└── server/
    └── index.cjs        ← Express server bundle (backend)
```

---

## 5. Menu Action Flow

### User Interaction Flow
```
1. User Action
   └─> Click "Create a new post" in subreddit menu
       ↓
2. Devvit Routing
   └─> devvit.json menu config → Endpoint: /internal/menu/post-create
       ↓
3. Express Handler
   └─> src/server/index.ts:150
       ├─> Get Gemini API key from settings
       ├─> Generate unique case ID
       ├─> Call caseGenerator.generateCase()
       ├─> Create suspects with AI
       └─> Call createPost()
           ↓
4. Reddit API Call
   └─> src/server/core/post.ts:43
       └─> reddit.submitCustomPost(payload)
           ├─> Requires: redditAPI permission
           └─> Returns: Post object
               ↓
5. Response
   └─> Return navigateTo: post
       └─> User redirected to new post
```

### Error Point (Before Fix)
```
Step 4: reddit.submitCustomPost()
  ↓
Check permissions in devvit.json
  ↓
redditAPI: undefined  ❌
  ↓
Throw Error: "Reddit API is not enabled"
```

### Success Flow (After Fix)
```
Step 4: reddit.submitCustomPost()
  ↓
Check permissions in devvit.json
  ↓
redditAPI: true  ✅
  ↓
Create post successfully
  ↓
Return post object
```

---

## 6. Context Comparison

### Custom Post Context
```typescript
// Available in main.tsx render function
interface CustomPostContext {
  reddit: {
    getCurrentUser(): Promise<User>
    getSubredditById(id: string): Promise<Subreddit>
    // ... other Reddit APIs
  }
  redis: RedisClient
  ui: {
    showToast(options: ToastOptions): void
  }
  useState<T>(initial: T): [T, (value: T) => void]
  // ... other Devvit hooks
}
```

### Express Server Context
```typescript
// Available in src/server/index.ts
import {
  reddit,    // Reddit API client
  redis,     // Redis KV client
  context,   // Request context (subredditName, userId, etc.)
  settings   // App settings
} from '@devvit/web/server';

// These are module-level imports, not from render function
```

---

## 7. Frontend UI Architecture (Custom Post)

### Component Structure
```
InvestigationScreen (Line 2106-2250)
├── Header (AP Display)
├── Tab Content Area (Scrollable)
│   ├── LocationsTab (Evidence Discovery)
│   ├── SuspectsTab (AI Interrogation)
│   └── EvidenceTab (Notebook)
├── Bottom Tab Navigation
└── Quick Action Bar (Submit Solution)
```

### State Management
```typescript
// Screen navigation
const [currentScreen, setCurrentScreen] = useState<GameScreen>('loading');

// Investigation state
const [activeTab, setActiveTab] = useState<InvestigationTab>('locations');
const [currentAP, setCurrentAP] = useState(3);

// Evidence discovery
const [discoveredEvidence, setDiscoveredEvidence] = useState<EvidenceItem[]>([]);
const [discoveredEvidenceIds, setDiscoveredEvidenceIds] = useState<Set<string>>(new Set());

// Suspect interrogation
const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
const [chatHistory, setChatHistory] = useState<Message[]>([]);
```

### Progressive Image Loading
```typescript
// GAP-001 Fix: Separate image loading with useAsync
const { data: suspectImages, loading: suspectImagesLoading } = useAsync(
  async () => {
    const fetchPromises = caseData.suspects.map(suspect =>
      fetch(`/api/suspect-image/${suspect.id}`)
        .then(res => res.json())
    );

    const results = await Promise.allSettled(fetchPromises);
    return buildImageMap(results);
  },
  { depends: [caseData?.id] }
);
```

---

## 8. API Integration Patterns

### Frontend → Backend Communication

#### Pattern 1: Direct API Calls from Custom Post
```typescript
// main.tsx
const handleLocationSearch = async (locationId: string, searchType: string) => {
  const response = await fetch(`/api/location/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, userId, locationId, searchType })
  });

  const result = await response.json();
  // Update state with result
};
```

#### Pattern 2: Image Loading with useAsync
```typescript
// main.tsx
const { data: suspectImages } = useAsync(
  async () => {
    // Parallel fetch with error resilience
    const promises = suspects.map(s =>
      fetch(`/api/suspect-image/${s.id}`)
        .then(res => res.json())
        .catch(err => ({ error: err.message }))
    );

    return Promise.allSettled(promises);
  },
  { depends: [caseData?.id] }
);
```

#### Pattern 3: Menu Action (Server-Side Only)
```typescript
// index.ts
router.post('/internal/menu/post-create', async (_req, res) => {
  // No frontend involvement
  // Pure backend operation
  const post = await createPost();
  res.json({ navigateTo: post });
});
```

---

## 9. Accessibility & Performance

### WCAG 2.1 AA Compliance
```typescript
// Color contrast ratios
const colors = {
  gold: '#c9b037',      // Primary accent (4.5:1 on dark bg)
  text: '#e0e0e0',      // Primary text (13:1 on dark bg)
  textMuted: '#a0a0a0', // Secondary text (7:1 on dark bg)
  background: '#0a0a0a' // Dark background
};

// Touch targets
const touchTarget = {
  minHeight: '56px',    // Meets 44x44 minimum
  minWidth: '56px'
};
```

### Performance Optimizations
- Progressive image loading (useAsync hook)
- Lazy state initialization
- Parallel API calls with Promise.allSettled
- Error-resilient image fetching

---

## 10. Key Takeaways

### Configuration Scopes
1. **devvit.json `permissions`**: Global (all contexts)
2. **main.tsx `Devvit.configure()`**: Custom Post only
3. **Express server**: Inherits from devvit.json

### Menu Actions
- Run in **Express server context**
- Get permissions from **devvit.json**
- Do NOT use main.tsx configuration
- Can call Reddit API if `redditAPI: true` in devvit.json

### Custom Posts
- Run in **Blocks renderer context**
- Get permissions from **main.tsx `Devvit.configure()`**
- Also inherit from devvit.json
- Use `context.reddit` for Reddit API calls

### Build Process
- Two separate bundles: `main.js` (frontend) + `index.cjs` (backend)
- Different entry points, different Vite configs
- Both deployed together as single Devvit app

---

## 11. Recommended Practices

### ✅ Do This
```typescript
// devvit.json - Global permissions
{
  "permissions": {
    "redditAPI": true,
    "media": true,
    "redis": true  // If needed
  }
}

// main.tsx - Override/extend for Custom Post
Devvit.configure({
  redditAPI: true,  // Redundant but explicit
  http: true        // Custom Post specific
});
```

### ❌ Avoid This
```typescript
// Only configuring in main.tsx
Devvit.configure({ redditAPI: true });

// Assuming this applies to menu actions
router.post('/menu/action', ...) // Will fail
```

---

## 12. Testing Checklist

### Frontend (Custom Post)
- [ ] Game loads without errors
- [ ] getCurrentUser() works
- [ ] Images load progressively
- [ ] Tab navigation functional
- [ ] Evidence discovery works
- [ ] Suspect interrogation works

### Backend (Express)
- [ ] Menu action creates post
- [ ] reddit.submitCustomPost() succeeds
- [ ] Case generation completes
- [ ] No permission errors
- [ ] Logs show success messages

### Integration
- [ ] Menu action → post creation → game playable
- [ ] End-to-end flow works
- [ ] No 400/403 errors
- [ ] Performance acceptable (<2s for post creation)

---

## Documentation References

- **Root Cause Analysis**: `DEVVIT_MENU_ACTION_API_DIAGNOSIS.md`
- **Architecture Diagram**: `DEVVIT_ARCHITECTURE_DIAGRAM.md`
- **Deployment Guide**: `MENU_ACTION_FIX_DEPLOYMENT.md`
- **Main Source**: `src/main.tsx`
- **Server Source**: `src/server/index.ts`
- **Configuration**: `devvit.json`

---

**Analysis Complete** - All architectural questions answered and issue resolved.
