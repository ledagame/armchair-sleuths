# Debugging: Suspects Not Appearing Issue

## Problem Summary

**Symptom**: UI shows "용의자 (0명)" even though case data exists
**Console Log**: "Case fetched but no suspects found"
**Version**: 0.0.2.25 deployed with enhanced DevvitStorageAdapter logging

## Root Cause Analysis

### Execution Flow Trace

```
POST /api/case/generate (index.ts:147)
  ↓
CaseGeneratorService.generateCase() (CaseGeneratorService.ts:65)
  ↓
CaseRepository.createCase() (CaseRepository.ts:48)
  ↓
  1. Save case data: KVStoreManager.saveCase(caseData) (line 77)
  2. FOR EACH suspect (lines 80-100):
     - Create SuspectData with emotionalState
     - KVStoreManager.saveSuspect(suspectData) (line 99)
       ↓
       KVStoreManager.saveSuspect() (KVStoreManager.ts:166)
         ↓
         a. Save suspect: adapter.set(`suspect:${id}`, JSON.stringify(data)) (line 172)
         b. Add to index: adapter.sAdd(`case:${caseId}:suspects`, suspectId) (line 176)
           ↓
           DevvitStorageAdapter.sAdd() (DevvitStorageAdapter.ts:58)
             - Enhanced logging should show: "✅ Added 'suspect-X' to set..."
```

### Critical Points

1. **DevvitStorageAdapter.sAdd()** (lines 58-89):
   - Reads existing set as JSON array
   - Adds member if not exists
   - Logs: `✅ DevvitAdapter.sAdd: Added "${member}" to set "${key}" (now ${members.length} members)`

2. **DevvitStorageAdapter.sMembers()** (lines 97-125):
   - Reads set and parses as JSON array
   - Logs: `✅ DevvitAdapter.sMembers: Retrieved ${members.length} members from set "${key}"`

3. **Expected Log Sequence During Case Generation**:
   ```
   🔄 Generating today's case...
   📚 Selected elements: ...
   ✅ Case story generated
   ✅ Case saved: case-2025-10-15
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set "case:case-2025-10-15:suspects" (now 1 members)
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set "case:case-2025-10-15:suspects" (now 2 members)
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set "case:case-2025-10-15:suspects" (now 3 members)
   ✅ Case created: case-2025-10-15 for date 2025-10-15
   ```

## Debugging Steps

### Step 1: Verify Deployment

Check if the enhanced logging is in the deployed version:

```bash
# View recent deployment logs
npx devvit logs r/YOUR_SUBREDDIT --since 30m --show-timestamps
```

**Look for**:
- ✅ Lines with "DevvitAdapter.sAdd"
- ✅ Lines with "DevvitAdapter.sMembers"

**If NOT present**: The old code is still running. You need to:
1. Delete the old case: The existing case was generated with the OLD code (no suspects)
2. Wait for new deployment or force redeploy

### Step 2: Delete Existing Case (IMPORTANT)

The current case `case-2025-10-15` was likely generated BEFORE the fix was deployed.

**Manual deletion via browser console**:

Open browser console on the Devvit app page and run:

```javascript
// Delete today's case to force regeneration
fetch('/api/case/delete/case-2025-10-15', {
  method: 'POST'
}).then(r => r.json()).then(console.log);
```

**Or add a temporary endpoint** (see Step 3 below).

### Step 3: Generate New Test Case

**Option A: Call existing endpoint manually**

Open browser console and run:

```javascript
// Trigger new case generation
fetch('/api/case/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => {
  console.log('Case generation result:', data);
  // Should see: { success: true, caseId: "case-2025-10-15", ... }
});
```

**Expected server logs after this call**:
```
🔄 Generating today's case...
📚 Selected elements:
  - Weapon: ...
  - Motive: ...
  - Location: ...
  - Suspects: ...
✅ Case story generated
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set "case:case-2025-10-15:suspects" (now 1 members)
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set "case:case-2025-10-15:suspects" (now 2 members)
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set "case:case-2025-10-15:suspects" (now 3 members)
✅ Case created: case-2025-10-15 for date 2025-10-15
✅ Case saved: case-2025-10-15
```

**Option B: Add a temporary debug endpoint** (safer)

Add to `src/server/index.ts` after line 184:

```typescript
// TEMPORARY DEBUG ENDPOINT - Remove after debugging
router.post('/api/debug/regenerate-today', async (_req, res): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const caseId = `case-${today}`;

    // Delete existing case
    await CaseRepository.deleteCase(caseId);
    console.log(`🗑️  Deleted case: ${caseId}`);

    // Generate new case
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const caseData = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false
    });

    res.json({
      success: true,
      message: 'Case regenerated successfully',
      caseId: caseData.id
    });
  } catch (error) {
    console.error('Error regenerating case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: String(error)
    });
  }
});
```

Then call:
```javascript
fetch('/api/debug/regenerate-today', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Step 4: Monitor Server Logs

Watch logs in real-time during case generation:

```bash
npx devvit logs r/YOUR_SUBREDDIT --since 1m --show-timestamps
```

**Critical checkpoints**:

1. **Case generation triggered?**
   - Look for: `🔄 Generating today's case...`

2. **Suspects being saved?**
   - Look for: `✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-X" ...`
   - Should see 3 lines (for 3 suspects)

3. **Suspect retrieval working?**
   - After generation, refresh the UI
   - Look for: `✅ DevvitAdapter.sMembers: Retrieved 3 members from set "case:case-2025-10-15:suspects"`

4. **Any errors?**
   - Look for: `❌ DevvitAdapter.sAdd: Critical error ...`
   - Look for: `❌ DevvitAdapter.sMembers: JSON.parse failed ...`

### Step 5: Verify Suspect Retrieval

After generating a new case, fetch it via the API:

```javascript
fetch('/api/case/today')
  .then(r => r.json())
  .then(data => {
    console.log('Case ID:', data.id);
    console.log('Suspects count:', data.suspects.length);
    console.log('Suspects:', data.suspects);
  });
```

**Expected result**:
```json
{
  "id": "case-2025-10-15",
  "suspects": [
    {
      "id": "case-2025-10-15-suspect-1",
      "name": "이서연",
      "archetype": "비즈니스 파트너",
      "background": "...",
      "personality": "...",
      "emotionalState": { ... }
    },
    // ... 2 more suspects
  ]
}
```

## Hypotheses

### Hypothesis 1: Old Case Data (MOST LIKELY)
**Theory**: The current case was generated before DevvitStorageAdapter enhancements were deployed.

**Evidence Required**:
- Check when `case-2025-10-15` was created (check `generatedAt` timestamp)
- Check deployment timestamp of version 0.0.2.25
- If case was created BEFORE deployment, suspects were never saved properly

**Test**: Delete case and regenerate
**Expected Result**: New case has suspects

### Hypothesis 2: Deployment Issue
**Theory**: Enhanced DevvitStorageAdapter code is not deployed

**Evidence Required**:
- Server logs show NO enhanced logging (no "DevvitAdapter.sAdd:" messages)

**Test**: Check logs during case generation
**Expected Result**: If no enhanced logs appear, redeploy

### Hypothesis 3: Redis Set Storage Issue
**Theory**: Devvit's Redis doesn't persist JSON arrays properly

**Evidence Required**:
- Logs show "sAdd" succeeding but "sMembers" returns empty
- Check raw Redis data if possible

**Test**: Add more logging to verify Redis.set() success
**Expected Result**: Should see explicit confirmation of storage

### Hypothesis 4: Case Generation Never Completed
**Theory**: Case was created but suspect saving failed silently

**Evidence Required**:
- Logs show "Case saved: case-2025-10-15" but no suspect sAdd logs after

**Test**: Check for errors in suspect saving loop
**Expected Result**: Should see error logs if this is the issue

## Manual Redis Inspection

If you have access to Devvit's Redis directly:

```typescript
// Add temporary endpoint to inspect Redis
router.get('/api/debug/redis/:key', async (req, res): Promise<void> => {
  const { key } = req.params;
  const value = await redis.get(key);
  res.json({ key, value });
});
```

Then check:
```javascript
// Check if suspects set exists
fetch('/api/debug/redis/case:case-2025-10-15:suspects')
  .then(r => r.json())
  .then(console.log);
// Expected: { key: "...", value: "[\"case-2025-10-15-suspect-1\",...]" }

// Check individual suspect
fetch('/api/debug/redis/suspect:case-2025-10-15-suspect-1')
  .then(r => r.json())
  .then(console.log);
// Expected: { key: "...", value: "{\"id\":\"case-2025-10-15-suspect-1\",...}" }
```

## Quick Fix Action Plan

### Immediate Actions (5 minutes)

1. **Check logs for enhanced logging**:
   ```bash
   npx devvit logs r/YOUR_SUBREDDIT --since 1h | grep "DevvitAdapter"
   ```

2. **If no logs found**: Enhanced code NOT deployed
   - Redeploy: `npm run upload`
   - Wait 2-3 minutes for deployment

3. **Delete existing case** (via browser console):
   ```javascript
   // Force case regeneration tomorrow
   // Or add debug endpoint to delete today's case
   ```

4. **Trigger case generation** (via browser console):
   ```javascript
   fetch('/api/case/generate', { method: 'POST' })
     .then(r => r.json())
     .then(console.log);
   ```

5. **Watch logs in real-time**:
   ```bash
   npx devvit logs r/YOUR_SUBREDDIT --since 1m --show-timestamps
   ```

6. **Verify suspects appear**:
   - Refresh UI
   - Should show "용의자 (3명)"

## Success Criteria

The issue is FIXED when:

1. Server logs show during case generation:
   ```
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set "case:case-2025-10-15:suspects" (now 1 members)
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set "case:case-2025-10-15:suspects" (now 2 members)
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set "case:case-2025-10-15:suspects" (now 3 members)
   ```

2. Server logs show during case fetch:
   ```
   ✅ DevvitAdapter.sMembers: Retrieved 3 members from set "case:case-2025-10-15:suspects"
   📋 Fetched 3 suspects for case case-2025-10-15
   ```

3. UI shows:
   ```
   용의자 (3명)
   ```

4. API response contains:
   ```json
   {
     "suspects": [
       { "id": "...", "name": "...", "archetype": "...", ... },
       { "id": "...", "name": "...", "archetype": "...", ... },
       { "id": "...", "name": "...", "archetype": "...", ... }
     ]
   }
   ```

## Additional Debug Logging

If the issue persists, add this logging to `CaseRepository.createCase()`:

```typescript
// After line 99 in CaseRepository.ts
await KVStoreManager.saveSuspect(suspectData);

// ADD THIS:
console.log(`✅ Saved suspect ${i + 1}/${input.suspects.length}: ${suspectData.id}`);

// Verify it was saved
const verification = await KVStoreManager.getSuspect(suspectData.id);
if (!verification) {
  console.error(`❌ CRITICAL: Suspect ${suspectData.id} was not saved correctly!`);
} else {
  console.log(`✅ Verified suspect ${suspectData.id} exists in storage`);
}

// Verify it's in the index
const indexCheck = await KVStoreManager.getCaseSuspects(caseId);
console.log(`📊 Current suspects in index: ${indexCheck.length}`);
```

## Contact/Next Steps

If after following all steps above the issue persists:

1. Provide the following in your report:
   - Full server logs from case generation
   - Response from `/api/case/today`
   - Response from `/api/debug/redis/case:case-2025-10-15:suspects` (if endpoint added)
   - Deployment timestamp
   - Case `generatedAt` timestamp

2. Consider these advanced investigations:
   - Check if Devvit Redis has size limits for values
   - Verify JSON.stringify/parse doesn't corrupt data
   - Test with a minimal case (1 suspect instead of 3)
   - Check if concurrent writes cause race conditions
