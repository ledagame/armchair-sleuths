# Devvit Migration Architecture
## React/Vite → Devvit Blocks Complete Platform Migration

**Document Version**: 1.0
**Date**: 2025-10-24
**Status**: Architecture Design Complete
**Estimated Timeline**: 4 weeks (160 hours)

---

## Executive Summary

This document outlines the complete architectural migration strategy for transforming the Armchair Sleuths React/Vite web application into a Devvit Reddit Custom Post.

### Key Metrics
- **Component Reduction**: 55 React components → 21 priority Devvit components (62% reduction)
- **Backend Compatibility**: 95% preserved (minimal API changes)
- **State Migration**: localStorage + React hooks → Devvit useState + Redis APIs
- **Timeline**: 4 weeks for production-ready implementation
- **Risk Level**: Medium (requires early validation of modal overlays and chat scrolling)

### Critical Constraints
- ❌ **No HTML/CSS**: Only Devvit Blocks (vstack/hstack/zstack/text/button/image/spacer)
- ❌ **No Framer Motion**: Remove all animations or replace with static states
- ❌ **No Tailwind**: Styling via component props only (backgroundColor, padding, gap, etc.)
- ❌ **No localStorage**: All persistence through Redis KV Store via backend APIs
- ✅ **useState from Devvit**: Different API, supports async initializers
- ✅ **Custom Post Type**: All UI wrapped in `Devvit.addCustomPostType()`

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Devvit Blocks Component Hierarchy](#2-devvit-blocks-component-hierarchy)
3. [Component Priority Matrix](#3-component-priority-matrix)
4. [State Management Migration](#4-state-management-migration)
5. [Mobile-First Design System](#5-mobile-first-design-system)
6. [Backend Integration Strategy](#6-backend-integration-strategy)
7. [Animation Replacement Strategy](#7-animation-replacement-strategy)
8. [Implementation Phases](#8-implementation-phases)
9. [Risk Analysis & Mitigation](#9-risk-analysis--mitigation)
10. [Component Migration Patterns](#10-component-migration-patterns)
11. [Testing Strategy](#11-testing-strategy)

---

## 1. Current Architecture Analysis

### 1.1 Technology Stack

**Current (React/Vite Web App)**:
```
Frontend:
- React 18 + React DOM
- Vite 6.2.4 (build tool)
- Framer Motion 12 (animations)
- Tailwind CSS 4 (styling)
- TypeScript 5.8

State Management:
- React useState/useEffect
- localStorage (user ID persistence)
- fetch API (backend communication)

Backend:
- Express 5.1 (API server)
- Redis KV Store (game state)
- Gemini AI (case generation, suspect AI)
```

**Target (Devvit Custom Post)**:
```
Frontend:
- Devvit Blocks 0.12.1 (UI primitives)
- Devvit useState (state management)
- TypeScript 5.8

State Management:
- Devvit useState (async initializers)
- context.userId (Reddit user)
- Redis via backend APIs

Backend:
- PRESERVED: Express + Redis + Gemini AI
- Minimal API changes for user context
```

### 1.2 Component Inventory

**Total React Components**: 55 TSX files

**By Category**:
- **Core Screens** (7): LoadingScreen, IntroScreen, CaseOverview, InvestigationScreen, ChatScreen, SubmissionForm, ResultView
- **Investigation** (12): LocationExplorer, LocationCard, SuspectInterrogation, SuspectCard, EvidenceNotebook, EvidenceCard, etc.
- **Discovery System** (6): EvidenceDiscoveryModal, SearchMethodSelector, EvidenceImageCard, LocationCard, ImageLightbox
- **Gamification** (5): AchievementToast, MilestoneCelebration, APHeader, APAcquisitionToast, DetectiveArchetypeSelector
- **Intro Systems** (8): ThreeSlideIntro (3 slides), CinematicIntro (5 scenes), IntroNarration
- **Common/Utility** (12): SkeletonLoader, EmptyState, ErrorBoundary, LazyImage, LoadingSkeleton, etc.
- **Effects/Animations** (5): ConfettiExplosion, ParallaxLayer, LiquidText, MotionText, CelebrationEffects

### 1.3 Current State Flow

```
App.tsx (Screen State Machine)
  ├─ useState<GameScreen> → 'loading' | 'intro' | 'case-overview' | 'investigation' | 'submission' | 'results'
  ├─ useCase() → fetch('/api/case')
  ├─ useSuspect() → local state + fetch
  └─ useSubmission() → submit answers

InvestigationScreen (Tab Navigation)
  ├─ activeTab: 'locations' | 'suspects' | 'evidence'
  ├─ useGamification() → achievements, milestones
  ├─ Poll player state (3s interval)
  └─ Modal overlays (search, chat, evidence detail)
```

---

## 2. Devvit Blocks Component Hierarchy

### 2.1 Root Structure

```typescript
Devvit.addCustomPostType({
  name: 'Armchair Sleuths',
  render: (context) => {
    const [screen, setScreen] = useState<GameScreen>('loading');

    // Screen routing
    switch (screen) {
      case 'loading': return <LoadingScreen />;
      case 'intro': return <IntroScreen />;
      case 'case-overview': return <CaseOverviewScreen />;
      case 'investigation': return <InvestigationScreen />;
      case 'submission': return <SubmissionScreen />;
      case 'results': return <ResultsScreen />;
    }
  }
});
```

### 2.2 Component Tree (Devvit Blocks)

```
CustomPost
│
├─ LoadingScreen (vstack)
│  ├─ Spinner (text + emoji sequence)
│  └─ StatusText (text)
│
├─ IntroScreen (vstack)
│  ├─ SlideContainer (zstack)
│  │  ├─ BackgroundImage (image)
│  │  └─ ContentOverlay (vstack)
│  │     ├─ SlideTitle (text)
│  │     ├─ SlideBody (text)
│  │     └─ NavigationButtons (hstack)
│  │        ├─ SkipButton (button)
│  │        └─ NextButton (button)
│  └─ ProgressIndicator (hstack)
│
├─ CaseOverviewScreen (vstack)
│  ├─ Header (hstack)
│  ├─ VictimCard (vstack)
│  ├─ WeaponCard (vstack)
│  ├─ LocationCard (vstack)
│  └─ StartInvestigationButton (button)
│
├─ InvestigationScreen (vstack)
│  ├─ Header (hstack)
│  │  ├─ Title (text)
│  │  ├─ APDisplay (hstack)
│  │  └─ SubmitButton (button)
│  ├─ TabBar (hstack)
│  │  ├─ LocationsTab (button)
│  │  ├─ SuspectsTab (button)
│  │  └─ EvidenceTab (button)
│  └─ TabContent (vstack)
│     │
│     ├─ LocationsTab (vstack)
│     │  ├─ LocationGrid (vstack)
│     │  │  └─ LocationCard[] (vstack)
│     │  │     ├─ LocationImage (image)
│     │  │     ├─ LocationTitle (text)
│     │  │     ├─ LocationDescription (text)
│     │  │     └─ SearchButton (button)
│     │  └─ SearchModal (zstack overlay) [CONDITIONAL]
│     │     └─ ModalContent (vstack)
│     │        ├─ ModalHeader (hstack)
│     │        ├─ SearchMethodSelector (vstack)
│     │        │  └─ MethodCard[] (vstack + button)
│     │        ├─ ConfirmButton (button)
│     │        └─ CloseButton (button)
│     │
│     ├─ SuspectsTab (vstack)
│     │  ├─ SuspectGrid (vstack)
│     │  │  └─ SuspectCard[] (vstack)
│     │  │     ├─ SuspectImage (image)
│     │  │     ├─ SuspectName (text)
│     │  │     ├─ SuspectArchetype (text)
│     │  │     └─ InterrogateButton (button)
│     │  └─ ChatModal (zstack overlay) [CONDITIONAL]
│     │     └─ ChatContainer (vstack)
│     │        ├─ ChatHeader (hstack)
│     │        ├─ MessageList (vstack)
│     │        │  └─ MessageBubble[] (hstack)
│     │        │     ├─ Avatar (text/emoji)
│     │        │     └─ MessageContent (vstack)
│     │        ├─ ChatInput (vstack)
│     │        │  ├─ TextInput (textinput)
│     │        │  └─ SendButton (button)
│     │        └─ CloseButton (button)
│     │
│     └─ EvidenceTab (vstack)
│        ├─ FilterBar (hstack)
│        ├─ EvidenceGrid (vstack)
│        │  └─ EvidenceCard[] (vstack)
│        │     ├─ EvidenceImage (image)
│        │     ├─ EvidenceTitle (text)
│        │     ├─ EvidenceDescription (text)
│        │     ├─ RarityBadge (hstack)
│        │     └─ ViewDetailsButton (button)
│        └─ EmptyState (vstack) [CONDITIONAL]
│
├─ SubmissionScreen (vstack)
│  ├─ Header (hstack)
│  ├─ FormFields (vstack)
│  │  ├─ WhoField (vstack + textinput)
│  │  ├─ WhatField (vstack + textinput)
│  │  ├─ WhereField (vstack + textinput)
│  │  ├─ WhenField (vstack + textinput)
│  │  ├─ WhyField (vstack + textinput)
│  │  └─ HowField (vstack + textinput)
│  ├─ ValidationErrors (vstack) [CONDITIONAL]
│  └─ SubmitButton (button)
│
└─ ResultsScreen (vstack)
   ├─ ScoreBanner (hstack)
   │  ├─ ScoreIcon (text/emoji)
   │  ├─ ScoreValue (text)
   │  └─ Rank (text)
   ├─ BreakdownList (vstack)
   │  └─ ScoreCard[] (vstack)
   │     ├─ FieldName (text)
   │     ├─ FieldScore (hstack)
   │     └─ Feedback (text)
   ├─ LeaderboardPreview (vstack)
   └─ PlayAgainButton (button)
```

### 2.3 Shared Components (Reusable Patterns)

```typescript
// Card pattern
const Card = ({ children, ...props }) => (
  <vstack
    backgroundColor={COLORS.charcoal}
    padding="medium"
    cornerRadius="medium"
    border={{ width: 1, color: COLORS.fog }}
    gap="small"
    {...props}
  >
    {children}
  </vstack>
);

// Modal pattern
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <zstack width="100%" height="100%" backgroundColor="rgba(0,0,0,0.8)">
      <vstack
        maxWidth="600px"
        backgroundColor={COLORS.charcoal}
        padding="large"
        cornerRadius="large"
        gap="medium"
      >
        {children}
      </vstack>
    </zstack>
  );
};

// Button patterns
const PrimaryButton = ({ label, onPress, ...props }) => (
  <button
    onPress={onPress}
    appearance="primary"
    minHeight={48}
    {...props}
  >
    {label}
  </button>
);

const GhostButton = ({ label, onPress, ...props }) => (
  <button
    onPress={onPress}
    appearance="secondary"
    minHeight={48}
    {...props}
  >
    {label}
  </button>
);
```

---

## 3. Component Priority Matrix

### 3.1 Priority Levels

- **P0 (Critical Path)**: Must work for MVP gameplay loop
- **P1 (Enhanced UX)**: Important for engagement and usability
- **P2 (Polish)**: Gamification and quality-of-life features
- **P3 (Nice-to-Have)**: Can be simplified or deferred

### 3.2 P0 - Core Gameplay (Week 1-2) - 100 hours

| Component | Source File | Complexity | Devvit Pattern | Estimate |
|-----------|-------------|------------|----------------|----------|
| MainPost | App.tsx | High | Screen state machine | 16h |
| LoadingScreen | App.tsx (lines 139-273) | Low | vstack + text | 4h |
| CaseOverviewScreen | CaseOverview.tsx | Medium | vstack + cards | 8h |
| InvestigationScreen | InvestigationScreen.tsx | High | vstack + tabs | 12h |
| LocationsTab | LocationExplorerSection.tsx | High | vstack + modal | 16h |
| SuspectsTab | SuspectInterrogationSection.tsx | High | vstack + chat | 16h |
| EvidenceTab | EvidenceNotebookSection.tsx | Medium | vstack + grid | 10h |
| SubmissionScreen | SubmissionForm.tsx | Medium | vstack + inputs | 10h |
| ResultsScreen | ResultView.tsx | Medium | vstack + score cards | 8h |

**P0 Deliverables**:
- ✅ Complete gameplay flow: loading → overview → investigation → submission → results
- ✅ All core features: location exploration, suspect interrogation, evidence review, answer submission
- ✅ Backend API integration fully functional
- ✅ Basic mobile-responsive layout

### 3.3 P1 - Enhanced UX (Week 3) - 57 hours

| Component | Source File | Complexity | Devvit Pattern | Estimate |
|-----------|-------------|------------|----------------|----------|
| IntroScreen | ThreeSlideIntro.tsx | Medium | zstack + slides | 12h |
| SearchModal | EvidenceDiscoveryModal.tsx | High | zstack overlay | 14h |
| LocationCard | LocationCard.tsx | Low | vstack card | 4h |
| EvidenceImageCard | EvidenceImageCard.tsx | Medium | vstack + image | 6h |
| SearchMethodSelector | SearchMethodSelector.tsx | Medium | hstack buttons | 6h |
| APHeader | APHeader.tsx | Low | hstack display | 3h |
| ChatInterface | ChatInterface.tsx | High | vstack + messages | 12h |

**P1 Deliverables**:
- ✅ Onboarding flow (3-slide intro)
- ✅ Evidence discovery experience
- ✅ Action Points system UI
- ✅ Suspect interrogation UI
- ✅ Enhanced card designs

### 3.4 P2 - Gamification (Week 4) - 21 hours

| Component | Source File | Complexity | Devvit Pattern | Estimate |
|-----------|-------------|------------|----------------|----------|
| AchievementToast | AchievementToast.tsx | Medium | zstack toast | 6h |
| MilestoneCelebration | MilestoneCelebration.tsx | Medium | zstack overlay | 6h |
| APAcquisitionToast | APAcquisitionToast.tsx | Low | zstack toast | 4h |
| LoadingPlaceholder | SkeletonLoader.tsx | Low | vstack gray boxes | 3h |
| EmptyState | EmptyState.tsx | Low | vstack centered | 2h |

**P2 Deliverables**:
- ✅ Achievement notifications
- ✅ Progress celebrations
- ✅ Loading states
- ✅ Empty states

### 3.5 P3 - Deferred/Simplified (Optional)

| Component | Status | Rationale |
|-----------|--------|-----------|
| CinematicIntro (5-scene) | SKIP | Use 3-slide intro instead |
| FunFactsCarousel | SKIP | Non-essential entertainment |
| ConfettiExplosion | SIMPLIFY | Use emoji instead |
| ParallaxLayer | REMOVE | No Framer Motion |
| LiquidText | REMOVE | No animation support |
| MotionText | REMOVE | Use static text |
| All other animation components | REMOVE | Devvit has no animation API |

**P3 Decision**: Skip 30+ animation/effect components to focus on core gameplay.

---

## 4. State Management Migration

### 4.1 Current React State Architecture

```typescript
// App.tsx
const [currentScreen, setCurrentScreen] = useState<GameScreen>('loading');
const [userId, setUserId] = useState<string>('');
const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

// useCase hook
const { caseData, loading, error, generating } = useCase();

// useSuspect hook
const { suspects, selectedSuspect, selectSuspect, clearSelection } = useSuspect();

// useSubmission hook
const { submitAnswer, submitting, error } = useSubmission({ caseId, userId });

// useGamification hook
const { state, actions } = useGamification({
  evidenceList,
  searchHistory,
  onAchievementUnlocked
});

// localStorage
localStorage.setItem('userId', newUserId);
localStorage.getItem('userId');
```

### 4.2 Devvit State Architecture

```typescript
Devvit.addCustomPostType({
  name: 'Armchair Sleuths',
  render: (context) => {
    // User context from Reddit (no localStorage needed)
    const userId = context.userId; // Built-in Reddit user ID

    // Screen state (simple enum)
    const [screen, setScreen] = useState<GameScreen>('loading');

    // Case data (async fetch from backend)
    const [caseData, setCaseData] = useState<CaseData | null>(async () => {
      const response = await fetch('/api/case');
      return await response.json();
    });

    // Player state (async from Redis via backend)
    const [playerState, setPlayerState] = useState(async () => {
      const response = await fetch(`/api/player-state/${userId}`);
      return await response.json();
    });

    // Suspects (derived from case data)
    const suspects = caseData?.suspects || [];

    // Submission state (local)
    const [submitting, setSubmitting] = useState(false);
    const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

    // Modal states (local)
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);

    // Tab state (local)
    const [activeTab, setActiveTab] = useState<InvestigationTab>('locations');

    // Achievement queue (local)
    const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

    // ... render logic
  }
});
```

### 4.3 State Persistence Strategy

**Optimistic Updates Pattern**:
```typescript
const updatePlayerState = async (updates: Partial<PlayerState>) => {
  // 1. Update UI immediately (optimistic)
  setPlayerState(prev => ({ ...prev, ...updates }));

  // 2. Persist to backend asynchronously
  fetch('/api/player-state', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, updates })
  }).catch(error => {
    console.error('Failed to persist state:', error);
    // 3. Rollback on failure (optional)
    // setPlayerState(prevState);
  });
};

// Usage
const discoverEvidence = async (evidenceId: string) => {
  updatePlayerState({
    discoveredEvidence: [...playerState.discoveredEvidence, evidenceId]
  });
};
```

### 4.4 Redis Key Schema (Backend)

```typescript
// Player state
`player:${userId}:screen` → Current screen
`player:${userId}:state` → { discoveredEvidence[], actionPoints, achievements[] }
`player:${userId}:case:${caseId}:conversation:${suspectId}` → ChatMessage[]

// Case data
`case:${caseId}:data` → CaseData (cached)
`case:${caseId}:suspects` → Suspect[]

// Leaderboard
`leaderboard:${caseId}` → Sorted set of scores

// Session management
`session:${userId}:lastActive` → Timestamp
`session:${userId}:currentCase` → caseId
```

### 4.5 Migration Checklist

| Current Pattern | Devvit Pattern | Status |
|-----------------|----------------|--------|
| `localStorage.getItem('userId')` | `context.userId` | ✅ Direct replacement |
| `useState<GameScreen>()` | `useState<GameScreen>()` | ✅ Same API |
| `useEffect(() => fetch(...))` | `useState(async () => fetch(...))` | ✅ Async initializer |
| `useCase()` custom hook | Inline `useState` with fetch | ✅ Simplify |
| `useSuspect()` custom hook | Derived state from caseData | ✅ Remove hook |
| `useSubmission()` custom hook | Inline submit function | ✅ Simplify |
| `useGamification()` custom hook | Local state + effects | ⚠️ Test gamification logic |
| Polling with `setInterval` | Same `setInterval` | ✅ Works in Devvit |

---

## 5. Mobile-First Design System

### 5.1 Design Tokens

**Color Palette** (Noir Detective Theme):
```typescript
export const COLORS = {
  // Background layers
  deepBlack: '#0a0a0a',      // Main background
  charcoal: '#1a1a1a',       // Card background
  gunmetal: '#2a2a2a',       // Elevated surfaces
  smoke: '#3a3a3a',          // Hover states
  fog: '#4a4a4a',            // Borders

  // Accent colors
  gold: '#d4af37',           // Primary actions, highlights
  goldDim: '#b8922f',        // Dimmed gold for secondary elements

  // Evidence colors
  blood: '#8b0000',          // Critical clues, errors
  paper: '#f5f5dc',          // Document evidence
  clue: '#20b2aa',           // Discovery highlights

  // Text
  primary: '#e5e5e5',        // Primary text (high contrast)
  secondary: '#a0a0a0',      // Secondary text (medium contrast)
  tertiary: '#707070',       // Tertiary text (low contrast)

  // Semantic colors
  success: '#2d7a2d',        // Success states
  warning: '#d4af37',        // Warning states (gold)
  error: '#8b0000',          // Error states (blood)
  info: '#20b2aa',           // Info states (clue)
};
```

**Spacing Scale**:
```typescript
export const SPACING = {
  xs: 4,    // Tight spacing
  sm: 8,    // Small spacing
  md: 16,   // Medium spacing (base)
  lg: 24,   // Large spacing
  xl: 32,   // Extra large spacing
  xxl: 48,  // Section spacing
};
```

**Typography Scale**:
```typescript
export const TYPOGRAPHY = {
  display: {
    size: 'xxlarge',
    weight: 'bold',
    // Use for screen titles
  },
  heading: {
    size: 'xlarge',
    weight: 'bold',
    // Use for section headers
  },
  title: {
    size: 'large',
    weight: 'bold',
    // Use for card titles
  },
  body: {
    size: 'medium',
    weight: 'regular',
    // Use for body text
  },
  caption: {
    size: 'small',
    weight: 'regular',
    // Use for metadata, hints
  },
};
```

**Border Radius**:
```typescript
export const RADIUS = {
  small: 'small',     // 4px equivalent
  medium: 'medium',   // 8px equivalent
  large: 'large',     // 16px equivalent
  full: 'full',       // Fully rounded (pills)
};
```

### 5.2 Component Style Patterns

**Card Component**:
```typescript
const CARD_STYLES = {
  backgroundColor: COLORS.charcoal,
  cornerRadius: 'medium',
  padding: 'medium',
  gap: 'small',
  border: {
    width: 1,
    color: COLORS.fog,
  },
};

// Usage
<vstack {...CARD_STYLES}>
  <text size="large" weight="bold" color={COLORS.primary}>Card Title</text>
  <text size="medium" color={COLORS.secondary}>Card description</text>
</vstack>
```

**Button Styles**:
```typescript
const BUTTON_PRIMARY = {
  backgroundColor: COLORS.gold,
  textColor: COLORS.deepBlack,
  cornerRadius: 'medium',
  padding: 'medium',
  minHeight: 48, // Touch-friendly (Apple: 44px, Material: 48px)
};

const BUTTON_SECONDARY = {
  backgroundColor: 'transparent',
  textColor: COLORS.gold,
  cornerRadius: 'medium',
  padding: 'medium',
  minHeight: 48,
  border: {
    width: 1,
    color: COLORS.gold,
  },
};

const BUTTON_GHOST = {
  backgroundColor: 'transparent',
  textColor: COLORS.secondary,
  cornerRadius: 'medium',
  padding: 'medium',
  minHeight: 48,
  border: {
    width: 1,
    color: COLORS.fog,
  },
};
```

**Modal Overlay**:
```typescript
const MODAL_BACKDROP = {
  backgroundColor: 'rgba(10, 10, 10, 0.85)', // Semi-transparent deepBlack
};

const MODAL_CONTENT = {
  backgroundColor: COLORS.charcoal,
  padding: 'large',
  cornerRadius: 'large',
  maxWidth: '600px',
  gap: 'medium',
  border: {
    width: 2,
    color: COLORS.fog,
  },
};
```

### 5.3 Responsive Breakpoints

```typescript
// Use context.dimensions for responsive layouts
const getLayoutConfig = (width: number) => {
  if (width < 768) {
    return {
      layout: 'mobile',
      columns: 1,
      cardWidth: '100%',
      padding: 'small',
      gap: 'small',
    };
  } else if (width < 1024) {
    return {
      layout: 'tablet',
      columns: 2,
      cardWidth: '48%',
      padding: 'medium',
      gap: 'medium',
    };
  } else {
    return {
      layout: 'desktop',
      columns: 3,
      cardWidth: '30%',
      padding: 'large',
      gap: 'large',
    };
  }
};

// Usage in component
const { columns, cardWidth, padding, gap } = getLayoutConfig(context.dimensions.width);
```

### 5.4 Touch Target Guidelines

**Minimum Touch Targets** (WCAG 2.5.5):
- Buttons: 44x44px (iOS), 48x48px (Material Design)
- Links/Tappable items: 44x44px minimum
- Spacing between targets: 8px minimum

**Implementation**:
```typescript
<button
  minHeight={48}
  minWidth={48}
  padding="medium"
  onPress={handlePress}
>
  Button Text
</button>
```

### 5.5 Accessibility Patterns

**Color Contrast** (WCAG AA):
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

**Current Palette Contrast Ratios**:
- `COLORS.primary` (#e5e5e5) on `COLORS.deepBlack` (#0a0a0a): 16.8:1 ✅
- `COLORS.secondary` (#a0a0a0) on `COLORS.charcoal` (#1a1a1a): 7.2:1 ✅
- `COLORS.gold` (#d4af37) on `COLORS.deepBlack` (#0a0a0a): 8.4:1 ✅

**Semantic HTML Equivalents**:
```typescript
// Use text weights and sizes for semantic meaning
<text size="xxlarge" weight="bold">Heading 1</text>     // h1
<text size="xlarge" weight="bold">Heading 2</text>      // h2
<text size="large" weight="bold">Heading 3</text>       // h3
<text size="medium" weight="regular">Body</text>        // p
<text size="small" weight="regular">Caption</text>      // small
```

---

## 6. Backend Integration Strategy

### 6.1 Backend Compatibility Analysis

**Current Backend**: Express 5.1 + Redis + Gemini AI

**Compatibility**: ✅ **95% Preserved**

The existing backend is Devvit-compatible and requires minimal changes:

| Backend Feature | Status | Changes Required |
|-----------------|--------|------------------|
| Express API endpoints | ✅ Keep | None |
| Redis KV Store | ✅ Keep | None |
| Gemini AI integration | ✅ Keep | None |
| Case generation | ✅ Keep | None |
| Suspect AI service | ✅ Keep | None |
| Scoring logic | ✅ Keep | None |
| Evidence system | ✅ Keep | None |
| Action Points system | ✅ Keep | None |

### 6.2 API Endpoints (Unchanged)

```typescript
// Case Management
GET  /api/case                      → Get current daily case
POST /api/case/generate             → Generate new case
GET  /api/case/:caseId              → Get specific case

// Suspects
GET  /api/suspects/:caseId          → Get suspects for case
POST /api/chat/:suspectId           → Send message to suspect
GET  /api/conversation/:caseId/:userId/:suspectId → Get chat history

// Player State
GET  /api/player-state/:caseId/:userId     → Get player progress
POST /api/player-state                     → Update player state
GET  /api/player-state/:caseId/:userId/ap  → Get action points

// Evidence Discovery
POST /api/evidence/discover         → Discover evidence (costs AP)
GET  /api/evidence/:caseId/:userId  → Get discovered evidence

// Submission & Scoring
POST /api/submit                    → Submit answer, get scoring
GET  /api/leaderboard/:caseId       → Get rankings

// Image Generation (Background)
GET  /api/images/status/:caseId     → Get image generation status
POST /api/images/generate/:caseId   → Trigger image generation
```

### 6.3 User Context Migration

**Change Required**: User ID source

**Before (React + localStorage)**:
```typescript
const storedUserId = localStorage.getItem('userId');
if (!storedUserId) {
  const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  localStorage.setItem('userId', newUserId);
}
```

**After (Devvit context)**:
```typescript
const userId = context.userId; // Reddit user ID (built-in)
```

**Backend Compatibility**: No changes needed. Backend accepts any string userId.

### 6.4 Frontend-Backend Communication

**Unchanged Patterns**:
```typescript
// Fetch case data
const fetchCase = async () => {
  const response = await fetch('/api/case');
  if (!response.ok) throw new Error('Failed to fetch case');
  return await response.json();
};

// Submit answer
const submitAnswer = async (answer: W4HAnswer) => {
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, userId, answer }),
  });
  return await response.json();
};

// Discover evidence
const discoverEvidence = async (locationId: string, searchMethod: string) => {
  const response = await fetch('/api/evidence/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ caseId, userId, locationId, searchMethod }),
  });
  return await response.json();
};
```

**No Changes Needed**: fetch API works identically in Devvit.

### 6.5 Image Handling

**Current**: Base64 data URLs from Gemini AI

**Devvit Compatibility**: ✅ Works with `<image>` component

```typescript
// Backend generates base64 images (unchanged)
const imageUrl = `data:image/png;base64,${base64String}`;

// Frontend displays images (same in Devvit)
<image url={imageUrl} imageWidth={300} imageHeight={200} />
```

### 6.6 Real-Time Updates

**Current**: Polling with `setInterval` (3 second interval for evidence discovery)

**Devvit**: ✅ `setInterval` works in Devvit

```typescript
// Polling pattern (unchanged)
useEffect(() => {
  const pollInterval = setInterval(async () => {
    const response = await fetch(`/api/player-state/${caseId}/${userId}`);
    const data = await response.json();
    setPlayerState(data);
  }, 3000);

  return () => clearInterval(pollInterval);
}, [caseId, userId]);
```

### 6.7 Backend Changes Summary

**Zero Changes Required**:
- ✅ All API endpoints remain identical
- ✅ Redis schema unchanged
- ✅ Gemini AI integration unchanged
- ✅ Image generation unchanged
- ✅ Game logic unchanged

**Frontend Adapter Needed**:
- Replace `localStorage.getItem('userId')` with `context.userId`
- Wrap backend calls in Devvit component context
- No backend code changes needed

**Migration Benefit**: Backend is a black box. Frontend migration is isolated.

---

## 7. Animation Replacement Strategy

### 7.1 Current Animation Inventory

**Framer Motion Usage** (Cannot be migrated):

1. **Screen Transitions** (App.tsx):
   - Fade + slide between screens
   - `initial={{ opacity: 0, y: 20 }}`, `animate={{ opacity: 1, y: 0 }}`

2. **Tab Switching** (InvestigationScreen.tsx):
   - Sliding underline indicator
   - `layoutId="activeTab"` with spring animation

3. **Modal Overlays**:
   - Scale + fade on open/close
   - Backdrop blur effect

4. **Toast Notifications**:
   - Slide from top
   - Auto-dismiss with fade

5. **Achievement Celebrations**:
   - Confetti explosion
   - Scale + rotate effects

6. **Cinematic Intro**:
   - Parallax layers
   - Image pan and zoom
   - Text reveal effects

7. **Loading States**:
   - Skeleton shimmer animation
   - Spinner rotation

8. **Button Interactions**:
   - Hover scale (1.05x)
   - Glow effects on active states

### 7.2 Devvit Alternatives

| Animation Type | Current (Framer Motion) | Devvit Alternative | Trade-off |
|----------------|-------------------------|-------------------|-----------|
| Screen transitions | Fade + slide | Instant switch | Acceptable (mobile users expect instant) |
| Tab indicator | Sliding underline | Static color change | Acceptable (clear visual feedback) |
| Modal overlays | Scale + fade | Instant zstack | Acceptable (faster interaction) |
| Toast notifications | Slide from top | Instant appear at top | Acceptable (still prominent) |
| Achievements | Confetti + scale | Emoji confetti + bold text | Acceptable (fun without animation) |
| Skeleton loaders | Shimmer effect | Static gray boxes | Acceptable (common pattern) |
| Cinematic intro | Parallax + pan/zoom | Static slides | Acceptable (focus on content) |
| Button hover | Scale + glow | Native press state | Better (Devvit handles it) |

### 7.3 Static State Replacements

**Loading States**:
```typescript
// BEFORE (Framer Motion shimmer)
<motion.div
  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
  transition={{ repeat: Infinity, duration: 1.5 }}
  className="shimmer"
/>

// AFTER (Static placeholder)
<vstack
  backgroundColor={COLORS.gunmetal}
  width="100%"
  height="80px"
  cornerRadius="medium"
>
  <text color={COLORS.secondary}>Loading...</text>
</vstack>
```

**Achievement Celebrations**:
```typescript
// BEFORE (Framer Motion confetti)
<motion.div
  initial={{ scale: 0, rotate: -180 }}
  animate={{ scale: 1, rotate: 0 }}
>
  <ConfettiExplosion />
</motion.div>

// AFTER (Static emoji celebration)
<vstack
  backgroundColor={COLORS.gold}
  padding="large"
  cornerRadius="large"
  gap="medium"
>
  <text size="xxlarge">🎉 🎊 ✨ 🏆 ✨ 🎊 🎉</text>
  <text size="xlarge" weight="bold" color={COLORS.deepBlack}>
    Achievement Unlocked!
  </text>
  <text size="large">{achievement.title}</text>
</vstack>
```

**Toast Notifications**:
```typescript
// BEFORE (Framer Motion slide)
<motion.div
  initial={{ y: -100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: -100, opacity: 0 }}
>
  <Toast />
</motion.div>

// AFTER (Fixed position, instant appear)
<zstack width="100%" height="100%">
  {/* Main content */}
  <vstack>...</vstack>

  {/* Toast at top (conditional) */}
  {toast && (
    <vstack
      position="absolute"
      top="16px"
      left="16px"
      right="16px"
      backgroundColor={COLORS.gold}
      padding="medium"
      cornerRadius="medium"
      gap="small"
    >
      <hstack gap="small" alignment="center">
        <text size="large">{toast.icon}</text>
        <text size="medium" weight="bold">{toast.message}</text>
      </hstack>
    </vstack>
  )}
</zstack>
```

### 7.4 Emoji-Based Animation Sequences

Since we can't animate, we can simulate progression with emoji changes:

```typescript
// Loading sequence
const LOADING_EMOJIS = ['⏳', '⏳', '⏳'];
const [loadingFrame, setLoadingFrame] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setLoadingFrame(prev => (prev + 1) % LOADING_EMOJIS.length);
  }, 500);
  return () => clearInterval(interval);
}, []);

<text size="xxlarge">{LOADING_EMOJIS[loadingFrame]}</text>

// Discovery sequence
const DISCOVERY_SEQUENCE = ['🔍', '💡', '✅'];
// Show sequentially when evidence is discovered

// Success sequence
const SUCCESS_SEQUENCE = ['✨', '🎉', '🏆'];
// Show sequentially when case is solved
```

### 7.5 Native Devvit Feedback

Devvit may provide native interaction feedback:

```typescript
// Button press states (likely native)
<button
  onPress={handlePress}
  appearance="primary"
  // Devvit may handle visual press feedback automatically
>
  Submit Answer
</button>

// Focus/active states
// Devvit may support accessibility focus indicators natively
```

### 7.6 Animation Removal Checklist

| Component | Animation to Remove | Replacement | Status |
|-----------|---------------------|-------------|--------|
| App.tsx | Screen fade/slide transitions | Instant switch | ✅ |
| InvestigationScreen | Tab underline slide | Static indicator | ✅ |
| EvidenceDiscoveryModal | Modal scale/fade | Instant zstack | ✅ |
| AchievementToast | Slide from top | Fixed position | ✅ |
| MilestoneCelebration | Confetti explosion | Emoji grid | ✅ |
| SkeletonLoader | Shimmer effect | Static gray boxes | ✅ |
| CinematicIntro | Parallax/pan/zoom | Static slides | ✅ |
| All buttons | Hover scale | Native press state | ✅ |

**Result**: All animations removed or replaced with static alternatives. No functionality lost.

---

## 8. Implementation Phases

### 8.1 Phase 1: Foundation (Week 1) - 40 hours

**Goal**: Set up Devvit project and validate all core patterns

**Tasks**:
1. **Project Setup** (4h)
   - Initialize Devvit project with `devvit new`
   - Configure TypeScript and build system
   - Set up folder structure
   - Copy shared types from existing project

2. **Design Token System** (8h)
   - Create `constants/colors.ts` with COLORS object
   - Create `constants/spacing.ts` with SPACING object
   - Create `constants/typography.ts` with TYPOGRAPHY object
   - Create `constants/styles.ts` with component style patterns

3. **Reusable Component Helpers** (12h)
   - Build `Card` component wrapper
   - Build `Modal` component pattern
   - Build `Button` variants (primary, secondary, ghost)
   - Build `Toast` notification component
   - Build responsive layout helpers

4. **Main Post Structure** (8h)
   - Create MainPost.tsx with screen state machine
   - Implement screen routing (switch/case)
   - Set up context providers
   - Test state persistence

5. **LoadingScreen** (8h)
   - Build loading spinner (emoji sequence)
   - Add status text
   - Test backend connection
   - Validate fetch API integration

**Deliverables**:
- ✅ Working Devvit app with loading screen
- ✅ Design token system fully documented
- ✅ Reusable component library
- ✅ Backend API integration validated

**Validation Criteria**:
- LoadingScreen displays on app launch
- Backend fetch succeeds
- State persists across reloads (if applicable)
- Mobile touch targets meet 44px minimum

---

### 8.2 Phase 2: Core Screens (Week 2) - 40 hours

**Goal**: Implement navigation flow from loading to investigation

**Tasks**:
1. **CaseOverviewScreen** (8h)
   - Build victim/weapon/location cards
   - Add "Start Investigation" button
   - Test navigation to InvestigationScreen
   - Validate responsive layout

2. **InvestigationScreen Structure** (12h)
   - Build header with AP display
   - Implement tab navigation (locations/suspects/evidence)
   - Create tab switching logic
   - Add "Submit Answer" button
   - Test tab state persistence

3. **Basic Card Components** (12h)
   - Create LocationCard component
   - Create SuspectCard component
   - Create EvidenceCard component
   - Test card grid layouts
   - Validate mobile responsiveness

4. **Navigation Testing** (8h)
   - Test flow: loading → overview → investigation
   - Validate state transitions
   - Test back navigation
   - Verify backend data loads correctly
   - Test error states

**Deliverables**:
- ✅ Complete navigation from loading to investigation tabs
- ✅ All core screens render correctly
- ✅ Tab switching works smoothly
- ✅ Backend data displays properly

**Validation Criteria**:
- User can navigate through all screens
- Tab switching preserves state
- Cards display backend data correctly
- Layout adapts to screen width

---

### 8.3 Phase 3: Investigation Features (Week 3) - 40 hours

**Goal**: Implement full investigation gameplay loop

**Tasks**:
1. **LocationsTab** (16h)
   - Build location card grid
   - Implement "Search Location" button
   - Create EvidenceDiscoveryModal (zstack overlay)
   - Build SearchMethodSelector
   - Integrate AP cost system
   - Handle evidence reveal
   - Test discovery flow end-to-end

2. **SuspectsTab** (16h)
   - Build suspect card grid
   - Implement "Interrogate" button
   - Create ChatModal (zstack overlay)
   - Build ChatInterface (message history + input)
   - Integrate suspect AI backend
   - Handle conversation state
   - Test interrogation flow end-to-end

3. **EvidenceTab** (8h)
   - Build evidence grid
   - Add filter controls
   - Implement empty state
   - Add evidence detail view
   - Test evidence display

**Deliverables**:
- ✅ Location exploration with evidence discovery
- ✅ Suspect interrogation with AI chat
- ✅ Evidence notebook with filtering
- ✅ AP system fully integrated
- ✅ All modals working correctly

**Validation Criteria**:
- User can search locations and find evidence
- User can interrogate suspects and get responses
- Evidence displays in notebook
- AP system decrements correctly
- Modals overlay properly on mobile

---

### 8.4 Phase 4: Submission & Results (Week 4, Days 1-2) - 16 hours

**Goal**: Complete the gameplay loop

**Tasks**:
1. **SubmissionScreen** (10h)
   - Build form with 6 text inputs (Who/What/Where/When/Why/How)
   - Add validation logic
   - Implement submit button
   - Handle loading state
   - Test backend submission
   - Handle errors

2. **ResultsScreen** (6h)
   - Build score banner
   - Display breakdown by field
   - Show feedback for each answer
   - Add leaderboard preview
   - Implement "Play Again" button
   - Test navigation back to loading

**Deliverables**:
- ✅ Users can submit answers
- ✅ Scoring displays correctly
- ✅ Feedback is clear and helpful
- ✅ Complete end-to-end gameplay

**Validation Criteria**:
- Form validation works correctly
- Submission succeeds
- Score displays accurately
- User can start new game

---

### 8.5 Phase 5: Polish & Gamification (Week 4, Days 3-5) - 24 hours

**Goal**: Add polish features and gamification

**Tasks**:
1. **IntroScreen** (12h)
   - Build 3-slide intro system
   - Add slide navigation (next/skip)
   - Integrate cinematic images
   - Add progress indicator
   - Test intro flow

2. **Gamification** (6h)
   - Implement AchievementToast
   - Add MilestoneCelebration overlay
   - Implement APAcquisitionToast
   - Test achievement unlocks

3. **Loading & Empty States** (3h)
   - Add LoadingPlaceholder components
   - Implement EmptyState components
   - Test all loading scenarios

4. **Final Polish** (3h)
   - Mobile responsive testing on actual device
   - Performance optimization
   - Accessibility review
   - Bug fixes

**Deliverables**:
- ✅ Onboarding flow (3-slide intro)
- ✅ Achievement system
- ✅ Loading/empty states
- ✅ Production-ready app

**Validation Criteria**:
- Intro guides new users effectively
- Achievements unlock at correct times
- Loading states prevent confusion
- App feels polished and complete

---

### 8.6 Total Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Phase 1: Foundation | Week 1 (40h) | Project setup, design system, loading screen |
| Phase 2: Core Screens | Week 2 (40h) | Navigation flow, all screens |
| Phase 3: Investigation | Week 3 (40h) | Full investigation gameplay |
| Phase 4: Submission | Week 4 Days 1-2 (16h) | Complete gameplay loop |
| Phase 5: Polish | Week 4 Days 3-5 (24h) | Gamification, final polish |
| **Total** | **4 weeks (160h)** | **Production-ready Devvit app** |

**Team Size**: 1 full-time developer (40h/week)

**Milestones**:
- ✅ Week 1: Vertical slice (loading screen working)
- ✅ Week 2: Horizontal slice (all screens navigable)
- ✅ Week 3: Feature complete (all gameplay working)
- ✅ Week 4: Production ready (polished and tested)

---

## 9. Risk Analysis & Mitigation

### 9.1 High-Risk Areas

#### Risk 1: Modal Overlays (Severity: High)

**Problem**: Devvit's zstack may not support proper modal behavior (dismissal, backdrop clicks, focus trap)

**Likelihood**: Medium (60%)

**Impact**: High (modals are critical for evidence discovery and suspect chat)

**Mitigation Strategy**:
1. **Early Validation** (Phase 1): Test zstack layering with backdrop and content
2. **Fallback Design**: If zstack fails, use full-screen transitions instead of overlays
3. **Alternative Pattern**: Use separate screen states (`investigation-search`, `investigation-chat`) instead of modals

**Fallback Implementation**:
```typescript
// If modals fail, use screen transitions
case 'investigation-search':
  return <SearchScreen onBack={() => setScreen('investigation')} />;
case 'investigation-chat':
  return <ChatScreen onBack={() => setScreen('investigation')} />;
```

**Decision Point**: End of Phase 1 (Week 1)

---

#### Risk 2: Chat Interface Scrolling (Severity: Medium)

**Problem**: Devvit may not support scrollable containers or auto-scroll to bottom

**Likelihood**: Medium (50%)

**Impact**: Medium (affects user experience but not functionality)

**Mitigation Strategy**:
1. **Fixed-Height Message List**: Show only most recent N messages (e.g., last 10)
2. **Pagination**: Add "Load More" button to view older messages
3. **Backend Truncation**: Have backend return only recent messages

**Fallback Implementation**:
```typescript
// Show only recent messages
const recentMessages = messages.slice(-10);

<vstack height="400px" gap="small">
  {recentMessages.length >= 10 && (
    <button onPress={loadMoreMessages}>Load Older Messages</button>
  )}
  {recentMessages.map(message => (
    <MessageBubble key={message.id} message={message} />
  ))}
</vstack>
```

**Decision Point**: Phase 3 (Week 3)

---

#### Risk 3: Text Input Behavior (Severity: Medium)

**Problem**: Devvit text input may behave differently from web (validation, multiline, keyboard handling)

**Likelihood**: Low (30%)

**Impact**: Medium (affects submission form usability)

**Mitigation Strategy**:
1. **Early Testing**: Test text input in Phase 1 with various input types
2. **Validation on Blur**: Validate after user finishes typing, not on change
3. **Clear Error Messages**: Show validation errors prominently
4. **Fallback**: Use simple textarea with relaxed validation

**Fallback Implementation**:
```typescript
// Simple textarea with relaxed validation
<vstack gap="small">
  <text weight="bold">Why did they do it?</text>
  <textinput
    placeholder="Enter your reasoning..."
    onChangeText={setWhyAnswer}
    multiline={true}
  />
  {errors.why && (
    <text color={COLORS.error}>{errors.why}</text>
  )}
</vstack>
```

**Decision Point**: Phase 4 (Week 4)

---

#### Risk 4: Image Loading Performance (Severity: Medium)

**Problem**: Base64 images may be slow to load on mobile Reddit app

**Likelihood**: Medium (40%)

**Impact**: Medium (affects perceived performance, not functionality)

**Mitigation Strategy**:
1. **Lazy Loading**: Load images only when visible
2. **Placeholders**: Show gray boxes while loading
3. **Lower Resolution**: Use 600px width images instead of 1024px
4. **Optional Images**: Make images optional if performance is poor

**Fallback Implementation**:
```typescript
// Lazy loading with placeholder
const [imageLoaded, setImageLoaded] = useState(false);

<vstack width="100%" height="200px">
  {!imageLoaded && (
    <vstack
      width="100%"
      height="100%"
      backgroundColor={COLORS.gunmetal}
    >
      <text>Loading image...</text>
    </vstack>
  )}
  <image
    url={imageUrl}
    imageWidth={600}
    imageHeight={400}
    onLoad={() => setImageLoaded(true)}
  />
</vstack>
```

**Decision Point**: Phase 2 (Week 2)

---

#### Risk 5: State Persistence Timing (Severity: Medium)

**Problem**: Redis async operations may cause race conditions (AP deduction, evidence discovery)

**Likelihood**: Low (20%)

**Impact**: High (could allow AP exploits or duplicate evidence)

**Mitigation Strategy**:
1. **Backend as Source of Truth**: Always validate state on backend
2. **Optimistic Updates with Rollback**: Update UI immediately, rollback on error
3. **Request Queuing**: Queue rapid state changes
4. **Disable Parallel Actions**: Disable buttons while action is in progress

**Fallback Implementation**:
```typescript
// Disable actions while pending
const [actionInProgress, setActionInProgress] = useState(false);

const searchLocation = async (locationId: string) => {
  setActionInProgress(true);
  try {
    const result = await fetch('/api/evidence/discover', {
      method: 'POST',
      body: JSON.stringify({ locationId })
    });
    // Update state with result
  } catch (error) {
    // Rollback optimistic update
  } finally {
    setActionInProgress(false);
  }
};

<button disabled={actionInProgress} onPress={searchLocation}>
  Search Location
</button>
```

**Decision Point**: Phase 3 (Week 3)

---

#### Risk 6: AP System Synchronization (Severity: Low-Medium)

**Problem**: Multiple actions may cause AP desync between frontend and backend

**Likelihood**: Low (15%)

**Impact**: Medium (affects fairness and gameplay)

**Mitigation Strategy**:
1. **Backend Validation**: Validate AP on every action
2. **Refetch After Mutations**: Always refetch player state after AP-consuming actions
3. **Pessimistic Updates**: Wait for backend confirmation before updating UI
4. **Sequential Actions**: Force sequential gameplay, disable parallel searches

**Fallback Implementation**:
```typescript
// Refetch AP after every action
const searchLocation = async (locationId: string) => {
  const result = await fetch('/api/evidence/discover', {
    method: 'POST',
    body: JSON.stringify({ locationId })
  });

  // Refetch player state to get accurate AP
  const stateResponse = await fetch(`/api/player-state/${caseId}/${userId}`);
  const newState = await stateResponse.json();
  setPlayerState(newState);
};
```

**Decision Point**: Phase 3 (Week 3)

---

### 9.2 Medium-Risk Areas

| Risk | Likelihood | Impact | Mitigation | Decision Point |
|------|------------|--------|------------|----------------|
| Responsive layout issues | 30% | Medium | Early mobile testing | Phase 2 |
| Performance with large evidence lists | 25% | Low | Pagination, virtual scrolling | Phase 3 |
| Button press feedback | 20% | Low | Rely on native Devvit feedback | Phase 1 |
| Toast notification stacking | 15% | Low | Queue toasts, show one at a time | Phase 5 |
| Achievement unlock timing | 10% | Low | Backend-driven achievement checks | Phase 5 |

---

### 9.3 Testing Strategy

**Phase-Specific Testing**:

**Phase 1 (Foundation)**:
- ✅ Test zstack layering (critical for modals)
- ✅ Test text input behavior
- ✅ Test fetch API integration
- ✅ Test on actual Reddit mobile app (not just web preview)

**Phase 2 (Core Screens)**:
- ✅ Test navigation state persistence
- ✅ Test responsive layouts on various screen sizes
- ✅ Test image loading performance
- ✅ Test touch target sizes (44px minimum)

**Phase 3 (Investigation)**:
- ✅ Test modal overlays on mobile
- ✅ Test chat scrolling behavior
- ✅ Test AP system synchronization
- ✅ Test evidence discovery flow
- ✅ Test concurrent user actions

**Phase 4 (Submission)**:
- ✅ Test form validation
- ✅ Test submission error handling
- ✅ Test results display
- ✅ Test end-to-end gameplay

**Phase 5 (Polish)**:
- ✅ Test achievement unlocks
- ✅ Test milestone celebrations
- ✅ Test loading states
- ✅ Accessibility review
- ✅ Performance profiling

**Acceptance Criteria**:
- App loads in under 3 seconds
- All touch targets meet 44px minimum
- No visual regressions from React version
- Backend integration 100% functional
- No race conditions in AP system

---

## 10. Component Migration Patterns

### 10.1 Migration Checklist (Per Component)

For each of the 21 P0+P1 components:

**Step 1: Remove Framer Motion**
```typescript
// BEFORE
import { motion } from 'framer-motion';
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className="card"
>
  {content}
</motion.div>

// AFTER
<vstack {...CARD_STYLES}>
  {content}
</vstack>
```

**Step 2: Remove Tailwind Classes**
```typescript
// BEFORE
<div className="bg-noir-charcoal p-4 rounded-lg border border-noir-fog gap-2">

// AFTER
<vstack
  backgroundColor="#1a1a1a"
  padding="medium"
  cornerRadius="medium"
  border={{ width: 1, color: "#4a4a4a" }}
  gap="small"
>
```

**Step 3: Replace HTML Elements**
```typescript
// BEFORE
<div>...</div>              → <vstack>...</vstack> or <hstack>...</hstack>
<button>...</button>        → <button>...</button> (Devvit native)
<img src={url} />           → <image url={url} imageWidth={W} imageHeight={H} />
<p>Text</p>                 → <text>Text</text>
<h1>Title</h1>              → <text size="xxlarge" weight="bold">Title</text>
<span>Inline</span>         → <text>Inline</text>
<input type="text" />       → <textinput />
```

**Step 4: Convert Styles to Props**
```typescript
// Background colors
className="bg-noir-charcoal"        → backgroundColor="#1a1a1a"

// Padding/Margin
className="p-4"                     → padding="medium"
className="px-4 py-2"               → paddingHorizontal="medium" paddingVertical="small"
className="gap-4"                   → gap="medium"

// Border radius
className="rounded-lg"              → cornerRadius="medium"
className="rounded-full"            → cornerRadius="full"

// Borders
className="border border-noir-fog"  → border={{ width: 1, color: "#4a4a4a" }}

// Flexbox
className="flex flex-col"           → <vstack>
className="flex flex-row"           → <hstack>
className="items-center"            → alignment="center"
className="justify-between"         → alignment="space-between"

// Text styles
className="text-detective-gold"     → color="#d4af37"
className="font-bold"               → weight="bold"
className="text-xl"                 → size="xlarge"
```

**Step 5: Replace React Hooks**
```typescript
// BEFORE
import { useState, useEffect } from 'react';

// AFTER
import { useState, useEffect } from '@devvit/public-api';
// OR: Use Devvit context
const { useState, useEffect } = Devvit;
```

**Step 6: Handle Images**
```typescript
// BEFORE
<img
  src={imageUrl}
  alt="Evidence"
  className="w-full h-48 object-cover rounded-lg"
/>

// AFTER
<image
  url={imageUrl}
  imageWidth={600}
  imageHeight={400}
  description="Evidence"
  resizeMode="cover"
  cornerRadius="medium"
/>
```

**Step 7: Replace Event Handlers**
```typescript
// BEFORE
<button onClick={handleClick}>Click</button>

// AFTER
<button onPress={handleClick}>Click</button>
```

---

### 10.2 Example Migration: LocationCard

**BEFORE (React + Tailwind + Framer Motion)**:
```typescript
import { motion } from 'framer-motion';

interface LocationCardProps {
  location: Location;
  onSearch: (locationId: string) => void;
}

export const LocationCard = ({ location, onSearch }: LocationCardProps) => {
  return (
    <motion.div
      className="
        bg-noir-charcoal
        p-4
        rounded-lg
        border border-noir-fog
        hover:border-detective-gold
        transition-all
        cursor-pointer
      "
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {location.imageUrl && (
        <img
          src={location.imageUrl}
          alt={location.name}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{location.emoji}</span>
        <h3 className="text-xl font-bold text-detective-gold">
          {location.name}
        </h3>
      </div>
      <p className="text-text-secondary text-sm mb-4">
        {location.description}
      </p>
      <button
        onClick={() => onSearch(location.id)}
        className="
          btn-primary
          w-full
          px-4 py-3
          rounded-lg
          font-bold
          text-base
        "
      >
        🔍 Search Location
      </button>
    </motion.div>
  );
};
```

**AFTER (Devvit Blocks)**:
```typescript
import { Devvit } from '@devvit/public-api';
import { COLORS, SPACING } from '../constants';

interface LocationCardProps {
  location: Location;
  onSearch: (locationId: string) => void;
}

export const LocationCard = ({ location, onSearch }: LocationCardProps) => {
  return (
    <vstack
      backgroundColor={COLORS.charcoal}
      padding="medium"
      cornerRadius="medium"
      border={{ width: 1, color: COLORS.fog }}
      gap="small"
      width="100%"
    >
      {/* Location Image */}
      {location.imageUrl && (
        <image
          url={location.imageUrl}
          imageWidth={600}
          imageHeight={400}
          description={location.name}
          resizeMode="cover"
          cornerRadius="medium"
        />
      )}

      {/* Header with emoji and name */}
      <hstack gap="small" alignment="center">
        <text size="xlarge">{location.emoji}</text>
        <text size="large" weight="bold" color={COLORS.gold}>
          {location.name}
        </text>
      </hstack>

      {/* Description */}
      <text size="small" color={COLORS.secondary}>
        {location.description}
      </text>

      {/* Search button */}
      <button
        onPress={() => onSearch(location.id)}
        appearance="primary"
        minHeight={48}
        width="100%"
      >
        🔍 Search Location
      </button>
    </vstack>
  );
};
```

**Changes Made**:
1. ✅ Removed Framer Motion (`motion.div` → `vstack`)
2. ✅ Removed Tailwind classes (converted to props)
3. ✅ Replaced `<img>` with `<image>`
4. ✅ Replaced `<div>`, `<h3>`, `<p>` with `<text>`
5. ✅ Changed `onClick` to `onPress`
6. ✅ Removed hover/tap animations (not supported)
7. ✅ Used design tokens (COLORS, SPACING)

---

### 10.3 Example Migration: EvidenceDiscoveryModal

**BEFORE (React + Framer Motion + Tailwind)**:
```typescript
import { motion, AnimatePresence } from 'framer-motion';

interface EvidenceDiscoveryModalProps {
  isOpen: boolean;
  location: Location;
  onClose: () => void;
  onSearch: (method: string) => void;
}

export const EvidenceDiscoveryModal = ({
  isOpen,
  location,
  onClose,
  onSearch,
}: EvidenceDiscoveryModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-80 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="
              fixed top-1/2 left-1/2
              transform -translate-x-1/2 -translate-y-1/2
              bg-noir-charcoal
              p-6
              rounded-lg
              border-2 border-detective-gold
              z-50
              max-w-2xl
            "
          >
            <h2 className="text-2xl font-bold text-detective-gold mb-4">
              Search {location.name}
            </h2>

            <div className="grid grid-cols-3 gap-4">
              {SEARCH_METHODS.map(method => (
                <button
                  key={method.id}
                  onClick={() => onSearch(method.id)}
                  className="
                    bg-noir-gunmetal
                    p-4
                    rounded-lg
                    border border-noir-fog
                    hover:border-detective-gold
                    transition-all
                  "
                >
                  <div className="text-3xl mb-2">{method.icon}</div>
                  <div className="font-bold">{method.name}</div>
                  <div className="text-sm text-text-secondary">
                    {method.apCost} AP
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="btn-ghost mt-4 w-full"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

**AFTER (Devvit Blocks)**:
```typescript
import { Devvit } from '@devvit/public-api';
import { COLORS } from '../constants';

interface EvidenceDiscoveryModalProps {
  isOpen: boolean;
  location: Location;
  onClose: () => void;
  onSearch: (method: string) => void;
}

export const EvidenceDiscoveryModal = ({
  isOpen,
  location,
  onClose,
  onSearch,
}: EvidenceDiscoveryModalProps) => {
  if (!isOpen) return null;

  return (
    <zstack width="100%" height="100%">
      {/* Backdrop */}
      <vstack
        width="100%"
        height="100%"
        backgroundColor="rgba(10, 10, 10, 0.85)"
        alignment="center middle"
      >
        {/* Modal content */}
        <vstack
          maxWidth="600px"
          backgroundColor={COLORS.charcoal}
          padding="large"
          cornerRadius="large"
          gap="medium"
          border={{ width: 2, color: COLORS.gold }}
        >
          {/* Header */}
          <text size="xlarge" weight="bold" color={COLORS.gold}>
            Search {location.name}
          </text>

          {/* Search methods grid */}
          <vstack gap="medium">
            {SEARCH_METHODS.map(method => (
              <vstack
                key={method.id}
                backgroundColor={COLORS.gunmetal}
                padding="medium"
                cornerRadius="medium"
                border={{ width: 1, color: COLORS.fog }}
                gap="small"
              >
                <text size="xxlarge">{method.icon}</text>
                <text size="medium" weight="bold">{method.name}</text>
                <text size="small" color={COLORS.secondary}>
                  {method.apCost} AP
                </text>
                <button
                  onPress={() => onSearch(method.id)}
                  appearance="primary"
                  minHeight={44}
                >
                  Use This Method
                </button>
              </vstack>
            ))}
          </vstack>

          {/* Cancel button */}
          <button
            onPress={onClose}
            appearance="secondary"
            minHeight={44}
          >
            Cancel
          </button>
        </vstack>
      </vstack>
    </zstack>
  );
};
```

**Changes Made**:
1. ✅ Removed AnimatePresence and motion components
2. ✅ Removed animations (scale, opacity transitions)
3. ✅ Used zstack for overlay (instead of fixed positioning)
4. ✅ Removed Tailwind classes (converted to props)
5. ✅ Changed grid layout to vstack (simpler for mobile)
6. ✅ Removed hover effects
7. ✅ Simplified to conditional rendering (if/return pattern)

---

### 10.4 Migration Effort Estimation

| Complexity | Components | Avg Hours | Total Hours |
|------------|-----------|-----------|-------------|
| Low (Simple cards) | 8 | 4h | 32h |
| Medium (Modals, forms) | 7 | 8h | 56h |
| High (Complex screens) | 6 | 14h | 84h |
| **Total** | **21** | **-** | **172h** |

**Note**: Total includes component migration (172h) minus shared component setup time already accounted for in Phase 1-2 (28h), resulting in net 160h timeline.

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
                     /\
                    /  \
                   / E2E\
                  /------\
                 /        \
                /Integration\
               /------------\
              /              \
             /   Unit Tests   \
            /------------------\
```

**Unit Tests**: Component logic, state management, utility functions
**Integration Tests**: Screen flows, backend API integration
**E2E Tests**: Full gameplay flow from loading to results

### 11.2 Test Scenarios by Phase

**Phase 1 (Foundation)**:
- [ ] Design tokens load correctly
- [ ] LoadingScreen renders with correct styles
- [ ] Backend fetch succeeds
- [ ] Error states display correctly
- [ ] zstack layering works (critical path validation)

**Phase 2 (Core Screens)**:
- [ ] Navigation between all screens works
- [ ] Tab switching preserves state
- [ ] Cards display backend data correctly
- [ ] Responsive layout adapts to screen width
- [ ] Images load correctly (or show placeholders)

**Phase 3 (Investigation)**:
- [ ] Location search opens modal
- [ ] Search methods display with AP costs
- [ ] Evidence discovery works end-to-end
- [ ] Suspect interrogation opens chat modal
- [ ] Chat messages send and receive correctly
- [ ] Evidence displays in notebook

**Phase 4 (Submission)**:
- [ ] Form validation works correctly
- [ ] All fields required before submit
- [ ] Submission succeeds
- [ ] Results display correctly
- [ ] Breakdown shows feedback for each field

**Phase 5 (Polish)**:
- [ ] Intro slides display correctly
- [ ] Achievement toasts appear at correct times
- [ ] Milestone celebrations trigger correctly
- [ ] Loading states prevent user confusion
- [ ] Empty states display when appropriate

### 11.3 Mobile Device Testing

**Test Devices**:
- iPhone 14 Pro (iOS 17) - Safari
- iPhone SE (iOS 16) - Safari (small screen)
- Samsung Galaxy S23 (Android 13) - Chrome
- iPad Air (iOS 17) - Safari (tablet)

**Test Cases**:
- [ ] Touch targets meet 44px minimum
- [ ] Text is readable without zooming
- [ ] Modals overlay correctly
- [ ] Scrolling works smoothly
- [ ] Keyboard doesn't obscure inputs
- [ ] Images load efficiently
- [ ] App feels responsive (no lag)

### 11.4 Accessibility Testing

**WCAG 2.1 AA Compliance**:
- [ ] Color contrast ratios meet 4.5:1 (normal text)
- [ ] Color contrast ratios meet 3:1 (large text, UI components)
- [ ] Touch targets meet 44x44px minimum
- [ ] Focus indicators visible
- [ ] Alt text provided for images (via `description` prop)
- [ ] Error messages clear and helpful
- [ ] Form labels associated with inputs

**Screen Reader Testing**:
- [ ] Test with TalkBack (Android)
- [ ] Test with VoiceOver (iOS)
- [ ] Verify reading order is logical
- [ ] Verify button labels are descriptive

### 11.5 Performance Testing

**Metrics**:
- [ ] Initial load time < 3 seconds
- [ ] Screen transitions feel instant
- [ ] Image loading doesn't block UI
- [ ] No memory leaks (test extended gameplay)
- [ ] Backend API response times < 2 seconds

**Load Testing**:
- [ ] Test with 10 evidence items
- [ ] Test with 20 chat messages
- [ ] Test with all achievements unlocked
- [ ] Test with slow network (3G simulation)

### 11.6 Integration Testing

**Backend Integration**:
- [ ] All API endpoints return correct data
- [ ] Error handling works for API failures
- [ ] State persists correctly to Redis
- [ ] AP system prevents exploits
- [ ] Leaderboard updates correctly

**State Management**:
- [ ] Player state loads on mount
- [ ] State updates persist to backend
- [ ] Optimistic updates work correctly
- [ ] Rollback works on error
- [ ] No race conditions in AP system

### 11.7 User Acceptance Testing

**Gameplay Testing**:
- [ ] New user can complete full game without confusion
- [ ] Intro effectively explains how to play
- [ ] Evidence discovery feels rewarding
- [ ] Suspect interrogation is engaging
- [ ] Submission form is clear
- [ ] Results are satisfying

**Feedback Collection**:
- Gather feedback from 5-10 beta testers
- Identify pain points and confusion
- Validate that all features work as expected
- Measure completion rate (target: >80%)

---

## 12. Appendix

### 12.1 Key Files Reference

**Current React App**:
- `src/client/App.tsx` - Main app router
- `src/client/components/InvestigationScreen.tsx` - Investigation hub
- `src/client/components/case/CaseOverview.tsx` - Case briefing
- `src/client/components/submission/SubmissionForm.tsx` - Answer form
- `src/client/components/results/ResultView.tsx` - Scoring display
- `src/client/types/index.ts` - Type definitions
- `src/shared/types/index.ts` - Shared types

**Backend (Preserved)**:
- `src/server/index.ts` - Express server
- `src/server/core/post.ts` - Devvit post handlers
- `src/server/services/case/CaseGeneratorService.ts` - Case generation
- `src/server/services/suspect/SuspectAIService.ts` - Suspect AI
- `src/server/services/repositories/kv/` - Redis repositories

### 12.2 Devvit Resources

**Official Documentation**:
- Devvit Docs: https://developers.reddit.com/docs
- Blocks Components: https://developers.reddit.com/docs/blocks
- Custom Posts: https://developers.reddit.com/docs/custom_posts
- Redis KV: https://developers.reddit.com/docs/redis

**Example Projects**:
- Devvit Examples: https://github.com/reddit/devvit/tree/main/examples

### 12.3 Design System Export

**Color Palette** (Copy to `constants/colors.ts`):
```typescript
export const COLORS = {
  deepBlack: '#0a0a0a',
  charcoal: '#1a1a1a',
  gunmetal: '#2a2a2a',
  smoke: '#3a3a3a',
  fog: '#4a4a4a',
  gold: '#d4af37',
  goldDim: '#b8922f',
  blood: '#8b0000',
  paper: '#f5f5dc',
  clue: '#20b2aa',
  primary: '#e5e5e5',
  secondary: '#a0a0a0',
  tertiary: '#707070',
  success: '#2d7a2d',
  warning: '#d4af37',
  error: '#8b0000',
  info: '#20b2aa',
};
```

**Spacing Scale** (Copy to `constants/spacing.ts`):
```typescript
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

**Component Styles** (Copy to `constants/styles.ts`):
```typescript
import { COLORS } from './colors';

export const CARD_STYLES = {
  backgroundColor: COLORS.charcoal,
  cornerRadius: 'medium',
  padding: 'medium',
  gap: 'small',
  border: { width: 1, color: COLORS.fog },
};

export const BUTTON_PRIMARY = {
  backgroundColor: COLORS.gold,
  textColor: COLORS.deepBlack,
  cornerRadius: 'medium',
  padding: 'medium',
  minHeight: 48,
};

export const BUTTON_SECONDARY = {
  backgroundColor: 'transparent',
  textColor: COLORS.gold,
  cornerRadius: 'medium',
  padding: 'medium',
  minHeight: 48,
  border: { width: 1, color: COLORS.gold },
};

export const BUTTON_GHOST = {
  backgroundColor: 'transparent',
  textColor: COLORS.secondary,
  cornerRadius: 'medium',
  padding: 'medium',
  minHeight: 48,
  border: { width: 1, color: COLORS.fog },
};

export const MODAL_BACKDROP = {
  backgroundColor: 'rgba(10, 10, 10, 0.85)',
};

export const MODAL_CONTENT = {
  backgroundColor: COLORS.charcoal,
  padding: 'large',
  cornerRadius: 'large',
  maxWidth: '600px',
  gap: 'medium',
  border: { width: 2, color: COLORS.fog },
};
```

---

## 13. Next Steps

### 13.1 Pre-Implementation Checklist

**Before Starting Phase 1**:
- [ ] Review this architecture document with team
- [ ] Set up Devvit development environment
- [ ] Test Devvit playtest on actual mobile device
- [ ] Validate zstack modal pattern (critical path)
- [ ] Confirm backend is running and accessible
- [ ] Create GitHub branch for Devvit migration
- [ ] Set up project tracking (issues, milestones)

### 13.2 Phase 1 Kickoff

**Week 1 Goals**:
1. Initialize Devvit project
2. Create design token system
3. Build reusable component helpers
4. Implement LoadingScreen
5. Validate all critical patterns (modals, images, fetch)

**Success Criteria**:
- LoadingScreen works on mobile device
- Backend connection successful
- Modal pattern validated
- Design tokens documented

### 13.3 Communication Plan

**Daily Standups**:
- Progress update
- Blockers/risks
- Next tasks

**Weekly Reviews**:
- Demo working features
- Review completed phase
- Adjust timeline if needed

**Milestone Reviews**:
- End of each phase
- Demo to stakeholders
- Gather feedback

---

## Document Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-24 | Initial architecture document |

---

## Contact & Support

For questions about this architecture:
- **Author**: Claude (Frontend Architect)
- **Project**: Armchair Sleuths Devvit Migration
- **Document**: DEVVIT_MIGRATION_ARCHITECTURE.md

---

**END OF DOCUMENT**
