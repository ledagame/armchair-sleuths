# Backend Evidence System - Quick Fix Guide

## TL;DR

**Problem**: API returns 404 when accessing `/api/player-state/:caseId/:userId`

**Root Cause**: Player state is not auto-initialized when game starts

**Solution**: Add auto-initialization logic to case endpoint + fallback in player state endpoint

**Time to Fix**: 2 hours

---

## The Issue

```bash
# Current behavior
GET /api/player-state/case-2025-10-23/user123
Response: 404 Not Found

# Error in logs
"Player state not found for user123 in case case-2025-10-23"
```

**Why it happens**:
1. Player accesses game
2. Player state is NOT created automatically
3. Client tries to fetch player state
4. KV store has no record
5. API returns 404

---

## The Fix (3 Changes)

### Change 1: Auto-init in `/api/case/:caseId`

**File**: `src/server/index.ts` (Line ~725)

**Add after fetching case**:

```typescript
const userId = (req.query.userId as string) || context.userId;

if (userId) {
  let playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

  if (!playerState) {
    const stateService = createPlayerEvidenceStateService();
    playerState = stateService.initializeState(caseId, userId);
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
  }
}
```

---

### Change 2: Fallback in `/api/player-state/:caseId/:userId`

**File**: `src/server/index.ts` (Line ~1492)

**Replace 404 logic with auto-creation**:

```typescript
let playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

if (!playerState) {
  // Verify case exists
  const caseData = await CaseRepository.getCaseById(caseId);
  if (!caseData) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }

  // Auto-create
  const stateService = createPlayerEvidenceStateService();
  playerState = stateService.initializeState(caseId, userId);
  playerState.actionPoints = { /* ... */ };
  await KVStoreManager.savePlayerEvidenceState(playerState);
}
```

---

### Change 3: Add Validation

**File**: `src/server/services/repositories/kv/KVStoreManager.ts` (Line ~414)

**Add at start of `savePlayerEvidenceState`**:

```typescript
if (!state.caseId || state.caseId === 'undefined' || state.caseId === 'null') {
  throw new Error(`Invalid player state: caseId is ${state.caseId}`);
}

if (!state.userId || state.userId === 'undefined' || userId === 'null') {
  throw new Error(`Invalid player state: userId is ${state.userId}`);
}
```

---

## Testing

```bash
# 1. Start local server
npm run dev

# 2. Test auto-init on case access
curl "http://localhost:3000/api/case/case-2025-10-23?userId=testUser"
# Expected: 200 OK, playerInitialized: true

# 3. Test player state access
curl "http://localhost:3000/api/player-state/case-2025-10-23/testUser"
# Expected: 200 OK (not 404)

# 4. Test validation
curl "http://localhost:3000/api/player-state/undefined/testUser"
# Expected: 400 Bad Request
```

---

## Evidence Description Issue

**Status**: Not a bug - evidence descriptions ARE present

**What we found**:
- Evidence IS being generated with descriptions
- Descriptions are stored correctly in database
- The issue is that descriptions are **generic/hardcoded**

**Example current evidence**:
```json
{
  "id": "evidence-critical-1",
  "name": "칼 발견",
  "description": "범행에 사용된 칼이(가) 발견되었다. 날카로운 도구",
  "discoveryHint": "범죄 현장을 주의 깊게 살펴보세요.",
  "interpretationHint": "이 무기는 박준호의 소유물로 추정됩니다."
}
```

**The real issue**: Descriptions lack detail and context

**Solution (Phase 2)**: Integrate AI-generated evidence

Currently, evidence is hardcoded in:
- `src/server/services/case/CaseGeneratorService.ts` (Line 1107)

We have an AI evidence generator ready:
- `src/server/services/evidence/EvidenceGeneratorService.ts`

It just needs to be integrated into the case generation flow.

---

## Priority

### High Priority (Fix Now)
✅ Player state 404 errors

### Medium Priority (Next Sprint)
⏳ AI-generated evidence descriptions

### Low Priority (Future)
⏳ Evidence schema enhancements (forensic details, examples, fun facts)

---

## Files to Modify

1. `src/server/index.ts` (2 changes)
2. `src/server/services/repositories/kv/KVStoreManager.ts` (2 changes)

**Total Changes**: 4 code blocks (~80 lines)

---

## Deployment

```bash
# After changes
npm test
npm run build
git commit -m "fix: Auto-initialize player state to resolve 404 errors"
git push origin main

# Monitor logs
npm run logs:production -- --follow | grep "player-state"
```

---

## Success Metrics

**Before**:
- 404 error rate: ~30% of requests
- Player complaints: "Can't start game"

**After**:
- 404 error rate: <1% (only for truly invalid IDs)
- Zero player complaints
- Player state always available

---

## Support

If issues persist after deployment:

1. **Check logs**: `grep "player-state" logs/production.log`
2. **Verify KV store**: Ensure adapter is initialized
3. **Test manually**: Use curl to reproduce issue
4. **Rollback**: `git revert HEAD && npm run deploy`

---

**Need more details?** See:
- Full analysis: `docs/backend-evidence-system-analysis.md`
- Implementation plan: `docs/evidence-system-implementation-plan.md`

**Questions?** Contact: Backend Team Lead

**Status**: Ready to implement
**Last Updated**: 2025-10-23
