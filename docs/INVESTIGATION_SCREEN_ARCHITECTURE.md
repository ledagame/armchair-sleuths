# InvestigationScreen Architecture Diagram

## Component Hierarchy

```
InvestigationScreen (lines 726-870)
│
├─── Header Section (lines 737-765)
│    │
│    ├─── Title & AP Counter (hstack)
│    │    ├─── Text: "🔍 수사 진행 중"
│    │    └─── AP Display: "⚡ 3 / 12 AP"
│    │
│    └─── Case Summary (text)
│         └─── "John Pemberton 살인 사건 • Pemberton Manor"
│
├─── Tab Content Area [SCROLLABLE] (lines 770-779)
│    │
│    ├─── [IF activeTab === 'locations']
│    │    └─── renderLocationsTab() (lines 276-325)
│    │         │
│    │         ├─── Title: "🗺️ 범행 현장 탐색"
│    │         │
│    │         └─── Info Card
│    │              ├─── Description
│    │              ├─── Feature Bullets
│    │              └─── Placeholder Note
│    │
│    ├─── [IF activeTab === 'suspects']
│    │    └─── renderSuspectsTab() (lines 331-408)
│    │         │
│    │         ├─── Title: "👤 용의자 심문"
│    │         │
│    │         ├─── Info Card
│    │         │    ├─── Description
│    │         │    └─── Feature Bullets
│    │         │
│    │         ├─── Suspect List
│    │         │    ├─── Suspect Card 1
│    │         │    ├─── Suspect Card 2
│    │         │    └─── ... (N suspects)
│    │         │
│    │         └─── Placeholder Note
│    │
│    └─── [IF activeTab === 'evidence']
│         └─── renderEvidenceTab() (lines 414-483)
│              │
│              ├─── Title: "📋 증거 노트"
│              │
│              ├─── Info Card
│              │    ├─── Description
│              │    └─── Feature Bullets
│              │
│              ├─── Empty State
│              │    ├─── Icon: "📝"
│              │    ├─── Message: "아직 수집한 증거가 없습니다"
│              │    └─── Instructions
│              │
│              └─── Placeholder Note
│
├─── Bottom Tab Navigation [FIXED] (lines 786-837)
│    │
│    ├─── Locations Button (🗺️ 현장)
│    │    └─── appearance: primary | secondary
│    │
│    ├─── Suspects Button (👤 용의자)
│    │    └─── appearance: primary | secondary
│    │
│    └─── Evidence Button (📋 증거)
│         └─── appearance: primary | secondary
│
└─── Quick Action Bar (lines 842-867)
     │
     ├─── Submit Solution Button
     │    └─── "🎯 해결안 제출하기"
     │         → handleGoToSubmission()
     │
     └─── Back Button
          └─── "← 케이스 개요로 돌아가기"
               → setCurrentScreen('case-overview')
```

---

## State Flow Diagram

```
User Action               State Change                UI Update
───────────               ────────────                ─────────

[Click "수사 시작하기"]
        │
        ├──────────────→ setCurrentScreen('investigation')
        │                setActiveTab('locations')
        │                        │
        │                        └──────────────→ Render InvestigationScreen
        │                                         Show Locations tab content
        │
        │
[Click "용의자" Tab]
        │
        └──────────────→ setActiveTab('suspects')
                                 │
                                 └──────────────→ Re-render tab content area
                                                   Show Suspects tab content
                                                   Update button appearances


[Discover Evidence]
        │
        └──────────────→ setCurrentAP(currentAP - 1)
                                 │
                                 └──────────────→ Update AP display in header


[Click "🎯 해결안 제출하기"]
        │
        └──────────────→ handleGoToSubmission()
                         setCurrentScreen('submission')
                                 │
                                 └──────────────→ Navigate to SubmissionScreen


[Click "← 케이스 개요로"]
        │
        └──────────────→ setCurrentScreen('case-overview')
                                 │
                                 └──────────────→ Navigate to CaseOverview
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Redis Storage                          │
│                                                                │
│  Key: "case:current"                                          │
│  Value: { id, date, victim, weapon, location, suspects, ... } │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ context.redis.get('case:current')
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   App State (main.tsx)                        │
│                                                                │
│  const [caseData, setCaseData] = useState<CaseData | null>()  │
│  const [currentScreen, setCurrentScreen] = useState()         │
│  const [userId, setUserId] = useState<string>()               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ Props/Context
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│               InvestigationScreen Component                   │
│                                                                │
│  const [activeTab, setActiveTab] = useState<Tab>('locations') │
│  const [currentAP, setCurrentAP] = useState(3)                │
│                                                                │
│  Uses: caseData, userId (from parent scope)                   │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           │ Conditional Rendering
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Locations Tab  │ │  Suspects Tab  │ │  Evidence Tab  │
│                │ │                │ │                │
│ Uses:          │ │ Uses:          │ │ Uses:          │
│ - caseData     │ │ - caseData     │ │ - (future)     │
│   .location    │ │   .suspects    │ │   playerState  │
└────────────────┘ └────────────────┘ └────────────────┘
```

---

## API Integration Points (Future P1 Sub-Tasks)

```
┌──────────────────────────────────────────────────────────────┐
│                    Backend API Endpoints                      │
└──────────────────────────────────────────────────────────────┘

Location Discovery:
    POST /api/evidence/discover
    Request: { caseId, userId, locationId, methodType }
    Response: { evidence: { id, name, description, ... } }
         │
         └──────────→ Updates: currentAP, discoveredEvidence


Suspect Interrogation:
    POST /api/suspect/chat
    Request: { caseId, suspectId, question, userId }
    Response: { answer: string, characterState: {...} }
         │
         └──────────→ Updates: currentAP, conversationHistory


Player State:
    GET /api/player-state/{caseId}/{userId}
    Response: {
      discoveredEvidence: Evidence[],
      suspectConversations: Conversation[],
      actionPoints: number,
      ...
    }
         │
         └──────────→ Updates: evidenceList, currentAP


┌──────────────────────────────────────────────────────────────┐
│              InvestigationScreen State Updates                │
└──────────────────────────────────────────────────────────────┘

After each API call:
    1. Update currentAP state
    2. Update relevant data state (evidence, conversations)
    3. Show user feedback (toast notification)
    4. Re-render affected tab content
```

---

## Screen Dimensions & Layout

```
┌────────────────────────────────────────┐ ◄─── 375px (min width)
│         Investigation Screen            │      390px (common)
│                                         │      414px (large)
│  ┌─────────────────────────────────┐   │
│  │  Header (fixed)                  │   │ ◄─── ~80px height
│  │  Title | AP Counter               │   │
│  │  Case Summary                     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                  │   │
│  │  Tab Content (scrollable)        │   │ ◄─── grow (flexible)
│  │                                  │   │      calc(100vh - 250px)
│  │                                  │   │
│  │  [Locations Tab Content]         │   │
│  │  - Location cards                │   │
│  │  - Search method selector        │   │
│  │  - Evidence discovery UI         │   │
│  │                                  │   │
│  │  ↕ Scrollable                    │   │
│  │                                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Tab Navigation (fixed bottom)   │   │ ◄─── ~70px height
│  │  [🗺️ 현장] [👤 용의자] [📋 증거]  │   │      56px buttons
│  └─────────────────────────────────┘   │      + padding
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Quick Action Bar (fixed)        │   │ ◄─── ~100px height
│  │  [🎯 해결안 제출하기]             │   │
│  │  [← 케이스 개요로 돌아가기]       │   │
│  └─────────────────────────────────┘   │
│                                         │
└────────────────────────────────────────┘
      ▲                           ▲
      │                           │
   0px (left)                  375px (right)
```

### Thumb Zone Analysis (Mobile UX)

```
┌────────────────────────────────────────┐
│  Header (View Only)                     │ ◄─── Hard to reach
│  - AP Counter                            │      (one-handed)
│  - Title                                 │
├─────────────────────────────────────────┤
│                                          │
│  Content Area (Scrollable)               │ ◄─── Easy to reach
│  - Tap cards                             │      (thumb zone)
│  - Scroll with thumb                     │
│                                          │
│                                          │
├─────────────────────────────────────────┤
│  Tab Navigation                          │ ◄─── Easiest to reach
│  [🗺️] [👤] [📋]                          │      (bottom 25%)
├─────────────────────────────────────────┤
│  Action Buttons                          │ ◄─── Easy to reach
│  [Submit] [Back]                         │
└─────────────────────────────────────────┘

✅ Primary actions (tabs) in thumb zone (bottom 25%)
✅ Secondary actions (submit, back) just above tabs
✅ Read-only info (header) at top (acceptable)
```

---

## Component Interaction Flow

### Tab Switching

```
User clicks "용의자" tab
    │
    ▼
Button.onPress event fired
    │
    ▼
setActiveTab('suspects')
    │
    ▼
React re-render triggered
    │
    ▼
Conditional rendering evaluates:
  - {activeTab === 'locations' && ...} → false, not rendered
  - {activeTab === 'suspects' && ...}  → true, render suspect tab
  - {activeTab === 'evidence' && ...}  → false, not rendered
    │
    ▼
Button appearance updated:
  - Locations button → appearance="secondary" (gray)
  - Suspects button  → appearance="primary" (gold)
  - Evidence button  → appearance="secondary" (gray)
    │
    ▼
renderSuspectsTab() executes
    │
    ▼
Suspect tab content displays:
  - Title
  - Info card
  - Suspect list from caseData.suspects
  - Placeholder note
```

### Action Point Deduction

```
User performs action (e.g., discover evidence)
    │
    ▼
API call: POST /api/evidence/discover
    │
    ▼
API responds: { evidence: {...}, apCost: 1 }
    │
    ▼
Update local state:
  setCurrentAP((prev) => prev - 1)
    │
    ▼
React re-render triggered
    │
    ▼
Header AP counter updates:
  "⚡ 3 / 12 AP" → "⚡ 2 / 12 AP"
    │
    ▼
Show user feedback:
  context.ui.showToast("✅ 증거 발견!")
```

---

## Performance Characteristics

### Rendering Optimization

| Tab State         | Locations Rendered | Suspects Rendered | Evidence Rendered |
|-------------------|-------------------|-------------------|-------------------|
| activeTab='locations' | ✅ Yes          | ❌ No             | ❌ No             |
| activeTab='suspects'  | ❌ No           | ✅ Yes            | ❌ No             |
| activeTab='evidence'  | ❌ No           | ❌ No             | ✅ Yes            |

**Benefits:**
- Reduces DOM nodes by 66%
- Faster re-renders
- Lower memory usage
- Better scrolling performance

### State Update Performance

| State Change          | Re-renders Triggered | Cost  |
|----------------------|---------------------|-------|
| setActiveTab()       | Tab content + buttons | Low   |
| setCurrentAP()       | Header only          | Very Low |
| setCaseData()        | Entire screen        | High (rare) |
| setCurrentScreen()   | Entire app           | High (navigation) |

---

## Type Safety Guarantees

### Tab Type Safety

```typescript
// Type definition (line 15)
type InvestigationTab = 'locations' | 'suspects' | 'evidence';

// State declaration (line 151)
const [activeTab, setActiveTab] = context.useState<InvestigationTab>('locations');

// Usage (type-checked at compile time)
setActiveTab('locations'); // ✅ Valid
setActiveTab('suspects');  // ✅ Valid
setActiveTab('evidence');  // ✅ Valid
setActiveTab('invalid');   // ❌ TypeScript error!
```

### Case Data Type Safety

```typescript
// Interface definition (lines 17-42)
interface CaseData {
  id: string;
  date: string;
  victim: { name: string; background: string; relationship: string; };
  weapon: { name: string; description: string; };
  location: { name: string; description: string; atmosphere: string; };
  suspects: Array<{ id: string; name: string; archetype: string; background: string; }>;
  imageUrl?: string;
  generatedAt: number;
}

// State declaration (line 145)
const [caseData, setCaseData] = context.useState<CaseData | null>(null);

// Usage (type-checked)
caseData.victim.name       // ✅ Type: string
caseData.suspects[0].id    // ✅ Type: string
caseData.invalidProperty   // ❌ TypeScript error!
```

---

## Testing Scenarios

### Happy Path

1. User loads game → CaseOverview displays
2. User clicks "수사 시작하기" → InvestigationScreen displays
3. Locations tab is active by default
4. User clicks "용의자" tab → Suspects tab displays
5. User clicks "📋 증거" tab → Evidence tab displays
6. User clicks "← 케이스 개요로 돌아가기" → Returns to CaseOverview

### Edge Cases

1. **No case data:**
   - Screen: loading
   - Message: "사건 데이터를 찾을 수 없습니다"

2. **Empty suspects list:**
   - Suspects tab shows placeholder
   - No suspect cards rendered

3. **No evidence collected:**
   - Evidence tab shows empty state
   - Message: "아직 수집한 증거가 없습니다"

4. **AP reaches 0:**
   - Header shows "⚡ 0 / 12 AP"
   - (Future: Disable discovery/interrogation actions)

---

## File Structure

```
src/main.tsx (893 lines)
│
├── Imports (lines 1-2)
├── Devvit.configure (lines 4-8)
│
├── Type Definitions (lines 10-42)
│   ├── GameScreen
│   ├── InvestigationTab ◄─── NEW
│   └── CaseData
│
├── Scheduler Jobs (lines 44-129)
├── App Installation Trigger (lines 131-158)
│
├── Custom Post Type (lines 160-892)
│   │
│   ├── State Management (lines 162-152)
│   │   ├── currentScreen
│   │   ├── caseData
│   │   ├── userId
│   │   ├── activeTab ◄─── NEW
│   │   └── currentAP ◄─── NEW
│   │
│   ├── Initialize User ID (lines 174-189)
│   ├── Load Case Data (lines 191-222)
│   │
│   ├── Navigation Handlers (lines 224-284)
│   │   ├── handleStartInvestigation ◄─── UPDATED
│   │   ├── handleGoToSubmission
│   │   └── handleGenerateNewCase
│   │
│   ├── Tab Content Functions (lines 286-501) ◄─── NEW
│   │   ├── renderLocationsTab()
│   │   ├── renderSuspectsTab()
│   │   └── renderEvidenceTab()
│   │
│   ├── Render Functions (lines 503-888)
│   │   ├── LoadingScreen (lines 507-547)
│   │   ├── CaseOverview (lines 549-716)
│   │   ├── InvestigationScreen (lines 718-888) ◄─── NEW
│   │   └── Fallback (lines 890-901)
│   │
│   └── Export (line 893)
```

---

## Future Enhancement Opportunities

### Performance Optimizations

1. **Lazy load tab content:**
   ```typescript
   const renderSuspectsTab = useMemo(() => {
     // Heavy computation here
   }, [caseData.suspects]);
   ```

2. **Virtual scrolling for long lists:**
   ```typescript
   // For 100+ suspects or evidence items
   <VirtualizedList items={suspects} />
   ```

3. **Debounced search:**
   ```typescript
   const debouncedSearch = debounce((query) => {
     filterEvidence(query);
   }, 300);
   ```

### UX Improvements

1. **Tab transition animations:**
   - Slide left/right between tabs
   - Fade in/out content

2. **Swipe gestures:**
   - Swipe left/right to change tabs
   - Pull-to-refresh for evidence

3. **Haptic feedback:**
   - Vibrate on tab switch
   - Vibrate on evidence discovery

4. **Progress indicators:**
   - Show AP as progress bar
   - Show investigation completion %

### Accessibility Enhancements

1. **Screen reader support:**
   - ARIA labels for tabs
   - Descriptive button text

2. **Keyboard navigation:**
   - Tab key to switch tabs
   - Enter to activate buttons

3. **High contrast mode:**
   - Alternative color scheme
   - Increased text sizes

---

## Comparison: Before vs After

### Before (lines 482-508)

```typescript
if (currentScreen === 'investigation' && caseData) {
  return (
    <vstack
      width="100%"
      height="100%"
      alignment="center middle"
      backgroundColor="#0a0a0a"
      padding="large"
      gap="medium"
    >
      <text size="xxlarge" weight="bold" color="#d4af37">
        🔍 수사 화면
      </text>
      <text size="medium" color="#a0a0a0">
        (구현 예정 - P1 단계)
      </text>
      <spacer size="medium" />
      <button
        appearance="secondary"
        size="medium"
        onPress={() => setCurrentScreen('case-overview')}
      >
        ← 케이스 개요로 돌아가기
      </button>
    </vstack>
  );
}
```

**Issues:**
- Simple placeholder
- No functionality
- No navigation

### After (lines 726-870)

```typescript
if (currentScreen === 'investigation' && caseData) {
  return (
    <vstack width="100%" height="100%" backgroundColor="#0a0a0a" gap="none">
      {/* Header with AP display */}
      <vstack width="100%" backgroundColor="#1a1a1a" padding="medium" gap="small">
        <hstack width="100%" alignment="space-between middle">
          <text size="xlarge" weight="bold" color="#c9b037">
            🔍 수사 진행 중
          </text>
          <hstack gap="small" alignment="middle">
            <text size="large" weight="bold" color="#c9b037">
              ⚡ {currentAP}
            </text>
            <text size="medium" color="#808080">
              / 12 AP
            </text>
          </hstack>
        </hstack>
        <text size="small" color="#a0a0a0">
          {caseData.victim.name} 살인 사건 • {caseData.location.name}
        </text>
      </vstack>

      {/* Scrollable tab content */}
      <vstack grow width="100%" backgroundColor="#0a0a0a">
        {activeTab === 'locations' && renderLocationsTab()}
        {activeTab === 'suspects' && renderSuspectsTab()}
        {activeTab === 'evidence' && renderEvidenceTab()}
      </vstack>

      {/* Bottom tab navigation */}
      <hstack
        width="100%"
        backgroundColor="#1a1a1a"
        padding="small"
        gap="small"
        alignment="center middle"
      >
        {/* 3 tab buttons with dynamic appearance */}
      </hstack>

      {/* Quick action bar */}
      <vstack width="100%" backgroundColor="#0a0a0a" padding="medium" gap="small">
        {/* Submit and back buttons */}
      </vstack>
    </vstack>
  );
}
```

**Improvements:**
- ✅ Full tab navigation system
- ✅ AP tracking UI
- ✅ Mobile-optimized layout
- ✅ 3 content areas (placeholders ready)
- ✅ Submit solution flow
- ✅ Production-ready structure

---

## Summary

The InvestigationScreen is now a **fully functional navigation hub** with:

- 📱 Mobile-first responsive design
- 🎨 Noir detective theme
- 🔄 Tab-based navigation
- ⚡ AP tracking system
- 📝 Placeholder content ready for P1 sub-tasks
- ✅ Builds without errors (146KB)

**Next:** Implement tab content (LocationExplorer, SuspectInterrogation, EvidenceNotebook)
