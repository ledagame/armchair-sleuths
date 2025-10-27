# useImagePolling Hook - Design Document

**Version**: 1.0
**Date**: 2025-10-25
**Status**: Implementation Ready
**Purpose**: Auto-refresh location/evidence images after async background generation

---

## Executive Summary

The `useImagePolling` hook enables real-time image availability detection for asynchronously-generated images. It polls a status endpoint at configurable intervals and triggers callbacks when image generation completes, eliminating the need for manual page refreshes.

**Key Features**:
- Configurable polling interval and timeout
- Intelligent lifecycle management (start/stop/cleanup)
- Error resilience with retry logic
- Works with both React and Devvit environments
- Zero re-renders when inactive
- Memory leak prevention

---

## Problem Analysis

### Current State (Issue #2 from END_TO_END_ANALYSIS_REPORT.md)

**Timeline**:
```
t=0s:    User creates case → POST /api/case/generate
t=1s:    Case returned to frontend (with location emojis, NO imageUrl)
t=2-60s: Background: LocationImageGeneratorService generates images
         Images stored in Redis: case:{caseId}:location:{locationId}:image
t=60s+:  Images ready in backend, but frontend doesn't know
         User must manually refresh to see actual images
```

**Impact**:
- Poor UX: Users see placeholder emojis indefinitely
- No visual feedback about image generation progress
- Confusion about when images will appear

### Desired State

**Timeline with Polling**:
```
t=0s:    User creates case
t=1s:    Case returned → useImagePolling starts polling
t=2-60s: Poll every 5s: GET /api/case/{id}/image-status
         UI shows "Generating images... 3/5 complete"
t=60s:   Poll detects status.complete === true
         Triggers onComplete() callback
         Re-fetches locations with populated imageUrl
         Images fade in smoothly
```

**Benefits**:
- Automatic image refresh (no manual reload)
- Progress visibility (X/Y complete)
- Better perceived performance
- Professional UX

---

## Architecture Design

### System Context

```
┌────────────────────────────────────────────────────────────────┐
│ Frontend Component (InvestigationScreen, LocationExplorer)     │
│                                                                 │
│  const { status, isPolling, isComplete } = useImagePolling({  │
│    caseId: caseData.id,                                        │
│    enabled: true,                                              │
│    onComplete: () => refetchLocations()                        │
│  });                                                           │
│                                                                 │
│  {isPolling && <ProgressIndicator progress={status} />}        │
└────────────────────────────────────────────────────────────────┘
                             ↓ polls every 5s
┌────────────────────────────────────────────────────────────────┐
│ Backend API Endpoint                                           │
│                                                                 │
│  GET /api/case/:caseId/image-status                            │
│    → Check Redis for image completion status                  │
│    → Return { evidence: {...}, location: {...}, complete }    │
└────────────────────────────────────────────────────────────────┘
                             ↓ reads from
┌────────────────────────────────────────────────────────────────┐
│ Redis KV Store                                                 │
│                                                                 │
│  case:{caseId}:location:{locationId}:image → imageUrl          │
│  case:{caseId}:evidence:{evidenceId}:image → imageUrl          │
│  case:{caseId}:image-generation-status → { ... }               │
└────────────────────────────────────────────────────────────────┘
```

### Hook State Machine

```
┌──────────────┐
│  IDLE        │ enabled = false, nothing happens
└──────┬───────┘
       │ enabled = true
       ↓
┌──────────────┐
│  POLLING     │ Poll every [interval]ms
└──────┬───────┘
       │
       ├─→ timeout reached ────────┐
       │                            ↓
       ├─→ status.complete ────────┐
       │                            ↓
       ├─→ error (404, max retries)┐
       │                            ↓
       ↓                            ↓
┌──────────────┐            ┌──────────────┐
│  POLLING     │            │  STOPPED     │
│  (retry)     │            └──────────────┘
└──────────────┘
       │
       └─→ max retries ────────────┘
```

### Polling Lifecycle

```typescript
// Phase 1: Initialization
useImagePolling({ enabled: true, ... })
  ↓
useState/useRef initialization
  ↓
AbortController created
  ↓
startPolling()

// Phase 2: Active Polling
Poll Loop:
  ├─ fetch('/api/case/:id/image-status', { signal })
  ├─ if (response.ok):
  │    ├─ Update status state
  │    ├─ if (status.complete):
  │    │    ├─ Call onComplete()
  │    │    └─ Stop polling
  │    └─ else: continue
  ├─ if (network error):
  │    ├─ Increment retry counter
  │    ├─ if (retries < MAX_RETRIES): continue
  │    └─ else: stop polling
  └─ if (timeout reached): stop polling

// Phase 3: Cleanup
Component unmount OR enabled = false
  ↓
clearInterval(pollIntervalRef)
  ↓
abortController.abort()
  ↓
Cleanup complete
```

---

## API Design

### Hook Signature

```typescript
interface ImageGenerationStatus {
  evidence: {
    status: 'pending' | 'in_progress' | 'complete' | 'failed';
    total: number;
    completed: number;
  };
  location: {
    status: 'pending' | 'in_progress' | 'complete' | 'failed';
    total: number;
    completed: number;
  };
  complete: boolean; // true when BOTH evidence AND location complete
}

interface UseImagePollingOptions {
  caseId: string;
  enabled?: boolean;        // Default: true
  interval?: number;        // Default: 5000ms
  timeout?: number;         // Default: 120000ms (2 minutes)
  onComplete?: () => void;  // Callback when generation complete
  onError?: (error: Error) => void; // Callback on fatal error
}

interface UseImagePollingReturn {
  status: ImageGenerationStatus | null;
  isPolling: boolean;
  isComplete: boolean;
  error: Error | null;
  reset: () => void;        // Manually reset and restart polling
}

function useImagePolling(
  options: UseImagePollingOptions
): UseImagePollingReturn;
```

### Usage Examples

#### Basic Usage (React)

```tsx
import { useImagePolling } from '../hooks/useImagePolling';

function LocationExplorer({ caseData, refetchLocations }) {
  const { status, isPolling, isComplete } = useImagePolling({
    caseId: caseData.id,
    enabled: true,
    onComplete: () => {
      console.log('Images ready! Re-fetching locations...');
      refetchLocations(); // Trigger location data refresh
    }
  });

  return (
    <div>
      {isPolling && !isComplete && (
        <div className="polling-indicator">
          <Spinner />
          <p>Generating location images...</p>
          <p>{status?.location.completed}/{status?.location.total} complete</p>
        </div>
      )}

      {/* Location cards render here */}
    </div>
  );
}
```

#### Conditional Polling (Devvit)

```tsx
// Only poll when on investigation screen
const [currentScreen, setCurrentScreen] = context.useState('loading');

const { status, isPolling } = useImagePolling({
  caseId: caseData?.id || '',
  enabled: currentScreen === 'investigation' && !!caseData,
  interval: 5000,
  timeout: 120000,
  onComplete: () => {
    // Re-fetch case data to get updated imageUrls
    fetchCase();
  }
});

if (currentScreen === 'investigation' && isPolling) {
  return (
    <vstack alignment="center middle">
      <text size="medium">Generating location images...</text>
      <text size="small">{status?.location.completed}/{status?.location.total}</text>
    </vstack>
  );
}
```

#### Advanced Usage with Error Handling

```tsx
const { status, isPolling, isComplete, error, reset } = useImagePolling({
  caseId: caseData.id,
  enabled: true,
  interval: 3000,
  timeout: 180000,
  onComplete: () => {
    refetchLocations();
    showToast('Location images loaded!');
  },
  onError: (err) => {
    console.error('Polling failed:', err);
    showToast('Image generation taking longer than expected');
  }
});

// Manually retry if needed
if (error) {
  return (
    <button onClick={reset}>
      Retry Image Loading
    </button>
  );
}
```

---

## Implementation Strategy

### State Management

```typescript
// Primary state
const [status, setStatus] = useState<ImageGenerationStatus | null>(null);
const [isPolling, setIsPolling] = useState(false);
const [isComplete, setIsComplete] = useState(false);
const [error, setError] = useState<Error | null>(null);

// Refs for cleanup (don't trigger re-renders)
const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
const abortControllerRef = useRef<AbortController | null>(null);
const retryCountRef = useRef(0);
const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
```

### Polling Loop Implementation

```typescript
const startPolling = useCallback(() => {
  // Clear any existing polling
  stopPolling();

  // Create new AbortController
  abortControllerRef.current = new AbortController();
  const signal = abortControllerRef.current.signal;

  // Reset state
  setIsPolling(true);
  setIsComplete(false);
  setError(null);
  retryCountRef.current = 0;

  // Set timeout timer
  timeoutTimerRef.current = setTimeout(() => {
    console.warn('[useImagePolling] Timeout reached');
    stopPolling();
    setError(new Error('Polling timeout exceeded'));
    options.onError?.(new Error('Polling timeout exceeded'));
  }, options.timeout || 120000);

  // Poll immediately, then at intervals
  poll(signal);

  pollIntervalRef.current = setInterval(() => {
    poll(signal);
  }, options.interval || 5000);
}, [options, poll, stopPolling]);

const poll = useCallback(async (signal: AbortSignal) => {
  try {
    const response = await fetch(
      `/api/case/${options.caseId}/image-status`,
      { signal }
    );

    if (!response.ok) {
      if (response.status === 404) {
        // Case doesn't exist - fatal error
        throw new Error('Case not found');
      }
      throw new Error(`HTTP ${response.status}`);
    }

    const data: ImageGenerationStatus = await response.json();
    setStatus(data);

    if (data.complete) {
      console.log('[useImagePolling] Generation complete!');
      stopPolling();
      setIsComplete(true);
      options.onComplete?.();
    }

    // Reset retry count on success
    retryCountRef.current = 0;

  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      // Abort is intentional, not an error
      return;
    }

    console.error('[useImagePolling] Poll error:', err);

    retryCountRef.current++;
    if (retryCountRef.current >= MAX_RETRIES) {
      console.error('[useImagePolling] Max retries exceeded');
      stopPolling();
      setError(err instanceof Error ? err : new Error('Polling failed'));
      options.onError?.(err instanceof Error ? err : new Error('Polling failed'));
    }
  }
}, [options, stopPolling]);
```

### Cleanup Strategy

```typescript
const stopPolling = useCallback(() => {
  // Clear interval
  if (pollIntervalRef.current) {
    clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = null;
  }

  // Clear timeout
  if (timeoutTimerRef.current) {
    clearTimeout(timeoutTimerRef.current);
    timeoutTimerRef.current = null;
  }

  // Abort in-flight requests
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
    abortControllerRef.current = null;
  }

  setIsPolling(false);
}, []);

// Cleanup on unmount or when enabled changes
useEffect(() => {
  if (options.enabled) {
    startPolling();
  } else {
    stopPolling();
  }

  return () => {
    stopPolling();
  };
}, [options.enabled, options.caseId, startPolling, stopPolling]);
```

---

## Performance Optimizations

### 1. Memoization

```typescript
// Memoize callbacks to prevent unnecessary re-renders
const poll = useCallback(async (signal: AbortSignal) => { ... }, [options]);
const startPolling = useCallback(() => { ... }, [options, poll]);
const stopPolling = useCallback(() => { ... }, []);
```

### 2. Ref Usage for Non-Reactive State

```typescript
// Use refs for values that don't need to trigger re-renders
const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
const retryCountRef = useRef(0);
// Changing these values won't cause component re-render
```

### 3. AbortController for Request Cancellation

```typescript
// Cancel in-flight requests on cleanup
const abortControllerRef = useRef<AbortController | null>(null);

// In cleanup:
abortControllerRef.current?.abort();
```

### 4. Conditional Polling

```typescript
// Only poll when necessary
const { status } = useImagePolling({
  enabled: currentScreen === 'investigation', // Only when viewing locations
  caseId
});
```

### 5. Intelligent Interval Selection

```typescript
// Start with shorter interval, increase if taking long
const [currentInterval, setCurrentInterval] = useState(5000);

useEffect(() => {
  if (pollCount > 10 && currentInterval === 5000) {
    // After 50s, slow down to 10s interval
    setCurrentInterval(10000);
  }
}, [pollCount, currentInterval]);
```

---

## Error Handling Strategy

### Error Categories

1. **Network Errors** (Transient)
   - Retry with exponential backoff
   - Max 3 retries before giving up

2. **404 Not Found** (Fatal)
   - Case doesn't exist
   - Stop polling immediately
   - Show error to user

3. **Timeout** (Expected)
   - Generation taking longer than timeout
   - Not necessarily an error
   - Allow manual retry

4. **AbortError** (Intentional)
   - User navigated away
   - Component unmounted
   - Don't log as error

### Error Recovery

```typescript
const reset = useCallback(() => {
  // Reset all state
  setStatus(null);
  setIsComplete(false);
  setError(null);
  retryCountRef.current = 0;

  // Restart polling
  if (options.enabled) {
    startPolling();
  }
}, [options.enabled, startPolling]);
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('useImagePolling', () => {
  it('should start polling when enabled', () => {
    const { result } = renderHook(() => useImagePolling({
      caseId: 'test-case',
      enabled: true
    }));

    expect(result.current.isPolling).toBe(true);
  });

  it('should stop polling when status.complete is true', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        complete: true,
        location: { status: 'complete', total: 5, completed: 5 }
      })
    });

    const onComplete = jest.fn();
    const { result } = renderHook(() => useImagePolling({
      caseId: 'test-case',
      enabled: true,
      onComplete
    }));

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('should retry on network error', async () => {
    mockFetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ complete: false })
      });

    const { result } = renderHook(() => useImagePolling({
      caseId: 'test-case',
      enabled: true
    }));

    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });

  it('should stop after max retries', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const onError = jest.fn();
    const { result } = renderHook(() => useImagePolling({
      caseId: 'test-case',
      enabled: true,
      onError
    }));

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(onError).toHaveBeenCalled();
    });
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useImagePolling({
      caseId: 'test-case',
      enabled: true
    }));

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('useImagePolling integration', () => {
  it('should trigger location refetch when complete', async () => {
    const refetchLocations = jest.fn();

    function TestComponent() {
      const { status } = useImagePolling({
        caseId: 'test-case',
        enabled: true,
        onComplete: refetchLocations
      });

      return <div>{status?.location.completed}</div>;
    }

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        complete: true,
        location: { status: 'complete', total: 5, completed: 5 }
      })
    });

    render(<TestComponent />);

    await waitFor(() => {
      expect(refetchLocations).toHaveBeenCalled();
    });
  });
});
```

---

## Integration Guide

### Backend Requirements

**API Endpoint**: `GET /api/case/:caseId/image-status`

```typescript
// src/server/index.ts
router.get('/api/case/:caseId/image-status', async (req, res) => {
  const { caseId } = req.params;

  try {
    // Get case to know total counts
    const caseData = await CaseRepository.getCase(caseId);
    if (!caseData) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Check location images
    const locationTotal = caseData.locations?.length || 0;
    let locationCompleted = 0;

    if (caseData.locations) {
      for (const location of caseData.locations) {
        const imageUrl = await ImageStorageService.getLocationImageUrl(
          caseId,
          location.id
        );
        if (imageUrl) locationCompleted++;
      }
    }

    // Check evidence images
    const evidenceTotal = caseData.evidence?.length || 0;
    let evidenceCompleted = 0;

    if (caseData.evidence) {
      for (const evidence of caseData.evidence) {
        const imageUrl = await ImageStorageService.getEvidenceImageUrl(
          caseId,
          evidence.id
        );
        if (imageUrl) evidenceCompleted++;
      }
    }

    // Determine status
    const locationStatus = locationCompleted === 0
      ? 'pending'
      : locationCompleted < locationTotal
        ? 'in_progress'
        : 'complete';

    const evidenceStatus = evidenceCompleted === 0
      ? 'pending'
      : evidenceCompleted < evidenceTotal
        ? 'in_progress'
        : 'complete';

    const complete = locationStatus === 'complete' && evidenceStatus === 'complete';

    res.json({
      evidence: {
        status: evidenceStatus,
        total: evidenceTotal,
        completed: evidenceCompleted
      },
      location: {
        status: locationStatus,
        total: locationTotal,
        completed: locationCompleted
      },
      complete
    });

  } catch (error) {
    console.error('[image-status] Error:', error);
    res.status(500).json({ error: 'Failed to get image status' });
  }
});
```

### Frontend Integration (React)

```tsx
// src/client/components/investigation/LocationExplorerSection.tsx
import { useImagePolling } from '../../hooks/useImagePolling';
import { useCase } from '../../hooks/useCase';

export function LocationExplorerSection() {
  const { caseData, refetch: refetchCase } = useCase();

  const { status, isPolling, isComplete } = useImagePolling({
    caseId: caseData?.id || '',
    enabled: !!caseData && !caseData.locations?.[0]?.imageUrl,
    onComplete: () => {
      console.log('Location images ready!');
      refetchCase(); // Re-fetch case to get updated imageUrls
    }
  });

  return (
    <div>
      {isPolling && !isComplete && (
        <div className="polling-banner">
          <LoadingSpinner size="small" />
          <span>Generating location images...</span>
          <span className="progress">
            {status?.location.completed || 0}/{status?.location.total || 0}
          </span>
        </div>
      )}

      {/* Location cards */}
      {caseData?.locations?.map(location => (
        <LocationCard
          key={location.id}
          location={location}
        />
      ))}
    </div>
  );
}
```

### Frontend Integration (Devvit)

```tsx
// src/main.tsx
import { useImagePolling } from './client/hooks/useImagePolling';

Devvit.addCustomPostType({
  name: 'ArmchairSleuths',
  render: (context) => {
    const [caseData, setCaseData] = context.useState<CaseData | null>(null);
    const [currentScreen, setCurrentScreen] = context.useState('loading');

    // Polling for image generation
    const imagePollingStatus = useImagePolling({
      caseId: caseData?.id || '',
      enabled: currentScreen === 'investigation' && !!caseData,
      interval: 5000,
      timeout: 120000,
      onComplete: () => {
        // Re-fetch case data
        fetchCaseData();
      }
    });

    // Show polling indicator in investigation screen
    if (currentScreen === 'investigation' && imagePollingStatus.isPolling) {
      return (
        <vstack alignment="center middle" padding="medium">
          <text size="medium" weight="bold">
            Generating location images...
          </text>
          <text size="small" color="neutral-content-weak">
            {imagePollingStatus.status?.location.completed || 0}/
            {imagePollingStatus.status?.location.total || 0} complete
          </text>
        </vstack>
      );
    }

    // Rest of UI...
  }
});
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Infinite Polling

**Problem**: Poll never stops if backend never sets complete flag

**Solution**: Always set timeout and handle timeout gracefully

```typescript
const { status, error } = useImagePolling({
  caseId,
  timeout: 120000, // 2 minutes max
  onError: (err) => {
    if (err.message.includes('timeout')) {
      // Show user-friendly message
      showToast('Image generation taking longer than expected. Check back later.');
    }
  }
});
```

### Pitfall 2: Memory Leaks

**Problem**: Interval/timeout not cleared on unmount

**Solution**: Use refs and cleanup function

```typescript
useEffect(() => {
  // ... start polling

  return () => {
    clearInterval(pollIntervalRef.current);
    clearTimeout(timeoutTimerRef.current);
    abortControllerRef.current?.abort();
  };
}, []);
```

### Pitfall 3: Too Frequent Polling

**Problem**: Polling every 1s overloads backend

**Solution**: Use reasonable defaults (5s minimum)

```typescript
const RECOMMENDED_INTERVAL = 5000; // 5 seconds
const MIN_INTERVAL = 3000; // Don't allow < 3s
```

### Pitfall 4: Multiple Instances

**Problem**: Multiple components polling same case simultaneously

**Solution**: Create global polling cache

```typescript
// Global singleton per caseId
const globalPollingInstances = new Map<string, AbortController>();

function useImagePolling(options) {
  useEffect(() => {
    if (globalPollingInstances.has(options.caseId)) {
      // Another component already polling this case
      console.log('[useImagePolling] Skipping - already polling');
      return;
    }

    const controller = new AbortController();
    globalPollingInstances.set(options.caseId, controller);

    // ... polling logic

    return () => {
      globalPollingInstances.delete(options.caseId);
    };
  }, [options.caseId]);
}
```

---

## Performance Metrics

### Expected Performance

| Metric | Value | Notes |
|--------|-------|-------|
| Polling overhead | ~50ms per poll | Network + parsing |
| Memory usage | ~1KB | State + refs |
| CPU impact | Negligible | Timer-based, not continuous |
| Battery impact | Low | 5s interval is battery-friendly |

### Optimization Recommendations

1. **Adaptive Intervals**: Start at 5s, increase to 10s after 1 minute
2. **Background Tab Detection**: Pause polling when tab inactive
3. **Batch Status**: Include multiple types (evidence + location) in single request
4. **Cache Status**: Don't re-poll if already complete

---

## Future Enhancements

### P1 Enhancements

1. **Progress Events**: Server-Sent Events instead of polling
2. **Optimistic Updates**: Show generated images immediately
3. **Partial Results**: Display images as they're generated (1/5, 2/5, etc.)

### P2 Enhancements

1. **Retry Strategies**: Exponential backoff for retries
2. **Network Detection**: Pause polling when offline
3. **Analytics**: Track generation times and success rates
4. **A/B Testing**: Compare polling vs SSE performance

---

## Conclusion

The `useImagePolling` hook provides a robust, production-ready solution for auto-refreshing asynchronously-generated images. It balances user experience, performance, and error resilience while maintaining compatibility with both React and Devvit environments.

**Key Strengths**:
- Zero-config defaults (works out of box)
- Intelligent lifecycle management
- Memory leak prevention
- Error resilience
- Progressive enhancement (graceful degradation)

**Next Steps**:
1. Implement hook (see implementation file)
2. Add backend endpoint
3. Integrate in LocationExplorerSection
4. Test with real case generation
5. Monitor performance metrics

---

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Status**: Ready for Implementation
