# Frontend Evidence System - Implementation Examples

## Quick Start Examples

Real-world code examples for implementing the improved evidence system.

---

## Example 1: Basic Error Boundary

Wrap any component to catch errors:

```tsx
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

function MyGameComponent() {
  return (
    <ErrorBoundary>
      <GameBoard />
      <SuspectPanel />
      <EvidenceNotebook />
    </ErrorBoundary>
  );
}
```

**Custom fallback**:

```tsx
<ErrorBoundary
  fallback={
    <div className="p-6 text-center">
      <h2 className="text-xl font-bold text-red-400">
        게임을 불러올 수 없습니다
      </h2>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-6 py-2 bg-red-500 text-white rounded"
      >
        새로고침
      </button>
    </div>
  }
  onError={(error, errorInfo) => {
    console.error('Game error:', error);
    // Send to error tracking service
    analytics.track('game_error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }}
>
  <Game />
</ErrorBoundary>
```

---

## Example 2: API Call with Retry

Simple fetch with automatic retry:

```tsx
import { fetchJsonWithRetry } from '@/utils/apiRetry';

async function loadPlayerData(caseId: string, userId: string) {
  try {
    const data = await fetchJsonWithRetry<PlayerState>(
      `/api/player-state/${caseId}/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        maxRetries: 3,
        initialDelay: 1000,
        onRetry: (error, attempt, delay) => {
          console.log(`Retrying (${attempt}/3) in ${delay}ms...`);
        },
      }
    );

    return data;
  } catch (error) {
    console.error('Failed to load player data:', error);
    throw error;
  }
}
```

**Custom retry logic**:

```tsx
import { retryWithBackoff } from '@/utils/apiRetry';

async function submitAccusation(caseId: string, suspectId: string) {
  return retryWithBackoff(
    async () => {
      const response = await fetch('/api/accuse', {
        method: 'POST',
        body: JSON.stringify({ caseId, suspectId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response.json();
    },
    {
      maxRetries: 2, // Only retry twice for mutations
      shouldRetry: (error, attempt) => {
        // Only retry on server errors, not client errors
        return error.message.includes('500') || error.message.includes('503');
      },
    }
  );
}
```

---

## Example 3: Loading States

Show skeleton during load:

```tsx
import { useState, useEffect } from 'react';
import {
  EvidenceNotebookSkeleton,
  EvidenceListSkeleton
} from '@/components/common/LoadingSkeleton';

function EvidencePanel({ caseId, userId }) {
  const [loading, setLoading] = useState(true);
  const [evidence, setEvidence] = useState([]);

  useEffect(() => {
    loadEvidence();
  }, [caseId, userId]);

  async function loadEvidence() {
    setLoading(true);
    try {
      const data = await fetchJsonWithRetry(...);
      setEvidence(data.discoveredEvidence);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <EvidenceListSkeleton count={6} />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {evidence.map(item => (
        <EvidenceCard key={item.id} evidence={item} />
      ))}
    </div>
  );
}
```

**Inline loading spinner**:

```tsx
import { LoadingSpinner, InlineLoading } from '@/components/common/LoadingSkeleton';

function SearchButton({ onSearch, isSearching }) {
  return (
    <button
      onClick={onSearch}
      disabled={isSearching}
      className="px-6 py-3 bg-detective-gold rounded"
    >
      {isSearching ? (
        <InlineLoading text="탐색 중..." />
      ) : (
        '탐색 시작'
      )}
    </button>
  );
}
```

---

## Example 4: Empty States

Show helpful empty state:

```tsx
import { EmptyEvidenceState, FilteredEmptyState } from '@/components/common/EmptyState';

function EvidenceList({ evidence, filter, onClearFilter, onExplore }) {
  // No evidence at all
  if (evidence.length === 0) {
    return (
      <EmptyEvidenceState
        onExplore={() => {
          console.log('Navigate to exploration');
          onExplore();
        }}
      />
    );
  }

  // Filter returned no results
  const filteredEvidence = evidence.filter(e => e.type === filter);
  if (filteredEvidence.length === 0) {
    return (
      <FilteredEmptyState
        filterType={filter}
        onClearFilter={() => {
          console.log('Clear filter');
          onClearFilter();
        }}
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {filteredEvidence.map(item => (
        <EvidenceCard key={item.id} evidence={item} />
      ))}
    </div>
  );
}
```

**Custom empty state**:

```tsx
import { EmptyState } from '@/components/common/EmptyState';

function SuspectPanel({ suspects }) {
  if (suspects.length === 0) {
    return (
      <EmptyState
        icon="🕵️"
        title="용의자 정보 없음"
        description="아직 용의자 정보를 수집하지 못했습니다. 증거를 수집하고 대화를 진행하세요."
        action={{
          label: '증거 수집하기',
          onClick: () => navigateToEvidence(),
        }}
      >
        <div className="mt-6 text-sm text-gray-400">
          <p>💡 팁: 용의자와 대화하면 추가 정보를 얻을 수 있습니다</p>
        </div>
      </EmptyState>
    );
  }

  return (
    <div>
      {suspects.map(suspect => (
        <SuspectCard key={suspect.id} suspect={suspect} />
      ))}
    </div>
  );
}
```

---

## Example 5: Lazy Loading Images

Basic lazy image:

```tsx
import { LazyImage } from '@/components/common/LazyImage';

function EvidencePhoto({ evidence }) {
  return (
    <div className="aspect-video">
      <LazyImage
        src={evidence.imageUrl}
        alt={evidence.name}
        fallbackSrc="/images/evidence-placeholder.jpg"
        className="w-full h-full rounded-lg"
        onLoad={() => console.log('Image loaded')}
        onError={(error) => console.error('Image failed:', error)}
      />
    </div>
  );
}
```

**Evidence-specific image with fallback**:

```tsx
import { EvidenceImage } from '@/components/common/LazyImage';

function EvidenceCard({ evidence }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Image with automatic fallback */}
      <EvidenceImage
        evidenceId={evidence.id}
        imageUrl={evidence.imageUrl}
        evidenceName={evidence.name}
        className="w-full h-48"
      />

      {/* Card content */}
      <div className="p-4">
        <h3 className="font-bold">{evidence.name}</h3>
        <p className="text-sm text-gray-400">{evidence.description}</p>
      </div>
    </div>
  );
}
```

**Suspect avatar with fallback**:

```tsx
import { SuspectImage } from '@/components/common/LazyImage';

function SuspectAvatar({ suspect, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-48 h-48',
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
      <SuspectImage
        suspectId={suspect.id}
        imageUrl={suspect.imageUrl}
        suspectName={suspect.name}
        eager={size === 'sm'} // Load small images immediately
      />
    </div>
  );
}
```

---

## Example 6: Complete Component with All Features

Full-featured evidence list component:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { EvidenceListSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyEvidenceState, ErrorState } from '@/components/common/EmptyState';
import { EvidenceImage } from '@/components/common/LazyImage';
import { fetchJsonWithRetry } from '@/utils/apiRetry';

interface EvidenceListProps {
  caseId: string;
  userId: string;
  onNavigateToExplore?: () => void;
}

function EvidenceListComponent({ caseId, userId, onNavigateToExplore }: EvidenceListProps) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  // Load evidence with retry
  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJsonWithRetry<PlayerState>(
        `/api/player-state/${caseId}/${userId}`,
        {},
        {
          maxRetries: 3,
          onRetry: (error, attempt) => {
            console.log(`Retry ${attempt}/3:`, error.message);
          },
        }
      );

      setEvidence(data.discoveredEvidence || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('Failed to load evidence:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId, userId]);

  // Initial load
  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  // Loading state
  if (loading) {
    return <EvidenceListSkeleton count={6} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        onRetry={loadEvidence}
      />
    );
  }

  // Empty state
  if (evidence.length === 0) {
    return (
      <EmptyEvidenceState
        onExplore={onNavigateToExplore}
      />
    );
  }

  // Filter evidence
  const filteredEvidence = filter === 'all'
    ? evidence
    : evidence.filter(e => e.type === filter);

  // Get unique types for filter buttons
  const types = Array.from(new Set(evidence.map(e => e.type)));

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${
            filter === 'all' ? 'bg-detective-gold' : 'bg-gray-800'
          }`}
        >
          전체 ({evidence.length})
        </button>
        {types.map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded ${
              filter === type ? 'bg-detective-gold' : 'bg-gray-800'
            }`}
          >
            {type} ({evidence.filter(e => e.type === type).length})
          </button>
        ))}
      </div>

      {/* Evidence grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvidence.map(item => (
          <div
            key={item.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            <EvidenceImage
              evidenceId={item.id}
              imageUrl={item.imageUrl}
              evidenceName={item.name}
              className="w-full h-48"
            />
            <div className="p-4">
              <h3 className="font-bold mb-2">{item.name}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export wrapped in error boundary
export function EvidenceList(props: EvidenceListProps) {
  return (
    <ErrorBoundary>
      <EvidenceListComponent {...props} />
    </ErrorBoundary>
  );
}
```

---

## Example 7: Custom Hook for Evidence Data

Reusable hook:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { fetchJsonWithRetry } from '@/utils/apiRetry';

interface UseEvidenceOptions {
  maxRetries?: number;
  autoLoad?: boolean;
}

export function useEvidence(
  caseId: string,
  userId: string,
  options: UseEvidenceOptions = {}
) {
  const { maxRetries = 3, autoLoad = true } = options;

  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadEvidence = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchJsonWithRetry<PlayerState>(
        `/api/player-state/${caseId}/${userId}`,
        {},
        { maxRetries }
      );

      setEvidence(data.discoveredEvidence || []);
      return data.discoveredEvidence;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [caseId, userId, maxRetries]);

  const refetch = useCallback(() => {
    return loadEvidence();
  }, [loadEvidence]);

  const reset = useCallback(() => {
    setEvidence([]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadEvidence();
    }
  }, [autoLoad, loadEvidence]);

  return {
    evidence,
    loading,
    error,
    refetch,
    reset,
  };
}

// Usage
function EvidencePanel({ caseId, userId }) {
  const { evidence, loading, error, refetch } = useEvidence(caseId, userId);

  if (loading) return <EvidenceListSkeleton />;
  if (error) return <ErrorState error={error.message} onRetry={refetch} />;
  if (evidence.length === 0) return <EmptyEvidenceState />;

  return (
    <div>
      {evidence.map(item => (
        <EvidenceCard key={item.id} evidence={item} />
      ))}
    </div>
  );
}
```

---

## Example 8: Progress Indicator with Empty State

Show progress toward completion:

```tsx
import { ProgressEmptyState } from '@/components/common/EmptyState';

function CaseProgress({ evidence, totalPossible }) {
  const discovered = evidence.length;

  if (discovered === 0) {
    return <EmptyEvidenceState />;
  }

  if (discovered < totalPossible) {
    return (
      <div>
        <ProgressEmptyState
          current={discovered}
          total={totalPossible}
          label="증거"
          onContinue={() => navigateToExplore()}
        />

        {/* Show discovered evidence below */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          {evidence.map(item => (
            <EvidenceCard key={item.id} evidence={item} />
          ))}
        </div>
      </div>
    );
  }

  // All evidence found!
  return (
    <div>
      <div className="text-center py-6 bg-green-900/20 border-2 border-green-500 rounded-lg mb-6">
        <span className="text-4xl mb-2">✅</span>
        <h3 className="text-xl font-bold text-green-400">
          모든 증거를 발견했습니다!
        </h3>
        <p className="text-green-300 mt-2">
          이제 범인을 지목할 준비가 되었습니다
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {evidence.map(item => (
          <EvidenceCard key={item.id} evidence={item} />
        ))}
      </div>
    </div>
  );
}
```

---

## Example 9: Optimistic Updates

Update UI before server response:

```tsx
import { useState, useCallback } from 'react';

function EvidenceWithOptimisticUpdate({ caseId, userId }) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [pendingAdds, setPendingAdds] = useState<Set<string>>(new Set());

  const discoverEvidence = useCallback(async (newEvidence: EvidenceItem) => {
    // Optimistically add to UI
    setEvidence(prev => [...prev, newEvidence]);
    setPendingAdds(prev => new Set(prev).add(newEvidence.id));

    try {
      // Send to server
      await fetchJsonWithRetry('/api/evidence/discover', {
        method: 'POST',
        body: JSON.stringify({ caseId, userId, evidenceId: newEvidence.id }),
      });

      // Success - remove from pending
      setPendingAdds(prev => {
        const next = new Set(prev);
        next.delete(newEvidence.id);
        return next;
      });
    } catch (error) {
      // Failed - remove from UI
      setEvidence(prev => prev.filter(e => e.id !== newEvidence.id));
      setPendingAdds(prev => {
        const next = new Set(prev);
        next.delete(newEvidence.id);
        return next;
      });

      console.error('Failed to discover evidence:', error);
      alert('증거 발견에 실패했습니다');
    }
  }, [caseId, userId]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {evidence.map(item => (
        <div
          key={item.id}
          className={`
            border rounded-lg p-4
            ${pendingAdds.has(item.id) ? 'opacity-50 animate-pulse' : ''}
          `}
        >
          <EvidenceCard evidence={item} />
          {pendingAdds.has(item.id) && (
            <div className="text-xs text-gray-400 mt-2">
              저장 중...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Example 10: Offline Support with localStorage

Cache data locally:

```tsx
import { useState, useEffect, useCallback } from 'react';

const CACHE_KEY = 'evidence_cache';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  evidence: EvidenceItem[];
  timestamp: number;
}

function useEvidenceWithCache(caseId: string, userId: string) {
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);

  const loadEvidence = useCallback(async () => {
    // Try cache first
    const cacheKey = `${CACHE_KEY}_${caseId}_${userId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const data: CachedData = JSON.parse(cached);
        const age = Date.now() - data.timestamp;

        if (age < CACHE_TTL) {
          console.log('Using cached evidence');
          setEvidence(data.evidence);
          setIsFromCache(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Cache parse error:', error);
      }
    }

    // Fetch from server
    setLoading(true);
    setIsFromCache(false);

    try {
      const playerState = await fetchJsonWithRetry<PlayerState>(
        `/api/player-state/${caseId}/${userId}`
      );

      const evidence = playerState.discoveredEvidence || [];
      setEvidence(evidence);

      // Update cache
      const cacheData: CachedData = {
        evidence,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      // If offline, try showing stale cache
      if (cached) {
        const data: CachedData = JSON.parse(cached);
        setEvidence(data.evidence);
        setIsFromCache(true);
        console.log('Using stale cache due to network error');
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  }, [caseId, userId]);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

  return {
    evidence,
    loading,
    isFromCache,
    refetch: loadEvidence,
  };
}

// Usage
function EvidencePanel({ caseId, userId }) {
  const { evidence, loading, isFromCache, refetch } = useEvidenceWithCache(caseId, userId);

  return (
    <div>
      {isFromCache && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-500 rounded">
          <span className="text-yellow-400">⚠️ 캐시된 데이터를 표시 중</span>
          <button onClick={refetch} className="ml-4 underline">
            새로고침
          </button>
        </div>
      )}

      {loading ? (
        <EvidenceListSkeleton />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {evidence.map(item => (
            <EvidenceCard key={item.id} evidence={item} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Performance Tips

### 1. Memoize Expensive Computations

```tsx
import { useMemo } from 'react';

function EvidenceList({ evidence, filter }) {
  // Memoize filtered list
  const filteredEvidence = useMemo(() => {
    return evidence.filter(e => filter === 'all' || e.type === filter);
  }, [evidence, filter]);

  // Memoize sort
  const sortedEvidence = useMemo(() => {
    return [...filteredEvidence].sort((a, b) => {
      const order = { critical: 0, important: 1, minor: 2 };
      return order[a.relevance] - order[b.relevance];
    });
  }, [filteredEvidence]);

  return (
    <div>
      {sortedEvidence.map(item => (
        <EvidenceCard key={item.id} evidence={item} />
      ))}
    </div>
  );
}
```

### 2. Virtualize Long Lists

```tsx
import { FixedSizeList } from 'react-window';

function VirtualizedEvidenceList({ evidence }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <EvidenceCard evidence={evidence[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={evidence.length}
      itemSize={200}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 3. Debounce Search

```tsx
import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

function EvidenceSearch({ evidence }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(evidence);

  const performSearch = useCallback(
    debounce((term: string) => {
      const filtered = evidence.filter(e =>
        e.name.toLowerCase().includes(term.toLowerCase()) ||
        e.description.toLowerCase().includes(term.toLowerCase())
      );
      setResults(filtered);
    }, 300),
    [evidence]
  );

  useEffect(() => {
    performSearch(searchTerm);
  }, [searchTerm, performSearch]);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        placeholder="증거 검색..."
      />
      <div className="grid grid-cols-3 gap-4">
        {results.map(item => (
          <EvidenceCard key={item.id} evidence={item} />
        ))}
      </div>
    </div>
  );
}
```

---

## Accessibility Examples

### Keyboard Navigation

```tsx
function EvidenceCard({ evidence, onClick }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="border rounded-lg p-4 cursor-pointer focus:ring-2 focus:ring-detective-gold"
      aria-label={`${evidence.name} 증거 카드, 클릭하여 상세 정보 보기`}
    >
      <h3>{evidence.name}</h3>
      <p>{evidence.description}</p>
    </div>
  );
}
```

### Screen Reader Announcements

```tsx
function EvidenceLoadingStatus({ loading, error, evidenceCount }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {loading && '증거 목록을 불러오는 중입니다'}
      {error && `오류 발생: ${error}`}
      {!loading && !error && `${evidenceCount}개의 증거를 불러왔습니다`}
    </div>
  );
}
```

---

## Testing Examples

### Unit Test

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { EvidenceList } from './EvidenceList';

describe('EvidenceList', () => {
  it('shows empty state when no evidence', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ discoveredEvidence: [] }),
      })
    );

    render(<EvidenceList caseId="case-1" userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText(/아직 발견한 증거가 없습니다/)).toBeInTheDocument();
    });
  });

  it('displays evidence cards', async () => {
    const mockEvidence = [
      { id: '1', name: 'Evidence 1', type: 'physical' },
      { id: '2', name: 'Evidence 2', type: 'testimony' },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ discoveredEvidence: mockEvidence }),
      })
    );

    render(<EvidenceList caseId="case-1" userId="user-1" />);

    await waitFor(() => {
      expect(screen.getByText('Evidence 1')).toBeInTheDocument();
      expect(screen.getByText('Evidence 2')).toBeInTheDocument();
    });
  });
});
```

---

## Questions?

Check:
1. [EVIDENCE_SYSTEM_ARCHITECTURE.md](./EVIDENCE_SYSTEM_ARCHITECTURE.md) - Full architecture docs
2. [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Step-by-step migration
3. Component source code - Inline documentation

**Last Updated**: 2025-10-23
