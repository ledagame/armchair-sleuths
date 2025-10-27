# Player State Initialization Flow

## Current Flow (Broken)

```
┌─────────┐                  ┌──────────┐                ┌─────────────┐
│ Client  │                  │ Case API │                │  KV Store   │
└────┬────┘                  └────┬─────┘                └──────┬──────┘
     │                            │                              │
     │  GET /api/case/:caseId     │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │                            │  Fetch case data             │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │                            │  Case data                   │
     │                            │<─────────────────────────────┤
     │                            │                              │
     │  200 OK (case data)        │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
     │  GET /api/player-state/    │                              │
     │      :caseId/:userId       │                              │
     ├───────────────────────────────────────────────────────────>│
     │                            │                              │
     │                            │  Query player state          │
     │                            │                              │
     │                            │  ❌ NOT FOUND                │
     │  ❌ 404 NOT FOUND          │                              │
     │<───────────────────────────────────────────────────────────┤
     │                            │                              │
     │  😢 Error: Cannot start    │                              │
     │      game                  │                              │
     │                            │                              │
```

**Problem**: Player state is never created, so API returns 404.

---

## Fixed Flow (Auto-Initialize)

```
┌─────────┐                  ┌──────────┐                ┌─────────────┐
│ Client  │                  │ Case API │                │  KV Store   │
└────┬────┘                  └────┬─────┘                └──────┬──────┘
     │                            │                              │
     │  GET /api/case/:caseId     │                              │
     │      ?userId=user123       │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │                            │  Fetch case data             │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │                            │  Case data                   │
     │                            │<─────────────────────────────┤
     │                            │                              │
     │                            │  ✅ Check player state       │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │                            │  ❌ NOT FOUND                │
     │                            │<─────────────────────────────┤
     │                            │                              │
     │                            │  ✅ AUTO-CREATE              │
     │                            │  Initialize state:           │
     │                            │  - current AP: 3             │
     │                            │  - discovered: []            │
     │                            │  - searches: []              │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │                            │  ✅ SAVED                    │
     │                            │<─────────────────────────────┤
     │                            │                              │
     │  200 OK (case data +       │                              │
     │         playerInitialized) │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
     │  GET /api/player-state/    │                              │
     │      :caseId/:userId       │                              │
     ├───────────────────────────────────────────────────────────>│
     │                            │                              │
     │                            │  Query player state          │
     │                            │                              │
     │                            │  ✅ FOUND                    │
     │  ✅ 200 OK (player state)  │                              │
     │<───────────────────────────────────────────────────────────┤
     │                            │                              │
     │  😊 Game starts            │                              │
     │      successfully!         │                              │
     │                            │                              │
```

**Solution**: Auto-initialize player state when case is accessed with userId.

---

## Fallback Flow (Double Safety)

```
┌─────────┐                  ┌──────────────┐            ┌─────────────┐
│ Client  │                  │ Player State │            │  KV Store   │
│         │                  │     API      │            │             │
└────┬────┘                  └──────┬───────┘            └──────┬──────┘
     │                              │                            │
     │  GET /api/player-state/      │                            │
     │      :caseId/:userId         │                            │
     ├─────────────────────────────>│                            │
     │                              │                            │
     │                              │  Query player state        │
     │                              ├───────────────────────────>│
     │                              │                            │
     │                              │  ❌ NOT FOUND              │
     │                              │<───────────────────────────┤
     │                              │                            │
     │                              │  ⚠️ Verify case exists     │
     │                              ├───────────────────────────>│
     │                              │                            │
     │                              │  ✅ Case exists            │
     │                              │<───────────────────────────┤
     │                              │                            │
     │                              │  ✅ AUTO-CREATE            │
     │                              │  (fallback safety net)     │
     │                              ├───────────────────────────>│
     │                              │                            │
     │                              │  ✅ SAVED                  │
     │                              │<───────────────────────────┤
     │                              │                            │
     │  ✅ 200 OK (player state)    │                            │
     │<─────────────────────────────┤                            │
     │                              │                            │
     │  😊 Game continues           │                            │
     │                              │                            │
```

**Benefit**: Even if auto-init in case API fails, player state API creates it as fallback.

---

## Error Handling Flow

```
┌─────────┐                  ┌──────────────┐            ┌─────────────┐
│ Client  │                  │ Player State │            │  KV Store   │
│         │                  │     API      │            │             │
└────┬────┘                  └──────┬───────┘            └──────┬──────┘
     │                              │                            │
     │  GET /api/player-state/      │                            │
     │      undefined/user123       │                            │
     ├─────────────────────────────>│                            │
     │                              │                            │
     │                              │  ⚠️ VALIDATE INPUT         │
     │                              │  caseId = 'undefined' ❌   │
     │                              │                            │
     │  ❌ 400 Bad Request           │                            │
     │  { error: "Invalid caseId" } │                            │
     │<─────────────────────────────┤                            │
     │                              │                            │
     │  GET /api/player-state/      │                            │
     │      case-123/undefined      │                            │
     ├─────────────────────────────>│                            │
     │                              │                            │
     │                              │  ⚠️ VALIDATE INPUT         │
     │                              │  userId = 'undefined' ❌   │
     │                              │                            │
     │  ❌ 400 Bad Request           │                            │
     │  { error: "Invalid userId" } │                            │
     │<─────────────────────────────┤                            │
     │                              │                            │
     │  GET /api/player-state/      │                            │
     │      invalid-case/user123    │                            │
     ├─────────────────────────────>│                            │
     │                              │                            │
     │                              │  Query case                │
     │                              ├───────────────────────────>│
     │                              │                            │
     │                              │  ❌ Case NOT FOUND         │
     │                              │<───────────────────────────┤
     │                              │                            │
     │  ❌ 404 Not Found             │                            │
     │  { error: "Case not found" } │                            │
     │<─────────────────────────────┤                            │
     │                              │                            │
```

**Benefit**: Clear error messages instead of generic 404s.

---

## Action Points Integration Flow

```
┌─────────┐                  ┌──────────┐                ┌─────────────┐
│ Client  │                  │ Game API │                │  KV Store   │
└────┬────┘                  └────┬─────┘                └──────┬──────┘
     │                            │                              │
     │  1. GET /api/case/         │                              │
     │     case-123?userId=alice  │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │                            │  ✅ Auto-init player state   │
     │                            │  - AP: 3                     │
     │                            │  - acquired: []              │
     │                            │  - spent: 0                  │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │  ✅ 200 OK                 │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
     │  2. POST /api/chat/        │                              │
     │     suspect-1              │                              │
     │     { message: "alibi?" }  │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │                            │  Fetch player state          │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │                            │  State (AP: 3)               │
     │                            │<─────────────────────────────┤
     │                            │                              │
     │                            │  ✅ Analyze conversation     │
     │                            │  Topic: alibi → +1 AP        │
     │                            │                              │
     │                            │  Update state (AP: 4)        │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │  ✅ 200 OK                 │                              │
     │  { apGained: 1,            │                              │
     │    newTotal: 4 }           │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
     │  3. POST /api/location/    │                              │
     │     search                 │                              │
     │     { type: "thorough" }   │                              │
     ├───────────────────────────>│                              │
     │                            │                              │
     │                            │  Fetch player state          │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │                            │  State (AP: 4)               │
     │                            │<─────────────────────────────┤
     │                            │                              │
     │                            │  ✅ Deduct AP (4 - 2 = 2)    │
     │                            │  ✅ Discover evidence        │
     │                            │                              │
     │                            │  Update state (AP: 2)        │
     │                            ├─────────────────────────────>│
     │                            │                              │
     │  ✅ 200 OK                 │                              │
     │  { evidenceFound: [...],   │                              │
     │    currentAP: 2 }          │                              │
     │<───────────────────────────┤                              │
     │                            │                              │
```

**Key**: Player state persists across all game actions (chat, search, etc.)

---

## State Persistence Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Client State                         │
│  - Current AP displayed                                │
│  - Discovered evidence list                            │
│  - Search history                                      │
└────────────────────┬───────────────────────────────────┘
                     │
                     │ Sync via API calls
                     │
┌────────────────────▼───────────────────────────────────┐
│                 Server State (KV Store)                │
│                                                        │
│  Key: player-state:case-123:alice                      │
│  Value: {                                              │
│    caseId: "case-123",                                 │
│    userId: "alice",                                    │
│    actionPoints: {                                     │
│      current: 2,                                       │
│      total: 4,                                         │
│      spent: 2,                                         │
│      initial: 3,                                       │
│      acquisitionHistory: [                             │
│        { timestamp, amount: 1, source: "topic" }       │
│      ],                                                │
│      spendingHistory: [                                │
│        { timestamp, amount: 2, action: "thorough" }    │
│      ],                                                │
│      acquiredTopics: Set("suspect-1:alibi"),           │
│      bonusesAcquired: Set(),                           │
│      emergencyAPUsed: false                            │
│    },                                                  │
│    discoveredEvidence: [                               │
│      { evidenceId, discoveredAt, method, locationId }  │
│    ],                                                  │
│    searchHistory: [                                    │
│      { locationId, searchType, timestamp, found: 3 }   │
│    ],                                                  │
│    stats: {                                            │
│      totalSearches: 1,                                 │
│      thoroughSearches: 1,                              │
│      totalEvidenceFound: 3,                            │
│      criticalEvidenceFound: 1,                         │
│      efficiency: 30.0                                  │
│    },                                                  │
│    lastUpdated: "2025-10-23T10:30:00Z"                 │
│  }                                                     │
└────────────────────────────────────────────────────────┘
```

---

## Data Flow Summary

```
START
  │
  ├─> Player accesses game
  │   └─> GET /api/case/:caseId?userId=X
  │       ├─> Fetch case from KV store
  │       ├─> Check if player state exists
  │       ├─> If missing: AUTO-CREATE ✅
  │       │   ├─> Initialize AP (3)
  │       │   ├─> Initialize empty arrays
  │       │   └─> Save to KV store
  │       └─> Return case + playerInitialized: true
  │
  ├─> Player checks state
  │   └─> GET /api/player-state/:caseId/:userId
  │       ├─> Fetch from KV store
  │       ├─> If missing: AUTO-CREATE (fallback) ✅
  │       └─> Return state (always 200 OK)
  │
  ├─> Player chats with suspect
  │   └─> POST /api/chat/:suspectId
  │       ├─> Analyze conversation
  │       ├─> Award AP for topics
  │       ├─> Update player state
  │       └─> Return response + AP gained
  │
  ├─> Player searches location
  │   └─> POST /api/location/search
  │       ├─> Check AP availability
  │       ├─> Deduct AP (1/2/3)
  │       ├─> Discover evidence
  │       ├─> Update player state
  │       └─> Return evidence + remaining AP
  │
  └─> Player submits answer
      └─> POST /api/submit
          ├─> Validate answers
          ├─> Calculate score
          └─> Update leaderboard
END
```

---

## Key Takeaways

1. **Auto-Initialize**: Player state created automatically on first access
2. **Double Safety**: Fallback creation if primary init fails
3. **Validation**: Clear errors for invalid input
4. **Persistence**: All game progress saved to KV store
5. **Zero 404s**: Always return valid state or clear error

---

**Visual Legend**:
- ✅ = Success path
- ❌ = Error path
- ⚠️ = Validation/Warning
- 😊 = Happy player
- 😢 = Frustrated player

**Created**: 2025-10-23
**Status**: Implementation Ready
