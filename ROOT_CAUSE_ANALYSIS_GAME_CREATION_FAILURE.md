# Root Cause Analysis: Game Creation Failure After P0-P2 UI Integration

**Date**: 2025-10-27
**Analyst**: Claude (Root Cause Analyst)
**Version**: 0.0.54
**Status**: ⚠️ CRITICAL - Game posts cannot load case data

---

## Executive Summary

Game creation via the menu action `/internal/menu/post-create` successfully generates cases and creates Reddit posts, but the newly created posts **cannot display game content** because the Custom Post (main.tsx) cannot access the case data. This is a **critical architectural mismatch** between how data is stored (per-case Redis keys) and how it's accessed (expecting `case:current` key or `context.postData`).

**Impact**: 100% of new game posts created after deployment are non-functional.

---

## Evidence Chain

### 1. Post Creation Flow (✅ WORKING)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts` (Lines 150-251)

```typescript
router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  // ✅ Case generation succeeds
  const newCase = await caseGenerator.generateCase({
    date: now,
    includeImage: true,
    includeSuspectImages: true,
    includeCinematicImages: true,
    temperature: 0.8,
    customCaseId: customCaseId  // e.g., "case-2025-10-27-1729977600000"
  });

  // ✅ Post creation succeeds
  const post = await createPost({
    caseId: newCase.id,
    title: postTitle,
    subredditName: context.subredditName
  });

  // ✅ Returns navigation response
  res.json({ navigateTo: post });
});
```

**Evidence**: Logs show successful case generation with proper suspect images and intro slides.

---

### 2. Post Metadata Structure (⚠️ INCOMPLETE)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\core\post.ts` (Lines 30-38)

```typescript
const payload = {
  postData: {
    gameState: 'initial',
    score: 0,
    caseId: caseId,  // ✅ caseId IS included in postData
  },
  subredditName: targetSubreddit,
  title: postTitle,
};

const result = await reddit.submitCustomPost(payload);
```

**Evidence**: The `caseId` is correctly passed to `postData`, but the Custom Post never reads it.

---

### 3. Case Storage Mechanism (✅ WORKING)

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\services\repositories\kv\KVStoreManager.ts` (Lines 140-151)

```typescript
static async saveCase(caseData: CaseData): Promise<void> {
  const key = `case:${caseData.id}`;  // e.g., "case:case-2025-10-27-1729977600000"
  await this.adapter.set(key, JSON.stringify(caseData));

  // Date index for searching
  const dateKey = `case:date:${caseData.date}`;  // e.g., "case:date:2025-10-27"
  await this.adapter.set(dateKey, caseData.id);
}
```

**Evidence**: Cases are stored with unique IDs like `case:case-2025-10-27-1729977600000`, NOT as `case:current`.

---

### 4. Custom Post Data Access (❌ BROKEN)

**File**: `C:\Users\hpcra\armchair-sleuths\src\main.tsx` (Lines 360-387)

```typescript
context.useState(async () => {
  try {
    setCaseLoading(true);
    setCaseError(null);

    // ❌ CRITICAL ERROR: Trying to load from 'case:current' which doesn't exist
    const caseDataRaw = await context.redis.get('case:current');

    if (!caseDataRaw) {
      setCaseError('사건 데이터를 찾을 수 없습니다. 새로운 사건을 생성해주세요.');
      setCaseLoading(false);
      return;  // ❌ EXECUTION STOPS HERE - NO GAME DATA LOADED
    }

    const parsedCase = JSON.parse(caseDataRaw) as CaseData;
    setCaseData(parsedCase);
    setCurrentScreen('case-overview');
  } catch (error) {
    console.error('[DEVVIT] Failed to load case:', error);
    setCaseError('사건을 불러오는 중 오류가 발생했습니다.');
    setCaseLoading(false);
  }
});
```

**Critical Issues**:
1. ❌ **Never reads `context.postData.caseId`** - The caseId passed during post creation is ignored
2. ❌ **Hardcoded `case:current` key** - This key is never set anywhere in the codebase
3. ❌ **No fallback mechanism** - If `case:current` doesn't exist, the game completely fails

---

### 5. Devvit Post Data Architecture (📚 REFERENCE)

**Source**: Devvit Official Documentation
**URL**: https://github.com/reddit/devvit/blob/main/devvit-docs/docs/capabilities/server/post-data.mdx

According to Devvit documentation:

```typescript
// ✅ CORRECT: Access postData from context
Devvit.addCustomPostType({
  name: 'MyCustomPost',
  render: (context) => {
    // Access post data directly from context
    const caseId = context.postData?.caseId;

    return (
      <vstack>
        <text>Case ID: {caseId}</text>
      </vstack>
    );
  },
});
```

**Key Points**:
- Post data is accessible via `context.postData`
- Post data persists with the post (max 2KB)
- Post data is shared across all users viewing the post
- Does NOT require Redis lookup

---

## Root Cause Summary

### Primary Issue: Data Access Mismatch

**Symptom**: Custom Post shows "사건 데이터를 찾을 수 없습니다" (Case data not found)

**Root Cause**: The Custom Post (main.tsx) attempts to load case data from Redis key `case:current`, which is never written during post creation. Meanwhile, the actual `caseId` stored in `context.postData` is completely ignored.

**Evidence**:
1. ✅ Post creation stores `caseId` in `postData` (post.ts:34)
2. ✅ Case data is stored in Redis with key `case:${caseId}` (KVStoreManager.ts:145)
3. ❌ Custom Post never reads `context.postData.caseId` (main.tsx:366)
4. ❌ Custom Post looks for non-existent `case:current` key (main.tsx:366)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MENU ACTION FLOW (WORKING)                    │
└─────────────────────────────────────────────────────────────────┘
         │
         │ 1. Generate Case
         ▼
    ┌─────────────────┐
    │ CaseGenerator   │ → Redis: case:case-2025-10-27-123456
    └─────────────────┘
         │
         │ 2. Create Post
         ▼
    ┌─────────────────┐
    │ submitCustomPost│ → postData: { caseId: "case-2025-10-27-123456" }
    └─────────────────┘
         │
         │ 3. Navigate to Post
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CUSTOM POST RENDER (BROKEN)                    │
└─────────────────────────────────────────────────────────────────┘
         │
         │ ❌ BROKEN: Looks for case:current (doesn't exist)
         ▼
    ┌─────────────────┐
    │ context.redis   │ → get('case:current') → null
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Error Screen    │ → "사건 데이터를 찾을 수 없습니다"
    └─────────────────┘

         ✅ CORRECT PATH (NOT IMPLEMENTED):
         │
         │ Read caseId from postData
         ▼
    ┌─────────────────┐
    │ context.postData│ → { caseId: "case-2025-10-27-123456" }
    └─────────────────┘
         │
         │ Load case from Redis
         ▼
    ┌─────────────────┐
    │ context.redis   │ → get('case:case-2025-10-27-123456')
    └─────────────────┘
         │
         ▼
    ┌─────────────────┐
    │ Game Renders ✅ │
    └─────────────────┘
```

---

## Secondary Issues Discovered

### Issue 1: No `case:current` Writer
**Evidence**: Searched entire codebase - no code writes to `case:current` key.
```bash
grep -r "case:current" src/
# Result: Only 2 reads in main.tsx, 0 writes
```

### Issue 2: Scheduler Uses Different Pattern
**File**: `src\server\schedulers\DailyCaseScheduler.ts`
- Uses date-based keys: `case:date:YYYY-MM-DD`
- Uses case-specific keys: `case:${caseId}`
- ❌ Never creates `case:current` alias

### Issue 3: Multiple Case Instances Possible
- Each menu action creates a unique case with timestamp-based ID
- Multiple posts can exist simultaneously
- `case:current` concept doesn't fit multi-instance architecture

---

## Impact Analysis

### Severity: 🔴 CRITICAL

**User Impact**:
- 100% of new game posts are non-functional
- Users see error message instead of game
- No workaround available to users

**Business Impact**:
- Complete game creation failure
- Reddit deployment (v0.0.54) is broken
- P0-P2 UI integration wasted if data cannot load

**Technical Debt**:
- Architecture assumes single "current" case
- Does not support multiple concurrent games
- Devvit best practices not followed (postData ignored)

---

## Recommended Fixes

### Fix 1: Use `context.postData` (RECOMMENDED ✅)

**File**: `src/main.tsx` (Lines 360-387)

**Change**:
```typescript
context.useState(async () => {
  try {
    setCaseLoading(true);
    setCaseError(null);

    // ✅ FIX: Read caseId from postData
    const caseId = context.postData?.caseId as string | undefined;

    if (!caseId) {
      setCaseError('포스트에 케이스 ID가 없습니다.');
      setCaseLoading(false);
      return;
    }

    // ✅ FIX: Load case using caseId
    const caseKey = `case:${caseId}`;
    const caseDataRaw = await context.redis.get(caseKey);

    if (!caseDataRaw) {
      setCaseError(`사건 데이터를 찾을 수 없습니다. (ID: ${caseId})`);
      setCaseLoading(false);
      return;
    }

    const parsedCase = JSON.parse(caseDataRaw) as CaseData;
    setCaseData(parsedCase);
    setCurrentScreen('case-overview');

    console.log(`[DEVVIT] Case loaded: ${parsedCase.id}`);
  } catch (error) {
    console.error('[DEVVIT] Failed to load case:', error);
    setCaseError('사건을 불러오는 중 오류가 발생했습니다.');
    setCaseLoading(false);
  }
});
```

**Benefits**:
- ✅ Follows Devvit best practices
- ✅ Supports multiple concurrent games
- ✅ Minimal code changes
- ✅ No backend changes required

---

### Fix 2: Update Polling Logic

**File**: `src/main.tsx` (Lines 425-442)

**Change**: When manually generating cases, also update the polling to use the specific case ID rather than `case:current`.

```typescript
const pollInterval = setInterval(async () => {
  attempts++;

  // ✅ FIX: Poll for the specific case, not case:current
  const caseKey = `case:case-${dateStr}-${timestamp}`;
  const caseDataRaw = await context.redis.get(caseKey);

  if (caseDataRaw) {
    clearInterval(pollInterval);
    const parsedCase = JSON.parse(caseDataRaw) as CaseData;
    setCaseData(parsedCase);
    setCaseLoading(false);
    setCurrentScreen('case-overview');
    context.ui.showToast('✅ 새로운 사건이 생성되었습니다!');
  } else if (attempts >= maxAttempts) {
    clearInterval(pollInterval);
    setCaseError('사건 생성 시간이 초과되었습니다. 다시 시도해주세요.');
    setCaseLoading(false);
  }
}, 5000);
```

---

## Alternative Solutions (NOT RECOMMENDED)

### Alternative 1: Write to `case:current`
**Approach**: Modify post creation to write case data to both `case:${caseId}` AND `case:current`.

**Why NOT Recommended**:
- ❌ Violates multi-instance architecture
- ❌ Race conditions if multiple posts created
- ❌ Last post overwrites previous posts' data
- ❌ Doesn't follow Devvit best practices

### Alternative 2: Embed Case in postData
**Approach**: Store entire case in `postData` (2KB limit).

**Why NOT Recommended**:
- ❌ Case data exceeds 2KB limit (suspects, evidence, images)
- ❌ Cannot update case data dynamically
- ❌ Duplicates data already in Redis

---

## Testing Plan

### Test 1: Verify postData Access
```typescript
// Add debug logging in main.tsx render function
console.log('[DEBUG] context.postData:', JSON.stringify(context.postData, null, 2));
console.log('[DEBUG] caseId from postData:', context.postData?.caseId);
```

**Expected Output**: Should show `{ gameState: 'initial', score: 0, caseId: 'case-2025-10-27-...' }`

### Test 2: Verify Redis Key Format
```bash
# After case creation, check Redis keys
npx devvit logs armchair_sleuths_dev --since 1m | grep "Case generated"
# Should show: "Case generated: case-2025-10-27-1729977600000"
```

### Test 3: End-to-End Flow
1. Create new post via menu action
2. Verify case data loads in Custom Post
3. Verify game screens render correctly
4. Verify multiple posts can coexist

---

## Validation Checklist

- [ ] Fix implemented in `src/main.tsx` (lines 360-387)
- [ ] Polling logic updated (lines 425-442)
- [ ] Build succeeds without errors
- [ ] postData access verified in dev logs
- [ ] New post creation tested
- [ ] Multiple concurrent posts tested
- [ ] P0-P2 UI screens render correctly
- [ ] No regression in existing functionality

---

## Timeline Estimate

**Implementation**: 30 minutes
**Testing**: 30 minutes
**Deployment**: 15 minutes
**Total**: ~1.5 hours

---

## Conclusion

The game creation failure is caused by a **fundamental data access mismatch** in the Custom Post render function. The fix is straightforward: replace the hardcoded `case:current` Redis lookup with `context.postData.caseId` access, following Devvit's documented best practices.

This is a **single-point failure** affecting 100% of new game posts, but the fix is **low-risk and high-impact** with minimal code changes required.

**Priority**: 🔴 P0 - Critical blocker for production deployment

---

## Files Requiring Changes

1. **C:\Users\hpcra\armchair-sleuths\src\main.tsx**
   - Lines 360-387: Replace `case:current` with `context.postData.caseId`
   - Lines 425-442: Update polling logic for specific case IDs

**Total Files**: 1
**Total Lines Changed**: ~30
**Risk Level**: Low (isolated change, no backend impact)

---

## Appendix: Evidence Files

- ✅ `src/server/index.ts` (post-create endpoint)
- ✅ `src/server/core/post.ts` (submitCustomPost call)
- ✅ `src/server/services/repositories/kv/KVStoreManager.ts` (saveCase)
- ✅ `src/main.tsx` (Custom Post render)
- ✅ Devvit documentation (post-data.mdx)

---

**Report Generated**: 2025-10-27
**Analysis Method**: Evidence-based systematic investigation
**Confidence Level**: 🔴 HIGH (100% reproducible, clear evidence chain)
