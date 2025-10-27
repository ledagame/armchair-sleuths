# Dual UI Migration Visual Guide

**Quick Reference:** Visual diagrams for understanding the dual UI architecture and migration strategy

---

## 1. Current State: Dual UI System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       REDDIT POST (Game Entry Point)                     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ User clicks post
                                 ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                       devvit.json (Routing Config)                       │
│                                                                           │
│  IF post.entrypoints EXISTS:                                             │
│    → Load WebView UI (dist/client/index.html)  ← CURRENT                │
│                                                                           │
│  IF post.entrypoints ABSENT:                                             │
│    → Load Blocks UI (dist/main.js)              ← FUTURE                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ↓                         ↓
    ┌───────────────────────────┐ ┌──────────────────────────┐
    │   WebView UI (Active)     │ │ Blocks UI (Dormant)      │
    ├───────────────────────────┤ ├──────────────────────────┤
    │ Tech: React + Vite        │ │ Tech: Devvit Blocks      │
    │ State: React hooks        │ │ State: Devvit useState   │
    │ Style: Tailwind CSS       │ │ Style: Devvit props      │
    │ Anim: Framer Motion       │ │ Anim: None (not supported)│
    │ Components: 55+           │ │ Components: Blocks only  │
    │                           │ │                          │
    │ Advantages:               │ │ Advantages:              │
    │ ✅ Rich animations        │ │ ✅ Native Reddit feel    │
    │ ✅ Full CSS control       │ │ ✅ Better mobile UX      │
    │ ✅ Battle-tested          │ │ ✅ Faster load on Reddit │
    │                           │ │                          │
    │ Disadvantages:            │ │ Disadvantages:           │
    │ ❌ Slower load            │ │ ❌ No animations         │
    │ ❌ Not native Reddit      │ │ ❌ Limited styling       │
    └───────────┬───────────────┘ └───────────┬──────────────┘
                │                             │
                │ HTTP API Calls              │ HTTP API Calls
                │ (fetch)                     │ (fetch)
                │                             │
                └────────────┬────────────────┘
                             ↓
    ┌────────────────────────────────────────────────────────┐
    │           Backend Express Server (Shared)              │
    │                                                         │
    │ ✅ UI-Agnostic (works with both)                       │
    │ ✅ Same API endpoints                                  │
    │ ✅ Same Redis storage                                  │
    │ ✅ Same game logic                                     │
    │                                                         │
    │ Key APIs:                                              │
    │ - GET  /api/case/today                                 │
    │ - POST /api/location/search                            │
    │ - POST /api/chat/:suspectId                            │
    │ - POST /api/submit                                     │
    └────────────────────────────────────────────────────────┘
```

---

## 2. Migration Flow: Step-by-Step

### Step 1: Current State (WebView Active)

```
User → Reddit Post
         ↓
     devvit.json
       "post": {
         "entrypoints": {          ← THIS LINE ACTIVATES WEBVIEW
           "default": {
             "entry": "index.html"
           }
         }
       }
         ↓
     WebView UI Loads
     (React app in iframe)
         ↓
     fetch('/api/case/today')
         ↓
     Express Backend
         ↓
     Game Works ✅
```

### Step 2: Migration (Remove entrypoints)

```
devvit.json BEFORE:                devvit.json AFTER:
{                                  {
  "post": {                          "post": {
    "dir": "dist/client",              // No entrypoints field
    "entrypoints": {              →    // (remove entire block)
      "default": {
        "entry": "index.html"
      }
    }
  }                                  }
}                                  }
```

### Step 3: New State (Blocks Active)

```
User → Reddit Post
         ↓
     devvit.json
       "post": {
         // No entrypoints       ← BLOCKS UI ACTIVATES BY DEFAULT
       }
         ↓
     Blocks UI Loads
     (Devvit Custom Post Type)
         ↓
     fetch('/api/case/today')
         ↓
     Express Backend
     (SAME AS BEFORE)
         ↓
     Game Works ✅
```

---

## 3. API Compatibility Matrix

### Color Legend
- 🟢 **Fully Compatible** - No changes needed
- 🟡 **Minor Differences** - Handled automatically
- 🔴 **Breaking Change** - Migration required

### Endpoint Comparison

```
┌────────────────────────────┬────────────┬────────────┬────────────┐
│ Endpoint                   │ WebView    │ Blocks     │ Status     │
├────────────────────────────┼────────────┼────────────┼────────────┤
│ GET /api/case/today        │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
│ GET /api/case/:caseId      │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
│ POST /api/location/search  │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
│ POST /api/chat/:suspectId  │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
│ POST /api/submit           │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
│ GET /api/player-state/...  │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
│ GET /api/suspect-image/... │ ✅ Yes     │ ✅ Yes     │ 🟢 Compatible │
└────────────────────────────┴────────────┴────────────┴────────────┘

VERDICT: 🟢 100% API COMPATIBILITY
```

### Request/Response Format Comparison

```
WebView Request:                    Blocks Request:
POST /api/location/search           POST /api/location/search
{                                   {
  "caseId": "case-123",              "caseId": "case-123",
  "userId": "user_abc",              "userId": "user_abc",
  "locationId": "loc-001",           "locationId": "loc-001",
  "searchType": "thorough"           "searchType": "thorough"
}                                   }

      ↓                                     ↓
Backend Response (IDENTICAL):
{
  "success": true,
  "evidenceFound": [...],
  "playerState": {
    "currentAP": 5,
    "totalAP": 8
  }
}
```

**Result:** Identical request/response format → Zero migration needed

---

## 4. State Persistence Architecture

### How State Survives UI Migration

```
┌─────────────────────────────────────────────────────────────────┐
│ Time T0: User playing in WebView                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WebView UI (React)                                             │
│    ↓                                                            │
│  User searches location                                         │
│    ↓                                                            │
│  POST /api/location/search                                      │
│    ↓                                                            │
│  Backend saves to Redis:                                        │
│    playerState:case-123:user_abc → {                            │
│      discoveredEvidence: ["ev-001", "ev-002"],                  │
│      actionPoints: {                                            │
│        current: 5,                                              │
│        spent: 2                                                 │
│      }                                                           │
│    }                                                             │
│                                                                 │
│  ✅ State persisted in Redis                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Time T1: Migration happens (devvit.json changed)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  - WebView disabled                                             │
│  - Blocks UI enabled                                            │
│  - Backend unchanged                                            │
│  - Redis data intact                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ Time T2: User refreshes post                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Blocks UI (Devvit)                                             │
│    ↓                                                            │
│  context.useState(async () => {                                 │
│    const response = await fetch('/api/player-state/...');      │
│  })                                                              │
│    ↓                                                            │
│  Backend reads from Redis:                                      │
│    playerState:case-123:user_abc → {                            │
│      discoveredEvidence: ["ev-001", "ev-002"],  ← SAME DATA   │
│      actionPoints: {                                            │
│        current: 5,                              ← SAME DATA   │
│        spent: 2                                 ← SAME DATA   │
│      }                                                           │
│    }                                                             │
│    ↓                                                            │
│  ✅ User continues exactly where they left off                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight:** Redis is the single source of truth, survives UI switch

---

## 5. Deployment Strategy: Blue-Green Rollout

### Timeline Visualization

```
Week 1: Preparation
┌────────────────────────────────────────────────────────────────┐
│ Day 1-3: Code review, testing, staging deployment             │
│ Day 4-7: Bug fixes, performance optimization                  │
└────────────────────────────────────────────────────────────────┘

Week 2: Gradual Rollout
┌────────────────────────────────────────────────────────────────┐
│ Day 8-9:   5% traffic to Blocks    [▓░░░░░░░░░░░░░░░░░░░]  5%│
│ Day 10-12: 25% traffic to Blocks   [▓▓▓▓▓░░░░░░░░░░░░░░░] 25%│
│ Day 13-14: 50% traffic to Blocks   [▓▓▓▓▓▓▓▓▓▓░░░░░░░░░] 50%│
└────────────────────────────────────────────────────────────────┘

Week 3-4: Scale to 100%
┌────────────────────────────────────────────────────────────────┐
│ Day 15-18: 75% traffic to Blocks   [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░] 75%│
│ Day 19-21: 100% traffic to Blocks  [▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓] 100%│
│ Day 22-30: Monitor and optimize                                │
└────────────────────────────────────────────────────────────────┘

Monitoring Points:
  📊 Error rate    < 5% (rollback trigger)
  ⏱️  Load time     < 3s (performance target)
  📈 Redis latency < 50ms (backend health)
  👥 User feedback  Positive (sentiment analysis)
```

### Rollback Trigger Matrix

```
┌────────────────────────┬─────────────┬────────────────────────┐
│ Metric                 │ Threshold   │ Action                 │
├────────────────────────┼─────────────┼────────────────────────┤
│ Error Rate             │ > 5%        │ 🔴 Immediate rollback │
│ Load Time              │ > 5s        │ 🟡 Investigate first  │
│ Redis Connection Fails │ > 10 errors │ 🔴 Immediate rollback │
│ User Complaints        │ > 20/day    │ 🟡 Review feedback    │
│ API 500 Errors         │ > 50/hour   │ 🔴 Immediate rollback │
└────────────────────────┴─────────────┴────────────────────────┘

Rollback Procedure (5 minutes):
  1. Restore devvit.json (add post.entrypoints)
  2. Deploy: devvit upload
  3. Verify WebView loads
  4. Communicate to users
```

---

## 6. Configuration Change: The Single Line

### The Only Change Needed

```diff
// File: devvit.json

{
  "$schema": "https://developers.reddit.com/schema/config-file.v1.json",
  "name": "armchair-sleuths",
  "post": {
-   "dir": "dist/client",
-   "entrypoints": {
-     "default": {
-       "entry": "index.html"
-     }
-   }
+   // Remove entire entrypoints block to enable Blocks UI
  },
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  }
}
```

**That's it.** One configuration change, zero backend changes.

---

## 7. Backend Architecture (Unchanged)

### Request Flow Comparison

#### WebView Request Flow:
```
User clicks button in React
  ↓
onClick handler
  ↓
const response = await fetch('/api/location/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ caseId, userId, locationId, searchType })
})
  ↓
Backend Express router
  ↓
EvidenceDiscoveryService.searchLocation()
  ↓
Redis.get('playerState:...')
  ↓
Process evidence discovery
  ↓
Redis.set('playerState:...')
  ↓
Response JSON
  ↓
React state update (setDiscoveredEvidence)
  ↓
Component re-renders
```

#### Blocks Request Flow:
```
User clicks button in Blocks
  ↓
onPress handler
  ↓
const response = await fetch('/api/location/search', {  ← IDENTICAL
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ caseId, userId, locationId, searchType })
})
  ↓
Backend Express router          ← IDENTICAL
  ↓
EvidenceDiscoveryService.searchLocation()  ← IDENTICAL
  ↓
Redis.get('playerState:...')    ← IDENTICAL
  ↓
Process evidence discovery      ← IDENTICAL
  ↓
Redis.set('playerState:...')    ← IDENTICAL
  ↓
Response JSON                   ← IDENTICAL
  ↓
Devvit state update (setDiscoveredEvidence)
  ↓
Blocks re-render
```

**Difference:** Only the first and last steps (UI layer)
**Backend:** 100% identical

---

## 8. Risk Heatmap

### Visual Risk Assessment

```
┌─────────────────────────────────────────────────────────────┐
│                    RISK SEVERITY MATRIX                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  High   │              │  UX Change  │              │       │
│  Impact │              │  🟡 M       │              │       │
│         │              │             │              │       │
│         ├──────────────┼─────────────┼──────────────┼──────│
│         │              │             │  Performance │      │
│  Medium │              │  Blocks Bugs│  🟡 M       │      │
│  Impact │              │  🟡 M       │             │      │
│         │              │             │             │      │
│         ├──────────────┼─────────────┼──────────────┼──────│
│         │ API Issues   │ State Loss  │ Redis Issue  │     │
│  Low    │ 🟢 L        │ 🟢 L        │ 🟢 L         │     │
│  Impact │             │             │              │     │
│         └──────────────┴─────────────┴──────────────┴──────┘
│              Low           Medium         High              │
│            Probability   Probability   Probability          │
└─────────────────────────────────────────────────────────────┘

Legend:
  🟢 Low Risk (L) - Minimal concern, standard monitoring
  🟡 Medium Risk (M) - Monitor closely, mitigate proactively
  🔴 High Risk (H) - Critical concern, requires immediate attention
```

### Mitigation Summary

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **API Incompatibility** | 🟢 Very Low | 🔴 Critical | Already validated - 100% compatible |
| **State Loss** | 🟢 Very Low | 🔴 Critical | Redis persistence prevents loss |
| **Performance Degradation** | 🟡 Medium | 🟡 Medium | Gradual rollout catches issues early |
| **UX Confusion** | 🔴 High | 🟡 Medium | User communication + gradual rollout |
| **Blocks UI Bugs** | 🟡 Medium | 🟡 Medium | Thorough testing + quick rollback |
| **Redis Issues** | 🟢 Low | 🟡 Medium | Already battle-tested in production |

**Overall Risk Level:** 🟡 **MEDIUM** (Manageable with proper rollout)

---

## 9. Success Metrics Dashboard

### What to Monitor

```
┌────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT HEALTH DASHBOARD                  │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Error Rate:           2.1%  [████░░░░░░░░░░░░░░░░] 5% max │
│  ✅ Load Time:            2.3s  [████░░░░░░░░░░░░░░░░] 3s max │
│  ✅ API Latency:         45ms   [████░░░░░░░░░░░░░░░░] 100ms  │
│  ✅ Redis Connections:    98%   [██████████████████░░] 95% min│
│  ⚠️  User Satisfaction:   7.5/10 [███████████░░░░░░░] 8.0 goal│
│                                                                 │
│  Recent Errors (Last Hour):                                     │
│    - TypeError in EvidenceCard: 3 occurrences                  │
│    - Redis timeout: 1 occurrence                               │
│    - Image load failure: 5 occurrences                         │
│                                                                 │
│  Action Required:                                               │
│    🟡 Investigate image load failures (not critical)          │
│    🟢 All other metrics within acceptable range               │
└────────────────────────────────────────────────────────────────┘
```

### Target Metrics

| Metric | Target | Rollback Trigger |
|--------|--------|------------------|
| Error Rate | < 3% | > 5% |
| Load Time | < 3s | > 5s |
| API Latency | < 100ms | > 500ms |
| Redis Uptime | > 99% | < 95% |
| User Satisfaction | > 8/10 | < 6/10 |

---

## 10. Quick Reference Card

### Cheat Sheet for Engineers

```
╔════════════════════════════════════════════════════════════════╗
║              DUAL UI MIGRATION QUICK REFERENCE                 ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  Q: Which UI is currently active?                              ║
║  A: Check devvit.json for post.entrypoints                     ║
║     - Present → WebView (React)                                ║
║     - Absent → Blocks (Devvit)                                 ║
║                                                                 ║
║  Q: How to switch between UIs?                                 ║
║  A: Edit devvit.json:                                          ║
║     - Add post.entrypoints → Enable WebView                    ║
║     - Remove post.entrypoints → Enable Blocks                  ║
║     Then: devvit upload                                         ║
║                                                                 ║
║  Q: Do I need to change backend code?                          ║
║  A: NO. Backend is 100% UI-agnostic.                           ║
║                                                                 ║
║  Q: Will user state be lost during migration?                  ║
║  A: NO. State persists in Redis.                               ║
║                                                                 ║
║  Q: How to rollback if migration fails?                        ║
║  A: Restore post.entrypoints in devvit.json, deploy.           ║
║     Takes ~5 minutes.                                           ║
║                                                                 ║
║  Q: Which files control which UI?                              ║
║  A: WebView:  src/client/** (React)                            ║
║     Blocks:   src/main.tsx (Devvit)                            ║
║     Backend:  src/server/** (Shared)                           ║
║                                                                 ║
║  Q: Are API endpoints identical?                               ║
║  A: YES. 100% compatible.                                      ║
║                                                                 ║
║  Q: Biggest risk during migration?                             ║
║  A: User confusion (different UX).                             ║
║     Mitigation: Gradual rollout + communication.               ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 11. Build System Diagram

### Three Separate Builds

```
┌──────────────────────────────────────────────────────────────┐
│                      npm run build                            │
└────────────────┬─────────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┬─────────────────┐
       ↓                   ↓                 ↓
┌──────────────┐  ┌─────────────────┐  ┌────────────┐
│ build:client │  │  build:server   │  │ build:main │
├──────────────┤  ├─────────────────┤  ├────────────┤
│ Vite builds: │  │ Vite builds:    │  │ Vite builds│
│ src/client/  │  │ src/server/     │  │ src/main.tsx│
│    ↓         │  │    ↓            │  │    ↓       │
│ Output:      │  │ Output:         │  │ Output:    │
│ dist/client/ │  │ dist/server/    │  │ dist/main.js│
│ - index.html │  │ - index.cjs     │  │            │
│ - index.js   │  │ (Express)       │  │ (Blocks)   │
│ - index.css  │  │                 │  │            │
└──────────────┘  └─────────────────┘  └────────────┘
      │                   │                   │
      └───────────────────┴───────────────────┘
                          │
                          ↓
              ┌───────────────────────┐
              │   dist/ (Final)       │
              ├───────────────────────┤
              │ ├─ client/            │
              │ │  └─ index.html      │ ← WebView UI
              │ ├─ server/            │
              │ │  └─ index.cjs       │ ← Backend API
              │ └─ main.js            │ ← Blocks UI
              └───────────────────────┘
```

### devvit.json Loading Behavior

```
Devvit Platform Startup:

1. Read devvit.json
   ↓
2. Check post.entrypoints
   ↓
   ├─ IF PRESENT:
   │    Load dist/client/index.html  → WebView UI
   │
   └─ IF ABSENT:
        Load dist/main.js             → Blocks UI

3. Load dist/server/index.cjs        → Backend (always)

4. Platform Ready
```

---

## 12. Testing Strategy Visual

### Test Coverage Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                      TESTING PYRAMID                            │
│                                                                 │
│                          E2E Tests                              │
│                         ┌──────────┐                            │
│                         │ WebView  │                            │
│                         │ E2E: 10  │                            │
│                         └──────────┘                            │
│                         ┌──────────┐                            │
│                         │ Blocks   │                            │
│                         │ E2E: 10  │                            │
│                         └──────────┘                            │
│                                                                 │
│                    Integration Tests                            │
│              ┌────────────────────────────┐                     │
│              │ API Endpoint Tests: 25     │                     │
│              │ Redis Integration: 15      │                     │
│              │ Service Layer: 20          │                     │
│              └────────────────────────────┘                     │
│                                                                 │
│                     Unit Tests                                  │
│         ┌──────────────────────────────────────┐               │
│         │ Components: 55                       │               │
│         │ Services: 30                         │               │
│         │ Utilities: 20                        │               │
│         │ Hooks: 15                            │               │
│         └──────────────────────────────────────┘               │
│                                                                 │
└────────────────────────────────────────────────────────────────┘

Test Execution Strategy:
  1. Unit tests (fast feedback)          → Run on every commit
  2. Integration tests (API contracts)   → Run on PR
  3. E2E tests (full user flows)         → Run before deployment
```

---

## 13. Final Decision Tree

### Should I Migrate Now?

```
START: Should we migrate to Blocks UI?
  ↓
Is backend 100% compatible?
  ├─ NO → ❌ Fix backend first
  └─ YES →
      ↓
Is Blocks UI feature-complete?
  ├─ NO → ❌ Complete Blocks UI first
  └─ YES →
      ↓
Have we tested on staging?
  ├─ NO → ❌ Deploy to staging first
  └─ YES →
      ↓
Do we have rollback plan?
  ├─ NO → ❌ Create rollback procedure
  └─ YES →
      ↓
Is team ready for gradual rollout?
  ├─ NO → ❌ Train team + prepare monitoring
  └─ YES →
      ↓
  ✅ PROCEED WITH MIGRATION
      ↓
  Use Blue-Green Deployment
      ↓
  5% → 25% → 50% → 100%
      ↓
  Monitor continuously
      ↓
  ✅ SUCCESS
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-27
**Purpose:** Visual quick reference for engineers
**Status:** Ready for team review
