# Suspects Not Appearing - Root Cause Analysis & Debugging Plan

## Executive Summary

**Problem**: UI shows "용의자 (0명)" despite case data existing
**Root Cause**: Most likely the current case (`case-2025-10-15`) was generated BEFORE the DevvitStorageAdapter enhancements were deployed
**Solution**: Regenerate today's case with the new code and monitor logs

## Evidence-Based Diagnosis

### Code Flow Analysis

I traced the complete execution flow from case generation to suspect retrieval:

```
POST /api/case/generate
  ↓
CaseGeneratorService.generateCase()
  ↓
CaseRepository.createCase()
  ↓
FOR EACH of 3 suspects:
  1. Create SuspectData object (with emotionalState)
  2. KVStoreManager.saveSuspect()
     ↓
     a. Save suspect data: adapter.set(`suspect:${id}`, JSON.stringify(...))
     b. Add to index: adapter.sAdd(`case:${caseId}:suspects`, suspectId)
        ↓
        DevvitStorageAdapter.sAdd() [ENHANCED WITH LOGGING]
          - Should log: "✅ DevvitAdapter.sAdd: Added 'suspect-X' ..."
```

### Enhanced Logging Added

**File**: `src/server/services/repositories/adapters/DevvitStorageAdapter.ts`

**Lines 58-89** (sAdd method):
- Logs successful addition: `✅ DevvitAdapter.sAdd: Added "${member}" to set "${key}" (now ${members.length} members)`
- Logs if member already exists: `ℹ️ DevvitAdapter.sAdd: Member "${member}" already exists`
- Logs errors: `❌ DevvitAdapter.sAdd: Critical error for key "${key}"`

**Lines 97-125** (sMembers method):
- Logs successful retrieval: `✅ DevvitAdapter.sMembers: Retrieved ${members.length} members from set "${key}"`
- Logs if key not found: `ℹ️ DevvitAdapter.sMembers: Key "${key}" not found`
- Logs parse errors: `❌ DevvitAdapter.sMembers: JSON.parse failed`

### Critical Hypothesis

**Hypothesis 1: Old Case Data** (90% confidence)

The existing case `case-2025-10-15` was generated BEFORE the enhanced DevvitStorageAdapter was deployed:

**Evidence**:
1. Version 0.0.2.25 was recently deployed with the enhancements
2. The case exists but has 0 suspects
3. No enhanced logging has been reported in server logs

**Implication**:
When the case was generated with the OLD code, the suspects were NOT properly saved to the Redis index `case:case-2025-10-15:suspects`. The old code didn't have the robust sAdd/sMembers implementation.

**Test**: Delete the case and regenerate it
**Expected**: New case will have 3 suspects

---

**Hypothesis 2: Deployment Issue** (8% confidence)

The enhanced code is not actually deployed to production.

**Evidence Needed**:
- Check server logs for "DevvitAdapter.sAdd" messages
- If not present, code is not deployed

**Test**: Trigger case generation and check logs
**Expected**: If no enhanced logs appear, need to redeploy

---

**Hypothesis 3: Redis Storage Issue** (2% confidence)

Devvit's Redis has issues with JSON array storage.

**Evidence Needed**:
- Logs show sAdd succeeding but sMembers returning empty
- Raw Redis inspection shows empty or corrupted data

**Test**: Run storage test endpoint
**Expected**: Basic storage operations should work

## Debugging Tools Created

I've created three debugging resources for you:

### 1. DEBUG_SUSPECTS_ISSUE.md
- Comprehensive debugging guide
- Step-by-step instructions for each hypothesis
- Expected log outputs
- Success criteria

### 2. debug-endpoint-patch.ts
- Temporary debug endpoints to add to `src/server/index.ts`
- Includes:
  - `POST /api/debug/regenerate-today` - Delete and regenerate today's case
  - `GET /api/debug/redis/:key` - Inspect raw Redis values
  - `GET /api/debug/case/:caseId` - Detailed case inspection
  - `POST /api/debug/test-storage` - Test storage operations

### 3. browser-console-tests.js
- Browser console helper functions
- Easy-to-use diagnostic commands
- Quick test sequences

## Immediate Action Plan

### Step 1: Verify Deployment (2 minutes)

**Check if enhanced logging is deployed:**

```bash
# View recent logs and search for enhanced logging
npx devvit logs r/YOUR_SUBREDDIT --since 1h --show-timestamps
```

**Look for**:
- Lines containing "DevvitAdapter.sAdd"
- Lines containing "DevvitAdapter.sMembers"

**Result**:
- ✅ If found: Enhanced code IS deployed, proceed to Step 2
- ❌ If NOT found: Enhanced code NOT deployed, need to redeploy

### Step 2: Test Basic Access (1 minute)

**Open browser console on your Devvit app page:**

```javascript
// Load the test functions
// Copy/paste contents of browser-console-tests.js

// Run basic diagnostics
await runBasicDiagnostics()
```

**This will**:
- Fetch today's case
- Check suspects count
- Verify both API endpoints

### Step 3A: If Enhanced Logging NOT Deployed

```bash
# Redeploy the app
cd C:\Users\hpcra\armchair-sleuths
npm run upload
```

Wait 2-3 minutes for deployment to complete, then proceed to Step 4.

### Step 3B: If Enhanced Logging IS Deployed

The case was likely generated with old code. Proceed to Step 4.

### Step 4: Add Debug Endpoints (5 minutes)

**Add the debug endpoints to your server:**

1. Open `src/server/index.ts`
2. Find line 184 (after the `/api/case/generate` endpoint)
3. Copy the contents of `debug-endpoint-patch.ts` and paste there
4. Deploy:
   ```bash
   npm run upload
   ```

### Step 5: Regenerate Today's Case (2 minutes)

**Option A: Using debug endpoint (recommended)**

```javascript
// In browser console
await regenerateTodaysCase()
```

**Option B: Manually**

```javascript
// In browser console
// First, call generate (note: this won't delete the old one)
await fetch('/api/case/generate', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

### Step 6: Monitor Server Logs (Real-time)

**In a separate terminal, watch logs:**

```bash
npx devvit logs r/YOUR_SUBREDDIT --since 1m --show-timestamps
```

**Expected log sequence:**

```
🔄 Generating today's case...
📚 Selected elements: ...
✅ Case story generated
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set "case:case-2025-10-15:suspects" (now 1 members)
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set "case:case-2025-10-15:suspects" (now 2 members)
✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set "case:case-2025-10-15:suspects" (now 3 members)
✅ Case created: case-2025-10-15 for date 2025-10-15
✅ Case saved: case-2025-10-15
```

### Step 7: Verify Fix (1 minute)

**Refresh the UI and check:**
- Should show "용의자 (3명)"
- Suspects should be visible in the UI

**Or in browser console:**

```javascript
await checkTodaysCase()
// Should log:
// ✅ Case Data: { ... }
// 📊 Suspects Count: 3
// 👥 Suspects:
//   1. 이서연 (비즈니스 파트너)
//   2. 박준호 (친구)
//   3. 최민지 (전 부인)
```

## Success Criteria

The issue is RESOLVED when ALL of the following are true:

1. **Server logs show during case generation:**
   ```
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-1" to set "case:case-2025-10-15:suspects" (now 1 members)
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-2" to set "case:case-2025-10-15:suspects" (now 2 members)
   ✅ DevvitAdapter.sAdd: Added "case-2025-10-15-suspect-3" to set "case:case-2025-10-15:suspects" (now 3 members)
   ```

2. **Server logs show during case fetch:**
   ```
   ✅ DevvitAdapter.sMembers: Retrieved 3 members from set "case:case-2025-10-15:suspects"
   📋 Fetched 3 suspects for case case-2025-10-15
   ```

3. **UI displays:**
   ```
   용의자 (3명)
   ```

4. **API response contains 3 suspects:**
   ```json
   {
     "id": "case-2025-10-15",
     "suspects": [
       { "id": "...", "name": "...", "archetype": "..." },
       { "id": "...", "name": "...", "archetype": "..." },
       { "id": "...", "name": "...", "archetype": "..." }
     ]
   }
   ```

## If Issue Persists

If after completing all steps above the issue STILL persists:

### Advanced Diagnostics

**Run full diagnostics:**

```javascript
// In browser console
await runFullDiagnostics()
```

**Inspect specific case:**

```javascript
await inspectCase('case-2025-10-15')
```

**Check raw Redis data:**

```javascript
await checkRedis('case:case-2025-10-15:suspects')
await checkRedis('suspect:case-2025-10-15-suspect-1')
```

### Provide This Information

If you need further help, provide:

1. **Server logs from case generation** (full output)
2. **Response from `/api/case/today`**
3. **Response from `/api/debug/case/case-2025-10-15`** (if debug endpoints added)
4. **Deployment timestamp** (when 0.0.2.25 was uploaded)
5. **Case `generatedAt` timestamp** (from API response)

### Alternative Theories to Investigate

If the standard fix doesn't work, investigate:

1. **Concurrent Write Issue**: Multiple case generations happening simultaneously
2. **Redis Value Size Limit**: Devvit Redis may have size limits
3. **JSON Stringify/Parse Corruption**: Character encoding issues
4. **Adapter Initialization**: DevvitStorageAdapter not properly set in KVStoreManager

## File Locations

All debugging resources are in your project root:

```
C:\Users\hpcra\armchair-sleuths\
├── DEBUG_SUSPECTS_ISSUE.md          # Comprehensive debugging guide
├── debug-endpoint-patch.ts          # Debug endpoints to add to server
├── browser-console-tests.js         # Browser console helpers
└── DEBUGGING_SUMMARY.md             # This file
```

## Key Code References

### DevvitStorageAdapter
- **File**: `src/server/services/repositories/adapters/DevvitStorageAdapter.ts`
- **sAdd**: Lines 58-89
- **sMembers**: Lines 97-125

### Case Generation Flow
- **Entry Point**: `src/server/index.ts` line 147 (`POST /api/case/generate`)
- **Generator**: `src/server/services/case/CaseGeneratorService.ts` line 65
- **Repository**: `src/server/services/repositories/kv/CaseRepository.ts` line 48

### Storage Layer
- **Manager**: `src/server/services/repositories/kv/KVStoreManager.ts`
  - `saveSuspect()`: Lines 166-177
  - `getCaseSuspects()`: Lines 200-217

## Timeline

### What Happened

1. **Original Issue**: Cases generated with incomplete suspect storage logic
2. **Fix Deployed**: Enhanced DevvitStorageAdapter with robust sAdd/sMembers (v0.0.2.25)
3. **Current State**: Old case still in storage, new code deployed
4. **Next Step**: Regenerate case to test new code

### Expected Timeline to Resolution

- **If hypothesis 1 is correct**: 5-10 minutes (regenerate case)
- **If hypothesis 2 is correct**: 15-20 minutes (redeploy + regenerate)
- **If hypothesis 3 is correct**: Investigation required (hours)

## Prevention

To prevent this issue in the future:

1. **Add health check endpoint** that verifies suspects exist
2. **Add monitoring** for cases with 0 suspects
3. **Add validation** in case generation to verify suspects were saved
4. **Add automated tests** for the full case generation + retrieval flow

## Contact

If you need clarification on any of these debugging steps, let me know which step you're on and what output you're seeing.
