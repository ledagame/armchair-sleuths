# Root Cause Analysis: Case Data Loss Issue

**Date**: 2025-10-20
**Issue ID**: Evidence Discovery Data Loss
**Severity**: Critical
**Status**: RESOLVED

---

## Executive Summary

Newly generated cases were showing `locations` and `evidence` being created but immediately detected as "legacy cases" (missing these fields) upon retrieval. The root cause was a **missing field in the case data object** combined with an **overly strict legacy detection check**.

---

## Evidence Chain

### Symptom Logs
```
[DEVVIT] ✅ Discovery data generated: 4 locations, 10 evidence
[DEVVIT] ✅ Case saved with transaction: case-2025-10-20-1760941763900
[DEVVIT] ✅ Evidence distribution saved: 10 evidence across 4 locations
[DEVVIT] ⚠️ Legacy case detected: case-2025-10-20-1760941763900 - using fallback evidence
LocationExplorerSection.tsx:78 ⚠️ No locations found in case data
```

### Data Flow Investigation

1. **Case Generation** (`CaseGeneratorService.ts` lines 209-229)
   - ✅ `locations` generated correctly (4 items)
   - ✅ `evidence` generated correctly (10 items)
   - ✅ Both passed to `saveCaseWithTransaction()`

2. **Case Save** (`CaseGeneratorService.ts` lines 314-334)
   - ✅ `caseData.locations` set correctly (line 325)
   - ✅ `caseData.evidence` set correctly (line 326)
   - ❌ **`caseData.evidenceDistribution` NOT set**

3. **Evidence Distribution** (`CaseGeneratorService.ts` lines 233-242)
   - ✅ Distribution created (4 locations, 10 evidence)
   - ✅ Saved to separate Redis key: `evidence-distribution:${caseId}`
   - ❌ **NOT saved to caseData object**

4. **Legacy Detection** (`index.ts` line 1053)
   - Check: `!caseData.locations || !caseData.evidence || !caseData.evidenceDistribution`
   - Result: TRUE (because `evidenceDistribution` was missing)
   - Action: Triggered fallback evidence, ignoring actual data

---

## Root Cause

**File**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts`
**Line**: 1053

**Issue**: The legacy case detection required THREE fields:
```typescript
const isLegacyCase = !caseData.locations || !caseData.evidence || !caseData.evidenceDistribution;
```

But during case generation (`CaseGeneratorService.ts` lines 233-248):
- `evidenceDistribution` was saved to a **separate Redis key** via `DiscoveryStateManager.saveDistribution()`
- `evidenceDistribution` was **NOT added to the caseData object** before saving

This caused newly created cases to fail the legacy check despite having valid `locations` and `evidence` data.

---

## Why This Happened

### Architecture Design
The system uses two storage patterns:
1. **Embedded data**: `locations` and `evidence` stored in `caseData` object
2. **Separate storage**: `evidenceDistribution` stored in separate Redis key

### Code Evolution
The legacy detection check was added to distinguish between:
- **Old cases**: No discovery system (need fallback evidence)
- **New cases**: Full discovery system with `locations`, `evidence`, AND `evidenceDistribution`

However, the case generation code was not updated to include `evidenceDistribution` in the `caseData` object, only in the separate Redis key.

### API Usage
The API endpoints (`index.ts` lines 713, 1130) expect `caseData.evidenceDistribution` to exist:
```typescript
evidenceDistribution: caseData.evidenceDistribution,
```

This confirms the field should be part of the case data object.

---

## Solution Implemented

### Fix #1: Update Legacy Detection (Defensive)
**File**: `C:\Users\hpcra\armchair-sleuths\src\server\index.ts`
**Line**: 1053-1054

```typescript
// BEFORE
const isLegacyCase = !caseData.locations || !caseData.evidence || !caseData.evidenceDistribution;

// AFTER
// Note: evidenceDistribution is stored separately, so we only check locations and evidence
const isLegacyCase = !caseData.locations || !caseData.evidence;
```

**Rationale**: Even if `evidenceDistribution` is missing from `caseData`, we can fall back to loading it from the separate Redis key. This makes the check less brittle.

### Fix #2: Add evidenceDistribution to caseData (Correct Architecture)
**File**: `C:\Users\hpcra\armchair-sleuths\src\server\services\case\CaseGeneratorService.ts`
**Lines**: 241-246

```typescript
// BEFORE
await DiscoveryStateManager.saveDistribution(distribution);
console.log(`✅ Evidence distribution saved...`);

// AFTER
await DiscoveryStateManager.saveDistribution(distribution);

// 6.7. caseData에도 evidenceDistribution 추가하고 재저장
savedCase.evidenceDistribution = distribution;
await KVStoreManager.saveCase(savedCase);

console.log(`✅ Evidence distribution saved...`);
```

**Rationale**: This ensures `evidenceDistribution` is available directly on the `caseData` object, matching the expected API contract and eliminating the need for separate lookups.

---

## Verification Steps

1. **Generate New Case**
   - Run case generation
   - Verify logs show: "✅ Discovery data generated: X locations, Y evidence"
   - Verify logs show: "✅ Evidence distribution saved: Y evidence across X locations"

2. **Retrieve Case Data**
   - Call `/api/cases/:caseId` endpoint
   - Verify response includes `locations`, `evidence`, and `evidenceDistribution` fields
   - Verify NO "⚠️ Legacy case detected" warning in logs

3. **Search Evidence**
   - Call `/api/cases/:caseId/evidence/search` endpoint
   - Verify actual evidence is returned (not fallback evidence)
   - Verify locations are available for search

4. **Check Redis Storage**
   - Verify case data in Redis key `case:${caseId}` includes all three fields
   - Verify separate distribution key `evidence-distribution:${caseId}` also exists

---

## Prevention Measures

### Code Review Checklist
- [ ] When adding new fields to `CaseData` interface, verify they're set during case generation
- [ ] When adding new legacy checks, verify all required fields are populated in generation flow
- [ ] When saving data to multiple locations, document why and ensure consistency

### Testing Requirements
- [ ] Add integration test: "New cases should not be detected as legacy"
- [ ] Add unit test: "Case generation populates all required discovery fields"
- [ ] Add E2E test: "Full case lifecycle from generation to evidence search"

### Documentation
- [ ] Update architecture docs to clarify dual storage pattern for evidence distribution
- [ ] Document the difference between "embedded case data" and "separate storage"
- [ ] Add data flow diagram showing case generation → storage → retrieval

---

## Related Files

### Modified Files
- `C:\Users\hpcra\armchair-sleuths\src\server\index.ts` (line 1053-1054)
- `C:\Users\hpcra\armchair-sleuths\src\server\services\case\CaseGeneratorService.ts` (lines 241-246)

### Key Files Reviewed
- `C:\Users\hpcra\armchair-sleuths\src\server\services\repositories\kv\KVStoreManager.ts`
- `C:\Users\hpcra\armchair-sleuths\src\server\services\workflow\TransactionManager.ts`
- `C:\Users\hpcra\armchair-sleuths\src\server\services\repositories\adapters\DevvitStorageAdapter.ts`
- `C:\Users\hpcra\armchair-sleuths\src\shared\types\Discovery.ts`

---

## Lessons Learned

1. **Multi-location storage requires careful coordination**: When data is stored in both embedded and separate locations, ensure consistency.

2. **Validation checks should match data model**: The legacy check assumed `evidenceDistribution` would be in `caseData`, but the generation code didn't put it there.

3. **Log-driven debugging is effective**: The logs clearly showed data being generated and saved, but then immediately failing the legacy check - this pointed directly to the retrieval/validation logic.

4. **Type safety doesn't catch architectural mismatches**: TypeScript interfaces defined the optional fields correctly, but didn't enforce that they were actually populated.

---

## Impact

**Before Fix**:
- All newly generated cases failed to load evidence discovery system
- Players saw fallback evidence instead of procedurally generated evidence
- Location exploration was completely broken

**After Fix**:
- New cases properly load with full discovery system
- All generated locations and evidence are accessible
- Evidence distribution data is available for search logic

**Risk**: Low - Changes are additive and defensive. Worst case is we fall back to existing behavior.

---

## Conclusion

The data loss was not due to serialization, storage adapter issues, or Redis problems. It was a **logic error in the data population flow** where `evidenceDistribution` was saved separately but not included in the main `caseData` object, causing the legacy detection to incorrectly flag new cases.

The fix ensures data consistency by:
1. Storing `evidenceDistribution` in both locations (caseData + separate key)
2. Relaxing the legacy check to not require `evidenceDistribution` (defensive programming)

This dual approach ensures backward compatibility while fixing the root cause.
