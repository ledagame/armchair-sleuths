# Evidence System UX Implementation Checklist
## Step-by-Step Development Guide

**Version:** 1.0
**Date:** 2025-10-23
**Estimated Duration:** 4 weeks (80 hours)

---

## Phase 1: Critical Fixes (Week 1, 20 hours)

### 1.1 Enhanced Empty State Component

**Priority:** Critical
**Files to Create:**
- `src/client/components/investigation/EvidenceEmptyState.tsx`

**Tasks:**
- [ ] Create EmptyState component with proper structure
  - [ ] Animated detective illustration (SVG or Lottie)
  - [ ] Heading: "🕵️ 증거 수집을 시작하세요"
  - [ ] Description with motivation text
  - [ ] Progress indicator (0/10 format)
  - [ ] Primary CTA button: "🗺️ 장소 탐색하기"
  - [ ] Secondary link: "💡 탐색 팁 보기"
  - [ ] Collapsible tips section (3 tips)

**Acceptance Criteria:**
- [ ] Empty state appears when no evidence exists
- [ ] CTA button switches to "장소 탐색" tab
- [ ] Animation runs smoothly (60fps)
- [ ] Responsive on mobile (single column)
- [ ] Keyboard accessible (Tab navigation works)
- [ ] Screen reader announces state properly

**Code Template:**
```typescript
// EvidenceEmptyState.tsx
import { motion } from 'framer-motion';

interface EvidenceEmptyStateProps {
  onNavigateToLocations: () => void;
  totalEvidence: number;
  discoveredCount: number;
}

export function EvidenceEmptyState({
  onNavigateToLocations,
  totalEvidence,
  discoveredCount,
}: EvidenceEmptyStateProps) {
  // Implementation here
}
```

**Testing:**
- [ ] Unit tests for component rendering
- [ ] Integration test for tab switching
- [ ] Visual regression test (Storybook)
- [ ] Accessibility audit (axe-core)

**Time Estimate:** 6 hours

---

### 1.2 Add Discovery Timestamp

**Priority:** Critical
**Files to Modify:**
- `src/shared/types/Evidence.ts`
- `src/server/services/repositories/kv/EvidenceRepository.ts`
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Add `discoveredAt: string` field to EvidenceItem type
- [ ] Update evidence storage to include timestamp
- [ ] Display timestamp in detail modal
  - [ ] Format: "🕐 2025-10-23 14:32 발견"
  - [ ] Relative time for recent items: "5분 전 발견"
  - [ ] Show in header section

**Acceptance Criteria:**
- [ ] Timestamp saved when evidence discovered
- [ ] Timestamp displayed in detail modal
- [ ] Relative time shown for items < 1 hour old
- [ ] Timezone handled correctly
- [ ] Old data migrated (default to generatedAt)

**Code Changes:**
```typescript
// Evidence.ts
export interface EvidenceItem {
  // ... existing fields
  discoveredAt?: string; // ISO 8601 timestamp
}

// EvidenceDetailModal.tsx - Add to header
<div className="text-sm text-gray-400">
  🕐 {formatDiscoveryTime(evidence.discoveredAt)}
</div>
```

**Testing:**
- [ ] Timestamp persists across sessions
- [ ] Correct timezone handling
- [ ] Relative time updates properly
- [ ] Migration script works for old data

**Time Estimate:** 4 hours

---

### 1.3 Enhanced Discovery Modal Actions

**Priority:** High
**Files to Modify:**
- `src/client/components/EvidenceDiscoveryModal.tsx`
- `src/client/components/InvestigationScreen.tsx`

**Tasks:**
- [ ] Add "🔍 자세히 보기" primary action
- [ ] Implement smart navigation to notebook + detail
- [ ] Add "📋 노트에 추가" secondary action
- [ ] Keep existing "계속 탐색" action
- [ ] Evidence cards clickable to open detail

**Acceptance Criteria:**
- [ ] Primary action opens evidence detail directly
- [ ] Tab switches to notebook when opening detail
- [ ] Modal closes smoothly after navigation
- [ ] Evidence highlighted in notebook
- [ ] Deep link state preserved in URL

**Code Changes:**
```typescript
// EvidenceDiscoveryModal.tsx
interface EvidenceDiscoveryModalProps {
  // ... existing props
  onEvidenceClick?: (evidenceId: string) => void; // New
}

// InvestigationScreen.tsx
const handleEvidenceDetailFromDiscovery = (evidenceId: string) => {
  setActiveTab('evidence');
  setSelectedEvidenceId(evidenceId);
  setIsDetailModalOpen(true);
};
```

**Testing:**
- [ ] Navigation works from discovery modal
- [ ] Evidence highlighted in notebook
- [ ] Back navigation returns to correct location
- [ ] Deep link works (refresh preserves state)

**Time Estimate:** 5 hours

---

### 1.4 NEW Badge for Recent Evidence

**Priority:** Medium
**Files to Modify:**
- `src/client/components/investigation/EvidenceCard.tsx`
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Add NEW badge to evidence < 5 minutes old
- [ ] Pulse animation for badge
- [ ] Conditional rendering based on discoveredAt
- [ ] Badge in both card and detail modal

**Acceptance Criteria:**
- [ ] Badge appears for evidence < 5 min
- [ ] Badge disappears after 5 minutes
- [ ] Pulse animation smooth (no jank)
- [ ] Badge positioned top-right
- [ ] Accessible to screen readers

**Code Changes:**
```typescript
// EvidenceCard.tsx
const isNew = (discoveredAt: string) => {
  const now = new Date();
  const discovered = new Date(discoveredAt);
  const diffMs = now.getTime() - discovered.getTime();
  return diffMs < 5 * 60 * 1000; // 5 minutes
};

// Render
{isNew(evidence.discoveredAt) && (
  <motion.span
    className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ repeat: Infinity, duration: 2 }}
  >
    NEW!
  </motion.span>
)}
```

**Testing:**
- [ ] Badge shows for new evidence
- [ ] Badge disappears after timeout
- [ ] Animation performs well
- [ ] No memory leaks from animations

**Time Estimate:** 3 hours

---

### 1.5 Progress Indicator Enhancement

**Priority:** Medium
**Files to Modify:**
- `src/client/components/investigation/EvidenceNotebookSection.tsx`

**Tasks:**
- [ ] Show "X / 10 증거 발견" prominently
- [ ] Visual progress bar with animation
- [ ] Celebration at milestones (5, 10 evidence)
- [ ] Color coding by completion rate

**Acceptance Criteria:**
- [ ] Progress visible in header
- [ ] Bar fills smoothly on discovery
- [ ] Milestones trigger celebration
- [ ] Color changes: gray → yellow → gold

**Code Changes:**
```typescript
// EvidenceNotebookSection.tsx - Add to header
<div className="flex items-center gap-2">
  <span className="text-lg font-bold">
    {discoveredEvidence.length} / {totalEvidence} 증거 발견
  </span>
  <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-detective-gold to-yellow-600"
      initial={{ width: 0 }}
      animate={{ width: `${(discoveredEvidence.length / totalEvidence) * 100}%` }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  </div>
</div>
```

**Testing:**
- [ ] Progress updates on discovery
- [ ] Animation smooth
- [ ] Celebration triggers correctly
- [ ] Responsive on mobile

**Time Estimate:** 2 hours

---

## Phase 2: Detail Enhancements (Week 2, 20 hours)

### 2.1 Suspect Connections in Detail Modal

**Priority:** High
**Files to Create:**
- `src/client/components/investigation/SuspectConnectionCard.tsx`

**Files to Modify:**
- `src/client/components/investigation/EvidenceDetailModal.tsx`
- `src/shared/types/Evidence.ts`

**Tasks:**
- [ ] Add `relatedSuspects` field to EvidenceItem
- [ ] Create SuspectConnectionCard component
- [ ] Show suspect avatars with hover cards
- [ ] Link to suspect detail on click
- [ ] Show connection type (주요 용의자, 알리바이 등)

**Acceptance Criteria:**
- [ ] Suspects shown if related
- [ ] Hover shows suspect quick info
- [ ] Click navigates to suspect tab
- [ ] Connection type labeled clearly
- [ ] Responsive grid (2 cols mobile, 3+ desktop)

**Code Template:**
```typescript
// Evidence.ts - Add field
export interface EvidenceItem {
  // ... existing fields
  relatedSuspects?: Array<{
    suspectId: string;
    connectionType: 'primary' | 'alibi' | 'witness' | 'related';
  }>;
}

// SuspectConnectionCard.tsx
interface SuspectConnectionCardProps {
  suspectId: string;
  connectionType: string;
  onNavigateToSuspect: (id: string) => void;
}
```

**Testing:**
- [ ] Connections displayed correctly
- [ ] Navigation works
- [ ] Hover cards show info
- [ ] Screen reader accessible

**Time Estimate:** 6 hours

---

### 2.2 Related Evidence Section

**Priority:** Medium
**Files to Modify:**
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Add "관련 증거" section
- [ ] Show thumbnails of related evidence
- [ ] Click to open related evidence detail
- [ ] Indicate connection type (e.g., "Found at same location")

**Acceptance Criteria:**
- [ ] Related evidence shown if exists
- [ ] Thumbnails clickable
- [ ] Navigation preserves history
- [ ] Connection explained

**Code Changes:**
```typescript
// Add to EvidenceDetailModal
<div className="mt-6">
  <h3 className="text-lg font-bold text-detective-gold mb-3">
    🔗 관련 증거
  </h3>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {relatedEvidence.map((ev) => (
      <div
        key={ev.id}
        onClick={() => onEvidenceClick(ev.id)}
        className="cursor-pointer hover:scale-105 transition"
      >
        <img src={ev.imageUrl} alt={ev.name} className="rounded-lg" />
        <p className="text-sm mt-1">{ev.name}</p>
      </div>
    ))}
  </div>
</div>
```

**Testing:**
- [ ] Related evidence loads
- [ ] Navigation works
- [ ] Performance with many relations
- [ ] Mobile responsive

**Time Estimate:** 4 hours

---

### 2.3 Enhanced Interpretation Hints

**Priority:** High
**Files to Modify:**
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Improve interpretation hint styling
- [ ] Add bullet points for multiple insights
- [ ] Highlight key phrases
- [ ] Add "expert analysis" badge for critical evidence

**Acceptance Criteria:**
- [ ] Hints easy to read
- [ ] Key points highlighted
- [ ] Expert badge shown for critical items
- [ ] Expandable if very long

**Code Changes:**
```typescript
// Enhanced interpretation section
<div className="bg-detective-gold/10 p-4 rounded-lg border border-detective-gold/30">
  <div className="flex items-center gap-2 mb-3">
    <h3 className="text-sm font-bold text-detective-gold">
      🔎 분석 및 해석
    </h3>
    {evidence.relevance === 'critical' && (
      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
        전문가 분석
      </span>
    )}
  </div>
  <ul className="space-y-2">
    {interpretationPoints.map((point, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="text-detective-gold">•</span>
        <span className="text-gray-300 text-sm">{point}</span>
      </li>
    ))}
  </ul>
</div>
```

**Testing:**
- [ ] Hints displayed properly
- [ ] Bullet formatting correct
- [ ] Badge shows for critical
- [ ] Expandable works if long

**Time Estimate:** 3 hours

---

### 2.4 Metadata Section

**Priority:** Low
**Files to Modify:**
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Add metadata section (collapsible)
- [ ] Show: type, location, time, relevance, reliability
- [ ] Format data clearly
- [ ] Make location clickable

**Acceptance Criteria:**
- [ ] All metadata fields shown
- [ ] Section collapsible on mobile
- [ ] Location link works
- [ ] Data formatted consistently

**Code Changes:**
```typescript
<div className="border-t border-gray-700 pt-4 mt-6">
  <details className="sm:open">
    <summary className="cursor-pointer text-sm font-bold text-gray-400 mb-2">
      📊 메타데이터
    </summary>
    <div className="grid grid-cols-2 gap-4 mt-3">
      <div>
        <p className="text-xs text-gray-500">증거 유형</p>
        <p className="text-sm text-gray-300">{evidence.type}</p>
      </div>
      {/* ... more fields */}
    </div>
  </details>
</div>
```

**Testing:**
- [ ] Metadata accurate
- [ ] Collapsible works
- [ ] Links functional
- [ ] Mobile friendly

**Time Estimate:** 2 hours

---

### 2.5 Image Lightbox

**Priority:** Medium
**Files to Create:**
- `src/client/components/shared/ImageLightbox.tsx`

**Files to Modify:**
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Create lightbox component
- [ ] Click evidence image to enlarge
- [ ] Pinch-to-zoom on mobile
- [ ] Swipe to close
- [ ] ESC key support

**Acceptance Criteria:**
- [ ] Lightbox opens on click
- [ ] Image scales smoothly
- [ ] Touch gestures work
- [ ] Keyboard accessible
- [ ] Focus trapped in lightbox

**Code Template:**
```typescript
// ImageLightbox.tsx
interface ImageLightboxProps {
  imageUrl: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  imageUrl,
  alt,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  // Implementation with framer-motion + react-zoom-pan-pinch
}
```

**Testing:**
- [ ] Lightbox opens/closes
- [ ] Zoom works
- [ ] Touch gestures work
- [ ] Keyboard navigation
- [ ] No scroll issues

**Time Estimate:** 5 hours

---

## Phase 3: Journey Optimization (Week 3, 20 hours)

### 3.1 Guided Onboarding Tooltips

**Priority:** High
**Files to Create:**
- `src/client/components/shared/OnboardingTooltip.tsx`
- `src/client/hooks/useOnboarding.ts`

**Tasks:**
- [ ] Create tooltip component
- [ ] Track onboarding state (localStorage)
- [ ] Show tips on first visit:
  - [ ] Empty state: "Start exploring locations"
  - [ ] First evidence: "Click to see details"
  - [ ] 5 evidence: "You're halfway there!"
- [ ] Dismissable with "Don't show again"

**Acceptance Criteria:**
- [ ] Tips show on first visit only
- [ ] Dismissable and persistent
- [ ] Non-intrusive (can be ignored)
- [ ] Accessible (keyboard, screen reader)
- [ ] Mobile friendly

**Code Template:**
```typescript
// useOnboarding.ts
export function useOnboarding() {
  const [tips, setTips] = useState({
    emptyState: true,
    firstEvidence: true,
    halfway: true,
  });

  const dismissTip = (key: keyof typeof tips) => {
    // Save to localStorage
  };

  return { tips, dismissTip };
}
```

**Testing:**
- [ ] Tips show once
- [ ] Dismissal persists
- [ ] No interference with workflow
- [ ] Accessible

**Time Estimate:** 6 hours

---

### 3.2 Achievement System

**Priority:** Medium
**Files to Create:**
- `src/client/components/shared/AchievementBadge.tsx`
- `src/shared/types/Achievement.ts`

**Tasks:**
- [ ] Define achievement types
  - [ ] First Evidence: "🎉 첫 증거 발견!"
  - [ ] All in Location: "✅ 완벽한 조사"
  - [ ] Critical Found: "⭐ 핵심 증거 발견"
  - [ ] All Evidence: "🏆 모든 증거 수집"
- [ ] Toast notification on achievement
- [ ] Persistent badge in UI
- [ ] Celebration animation (confetti)

**Acceptance Criteria:**
- [ ] Achievements trigger correctly
- [ ] Toast non-intrusive
- [ ] Celebration delightful
- [ ] Persistent in profile/stats
- [ ] Mobile friendly

**Code Template:**
```typescript
// Achievement.ts
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

// AchievementBadge.tsx
interface AchievementBadgeProps {
  achievement: Achievement;
  onDismiss: () => void;
}
```

**Testing:**
- [ ] Achievements unlock correctly
- [ ] Toast appears
- [ ] Confetti renders
- [ ] Performance good

**Time Estimate:** 7 hours

---

### 3.3 Evidence Comparison Feature

**Priority:** Low
**Files to Create:**
- `src/client/components/investigation/EvidenceComparisonModal.tsx`

**Tasks:**
- [ ] Add "Compare" button to evidence detail
- [ ] Select up to 3 evidence for comparison
- [ ] Side-by-side view
- [ ] Highlight differences/connections
- [ ] Clear comparison list

**Acceptance Criteria:**
- [ ] Can add to comparison
- [ ] Max 3 enforced
- [ ] Side-by-side readable
- [ ] Can remove from comparison
- [ ] Comparison state persists (session)

**Code Template:**
```typescript
// EvidenceComparisonModal.tsx
interface ComparisonItem {
  evidence: EvidenceItem;
  addedAt: string;
}

export function EvidenceComparisonModal({
  items,
  onClose,
}: {
  items: ComparisonItem[];
  onClose: () => void;
}) {
  // Implementation
}
```

**Testing:**
- [ ] Comparison works
- [ ] Layout responsive
- [ ] State persists
- [ ] Clear function works

**Time Estimate:** 5 hours

---

### 3.4 Bookmark/Favorite System

**Priority:** Low
**Files to Modify:**
- `src/client/components/investigation/EvidenceCard.tsx`
- `src/client/components/investigation/EvidenceDetailModal.tsx`

**Tasks:**
- [ ] Add bookmark toggle button
- [ ] Heart icon with fill animation
- [ ] Filter by bookmarked
- [ ] Persist in localStorage/backend

**Acceptance Criteria:**
- [ ] Bookmark toggles
- [ ] Animation smooth
- [ ] Filter works
- [ ] Persists across sessions

**Code Changes:**
```typescript
// Add to EvidenceDetailModal
<button
  onClick={() => toggleBookmark(evidence.id)}
  className="px-4 py-2 border border-detective-gold rounded-lg hover:bg-detective-gold/10"
>
  {isBookmarked ? '❤️' : '🤍'} 중요 표시
</button>
```

**Testing:**
- [ ] Toggle works
- [ ] Animation renders
- [ ] Filter accurate
- [ ] Persistence works

**Time Estimate:** 2 hours

---

## Phase 4: Polish & Accessibility (Week 4, 20 hours)

### 4.1 Mobile Optimizations

**Priority:** High

**Tasks:**
- [ ] Test on real devices (iOS, Android)
- [ ] Fix touch target sizes (44px minimum)
- [ ] Implement pull-to-refresh
- [ ] Add swipe gestures
  - [ ] Swipe evidence cards to bookmark
  - [ ] Swipe modal to close
  - [ ] Swipe between evidence in detail
- [ ] Bottom sheet for detail on mobile
- [ ] Optimize images for mobile (WebP, lazy load)

**Acceptance Criteria:**
- [ ] All touch targets 44px+
- [ ] Gestures work smoothly
- [ ] No horizontal scroll
- [ ] Fast load times (<3s)
- [ ] Native feel

**Testing:**
- [ ] Test on iPhone SE (small screen)
- [ ] Test on iPad (medium)
- [ ] Test on Android (various)
- [ ] Test on slow connection
- [ ] Performance audit (Lighthouse)

**Time Estimate:** 8 hours

---

### 4.2 Accessibility Audit & Fixes

**Priority:** Critical

**Tasks:**
- [ ] Run axe-core accessibility audit
- [ ] Fix all critical/serious issues
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard shortcuts
  - [ ] Tab: Navigate elements
  - [ ] Enter/Space: Activate
  - [ ] Escape: Close modals
  - [ ] Arrow keys: Navigate grid
  - [ ] E: Open evidence detail
  - [ ] N: Next evidence
  - [ ] P: Previous evidence
- [ ] Add skip links
- [ ] Test with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Ensure color contrast WCAG AA
- [ ] Add focus indicators

**Acceptance Criteria:**
- [ ] Zero critical accessibility issues
- [ ] All WCAG 2.1 AA criteria met
- [ ] Keyboard navigation complete
- [ ] Screen reader tested
- [ ] High contrast mode works

**Testing:**
- [ ] Automated (axe, Lighthouse)
- [ ] Manual keyboard test
- [ ] NVDA screen reader
- [ ] JAWS screen reader
- [ ] VoiceOver (macOS/iOS)
- [ ] Color contrast checker

**Time Estimate:** 6 hours

---

### 4.3 Animation Polish

**Priority:** Medium

**Tasks:**
- [ ] Audit all animations for performance
- [ ] Use CSS transforms (GPU-accelerated)
- [ ] Add `will-change` hints where needed
- [ ] Implement `prefers-reduced-motion`
- [ ] Optimize confetti (canvas-confetti)
- [ ] Ensure 60fps on all animations
- [ ] Add easing for natural feel

**Acceptance Criteria:**
- [ ] All animations 60fps
- [ ] No jank on low-end devices
- [ ] Reduced motion respected
- [ ] Animations enhance UX
- [ ] Load time impact minimal

**Testing:**
- [ ] Chrome DevTools Performance
- [ ] Test on older devices
- [ ] Test with reduced motion
- [ ] Frame rate monitoring

**Time Estimate:** 3 hours

---

### 4.4 Performance Optimization

**Priority:** High

**Tasks:**
- [ ] Implement code splitting (React.lazy)
- [ ] Lazy load images (IntersectionObserver)
- [ ] Optimize bundle size
  - [ ] Remove unused dependencies
  - [ ] Tree-shake libraries
  - [ ] Compress images (WebP, AVIF)
- [ ] Add loading skeletons
- [ ] Implement virtual scrolling for large lists
- [ ] Cache API responses
- [ ] Prefetch on hover

**Acceptance Criteria:**
- [ ] Lighthouse score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] Bundle size <500KB (gzipped)
- [ ] Images optimized

**Testing:**
- [ ] Lighthouse audit
- [ ] WebPageTest
- [ ] Bundle analyzer
- [ ] Real-world testing (3G)

**Time Estimate:** 3 hours

---

## Final Checklist

### Pre-Launch

- [ ] All Phase 1-4 tasks completed
- [ ] Code review passed
- [ ] QA testing completed
- [ ] Accessibility audit passed
- [ ] Performance benchmarks met
- [ ] User testing feedback incorporated
- [ ] Documentation updated
- [ ] Rollback plan prepared

### Launch

- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production (gradual rollout)
- [ ] Monitor errors (Sentry)
- [ ] Monitor performance (Web Vitals)
- [ ] Gather user feedback
- [ ] Hotfix ready if needed

### Post-Launch

- [ ] Analyze metrics (engagement, errors)
- [ ] A/B test variations
- [ ] Iterate based on feedback
- [ ] Document learnings
- [ ] Plan next improvements

---

## Tools & Resources

### Development
- **UI Framework:** React + TypeScript
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **Icons:** Emoji + Custom SVG
- **Testing:** Vitest, React Testing Library
- **Storybook:** Component documentation

### Accessibility
- **Audit:** axe DevTools, Lighthouse
- **Screen Readers:** NVDA, JAWS, VoiceOver
- **Contrast:** WebAIM Contrast Checker
- **Keyboard:** Manual testing

### Performance
- **Monitoring:** Lighthouse, WebPageTest
- **Bundle:** Vite Bundle Analyzer
- **Images:** Squoosh, ImageOptim
- **Profiling:** Chrome DevTools

### Design
- **Mockups:** Figma (if needed)
- **Prototyping:** Framer
- **Illustrations:** Undraw, Storyset
- **Colors:** Coolors, Adobe Color

---

## Risk Management

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Performance degradation with animations | High | Medium | Use GPU-accelerated transforms, test on low-end devices |
| Accessibility regressions | High | Low | Automated testing in CI, manual audits |
| Mobile touch issues | Medium | Medium | Test on real devices early, use established libraries |
| Image loading delays | Medium | High | Lazy loading, progressive images, loading skeletons |

### UX Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Users ignore empty state | High | Medium | User testing, iterate on copy/design |
| Too many tooltips annoying | Medium | High | Make dismissable, show sparingly |
| Detail modal information overload | Medium | Medium | Progressive disclosure, test with users |
| Navigation confusion | High | Low | Clear breadcrumbs, consistent patterns |

---

## Success Metrics (Review after 1 month)

### Engagement
- [ ] Evidence view rate: >85% (from 45%)
- [ ] Average exploration time: >2 min (from 30s)
- [ ] Return to notebook rate: >70% (from 20%)

### Usability
- [ ] Time to first evidence: <2 min (from 5 min)
- [ ] Error rate: <2% (from 15%)
- [ ] Collection completion rate: >80% (from 60%)

### Satisfaction
- [ ] NPS: >8 (from 6)
- [ ] Feature usefulness: >4.5/5 (from 3.2/5)
- [ ] User feedback sentiment: Positive

### Technical
- [ ] Lighthouse score: >90
- [ ] Zero critical accessibility issues
- [ ] <1% error rate (Sentry)
- [ ] <200ms average API response time

---

**Implementation Checklist Version:** 1.0
**Last Updated:** 2025-10-23
**Owner:** Development Team
**Status:** Ready for Development
