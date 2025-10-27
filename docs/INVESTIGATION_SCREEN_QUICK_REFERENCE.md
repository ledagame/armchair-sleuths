# InvestigationScreen Quick Reference

**File:** `C:\Users\hpcra\armchair-sleuths\src\main.tsx` (lines 726-870)

---

## Tab Navigation

### Switching Tabs

```typescript
setActiveTab('locations');  // Go to Locations tab
setActiveTab('suspects');   // Go to Suspects tab
setActiveTab('evidence');   // Go to Evidence tab
```

### Current Tab State

```typescript
const currentTab = activeTab; // 'locations' | 'suspects' | 'evidence'
```

---

## Action Points (AP)

### Display Current AP

```typescript
const ap = currentAP; // Number (e.g., 3)
```

### Update AP After Action

```typescript
// Decrease by 1
setCurrentAP((prev) => Math.max(0, prev - 1));

// Set specific value
setCurrentAP(5);

// Increase by 1 (rare, but possible)
setCurrentAP((prev) => Math.min(12, prev + 1));
```

---

## Navigation

### Go to Investigation Screen

```typescript
handleStartInvestigation(); // From CaseOverview
```

### Go to Submission Screen

```typescript
handleGoToSubmission(); // From InvestigationScreen
```

### Return to Case Overview

```typescript
setCurrentScreen('case-overview'); // From InvestigationScreen
```

---

## Accessing Case Data

### Victim Info

```typescript
caseData.victim.name         // "John Pemberton"
caseData.victim.background   // "Wealthy businessman..."
caseData.victim.relationship // "Family patriarch"
```

### Location Info

```typescript
caseData.location.name        // "Pemberton Manor"
caseData.location.description // "Sprawling estate..."
caseData.location.atmosphere  // "Tense and somber"
```

### Suspects List

```typescript
caseData.suspects.length // 5
caseData.suspects[0].id  // "suspect_001"
caseData.suspects[0].name // "Eleanor Pemberton"
caseData.suspects[0].archetype // "Grieving Widow"
caseData.suspects[0].background // "John's wife for 25 years..."
```

### Case Metadata

```typescript
caseData.id            // "case_2025_10_24"
caseData.date          // "October 24, 2025"
caseData.imageUrl      // "https://..."
caseData.generatedAt   // 1729789200000
```

---

## Tab Content Rendering

### Update Locations Tab

**Find:** `renderLocationsTab()` function (line 276)

**Replace placeholder with:**
```typescript
const renderLocationsTab = (): JSX.Element => {
  return (
    <vstack width="100%" gap="medium" padding="medium">
      {/* Your location exploration UI here */}
    </vstack>
  );
};
```

### Update Suspects Tab

**Find:** `renderSuspectsTab()` function (line 331)

**Replace placeholder with:**
```typescript
const renderSuspectsTab = (): JSX.Element => {
  return (
    <vstack width="100%" gap="medium" padding="medium">
      {/* Your suspect interrogation UI here */}
    </vstack>
  );
};
```

### Update Evidence Tab

**Find:** `renderEvidenceTab()` function (line 414)

**Replace placeholder with:**
```typescript
const renderEvidenceTab = (): JSX.Element => {
  return (
    <vstack width="100%" gap="medium" padding="medium">
      {/* Your evidence notebook UI here */}
    </vstack>
  );
};
```

---

## UI Components (Devvit Blocks)

### Button with Icon and Text

```typescript
<button
  onPress={() => handleAction()}
  appearance="primary"
  size="large"
  minHeight="56px"
>
  <hstack gap="small" alignment="center middle">
    <text size="medium">🗺️</text>
    <text size="small" weight="bold">현장</text>
  </hstack>
</button>
```

### Card Container

```typescript
<vstack
  backgroundColor="#1a1a1a"
  padding="large"
  cornerRadius="medium"
  gap="medium"
>
  <text size="large" weight="bold" color="#c9b037">
    Title
  </text>
  <text size="medium" color="#e0e0e0">
    Content
  </text>
</vstack>
```

### List of Items

```typescript
<vstack gap="small">
  {items.map((item) => (
    <hstack
      key={item.id}
      backgroundColor="#2a2a2a"
      padding="medium"
      cornerRadius="small"
    >
      <text>{item.name}</text>
    </hstack>
  ))}
</vstack>
```

### Header with Icon

```typescript
<hstack width="100%" alignment="space-between middle">
  <text size="xlarge" weight="bold" color="#c9b037">
    🔍 Title
  </text>
  <text size="large" color="#808080">
    Info
  </text>
</hstack>
```

---

## Color Palette (Noir Detective Theme)

```typescript
// Primary (Gold)
color="#c9b037"      // Active elements, titles
color="#d4af37"      // Lighter gold variant

// Backgrounds
backgroundColor="#0a0a0a"  // Root background (near-black)
backgroundColor="#1a1a1a"  // Card background (dark gray)
backgroundColor="#2a2a2a"  // Nested card (medium gray)

// Text
color="#ffffff"      // Primary text (white)
color="#e0e0e0"      // Secondary text (light gray)
color="#a0a0a0"      // Tertiary text (medium gray)
color="#808080"      // Quaternary text (dark gray)
color="#606060"      // Disabled text (very dark gray)

// Semantic
color="#8b0000"      // Error/danger (dark red)
color="#4a9eff"      // Info (blue)
color="#b8860b"      // Warning (dark goldenrod)
```

---

## Common Patterns

### Conditional Rendering

```typescript
{condition && (
  <vstack>
    <text>Content when true</text>
  </vstack>
)}

{condition ? (
  <text>True case</text>
) : (
  <text>False case</text>
)}
```

### Empty State

```typescript
<vstack
  backgroundColor="#2a2a2a"
  padding="large"
  cornerRadius="small"
  gap="medium"
  alignment="center middle"
>
  <text size="large" color="#606060">
    📝
  </text>
  <text size="medium" color="#808080" alignment="center">
    No items yet
  </text>
  <text size="small" color="#606060" alignment="center">
    Instructions on how to add items
  </text>
</vstack>
```

### Loading State

```typescript
{isLoading && (
  <vstack alignment="center middle" padding="large">
    <text size="large" color="#c9b037">
      ⏳ Loading...
    </text>
  </vstack>
)}
```

### Error State

```typescript
{error && (
  <vstack
    backgroundColor="#2a2a2a"
    padding="medium"
    cornerRadius="small"
  >
    <text size="medium" color="#8b0000">
      ❌ {error}
    </text>
  </vstack>
)}
```

---

## API Integration Template

### POST Request

```typescript
const handleDiscoverEvidence = async (locationId: string) => {
  try {
    const response = await fetch('/api/evidence/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: caseData.id,
        userId: userId,
        locationId: locationId,
        methodType: 'forensic'
      })
    });

    const result = await response.json();

    // Update AP
    setCurrentAP((prev) => prev - 1);

    // Show result
    context.ui.showToast(`증거 발견: ${result.evidence.name}`);
  } catch (error) {
    context.ui.showToast('❌ 증거 탐색 실패');
  }
};
```

### GET Request

```typescript
const loadEvidence = async () => {
  try {
    const response = await fetch(
      `/api/player-state/${caseData.id}/${userId}`
    );
    const playerState = await response.json();

    // Use playerState.discoveredEvidence
    setEvidenceList(playerState.discoveredEvidence);
  } catch (error) {
    console.error('Failed to load evidence:', error);
  }
};
```

---

## Debugging Tips

### Check Current State

```typescript
console.log('[DEBUG] Current screen:', currentScreen);
console.log('[DEBUG] Active tab:', activeTab);
console.log('[DEBUG] Current AP:', currentAP);
console.log('[DEBUG] Case ID:', caseData?.id);
console.log('[DEBUG] User ID:', userId);
```

### Toast Notifications

```typescript
// Success
context.ui.showToast('✅ Action successful');

// Error
context.ui.showToast('❌ Action failed');

// Info
context.ui.showToast('ℹ️ Information message');

// Warning
context.ui.showToast('⚠️ Warning message');
```

### Verify Build

```bash
cd C:\Users\hpcra\armchair-sleuths
npm run build

# Check output
ls -lh dist/main.js
```

---

## Performance Tips

### Conditional Rendering (Good)

```typescript
{activeTab === 'locations' && renderLocationsTab()}
```

**Why:** Only renders active tab, reduces DOM size.

### Always Rendering (Bad)

```typescript
<vstack style={activeTab === 'locations' ? 'visible' : 'hidden'}>
  {renderLocationsTab()}
</vstack>
```

**Why:** Renders all tabs even when hidden, wastes resources.

### Memoization (Not Needed Yet)

Devvit `useState` already optimizes re-renders. Don't prematurely optimize.

---

## File Locations

```
C:\Users\hpcra\armchair-sleuths\
├── src\
│   ├── main.tsx                  # InvestigationScreen here (lines 726-870)
│   ├── server\
│   │   ├── services\
│   │   │   ├── case\
│   │   │   │   └── CaseGeneratorService.ts
│   │   │   ├── suspect\
│   │   │   │   └── SuspectAIService.ts
│   │   │   └── repositories\
│   │   │       └── kv\
│   │   │           └── CaseRepository.ts
│   │   └── schedulers\
│   │       └── DailyCaseScheduler.ts
│   └── shared\
│       └── types\
│           └── index.ts
├── dist\
│   └── main.js                   # Build output (146KB)
└── docs\
    ├── P1_INVESTIGATION_SCREEN_IMPLEMENTATION.md
    └── INVESTIGATION_SCREEN_QUICK_REFERENCE.md (this file)
```

---

## Testing Checklist

```
[ ] Build succeeds: npm run build
[ ] No TypeScript errors
[ ] InvestigationScreen renders
[ ] Tabs switch correctly
[ ] AP counter displays
[ ] Submit button navigates
[ ] Back button navigates
[ ] Mobile responsive (375px, 390px, 414px)
[ ] Touch targets ≥56px
[ ] No horizontal scroll
```

---

## Next Steps

1. **Implement LocationExplorerSection** (Update `renderLocationsTab()`)
2. **Implement SuspectInterrogationSection** (Update `renderSuspectsTab()`)
3. **Implement EvidenceNotebookSection** (Update `renderEvidenceTab()`)

Each sub-task should:
- Connect to backend API
- Update `currentAP` state
- Display results in UI
- Handle errors gracefully
- Maintain mobile responsiveness
