/**
 * ImprovedEvidenceNotebookSection.tsx
 *
 * Enhanced evidence notebook with error handling, retry logic, and empty states
 * Production-ready component with graceful degradation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EvidenceCard } from './EvidenceCard';
import { EvidenceDetailModal } from './EvidenceDetailModal';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { EvidenceNotebookSkeleton, FilterBarSkeleton } from '../common/LoadingSkeleton';
import { EmptyEvidenceState, FilteredEmptyState, ErrorState, NotFoundState } from '../common/EmptyState';
import { fetchJsonWithRetry } from '../../utils/apiRetry';
import type { EvidenceItem } from '@/shared/types/Evidence';

export interface EvidenceNotebookSectionProps {
  caseId: string;
  userId: string;
  selectedEvidenceId?: string | null;
  onClearSelection?: () => void;
  onNavigateToExplore?: () => void;
}

interface PlayerState {
  discoveredEvidence: EvidenceItem[];
  searchHistory: Array<{
    locationId: string;
    searchType: string;
    timestamp: Date;
    evidenceFound: number;
  }>;
  actionPoints: {
    current: number;
    total: number;
    spent: number;
  };
}

type LoadingState = 'idle' | 'loading' | 'retrying' | 'success' | 'error';

/**
 * Enhanced EvidenceNotebookSection Component
 */
export function ImprovedEvidenceNotebookSection({
  caseId,
  userId,
  selectedEvidenceId,
  onClearSelection,
  onNavigateToExplore,
}: EvidenceNotebookSectionProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Fetch player state with retry logic
   */
  const fetchPlayerState = useCallback(async () => {
    try {
      setLoadingState(retryCount > 0 ? 'retrying' : 'loading');
      setError(null);

      const data = await fetchJsonWithRetry<PlayerState>(
        `/api/player-state/${caseId}/${userId}`,
        {},
        {
          maxRetries: 3,
          onRetry: (error, attempt) => {
            console.log(`Retrying player state fetch (attempt ${attempt}):`, error.message);
            setLoadingState('retrying');
          },
        }
      );

      setPlayerState(data);
      setLoadingState('success');
      setRetryCount(0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';

      // Handle specific error cases
      if (errorMessage.includes('404')) {
        setError('플레이어 데이터를 찾을 수 없습니다. 새로운 게임을 시작하세요.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        setError('네트워크 연결을 확인할 수 없습니다. 인터넷 연결을 확인하세요.');
      } else if (errorMessage.includes('500') || errorMessage.includes('503')) {
        setError('서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도하세요.');
      } else {
        setError('증거 목록을 불러올 수 없습니다. 다시 시도하거나 페이지를 새로고침하세요.');
      }

      setLoadingState('error');
      console.error('Failed to fetch player state:', err);
    }
  }, [caseId, userId, retryCount]);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchPlayerState();
  }, [fetchPlayerState]);

  /**
   * Handle manual retry
   */
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    fetchPlayerState();
  }, [fetchPlayerState]);

  /**
   * Auto-open detail modal for selected evidence ID
   */
  useEffect(() => {
    if (selectedEvidenceId && playerState) {
      const evidence = playerState.discoveredEvidence?.find(
        ev => ev.id === selectedEvidenceId
      );
      if (evidence) {
        setSelectedEvidence(evidence);
        setIsDetailModalOpen(true);
        onClearSelection?.();
      }
    }
  }, [selectedEvidenceId, playerState, onClearSelection]);

  /**
   * Handle evidence card click
   */
  const handleEvidenceClick = useCallback((evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setIsDetailModalOpen(true);
  }, []);

  /**
   * Handle modal close
   */
  const handleCloseModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedEvidence(null), 300);
  }, []);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((type: string) => {
    setFilterType(type);
  }, []);

  /**
   * Handle explore navigation
   */
  const handleExplore = useCallback(() => {
    onNavigateToExplore?.();
  }, [onNavigateToExplore]);

  // Get discovered evidence
  const discoveredEvidence = playerState?.discoveredEvidence || [];

  // Filter evidence by type
  const filteredEvidence = filterType === 'all'
    ? discoveredEvidence
    : discoveredEvidence.filter(ev => ev.type === filterType);

  // Sort evidence by relevance
  const sortedEvidence = [...filteredEvidence].sort((a, b) => {
    const relevanceOrder = { critical: 0, important: 1, minor: 2 };
    return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
  });

  // Get unique evidence types
  const evidenceTypes = Array.from(
    new Set(discoveredEvidence.map(ev => ev.type))
  );

  /**
   * Loading state
   */
  if (loadingState === 'loading' || loadingState === 'idle') {
    return <EvidenceNotebookSkeleton />;
  }

  /**
   * Retrying state
   */
  if (loadingState === 'retrying') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <motion.div
              className="text-4xl mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              🔄
            </motion.div>
            <p className="text-gray-400">재시도 중... ({retryCount}/3)</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Error state
   */
  if (loadingState === 'error') {
    // 404 error - player state not found
    if (error?.includes('찾을 수 없습니다')) {
      return <NotFoundState resourceName="플레이어 데이터" onGoBack={handleRetry} />;
    }

    // Other errors
    return <ErrorState error={error || '알 수 없는 오류'} onRetry={handleRetry} />;
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-detective-gold mb-2">
            📋 수사 노트
          </h2>
          <p className="text-gray-400">
            발견한 증거를 정리하고 사건을 재구성하세요
          </p>

          {/* Evidence count */}
          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <div className="px-4 py-2 bg-detective-gold/20 text-detective-gold rounded-lg">
              <span className="font-bold">{discoveredEvidence.length}개</span> 증거 발견
            </div>
            {playerState && (
              <div className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg">
                <span className="font-bold">
                  {new Set(playerState.searchHistory?.map(s => s.locationId) || []).size}개
                </span> 장소 탐색
              </div>
            )}
            {playerState?.actionPoints && (
              <div className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-500/30">
                <span className="font-bold">AP {playerState.actionPoints.current}</span> / {playerState.actionPoints.total}
              </div>
            )}
          </div>
        </motion.div>

        {/* Filter bar */}
        {evidenceTypes.length > 0 ? (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleFilterChange('all')}
                className={`
                  px-4 py-2 rounded-lg font-bold transition-all
                  ${filterType === 'all'
                    ? 'bg-detective-gold text-noir-charcoal'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }
                `}
              >
                전체 ({discoveredEvidence.length})
              </button>
              {evidenceTypes.map((type) => {
                const count = discoveredEvidence.filter(ev => ev.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => handleFilterChange(type)}
                    className={`
                      px-4 py-2 rounded-lg font-bold transition-all
                      ${filterType === type
                        ? 'bg-detective-gold text-noir-charcoal'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }
                    `}
                  >
                    {type} ({count})
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : discoveredEvidence.length === 0 ? null : (
          <FilterBarSkeleton />
        )}

        {/* Evidence grid or empty state */}
        {discoveredEvidence.length === 0 ? (
          <EmptyEvidenceState onExplore={onNavigateToExplore ? handleExplore : undefined} />
        ) : sortedEvidence.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvidence.map((evidence, index) => (
              <motion.div
                key={evidence.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
              >
                <EvidenceCard
                  evidence={evidence}
                  onClick={() => handleEvidenceClick(evidence)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <FilteredEmptyState
            filterType={filterType}
            onClearFilter={() => handleFilterChange('all')}
          />
        )}

        {/* Investigation tips */}
        {discoveredEvidence.length > 0 && discoveredEvidence.length < 5 && (
          <motion.div
            className="mt-8 bg-noir-charcoal border border-detective-gold/30 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="text-xl font-bold text-detective-gold mb-4 flex items-center gap-2">
              <span>💡</span>
              <span>조사 팁</span>
            </h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-detective-gold font-bold">•</span>
                <span>더 많은 증거를 찾으려면 장소를 철저하게 탐색하세요</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-detective-gold font-bold">•</span>
                <span>용의자와 대화하여 추가 정보를 얻을 수 있습니다</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-detective-gold font-bold">•</span>
                <span>핵심 증거는 사건 해결의 열쇠입니다</span>
              </li>
            </ul>
          </motion.div>
        )}

        {/* Detail modal */}
        <EvidenceDetailModal
          evidence={selectedEvidence}
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </ErrorBoundary>
  );
}
