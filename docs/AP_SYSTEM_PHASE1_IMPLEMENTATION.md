# AP System Phase 1 Implementation Summary

## Overview
Phase 1 implements the core backend foundation for the AP (Action Points) acquisition system. Players start with 3 AP and gain more (up to 12) through strategic interrogation.

## Files Modified/Created

### 1. Type Definitions

#### `src/shared/types/Case.ts` ✅ COMPLETED
Added:
- `APTopic` interface: Defines topics that trigger AP rewards
- `ActionPointsConfig` interface: AP configuration (initial, maximum, costs)
- `Suspect` interface: Suspect with AP topics

#### `src/shared/types/Evidence.ts` ✅ COMPLETED
Added:
- `APAcquisition` interface: Tracks AP acquisition
- `APSpending` interface: Tracks AP spending
- `ActionPointsState` interface: Complete AP state tracking
- Updated `PlayerEvidenceState` to include `actionPoints: ActionPointsState`

### 2. Core Service Layer

#### `src/server/services/ap/APAcquisitionService.ts` ✅ COMPLETED
New service implementing:
- `analyzeConversation()`: Main entry point for AP analysis
  - Layer 1: Topic detection (keyword matching)
  - Layer 2: Bonus information detection (suspects, locations, secrets)
- `detectTopic()`: Checks if user message triggers a topic
- `evaluateResponseQuality()`: Quality check (min 50 chars + specific info)
- `detectBonusInfo()`: Detects bonus information in AI response
- `provideEmergencyAP()`: Emergency AP (2 AP when player has 0)

Features:
- Simple keyword matching (no AI intent analysis)
- Quality validation for responses
- Maximum AP cap enforcement
- One-time bonuses per suspect

### 3. Helper Services

#### `src/server/services/ap/APTopicGenerator.ts` ✅ COMPLETED
New utility implementing:
- `generateDefaultAPTopics(isGuilty)`: Fallback topic generation
  - Guilty suspects: 3 topics (alibi, relationship, motive)
  - Innocent suspects: 2 topics (alibi, relationship)
- `validateAPTopics()`: Validation for AP topics array

### 4. Data Storage Layer

#### `src/server/services/repositories/kv/KVStoreManager.ts` ✅ COMPLETED
Updated:
- `CaseData` interface: Added `actionPoints: ActionPointsConfig`
- `SuspectData` interface: Added `apTopics: APTopic[]`
- `savePlayerEvidenceState()`: Handle Set serialization for AP tracking
- `getPlayerEvidenceState()`: Handle Set deserialization for AP tracking

### 5. Case Generation Updates

#### `src/server/services/case/CaseGeneratorService.ts` ⚠️ NEEDS MANUAL UPDATE
Required changes:

**Add import:**
```typescript
import type { Location as DiscoveryLocation, APTopic, ActionPointsConfig } from '@/shared/types/Case';
import { generateDefaultAPTopics, validateAPTopics } from '../ap/APTopicGenerator';
```

**Update line ~329 in `saveCaseWithTransaction()` method:**
```typescript
const caseData: CaseData = {
  id: caseId,
  date: dateStr,
  victim: caseStory.victim,
  weapon: { name: elements.weapon.name, description: elements.weapon.description },
  location: { name: elements.location.name, description: elements.location.description },
  suspects: suspectsWithIds,
  solution: caseStory.solution,
  generatedAt: Date.now(),
  imageUrl,
  introNarration,
  locations,
  evidence,
  // Action Points configuration
  actionPoints: {
    initial: 3,
    maximum: 12,
    costs: {
      quick: 1,
      thorough: 2,
      exhaustive: 3
    }
  },
  // 시네마틱 이미지는 백그라운드에서 생성
  cinematicImages: null,
  imageGenerationStatus: 'pending' as ImageGenerationStatus,
  imageGenerationMeta: {
    startedAt: undefined,
    retryCount: 0
  }
};
```

**Update line ~351 in `suspectDataList` mapping:**
```typescript
const suspectDataList: SuspectData[] = suspectsWithImages.map((suspect, index) => {
  // Generate AP topics for each suspect
  const apTopics = generateDefaultAPTopics(suspect.isGuilty);

  return {
    id: suspectsWithIds[index].id,
    caseId: caseId,
    name: suspect.name,
    archetype: elements.suspects[index].archetype,
    background: suspect.background,
    personality: suspect.personality,
    isGuilty: suspect.isGuilty,
    emotionalState: {
      suspicionLevel: 0,
      tone: 'cooperative',
      lastUpdated: Date.now()
    },
    profileImageUrl: suspect.profileImageUrl,
    apTopics  // Add AP topics
  };
});
```

**Add validation after line ~232 (in `generateCase()` method, after case story generation):**
```typescript
// 2.6. Validate and ensure AP topics for each suspect
for (const suspect of caseStory.suspects) {
  if (!suspect.apTopics || !validateAPTopics(suspect.apTopics)) {
    console.warn(`Suspect missing valid AP topics, using defaults`);
    // Will be added in saveCaseWithTransaction
  }
}
```

## Manual Steps Required

### Update CaseGeneratorService.ts

1. **Add imports** (line ~20):
   ```typescript
   import type { APTopic, ActionPointsConfig } from '@/shared/types/Case';
   import { generateDefaultAPTopics, validateAPTopics } from '../ap/APTopicGenerator';
   ```

2. **Update `caseData` object** (line ~329):
   - Add `actionPoints` configuration with initial=3, maximum=12, costs

3. **Update `suspectDataList` mapping** (line ~351):
   - Generate `apTopics` for each suspect using `generateDefaultAPTopics(suspect.isGuilty)`
   - Add `apTopics` field to returned object

### Optional: Update Gemini Prompt (Future Enhancement)

The current implementation uses fallback topic generation. To have Gemini generate AP topics directly, update `buildCaseStoryPrompt()` method to include AP topic generation instructions in the JSON response format.

**This is NOT required for Phase 1 MVP** - the fallback generation is sufficient.

## Testing Checklist

- [ ] Case generation includes `actionPoints` config
- [ ] Each suspect has `apTopics` (2-3 topics)
- [ ] Guilty suspects have 3 topics (including motive)
- [ ] Innocent suspects have 2 topics (alibi, relationship)
- [ ] APAcquisitionService correctly detects topic keywords
- [ ] APAcquisitionService evaluates response quality
- [ ] APAcquisitionService detects bonus information
- [ ] Emergency AP triggers when player has 0 AP
- [ ] PlayerEvidenceState serialization/deserialization works with Sets

## Phase 2 Preview

Phase 2 will add:
- API endpoints for AP tracking
- Frontend UI components for AP display
- Integration with suspect interrogation system
- Real-time AP updates during conversations
- AP spending for location searches

## Key Design Decisions

1. **Simple keyword matching** - No AI intent analysis in Phase 1 for reliability
2. **Quality validation** - Ensures suspects give meaningful responses before AP reward
3. **Bonus system** - Encourages deeper interrogation (mentions of other suspects, locations, secrets)
4. **Emergency AP** - Safety net to prevent players from getting stuck
5. **One-time bonuses** - Each bonus can only be acquired once per suspect per player

## Configuration

Default AP configuration:
- Initial AP: 3
- Maximum AP: 12
- Search costs: Quick=1, Thorough=2, Exhaustive=3
- Topic rewards: 1 AP per topic
- Bonus rewards: 1 AP per bonus (max 3 bonuses per suspect)
- Emergency AP: 2 AP (one-time only)

Maximum theoretical AP: 3 (initial) + 9 (3 suspects × 3 topics) + 9 (3 suspects × 3 bonuses) = 21 AP
But capped at: 12 AP maximum
