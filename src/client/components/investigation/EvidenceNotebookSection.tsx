/**
 * EvidenceNotebookSection.tsx
 *
 * Evidence notebook section - displays all discovered evidence
 * Allows filtering, sorting, and detailed viewing of evidence
 *
 * Phase 2 Enhancements:
 * - Integrated fetchWithRetry for resilient API calls
 * - Added LoadingSkeleton for better perceived performance
 * - Added ErrorBoundary for graceful error handling
 * - Added EvidenceEmptyState with tutorial
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EvidenceCard } from './EvidenceCard';
import { EvidenceDetailModal } from './EvidenceDetailModal';
import { EvidenceEmptyState } from '../common/EmptyState';
import { EvidenceNotebookSkeleton } from '../common/LoadingSkeleton';
import { EvidenceErrorBoundary } from '../common/ErrorBoundary';
import { fetchJsonWithRetry } from '@/client/utils/apiRetry';
import type { EvidenceItem } from '@/shared/types/Evidence';

export interface EvidenceNotebookSectionProps {
  caseId: string;
  userId: string;
  selectedEvidenceId?: string | null;
  onClearSelection?: () => void;
  onSwitchToLocationTab?: () => void;
}

// Using shared PlayerEvidenceState type from Evidence.ts
// Note: visitedLocations is derived from searchHistory
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

/**
 * EvidenceNotebookSection Component
 * Enhanced with Phase 2 stability improvements
 */
export function EvidenceNotebookSection({
  caseId,
  userId,
  selectedEvidenceId,
  onClearSelection,
  onSwitchToLocationTab,
}: EvidenceNotebookSectionProps) {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  /**
   * Fetch player state from API with retry logic
   */
  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use fetchWithRetry for resilient API calls
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
            onRetry: (error, attempt, delayMs) => {
              console.log(
                `[EvidenceNotebook] Retry attempt ${attempt} after ${delayMs}ms:`,
                error.message
              );
            },
          }
        );

        setPlayerState(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('[EvidenceNotebook] Failed to fetch player state:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerState();
  }, [caseId, userId, retryCount]);

  /**
   * Auto-open detail modal for selected evidence ID (from modal navigation)
   */
  useEffect(() => {
    if (selectedEvidenceId && playerState) {
      const evidence = playerState.discoveredEvidence?.find(
        ev => ev.id === selectedEvidenceId
      );
      if (evidence) {
        setSelectedEvidence(evidence);
        setIsDetailModalOpen(true);
        // Clear selection after opening
        onClearSelection?.();
      }
    }
  }, [selectedEvidenceId, playerState, onClearSelection]);

  /**
   * Handle evidence card click
   */
  const handleEvidenceClick = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setIsDetailModalOpen(true);
  };

  /**
   * Handle modal close
   */
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    // Clear selection after animation
    setTimeout(() => setSelectedEvidence(null), 300);
  };

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  // Get discovered evidence
  const discoveredEvidence = playerState?.discoveredEvidence || [];

  // Filter evidence by type
  const filteredEvidence = filterType === 'all'
    ? discoveredEvidence
    : discoveredEvidence.filter(ev => ev.type === filterType);

  // Sort evidence by relevance (critical > important > minor)
  const sortedEvidence = [...filteredEvidence].sort((a, b) => {
    const relevanceOrder = { critical: 0, important: 1, minor: 2 };
    return relevanceOrder[a.relevance] - relevanceOrder[b.relevance];
  });

  // Get unique evidence types for filter
  const evidenceTypes = Array.from(
    new Set(discoveredEvidence.map(ev => ev.type))
  );

  /**
   * Loading state with skeleton
   */
  if (loading) {
    return <EvidenceNotebookSkeleton />;
  }

  /**
   * Error state with retry
   */
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/20 border-2 border-red-500 rounded-lg p-6 max-w-2xl mx-auto">
          <div className="flex items-start gap-4">
            <motion.span
              className="text-4xl"
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              ⚠️
            </motion.span>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-400 mb-2">
                오류가 발생했습니다
              </h3>
              <p className="text-red-300 mb-4">{error}</p>

              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  className="
                    px-6 py-2 bg-red-500 hover:bg-red-600
                    text-white font-bold rounded-lg
                    transition-all transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-noir-charcoal
                  "
                >
                  다시 시도
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="
                    px-6 py-2 bg-gray-700 hover:bg-gray-600
                    text-white font-bold rounded-lg
                    transition-all transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-noir-charcoal
                  "
                >
                  새로고침
                </button>
              </div>

              <div className="mt-4 p-3 bg-red-950/30 rounded text-xs text-red-400">
                <p className="font-bold mb-1">문제가 계속되면:</p>
                <ul className="list-disc list-inside space-y-1 text-red-300">
                  <li>인터넷 연결을 확인하세요</li>
                  <li>브라우저 캐시를 삭제해보세요</li>
                  <li>다른 브라우저를 사용해보세요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EvidenceErrorBoundary>
      <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        {/* Header */}
        <motion.div
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-detective-gold mb-2">
            📋 수사 노트
          </h2>
          <p className="text-text-secondary text-sm sm:text-base">
            발견한 증거를 정리하고 사건을 재구성하세요
          </p>

          {/* Evidence count */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="px-4 py-2 bg-detective-gold/20 border border-detective-brass text-detective-gold rounded-lg">
              <span className="font-bold">{discoveredEvidence.length}개</span> 증거 발견
            </div>
            {playerState && (
              <div className="px-4 py-2 bg-noir-charcoal border border-noir-fog text-text-secondary rounded-lg">
                <span className="font-bold">
                  {new Set(playerState.searchHistory?.map(s => s.locationId) || []).size}개
                </span> 장소 탐색
              </div>
            )}
          </div>
        </motion.div>

        {/* Filter bar */}
        {evidenceTypes.length > 0 && (
          <motion.div
            className="mb-6 sm:mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`
                  px-4 py-2 min-h-[48px] rounded-lg font-semibold transition-all duration-base
                  ${filterType === 'all'
                    ? 'bg-detective-gold text-noir-deepBlack'
                    : 'bg-noir-charcoal border-2 border-noir-fog text-text-secondary hover:bg-noir-gunmetal hover:border-detective-brass'
                  }
                  focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
                `}
              >
                전체 ({discoveredEvidence.length})
              </button>
              {evidenceTypes.map((type) => {
                const count = discoveredEvidence.filter(ev => ev.type === type).length;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`
                      px-4 py-2 min-h-[48px] rounded-lg font-semibold transition-all duration-base
                      ${filterType === type
                        ? 'bg-detective-gold text-noir-deepBlack'
                        : 'bg-noir-charcoal border-2 border-noir-fog text-text-secondary hover:bg-noir-gunmetal hover:border-detective-brass'
                      }
                      focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
                    `}
                  >
                    {type} ({count})
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Evidence grid or empty state */}
        {sortedEvidence.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
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
          // Empty state with tutorial
          discoveredEvidence.length === 0 ? (
            <EvidenceEmptyState onSwitchToLocationTab={onSwitchToLocationTab} />
          ) : (
            // Filtered empty state
            <motion.div
              className="text-center py-12 sm:py-16 bg-noir-charcoal/50 rounded-lg sm:rounded-xl border-2 border-dashed border-noir-fog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-5xl sm:text-6xl mb-4">🔎</div>
              <h3 className="text-lg sm:text-xl font-bold text-text-secondary mb-2 px-4">
                {filterType === 'all' ? '아직 발견한 증거가 없습니다' : `${filterType} 증거가 없습니다`}
              </h3>
              <p className="text-text-muted text-sm sm:text-base mb-6 px-4">
                {filterType === 'all'
                  ? '장소를 탐색하여 증거를 수집하세요'
                  : '다른 필터를 선택하거나 장소를 더 탐색하세요'
                }
              </p>
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="
                    px-6 py-3 min-h-[48px]
                    bg-detective-gold hover:bg-detective-amber
                    text-noir-deepBlack font-bold rounded-lg sm:rounded-xl
                    transition-all duration-base transform hover:scale-105 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
                  "
                >
                  전체 보기
                </button>
              )}
            </motion.div>
          )
        )}

        {/* Investigation tips */}
        {discoveredEvidence.length > 0 && (
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
                <span>핵심 증거를 우선적으로 분석하세요</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-detective-gold font-bold">•</span>
                <span>증거를 클릭하면 상세 정보를 확인할 수 있습니다</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-detective-gold font-bold">•</span>
                <span>여러 증거를 종합하여 사건을 재구성하세요</span>
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
    </EvidenceErrorBoundary>
  );
}
