/**
 * LocationExplorerScreen.tsx
 *
 * Main screen for location exploration and evidence discovery
 * Displays action points, location grid, and progress tracking
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LocationCard } from './discovery/LocationCard';
import { EvidenceDiscoveryModal } from './EvidenceDiscoveryModal';
import { ActionPointsDisplay } from './ActionPointsDisplay';
import { useActionPoints } from '../hooks/useActionPoints';
import { useEvidenceDiscovery } from '../hooks/useEvidenceDiscovery';
import type { Location } from '../types';
import type { SearchType, EvidenceItem } from '../../shared/types/Evidence';

export interface LocationExplorerScreenProps {
  caseId: string;
  userId: string;
  locations: Location[];
  onNavigateToSuspects: () => void;
  initialAP?: number;
  maxAP?: number;
}

/**
 * LocationExplorerScreen Component
 *
 * Features:
 * - Action points display
 * - Location grid with search functionality
 * - Progress tracking
 * - Evidence discovery modal
 * - Navigation to suspect interrogation
 */
export function LocationExplorerScreen({
  caseId,
  userId,
  locations = [],
  onNavigateToSuspects,
  initialAP = 10,
  maxAP = 10,
}: LocationExplorerScreenProps) {
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
        const location = locations.find((loc) => loc.id === locationId);

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
  const totalLocations = locations.length;
  const searchedCount = searchedLocations.size;
  const progressPercentage = totalLocations > 0
    ? Math.round((searchedCount / totalLocations) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 text-detective-gold">
          🗺️ 장소 탐색
        </h1>
        <p className="text-gray-400">
          각 장소를 탐색하여 사건의 단서를 찾아보세요
        </p>
      </motion.div>

      {/* Action Points & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          className="bg-gray-800 rounded-lg border-2 border-gray-700 p-4 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🔍</span>
            <span className="text-sm font-medium text-gray-400">발견한 증거</span>
          </div>
          <div className="text-2xl font-bold text-detective-gold">
            {discoveredEvidence.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">총 증거 수집</div>
        </motion.div>

        {/* Exploration Progress */}
        <motion.div
          className="bg-gray-800 rounded-lg border-2 border-gray-700 p-4 shadow-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">📍</span>
            <span className="text-sm font-medium text-gray-400">탐색 진행도</span>
          </div>
          <div className="text-2xl font-bold text-detective-gold">
            {searchedCount} / {totalLocations}
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden mt-2">
            <motion.div
              className="h-2 bg-detective-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Location Grid */}
      <div className="mb-6">
        {locations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.map((location, index) => {
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
                      imageUrl: location.imageUrl,
                    }}
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
            className="text-center py-12 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg mb-2">🤔</p>
            <p>탐색할 수 있는 장소가 없습니다.</p>
          </motion.div>
        )}
      </div>

      {/* Navigation to Suspects */}
      <motion.div
        className="flex justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={onNavigateToSuspects}
          className="
            px-8 py-4 bg-detective-gold hover:bg-detective-gold/90
            text-gray-900 font-bold rounded-lg text-lg
            transition-all transform hover:scale-105 active:scale-95
            shadow-lg
          "
        >
          👤 용의자 심문하러 가기
        </button>
      </motion.div>

      {/* Evidence Discovery Modal */}
      <AnimatePresence>
        {currentDiscovery && (
          <EvidenceDiscoveryModal
            isOpen={modalOpen}
            evidenceFound={currentDiscovery.evidenceFound}
            locationName={currentDiscovery.locationName}
            completionRate={currentDiscovery.completionRate}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
