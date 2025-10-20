# AP System Phase 1 - Implementation Complete

## Summary

Phase 1 of the AP (Action Points) system has been successfully implemented. This provides the core backend foundation for the AP acquisition system that rewards players for strategic interrogation of suspects.

## Implementation Status

### ✅ Completed Components

1. **Type Definitions** (`src/shared/types/`)
   - `Case.ts`: Added `APTopic`, `ActionPointsConfig`, and updated `Suspect` interface
   - `Evidence.ts`: Added `APAcquisition`, `APSpending`, `ActionPointsState`, updated `PlayerEvidenceState`

2. **Core Services** (`src/server/services/ap/`)
   - `APAcquisitionService.ts`: Main AP analysis engine
     - Topic detection (keyword matching)
     - Quality validation (50+ chars, specific info)
     - Bonus information detection (suspects, locations, secrets)
     - Emergency AP provision
   - `APTopicGenerator.ts`: Default topic generation and validation
     - Generates 3 topics for guilty suspects
     - Generates 2 topics for innocent suspects
     - Validates topic structure

3. **Data Layer** (`src/server/services/repositories/kv/`)
   - `KVStoreManager.ts`: Updated with AP support
     - `CaseData` includes `actionPoints` config
     - `SuspectData` includes `apTopics` array
     - Set serialization/deserialization for AP tracking

4. **Case Generation** (`src/server/services/case/`)
   - `CaseGeneratorService.ts`: Integrated AP system
     - Generates default AP topics for each suspect
     - Adds AP configuration to all cases
     - Backup file created: `CaseGeneratorService.ts.backup`

5. **Documentation**
   - `docs/AP_SYSTEM_PHASE1_IMPLEMENTATION.md`: Full implementation guide
   - `docs/AP_PHASE1_COMPLETE.md`: This file

### Files Created

```
src/server/services/ap/
├── APAcquisitionService.ts      (268 lines, core AP logic)
└── APTopicGenerator.ts          (91 lines, default topics & validation)

docs/
├── AP_SYSTEM_PHASE1_IMPLEMENTATION.md
└── AP_PHASE1_COMPLETE.md

scripts/
└── update-case-generator-ap.cjs (Script used for updates)
```

### Files Modified

```
src/shared/types/Case.ts                           (+47 lines)
src/shared/types/Evidence.ts                       (+67 lines)
src/server/services/repositories/kv/KVStoreManager.ts (+68 lines)
src/server/services/case/CaseGeneratorService.ts   (+21 lines)
```

## AP System Architecture

### Flow

```
Player Message → APAcquisitionService.analyzeConversation()
                 ↓
          ┌──────┴──────┐
          ↓             ↓
   Layer 1: Topics  Layer 2: Bonuses
   - Alibi          - Other Suspects
   - Relationship   - Locations
   - Motive         - Secrets
          ↓             ↓
   Quality Check   Direct Detection
          ↓             ↓
          └──────┬──────┘
                 ↓
         Maximum Cap Check
                 ↓
         APAcquisition[]
                 ↓
    PlayerEvidenceState.actionPoints
```

### Configuration

**Default AP Settings:**
```typescript
{
  initial: 3,        // Starting AP
  maximum: 12,       // AP cap
  costs: {
    quick: 1,        // Quick search cost
    thorough: 2,     // Thorough search cost
    exhaustive: 3    // Exhaustive search cost
  }
}
```

**Topic Configuration:**
- **Guilty Suspects**: 3 topics (alibi, relationship, motive) = 3 AP
- **Innocent Suspects**: 2 topics (alibi, relationship) = 2 AP
- **Bonuses per Suspect**: 3 bonuses (suspects, locations, secrets) = 3 AP
- **Maximum from Interrogation**: 18 AP (before cap)
- **Actual Maximum**: 12 AP (enforced by cap)

### Quality Requirements

For topic AP rewards, AI responses must:
1. Be at least 50 characters
2. Include specific information:
   - Time reference (시간, am/pm, 오전/오후, etc.)
   - Location reference (에서, 장소, 방, etc.)
   - Person reference (씨, 님, 그, 사람, etc.)

### Keywords

**Alibi Topic:**
```
['알리바이', '어디', '어디에', '시간', '범행', '범행 시각', '그때', 'where', 'alibi', 'when']
```

**Relationship Topic:**
```
['관계', '친구', '동료', '피해자', '알고', '지내', '사이', 'relationship', '어떤 사이']
```

**Motive Topic (Guilty Only):**
```
['이유', '동기', '왜', '미워', '화', '원망', 'motive', 'why', '원한']
```

**Bonus Detection:**
- **Suspects**: Mentions other suspect names in response
- **Locations**: Mentions location names from case locations array
- **Secrets**: Contains keywords ['비밀', '숨기', '몰랐', '알려지지 않은', '숨겨진', '모르는']

## Testing Verification

### Manual Testing Checklist

- [ ] Generate a new case and verify:
  - [ ] `caseData.actionPoints` exists with correct values
  - [ ] Each suspect has `apTopics` array
  - [ ] Guilty suspect has 3 topics
  - [ ] Innocent suspects have 2 topics

- [ ] Test APAcquisitionService:
  - [ ] Topic detection triggers on keywords
  - [ ] Quality check passes for good responses (50+ chars, specific info)
  - [ ] Quality check fails for bad responses (<50 chars or generic)
  - [ ] Bonus detection works for suspect mentions
  - [ ] Bonus detection works for location mentions
  - [ ] Bonus detection works for secret keywords
  - [ ] Maximum cap enforcement (12 AP max)
  - [ ] Emergency AP triggers at 0 AP

### Test Cases

**Topic Detection:**
```typescript
const service = new APAcquisitionService();

// Should trigger alibi topic
service.analyzeConversation(
  "당신의 알리바이를 말해주세요",  // User message with keyword
  "저는 오후 10시에 집에 있었습니다",  // Good quality response
  suspect,
  caseData,
  playerState,
  'conv-1'
);
// Expected: 1 AP from topic

// Should NOT trigger (already acquired)
playerState.actionPoints.acquiredTopics.add('suspect-1:topic-alibi-1');
// Expected: 0 AP (already triggered)
```

**Quality Check:**
```typescript
// PASS: 50+ chars + time reference
"저는 오후 10시에 집에 있었습니다" // ✓

// FAIL: Too short
"집에 있었어요" // ✗

// FAIL: No specific info
"저는 그 시간에 다른 곳에 있었습니다만 정확히 어디인지는 말할 수 없습니다" // ✗
```

**Bonus Detection:**
```typescript
// Bonus: Other suspect mention
"이서연씨를 봤어요" // +1 AP (suspect bonus)

// Bonus: Location mention
"사무실에 있었습니다" // +1 AP (location bonus)

// Bonus: Secret keyword
"피해자의 비밀을 알고 있었습니다" // +1 AP (secret bonus)
```

## Phase 2 Preview

Phase 2 will implement:

1. **API Integration**
   - POST `/api/interrogate` - Analyze conversation and award AP
   - GET `/api/player-state` - Get player's current AP state
   - POST `/api/search-location` - Spend AP for location search

2. **Frontend Components**
   - AP display badge (shows current AP)
   - AP acquisition notifications (toast messages)
   - AP history panel (optional, for debugging)
   - Search cost indicators

3. **Real-time Updates**
   - WebSocket or polling for AP updates
   - Smooth animations for AP changes
   - Visual feedback for rewards

4. **Integration Points**
   - Connect APAcquisitionService to interrogation flow
   - Link location search to AP spending
   - Initialize player AP state on case start

## Known Limitations

1. **No AI Intent Analysis**: Uses simple keyword matching only
2. **Korean-only Keywords**: English keywords provided but not optimized
3. **No Persistence**: AP state must be saved by calling KVStoreManager
4. **No API Endpoints**: Backend logic only, no HTTP endpoints yet
5. **No Frontend UI**: No visual components for AP display

These limitations will be addressed in Phase 2.

## Migration Notes

### Existing Cases

Cases generated before this update will:
- Be missing `actionPoints` config
- Have suspects without `apTopics`
- Need regeneration or manual migration

**Regeneration** (recommended):
```bash
# Delete existing case (if using dev environment)
# Then generate new case, which will include AP data
```

**Manual Migration** (not recommended):
You can add default values, but regeneration is cleaner.

### PlayerEvidenceState

New player states will automatically include:
```typescript
actionPoints: {
  current: 3,
  total: 3,
  spent: 0,
  initial: 3,
  acquisitionHistory: [],
  spendingHistory: [],
  acquiredTopics: new Set(),
  bonusesAcquired: new Set(),
  emergencyAPUsed: false
}
```

Existing states will need initialization when first accessed.

## Rollback Procedure

If issues arise:

1. **Restore CaseGeneratorService**:
   ```bash
   cd src/server/services/case
   cp CaseGeneratorService.ts.backup CaseGeneratorService.ts
   ```

2. **Revert Type Changes**:
   ```bash
   git checkout src/shared/types/Case.ts
   git checkout src/shared/types/Evidence.ts
   git checkout src/server/services/repositories/kv/KVStoreManager.ts
   ```

3. **Remove AP Services**:
   ```bash
   rm -rf src/server/services/ap
   ```

## Next Steps

1. **Test Phase 1 Implementation**
   - Generate new case
   - Verify AP topics in suspects
   - Test APAcquisitionService methods
   - Validate data persistence

2. **Begin Phase 2**
   - Design API endpoints
   - Create frontend components
   - Integrate with interrogation flow
   - Add search cost enforcement

3. **Documentation**
   - API endpoint documentation
   - Frontend integration guide
   - Player-facing AP guide

## Support

For issues or questions:
1. Check `docs/AP_SYSTEM_PHASE1_IMPLEMENTATION.md` for detailed implementation
2. Review code comments in AP service files
3. Verify TypeScript compilation passes

## Change Log

**2025-10-20 - Phase 1 Complete**
- ✅ Type definitions extended
- ✅ APAcquisitionService implemented
- ✅ APTopicGenerator created
- ✅ KVStoreManager updated
- ✅ CaseGeneratorService integrated
- ✅ Documentation completed

---

**Status**: Phase 1 Complete ✅
**Next**: Phase 2 - API & Frontend Integration
**Version**: 1.0.0
