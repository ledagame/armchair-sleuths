/**
 * LocationExplorerSection.tsx
 *
 * Location exploration section for parallel investigation
 * Refactored from LocationExplorerScreen.tsx (navigation button removed)
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationCard } from '../discovery/LocationCard';
import { EvidenceDiscoveryModal } from '../EvidenceDiscoveryModal';
import { ActionPointsDisplay } from '../ActionPointsDisplay';
import { useActionPoints } from '../../hooks/useActionPoints';
import { useEvidenceDiscovery } from '../../hooks/useEvidenceDiscovery';
import { useLocationImages } from '../../hooks/useLocationImages';
import type { Location } from '../../types';
import type { SearchType, EvidenceItem } from '../../../shared/types/Evidence';

/**
 * Default fallback locations for legacy cases without locations field
 */
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'fallback-loc-1',
    name: '범죄 현장',
    description: '사건이 발생한 주요 현장입니다',
    emoji: '🏢',
  },
  {
    id: 'fallback-loc-2',
    name: '피해자 거주지',
    description: '피해자가 생활하던 장소입니다',
    emoji: '🏠',
  },
  {
    id: 'fallback-loc-3',
    name: '용의자 관련 장소',
    description: '용의자들과 연관된 장소입니다',
    emoji: '🏪',
  },
  {
    id: 'fallback-loc-4',
    name: '주변 지역',
    description: '사건 관련 주변 지역입니다',
    emoji: '🌆',
  },
];

export interface LocationExplorerSectionProps {
  caseId: string;
  userId: string;
  locations: Location[];
  initialAP?: number;
  maxAP?: number;
  onSwitchToEvidenceTab?: (evidenceId?: string) => void;
}

/**
 * LocationExplorerSection Component
 *
 * Features:
 * - Action points display
 * - Location grid with search functionality
 * - Progress tracking
 * - Evidence discovery modal
 */
export function LocationExplorerSection({
  caseId,
  userId,
  locations = [],
  initialAP = 10,
  maxAP = 10,
  onSwitchToEvidenceTab,
}: LocationExplorerSectionProps) {
  // Fallback: Use default locations if none provided (legacy case support)
  const effectiveLocations = useMemo(() => {
    if (locations.length > 0) {
      return locations;
    }

    console.warn('⚠️ No locations found in case data - using fallback locations for legacy case support');
    return DEFAULT_LOCATIONS;
  }, [locations]);

  const isUsingFallback = locations.length === 0;

  // Action points management
  const {
    currentAP,
    maxAP: maxActionPoints,
    canAfford,
    deductAP,
  } = useActionPoints({
    initialAP,
    maxAP,
    caseId,
    userId,
  });

  // Evidence discovery management
  const {
    discoveredEvidence,
    isSearching,
    searchLocation,
  } = useEvidenceDiscovery({
    caseId,
    userId,
  });

  // Location images management
  const {
    status: locationImageStatus,
    images: locationImages,
    progress: locationImageProgress,
    isLoading: locationImagesLoading,
  } = useLocationImages(caseId);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDiscovery, setCurrentDiscovery] = useState<{
    evidenceFound: EvidenceItem[];
    locationName: string;
    completionRate: number;
  } | null>(null);

  // Track searched locations
  const [searchedLocations, setSearchedLocations] = useState<
    Map<string, { completionRate: number }>
  >(new Map());

  // Track currently searching location
  const [searchingLocationId, setSearchingLocationId] = useState<string | null>(null);

  /**
   * Handle location search
   */
  const handleSearchLocation = async (locationId: string, searchType: SearchType) => {
    // Check if already searching
    if (searchingLocationId) {
      return;
    }

    // Check action points
    if (!canAfford(searchType)) {
      alert(`액션 포인트가 부족합니다. (필요: ${searchType === 'quick' ? 1 : searchType === 'thorough' ? 2 : 3}AP)`);
      return;
    }

    try {
      // Deduct action points
      const deducted = deductAP(searchType);
      if (!deducted) {
        return;
      }

      // Set loading state
      setSearchingLocationId(locationId);

      // Perform search
      const result = await searchLocation(locationId, searchType);

      if (result.success) {
        // Update searched locations
        setSearchedLocations((prev) => {
          const updated = new Map(prev);
          updated.set(locationId, {
            completionRate: result.completionRate,
          });
          return updated;
        });

        // Find location name
        const location = effectiveLocations.find((loc) => loc.id === locationId);

        // Prepare discovery data
        setCurrentDiscovery({
          evidenceFound: result.evidenceFound,
          locationName: location?.name || 'Unknown Location',
          completionRate: result.completionRate,
        });

        // Show modal
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Location search failed:', error);
      alert('탐색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setSearchingLocationId(null);
    }
  };

  /**
   * Close discovery modal
   */
  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => setCurrentDiscovery(null), 300);
  };

  // Calculate progress
  const totalLocations = effectiveLocations.length;
  const searchedCount = searchedLocations.size;
  const progressPercentage = totalLocations > 0
    ? Math.round((searchedCount / totalLocations) * 100)
    : 0;

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      {/* Section Header */}
      <motion.div
        className="mb-6 sm:mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-text-secondary text-base sm:text-lg">
          각 장소를 탐색하여 사건의 단서를 찾아보세요
        </p>
      </motion.div>

      {/* Action Points & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8">
        {/* Action Points Display */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ActionPointsDisplay currentAP={currentAP} maxAP={maxActionPoints} />
        </motion.div>

        {/* Total Evidence Found */}
        <motion.div
          className="bg-noir-charcoal rounded-lg sm:rounded-xl border-2 border-noir-fog hover:border-detective-brass p-4 sm:p-5 shadow-base transition-all duration-base"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔍</span>
            <span className="text-sm font-medium text-text-secondary">발견한 증거</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-detective-gold">
            {discoveredEvidence.length}
          </div>
          <div className="text-xs sm:text-sm text-text-muted mt-1">총 증거 수집</div>
        </motion.div>

        {/* Exploration Progress */}
        <motion.div
          className="bg-noir-charcoal rounded-lg sm:rounded-xl border-2 border-noir-fog hover:border-detective-brass p-4 sm:p-5 shadow-base transition-all duration-base sm:col-span-2 md:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📍</span>
            <span className="text-sm font-medium text-text-secondary">탐색 진행도</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-detective-gold">
            {searchedCount} / {totalLocations}
          </div>
          <div className="w-full bg-noir-gunmetal rounded-full h-2 overflow-hidden mt-2">
            <motion.div
              className="h-2 bg-detective-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Legacy Case Warning */}
      {isUsingFallback && (
        <motion.div
          className="mb-4 sm:mb-6 bg-detective-brass/10 border-2 border-detective-brass rounded-lg sm:rounded-xl px-4 py-3 sm:p-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start gap-3 text-detective-brass">
            <span className="text-xl sm:text-2xl flex-shrink-0">⚠️</span>
            <div>
              <p className="font-bold text-sm sm:text-base">레거시 케이스 모드</p>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                이 케이스는 구버전 스키마로 생성되었습니다. 기본 장소로 탐색을 진행합니다.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Location Grid */}
      <div className="mb-6 sm:mb-8">
        {effectiveLocations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {effectiveLocations.map((location, index) => {
              const locationState = searchedLocations.get(location.id);
              const isSearched = locationState !== undefined;
              const completionRate = locationState?.completionRate ?? 0;

              return (
                <motion.div
                  key={location.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <LocationCard
                    location={{
                      id: location.id,
                      name: location.name,
                      description: location.description,
                      emoji: location.emoji || '📍',
                      imageUrl: locationImages[location.id],
                    }}
                    imageStatus={
                      locationImagesLoading
                        ? 'loading'
                        : locationImages[location.id]
                          ? 'loaded'
                          : 'error'
                    }
                    isSearched={isSearched}
                    isSearching={searchingLocationId === location.id}
                    completionRate={completionRate}
                    actionPoints={currentAP}
                    onSearch={handleSearchLocation}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            className="text-center py-12 sm:py-16 text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-5xl sm:text-6xl mb-4">🤔</p>
            <p className="text-lg sm:text-xl font-semibold mb-2">탐색할 수 있는 장소가 없습니다.</p>
            <p className="text-sm sm:text-base text-text-muted mt-2">용의자 심문 탭으로 이동하여 수사를 계속하세요.</p>
          </motion.div>
        )}
      </div>

      {/* Evidence Discovery Modal */}
      <AnimatePresence>
        {currentDiscovery && (
          <EvidenceDiscoveryModal
            isOpen={modalOpen}
            caseId={caseId}
            evidenceFound={currentDiscovery.evidenceFound}
            locationName={currentDiscovery.locationName}
            completionRate={currentDiscovery.completionRate}
            onClose={handleCloseModal}
            onEvidenceClick={(evidenceId) => {
              handleCloseModal();
              onSwitchToEvidenceTab?.(evidenceId);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
