# Frontend Data Flow Analysis: Missing Locations & Evidence

## Executive Summary

**Root Cause**: The `/api/case/today` endpoint DOES return `locations` and `evidenceDistribution` fields (lines 639-640), but the frontend's `useCase` hook is NOT mapping them to the `CaseData` object (lines 104-114, 134-145).

**Impact**:
- Frontend receives data correctly from backend
- Data transformation layer in `useCase.ts` drops the fields
- LocationExplorerSection falls back to default legacy locations
- Evidence discovery system may not function properly

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Backend: /api/case/today (src/server/index.ts:629-642)     │
│                                                             │
│ res.json({                                                  │
│   id, date, victim, weapon, location,                      │
│   suspects,                                                 │
│   imageUrl, introNarration, cinematicImages,               │
│   locations,              ◄── SENT                         │
│   evidenceDistribution,   ◄── SENT                         │
│   generatedAt                                               │
│ })                                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ fetch('/api/case/today')
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: useCase Hook (src/client/hooks/useCase.ts)       │
│                                                             │
│ const data: CaseApiResponse = await response.json()        │
│                                                             │
│ transformedCase: CaseData = {                              │
│   id, date, victim, weapon, location,                      │
│   suspects,                                                 │
│   imageUrl, introNarration, cinematicImages,               │
│   generatedAt                                               │
│   // locations MISSING ⚠️                                  │
│   // evidenceDistribution MISSING ⚠️                       │
│ }                                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ prop: caseData
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ App.tsx: Main Component                                    │
│                                                             │
│ const { caseData } = useCase()                             │
│                                                             │
│ <InvestigationScreen                                       │
│   caseData={caseData}  // No locations field               │
│ />                                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ prop: caseData
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ InvestigationScreen.tsx                                    │
│                                                             │
│ <LocationExplorerSection                                   │
│   locations={caseData.locations || []}  // Always []       │
│ />                                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ prop: locations = []
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ LocationExplorerSection.tsx (line 73-79)                   │
│                                                             │
│ const effectiveLocations = useMemo(() => {                │
│   if (locations.length > 0) {                              │
│     return locations;                                       │
│   }                                                         │
│   console.warn('⚠️ No locations found...');                │
│   return DEFAULT_LOCATIONS;  ◄── FALLBACK TRIGGERED        │
│ }, [locations]);                                            │
└─────────────────────────────────────────────────────────────┘
```

## Problem Breakdown

### 1. Data Reception: Backend Sends Complete Data ✓

**File**: `src/server/index.ts:629-642`

```typescript
res.json({
  id: todaysCase.id,
  date: todaysCase.date,
  language: language,
  victim: todaysCase.victim,
  weapon: todaysCase.weapon,
  location: todaysCase.location,
  suspects: suspectsData,
  imageUrl: todaysCase.imageUrl,
  introNarration: todaysCase.introNarration,
  locations: todaysCase.locations,              // ✓ SENT
  evidenceDistribution: todaysCase.evidenceDistribution,  // ✓ SENT
  generatedAt: todaysCase.generatedAt
});
```

**Backend logs confirm**:
```
📋 Case structure ready:
   - 🎯 Core: ✓
   - 📍 Locations: 4 locations
   - 🔍 Evidence: 6 items (distributed: 6)
   - 👤 Suspects: 4
```

### 2. Data Transformation: Fields Dropped ✗

**File**: `src/client/hooks/useCase.ts:134-145`

```typescript
// Transform API response to CaseData with suspects
const transformedCase: CaseData = {
  id: data.id,
  date: data.date,
  victim: data.victim,
  weapon: data.weapon,
  location: data.location,
  suspects: data.suspects || [],
  imageUrl: data.imageUrl,
  introNarration: data.introNarration,
  generatedAt: data.generatedAt,
  // ❌ locations: data.locations,              MISSING!
  // ❌ evidenceDistribution: data.evidenceDistribution,  MISSING!
};
```

**This same pattern appears in TWO places**:
- Lines 104-114 (auto-generation success path)
- Lines 134-145 (normal fetch path)

### 3. Type Definitions: Fields Are Optional ⚠️

**File**: `src/client/types/index.ts:65-78`

```typescript
export interface CaseData {
  id: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  locations?: Location[];             // Optional (should be required)
  evidenceDistribution?: any;         // Optional (should be required)
  imageUrl?: string;
  cinematicImages?: CinematicImages;
  introNarration?: IntroNarration;
  generatedAt: number;
}
```

**Problem**: Fields are optional, allowing the transformation to silently drop them without type errors.

### 4. Component Checks: Correct Logic, Wrong Data

**File**: `src/client/components/investigation/LocationExplorerSection.tsx:73-79`

```typescript
const effectiveLocations = useMemo(() => {
  if (locations.length > 0) {  // ❌ Always false (locations = [])
    return locations;
  }

  console.warn('⚠️ No locations found in case data - using fallback locations for legacy case support');
  return DEFAULT_LOCATIONS;  // ❌ Always reaches here
}, [locations]);
```

**The check is correct**, but `locations` is always `[]` because it was dropped during transformation.

## Action Points Error Analysis

### Error Message
```
Error: Not enough action points for thorough search. Required: 2, Available: 12
```

### Root Cause

**File**: `src/server/index.ts:1106-1116`

```typescript
// WRONG LOGIC: Multiplying searches by cost
if (!actionPointsService.canAffordSearch(
  playerState.stats.totalSearches * searchCost,  // ❌ BUG!
  searchType
)) {
  const totalActionPoints = 12;
  const actionPointsRemaining = totalActionPoints -
    (playerState.stats.totalSearches * searchCost);  // ❌ BUG!

  res.status(400).json({
    error: 'Insufficient action points',
    message: `Required: ${searchCost}, Available: ${actionPointsRemaining}`,
  });
}
```

**Problem**:
- Line 1106: `playerState.stats.totalSearches * searchCost` is nonsensical
  - `totalSearches` is a COUNT of searches performed (e.g., 5 searches)
  - `searchCost` is the cost of the CURRENT search (e.g., 2 AP)
  - Multiplying them gives meaningless value (e.g., 10)
  - This should be checking TOTAL AP SPENT, not count × current cost

- Line 1109: Same bug in calculating remaining AP
  - Should be: `totalActionPoints - playerState.stats.actionPointsSpent`
  - Not: `totalActionPoints - (totalSearches * searchCost)`

**Expected Flow**:
```typescript
// CORRECT LOGIC
const totalAPSpent = playerState.stats.actionPointsSpent || 0;
const actionPointsRemaining = totalActionPoints - totalAPSpent;

if (actionPointsRemaining < searchCost) {
  res.status(400).json({
    error: 'Insufficient action points',
    message: `Required: ${searchCost}, Available: ${actionPointsRemaining}`,
  });
}
```

## Fix Requirements

### Fix 1: Update useCase Hook Transformation (CRITICAL)

**File**: `src/client/hooks/useCase.ts`

Add the missing fields in TWO locations:

**Location 1: Lines 104-114** (auto-generation success path)
```typescript
const transformedCase: CaseData = {
  id: retryData.id,
  date: retryData.date,
  victim: retryData.victim,
  weapon: retryData.weapon,
  location: retryData.location,
  suspects: retryData.suspects || [],
  locations: retryData.locations || [],              // ✓ ADD
  evidenceDistribution: retryData.evidenceDistribution,  // ✓ ADD
  imageUrl: retryData.imageUrl,
  cinematicImages: retryData.cinematicImages,         // ✓ ADD (also missing!)
  introNarration: retryData.introNarration,
  generatedAt: retryData.generatedAt,
};
```

**Location 2: Lines 134-145** (normal fetch path)
```typescript
const transformedCase: CaseData = {
  id: data.id,
  date: data.date,
  victim: data.victim,
  weapon: data.weapon,
  location: data.location,
  suspects: data.suspects || [],
  locations: data.locations || [],              // ✓ ADD
  evidenceDistribution: data.evidenceDistribution,  // ✓ ADD
  imageUrl: data.imageUrl,
  cinematicImages: data.cinematicImages,         // ✓ ADD (also missing!)
  introNarration: data.introNarration,
  generatedAt: data.generatedAt,
};
```

### Fix 2: Update CaseApiResponse Type (RECOMMENDED)

**File**: `src/client/types/index.ts:182-193`

```typescript
export interface CaseApiResponse {
  id: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  locations?: Location[];             // ADD
  evidenceDistribution?: any;         // ADD
  imageUrl?: string;
  cinematicImages?: CinematicImages;
  introNarration?: IntroNarration;
  generatedAt: number;
}
```

### Fix 3: Fix Action Points Logic (CRITICAL)

**File**: `src/server/index.ts:1106-1116`

Replace the entire action points check:

```typescript
// Get or initialize player evidence state
const stateService = createPlayerEvidenceStateService();
let playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

if (!playerState) {
  playerState = stateService.initializeState(caseId, userId);
  await KVStoreManager.savePlayerEvidenceState(playerState);
}

// Check action points (FIXED)
const actionPointsService = createActionPointsService();
const searchCost = actionPointsService.getSearchCost(searchType);
const totalActionPoints = 12;  // TODO: Get from difficulty
const totalAPSpent = playerState.stats.actionPointsSpent || 0;
const actionPointsRemaining = totalActionPoints - totalAPSpent;

if (actionPointsRemaining < searchCost) {
  res.status(400).json({
    error: 'Insufficient action points',
    message: `Not enough action points for ${searchType} search. Required: ${searchCost}, Available: ${actionPointsRemaining}`,
    actionPointsRemaining
  });
  return;
}
```

**Prerequisites**: Ensure `playerState.stats.actionPointsSpent` is tracked correctly in the state service.

### Fix 4: Make Fields Required (OPTIONAL, BREAKING CHANGE)

**File**: `src/client/types/index.ts:65-78`

```typescript
export interface CaseData {
  id: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  locations: Location[];             // Remove ? (required)
  evidenceDistribution: any;         // Remove ? (required)
  imageUrl?: string;
  cinematicImages?: CinematicImages;
  introNarration?: IntroNarration;
  generatedAt: number;
}
```

**Warning**: This is a breaking change that will cause TypeScript errors in legacy case handling code. Only do this if you want to enforce that all cases MUST have these fields.

## Testing Verification

After applying fixes, verify:

1. **Backend sends data** (already confirmed ✓)
   ```bash
   # Check server logs
   📋 Case structure ready:
      - 📍 Locations: 4 locations
      - 🔍 Evidence: 6 items
   ```

2. **Frontend receives data**
   ```javascript
   // Add in useCase.ts after fetch
   console.log('📦 API Response:', data);
   console.log('📍 Locations:', data.locations);
   console.log('🔍 Evidence Distribution:', data.evidenceDistribution);
   ```

3. **Transformation preserves data**
   ```javascript
   // Add in useCase.ts after transformation
   console.log('✨ Transformed Case:', transformedCase);
   console.log('📍 Transformed Locations:', transformedCase.locations);
   ```

4. **Component receives data**
   ```javascript
   // Add in LocationExplorerSection.tsx
   console.log('🎯 Locations prop:', locations);
   console.log('🎯 Effective locations:', effectiveLocations);
   ```

5. **Action points work correctly**
   ```javascript
   // Test thorough search with 12 AP
   // Should succeed (12 >= 2)
   // Should show remaining: 10
   ```

## Summary

| Issue | Severity | Status | Fix Location |
|-------|----------|--------|--------------|
| `locations` field dropped | CRITICAL | ❌ | `useCase.ts:104, 134` |
| `evidenceDistribution` field dropped | CRITICAL | ❌ | `useCase.ts:104, 134` |
| `cinematicImages` field dropped | HIGH | ❌ | `useCase.ts:104, 134` |
| Action points logic bug | CRITICAL | ❌ | `server/index.ts:1106` |
| Type definitions too permissive | MEDIUM | ⚠️ | `types/index.ts:72-73` |

**Estimated Fix Time**: 15 minutes
**Risk Level**: LOW (changes are isolated to data transformation)
**Breaking Changes**: None (unless making fields required)
