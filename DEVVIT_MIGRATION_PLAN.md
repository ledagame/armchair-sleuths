# Devvit Blocks Migration Plan

**Project:** Armchair Sleuths - React to Devvit Blocks Migration
**Date:** 2025-10-24
**Approach:** Pure Devvit Blocks (Path A)

---

## Architecture Overview

### Current Stack (React)
- **Frontend:** React 18 + Vite
- **Backend:** Express API server
- **State:** React hooks + localStorage
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Components:** 55+ React components

### Target Stack (Devvit)
- **Frontend:** Devvit Blocks (JSX-like syntax)
- **Backend:** Devvit built-in features
- **State:** Devvit `useState` + Redis KV
- **Styling:** Devvit props (padding, gap, alignment, etc.)
- **Animation:** Not supported (remove Framer Motion)
- **Components:** Native Devvit blocks (vstack, hstack, text, button, etc.)

---

## Migration Phases

### Phase 1: Core Infrastructure (P0) - CURRENT
**Objective:** Establish Devvit Custom Post Type foundation

**Components:**
1. ✅ Main Devvit wrapper (`src/main.ts` extension)
2. ⏳ Loading screen
3. ⏳ Case Overview screen
4. ⏳ Screen navigation state management

**Blockers:**
- None

**Decisions:**
- Use Redis KV for all persistent state (replace localStorage)
- Convert Tailwind classes to Devvit props
- Remove all animations (not supported)
- Keep game logic intact

---

### Phase 2: Investigation UI (P1)
**Objective:** Core gameplay screens

**Components:**
1. InvestigationScreen wrapper
2. LocationExplorerSection
3. SuspectInterrogationSection
4. EvidenceNotebookSection
5. Tab navigation

**Backend Integration:**
- Evidence discovery → Redis KV
- Suspect chat → Gemini API via Devvit HTTP
- Player state → Redis KV

---

### Phase 3: Submission & Results (P2)
**Objective:** Complete the game loop

**Components:**
1. SubmissionForm
2. ResultView
3. Scoring system integration

**Backend Integration:**
- Answer submission → Redis KV
- Scoring calculation → Devvit scheduler job
- Leaderboard → Redis sorted sets

---

### Phase 4: Intro & Polish (P3)
**Objective:** User experience enhancements

**Components:**
1. ThreeSlideIntro
2. CinematicIntro (legacy support)
3. Gamification features
4. Achievement toasts
5. Milestone celebrations

**Backend Integration:**
- Intro slides → Redis KV
- Gamification state → Redis KV

---

## Key Technical Decisions

### 1. State Management
**React Approach:**
```typescript
const [currentScreen, setCurrentScreen] = useState<GameScreen>('loading');
const storedUserId = localStorage.getItem('userId');
```

**Devvit Approach:**
```typescript
const [currentScreen, setCurrentScreen] = useState('loading');
const userId = await context.redis.get('userId');
```

### 2. Backend API Calls
**React Approach:**
```typescript
const response = await fetch('/api/case');
const data = await response.json();
```

**Devvit Approach:**
```typescript
const caseData = await context.redis.get('case:current');
```

### 3. Styling
**React Approach:**
```tsx
<div className="bg-noir-deepBlack text-detective-gold px-4 py-6">
  <h1 className="text-3xl font-bold">Title</h1>
</div>
```

**Devvit Approach:**
```tsx
<vstack padding="medium" gap="small" backgroundColor="#0a0a0a">
  <text size="xxlarge" weight="bold" color="#d4af37">Title</text>
</vstack>
```

### 4. Animations
**React Approach:**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

**Devvit Approach:**
```tsx
{/* Animations not supported - remove */}
<vstack>
  Content
</vstack>
```

---

## Component Priority Matrix

### P0 (Critical - Start Here)
- [x] Devvit configuration (already in src/main.ts)
- [ ] App wrapper (Custom Post Type)
- [ ] Loading screen
- [ ] Case Overview screen
- [ ] Screen navigation

### P1 (High Priority)
- [ ] InvestigationScreen
- [ ] LocationExplorerSection
- [ ] SuspectInterrogationSection
- [ ] EvidenceNotebookSection
- [ ] Tab navigation system

### P2 (Medium Priority)
- [ ] SubmissionForm
- [ ] ResultView
- [ ] Scoring integration
- [ ] Leaderboard display

### P3 (Polish)
- [ ] ThreeSlideIntro
- [ ] Gamification UI
- [ ] Achievement toasts
- [ ] Milestone celebrations
- [ ] Fun facts carousel

---

## Backend Endpoints Migration

### Current Express API Endpoints
```
GET  /api/case                        → Fetch current case
GET  /api/player-state/:caseId/:userId → Fetch player state
POST /api/evidence/discover            → Discover evidence
POST /api/suspect/chat                 → Chat with suspect
POST /api/submission                   → Submit answers
```

### Devvit Redis Schema
```
case:current                          → JSON of current case data
playerState:{userId}:{caseId}         → JSON of player state
evidence:{caseId}:{evidenceId}        → JSON of evidence details
chat:{caseId}:{userId}:{suspectId}    → JSON array of messages
submission:{userId}:{caseId}          → JSON of submitted answer
leaderboard:{caseId}                  → Sorted set (score → userId)
```

---

## Design System Mapping

### Color Palette
| Tailwind Class | Hex Code | Devvit Usage |
|----------------|----------|--------------|
| `bg-noir-deepBlack` | `#0a0a0a` | `backgroundColor="#0a0a0a"` |
| `text-detective-gold` | `#d4af37` | `color="#d4af37"` |
| `text-detective-brass` | `#b8860b` | `color="#b8860b"` |
| `text-evidence-blood` | `#8b0000` | `color="#8b0000"` |
| `border-noir-fog` | `#4a4a4a` | Not supported (use spacers) |

### Typography
| Tailwind Class | Devvit Prop |
|----------------|-------------|
| `text-3xl` | `size="xxlarge"` |
| `text-2xl` | `size="xlarge"` |
| `text-xl` | `size="large"` |
| `text-lg` | `size="medium"` |
| `text-base` | `size="medium"` |
| `text-sm` | `size="small"` |
| `font-bold` | `weight="bold"` |
| `font-semibold` | `weight="bold"` (no semibold) |

### Spacing
| Tailwind Class | Devvit Prop |
|----------------|-------------|
| `p-8` | `padding="large"` |
| `p-6` | `padding="medium"` |
| `p-4` | `padding="small"` |
| `gap-6` | `gap="large"` |
| `gap-4` | `gap="medium"` |
| `gap-2` | `gap="small"` |

---

## Testing Strategy

### Unit Testing (Component-by-Component)
1. Create component in isolation
2. Test with mock data
3. Verify state management
4. Ensure Redis integration works

### Integration Testing
1. Test screen navigation flow
2. Test Redis data persistence
3. Test Gemini API integration
4. Test scheduler jobs

### Mobile Testing
1. Test on 375px viewport (iPhone SE)
2. Test on 414px viewport (iPhone Pro Max)
3. Test in Reddit mobile app webview
4. Test touch interactions (44px minimum targets)

---

## Migration Risks & Mitigations

### Risk 1: Devvit Blocks Limitations
**Risk:** Devvit Blocks may not support complex UI patterns
**Mitigation:** Simplify UI, use native Devvit patterns

### Risk 2: Animation Removal Impact
**Risk:** User experience may feel less polished without animations
**Mitigation:** Use Devvit's built-in transitions where available

### Risk 3: Redis Performance
**Risk:** Redis KV may have latency issues
**Mitigation:** Implement caching, optimize data structures

### Risk 4: Gemini API Integration
**Risk:** HTTP API calls may be restricted in Devvit
**Mitigation:** Use Devvit's HTTP client, implement retry logic

---

## Success Criteria

### Phase 1 (P0) Complete When:
- [x] Devvit Custom Post Type renders successfully
- [ ] Loading screen displays case generation status
- [ ] Case Overview screen shows victim, weapon, location, suspects
- [ ] Screen navigation works (loading → case overview → investigation)
- [ ] User ID is stored in Redis

### Phase 2 (P1) Complete When:
- [ ] Investigation screen with 3 tabs (locations, suspects, evidence)
- [ ] Location exploration discovers evidence
- [ ] Suspect interrogation works with Gemini AI
- [ ] Evidence notebook displays discovered items
- [ ] Action points system functional

### Phase 3 (P2) Complete When:
- [ ] Submission form accepts 5W1H answers
- [ ] Scoring system evaluates answers
- [ ] Results screen displays score breakdown
- [ ] Leaderboard shows rankings

### Phase 4 (P3) Complete When:
- [ ] 3-slide intro system works
- [ ] Gamification features display
- [ ] All polish features implemented
- [ ] Mobile UX optimized (375px-414px)

---

## Next Steps

1. ✅ Create migration plan
2. ⏳ Implement P0: App wrapper with Custom Post Type
3. ⏳ Implement P0: Loading screen
4. ⏳ Implement P0: Case Overview screen
5. ⏳ Test P0 components in Reddit playtest
6. Move to P1 after P0 validation

---

## Notes

- **No Magic MCP needed:** Migration is straightforward, manual implementation is cleaner
- **Component-by-component approach:** Test each component before moving to next
- **Preserve backend logic:** Keep all game logic, only change UI layer
- **Mobile-first:** Start with 375px viewport, scale up
- **Redis-first:** Use Redis KV for all state, avoid in-memory state
