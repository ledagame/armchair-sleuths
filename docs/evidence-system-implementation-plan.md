# Evidence System Implementation Plan

## Quick Fix: Resolve 404 Player State Error

**Priority**: CRITICAL
**Estimated Time**: 2 hours
**Status**: Ready to implement

---

## File Changes Required

### 1. Fix Player State Auto-Initialization

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts`

#### Change #1: Modify `/api/case/:caseId` endpoint (Line ~725)

```typescript
// BEFORE
router.get('/api/case/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;
    const language = (req.query.language as string) || 'ko';

    const caseData = await CaseRepository.getCaseById(caseId);

    if (!caseData) {
      res.status(404).json({
        error: 'No case found',
        message: `Case with ID ${caseId} not found`
      });
      return;
    }

    const fullSuspects = await CaseRepository.getCaseSuspects(caseData.id);

    // Map to client format...
    res.json({...});
  } catch (error) {
    // Error handling...
  }
});

// AFTER
router.get('/api/case/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;
    const language = (req.query.language as string) || 'ko';

    // ✅ NEW: Extract userId from query or context
    const userId = (req.query.userId as string) || context.userId;

    const caseData = await CaseRepository.getCaseById(caseId);

    if (!caseData) {
      res.status(404).json({
        error: 'No case found',
        message: `Case with ID ${caseId} not found`
      });
      return;
    }

    // ✅ NEW: Auto-initialize player state if userId provided
    if (userId) {
      let playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

      if (!playerState) {
        console.log(`🔧 Auto-initializing player state for ${userId} in case ${caseId}`);

        const stateService = createPlayerEvidenceStateService();
        playerState = stateService.initializeState(caseId, userId);

        // Initialize Action Points
        playerState.actionPoints = {
          current: caseData.actionPoints.initial,
          total: caseData.actionPoints.initial,
          spent: 0,
          initial: caseData.actionPoints.initial,
          acquisitionHistory: [],
          spendingHistory: [],
          acquiredTopics: new Set<string>(),
          bonusesAcquired: new Set<string>(),
          emergencyAPUsed: false
        };

        await KVStoreManager.savePlayerEvidenceState(playerState);
        console.log(`✅ Player state initialized for ${userId}`);
      }
    }

    const fullSuspects = await CaseRepository.getCaseSuspects(caseData.id);

    // Map to client format...
    res.json({
      id: caseData.id,
      date: caseData.date,
      language: language,
      victim: caseData.victim,
      weapon: caseData.weapon,
      location: caseData.location,
      suspects: suspectsData,
      imageUrl: caseData.imageUrl,
      introNarration: caseData.introNarration,
      locations: caseData.locations,
      evidence: caseData.evidence,
      evidenceDistribution: caseData.evidenceDistribution,
      actionPoints: caseData.actionPoints,
      generatedAt: caseData.generatedAt,
      playerInitialized: userId ? true : false // ✅ NEW: Indicate initialization status
    });
  } catch (error) {
    console.error(`Error fetching case ${req.params.caseId}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch case'
    });
  }
});
```

---

#### Change #2: Add Smart Fallback to `/api/player-state/:caseId/:userId` (Line ~1492)

```typescript
// BEFORE
router.get('/api/player-state/:caseId/:userId', async (req, res): Promise<void> => {
  try {
    const { caseId, userId } = req.params;

    const playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

    if (!playerState) {
      res.status(404).json({
        error: 'Player state not found',
        message: 'No evidence discovery state found for this player and case'
      });
      return;
    }

    res.json({
      ...playerState,
      actionPointsRemaining: playerState.actionPoints?.current || 0,
      actionPointsUsed: playerState.actionPoints?.spent || 0
    });

  } catch (error) {
    console.error('Error fetching player state:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch player state'
    });
  }
});

// AFTER
router.get('/api/player-state/:caseId/:userId', async (req, res): Promise<void> => {
  try {
    const { caseId, userId } = req.params;

    // ✅ NEW: Validate input
    if (!caseId || caseId === 'undefined' || caseId === 'null') {
      res.status(400).json({
        error: 'Invalid caseId',
        message: 'caseId parameter is required and must be valid'
      });
      return;
    }

    if (!userId || userId === 'undefined' || userId === 'null') {
      res.status(400).json({
        error: 'Invalid userId',
        message: 'userId parameter is required and must be valid'
      });
      return;
    }

    let playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

    // ✅ NEW: Auto-create if not exists (fallback safety)
    if (!playerState) {
      console.log(`⚠️ Player state not found, auto-creating for ${userId} in case ${caseId}`);

      // Verify case exists first
      const caseData = await CaseRepository.getCaseById(caseId);
      if (!caseData) {
        res.status(404).json({
          error: 'Case not found',
          message: `Case ${caseId} does not exist. Cannot initialize player state.`
        });
        return;
      }

      // Initialize state
      const stateService = createPlayerEvidenceStateService();
      playerState = stateService.initializeState(caseId, userId);

      // Initialize Action Points
      playerState.actionPoints = {
        current: caseData.actionPoints.initial,
        total: caseData.actionPoints.initial,
        spent: 0,
        initial: caseData.actionPoints.initial,
        acquisitionHistory: [],
        spendingHistory: [],
        acquiredTopics: new Set<string>(),
        bonusesAcquired: new Set<string>(),
        emergencyAPUsed: false
      };

      await KVStoreManager.savePlayerEvidenceState(playerState);
      console.log(`✅ Auto-created player state for ${userId} in case ${caseId}`);
    }

    res.json({
      ...playerState,
      actionPointsRemaining: playerState.actionPoints?.current || 0,
      actionPointsUsed: playerState.actionPoints?.spent || 0
    });

  } catch (error) {
    console.error('Error fetching player state:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch player state'
    });
  }
});
```

---

### 2. Add Input Validation to KVStoreManager

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\services\repositories\kv\KVStoreManager.ts`

#### Change #1: Add validation to `savePlayerEvidenceState` (Line ~414)

```typescript
// BEFORE
static async savePlayerEvidenceState(state: PlayerEvidenceState): Promise<void> {
  if (!this.adapter) {
    throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
  }

  const key = `player-state:${state.caseId}:${state.userId}`;

  // Convert Sets to arrays for JSON serialization
  const serializable = {
    ...state,
    actionPoints: {
      ...state.actionPoints,
      acquiredTopics: Array.from(state.actionPoints.acquiredTopics),
      bonusesAcquired: Array.from(state.actionPoints.bonusesAcquired)
    }
  };

  await this.adapter.set(key, JSON.stringify(serializable));
}

// AFTER
static async savePlayerEvidenceState(state: PlayerEvidenceState): Promise<void> {
  if (!this.adapter) {
    throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
  }

  // ✅ NEW: Validate input
  if (!state.caseId || state.caseId === 'undefined' || state.caseId === 'null') {
    throw new Error(`Invalid player state: caseId is undefined or invalid (${state.caseId})`);
  }

  if (!state.userId || state.userId === 'undefined' || state.userId === 'null') {
    throw new Error(`Invalid player state: userId is undefined or invalid (${state.userId})`);
  }

  const key = `player-state:${state.caseId}:${state.userId}`;

  // ✅ NEW: Log for debugging
  console.log(`💾 Saving player state: ${key}`);

  // Convert Sets to arrays for JSON serialization
  const serializable = {
    ...state,
    actionPoints: {
      ...state.actionPoints,
      acquiredTopics: Array.from(state.actionPoints.acquiredTopics),
      bonusesAcquired: Array.from(state.actionPoints.bonusesAcquired)
    }
  };

  await this.adapter.set(key, JSON.stringify(serializable));

  // ✅ NEW: Confirm save
  console.log(`✅ Player state saved successfully: ${key}`);
}
```

#### Change #2: Add validation to `getPlayerEvidenceState` (Line ~437)

```typescript
// BEFORE
static async getPlayerEvidenceState(
  caseId: string,
  userId: string
): Promise<PlayerEvidenceState | null> {
  if (!this.adapter) {
    throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
  }

  const key = `player-state:${caseId}:${userId}`;
  const data = await this.adapter.get(key);

  if (!data) {
    return null;
  }

  const parsed = JSON.parse(data);

  // Convert date strings back to Date objects and arrays back to Sets
  return {
    ...parsed,
    discoveredEvidence: parsed.discoveredEvidence.map((d: any) => ({
      ...d,
      discoveredAt: new Date(d.discoveredAt)
    })),
    searchHistory: parsed.searchHistory.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp)
    })),
    lastUpdated: new Date(parsed.lastUpdated),
    actionPoints: {
      ...parsed.actionPoints,
      acquisitionHistory: parsed.actionPoints.acquisitionHistory.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      })),
      spendingHistory: parsed.actionPoints.spendingHistory.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      })),
      acquiredTopics: new Set(parsed.actionPoints.acquiredTopics),
      bonusesAcquired: new Set(parsed.actionPoints.bonusesAcquired)
    }
  } as PlayerEvidenceState;
}

// AFTER
static async getPlayerEvidenceState(
  caseId: string,
  userId: string
): Promise<PlayerEvidenceState | null> {
  if (!this.adapter) {
    throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
  }

  // ✅ NEW: Validate input
  if (!caseId || caseId === 'undefined' || caseId === 'null') {
    console.error(`❌ Invalid caseId: ${caseId}`);
    throw new Error(`Invalid caseId: ${caseId}`);
  }

  if (!userId || userId === 'undefined' || userId === 'null') {
    console.error(`❌ Invalid userId: ${userId}`);
    throw new Error(`Invalid userId: ${userId}`);
  }

  const key = `player-state:${caseId}:${userId}`;

  // ✅ NEW: Log for debugging
  console.log(`🔍 Fetching player state: ${key}`);

  const data = await this.adapter.get(key);

  if (!data) {
    console.log(`⚠️ Player state not found: ${key}`);
    return null;
  }

  const parsed = JSON.parse(data);

  // ✅ NEW: Validate parsed data
  if (!parsed.actionPoints) {
    console.warn(`⚠️ Player state missing actionPoints field: ${key}`);
    // Initialize actionPoints if missing (backward compatibility)
    parsed.actionPoints = {
      current: 3,
      total: 3,
      spent: 0,
      initial: 3,
      acquisitionHistory: [],
      spendingHistory: [],
      acquiredTopics: [],
      bonusesAcquired: [],
      emergencyAPUsed: false
    };
  }

  // Convert date strings back to Date objects and arrays back to Sets
  const result = {
    ...parsed,
    discoveredEvidence: parsed.discoveredEvidence.map((d: any) => ({
      ...d,
      discoveredAt: new Date(d.discoveredAt)
    })),
    searchHistory: parsed.searchHistory.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp)
    })),
    lastUpdated: new Date(parsed.lastUpdated),
    actionPoints: {
      ...parsed.actionPoints,
      acquisitionHistory: parsed.actionPoints.acquisitionHistory.map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp)
      })),
      spendingHistory: parsed.actionPoints.spendingHistory.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      })),
      acquiredTopics: new Set(parsed.actionPoints.acquiredTopics),
      bonusesAcquired: new Set(parsed.actionPoints.bonusesAcquired)
    }
  } as PlayerEvidenceState;

  console.log(`✅ Player state loaded: ${key}`);
  return result;
}
```

---

## Testing Checklist

### Unit Tests

```typescript
// File: src/server/__tests__/player-state-initialization.test.ts

import request from 'supertest';
import { app } from '../index';
import { KVStoreManager } from '../services/repositories/kv/KVStoreManager';

describe('Player State Initialization', () => {
  beforeEach(async () => {
    // Clear test data
    await KVStoreManager.getAdapter().flushAll();
  });

  it('should auto-initialize player state on case access with userId', async () => {
    // 1. Generate test case first
    const caseResponse = await request(app)
      .post('/api/case/generate')
      .expect(200);

    const caseId = caseResponse.body.caseId;

    // 2. Access case with userId
    const response = await request(app)
      .get(`/api/case/${caseId}?userId=testUser123`)
      .expect(200);

    expect(response.body.playerInitialized).toBe(true);

    // 3. Verify state was created
    const state = await KVStoreManager.getPlayerEvidenceState(caseId, 'testUser123');
    expect(state).toBeDefined();
    expect(state.caseId).toBe(caseId);
    expect(state.userId).toBe('testUser123');
    expect(state.actionPoints.current).toBe(3);
  });

  it('should return 200 when accessing player state after auto-init', async () => {
    // 1. Generate test case
    const caseResponse = await request(app)
      .post('/api/case/generate')
      .expect(200);

    const caseId = caseResponse.body.caseId;

    // 2. Access case (triggers auto-init)
    await request(app)
      .get(`/api/case/${caseId}?userId=testUser456`)
      .expect(200);

    // 3. Access player state (should not 404)
    const stateResponse = await request(app)
      .get(`/api/player-state/${caseId}/testUser456`)
      .expect(200);

    expect(stateResponse.body.actionPoints.current).toBe(3);
  });

  it('should handle missing caseId gracefully', async () => {
    const response = await request(app)
      .get('/api/player-state/undefined/testUser')
      .expect(400);

    expect(response.body.error).toContain('Invalid');
  });

  it('should handle missing userId gracefully', async () => {
    const response = await request(app)
      .get('/api/player-state/case-123/undefined')
      .expect(400);

    expect(response.body.error).toContain('Invalid');
  });

  it('should auto-create player state if missing on GET', async () => {
    // 1. Generate test case
    const caseResponse = await request(app)
      .post('/api/case/generate')
      .expect(200);

    const caseId = caseResponse.body.caseId;

    // 2. Directly access player state (should auto-create)
    const stateResponse = await request(app)
      .get(`/api/player-state/${caseId}/newUser789`)
      .expect(200);

    expect(stateResponse.body.caseId).toBe(caseId);
    expect(stateResponse.body.userId).toBe('newUser789');
    expect(stateResponse.body.actionPoints.current).toBe(3);
  });
});
```

---

### Integration Tests

```typescript
// File: src/server/__tests__/full-game-flow.test.ts

import request from 'supertest';
import { app } from '../index';
import { KVStoreManager } from '../services/repositories/kv/KVStoreManager';

describe('Full Game Flow', () => {
  let caseId: string;
  const userId = 'integrationTestUser';

  beforeAll(async () => {
    // Generate test case
    const response = await request(app)
      .post('/api/case/generate')
      .expect(200);

    caseId = response.body.caseId;
  });

  afterAll(async () => {
    // Cleanup
    await KVStoreManager.getAdapter().flushAll();
  });

  it('should complete full game flow without errors', async () => {
    // 1. Access case (triggers auto-init)
    const caseResponse = await request(app)
      .get(`/api/case/${caseId}?userId=${userId}`)
      .expect(200);

    expect(caseResponse.body.playerInitialized).toBe(true);
    expect(caseResponse.body.locations).toBeDefined();
    expect(caseResponse.body.evidence).toBeDefined();

    // 2. Check player state
    const stateResponse = await request(app)
      .get(`/api/player-state/${caseId}/${userId}`)
      .expect(200);

    expect(stateResponse.body.actionPoints.current).toBe(3);

    // 3. Search location (spend AP)
    const searchResponse = await request(app)
      .post('/api/location/search')
      .send({
        caseId,
        userId,
        locationId: 'crime-scene',
        searchType: 'thorough'
      })
      .expect(200);

    expect(searchResponse.body.success).toBe(true);
    expect(searchResponse.body.evidenceFound).toBeDefined();
    expect(searchResponse.body.evidenceFound.length).toBeGreaterThan(0);

    // 4. Verify AP deducted
    const updatedState = await request(app)
      .get(`/api/player-state/${caseId}/${userId}`)
      .expect(200);

    expect(updatedState.body.actionPoints.current).toBe(1); // 3 - 2 (thorough search)
    expect(updatedState.body.actionPoints.spent).toBe(2);
  });

  it('should prevent search when AP insufficient', async () => {
    // Exhaust AP
    await request(app)
      .post('/api/location/search')
      .send({
        caseId,
        userId: 'lowAPUser',
        locationId: 'crime-scene',
        searchType: 'exhaustive'
      })
      .expect(200);

    // Try another exhaustive search
    const response = await request(app)
      .post('/api/location/search')
      .send({
        caseId,
        userId: 'lowAPUser',
        locationId: 'victim-residence',
        searchType: 'exhaustive'
      })
      .expect(400);

    expect(response.body.error).toContain('AP_INSUFFICIENT');
  });
});
```

---

## Deployment Steps

### 1. Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Code reviewed by team
- [ ] Backward compatibility verified
- [ ] Rollback plan documented

### 2. Deployment Commands

```bash
# 1. Commit changes
git add .
git commit -m "fix: Auto-initialize player state to resolve 404 errors

- Add auto-init logic to /api/case/:caseId endpoint
- Add fallback auto-creation to /api/player-state/:caseId/:userId
- Add input validation to KVStoreManager
- Add backward compatibility for missing actionPoints field"

# 2. Run tests
npm test

# 3. Build production bundle
npm run build

# 4. Deploy to staging
npm run deploy:staging

# 5. Run smoke tests on staging
npm run test:smoke -- --env=staging

# 6. Deploy to production (if staging passes)
npm run deploy:production
```

### 3. Post-Deployment Verification

```bash
# Test new user flow
curl -X GET "https://api.armchair-sleuths.com/api/case/case-2025-10-23?userId=testUser001"

# Verify player state
curl -X GET "https://api.armchair-sleuths.com/api/player-state/case-2025-10-23/testUser001"

# Expected: 200 OK (not 404)
```

---

## Monitoring

### Key Metrics to Track

```typescript
// Add to application monitoring
const metrics = {
  'player_state.auto_init.success': 0,
  'player_state.auto_init.failure': 0,
  'player_state.404_errors': 0,
  'player_state.validation_errors': 0,
  'player_state.save_duration_ms': 0,
  'player_state.load_duration_ms': 0
};

// Increment in code
metrics['player_state.auto_init.success']++;
```

### Alerts to Set Up

1. **High 404 Rate**: Alert if 404 errors on `/api/player-state` exceed 5% of requests
2. **Validation Errors**: Alert if validation errors exceed 1% of requests
3. **Slow Saves**: Alert if player state saves take >500ms
4. **Slow Loads**: Alert if player state loads take >200ms

---

## Rollback Plan

If issues are detected after deployment:

```bash
# 1. Revert to previous version
git revert HEAD
npm run build
npm run deploy:production

# 2. Verify rollback
curl -X GET "https://api.armchair-sleuths.com/api/health"

# 3. Investigate root cause
npm run logs:production -- --tail 1000 | grep "player-state"
```

---

## Success Criteria

### Before Fix
- ❌ 404 errors when accessing player state
- ❌ Players cannot start game without manual init
- ❌ Error logs showing undefined caseId/userId

### After Fix
- ✅ Zero 404 errors for valid caseId/userId combinations
- ✅ Players can start game seamlessly
- ✅ Clear validation errors for invalid input
- ✅ Backward compatibility maintained
- ✅ All tests passing

---

## Timeline

| Task | Duration | Owner |
|------|----------|-------|
| Implement changes | 2 hours | Backend Dev |
| Write tests | 1 hour | Backend Dev |
| Code review | 30 min | Team Lead |
| Deploy to staging | 15 min | DevOps |
| Staging verification | 30 min | QA |
| Deploy to production | 15 min | DevOps |
| Production monitoring | 24 hours | Team |

**Total Estimated Time**: 4.5 hours (active work) + 24 hours (monitoring)

---

## Next Phase: AI Evidence Generation

After player state fix is stable, proceed with:

1. **Create converter functions** (1 hour)
2. **Integrate EvidenceGeneratorService** (2 hours)
3. **Test evidence quality** (1 hour)
4. **Deploy gradually** (4 hours)

See: `evidence-system-implementation-plan-phase2.md`

---

**Document Owner**: Backend Team
**Created**: 2025-10-23
**Status**: Ready for Implementation
