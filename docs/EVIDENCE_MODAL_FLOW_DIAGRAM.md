# Evidence Modal Flow Diagram

## Complete User Journey: Discovery → Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        InvestigationScreen                              │
│                                                                         │
│  State:                                                                 │
│    - activeTab: 'locations' | 'suspects' | 'evidence'                   │
│    - selectedEvidenceId: string | null                                  │
│                                                                         │
│  Handler:                                                               │
│    handleSwitchToEvidenceTab(evidenceId?) {                            │
│      setActiveTab('evidence')                                           │
│      setSelectedEvidenceId(evidenceId)                                  │
│    }                                                                    │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ activeTab === 'locations'
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LocationExplorerSection                            │
│                                                                         │
│  Props: onSwitchToEvidenceTab                                           │
│                                                                         │
│  [1] User clicks "Search Location"                                      │
│       ↓                                                                 │
│  [2] handleSearchLocation() → searchLocation(locationId, searchType)    │
│       ↓                                                                 │
│  [3] Evidence discovered → Show EvidenceDiscoveryModal                  │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ modalOpen === true
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EvidenceDiscoveryModal                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  🔍 탐색 완료!                                     [X]             │  │
│  │  범죄 현장 탐색 결과                                                │  │
│  │                                                                  │  │
│  │  3                                                               │  │
│  │  개의 증거 발견                                                    │  │
│  │                                                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │  │
│  │  │            │  │            │  │            │                 │  │
│  │  │  Evidence  │  │  Evidence  │  │  Evidence  │   ← Clickable   │  │
│  │  │   Card 1   │  │   Card 2   │  │   Card 3   │                 │  │
│  │  │            │  │            │  │            │                 │  │
│  │  └────────────┘  └────────────┘  └────────────┘                 │  │
│  │      [4] User clicks evidence card                               │  │
│  │                                                                  │  │
│  │  [계속 수사하기]                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  onEvidenceClick={(evidenceId) => {                                     │
│    handleCloseModal();            // Close discovery modal              │
│    onSwitchToEvidenceTab(evidenceId);  // Navigate to evidence tab     │
│  }}                                                                     │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ Evidence clicked (evidence.id)
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EvidenceImageCard                                 │
│                                                                         │
│  [5] handleClick() invoked                                              │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  const handleClick = () => {                                     │  │
│  │    // ✅ FIXED: Prioritize onClick over lightbox                 │  │
│  │    if (onClick) {                                                │  │
│  │      onClick();  // Navigate to detail modal                     │  │
│  │    } else if (imageStatus === 'loaded' && imageUrl) {            │  │
│  │      setIsLightboxOpen(true);  // In-place viewing               │  │
│  │    }                                                             │  │
│  │  };                                                              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Result: onClick() called → triggers onEvidenceClick callback           │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ onClick() → onEvidenceClick(evidenceId)
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Back to LocationExplorerSection                           │
│                                                                         │
│  [6] onEvidenceClick callback triggered                                 │
│       ↓                                                                 │
│  [7] handleCloseModal() - closes discovery modal                        │
│       ↓                                                                 │
│  [8] onSwitchToEvidenceTab(evidenceId) - switches tab + sets selection │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ Calls parent's handleSwitchToEvidenceTab
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 InvestigationScreen (Handler)                           │
│                                                                         │
│  [9] handleSwitchToEvidenceTab(evidenceId) {                            │
│       setActiveTab('evidence')      // Switch to evidence tab           │
│       setSelectedEvidenceId(evidenceId)  // Mark evidence for selection │
│     }                                                                   │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ activeTab changed to 'evidence'
                │ selectedEvidenceId set
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    EvidenceNotebookSection                              │
│                                                                         │
│  Props: selectedEvidenceId (from parent)                                │
│                                                                         │
│  [10] useEffect triggered by selectedEvidenceId change                  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  useEffect(() => {                                               │  │
│  │    if (selectedEvidenceId && playerState) {                      │  │
│  │      // Find evidence by ID                                      │  │
│  │      const evidence = playerState.discoveredEvidence?.find(      │  │
│  │        ev => ev.id === selectedEvidenceId                        │  │
│  │      );                                                           │  │
│  │      if (evidence) {                                             │  │
│  │        setSelectedEvidence(evidence);  // [11] Set local state   │  │
│  │        setIsDetailModalOpen(true);     // [12] Open detail modal │  │
│  │        onClearSelection?.();           // [13] Clear parent state│  │
│  │      }                                                           │  │
│  │    }                                                             │  │
│  │  }, [selectedEvidenceId, playerState, onClearSelection]);        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└───────────────┬─────────────────────────────────────────────────────────┘
                │
                │ isDetailModalOpen === true
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EvidenceDetailModal                                │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  🔍 [Evidence Name]                              📌 [X]          │  │
│  │                                                                  │  │
│  │  📝 상세 설명                                                      │  │
│  │  [Full evidence description with all details]                    │  │
│  │                                                                  │  │
│  │  💡 발견 단서                                                      │  │
│  │  [Discovery hint]                                                │  │
│  │                                                                  │  │
│  │  🔎 분석 힌트                                                      │  │
│  │  [Interpretation hint]                                           │  │
│  │                                                                  │  │
│  │  📸 증거 사진                                                      │  │
│  │  ┌──────────────────────────────────────┐                        │  │
│  │  │                                      │   ← Click to enlarge   │  │
│  │  │         Evidence Image               │      (lightbox)        │  │
│  │  │                                      │                        │  │
│  │  └──────────────────────────────────────┘                        │  │
│  │                                                                  │  │
│  │  👥 관련 용의자                                                    │  │
│  │  🔗 연관 증거                                                      │  │
│  │  ℹ️ 증거 정보                                                      │  │
│  │                                                                  │  │
│  │  [닫기]                                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  [14] User reviews evidence, then closes modal                          │
│  [15] Ready for next investigation action                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## State Changes Timeline

```
Time  Component                  State Change
────  ─────────────────────────  ──────────────────────────────────────
T0    LocationExplorerSection    modalOpen: false → true
                                 currentDiscovery: null → {...}

T1    EvidenceDiscoveryModal     isOpen: true (displayed)

T2    EvidenceImageCard          onClick() called (no lightbox!)

T3    LocationExplorerSection    modalOpen: true → false (cleanup)
      InvestigationScreen        activeTab: 'locations' → 'evidence'
                                 selectedEvidenceId: null → 'ev-123'

T4    EvidenceNotebookSection    selectedEvidence: null → {...}
                                 isDetailModalOpen: false → true

T5    InvestigationScreen        selectedEvidenceId: 'ev-123' → null

T6    EvidenceDetailModal        isOpen: true (displayed)
```

## Callback Chain Summary

```
User Click
    ↓
EvidenceImageCard.handleClick()
    ↓
EvidenceImageCard.onClick()
    ↓
EvidenceDiscoveryModal.onEvidenceClick(evidenceId)
    ↓
LocationExplorerSection.handleCloseModal()
LocationExplorerSection.onSwitchToEvidenceTab(evidenceId)
    ↓
InvestigationScreen.handleSwitchToEvidenceTab(evidenceId)
    ↓
InvestigationScreen state updates
    ↓
EvidenceNotebookSection receives selectedEvidenceId
    ↓
EvidenceNotebookSection.useEffect triggered
    ↓
EvidenceDetailModal opens with evidence data
```

## Key Decision Points

### Point 1: EvidenceImageCard Click Behavior
```typescript
// ✅ AFTER FIX
if (onClick) {
  onClick();  // Navigation mode (discovery modal)
} else if (imageStatus === 'loaded' && imageUrl) {
  setIsLightboxOpen(true);  // Viewing mode (standalone)
}
```

**Decision:** Prioritize navigation when onClick is provided
**Reason:** Avoid modal conflicts and provide clear navigation intent

### Point 2: Modal Closure Timing
```typescript
// Discovery modal closes BEFORE tab switch
onEvidenceClick={(evidenceId) => {
  handleCloseModal();        // 1. Close first
  onSwitchToEvidenceTab?.(evidenceId);  // 2. Then navigate
}}
```

**Decision:** Close discovery modal before switching tabs
**Reason:** Prevent visual glitches with overlapping modals

### Point 3: Auto-Open Detail Modal
```typescript
// Auto-open when selectedEvidenceId changes
useEffect(() => {
  if (selectedEvidenceId && playerState) {
    const evidence = findEvidence(selectedEvidenceId);
    setSelectedEvidence(evidence);
    setIsDetailModalOpen(true);
    onClearSelection?.();  // Cleanup
  }
}, [selectedEvidenceId, playerState]);
```

**Decision:** Use useEffect to watch selectedEvidenceId
**Reason:** Decouple navigation from modal display logic

## Edge Cases Handled

### ✅ No onClick Handler
- **Behavior:** Open lightbox for image viewing
- **Use Case:** Evidence cards in other contexts (future)

### ✅ Loading State
- **Behavior:** Card is non-clickable
- **Cursor:** Default (not pointer)

### ✅ Error State
- **Behavior:** Card is clickable (navigation still works)
- **Display:** Fallback gradient with evidence name

### ✅ Multiple Evidence Cards
- **Behavior:** Each card independently clickable
- **State:** No interference between cards

### ✅ Rapid Clicks
- **Behavior:** Callback debouncing in parent
- **Protection:** Modal state prevents double-open

## Performance Considerations

### Render Optimization
- Discovery modal unmounts after close (no hidden render)
- Detail modal mounts only when needed
- Evidence data fetched once in EvidenceNotebookSection

### Animation Performance
- Framer Motion animations use GPU acceleration
- Modal transitions staggered to avoid jank
- useEffect cleanup prevents memory leaks

### State Management
- Minimal re-renders with targeted state updates
- Parent-child communication via props (unidirectional)
- Clear separation of concerns

---

**Visual Flow Legend:**
- `[N]` = Step number in user journey
- `↓` = Sequential flow
- `←` = User action or annotation
- `✅` = Successful implementation
- `⚠️` = Warning or important note
