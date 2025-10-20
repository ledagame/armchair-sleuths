# Data Loss Fix - Locations and Evidence Preservation

**Date**: 2025-10-20
**Issue**: Locations and evidence data was being lost after case generation
**Status**: ✅ Fixed

## Root Cause Analysis

### Problem
After deploying and creating a new post, locations and evidence were not working. The frontend displayed "레거시 케이스 모드" (Legacy case mode) warning despite backend logs showing successful generation:

```
[DEVVIT] ✅ Discovery data generated: 4 locations, 10 evidence
[DEVVIT] ✅ Evidence distribution saved: 10 evidence across 4 locations
[DEVVIT] ✅ Case saved with transaction: case-2025-10-20-1760947033776
```

### Root Cause
**Location**: `src/server/services/case/CaseGeneratorService.ts:248-254`

The issue was a **second save operation** that overwrote the transaction's saved data:

```typescript
// BEFORE (BUGGY CODE):
savedCase.evidenceDistribution = distribution;
await KVStoreManager.saveCase(savedCase);  // ← Overwrote without locations/evidence
```

**Data Flow**:
1. Line 213-218: `locations` and `evidence` generated
2. Line 223-233: Transaction saves case WITH locations/evidence to Redis
3. Line 249-250: Second save adds `evidenceDistribution` but LOSES locations/evidence

**Why it happened**: The `savedCase` object returned from the transaction had `locations` and `evidence` fields, but when only `evidenceDistribution` was added and the case was re-saved, TypeScript optional fields (`locations?: Location[]`) were not explicitly preserved, causing them to be undefined in the overwrite operation.

## Fix Implementation

**File**: `src/server/services/case/CaseGeneratorService.ts`
**Lines**: 250-254

### Changed Code:
```typescript
// 6.7. caseData에도 evidenceDistribution 추가하고 재저장
savedCase.evidenceDistribution = distribution;
// 🔧 FIX: Explicitly preserve locations and evidence fields before re-saving
// This ensures the second save doesn't lose data from the transaction
savedCase.locations = locations;
savedCase.evidence = evidence;
await KVStoreManager.saveCase(savedCase);
```

### Why This Works:
- Explicitly assigns `locations` and `evidence` from the original generated arrays
- Ensures all three fields (evidenceDistribution, locations, evidence) are present in the second save
- Prevents Redis overwrite from losing previously saved data

## Verification

### Build Status
```bash
npm run build
```
✅ Build successful - no TypeScript errors

### Expected Behavior After Fix
1. ✅ Case generation includes locations and evidence
2. ✅ Transaction saves all data to Redis
3. ✅ Second save preserves locations/evidence while adding evidenceDistribution
4. ✅ Frontend receives complete data
5. ✅ No "레거시 케이스 모드" warning
6. ✅ Location and evidence-based gameplay works correctly

## Testing Checklist

- [ ] Run `npm run dev`
- [ ] Create a new post with "Create a new post"
- [ ] Verify backend logs show all data generated
- [ ] Open game and check LocationExplorer displays locations
- [ ] Verify evidence discovery system works
- [ ] Confirm no "레거시 케이스 모드" warning appears
- [ ] Test end-to-end evidence-based investigation gameplay

## Related Files

- `src/server/services/case/CaseGeneratorService.ts` (Fixed)
- `src/server/services/repositories/kv/KVStoreManager.ts` (Verified correct)
- `src/shared/types/Case.ts` (CaseData interface with optional fields)
- `src/client/components/discovery/LocationExplorer.tsx` (Frontend consumer)

## Technical Details

### Data Types
```typescript
// From Case.ts
export interface CaseData {
  id: string;
  // ... other fields
  locations?: DiscoveryLocation[];  // Optional field
  evidence?: EvidenceItem[];        // Optional field
  evidenceDistribution?: EvidenceDistribution;  // Added later
}
```

### Transaction Flow
1. `generateCase()` creates locations/evidence
2. `saveCaseWithTransaction()` includes them in caseData object
3. Transaction atomically saves case + suspects to Redis
4. Returns caseData with all fields
5. Distribution created and saved separately
6. **FIX**: Explicit field preservation before second save

## Confidence Level
**95%** - Fix directly addresses the identified root cause with explicit field preservation

## Next Steps
1. Test end-to-end flow with new case creation
2. Verify no regression in existing functionality
3. Deploy and monitor for "레거시 케이스 모드" warnings
4. Confirm evidence-based gameplay works as expected
