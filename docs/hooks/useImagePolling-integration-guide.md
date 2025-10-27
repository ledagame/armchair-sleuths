# useImagePolling Integration Guide

**Version**: 1.0
**Date**: 2025-10-25
**Target**: Frontend developers integrating image polling

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Setup](#backend-setup)
3. [React Integration](#react-integration)
4. [Devvit Integration](#devvit-integration)
5. [UI Patterns](#ui-patterns)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Installation

The hook is already included in the project:

```
src/client/hooks/useImagePolling.ts
```

### Basic Usage

```tsx
import { useImagePolling } from '../hooks/useImagePolling';

function MyComponent({ caseData }) {
  const { status, isPolling, isComplete } = useImagePolling({
    caseId: caseData.id,
    enabled: true,
    onComplete: () => {
      console.log('Images ready!');
    }
  });

  if (isPolling && !isComplete) {
    return <div>Loading images... {status?.location.completed}/{status?.location.total}</div>;
  }

  return <div>Images loaded!</div>;
}
```

---

## Backend Setup

### Step 1: Create API Endpoint

Add the following endpoint to `src/server/index.ts`:

```typescript
/**
 * GET /api/case/:caseId/image-status
 *
 * Returns the current status of image generation for a case
 */
router.get('/api/case/:caseId/image-status', async (req, res) => {
  const { caseId } = req.params;

  try {
    // Get case data
    const caseData = await CaseRepository.getCase(caseId);

    if (!caseData) {
      return res.status(404).json({
        error: 'Case not found',
        message: `No case found with ID: ${caseId}`
      });
    }

    // Initialize counters
    const locationTotal = caseData.locations?.length || 0;
    let locationCompleted = 0;

    const evidenceTotal = caseData.evidence?.length || 0;
    let evidenceCompleted = 0;

    // Check location images
    if (caseData.locations && caseData.locations.length > 0) {
      const imageStorageService = new ImageStorageService(context.redis);

      for (const location of caseData.locations) {
        const imageUrl = await imageStorageService.getLocationImageUrl(
          caseId,
          location.id
        );
        if (imageUrl) {
          locationCompleted++;
        }
      }
    }

    // Check evidence images
    if (caseData.evidence && caseData.evidence.length > 0) {
      const imageStorageService = new ImageStorageService(context.redis);

      for (const evidence of caseData.evidence) {
        const imageUrl = await imageStorageService.getEvidenceImageUrl(
          caseId,
          evidence.id
        );
        if (imageUrl) {
          evidenceCompleted++;
        }
      }
    }

    // Determine statuses
    const locationStatus: 'pending' | 'in_progress' | 'complete' | 'failed' =
      locationCompleted === 0
        ? 'pending'
        : locationCompleted < locationTotal
        ? 'in_progress'
        : 'complete';

    const evidenceStatus: 'pending' | 'in_progress' | 'complete' | 'failed' =
      evidenceCompleted === 0
        ? 'pending'
        : evidenceCompleted < evidenceTotal
        ? 'in_progress'
        : 'complete';

    const complete = locationStatus === 'complete' && evidenceStatus === 'complete';

    // Return status
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
    console.error('[image-status] Error checking image status:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve image generation status'
    });
  }
});
```

### Step 2: Add ImageStorageService Methods (if not exists)

If `getLocationImageUrl` and `getEvidenceImageUrl` don't exist, add them to `src/server/services/image/ImageStorageService.ts`:

```typescript
/**
 * Retrieve location image URL from KV store
 */
async getLocationImageUrl(
  caseId: string,
  locationId: string
): Promise<string | undefined> {
  const key = `case:${caseId}:location:${locationId}:image`;
  return await this.kvStore.get(key);
}

/**
 * Retrieve evidence image URL from KV store
 */
async getEvidenceImageUrl(
  caseId: string,
  evidenceId: string
): Promise<string | undefined> {
  const key = `case:${caseId}:evidence:${evidenceId}:image`;
  return await this.kvStore.get(key);
}
```

### Step 3: Test Endpoint

```bash
# Start server
npm run dev

# In another terminal, test endpoint
curl http://localhost:3000/api/case/case-2025-10-25/image-status
```

**Expected Response**:

```json
{
  "evidence": {
    "status": "in_progress",
    "total": 10,
    "completed": 3
  },
  "location": {
    "status": "complete",
    "total": 5,
    "completed": 5
  },
  "complete": false
}
```

---

## React Integration

### Example 1: Location Explorer Component

```tsx
// src/client/components/investigation/LocationExplorerSection.tsx
import React from 'react';
import { useImagePolling } from '../../hooks/useImagePolling';
import { useCase } from '../../hooks/useCase';
import { LocationCard } from '../discovery/LocationCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function LocationExplorerSection() {
  const { caseData, refetch: refetchCase } = useCase();

  // Poll for image generation status
  const { status, isPolling, isComplete, error } = useImagePolling({
    caseId: caseData?.id || '',
    enabled: !!caseData,
    interval: 5000,
    timeout: 120000,
    onComplete: () => {
      console.log('Location images ready! Re-fetching case data...');
      refetchCase();
    },
    onError: (err) => {
      console.error('Image polling error:', err);
    }
  });

  if (!caseData) {
    return <div>Loading case data...</div>;
  }

  return (
    <div className="location-explorer">
      {/* Polling Progress Banner */}
      {isPolling && !isComplete && (
        <div className="polling-banner">
          <LoadingSpinner size="small" />
          <div className="polling-text">
            <span className="polling-title">Generating location images...</span>
            <span className="polling-progress">
              {status?.location.completed || 0}/{status?.location.total || 0} complete
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span className="error-text">
            Image generation taking longer than expected. Images will appear when ready.
          </span>
        </div>
      )}

      {/* Location Cards */}
      <div className="location-grid">
        {caseData.locations?.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            imageStatus={
              isPolling
                ? 'loading'
                : location.imageUrl
                ? 'loaded'
                : 'error'
            }
          />
        ))}
      </div>
    </div>
  );
}
```

### Example 2: Conditional Polling (Only When Relevant)

```tsx
// src/client/components/InvestigationScreen.tsx
import { useImagePolling } from '../hooks/useImagePolling';

export function InvestigationScreen({ caseData }) {
  const [activeTab, setActiveTab] = useState<'locations' | 'suspects' | 'evidence'>('locations');

  // Only poll when viewing locations tab AND images not yet loaded
  const shouldPoll = activeTab === 'locations' &&
                     !caseData.locations?.[0]?.imageUrl;

  const { status, isPolling } = useImagePolling({
    caseId: caseData.id,
    enabled: shouldPoll, // Conditional polling
    onComplete: () => refetchCase()
  });

  return (
    <div>
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'locations' && (
        <>
          {isPolling && <PollingIndicator status={status} />}
          <LocationExplorer locations={caseData.locations} />
        </>
      )}

      {/* Other tabs... */}
    </div>
  );
}
```

### Example 3: Manual Retry on Error

```tsx
// src/client/components/ImagePollingErrorBoundary.tsx
import { useImagePolling } from '../hooks/useImagePolling';

export function ImagePollingErrorBoundary({ caseData, children }) {
  const { status, isPolling, error, reset } = useImagePolling({
    caseId: caseData.id,
    enabled: true,
    timeout: 180000, // 3 minutes
    onComplete: () => refetchCase()
  });

  // If timeout or error, show retry UI
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h3>Image Generation Delayed</h3>
          <p>
            Location images are taking longer than expected.
            This can happen during high traffic.
          </p>
        </div>
        <button onClick={reset} className="retry-button">
          Retry Image Loading
        </button>
        <button onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>
    );
  }

  return children;
}
```

---

## Devvit Integration

### Example 1: Main Custom Post

```tsx
// src/main.tsx
import { Devvit } from '@devvit/public-api';
import { useImagePolling } from './client/hooks/useImagePolling';

Devvit.addCustomPostType({
  name: 'ArmchairSleuths',
  render: (context) => {
    const [caseData, setCaseData] = context.useState<CaseData | null>(null);
    const [currentScreen, setCurrentScreen] = context.useState<GameScreen>('loading');

    // Polling hook
    const imagePollingStatus = useImagePolling({
      caseId: caseData?.id || '',
      enabled: currentScreen === 'investigation' && !!caseData,
      interval: 5000,
      timeout: 120000,
      onComplete: () => {
        console.log('[Devvit] Image generation complete! Re-fetching case...');
        // Re-fetch case data to get updated imageUrls
        fetchCaseData();
      },
      onError: (err) => {
        console.error('[Devvit] Image polling error:', err);
      }
    });

    // Investigation screen with polling indicator
    if (currentScreen === 'investigation') {
      return (
        <vstack gap="medium" padding="medium">
          {/* Polling Banner */}
          {imagePollingStatus.isPolling && !imagePollingStatus.isComplete && (
            <vstack
              alignment="center middle"
              padding="medium"
              backgroundColor="neutral-background-weak"
              cornerRadius="medium"
            >
              <text size="medium" weight="bold" color="neutral-content">
                🖼️ Generating location images...
              </text>
              <text size="small" color="neutral-content-weak">
                {imagePollingStatus.status?.location.completed || 0}/
                {imagePollingStatus.status?.location.total || 0} complete
              </text>
            </vstack>
          )}

          {/* Investigation UI */}
          <InvestigationContent caseData={caseData} />
        </vstack>
      );
    }

    // Other screens...
  }
});
```

### Example 2: Devvit with useAsync Pattern

```tsx
// If using Devvit's useAsync for data fetching
const [caseDataAsync] = context.useAsync(async () => {
  const response = await fetch(`/api/case/${postData.caseId}`);
  return response.json();
}, {
  depends: [postData.caseId]
});

// Combine with polling
const imageStatus = useImagePolling({
  caseId: caseDataAsync.data?.id || '',
  enabled: !!caseDataAsync.data && currentScreen === 'investigation',
  onComplete: () => {
    // Trigger useAsync refetch
    caseDataAsync.refetch?.();
  }
});
```

---

## UI Patterns

### Pattern 1: Inline Progress Bar

```tsx
function PollingProgressBar({ status }) {
  if (!status) return null;

  const progress = status.location.total > 0
    ? (status.location.completed / status.location.total) * 100
    : 0;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="progress-text">
        {status.location.completed}/{status.location.total} images ready
      </span>
    </div>
  );
}

// CSS
.progress-container {
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #66bb6a);
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #666;
}
```

### Pattern 2: Toast Notification on Complete

```tsx
import { useImagePolling } from '../hooks/useImagePolling';
import { useToast } from '../hooks/useToast';

function MyComponent({ caseData }) {
  const { showToast } = useToast();

  const { status, isPolling } = useImagePolling({
    caseId: caseData.id,
    enabled: true,
    onComplete: () => {
      showToast({
        type: 'success',
        title: 'Images Loaded!',
        message: 'Location images are now available',
        duration: 3000
      });
      refetchCase();
    }
  });

  return (/* ... */);
}
```

### Pattern 3: Skeleton Loader Transition

```tsx
function LocationCard({ location, imageStatus }) {
  return (
    <div className="location-card">
      {imageStatus === 'loading' ? (
        <div className="skeleton-loader">
          <div className="skeleton-image" />
          <div className="skeleton-text" />
        </div>
      ) : location.imageUrl ? (
        <img
          src={location.imageUrl}
          alt={location.name}
          className="location-image fade-in"
        />
      ) : (
        <div className="emoji-fallback">
          <span className="emoji-large">{location.emoji}</span>
        </div>
      )}
      <h3>{location.name}</h3>
      <p>{location.description}</p>
    </div>
  );
}

// CSS
.skeleton-loader {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Pattern 4: Devvit Progress Indicator

```tsx
// Devvit Blocks version
{imagePollingStatus.isPolling && (
  <vstack
    alignment="center middle"
    padding="medium"
    gap="small"
    backgroundColor="secondary-background"
    cornerRadius="medium"
  >
    <text size="large">🎨</text>
    <text size="medium" weight="bold">
      Creating location images...
    </text>
    <hstack gap="small">
      <text size="small" color="secondary-plain">
        Progress:
      </text>
      <text size="small" weight="bold">
        {imagePollingStatus.status?.location.completed || 0}/
        {imagePollingStatus.status?.location.total || 0}
      </text>
    </hstack>
  </vstack>
)}
```

---

## Testing

### Unit Tests

```typescript
// src/client/hooks/__tests__/useImagePolling.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useImagePolling } from '../useImagePolling';

// Mock fetch
global.fetch = jest.fn();

describe('useImagePolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start polling when enabled', () => {
    const { result } = renderHook(() =>
      useImagePolling({
        caseId: 'test-case',
        enabled: true,
        interval: 5000
      })
    );

    expect(result.current.isPolling).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/case/test-case/image-status',
      expect.any(Object)
    );
  });

  it('should stop polling when status.complete is true', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        evidence: { status: 'complete', total: 5, completed: 5 },
        location: { status: 'complete', total: 5, completed: 5 },
        complete: true
      })
    });

    const onComplete = jest.fn();

    const { result } = renderHook(() =>
      useImagePolling({
        caseId: 'test-case',
        enabled: true,
        onComplete
      })
    );

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
      expect(onComplete).toHaveBeenCalled();
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('should retry on network error', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          evidence: { status: 'pending', total: 5, completed: 0 },
          location: { status: 'pending', total: 5, completed: 0 },
          complete: false
        })
      });

    const { result } = renderHook(() =>
      useImagePolling({
        caseId: 'test-case',
        enabled: true,
        interval: 1000
      })
    );

    // Fast-forward to next poll
    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.status).not.toBeNull();
    });
  });

  it('should stop after max retries', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const onError = jest.fn();

    const { result } = renderHook(() =>
      useImagePolling({
        caseId: 'test-case',
        enabled: true,
        interval: 1000,
        onError
      })
    );

    // Fast-forward through retries
    for (let i = 0; i < 3; i++) {
      jest.advanceTimersByTime(1000);
      await waitFor(() => {});
    }

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
      expect(onError).toHaveBeenCalled();
      expect(result.current.isPolling).toBe(false);
    });
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      useImagePolling({
        caseId: 'test-case',
        enabled: true
      })
    );

    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should reset state on reset()', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        complete: false,
        location: { status: 'pending', total: 5, completed: 0 }
      })
    });

    const { result } = renderHook(() =>
      useImagePolling({
        caseId: 'test-case',
        enabled: false // Start disabled
      })
    );

    expect(result.current.isPolling).toBe(false);

    // Manually reset
    result.current.reset();

    await waitFor(() => {
      expect(result.current.isPolling).toBe(true);
    });
  });
});
```

### Integration Test

```typescript
// src/client/components/__tests__/LocationExplorerSection.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { LocationExplorerSection } from '../investigation/LocationExplorerSection';
import * as useImagePollingModule from '../../hooks/useImagePolling';

jest.mock('../../hooks/useImagePolling');

describe('LocationExplorerSection with polling', () => {
  it('should show polling indicator while loading', () => {
    jest.spyOn(useImagePollingModule, 'useImagePolling').mockReturnValue({
      status: {
        location: { status: 'in_progress', total: 5, completed: 2 },
        evidence: { status: 'pending', total: 10, completed: 0 },
        complete: false
      },
      isPolling: true,
      isComplete: false,
      error: null,
      reset: jest.fn()
    });

    render(<LocationExplorerSection />);

    expect(screen.getByText(/Generating location images/i)).toBeInTheDocument();
    expect(screen.getByText(/2\/5 complete/i)).toBeInTheDocument();
  });

  it('should hide polling indicator when complete', () => {
    jest.spyOn(useImagePollingModule, 'useImagePolling').mockReturnValue({
      status: {
        location: { status: 'complete', total: 5, completed: 5 },
        evidence: { status: 'complete', total: 10, completed: 10 },
        complete: true
      },
      isPolling: false,
      isComplete: true,
      error: null,
      reset: jest.fn()
    });

    render(<LocationExplorerSection />);

    expect(screen.queryByText(/Generating location images/i)).not.toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Issue 1: Polling Never Stops

**Symptoms**:
- `isPolling` stays true indefinitely
- Backend shows `complete: true` but hook doesn't detect it

**Causes**:
1. Backend not returning `complete: true`
2. Network error preventing status update
3. Callback dependency issue

**Solutions**:

```typescript
// Check backend response
curl http://localhost:3000/api/case/YOUR_CASE_ID/image-status

// Should return:
{
  "complete": true, // ← Must be true
  "location": { "status": "complete", ... }
}

// Add debug logging
const { status, isPolling } = useImagePolling({
  caseId,
  onComplete: () => {
    console.log('[DEBUG] onComplete triggered!');
    console.log('[DEBUG] Current status:', status);
  }
});

// Check if callback is being memoized incorrectly
const refetchCase = useCallback(() => {
  // ... refetch logic
}, []); // ← Ensure proper dependencies
```

### Issue 2: Memory Leak

**Symptoms**:
- Console warning: "Can't perform state update on unmounted component"
- Increasing memory usage

**Causes**:
- Polling continues after component unmount
- Missing cleanup in useEffect

**Solutions**:

```typescript
// Hook already handles cleanup, but verify usage:
useEffect(() => {
  // If you're calling startPolling manually, ensure cleanup:
  return () => {
    stopPolling();
  };
}, []);

// Check for multiple instances polling same case
console.log('[DEBUG] Polling instances:', globalPollingInstances.size);
```

### Issue 3: Too Many Requests

**Symptoms**:
- Backend logs show excessive polling
- Network tab shows requests every second

**Causes**:
- Interval set too low
- Multiple components polling simultaneously

**Solutions**:

```typescript
// Use reasonable interval (minimum 3s recommended)
const { status } = useImagePolling({
  caseId,
  interval: 5000, // ← Not less than 3000ms
  timeout: 120000
});

// Prevent multiple instances (use global tracker)
import { globalPollingInstances } from '../hooks/useImagePolling';

useEffect(() => {
  if (globalPollingInstances.has(caseId)) {
    console.log('[WARN] Already polling this case');
    return;
  }
  // ... start polling
}, [caseId]);
```

### Issue 4: Timeout Too Short

**Symptoms**:
- Polling stops before images ready
- Error: "Polling timeout exceeded"

**Causes**:
- Default 2-minute timeout too short for slow image generation

**Solutions**:

```typescript
// Increase timeout for production
const { status } = useImagePolling({
  caseId,
  timeout: 300000, // 5 minutes instead of 2
  onError: (err) => {
    if (err.message.includes('timeout')) {
      // Show user-friendly message instead of error
      console.log('[INFO] Image generation taking longer than expected');
    }
  }
});
```

### Issue 5: Devvit useState Issues

**Symptoms**:
- Hook doesn't work in Devvit Custom Post
- Error: "useState is not a function"

**Causes**:
- Using React's useState instead of context.useState

**Solutions**:

```typescript
// ❌ Wrong: React useState in Devvit
import { useState } from 'react';

// ✅ Correct: Use Devvit context.useState
Devvit.addCustomPostType({
  render: (context) => {
    // Pass context to hook OR use context.useState directly
    const [isPolling, setIsPolling] = context.useState(false);

    // Hook uses standard React hooks, should work in Devvit
    const { status } = useImagePolling({ caseId });
  }
});
```

---

## Performance Tips

### 1. Conditional Polling

Only poll when necessary:

```typescript
const shouldPoll = currentScreen === 'investigation' &&
                   !caseData.locations?.[0]?.imageUrl;

const { status } = useImagePolling({
  caseId,
  enabled: shouldPoll // Only poll when relevant
});
```

### 2. Adaptive Intervals

Start fast, slow down over time:

```typescript
const [interval, setInterval] = useState(5000);

const { status } = useImagePolling({
  caseId,
  interval,
  onComplete: () => {
    // Success - no need to adjust
  }
});

// After 10 polls, slow down
useEffect(() => {
  const timer = setTimeout(() => {
    setInterval(10000); // Increase to 10s after 50s
  }, 50000);

  return () => clearTimeout(timer);
}, []);
```

### 3. Global Instance Tracker

Prevent duplicate polling:

```typescript
import { globalPollingInstances } from '../hooks/useImagePolling';

if (globalPollingInstances.has(caseId)) {
  console.log('Another component is already polling. Skipping.');
  return;
}
```

### 4. Cache Status

Store status in localStorage to avoid re-polling:

```typescript
useEffect(() => {
  const cached = localStorage.getItem(`poll-status-${caseId}`);
  if (cached && JSON.parse(cached).complete) {
    // Already complete, skip polling
    setIsComplete(true);
    return;
  }
}, [caseId]);

const { status } = useImagePolling({
  caseId,
  onComplete: () => {
    localStorage.setItem(`poll-status-${caseId}`, JSON.stringify({
      complete: true,
      timestamp: Date.now()
    }));
  }
});
```

---

## Next Steps

1. **Implement backend endpoint** (see Backend Setup)
2. **Integrate hook in LocationExplorerSection** (see React Integration)
3. **Add UI indicators** (see UI Patterns)
4. **Test thoroughly** (see Testing)
5. **Monitor in production** (check polling frequency, timeout rates)

---

**Document Version**: 1.0
**Last Updated**: 2025-10-25
**Status**: Ready for Use
