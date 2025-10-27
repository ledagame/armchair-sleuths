# Devvit Implementation Roadmap
**Armchair Sleuths - Reddit Hackathon Priority Tasks**

**Version**: 1.0
**Date**: 2025-10-24
**Target**: 4-week implementation sprint

---

## 🎯 Success Metrics

### Hackathon Judging Criteria

**Delightful UX** (40 points):
- Immersive noir detective atmosphere
- Smooth screen transitions
- Satisfying interactions
- Personality in all states

**Polish** (35 points):
- Consistent design system
- No UI bugs
- Professional typography
- Thoughtful loading states

**Mobile-First** (25 points):
- Optimized for 375-414px
- Touch targets ≥48px
- Thumb-zone CTAs
- Responsive layouts

**Total**: 100 points

---

## 📅 4-Week Sprint Plan

### Week 1: Foundation + Core Screens (Must-Have)

**Goal**: Working prototype with essential flow

#### Day 1-2: Design System Setup
- [ ] Create color constants file
- [ ] Create typography helper functions
- [ ] Create component pattern library
- [ ] Test in Reddit mobile webview

**Deliverable**: `components/design-system.ts`

#### Day 3-4: Screen 1-3 (Loading → Intro → Overview)
- [ ] Loading screen with noir styling
- [ ] Three-slide intro with swipe
- [ ] Case overview with scrolling

**Deliverable**: Functional intro flow

#### Day 5-7: Screen 4 (Investigation - Part 1)
- [ ] Tab navigation structure
- [ ] Locations tab with cards
- [ ] AP counter display

**Deliverable**: Basic investigation UI

**Checkpoint**: Demo-able intro → investigation flow

---

### Week 2: Core Gameplay (Must-Have)

**Goal**: Complete investigation mechanics

#### Day 8-10: Investigation Tabs (Part 2)
- [ ] Suspects tab with cards
- [ ] Evidence tab with filtering
- [ ] Tab state persistence

**Deliverable**: Full investigation experience

#### Day 11-12: Submission Form
- [ ] Modal input pattern
- [ ] 5W1H form fields
- [ ] Validation logic

**Deliverable**: Working submission flow

#### Day 13-14: Results View
- [ ] Score display
- [ ] Breakdown cards
- [ ] Basic leaderboard

**Deliverable**: Complete game loop

**Checkpoint**: Full playthrough possible

---

### Week 3: Polish + States (Should-Have)

**Goal**: Professional quality

#### Day 15-16: Loading States
- [ ] Skeleton loaders for cards
- [ ] Loading spinners
- [ ] Progress indicators

**Deliverable**: No blank screens

#### Day 17-18: Empty States
- [ ] No evidence yet
- [ ] No suspects interviewed
- [ ] Empty search results

**Deliverable**: Helpful empty states

#### Day 19-20: Error States
- [ ] Network errors
- [ ] Insufficient AP
- [ ] Form validation errors

**Deliverable**: Error recovery

#### Day 21: Micro-interactions
- [ ] Button press feedback
- [ ] Card tap states
- [ ] Tab transitions

**Deliverable**: Delightful interactions

**Checkpoint**: Polished experience

---

### Week 4: Accessibility + Testing (Should-Have)

**Goal**: Hackathon-ready

#### Day 22-23: Accessibility
- [ ] Screen reader labels
- [ ] Keyboard navigation
- [ ] Focus management
- [ ] Color contrast audit

**Deliverable**: WCAG 2.1 AA compliant

#### Day 24-25: Mobile Testing
- [ ] iPhone 12/13/14 (375px)
- [ ] iPhone Pro Max (414px)
- [ ] Samsung Galaxy (360px)
- [ ] iPad Mini (768px)

**Deliverable**: Tested on real devices

#### Day 26-27: Integration Testing
- [ ] Backend API integration
- [ ] Image loading (2-stage)
- [ ] AP system
- [ ] Evidence discovery

**Deliverable**: E2E working

#### Day 28: Final Polish
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Demo preparation

**Deliverable**: Hackathon submission

---

## 🚨 Critical Path Tasks

These MUST be completed for hackathon:

### P0: Core Flow (Week 1-2)
1. ✅ Loading screen
2. ✅ Three-slide intro
3. ✅ Case overview
4. ✅ Investigation tabs
5. ✅ Submission form
6. ✅ Results view

### P1: Polish (Week 3)
7. ✅ Loading states
8. ✅ Empty states
9. ✅ Error states

### P2: Quality (Week 4)
10. ✅ Accessibility
11. ✅ Mobile testing
12. ✅ Integration testing

---

## 🎨 Design System Implementation

### Priority 1: Core Components (Day 1)

```typescript
// colors.ts
export const COLORS = {
  // Backgrounds
  BG_DEEP_BLACK: '#0a0a0a',
  BG_CHARCOAL: '#1a1a1a',
  BG_GUNMETAL: '#2a2a2a',
  BG_SMOKE: '#3a3a3a',
  BG_FOG: '#4a4a4a',

  // Detective Accents
  GOLD: '#c9b037',
  BRASS: '#b5a642',
  AMBER: '#d4af37',

  // Evidence
  BLOOD: '#8b0000',
  POISON: '#4b0082',
  CLUE: '#1e90ff',

  // Text
  TEXT_PRIMARY: '#e0e0e0',
  TEXT_SECONDARY: '#a0a0a0',
  TEXT_MUTED: '#707070',
};

// components/Card.ts
export const Card = (props: CardProps) => {
  return (
    <vstack
      backgroundColor={COLORS.BG_CHARCOAL}
      padding="medium"
      gap="small"
      cornerRadius="medium"
      border="thin"
      borderColor={COLORS.BG_FOG}
      {...props}
    >
      {props.children}
    </vstack>
  );
};

// components/PrimaryButton.ts
export const PrimaryButton = (props: ButtonProps) => {
  return (
    <button
      onPress={props.onPress}
      appearance="primary"
      size="large"
      minHeight={56}
      width="100%"
      disabled={props.disabled}
      accessibilityLabel={props.label}
    >
      <text size="medium" weight="bold" color={COLORS.BG_DEEP_BLACK}>
        {props.children}
      </text>
    </button>
  );
};

// components/SecondaryButton.ts
export const SecondaryButton = (props: ButtonProps) => {
  return (
    <button
      onPress={props.onPress}
      appearance="secondary"
      size="medium"
      minHeight={48}
      disabled={props.disabled}
      accessibilityLabel={props.label}
    >
      <text size="small" weight="bold" color={COLORS.GOLD}>
        {props.children}
      </text>
    </button>
  );
};
```

### Priority 2: Layout Components (Day 2)

```typescript
// components/ScreenContainer.ts
export const ScreenContainer = (props: ContainerProps) => {
  return (
    <vstack
      height="100%"
      backgroundColor={COLORS.BG_DEEP_BLACK}
      padding="medium"
      gap="medium"
    >
      {props.children}
    </vstack>
  );
};

// components/StickyHeader.ts
export const StickyHeader = (props: HeaderProps) => {
  return (
    <vstack
      backgroundColor={COLORS.BG_CHARCOAL}
      padding="medium"
      gap="small"
      border="bottom"
      borderColor={COLORS.BG_FOG}
    >
      <text size="large" weight="bold" color={COLORS.GOLD}>
        {props.title}
      </text>
      {props.subtitle && (
        <text size="xsmall" color={COLORS.TEXT_MUTED}>
          {props.subtitle}
        </text>
      )}
    </vstack>
  );
};

// components/ScrollableContent.ts
export const ScrollableContent = (props: ContentProps) => {
  return (
    <vstack grow padding="medium" gap="medium">
      {props.children}
    </vstack>
  );
};

// components/StickyFooter.ts
export const StickyFooter = (props: FooterProps) => {
  return (
    <vstack
      backgroundColor={COLORS.BG_CHARCOAL}
      padding="medium"
      border="top"
      borderColor={COLORS.BG_FOG}
    >
      {props.children}
    </vstack>
  );
};
```

---

## 🎯 Screen-by-Screen Tasks

### Screen 1: Loading (Priority: P0, Effort: 2 hours)

**Tasks**:
- [ ] Create `LoadingScreen.tsx`
- [ ] Add loading spinner (Devvit built-in)
- [ ] Add generating vs loading messages
- [ ] Add error state with retry button
- [ ] Test transitions

**Files**:
- `screens/LoadingScreen.tsx`

**Dependencies**: Design system

---

### Screen 2: Three-Slide Intro (Priority: P0, Effort: 6 hours)

**Tasks**:
- [ ] Create `IntroScreen.tsx` container
- [ ] Create `Slide1Discovery.tsx`
- [ ] Create `Slide2Suspects.tsx`
- [ ] Create `Slide3Challenge.tsx`
- [ ] Add swipe gesture handlers
- [ ] Add progress dots
- [ ] Add skip button
- [ ] Test navigation

**Files**:
- `screens/IntroScreen.tsx`
- `screens/intro/Slide1Discovery.tsx`
- `screens/intro/Slide2Suspects.tsx`
- `screens/intro/Slide3Challenge.tsx`

**Dependencies**: Design system, gesture handling

---

### Screen 3: Case Overview (Priority: P0, Effort: 4 hours)

**Tasks**:
- [ ] Create `CaseOverviewScreen.tsx`
- [ ] Add crime scene image with overlay
- [ ] Create victim card
- [ ] Create weapon card
- [ ] Create location card
- [ ] Create mission card
- [ ] Create suspects preview
- [ ] Add start button
- [ ] Test scrolling

**Files**:
- `screens/CaseOverviewScreen.tsx`
- `components/VictimCard.tsx`
- `components/WeaponCard.tsx`
- `components/LocationCard.tsx`

**Dependencies**: Design system, image loading

---

### Screen 4: Investigation (Priority: P0, Effort: 12 hours)

**Part A: Structure (4 hours)**:
- [ ] Create `InvestigationScreen.tsx`
- [ ] Add sticky header with AP counter
- [ ] Add tab navigation (3 tabs)
- [ ] Add sticky footer with submit button
- [ ] Test tab switching

**Part B: Locations Tab (3 hours)**:
- [ ] Create `LocationsTab.tsx`
- [ ] Add search method selector
- [ ] Create location card
- [ ] Add search button with AP cost
- [ ] Handle insufficient AP

**Part C: Suspects Tab (3 hours)**:
- [ ] Create `SuspectsTab.tsx`
- [ ] Create suspect card
- [ ] Add interrogate button
- [ ] Show conversation count
- [ ] Show AP rewards

**Part D: Evidence Tab (2 hours)**:
- [ ] Create `EvidenceTab.tsx`
- [ ] Add filter buttons
- [ ] Add progress display
- [ ] Create evidence card
- [ ] Add detail view button

**Files**:
- `screens/InvestigationScreen.tsx`
- `screens/investigation/LocationsTab.tsx`
- `screens/investigation/SuspectsTab.tsx`
- `screens/investigation/EvidenceTab.tsx`
- `components/LocationCard.tsx`
- `components/SuspectCard.tsx`
- `components/EvidenceCard.tsx`

**Dependencies**: Design system, backend API

---

### Screen 5: Submission Form (Priority: P0, Effort: 6 hours)

**Tasks**:
- [ ] Create `SubmissionScreen.tsx`
- [ ] Add WHO selector (buttons)
- [ ] Add WHAT input (modal)
- [ ] Add WHERE input (modal)
- [ ] Add WHEN input (modal)
- [ ] Add WHY input (modal)
- [ ] Add HOW input (modal)
- [ ] Add validation
- [ ] Add submit button
- [ ] Test modal flow

**Files**:
- `screens/SubmissionScreen.tsx`
- `components/InputModal.tsx`
- `utils/validation.ts`

**Dependencies**: Design system, Devvit modals

---

### Screen 6: Results View (Priority: P0, Effort: 4 hours)

**Tasks**:
- [ ] Create `ResultsScreen.tsx`
- [ ] Add celebration card (gold gradient)
- [ ] Add WHO breakdown
- [ ] Add WHAT breakdown
- [ ] Add WHERE breakdown
- [ ] Add WHEN breakdown
- [ ] Add WHY breakdown
- [ ] Add HOW breakdown
- [ ] Add statistics card
- [ ] Add leaderboard
- [ ] Add new game button

**Files**:
- `screens/ResultsScreen.tsx`
- `components/ScoreCard.tsx`
- `components/BreakdownCard.tsx`
- `components/LeaderboardEntry.tsx`

**Dependencies**: Design system, backend API

---

## 🎨 Polish Tasks (Week 3)

### Loading States (Priority: P1, Effort: 4 hours)

**Tasks**:
- [ ] Create skeleton loader for location cards
- [ ] Create skeleton loader for suspect cards
- [ ] Create skeleton loader for evidence cards
- [ ] Add loading spinners to buttons
- [ ] Add progress indicators for search

**Files**:
- `components/SkeletonCard.tsx`
- `components/LoadingSpinner.tsx`

---

### Empty States (Priority: P1, Effort: 3 hours)

**Tasks**:
- [ ] Create empty evidence state
- [ ] Create no suspects interviewed state
- [ ] Create empty search results state
- [ ] Add helpful CTAs

**Files**:
- `components/EmptyState.tsx`

---

### Error States (Priority: P1, Effort: 3 hours)

**Tasks**:
- [ ] Create network error component
- [ ] Create insufficient AP warning
- [ ] Create form validation errors
- [ ] Add retry buttons

**Files**:
- `components/ErrorState.tsx`
- `components/APWarning.tsx`

---

### Micro-interactions (Priority: P1, Effort: 2 hours)

**Tasks**:
- [ ] Add button press feedback (opacity)
- [ ] Add card tap states (background change)
- [ ] Add tab transition animation
- [ ] Add toast notifications

**Files**:
- `components/Toast.tsx`

---

## ♿ Accessibility Tasks (Week 4)

### Screen Reader Support (Priority: P2, Effort: 4 hours)

**Tasks**:
- [ ] Add accessibility labels to all buttons
- [ ] Add accessibility hints to complex interactions
- [ ] Add descriptions to all images
- [ ] Add regions to major sections
- [ ] Test with screen reader

**Files**: All component files

---

### Keyboard Navigation (Priority: P2, Effort: 2 hours)

**Tasks**:
- [ ] Add Enter key handler for buttons
- [ ] Add Escape key handler for modals
- [ ] Add Arrow key handler for tabs
- [ ] Test tab order

**Files**: All screen files

---

### Focus Management (Priority: P2, Effort: 2 hours)

**Tasks**:
- [ ] Focus first element on modal open
- [ ] Focus close button on modal open
- [ ] Return focus on modal close
- [ ] Test focus trap in modals

**Files**: Modal components

---

## 📱 Testing Tasks (Week 4)

### Mobile Device Testing (Priority: P2, Effort: 4 hours)

**Devices**:
- [ ] iPhone 12/13/14 (375x812)
- [ ] iPhone 14 Pro Max (414x896)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] iPad Mini (768x1024)

**Test Cases**:
- [ ] All screens render correctly
- [ ] Touch targets are tappable
- [ ] No horizontal scroll
- [ ] Images load properly
- [ ] Transitions are smooth

---

### Reddit App Integration (Priority: P2, Effort: 2 hours)

**Test Cases**:
- [ ] Safe area insets respected
- [ ] No overlap with Reddit chrome
- [ ] Back navigation works
- [ ] Deep linking works
- [ ] Share functionality works

---

### Performance Testing (Priority: P2, Effort: 2 hours)

**Metrics**:
- [ ] Initial load <2s
- [ ] Screen transitions <300ms
- [ ] Image loading <1s
- [ ] Form submission <3s
- [ ] No dropped frames

---

## 🚀 Launch Checklist

### Pre-Submission (Day 27-28)

**Visual Polish**:
- [ ] All colors use design system tokens
- [ ] Consistent spacing throughout
- [ ] Corner radius applied consistently
- [ ] Borders use semantic colors

**Touch Targets**:
- [ ] All buttons ≥48px
- [ ] Primary CTAs ≥56px
- [ ] Adequate spacing between elements

**Typography**:
- [ ] Heading hierarchy consistent
- [ ] Body text uses medium size
- [ ] Metadata uses small/xsmall

**States**:
- [ ] Loading states for all async actions
- [ ] Empty states with helpful CTAs
- [ ] Error states with recovery
- [ ] Disabled states clearly indicated

**Accessibility**:
- [ ] All images have descriptions
- [ ] All buttons have labels
- [ ] Touch targets ≥48px
- [ ] Color contrast WCAG AA

**Mobile**:
- [ ] Tested on 375px viewport
- [ ] No horizontal scroll
- [ ] Thumb-zone CTAs
- [ ] Forms work properly

### Submission Package

**Code**:
- [ ] Clean repository
- [ ] No console errors
- [ ] Commented complex logic
- [ ] README with setup instructions

**Demo**:
- [ ] Video walkthrough (2-3 min)
- [ ] Screenshots of all screens
- [ ] Highlights of delightful UX
- [ ] Mobile responsiveness demo

**Documentation**:
- [ ] Design system documentation
- [ ] User flow diagram
- [ ] Accessibility statement
- [ ] Performance metrics

---

## 🎯 Risk Mitigation

### High Risk Items

**Image Loading**:
- **Risk**: Slow 2-stage loading
- **Mitigation**: Optimize image sizes (<200KB), use CDN
- **Fallback**: Show placeholders, lazy load

**Reddit Webview**:
- **Risk**: Layout issues in Reddit app
- **Mitigation**: Test early and often in actual app
- **Fallback**: Add safe area padding

**Devvit Limitations**:
- **Risk**: Missing features (animations, fonts)
- **Mitigation**: Design within constraints
- **Fallback**: Use simpler alternatives

**Backend Integration**:
- **Risk**: API delays or failures
- **Mitigation**: Implement robust error handling
- **Fallback**: Show helpful error messages

---

## 📊 Progress Tracking

### Week 1 Checkpoint (Day 7)
- [ ] Intro flow working
- [ ] Investigation structure complete
- [ ] Demo-able prototype

### Week 2 Checkpoint (Day 14)
- [ ] Full game loop working
- [ ] All screens functional
- [ ] Backend integrated

### Week 3 Checkpoint (Day 21)
- [ ] Loading states complete
- [ ] Empty/error states complete
- [ ] Polish applied

### Week 4 Checkpoint (Day 28)
- [ ] Accessibility complete
- [ ] Testing complete
- [ ] Hackathon ready

---

## 🏆 Success Definition

**Minimum Viable Product (MVP)**:
- All 7 screens functional
- Basic noir styling
- Mobile-friendly layout
- Working game loop

**Hackathon Competitive**:
- Delightful UX (personality, smooth transitions)
- Polished design (consistent, professional)
- Mobile-first (thumb-zone, touch-friendly)

**Award-Winning**:
- Exceptional attention to detail
- Innovative UX patterns
- Flawless mobile experience
- WCAG 2.1 AA compliant

---

**Roadmap Complete** ✅

This 4-week plan balances ambition with feasibility, prioritizing hackathon criteria while maintaining quality!
