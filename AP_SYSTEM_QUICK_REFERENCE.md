# AP System Quick Reference

## Phase 3: Validation & Security (Complete)

---

## Core Concepts

### AP Flow
```
Player starts with 3 AP
  ↓
Chat with suspects → Gain AP (topics + bonuses)
  ↓
Search locations → Spend AP (1-3 per search)
  ↓
Emergency AP if depleted (2 AP, one-time)
  ↓
Maximum cap: 12 AP
```

---

## API Endpoints

### Get AP Status
```http
GET /api/player/:userId/ap-status?caseId=xxx
```
Returns current AP, total, spent, emergency used

### Chat (Gain AP)
```http
POST /api/chat/:suspectId
{
  "userId": "string",
  "message": "string",
  "caseId": "string"
}
```
Returns chat response + AP gained (if any)

### Search (Spend AP)
```http
POST /api/location/search
{
  "caseId": "string",
  "userId": "string",
  "locationId": "string",
  "searchType": "quick" | "thorough" | "exhaustive"
}
```
Costs: quick=1, thorough=2, exhaustive=3 AP

### Check Integrity (Admin)
```http
GET /api/admin/ap-integrity/:userId?caseId=xxx
```
Returns integrity status, issues, stats

---

## AP Acquisition

### Topics (2-3 AP each)
Triggered by keywords in player message:
- Alibi keywords: "where", "when", "time"
- Relationship keywords: "relationship", "know"
- Motive keywords: "motive", "reason", "why"

### Bonuses (+1 AP each, once per suspect)
Triggered by AI response content:
- **Suspect mention**: AI mentions another suspect's name
- **Location mention**: AI mentions a location from the case
- **Secret mention**: AI uses secret keywords (비밀, 숨기, etc.)

### Emergency AP
- Provided when player has 0 AP
- One-time only per case
- Gives +2 AP automatically

---

## Validation Methods (Phase 3)

### `validateAPBounds(currentAP, operation, amount, maximum)`
```typescript
const check = apService.validateAPBounds(
  playerState.actionPoints.current,
  'subtract',
  apCost,
  caseData.actionPoints.maximum
);

if (!check.valid) {
  // Handle insufficient AP
  console.error(check.reason);
}
```

### `detectSuspiciousActivity(acquisitionHistory)`
```typescript
const suspicious = apService.detectSuspiciousActivity(
  playerState.actionPoints.acquisitionHistory
);

if (suspicious.suspicious) {
  console.warn('[Anti-Cheat]', suspicious.reason);
  // Log for admin review (non-blocking)
}
```

### `verifyAPIntegrity(playerState)`
```typescript
const integrity = apService.verifyAPIntegrity(
  playerState.actionPoints
);

if (!integrity.valid) {
  console.error('[Integrity] Issues:', integrity.issues);
  // Alert admin for investigation
}
```

---

## Error Codes

| Code | Meaning | Action |
|------|---------|--------|
| `AP_INSUFFICIENT` | Not enough AP | Chat with suspects or wait for emergency |
| `MISSING_PARAMS` | Required params missing | Check request body |
| `CASE_NOT_FOUND` | Invalid caseId | Verify case exists |
| `PLAYER_STATE_NOT_FOUND` | Player not initialized | Call `/api/player-state/initialize` |

---

## Common Patterns

### Initialize Player State
```typescript
const stateService = createPlayerEvidenceStateService();
const playerState = stateService.initializeState(caseId, userId);
initializeActionPoints(caseData, playerState);
await KVStoreManager.savePlayerEvidenceState(playerState);
```

### Check AP Before Action
```typescript
const apCost = caseData.actionPoints.costs[searchType];

if (playerState.actionPoints.current < apCost) {
  // Try emergency AP
  const emergencyAP = apService.provideEmergencyAP(playerState.actionPoints);
  if (emergencyAP) {
    // Provide and retry
  } else {
    // Reject with clear message
    return { error: 'AP_INSUFFICIENT', currentAP, requiredAP: apCost };
  }
}
```

### Analyze Conversation for AP
```typescript
const conversationId = `${caseId}:${suspectId}:${userId}`;
const apResult = apService.analyzeConversation(
  userMessage,
  aiResponse,
  suspect,
  caseData,
  playerState.actionPoints,
  conversationId
);

if (apResult.apGained > 0) {
  // Update player state
  playerState.actionPoints.current += apResult.apGained;
  playerState.actionPoints.total += apResult.apGained;

  // Track acquisitions
  for (const acquisition of apResult.acquisitions) {
    playerState.actionPoints.acquisitionHistory.push(acquisition);
    if (acquisition.source === 'topic') {
      playerState.actionPoints.acquiredTopics.add(`${suspectId}:${acquisition.topicId}`);
    }
  }

  await KVStoreManager.savePlayerEvidenceState(playerState);
}
```

---

## Logging Format

### Conversation Analysis
```
[AP] Analyzing conversation: { suspectId, userMessageLength, aiResponseLength, currentAP }
[AP] Topic triggered: { topicId, category, reward, description }
[AP] Bonuses detected: [{ type, amount, reason }, ...]
[AP] Conversation analysis complete: { apGained, newTotal, capped }
```

### AP Operations
```
[AP] Search request: quick (cost: 1 AP, current: 5 AP)
[AP] AP deducted: -1 AP (remaining: 4 AP)
[AP] Emergency AP provided: +2 AP
[AP] Player user-123 gained 3 AP (new total: 8)
```

### Integrity Checks
```
[AP Validation] Passed: { userId, caseId, currentAP, totalAP }
[AP Integrity] Issues detected for user-123: ["Current AP mismatch: reported 10, expected 8"]
[Anti-Cheat] Too many AP acquisitions in short time (15 in last minute, max: 10)
```

---

## Configuration

### Case AP Settings
```typescript
{
  actionPoints: {
    initial: 3,        // Starting AP
    maximum: 12,       // Cap
    costs: {
      quick: 1,        // Quick search
      thorough: 2,     // Thorough search
      exhaustive: 3    // Exhaustive search
    }
  }
}
```

### Suspect AP Topics
```typescript
{
  apTopics: [
    {
      id: 'alibi-1',
      category: 'alibi',
      description: '알리바이 정보 획득',
      keywords: ['where', 'when', 'time'],
      apReward: 3,
      requiresQuality: true  // Needs >50 chars + specific info
    }
  ]
}
```

---

## Security Best Practices

### 1. Never Trust Client
```typescript
// ❌ BAD
const apCost = req.body.apCost; // Client can tamper

// ✅ GOOD
const apCost = caseData.actionPoints.costs[searchType]; // Server truth
```

### 2. Always Validate Server-Side
```typescript
// ✅ Use validation
const check = apService.validateAPBounds(current, 'subtract', cost, max);
if (!check.valid) {
  return error(check.reason);
}
```

### 3. Log Everything
```typescript
// ✅ Comprehensive logging
console.log('[AP] Operation:', { userId, action, amount, before, after });
```

### 4. Check Integrity Periodically
```typescript
// ✅ Verify state consistency
const integrity = apService.verifyAPIntegrity(playerState.actionPoints);
if (!integrity.valid) {
  console.error('[Integrity]', integrity.issues);
  // Alert admin
}
```

---

## Troubleshooting

### Player has 0 AP
1. Check if emergency AP already used
2. If not used: Auto-provide 2 AP
3. If used: Suggest chatting with suspects

### AP mismatch detected
1. Run integrity check: `GET /api/admin/ap-integrity/:userId`
2. Review `calculatedValues` vs `stats`
3. Check acquisition/spending history
4. Look for duplicate entries

### Suspicious activity logged
1. Review reason (rapid-fire, duplicates, large gain)
2. Check player history manually
3. If exploit: Consider manual adjustment
4. If false positive: Note for threshold tuning

---

## Testing Commands

```bash
# Get AP status
curl http://localhost:3000/api/player/test-user/ap-status?caseId=case-2025-10-20

# Chat to gain AP
curl -X POST http://localhost:3000/api/chat/suspect-1 \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user","message":"Where were you?","caseId":"case-2025-10-20"}'

# Search to spend AP
curl -X POST http://localhost:3000/api/location/search \
  -H "Content-Type: application/json" \
  -d '{"caseId":"case-2025-10-20","userId":"test-user","locationId":"loc-1","searchType":"quick"}'

# Check integrity
curl http://localhost:3000/api/admin/ap-integrity/test-user?caseId=case-2025-10-20
```

---

## Phase Completion Status

- ✅ **Phase 1**: Core AP system (acquisition + spending)
- ✅ **Phase 2**: API integration (chat + search)
- ✅ **Phase 3**: Validation + security + anti-cheat

**All phases complete** - AP system is production-ready!

---

## Quick Links

- **Full Implementation**: `PHASE_3_AP_IMPLEMENTATION_SUMMARY.md`
- **Safety Features**: `PHASE_3_SAFETY_FEATURES.md`
- **Validation Middleware**: `src/server/middleware/apValidation.ts`
- **AP Service**: `src/server/services/ap/APAcquisitionService.ts`

---

**Last Updated**: 2025-10-20
