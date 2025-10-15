# Location Exploration & Evidence System - Research Summary

**Project**: Armchair Sleuths - Reddit Murder Mystery Game
**Feature**: Location Exploration, Evidence Collection, Ghibli-Style Image Generation
**Research Date**: 2025-01-15
**Status**: Research Complete, Implementation In Progress

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Repository Analysis](#repository-analysis)
3. [Best Practices Research](#best-practices-research)
4. [Framework Documentation Research](#framework-documentation-research)
5. [Architecture Analysis](#architecture-analysis)
6. [Key Findings & Recommendations](#key-findings--recommendations)

---

## Executive Summary

### Feature Overview

Transform the Armchair Sleuths game from a chat-based mystery to a fully explorable world with:
- **4 Explorable Locations** per case (1 crime scene + 3 connected areas)
- **10-15 Evidence Items** with intelligent distribution
- **Ghibli-Style Images** for all locations, evidence, and suspects (dark/mysterious aesthetic)
- **Non-Deterministic AI Generation** maintaining 80-90/100 quality score
- **Progressive Exploration** with hotspots and discovery mechanics

### Current State Analysis

**Existing System:**
- Cases generated via Gemini AI with high quality (20+ quality checks)
- Chat interface with suspect interrogation
- 3 suspects per case (1 guilty, 2 innocent)
- Image generation infrastructure exists but not working
- Text-based evidence system in place

**Gap Analysis:**
- No location exploration mechanics
- Evidence not tied to physical spaces
- No visual representation of crime scenes
- Limited player agency in investigation
- Missing spatial storytelling elements

### Research Findings Summary

**Technical Feasibility:** ✅ Achievable with existing stack
**Estimated Effort:** 5-7 weeks (18-24 hours additional work from current state)
**Cost Impact:** ~$35-40/month in production (Gemini API)
**Risk Level:** Medium (image generation complexity, quality consistency)
**User Impact:** High (transforms core gameplay experience)

---

## Repository Analysis

### Agent: repo-research-analyst

**Mission**: Analyze existing codebase structure, identify integration points, and understand architectural patterns.

### Current Architecture Overview

**Technology Stack:**
- **Platform**: Devvit 0.12.1 (Reddit App Framework)
- **Frontend**: React 19.1.0, TypeScript 5.8.2
- **Backend**: Devvit Server Runtime (Node.js-like)
- **Storage**: Devvit KV Store (key-value storage)
- **AI**: Gemini API (gemini-flash-lite-latest, gemini-2.5-flash-image)
- **Build**: Vite 6.0.11, ESBuild

**Project Structure:**
```
src/
├── client/                 # React frontend
│   ├── App.tsx            # Main app component
│   ├── components/        # UI components
│   │   ├── case/          # Case display components
│   │   ├── chat/          # Chat interface
│   │   └── suspect/       # Suspect panels
│   └── hooks/             # Custom React hooks
├── server/                # Backend services
│   ├── index.ts           # Main server entry
│   ├── services/
│   │   ├── case/          # Case generation
│   │   ├── chat/          # Chat handling
│   │   ├── gemini/        # AI integration
│   │   └── repositories/  # Data access layer
│   └── utils/
└── shared/                # Shared types/utilities
    ├── types/
    │   ├── case.ts        # Case type definitions
    │   └── api.ts         # API contracts
    └── utils/
```

### Key Integration Points Identified

#### 1. Case Generation Pipeline
**File**: `src/server/services/case/CaseGeneratorService.ts`
**Current Flow**:
```typescript
generateCase() {
  → generateVictim()
  → generateWeapon()
  → generateLocation()      // ← EXPAND THIS
  → generateSuspects()
  → generateSolution()
  → generateEvidence()      // ← EXPAND THIS
  → validateCase()          // ← ENHANCE THIS
  → storeCaseMetadata()
}
```

**Integration Requirements**:
- Add location generator service call
- Add evidence generator service call
- Enhance validation for new structures
- Update storage schema

#### 2. Data Storage Layer
**File**: `src/server/services/repositories/CaseRepository.ts`
**Current Schema**:
```typescript
// Cases stored in KV store with keys:
`case:${caseId}:metadata`     // Case overview
`case:${caseId}:suspects`     // Suspect list
`case:${caseId}:evidence`     // Evidence list (simple)
`case:${caseId}:chat`         // Chat history
`case:${caseId}:solution`     // Solution data
```

**New Schema Required**:
```typescript
`case:${caseId}:locations`         // ExplorableLocation[]
`case:${caseId}:evidence:detail`   // Enhanced evidence with locations
`case:${caseId}:hotspots`          // Hotspot discovery state
`case:${caseId}:images`            // Image generation status
```

#### 3. Frontend State Management
**File**: `src/client/App.tsx`
**Current State**:
```typescript
// Phase management
const [phase, setPhase] = useState<GamePhase>('briefing');

// Case data
const [currentCase, setCurrentCase] = useState<GeneratedCase>();

// Chat state
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [activeSuspect, setActiveSuspect] = useState<string>();
```

**New State Required**:
```typescript
// Exploration state
const [visitedLocations, setVisitedLocations] = useState<string[]>([]);
const [currentLocation, setCurrentLocation] = useState<string>();
const [discoveredHotspots, setDiscoveredHotspots] = useState<string[]>([]);
const [collectedEvidence, setCollectedEvidence] = useState<string[]>([]);

// Image loading state
const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageStatusResponse>();
```

#### 4. Gemini AI Integration
**File**: `src/server/services/gemini/GeminiClient.ts`
**Current Capabilities**:
```typescript
class GeminiClient {
  // Text generation (used for cases, suspects, evidence)
  async generateText(prompt: string, options?: GenerationOptions): Promise<GenerationResponse>

  // JSON parsing helper
  parseJsonResponse<T>(text: string): T

  // Image generation (delegates to Vercel Function)
  async generateImage(prompt: string, style: string): Promise<string>
}
```

**Usage Patterns**:
- Temperature 0.7-0.8 for creative generation
- Temperature 0.3-0.5 for structured/logical generation
- JSON extraction via regex patterns
- Retry logic for failed requests

**New Requirements**:
- Location generation prompts (creative, temperature 0.8)
- Evidence generation prompts (structured, temperature 0.7)
- Ghibli-style image generation (via Vercel proxy)
- Background async image generation

#### 5. API Endpoints
**File**: `src/server/index.ts`
**Current Endpoints**:
```typescript
// Case management
POST   /generate-case          // Create new case
GET    /case/:id               // Get case data
GET    /case/:id/suspects      // Get suspect list

// Chat
POST   /chat/message           // Send chat message
GET    /chat/history           // Get chat history

// Submission
POST   /submit-answer          // Submit case solution
GET    /results                // Get result/feedback
```

**New Endpoints Required**:
```typescript
// Location exploration
GET    /case/:id/locations              // Get all locations
GET    /case/:id/locations/:locationId  // Get location detail
POST   /case/:id/locations/:locationId/visit  // Mark visited

// Evidence collection
GET    /case/:id/evidence               // Get all evidence
POST   /case/:id/evidence/:evidenceId/collect  // Collect evidence
GET    /case/:id/hotspots               // Get hotspot states

// Image generation
GET    /case/:id/images/status          // Get image generation progress
POST   /case/:id/images/generate        // Trigger background generation
```

### Component Analysis

#### Existing Components to Modify

**1. App.tsx** (`src/client/App.tsx`)
- **Current**: 3-screen flow (Briefing → Chat → Results)
- **Modification**: Add Exploration and Investigation phases
- **New Screens**: LocationExplorer, EvidenceBoard
- **Complexity**: High (state management overhaul)

**2. CaseOverview.tsx** (`src/client/components/case/CaseOverview.tsx`)
- **Current**: Basic case info display
- **Modification**: Add location preview, evidence counter
- **New Props**: `locations`, `evidenceCount`
- **Complexity**: Low (UI additions only)

**3. SuspectPanel.tsx** (`src/client/components/suspect/SuspectPanel.tsx`)
- **Current**: Suspect cards with chat trigger
- **Modification**: Add evidence linking, motive hints
- **New Props**: `linkedEvidence`, `motiveSummary`
- **Complexity**: Medium (data integration)

#### New Components to Create

**1. LocationExplorer.tsx**
- **Purpose**: Main exploration interface with location map
- **Features**: Location cards, navigation, progress tracking
- **State**: Current location, visited locations, available exits
- **Complexity**: High (core feature component)

**2. LocationDetailView.tsx**
- **Purpose**: Single location immersive view with hotspots
- **Features**: Image display, clickable hotspots, atmosphere text
- **State**: Hotspot discovery, evidence collection
- **Complexity**: High (interaction logic)

**3. EvidencePanel.tsx**
- **Purpose**: Evidence board with collected items
- **Features**: Evidence cards, filtering, suspect linking
- **State**: Collected evidence, filter criteria
- **Complexity**: Medium (display logic)

**4. HotspotMarker.tsx**
- **Purpose**: Interactive hotspot on location images
- **Features**: Pulsing animation, tooltip, click handler
- **State**: Discovered/undiscovered, linked evidence
- **Complexity**: Low (UI component)

**5. GameContext.tsx** (Context Provider)
- **Purpose**: Centralized game state management
- **State**: Case data, progress, exploration state
- **Methods**: collectEvidence, visitLocation, discoverHotspot
- **Complexity**: High (state orchestration)

### Storage Adapter Pattern

**File**: `src/server/services/repositories/adapters/DevvitStorageAdapter.ts`

**Current Pattern**:
```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  list(pattern: string): Promise<string[]>;
}
```

**Benefits**:
- Abstraction over Devvit KV Store
- Testable (can mock storage)
- Type-safe operations
- Error handling layer

**New Requirements**:
- Batch operations for efficiency
- Transaction support for atomic updates
- TTL support for image cache
- List operations for location/evidence queries

### Testing Infrastructure

**Existing Tests**:
- Unit tests for case generation quality
- Integration tests for chat flow
- E2E tests using Devvit test environment

**Test Files Identified**:
```
src/server/services/case/__tests__/CaseGeneratorService.test.ts
src/server/services/chat/__tests__/ChatService.test.ts
src/server/services/repositories/__tests__/CaseRepository.test.ts
```

**New Test Requirements**:
- Location generation quality tests
- Evidence distribution validation tests
- Hotspot assignment logic tests
- Image generation mock tests
- Frontend component tests (React Testing Library)

### Performance Considerations

**Current Metrics**:
- Case generation: ~3-5 seconds (Gemini API)
- Chat response: ~1-2 seconds
- Storage operations: <100ms

**New Performance Targets**:
- Location generation: +2-3 seconds (acceptable)
- Evidence generation: +2-3 seconds (acceptable)
- Image generation: 3-5 minutes (background async)
- Location load: <500ms (with placeholder images)
- Evidence collection: <200ms (storage update)

**Optimization Strategies**:
- Parallel AI generation calls where possible
- Progressive image loading (placeholder → real)
- Client-side state caching
- Optimistic UI updates

### Risk Analysis from Repository Review

**High Risk**:
1. **Image Generation Failure**: Existing image gen not working
   - Mitigation: Fix Vercel proxy, add robust fallbacks

2. **Storage Schema Migration**: Breaking changes to KV structure
   - Mitigation: Versioned storage keys, migration script

**Medium Risk**:
1. **State Management Complexity**: New exploration state
   - Mitigation: Use Context API, clear state machines

2. **AI Generation Quality**: Non-deterministic output
   - Mitigation: Validation service, retry logic

**Low Risk**:
1. **Component Refactoring**: Well-isolated components
2. **API Endpoint Addition**: Follows existing patterns

---

## Best Practices Research

### Agent: best-practices-researcher

**Mission**: Research detective game design patterns, UI/UX best practices for exploration mechanics, and evidence collection systems.

### Detective Game Design Patterns

#### 1. Evidence Collection Mechanics

**Source**: Analysis of successful detective games (Her Story, Return of the Obra Dinn, Disco Elysium, Ace Attorney)

**Key Patterns**:

**Progressive Disclosure**:
- Start with limited information
- Unlock evidence through exploration/interaction
- Create "aha!" moments when connections become clear
- Example: Obra Dinn's memory reconstruction mechanic

**Application to Our Game**:
```typescript
// Evidence should be discovered, not handed out
interface Evidence {
  isDiscovered: boolean;      // Player must find it
  requiresContext?: string[]; // May need other evidence first
  revealsTrigger?: string[];  // May unlock new areas/evidence
}
```

**Fair Play Principle**:
- All clues needed to solve mystery must be accessible
- No hidden information that player can't discover
- Logical deduction should be possible
- Classic "Golden Age" detective fiction rule

**Application**:
```typescript
// Validation must ensure solvability
validateCase(case: GeneratedCase): ValidationResult {
  // Check: Can guilty suspect be identified with available evidence?
  const criticalEvidenceCount = case.evidence.filter(
    e => e.isKeyEvidence && e.linkedSuspects.includes(guiltySuspect.id)
  ).length;

  if (criticalEvidenceCount < 3) {
    return { isValid: false, reason: 'Insufficient critical evidence' };
  }
}
```

**Red Herring Management**:
- Misleading clues should be plausible but disprovable
- Balance: Too many = frustrating, Too few = too easy
- Evidence relevance types: critical → important → minor → red-herring
- Target ratio: 40% critical/important, 30% minor, 30% red herrings

**Application**:
```typescript
export type EvidenceRelevance =
  | 'critical'      // Directly proves guilt (4-5 pieces)
  | 'important'     // Strongly supports theory (3-4 pieces)
  | 'minor'         // Supporting detail (2-3 pieces)
  | 'red-herring';  // Misleading but plausible (2-3 pieces)
```

#### 2. Spatial Storytelling

**Source**: Environmental narrative design (Bioshock, Gone Home, What Remains of Edith Finch)

**Key Patterns**:

**Location as Character**:
- Each location should tell part of the story
- Atmosphere reflects events that occurred
- Props and details reveal character/history
- Example: Blood splatter pattern, overturned furniture

**Application**:
```typescript
interface ExplorableLocation {
  atmosphere: string;  // "정적이 감돌고 피의 냄새가 희미하게 난다"
  props: string[];     // ["피가 묻은 책상", "뒤집어진 의자", "깨진 잉크병"]
  // These tell story of struggle
}
```

**Logical Connectivity**:
- Locations should connect naturally (not arbitrary)
- Flow should match narrative timeline
- Consider: Crime scene → escape route → hiding place
- Avoid: Random teleportation between unrelated areas

**Application**:
```typescript
interface ExplorableLocation {
  connectedLocationIds: string[];  // Physical/logical connections
  isMainCrimeScene: boolean;       // Start point anchor
}

// Validation should check connectivity graph
private validateLocationGraph(locations: ExplorableLocation[]): boolean {
  // All locations should be reachable from crime scene
  const reachable = new Set<string>();
  const queue = [crimeScene.id];

  while (queue.length > 0) {
    const current = queue.shift()!;
    reachable.add(current);
    const location = locations.find(l => l.id === current);
    queue.push(...location.connectedLocationIds.filter(id => !reachable.has(id)));
  }

  return reachable.size === locations.length;
}
```

**Hotspot Design**:
- Clearly discoverable but not trivial
- Visual cues (different from background)
- Avoid pixel hunting (frustrating)
- Feedback on interaction

**Best Practices**:
```typescript
interface Hotspot {
  x: number;  // 0-100 (percentage positioning)
  y: number;  // 0-100
  type: 'evidence' | 'clue' | 'interactive';
  description: string;  // Clear description of what's there
}

// Hotspot placement rules:
// - Minimum 10% spacing between hotspots (avoid overlap)
// - Use descriptive text to guide player
// - Provide visual feedback (glow, pulse animation)
// - 2-4 hotspots per location (not too many/few)
```

#### 3. Investigation Pacing

**Source**: Game design analysis (Outer Wilds, The Case of the Golden Idol)

**Key Patterns**:

**Non-Linear Progression**:
- Allow players to investigate in any order
- Progress tracked by discoveries, not sequence
- Multiple valid investigation paths
- No forced order unless logical dependency

**Application**:
```typescript
interface PlayerProgress {
  explorationProgress: number;  // 0-100 (% of locations visited)
  evidenceCollectionProgress: number;  // 0-100 (% of evidence found)
  // Not: currentStep: number (linear)
}
```

**Momentum Management**:
- Early discoveries should be easy (build confidence)
- Mid-game should require connections
- Late game should challenge deduction skills
- Avoid: Long stretches with no discoveries

**Application**:
```typescript
// Evidence difficulty distribution
const distributionStrategy = {
  easy: 40%,      // Obvious, visible in main locations
  medium: 40%,    // Requires thorough exploration
  hard: 20%       // Requires connecting clues
};

// Location design should support this
crimeScene.hotspots = [
  { difficulty: 'easy', ... },   // First evidence always easy
  { difficulty: 'medium', ... },
  { difficulty: 'hard', ... }
];
```

### UI/UX Best Practices

#### 1. Exploration Interface Design

**Source**: Adventure game UI patterns (Monkey Island, Grim Fandango, modern point-and-click)

**Visual Hierarchy**:
```
Primary Focus: Location image with hotspots (60-70% screen)
Secondary: Navigation options (15% screen)
Tertiary: Inventory/evidence panel (15-20% screen)
Meta: Settings, help (5% screen, collapsed)
```

**Interaction Patterns**:

**Hotspot Discovery**:
- Cursor change on hover (visual affordance)
- Optional scan/reveal mechanic (accessibility)
- Tooltip preview on hover
- Click to examine/collect

**Example UI Flow**:
```
User hovers over suspicious area
  → Cursor changes to magnifying glass
  → Tooltip appears: "피가 묻은 책상"
User clicks
  → Animation/zoom focus
  → Evidence detail modal
  → "Collect Evidence" button
  → Evidence added to panel
  → Hotspot marked as discovered
```

**Mobile Considerations** (Reddit mobile app):
- Touch targets minimum 44x44px
- Avoid hover-dependent interactions
- Use long-press for context actions
- Swipe for navigation between locations

#### 2. Evidence Board Design

**Source**: Detective board UX (Sherlock Holmes games, LA Noire)

**Organization Patterns**:

**By Category**:
```typescript
interface EvidencePanel {
  tabs: ['Physical', 'Documents', 'Testimonial', 'Digital', 'Forensic'];
  currentTab: EvidenceType;
  items: Evidence[];
}
```

**By Suspect**:
```typescript
interface EvidencePanel {
  grouping: 'by-suspect';
  suspects: Array<{
    suspect: Suspect;
    linkedEvidence: Evidence[];
  }>;
}
```

**By Timeline**:
```typescript
interface EvidencePanel {
  grouping: 'by-timeline';
  timeline: Array<{
    time: string;
    events: Evidence[];
  }>;
}
```

**Best Practice**: Start with category view (clearest), allow toggle to other views.

**Visual Design**:
- Evidence cards with thumbnail (if image available)
- Color coding by relevance (critical=red, important=orange, minor=yellow)
- Connection lines between related evidence
- Search/filter functionality

#### 3. Progressive Loading Strategy

**Source**: Image-heavy web applications (Pinterest, Instagram)

**Loading States**:
```typescript
type ImageLoadState =
  | 'not-started'     // No request yet
  | 'generating'      // AI creating image
  | 'loading'         // Downloading
  | 'loaded'          // Ready to display
  | 'failed'          // Error state
  | 'placeholder';    // Using fallback

interface ImageStatus {
  state: ImageLoadState;
  progress?: number;      // 0-100 for generating
  retryCount?: number;
  fallbackUrl?: string;
}
```

**Best Practices**:
1. **Show placeholder immediately** (don't block UI)
2. **Progressive enhancement** (placeholder → low-res → full)
3. **Background generation** (don't block game start)
4. **Graceful degradation** (game works without images)
5. **User feedback** (loading spinner, progress bar)

**Implementation Pattern**:
```typescript
function LocationImage({ locationId, imageUrl, placeholder }: Props) {
  const [imageState, setImageState] = useState<ImageLoadState>(
    imageUrl ? 'loading' : 'generating'
  );

  // Polling for generation completion
  useEffect(() => {
    if (imageState === 'generating') {
      const interval = setInterval(async () => {
        const status = await checkImageStatus(locationId);
        if (status.isComplete) {
          setImageState('loading');
          // Load actual image
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [imageState, locationId]);

  if (imageState === 'generating') {
    return <PlaceholderWithSpinner />;
  }

  if (imageState === 'loading' || imageState === 'loaded') {
    return <img src={imageUrl} onLoad={() => setImageState('loaded')} />;
  }

  return <PlaceholderWithRetry />;
}
```

### Detective Game Quality Metrics

**Source**: Player engagement research, game analytics studies

**Success Indicators**:

1. **Completion Rate**: Target >60% (industry standard for puzzle games)
2. **Time to Solve**: Target 20-40 minutes (engaging but not exhausting)
3. **Hint Usage**: Target <30% players (means difficulty is balanced)
4. **Return Rate**: Target >40% (players want to play again)
5. **Accuracy**: Target 50-60% first-try success (challenging but fair)

**Quality Factors**:

**Solvability Score** (Must be 100%):
- All critical evidence available
- Logical deduction path exists
- No impossible contradictions

**Fairness Score** (Target 80-90%):
- Evidence distribution balanced
- Red herrings are disprovable
- No guess-required steps

**Engagement Score** (Target 80-90%):
- Compelling narrative
- Satisfying discovery moments
- Meaningful choices

**Application**:
```typescript
interface ValidationResult {
  isValid: boolean;          // Must be true
  isSolvable: boolean;       // Must be true
  qualityScore: number;      // Target: 80-90/100

  // Breakdown
  solvabilityScore: number;  // 100% or fail
  fairnessScore: number;     // Target: 80-90%
  engagementScore: number;   // Target: 80-90%
}
```

### Visual Style Guidelines

**Source**: Studio Ghibli art analysis, game art direction

**Ghibli Aesthetic Characteristics**:

1. **Color Palette**:
   - Warm, natural colors (browns, greens, soft yellows)
   - Desaturated for mystery/moodiness
   - Strong contrast between light and shadow
   - Atmospheric perspective (fog, haze)

2. **Composition**:
   - Detailed backgrounds with clear focal points
   - Organic shapes, avoiding harsh geometry
   - Depth through layering
   - Empty space to create mood

3. **Lighting**:
   - Soft, diffused lighting
   - Strong direction (creates mood)
   - Volumetric effects (dust motes, fog)
   - Warm/cool contrast

4. **Detail Level**:
   - High detail in important areas
   - Simplified in periphery
   - Texture through brush strokes
   - Lived-in, realistic details

**Application to Image Generation**:
```typescript
const ghibliStylePrompt = `
Style: Studio Ghibli animation background art, dark mystery atmosphere
Mood: Mysterious, atmospheric, slightly unsettling but beautiful
Lighting: Soft diffused lighting with strong directional shadows
Color palette: Desaturated warm tones, muted colors, atmospheric depth
Composition: Detailed foreground, atmospheric background, clear focal point
Medium: Hand-painted watercolor aesthetic, visible brush strokes
Perspective: Wide establishing shot showing full location
Quality: High detail in important areas, painterly style
Mood modifiers: Dust motes in light beams, subtle fog, abandoned feeling
`;
```

**Dark Ghibli Adaptation**:
- Keep Ghibli warmth and beauty
- Add mystery elements (shadows, abandoned spaces)
- Desaturate colors slightly
- Stronger contrast
- More atmospheric effects
- Subtle unsettling details

### Accessibility Considerations

**Source**: WCAG 2.1 guidelines, game accessibility research

**Critical Requirements**:

1. **Keyboard Navigation**: All interactions possible without mouse
2. **Screen Reader Support**: Alt text for images, ARIA labels
3. **Color Blindness**: Don't rely solely on color (use icons/text)
4. **Scalable Text**: Support browser zoom, large text
5. **Reduce Motion**: Option to disable animations

**Implementation Checklist**:
```typescript
// Example: Hotspot with accessibility
interface AccessibleHotspot extends Hotspot {
  ariaLabel: string;           // "Evidence: Bloody desk"
  keyboardShortcut?: string;   // "Press E to examine"
  highContrastIcon?: string;   // For color blind users
}

// Example: Settings
interface AccessibilitySettings {
  reduceMotion: boolean;       // Disable animations
  highContrast: boolean;       // Stronger visual differentiation
  largeText: boolean;          // 150% text size
  keyboardHints: boolean;      // Show keyboard shortcuts
}
```

---

## Framework Documentation Research

### Agent: framework-docs-researcher

**Mission**: Research Devvit, React 19, and Gemini AI documentation for implementation patterns and best practices.

### Devvit Platform Deep Dive

**Source**: Official Devvit documentation (devvit.reddit.com/docs)

#### 1. Devvit KV Store

**Storage Capabilities**:
```typescript
// Key-value store with string keys, any JSON-serializable value
interface KVStore {
  get(key: string): Promise<any | null>;
  put(key: string, value: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: ListOptions): Promise<string[]>;
}

// ListOptions
interface ListOptions {
  prefix?: string;    // Filter by key prefix
  start?: string;     // Pagination start key
  limit?: number;     // Max results (default 100)
}
```

**Storage Patterns**:

**Namespaced Keys** (Best Practice):
```typescript
// Good: Clear namespace hierarchy
`case:${caseId}:metadata`
`case:${caseId}:suspects:${suspectId}`
`case:${caseId}:locations:${locationId}`
`case:${caseId}:player:${userId}:progress`

// Bad: Flat structure
`${caseId}_meta`
`suspect_${suspectId}`
```

**Batch Operations** (No native support, implement manually):
```typescript
async function batchGet<T>(keys: string[]): Promise<Map<string, T>> {
  const results = await Promise.all(
    keys.map(async key => ({ key, value: await kvStore.get(key) }))
  );
  return new Map(results.map(r => [r.key, r.value]));
}

async function batchPut(items: Map<string, any>): Promise<void> {
  await Promise.all(
    Array.from(items.entries()).map(([key, value]) => kvStore.put(key, value))
  );
}
```

**Storage Limits**:
- Key size: Max 1 KB
- Value size: Max 2 MB
- Total storage: Unlimited (but rate limited)
- Rate limits: 100 operations/second per user

**Implications for Our Feature**:
- Store locations separately (not in single mega-object)
- Use namespaced keys for efficient listing
- Implement batch operations for performance
- Cache frequently accessed data client-side

#### 2. Devvit Custom Post Type

**Post Configuration**:
```typescript
Devvit.addCustomPostType({
  name: 'murder-mystery-game',
  description: 'Interactive murder mystery investigation',
  height: 'tall',  // Full screen experience
  render: (context) => {
    // Return React component
    return <App context={context} />;
  },
});
```

**Context API**:
```typescript
interface Context {
  postId: string;
  reddit: RedditClient;
  ui: UIClient;
  userId?: string;
  username?: string;
  kvStore: KVStore;
}
```

**Best Practices**:
- Use `height: 'tall'` for immersive experiences
- Access user info via `context.userId`
- Use `context.kvStore` for data persistence
- Handle anonymous users gracefully

#### 3. Devvit Webview Integration

**Communication Pattern**:
```typescript
// Server sends message to client
context.ui.webview.postMessage('game', {
  type: 'CASE_LOADED',
  data: caseData
});

// Client receives message
window.addEventListener('message', (event) => {
  if (event.data.type === 'CASE_LOADED') {
    setCurrentCase(event.data.data);
  }
});

// Client sends message to server
window.parent.postMessage({
  type: 'COLLECT_EVIDENCE',
  evidenceId: 'evidence-123'
}, '*');
```

**Security Considerations**:
- Always validate message origin
- Sanitize data before processing
- Use type discriminators for message routing

**Application**:
```typescript
// Type-safe message system
type WebviewMessage =
  | { type: 'LOAD_CASE'; caseId: string }
  | { type: 'VISIT_LOCATION'; locationId: string }
  | { type: 'COLLECT_EVIDENCE'; evidenceId: string }
  | { type: 'SUBMIT_ANSWER'; submission: Submission };

function handleMessage(message: WebviewMessage) {
  switch (message.type) {
    case 'LOAD_CASE':
      // Handle case load
      break;
    case 'VISIT_LOCATION':
      // Handle location visit
      break;
    // ...
  }
}
```

### React 19 Features and Patterns

**Source**: Official React documentation (react.dev)

#### 1. Modern Hooks

**useOptimistic** (New in React 19):
```typescript
// Optimistic UI updates
function EvidenceCollector({ evidenceId }: Props) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [optimisticEvidence, addOptimisticEvidence] = useOptimistic(
    evidence,
    (state, newEvidence: Evidence) => [...state, newEvidence]
  );

  async function collectEvidence(item: Evidence) {
    // Show immediately (optimistic)
    addOptimisticEvidence(item);

    // Actually collect (may fail)
    try {
      await api.collectEvidence(item.id);
      setEvidence(prev => [...prev, item]);
    } catch (error) {
      // Optimistic update auto-reverts on error
      showError('Failed to collect evidence');
    }
  }

  return (
    <EvidenceGrid evidence={optimisticEvidence} onCollect={collectEvidence} />
  );
}
```

**use()** (New in React 19):
```typescript
// Simplified data fetching
function LocationDetail({ locationId }: Props) {
  // Suspense-friendly data fetching
  const location = use(fetchLocation(locationId));

  return (
    <div>
      <h1>{location.name}</h1>
      <p>{location.description}</p>
    </div>
  );
}

// Wrap in Suspense
<Suspense fallback={<LocationSkeleton />}>
  <LocationDetail locationId={id} />
</Suspense>
```

**useActionState** (New in React 19):
```typescript
// Form actions with pending state
function SubmissionForm() {
  const [state, submitAction, isPending] = useActionState(
    async (prevState: State, formData: FormData) => {
      const submission = {
        suspectId: formData.get('suspect'),
        reasoning: formData.get('reasoning'),
        evidence: formData.getAll('evidence')
      };

      const result = await api.submitAnswer(submission);
      return result;
    },
    initialState
  );

  return (
    <form action={submitAction}>
      {/* Form fields */}
      <button disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Answer'}
      </button>
    </form>
  );
}
```

#### 2. Context API Best Practices

**Game State Context**:
```typescript
// Define context shape
interface GameContextValue {
  // Data
  currentCase: GeneratedCase | null;
  visitedLocations: string[];
  collectedEvidence: string[];
  currentPhase: GamePhase;

  // Actions
  visitLocation: (locationId: string) => Promise<void>;
  collectEvidence: (evidenceId: string) => Promise<void>;
  submitAnswer: (submission: Submission) => Promise<void>;

  // Computed
  explorationProgress: number;
  canSubmit: boolean;
}

// Create context
const GameContext = createContext<GameContextValue | null>(null);

// Provider component
export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentCase, setCurrentCase] = useState<GeneratedCase | null>(null);
  const [visitedLocations, setVisitedLocations] = useState<string[]>([]);
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>([]);

  const visitLocation = useCallback(async (locationId: string) => {
    setVisitedLocations(prev => [...new Set([...prev, locationId])]);
    await api.markLocationVisited(locationId);
  }, []);

  const collectEvidence = useCallback(async (evidenceId: string) => {
    setCollectedEvidence(prev => [...new Set([...prev, evidenceId])]);
    await api.collectEvidence(evidenceId);
  }, []);

  const explorationProgress = useMemo(() => {
    if (!currentCase) return 0;
    return (visitedLocations.length / currentCase.explorableLocations.length) * 100;
  }, [currentCase, visitedLocations]);

  const value: GameContextValue = {
    currentCase,
    visitedLocations,
    collectedEvidence,
    currentPhase: 'exploration',
    visitLocation,
    collectEvidence,
    submitAnswer: async () => {},
    explorationProgress,
    canSubmit: collectedEvidence.length >= 5
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Hook for consuming
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
```

**Performance Optimization**:
- Use `useMemo` for expensive computations
- Use `useCallback` for stable function references
- Split contexts by update frequency (data vs. actions)
- Consider using Zustand or Jotai for complex state

#### 3. Component Patterns

**Compound Components**:
```typescript
// Location explorer with compound pattern
function LocationExplorer({ children }: Props) {
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  return (
    <LocationContext.Provider value={{ currentLocation, setCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

LocationExplorer.Map = function Map() {
  const { setCurrentLocation } = useLocationContext();
  // Render location map
};

LocationExplorer.Detail = function Detail() {
  const { currentLocation } = useLocationContext();
  // Render location detail
};

// Usage
<LocationExplorer>
  <LocationExplorer.Map />
  <LocationExplorer.Detail />
</LocationExplorer>
```

**Render Props**:
```typescript
// Evidence grid with flexible rendering
function EvidenceGrid({
  evidence,
  renderItem,
  renderEmpty
}: Props) {
  if (evidence.length === 0) {
    return renderEmpty();
  }

  return (
    <div className="evidence-grid">
      {evidence.map(item => renderItem(item))}
    </div>
  );
}

// Usage
<EvidenceGrid
  evidence={collectedEvidence}
  renderItem={(item) => <EvidenceCard evidence={item} />}
  renderEmpty={() => <EmptyState message="No evidence collected yet" />}
/>
```

### Gemini AI Integration Patterns

**Source**: Gemini API documentation, implementation examples

#### 1. Text Generation Best Practices

**Temperature Guidelines**:
```typescript
const temperatureGuide = {
  // High creativity, diverse outputs
  creative: 0.8-1.0,     // Use for: Location names, evidence descriptions, narratives

  // Balanced creativity and consistency
  balanced: 0.6-0.8,     // Use for: Suspect personalities, motives

  // More deterministic, structured
  structured: 0.3-0.5,   // Use for: Logical reasoning, validation

  // Highly deterministic
  precise: 0.0-0.2       // Use for: JSON parsing, structured data
};
```

**Prompt Engineering Patterns**:

**1. Role Definition**:
```typescript
const prompt = `당신은 살인 미스터리 게임의 장소 디자이너입니다.
당신의 목표는 플레이어가 탐색할 매력적이고 단서로 가득한 장소를 만드는 것입니다.`;
```

**2. Context Provision**:
```typescript
const prompt = `
**사건 정보:**
- 범행 무기: ${weapon.name}
- 범인: ${solution.who}
- 범행 동기: ${solution.why}
`;
```

**3. Clear Instructions**:
```typescript
const prompt = `
**작업:** 메인 장소 내에서 탐색 가능한 4개의 세부 장소를 생성하세요.

**규칙:**
1. 첫 번째 장소는 범행 현장 (isMainCrimeScene: true)
2. 나머지 3개는 단서/증거를 발견할 수 있는 연관 장소
3. 각 장소는 고유한 분위기와 특징을 가져야 함
`;
```

**4. Output Format**:
```typescript
const prompt = `
**응답 형식:** JSON만 응답하세요 (설명 없이)

{
  "locations": [
    {
      "name": "범행 현장 - 서재 안쪽",
      "description": "...",
      ...
    }
  ]
}
`;
```

**5. Examples (Few-shot)**:
```typescript
const prompt = `
**예시:**
{
  "name": "범행 현장 - 서재 안쪽",
  "description": "피해자가 쓰러져있던 서재의 깊은 안쪽",
  "atmosphere": "정적이 감돌고 피의 냄새가 희미하게 난다",
  "props": ["피가 묻은 책상", "뒤집어진 의자"],
  "isMainCrimeScene": true,
  "hotspots": [...]
}
`;
```

#### 2. JSON Extraction

**Robust Parsing**:
```typescript
class GeminiClient {
  parseJsonResponse<T>(text: string): T {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Find JSON object/array
    const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    try {
      return JSON.parse(jsonMatch[1]);
    } catch (error) {
      console.error('JSON parse error:', error);
      console.error('Raw text:', text);
      throw new Error('Invalid JSON in response');
    }
  }
}
```

**Validation with Zod**:
```typescript
import { z } from 'zod';

// Define schema
const LocationSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  atmosphere: z.string(),
  props: z.array(z.string()).min(2),
  isMainCrimeScene: z.boolean(),
  connectedTo: z.array(z.string()),
  hotspots: z.array(z.object({
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    type: z.enum(['evidence', 'clue', 'interactive']),
    description: z.string()
  }))
});

const LocationResponseSchema = z.object({
  locations: z.array(LocationSchema).length(4)
});

// Use in parsing
const parsed = this.geminiClient.parseJsonResponse(response.text);
const validated = LocationResponseSchema.parse(parsed);  // Throws if invalid
```

#### 3. Image Generation via Vercel Proxy

**Architecture**:
```
Devvit Backend
  → POST to Vercel Function (workaround for Devvit limitations)
    → Vercel Function calls Gemini imagen API
      → Returns image URL (Google Cloud Storage)
        → Devvit stores URL in KV
```

**Implementation Pattern**:
```typescript
// Devvit backend
async function generateLocationImage(
  location: ExplorableLocation,
  style: string
): Promise<string> {
  const prompt = buildImagePrompt(location, style);

  // Call Vercel proxy
  const response = await fetch('https://your-vercel-function.vercel.app/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style })
  });

  if (!response.ok) {
    throw new Error('Image generation failed');
  }

  const { imageUrl } = await response.json();
  return imageUrl;
}

// Vercel Function (api/generate-image.ts)
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt, style } = await req.json();

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image' });

  const result = await model.generateImage({
    prompt: `${style}\n\n${prompt}`,
    numberOfImages: 1,
    aspectRatio: '16:9'
  });

  return Response.json({ imageUrl: result.images[0].url });
}
```

**Error Handling**:
```typescript
async function generateImageWithRetry(
  prompt: string,
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const imageUrl = await generateLocationImage(prompt, 'ghibli');
      return imageUrl;
    } catch (error) {
      console.error(`Image generation attempt ${attempt + 1} failed:`, error);

      if (attempt === maxRetries - 1) {
        // Final attempt failed, return placeholder
        return PLACEHOLDER_IMAGE_URL;
      }

      // Wait before retry (exponential backoff)
      await sleep(Math.pow(2, attempt) * 1000);
    }
  }

  return PLACEHOLDER_IMAGE_URL;
}
```

#### 4. Cost Optimization

**Gemini API Pricing**:
```
Text Generation (gemini-flash-lite-latest):
  - Input: $0.04 / 1M tokens
  - Output: $0.16 / 1M tokens

Image Generation (gemini-2.5-flash-image):
  - $0.035 per image
```

**Estimated Costs per Case**:
```typescript
const costEstimate = {
  // Text generation
  locationGeneration: {
    inputTokens: 1500,    // Prompt with context
    outputTokens: 2000,   // 4 locations with details
    cost: (1500 * 0.04 + 2000 * 0.16) / 1000000
  },

  evidenceGeneration: {
    inputTokens: 2000,    // Prompt with locations, suspects
    outputTokens: 3000,   // 10-15 evidence items
    cost: (2000 * 0.04 + 3000 * 0.16) / 1000000
  },

  // Image generation
  imageGeneration: {
    locations: 4 * 0.035,      // $0.14
    evidence: 12 * 0.035,      // $0.42
    suspects: 3 * 0.035,       // $0.105
    total: 19 * 0.035          // $0.665
  },

  totalPerCase: 0.001 + 0.665  // ~$0.67
};

// Production estimate (50 cases/month)
const monthlyProductionCost = 0.67 * 50;  // ~$33.50
```

**Optimization Strategies**:
1. **Batch generation**: Generate multiple items in single call
2. **Caching**: Store generated content, reuse when appropriate
3. **Lazy loading**: Generate images only when needed
4. **Quality tiers**: Lower quality for previews, full for detail view

---

## Architecture Analysis

**Sequential Thinking Summary**: 18 thoughts analyzing architecture, complexity, and implementation strategy.

### Thought 1-3: Architecture Impact Analysis

**Backend Changes** (High Impact):
- New service layer: LocationGeneratorService, EvidenceGeneratorService
- Enhanced validation: Quality scoring, solvability checks
- Storage expansion: New KV schema for locations, evidence
- API expansion: 6+ new endpoints

**Frontend Changes** (High Impact):
- New phase: Exploration (between briefing and chat)
- New components: LocationExplorer, EvidenceBoard, HotspotMarker
- State management: Context API for game state
- Progressive loading: Image loading states

**Integration Complexity**: Medium-High
- Gemini API: Additional calls (location, evidence generation)
- Image pipeline: Fix existing system, add background generation
- Data flow: Server → Client → User interaction → Server updates

### Thought 4-6: Image Generation Strategy

**Current State**:
- Implementation exists but broken (Vercel proxy not working)
- gemini-2.5-flash-image model available
- Cost: $0.035 per image

**Required Changes**:
1. Fix Vercel Function proxy
2. Add background async generation
3. Implement progressive loading
4. Add retry logic and fallbacks

**Image Requirements per Case**:
- 4 location images
- 10-15 evidence images
- 3 suspect portraits (already implemented)
- Total: 17-22 images per case

**Generation Strategy**:
```typescript
// Phase 1: Start with placeholders (immediate)
case.explorableLocations.forEach(loc => {
  loc.imageUrl = PLACEHOLDER_URL;
});

// Phase 2: Background generation (non-blocking)
backgroundGenerateImages(case.id);

// Phase 3: Progressive loading (as ready)
polling.checkImageStatus(case.id, (progress) => {
  updateUI(progress);
});
```

**Time Estimation**:
- Serial generation: 17-22 images × 10-15 seconds = 3-5 minutes
- Parallel generation (batch 5): 17-22 images ÷ 5 × 15 seconds = 60-90 seconds
- User experience: Start game immediately, images load during play

### Thought 7-9: Non-Deterministic Generation Quality

**Challenge**: AI generation varies, need consistent 80-90/100 quality

**Solution: Validation + Retry Loop**:
```typescript
async function generateCaseWithQuality(
  options: GenerateCaseOptions,
  targetQuality: number = 80
): Promise<GeneratedCase> {
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    // Generate case
    const case = await generateCase(options);

    // Validate
    const validation = validationService.validateCase(case);

    if (validation.qualityScore >= targetQuality && validation.isValid) {
      console.log(`✅ Quality target met: ${validation.qualityScore}/100`);
      return case;
    }

    console.log(`⚠️  Quality below target: ${validation.qualityScore}/100 (attempt ${attempt + 1})`);

    if (attempt < maxRetries) {
      console.log('Retrying with adjusted parameters...');
      // Adjust generation parameters based on validation feedback
    }
  }

  throw new Error('Failed to generate case meeting quality target after retries');
}
```

**Quality Metrics**:
```typescript
interface QualityBreakdown {
  evidenceCount: number;        // 10 points
  locationCount: number;        // 15 points
  hotspotQuality: number;       // 10 points
  evidenceBalance: number;      // 15 points
  criticalEvidence: number;     // 20 points
  evidenceTypes: number;        // 10 points
  characterDepth: number;       // 10 points
  warningPenalty: number;       // -2 per warning
  total: number;                // Target: 80-90
}
```

### Thought 10-12: Ghibli Style Requirements

**Style Analysis**:
- **Base**: Studio Ghibli animation background art
- **Adaptation**: Dark/mysterious mood (not typical bright Ghibli)
- **Technical**: Hand-painted watercolor aesthetic, atmospheric depth
- **Mood**: Warm but unsettling, beautiful but eerie

**Prompt Structure**:
```typescript
function buildGhibliImagePrompt(location: ExplorableLocation): string {
  return `
Create a Studio Ghibli-inspired background illustration of ${location.name}.

STYLE REQUIREMENTS:
- Studio Ghibli animation background art aesthetic
- Hand-painted watercolor quality with visible brush strokes
- Dark mystery atmosphere (desaturated colors, moody lighting)
- Warm color palette but muted (browns, soft greens, dusty yellows)
- Strong directional lighting creating atmospheric shadows
- Volumetric effects: subtle fog, dust motes in light beams
- High detail in focal areas, softer in periphery

COMPOSITION:
- Wide establishing shot showing the full location
- Clear focal point: ${location.props[0]}
- Depth through atmospheric layering
- Organic shapes, avoid harsh geometric lines
- Empty space to create mood and tension

MOOD:
- Mysterious and slightly unsettling
- Beautiful but abandoned feeling
- Sense of recent activity/disturbance
- Quiet, contemplative atmosphere

SCENE DESCRIPTION:
${location.description}

ATMOSPHERE:
${location.atmosphere}

KEY PROPS TO INCLUDE:
${location.props.join(', ')}

TECHNICAL SPECS:
- Aspect ratio: 16:9 landscape
- Perspective: Eye-level, slightly wide angle
- Time of day: ${inferTimeFromAtmosphere(location.atmosphere)}
- Weather: ${inferWeatherFromAtmosphere(location.atmosphere)}

Remember: This is a crime scene in a murder mystery. Balance beauty with unease.
`;
}
```

### Thought 13-15: Data Model Expansion

**New Types Required**:
```typescript
// ExplorableLocation with hotspots
interface ExplorableLocation {
  id: string;
  caseId: string;
  name: string;
  description: string;
  atmosphere: string;
  props: string[];
  hotspots: Hotspot[];              // NEW
  isMainCrimeScene: boolean;        // NEW
  connectedLocationIds: string[];   // NEW
  imageUrl?: string;
}

// Hotspot for evidence discovery
interface Hotspot {
  id: string;
  x: number;                        // 0-100 (percent)
  y: number;                        // 0-100 (percent)
  type: 'evidence' | 'clue' | 'interactive';
  linkedEntityId?: string;          // evidenceId or clueId
  discoverable: boolean;
  description: string;
}

// Enhanced Evidence
interface Evidence {
  id: string;
  caseId: string;
  name: string;
  description: string;
  foundAt: string;                  // locationId - NEW
  type: EvidenceType;
  relevance: EvidenceRelevance;
  linkedSuspects: string[];
  isKeyEvidence: boolean;
  imageUrl?: string;
}

// Player exploration state
interface PlayerState {
  userId: string;
  caseId: string;
  visitedLocationIds: string[];         // NEW
  collectedEvidenceIds: string[];       // NEW
  exploredHotspotIds: string[];         // NEW
  currentPhase: GamePhase;
  progress: PlayerProgress;
}
```

**Backward Compatibility Strategy**:
```typescript
// Version existing cases
interface GeneratedCase {
  version: number;  // NEW: 1 = old format, 2 = new format
  // ... rest of case data
}

// Migration helper
function migrateCaseToV2(oldCase: GeneratedCaseV1): GeneratedCaseV2 {
  return {
    ...oldCase,
    version: 2,
    explorableLocations: [
      // Create default location from old location field
      {
        id: `location-${randomUUID()}`,
        caseId: oldCase.caseId,
        name: oldCase.location.name,
        description: oldCase.location.description,
        atmosphere: oldCase.location.atmosphere,
        props: oldCase.location.props,
        hotspots: [],
        isMainCrimeScene: true,
        connectedLocationIds: [],
        imageUrl: oldCase.imageUrl
      }
    ],
    evidence: oldCase.evidence.map(e => ({
      ...e,
      foundAt: 'location-default'  // All evidence at main location
    }))
  };
}
```

### Thought 16-18: Implementation Phases

**Phase 1: Core Mechanics (Text-Only)** [5-7 days]
- ✅ Create type definitions
- ✅ Implement LocationGeneratorService
- ✅ Implement EvidenceGeneratorService
- ✅ Implement ValidationService
- ⏳ Update CaseGeneratorService
- ⏳ Update CaseRepository
- ⏳ Create API endpoints
- ⏳ Create React components
- ⏳ Implement state management
- ⏳ Test end-to-end flow

**Phase 2: Visual Polish** [3-5 days]
- Fix Vercel image proxy
- Implement background image generation
- Add progressive loading UI
- Create placeholder system
- Test image generation quality

**Phase 3: Quality & Features** [2-3 days]
- Hint system
- Evidence board enhancements
- Animation/transitions
- Accessibility improvements
- Performance optimization

**Critical Path**:
```
Phase 1 (blocking): Text-based exploration must work perfectly
  → Phase 2 (enhancement): Images improve experience
    → Phase 3 (polish): Additional features and refinement
```

**Estimated Total Time**:
- Development: 10-15 days
- Testing: 2-3 days
- Deployment/monitoring: 1-2 days
- **Total: 13-20 days (~3-4 weeks)**

---

## Key Findings & Recommendations

### Critical Success Factors

1. **Quality Consistency** (Priority: Critical)
   - Implement robust validation system
   - Use retry logic with quality checks
   - Target 80-90/100 score consistently
   - Monitor and log quality metrics

2. **Image Generation Reliability** (Priority: High)
   - Fix existing Vercel proxy infrastructure
   - Implement fallback to placeholders
   - Add retry logic with exponential backoff
   - Use background async generation

3. **User Experience** (Priority: High)
   - Game must work without images (progressive enhancement)
   - Clear feedback on loading states
   - Smooth transitions between phases
   - Intuitive exploration mechanics

4. **Performance** (Priority: Medium)
   - Parallel AI generation where possible
   - Client-side caching
   - Optimistic UI updates
   - Efficient storage operations

### Technical Recommendations

**Architecture**:
- ✅ Use service layer pattern (LocationGenerator, EvidenceGenerator, Validation)
- ✅ Implement storage abstraction (DevvitStorageAdapter)
- ✅ Use Context API for state management (not Redux - overkill)
- ✅ Create compound components for complex UI

**AI Generation**:
- ✅ Temperature 0.8 for creative generation (locations, evidence)
- ✅ Structured prompts with examples (few-shot learning)
- ✅ Robust JSON parsing with validation (Zod)
- ✅ Retry logic with quality checks

**Image Generation**:
- ✅ Background async generation (non-blocking)
- ✅ Progressive loading (placeholder → real image)
- ✅ Batch generation (5 at a time for efficiency)
- ✅ Fallback system (always functional without images)

**Storage**:
- ✅ Namespaced keys (`case:${id}:locations:${locId}`)
- ✅ Separate storage for locations/evidence (not mega-object)
- ✅ Batch operations for efficiency
- ✅ Version field for backward compatibility

### Risk Mitigation Strategies

**High Risk: Image Generation Failure**
- Mitigation: Placeholder system, game works without images
- Fallback: Text-only mode with rich descriptions
- Monitoring: Log all image generation attempts

**Medium Risk: AI Quality Variance**
- Mitigation: Validation service with retry logic
- Fallback: Manual review for low-quality cases
- Monitoring: Quality score distribution analytics

**Medium Risk: Storage Schema Changes**
- Mitigation: Versioned schema, migration helpers
- Fallback: Serve old cases in legacy format
- Testing: Comprehensive backward compatibility tests

**Low Risk: Performance Degradation**
- Mitigation: Parallel operations, caching, optimization
- Monitoring: Response time tracking
- Optimization: Lazy loading, code splitting

### Cost Analysis

**Per Case**:
- Text generation: ~$0.001
- Image generation: ~$0.67 (19 images × $0.035)
- **Total: ~$0.67 per case**

**Production Estimate** (50 cases/month):
- Monthly cost: ~$33.50
- Yearly cost: ~$402

**Optimization Opportunities**:
- Cache/reuse generic elements (reduce image count)
- Quality tiers (lower res for thumbnails)
- Pre-generation during off-peak hours

### Development Timeline

**Phase 1: Core Implementation** (Current)
- [x] Type system (case.ts) - COMPLETED
- [x] LocationGeneratorService - COMPLETED
- [x] EvidenceGeneratorService - COMPLETED
- [x] ValidationService - COMPLETED
- [ ] CaseGeneratorService integration - IN PROGRESS
- [ ] API endpoints - PENDING
- [ ] Frontend components - PENDING
- [ ] State management - PENDING
- Estimated: 5-7 days remaining

**Phase 2: Visual Implementation**
- [ ] Fix Vercel image proxy
- [ ] Background image generation
- [ ] Progressive loading UI
- [ ] Image quality testing
- Estimated: 3-5 days

**Phase 3: Polish & Features**
- [ ] Hint system
- [ ] Evidence board enhancements
- [ ] Accessibility improvements
- [ ] Performance optimization
- Estimated: 2-3 days

**Total Estimate**: 13-20 days (3-4 weeks)

### Next Steps

**Immediate** (Next Session):
1. Complete CaseGeneratorService integration
2. Update CaseRepository storage schema
3. Create API endpoints for locations/evidence
4. Test backend pipeline end-to-end

**Short Term** (This Week):
1. Create GameContext for state management
2. Build LocationExplorer component
3. Build EvidencePanel component
4. Integrate with existing App.tsx

**Medium Term** (Next Week):
1. Fix Vercel image generation proxy
2. Implement background image generation
3. Add progressive loading UI
4. Test image generation quality

**Long Term** (Following Week):
1. Add hint system
2. Enhance evidence board
3. Add animations/transitions
4. Accessibility audit
5. Performance optimization
6. Deployment and monitoring

---

## Conclusion

This research provides a comprehensive foundation for implementing the location exploration and evidence system. The feature is technically feasible with the existing stack, with a clear implementation path and manageable risks.

**Key Takeaways**:
1. Use phased approach: Text-only MVP → Visual polish → Additional features
2. Quality consistency through validation and retry logic
3. Progressive enhancement (game works without images)
4. Follow existing patterns (service layer, storage abstraction, Context API)
5. Estimate 3-4 weeks for complete implementation

**Quality Target**: 80-90/100 achievable through:
- Comprehensive validation system
- Retry logic for low-quality generations
- Detailed prompts with examples
- Quality monitoring and logging

**User Experience Target**: "와 진짜 재밌다!" achievable through:
- Immersive Ghibli-style visuals
- Satisfying exploration mechanics
- Fair and solvable mysteries
- Smooth, polished interactions

This document captures all research and analysis from the planning phase and serves as the specification for implementation.