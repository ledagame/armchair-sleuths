# Mobile-First UI/UX Implementation Status
**Armchair Sleuths Detective Game**

**Version**: 1.0
**Last Updated**: 2025-10-24
**Implementation Team**: Frontend-Architect Skill (Luna + Marcus + Aria)

---

## 📊 Implementation Summary

### ✅ **COMPLETED** (Phase 1 + Partial Phase 2)

#### Phase 1: Design System Foundation (100% Complete)

1. **tailwind.config.js** - Complete Noir Detective Design System
   - ✅ Noir color palette (deepBlack, charcoal, gunmetal, smoke, fog)
   - ✅ Detective accents (gold #c9b037, brass #b5a642, amber #d4af37)
   - ✅ Evidence colors (blood #8b0000, poison #4b0082, clue #1e90ff)
   - ✅ Text colors (primary #e0e0e0, secondary #a0a0a0, muted #707070)
   - ✅ Typography system (Playfair Display, Inter, JetBrains Mono)
   - ✅ Mobile-first breakpoints (sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px)
   - ✅ Component classes (btn-primary, card, input, badge, skeleton)
   - ✅ Animation keyframes (fadeIn, slideUp, scalePop)
   - ✅ Box shadows with glow effects
   - ✅ Z-index scale (0-999)

2. **src/client/index.css** - Enhanced Base Styles
   - ✅ Google Fonts imports (Playfair Display, Inter, JetBrains Mono)
   - ✅ CSS custom properties (design tokens)
   - ✅ Mobile-optimized base styles (16px font size to prevent iOS zoom)
   - ✅ Accessibility features (focus-visible, reduced-motion support)
   - ✅ Touch-friendly interactive elements (44px minimum)
   - ✅ Scrollbar styling (noir theme)
   - ✅ Selection styling (detective gold)
   - ✅ Utility classes (noir-gradient, detective-gradient, text-glow)
   - ✅ iOS Safari compatibility (safe-area-inset-bottom)

3. **Data Flow Bugs Fixed**
   - ✅ `src/client/hooks/useCase.ts` - Now properly includes `locations`, `evidence`, `evidenceDistribution`, `cinematicImages` fields
   - ✅ Action Points logic verified (no multiplication bug exists)

#### Phase 2: Component Refactoring (20% Complete)

4. **CaseOverview.tsx** - Fully Refactored (src/client/components/case/CaseOverview.tsx)
   - ✅ Noir design system (all hard-coded colors replaced with tokens)
   - ✅ Mobile-first responsive layout
     - Base (320px): 1 column grid
     - sm (640px): 2 column grid
     - lg (1024px): 3 column grid for suspects
   - ✅ Progressive spacing (px-4 py-8 → sm:px-6 sm:py-12 → lg:px-8 lg:py-16)
   - ✅ Touch targets ≥48px (exceeds 44px requirement)
   - ✅ Typography system (font-display for headers, responsive text sizes)
   - ✅ Framer Motion animations (stagger effect on mount)
   - ✅ Accessibility (ARIA labels, role attributes, focus management)
   - ✅ Hover states (border color transitions, shadow effects)
   - ✅ Semantic color theming:
     - Victim card: evidence-blood
     - Weapon card: detective-brass
     - Location card: evidence-clue
     - Mission card: detective-gold with glow

---

## 🚧 **REMAINING WORK** (80%)

### Phase 2: Component Refactoring (Remaining)

#### Priority 1: Main Game Screens (Critical Path)

**5. App.tsx - Loading Screen** (src/client/App.tsx:113-161)
- ❌ Replace hard-coded colors (bg-gray-950, text-red-400, bg-blue-600, etc.)
- ❌ Apply noir design system
- ❌ Mobile-first responsive layout
- ❌ Touch-friendly buttons (min 44px)
- ❌ Loading spinner with detective theme
- ❌ Error state with noir styling

**Implementation Guide**:
```tsx
// Loading state
<div className="flex flex-col items-center justify-center min-h-screen bg-noir-deepBlack text-text-primary">
  {caseLoading && (
    <>
      <div className="spinner w-16 h-16 mb-4" />
      <p className="text-xl sm:text-2xl font-display font-bold text-detective-gold">
        {generating ? '🎲 새로운 사건을 생성하는 중...' : '사건 파일을 불러오는 중...'}
      </p>
      <p className="text-sm sm:text-base text-text-secondary mt-2">
        {generating ? 'AI가 오늘의 미스터리를 만들고 있습니다 (30-60초 소요)' : '오늘의 미스터리를 준비하고 있습니다'}
      </p>
    </>
  )}

  {/* Error state */}
  {caseError && (
    <>
      <div className="text-6xl mb-4">❌</div>
      <p className="text-xl sm:text-2xl font-display font-bold text-evidence-blood">사건 파일을 불러올 수 없습니다</p>
      <p className="text-sm sm:text-base text-text-secondary mt-2">{caseError}</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <button className="btn-primary min-h-[48px]">🎲 새 케이스 생성</button>
        <button className="btn-secondary min-h-[48px]">다시 시도</button>
      </div>
    </>
  )}
</div>
```

**6. InvestigationScreen.tsx** (src/client/components/InvestigationScreen.tsx) **[CRITICAL]**
- ❌ Replace hard-coded colors (bg-gray-900, bg-gray-800, text-detective-gold exists but needs verification)
- ❌ Tab navigation mobile optimization (bottom tab bar for thumb reach)
- ❌ Responsive tab layout (stacked mobile → inline tablet)
- ❌ Touch targets for tabs (min 44px height)
- ❌ Sticky header optimization for mobile
- ❌ Verify all sub-components use design system

**Current Status**: Partially uses design tokens (text-detective-gold), but needs complete audit.

**Implementation Notes**:
- Tab bar should use `min-h-[48px]` for touch targets
- Mobile: Full-width tabs with icons + labels
- Tablet+: Inline tabs with better spacing
- Active tab indicator with detective-gold
- Verify LocationExplorerSection, SuspectInterrogationSection, EvidenceNotebookSection all use design tokens

**7. SubmissionForm.tsx** (src/client/components/submission/SubmissionForm.tsx)
- ❌ Replace hard-coded colors
- ❌ Form input mobile optimization:
  - Font size ≥16px (prevent iOS zoom)
  - inputmode attributes
  - autocomplete attributes
  - Virtual keyboard handling
- ❌ Touch-friendly submit button (min 44px)
- ❌ Responsive form layout
- ❌ Error state styling with noir theme

**Mobile Form Optimization Template**:
```tsx
<input
  type="text"
  className="input text-base"  // Force 16px minimum
  inputMode="text"
  autoComplete="name"
  placeholder="용의자 이름"
  aria-label="용의자 선택"
/>

<textarea
  className="textarea text-base min-h-[120px] sm:min-h-[160px]"
  inputMode="text"
  placeholder="추리를 작성하세요..."
  aria-label="추리 작성"
/>

<button type="submit" className="btn-primary w-full min-h-[52px] sm:min-h-[56px]">
  📝 답안 제출
</button>
```

**8. ResultView.tsx** (src/client/components/results/ResultView.tsx)
- ❌ Replace hard-coded colors
- ❌ Score display with detective theme
- ❌ Leaderboard responsive layout
- ❌ Badge/rank styling with noir palette
- ❌ Celebration animations (Framer Motion)
- ❌ Touch-friendly "New Game" button

#### Priority 2: Intro Screens

**9. CinematicIntro.tsx** (src/client/components/intro/cinematic/CinematicIntro.tsx)
- ❌ Replace hard-coded colors
- ❌ Typing effect with detective gold text
- ❌ Background noir gradient
- ❌ Skip button with proper touch target
- ❌ Mobile-optimized typography

**10. ThreeSlideIntro.tsx** (src/client/components/intro/ThreeSlideIntro.tsx)
- ❌ Replace hard-coded colors
- ❌ Slide navigation mobile-friendly
- ❌ Swipe gestures for mobile (Framer Motion drag)
- ❌ Progress indicator with detective gold
- ❌ Touch-friendly navigation buttons

#### Priority 3: Sub-Components (Many files)

**Investigation Components**:
- ❌ LocationExplorerSection.tsx
- ❌ LocationCard.tsx
- ❌ SuspectInterrogationSection.tsx
- ❌ SuspectPanel.tsx
- ❌ EvidenceNotebookSection.tsx
- ❌ EvidenceCard.tsx
- ❌ EvidenceDiscoveryModal.tsx
- ❌ ChatInterface.tsx

**Common Components**:
- ❌ APHeader.tsx (Action Points display)
- ❌ APAcquisitionToast.tsx
- ❌ AchievementToast.tsx
- ❌ MilestoneCelebration.tsx
- ❌ SkeletonLoader.tsx
- ❌ LoadingSkeleton.tsx
- ❌ EmptyState.tsx
- ❌ ErrorBoundary.tsx

### Phase 3: Form Input Mobile Optimization

**All Forms Need**:
- ❌ 16px minimum font size (`text-base` class)
- ❌ `inputMode` attributes (text, email, tel, numeric)
- ❌ `autoComplete` attributes
- ❌ Virtual keyboard overlap handling
- ❌ Focus scroll-into-view
- ❌ Proper label associations
- ❌ Error message styling with noir theme

**Files to Update**:
- SubmissionForm.tsx (5W1H inputs)
- ChatInterface.tsx (suspect interrogation)
- Any other text inputs

### Phase 4: Animation & Polish

**Animations to Add**:
- ❌ Screen transitions (App.tsx state changes)
- ❌ Card entrance animations (all list items)
- ❌ Hover lift effects (interactive cards)
- ❌ Button press feedback (scale animations)
- ❌ Loading skeletons (pulse animation)
- ❌ Modal enter/exit (AnimatePresence)

**Use Framer Motion Patterns**:
```tsx
// Stagger children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    />
  ))}
</motion.div>

// Hover effect
<motion.div
  whileHover={{ y: -4, scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
/>
```

### Phase 5: Accessibility Compliance

**WCAG 2.1 AA Checklist**:
- ❌ ARIA labels on all interactive elements
- ❌ Keyboard navigation (Tab, Enter, Escape)
- ❌ Focus management in modals (focus trap)
- ❌ Focus indicators visible (already in design system)
- ❌ Color contrast verification (design system is compliant, verify usage)
- ❌ Screen reader testing
- ❌ Semantic HTML (heading hierarchy, landmark regions)

**Focus Trap Example** (for modals):
```tsx
import { useEffect, useRef } from 'react';

function Modal({ isOpen, onClose }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus first element on open
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button ref={closeButtonRef} onClick={onClose} aria-label="닫기">
        ✕
      </button>
    </div>
  );
}
```

---

## 🎯 Implementation Strategy

### Quick Win Approach (Prioritized)

**Week 1 Focus** (Highest Visual Impact):
1. ✅ CaseOverview.tsx (DONE)
2. App.tsx Loading screen (1-2 hours)
3. InvestigationScreen.tsx main container (2-3 hours)
4. SubmissionForm.tsx (2-3 hours)
5. ResultView.tsx (2-3 hours)

**Week 2 Focus** (Core Gameplay Components):
6. LocationExplorerSection + LocationCard
7. SuspectInterrogationSection + SuspectPanel
8. EvidenceNotebookSection + EvidenceCard
9. ChatInterface.tsx
10. APHeader.tsx

**Week 3 Focus** (Polish + Accessibility):
11. All intro screens
12. Animation pass on all components
13. Accessibility audit and fixes
14. Mobile device testing (320px, 640px, 768px, 1024px)
15. Integration testing with backend

### Component Refactoring Template

For each component, follow this checklist:

```markdown
## Component: [ComponentName.tsx]

### 1. Design System Integration
- [ ] Replace all `bg-gray-*` with `bg-noir-*`
- [ ] Replace all `text-gray-*` with `text-text-*`
- [ ] Replace all `border-gray-*` with `border-noir-*`
- [ ] Replace accent colors with `detective-gold`, `detective-brass`, `detective-amber`
- [ ] Replace evidence colors with `evidence-blood`, `evidence-poison`, `evidence-clue`
- [ ] Use `font-display` for headers
- [ ] Use `font-body` for body text
- [ ] Use `font-mono` for technical text

### 2. Mobile-First Responsive
- [ ] Apply progressive spacing: `px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16`
- [ ] Use responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- [ ] Use responsive typography: `text-base sm:text-lg lg:text-xl`
- [ ] Ensure touch targets ≥44px: `min-h-[44px]` or `min-h-[48px]`
- [ ] Test on 320px viewport (smallest mobile)

### 3. Accessibility
- [ ] Add ARIA labels: `aria-label="..."` `aria-labelledby="..."`
- [ ] Add landmark roles: `role="article"` `role="region"` `role="navigation"`
- [ ] Ensure focus management: `ref` for first focusable element
- [ ] Add keyboard handlers: `onKeyDown` for Enter/Escape
- [ ] Verify heading hierarchy (h1 → h2 → h3)

### 4. Animations
- [ ] Add entrance animation: Framer Motion `variants`
- [ ] Add hover effects: `whileHover={{ ... }}`
- [ ] Add tap feedback: `whileTap={{ scale: 0.98 }}`
- [ ] Use consistent transitions: `transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}`

### 5. Performance
- [ ] Use `React.memo` if re-renders are expensive
- [ ] Use `loading="lazy"` on images
- [ ] Use `AnimatePresence` for unmount animations
- [ ] Verify no unnecessary re-renders
```

---

## 📝 Design System Quick Reference

### Colors (Tailwind Classes)

**Backgrounds**:
- `bg-noir-deepBlack` - Page background (#0a0a0a)
- `bg-noir-charcoal` - Card background (#1a1a1a)
- `bg-noir-gunmetal` - Elevated surface (#2a2a2a)
- `bg-noir-smoke` - Hover state (#3a3a3a)

**Text**:
- `text-text-primary` - Primary text (#e0e0e0)
- `text-text-secondary` - Secondary text (#a0a0a0)
- `text-text-muted` - Muted text (#707070)
- `text-detective-gold` - Accent headings (#c9b037)

**Borders**:
- `border-noir-fog` - Default border (#4a4a4a)
- `border-detective-gold` - Accent border (#c9b037)
- `border-evidence-blood` - Error/critical (#8b0000)

**Semantic Colors**:
- `detective-gold` - Primary accent (buttons, highlights)
- `detective-brass` - Secondary accent (tags)
- `detective-amber` - Hover states
- `evidence-blood` - Victim, errors
- `evidence-poison` - Mysterious elements
- `evidence-clue` - Information, discovery

### Typography (Tailwind Classes)

**Fonts**:
- `font-display` - Playfair Display (headers, dramatic text)
- `font-body` - Inter (body text, UI)
- `font-mono` - JetBrains Mono (evidence, technical)

**Sizes** (Responsive):
- `text-base sm:text-lg lg:text-xl` - Body text (16px → 18px → 20px)
- `text-2xl sm:text-3xl lg:text-4xl` - Headers (24px → 30px → 36px)

### Components (Tailwind Classes)

**Buttons**:
- `btn-primary` - Primary action (detective gold background)
- `btn-secondary` - Secondary action (outlined)
- `btn-ghost` - Subtle action (transparent)

**Cards**:
- `card` - Standard card (noir charcoal with border)
- `card-elevated` - Modal card (with glow effect)

**Inputs**:
- `input` - Text input (16px font, focus ring)
- `textarea` - Textarea (min-h-32, resizable)

**Badges**:
- `badge` - Standard badge (small label)
- `badge-detective` - Accent badge (gold theme)

**Loading**:
- `skeleton` - Skeleton loader (pulse animation)
- `spinner` - Loading spinner (gold rotating border)

### Responsive Breakpoints

```tsx
// Mobile-first approach
<div className="
  px-4 py-8          /* Base: 320px+ */
  sm:px-6 sm:py-12   /* Mobile landscape: 640px+ */
  md:px-6 md:py-12   /* Tablet: 768px+ */
  lg:px-8 lg:py-16   /* Desktop: 1024px+ */
  xl:px-8 xl:py-16   /* Large: 1280px+ */
">
```

### Touch Targets

**Minimum Sizes**:
- Buttons: `min-h-[48px]` or `min-h-[52px]`
- Icons: `w-11 h-11` (44px)
- Tabs: `px-6 py-4`

**Example**:
```tsx
<button className="
  px-6 py-3
  sm:px-8 sm:py-4
  min-h-[48px]
  sm:min-h-[56px]
">
  Touch Friendly
</button>
```

---

## 🧪 Testing Checklist

### Mobile Viewports

Test all screens at these breakpoints:

- [ ] **320px** - Smallest mobile (iPhone SE, old Android)
- [ ] **375px** - Standard mobile (iPhone 12/13/14)
- [ ] **414px** - Large mobile (iPhone Plus, Pro Max)
- [ ] **640px** - Mobile landscape, small tablets
- [ ] **768px** - Tablet portrait (iPad)
- [ ] **1024px** - Tablet landscape, small desktop
- [ ] **1280px** - Desktop
- [ ] **1920px** - Large desktop

### Browser Testing

- [ ] Chrome (Desktop + Mobile view)
- [ ] Firefox (Desktop + Responsive mode)
- [ ] Safari (Desktop + iOS Simulator)
- [ ] Safari iOS (Real device)
- [ ] Chrome Android (Real device or emulator)

### Accessibility Testing

- [ ] Keyboard navigation (Tab, Enter, Escape, Arrow keys)
- [ ] Screen reader (VoiceOver on macOS, NVDA on Windows)
- [ ] Focus indicators visible
- [ ] Color contrast (WCAG 2.1 AA: 4.5:1 for text)
- [ ] Touch target sizes (≥44x44px)
- [ ] Reduced motion respect (`prefers-reduced-motion`)

### Backend Integration

- [ ] Action Points system (acquire, spend, display)
- [ ] Evidence Discovery system (search, find, display)
- [ ] Suspect interrogation (chat, AP rewards)
- [ ] 2-stage image loading (progressive, lazy)
- [ ] Submission flow (form → API → results)
- [ ] Leaderboard display
- [ ] Error handling (network failures, validation)

---

## 📚 Reference Files

**Frontend-Architect Skill References**:
- `skills/frontend-architect/references/design-system.md` - Complete design tokens
- `skills/frontend-architect/references/responsive-breakpoints.md` - Mobile-first strategy
- `skills/frontend-architect/skill.md` - Luna + Marcus + Aria workflow

**Game Documentation**:
- `doc.md/완벽게임구현상태.md` - Complete game implementation status
- `doc.md/게임전체프로세스.md` - Full game process flow
- `FRONTEND_DATA_FLOW_ANALYSIS.md` - Data flow verification (bugs fixed)

**Design System Files**:
- `tailwind.config.js` - Complete Tailwind configuration
- `src/client/index.css` - Enhanced base styles and fonts

---

## 🚀 Next Steps

1. **Complete App.tsx Loading Screen** (Est: 1-2 hours)
   - Apply noir design system
   - Mobile-friendly error states
   - Touch-friendly buttons

2. **Complete InvestigationScreen.tsx** (Est: 2-3 hours)
   - Audit existing implementation
   - Optimize tab navigation for mobile
   - Ensure all sub-components use design tokens

3. **Complete Form Screens** (Est: 4-6 hours)
   - SubmissionForm.tsx with mobile input optimization
   - ResultView.tsx with celebration animations

4. **Component Audit Pass** (Est: 1 week)
   - All 50+ components audited for design system compliance
   - Mobile-first responsive layout verified
   - Accessibility compliance checked

5. **Final Integration Testing** (Est: 2-3 days)
   - Test all 6 screens on real mobile devices
   - Verify backend integration (AP, Evidence, Images)
   - Performance optimization
   - Accessibility audit

---

**Total Estimated Effort**: 3-4 weeks for complete implementation
**Completed**: 20% (Phase 1 + CaseOverview)
**Remaining**: 80% (4 main screens + 50+ sub-components)

**Status**: ✅ Foundation complete, ready for systematic component refactoring.
