# Evidence System Migration Guide

## Overview

This guide walks you through migrating from the existing evidence system to the improved architecture with error handling, retry logic, and better UX.

**Estimated Time**: 2-4 hours
**Risk Level**: Low (backwards compatible)
**Rollback Plan**: Keep old components intact

---

## Phase 1: Add New Dependencies (5 minutes)

### No new dependencies needed! ✅

All new components use existing dependencies:
- `framer-motion` (already installed)
- `react` and TypeScript (already configured)

---

## Phase 2: Create Common Components (30 minutes)

All components are already created. Verify they exist:

```bash
# Check files exist
ls src/client/components/common/ErrorBoundary.tsx
ls src/client/components/common/LoadingSkeleton.tsx
ls src/client/components/common/EmptyState.tsx
ls src/client/components/common/LazyImage.tsx
ls src/client/utils/apiRetry.ts
ls src/client/components/investigation/ImprovedEvidenceNotebookSection.tsx
```

Expected output: All files present ✅

---

## Phase 3: Update Type Definitions (10 minutes)

### Verify Evidence Types

Check `src/shared/types/Evidence.ts` includes:
```typescript
export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  name: string;
  description: string;
  discoveryHint: string;
  interpretationHint: string;
  relevance: EvidenceRelevance;
  pointsToSuspect?: number;
  discoveryDifficulty: DiscoveryDifficulty;
  discoveryProbability: DiscoveryProbability;
  foundAtLocationId: string;
  foundAtAreaId?: string;
  imageUrl?: string;  // ← Verify this exists
  imageGeneratedAt?: number;  // ← Verify this exists
}
```

If missing, the types are already defined correctly. ✅

---

## Phase 4: Gradual Component Integration (1-2 hours)

### Step 1: Add ErrorBoundary (5 minutes)

Wrap your main game component:

```tsx
// src/client/components/Game.tsx or App.tsx
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function Game() {
  return (
    <ErrorBoundary>
      <YourExistingGameContent />
    </ErrorBoundary>
  );
}
```

**Test**: Throw an error in a child component, verify error boundary catches it.

### Step 2: Test Loading Skeletons (10 minutes)

Add skeleton to existing component temporarily:

```tsx
// src/client/components/investigation/EvidenceNotebookSection.tsx
import { EvidenceNotebookSkeleton } from '../common/LoadingSkeleton';

export function EvidenceNotebookSection(props) {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <EvidenceNotebookSkeleton />;
  }

  // ... rest of component
}
```

**Test**: Verify skeleton renders, matches layout.

### Step 3: Add Empty States (15 minutes)

```tsx
// In EvidenceNotebookSection
import { EmptyEvidenceState } from '../common/EmptyState';

// Replace existing empty state
{discoveredEvidence.length === 0 ? (
  <EmptyEvidenceState onExplore={handleNavigateToExplore} />
) : (
  // evidence grid
)}
```

**Test**: Clear evidence data, verify empty state shows onboarding.

### Step 4: Integrate API Retry (20 minutes)

Update fetch logic:

```tsx
// Before
const response = await fetch(`/api/player-state/${caseId}/${userId}`);
const data = await response.json();

// After
import { fetchJsonWithRetry } from '../utils/apiRetry';

const data = await fetchJsonWithRetry<PlayerState>(
  `/api/player-state/${caseId}/${userId}`,
  {},
  { maxRetries: 3 }
);
```

**Test**:
1. Block network, verify retry occurs
2. Check console for retry messages
3. Verify 404 doesn't retry

### Step 5: Add Lazy Images (30 minutes)

Update EvidenceCard:

```tsx
// src/client/components/investigation/EvidenceCard.tsx
import { EvidenceImage } from '../common/LazyImage';

export function EvidenceCard({ evidence, onClick }) {
  return (
    <div onClick={onClick}>
      {/* Add image at top of card */}
      <EvidenceImage
        evidenceId={evidence.id}
        imageUrl={evidence.imageUrl}
        evidenceName={evidence.name}
        className="w-full h-48 rounded-t-lg mb-3"
      />

      {/* Rest of existing card content */}
      <div className="flex items-start gap-3">
        {/* ... */}
      </div>
    </div>
  );
}
```

Update EvidenceDetailModal:

```tsx
// src/client/components/investigation/EvidenceDetailModal.tsx
import { EvidenceImage } from '../common/LazyImage';

export function EvidenceDetailModal({ evidence, isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div>
          {/* ... modal content ... */}

          {/* Replace existing image section */}
          {evidence?.imageUrl && (
            <EvidenceImage
              evidenceId={evidence.id}
              imageUrl={evidence.imageUrl}
              evidenceName={evidence.name}
              className="w-full h-auto rounded-lg"
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
```

**Test**:
1. Scroll through evidence list
2. Open DevTools Network tab
3. Verify images load only when scrolled into view
4. Test fallback by using invalid image URL

---

## Phase 5: Switch to Improved Notebook (30 minutes)

### Option A: Drop-in Replacement (Recommended)

```tsx
// In parent component that uses EvidenceNotebookSection
import { ImprovedEvidenceNotebookSection as EvidenceNotebookSection } from './investigation/ImprovedEvidenceNotebookSection';

// Usage stays exactly the same
<EvidenceNotebookSection
  caseId={caseId}
  userId={userId}
  selectedEvidenceId={selectedEvidenceId}
  onClearSelection={handleClearSelection}
  onNavigateToExplore={handleNavigateToExplore}  // NEW: add this handler
/>
```

### Option B: Feature Flag (Safer)

```tsx
import { EvidenceNotebookSection } from './investigation/EvidenceNotebookSection';
import { ImprovedEvidenceNotebookSection } from './investigation/ImprovedEvidenceNotebookSection';

const USE_IMPROVED_NOTEBOOK = true; // Toggle for testing

export function GameBoard() {
  const Component = USE_IMPROVED_NOTEBOOK
    ? ImprovedEvidenceNotebookSection
    : EvidenceNotebookSection;

  return (
    <Component
      caseId={caseId}
      userId={userId}
      selectedEvidenceId={selectedEvidenceId}
      onClearSelection={handleClearSelection}
      onNavigateToExplore={handleNavigateToExplore}
    />
  );
}
```

### Add Navigation Handler

```tsx
const handleNavigateToExplore = useCallback(() => {
  // Option 1: If using tabs
  setActiveTab('exploration');

  // Option 2: If using router
  // router.push('/explore');

  // Option 3: If using modal
  // setExplorationModalOpen(true);
}, []);
```

**Test**:
1. Load component with no evidence → verify empty state
2. Load component with evidence → verify grid renders
3. Filter evidence → verify filtered empty state
4. Simulate 404 error → verify not found state
5. Simulate network error → verify retry logic
6. Click "탐색하기" → verify navigation works

---

## Phase 6: Testing (1 hour)

### Manual Testing Checklist

#### Loading States
- [ ] Initial load shows skeleton
- [ ] Skeleton matches final layout
- [ ] Smooth transition from skeleton to content
- [ ] Retry shows progress indicator (1/3, 2/3, 3/3)

#### Error States
- [ ] Network error shows error state with retry button
- [ ] 404 error shows "Player not found" state
- [ ] Server error (500) triggers retry
- [ ] Manual retry button works
- [ ] Error messages are clear and actionable

#### Empty States
- [ ] Zero evidence shows onboarding tutorial
- [ ] Tutorial explains AP costs correctly
- [ ] "탐색하기" button navigates correctly
- [ ] Filtered empty state shows appropriate message
- [ ] "전체 보기" button clears filter

#### Image Loading
- [ ] Images don't load until scrolled into view
- [ ] Loading spinner appears during image load
- [ ] Fallback gradient shows for missing images
- [ ] Fallback includes evidence name
- [ ] No layout shift during image load

#### Error Recovery
- [ ] Component doesn't crash on errors
- [ ] Error boundary catches rendering errors
- [ ] Error boundary shows reset button
- [ ] Reset button clears error state

### Automated Testing

Create test file:

```tsx
// src/client/components/investigation/__tests__/ImprovedEvidenceNotebookSection.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ImprovedEvidenceNotebookSection } from '../ImprovedEvidenceNotebookSection';

describe('ImprovedEvidenceNotebookSection', () => {
  it('shows loading skeleton initially', () => {
    render(<ImprovedEvidenceNotebookSection caseId="case-1" userId="user-1" />);
    expect(screen.getByTestId('notebook-skeleton')).toBeInTheDocument();
  });

  it('shows empty state when no evidence', async () => {
    // Mock API to return empty evidence
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ discoveredEvidence: [] }),
      })
    );

    render(<ImprovedEvidenceNotebookSection caseId="case-1" userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText(/아직 발견한 증거가 없습니다/)).toBeInTheDocument();
    });
  });

  it('retries on network error', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ discoveredEvidence: [] }),
      });

    global.fetch = mockFetch;

    render(<ImprovedEvidenceNotebookSection caseId="case-1" userId="user-1" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
```

Run tests:
```bash
npm test -- ImprovedEvidenceNotebookSection
```

---

## Phase 7: Performance Validation (30 minutes)

### Lighthouse Audit

1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Run audit with:
   - Mode: Navigation
   - Categories: Performance, Accessibility
   - Device: Mobile

**Target Metrics**:
- Performance: > 90
- Accessibility: > 95
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### Network Throttling Test

1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Reload page
4. Verify:
   - [ ] Loading skeleton appears immediately
   - [ ] Content loads progressively
   - [ ] Images lazy load
   - [ ] No blank screens
   - [ ] Retry works on timeout

### Memory Profiling

1. Open DevTools → Memory tab
2. Take heap snapshot before loading evidence
3. Load evidence notebook
4. Take heap snapshot after
5. Compare memory usage

**Expected**: Memory increase < 10MB for 50 evidence items

---

## Phase 8: Rollback Plan

If issues occur, easy rollback:

### Immediate Rollback (< 5 minutes)

```tsx
// Change this line
import { ImprovedEvidenceNotebookSection as EvidenceNotebookSection }
  from './investigation/ImprovedEvidenceNotebookSection';

// To this
import { EvidenceNotebookSection }
  from './investigation/EvidenceNotebookSection';
```

### Keep Both Versions

Old component at:
```
src/client/components/investigation/EvidenceNotebookSection.tsx
```

New component at:
```
src/client/components/investigation/ImprovedEvidenceNotebookSection.tsx
```

Both can coexist. No files are deleted.

---

## Troubleshooting

### Issue: Infinite retry loop

**Symptom**: Component keeps retrying forever

**Cause**: API endpoint returning wrong status code

**Fix**:
```tsx
// Check retry logic respects maxRetries
const data = await fetchJsonWithRetry(..., {
  maxRetries: 3, // ← Ensure this is set
});
```

### Issue: Images not lazy loading

**Symptom**: All images load immediately

**Cause**: `eager` prop set to true

**Fix**:
```tsx
<LazyImage
  src={imageUrl}
  eager={false} // ← Ensure eager is false
/>
```

### Issue: Empty state doesn't show

**Symptom**: Blank screen when no evidence

**Cause**: Conditional rendering logic wrong

**Fix**:
```tsx
{discoveredEvidence.length === 0 ? (
  <EmptyEvidenceState />
) : (
  <EvidenceGrid />
)}
```

### Issue: Error boundary not catching errors

**Symptom**: App crashes despite error boundary

**Cause**: Error thrown in event handler (not render)

**Fix**: Wrap async operations in try-catch:
```tsx
const handleClick = async () => {
  try {
    await riskyOperation();
  } catch (error) {
    setError(error.message);
  }
};
```

### Issue: TypeScript errors

**Symptom**: Type errors in new components

**Cause**: Missing type imports

**Fix**:
```tsx
import type { EvidenceItem } from '@/shared/types/Evidence';
```

---

## Post-Migration Checklist

### Functionality
- [ ] Evidence loads successfully
- [ ] Empty state shows when no evidence
- [ ] Error states display correctly
- [ ] Retry logic works
- [ ] Images lazy load
- [ ] Filters work
- [ ] Detail modal opens
- [ ] Navigation works

### Performance
- [ ] Lighthouse score > 90
- [ ] No layout shift
- [ ] Fast loading with skeleton
- [ ] Images don't block rendering
- [ ] Memory usage acceptable

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces states
- [ ] Focus management correct
- [ ] Color contrast sufficient
- [ ] Touch targets large enough

### Error Handling
- [ ] Network errors recover
- [ ] 404 handled gracefully
- [ ] Server errors retry
- [ ] Component doesn't crash
- [ ] Error messages clear

### User Experience
- [ ] Loading states smooth
- [ ] Empty state helpful
- [ ] Error states actionable
- [ ] Animations not jarring
- [ ] Copy is clear

---

## Monitoring

After deployment, monitor:

### Error Rates
```
Track in error monitoring service:
- API call failures
- Image load failures
- Component crash rate
```

### Performance
```
Track in analytics:
- Time to first evidence load
- Image load times
- Retry frequency
```

### User Behavior
```
Track in analytics:
- Empty state CTA clicks
- Error state retry clicks
- Filter usage
- Evidence detail opens
```

---

## Next Steps After Migration

1. **Gather Feedback** (1 week)
   - Monitor error rates
   - Check performance metrics
   - Collect user feedback

2. **Optimize** (2 weeks)
   - Add React Query if needed
   - Implement virtual scrolling
   - Add offline support

3. **Enhance** (1 month)
   - Evidence search
   - Advanced filtering
   - Evidence comparison
   - Export functionality

---

## Support

Questions during migration?

1. Check this guide first
2. Review [EVIDENCE_SYSTEM_ARCHITECTURE.md](./EVIDENCE_SYSTEM_ARCHITECTURE.md)
3. Check component source code comments
4. Create issue with reproduction steps

**Migration Support**: Frontend Team
**Last Updated**: 2025-10-23
