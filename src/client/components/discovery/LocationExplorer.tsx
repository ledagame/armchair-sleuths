/**
 * LocationExplorer.tsx
 *
 * Main container component for location exploration and evidence discovery
 * Displays 4 location cards in a responsive grid and manages search interactions
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LocationCard } from './LocationCard';
import { EvidenceRevealCard } from './EvidenceRevealCard';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { SearchLocationResult } from '@/shared/types/Discovery';

export interface LocationExplorerProps {
  caseId: string;
  locations: Array<{
    id: string;
    name: string;
    description: string;
    emoji: string;
  }>;
  onSearchLocation: (locationId: string) => Promise<SearchLocationResult>;
}

/**
 * LocationExplorer - Main container for evidence discovery system
 *
 * Features:
 * - Responsive grid layout (1 column mobile, 2 columns desktop)
 * - Location search interaction with loading states
 * - Evidence reveal modal on discovery
 * - Tracked search state persistence
 */
export function LocationExplorer({
  caseId,
  locations,
  onSearchLocation,
}: LocationExplorerProps) {
  // Track searched locations
  const [searchedLocationIds, setSearchedLocationIds] = useState<Set<string>>(new Set());

  // Loading state for current search
  const [searchingLocationId, setSearchingLocationId] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [currentDiscovery, setCurrentDiscovery] = useState<{
    location: { id: string; name: string };
    evidenceFound: EvidenceItem[];
  } | null>(null);

  /**
   * Handle location search
   */
  const handleSearchLocation = async (locationId: string) => {
    // Prevent duplicate searches
    if (searchedLocationIds.has(locationId) || searchingLocationId) {
      return;
    }

    try {
      // Set loading state
      setSearchingLocationId(locationId);

      // Perform search
      const result = await onSearchLocation(locationId);

      if (result.success) {
        // Update searched locations
        setSearchedLocationIds((prev) => new Set([...prev, locationId]));

        // Prepare discovery data for modal
        setCurrentDiscovery({
          location: result.location,
          evidenceFound: result.evidenceFound,
        });

        // Show modal
        setModalOpen(true);
      }
    } catch (error) {
      console.error('Location search failed:', error);
      // TODO: Show error toast/notification
    } finally {
      // Clear loading state
      setSearchingLocationId(null);
    }
  };

  /**
   * Close modal
   */
  const handleCloseModal = () => {
    setModalOpen(false);
    // Clear current discovery after animation completes
    setTimeout(() => setCurrentDiscovery(null), 300);
  };

  // Calculate search progress
  const totalLocations = locations.length;
  const searchedCount = searchedLocationIds.size;
  const progressPercentage = totalLocations > 0
    ? Math.round((searchedCount / totalLocations) * 100)
    : 0;

  return (
    <div className="location-explorer p-6">
      {/* Header */}
      <div className="mb-8">
        <motion.h2
          className="text-3xl font-bold mb-2 text-detective-gold"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          🗺️ 장소 탐색
        </motion.h2>
        <motion.p
          className="text-gray-400"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          각 장소를 탐색하여 증거를 수집하세요
        </motion.p>

        {/* Progress indicator */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              탐색 진행도
            </span>
            <span className="text-sm font-bold text-detective-gold">
              {searchedCount} / {totalLocations}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-3 bg-gradient-to-r from-detective-gold to-yellow-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Completion message */}
          {searchedCount === totalLocations && totalLocations > 0 && (
            <motion.p
              className="text-sm text-green-400 mt-2 text-center font-bold"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              ✅ 모든 장소 탐색 완료!
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Location grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {locations.map((location, index) => (
          <motion.div
            key={location.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
          >
            <LocationCard
              location={location}
              isSearched={searchedLocationIds.has(location.id)}
              isSearching={searchingLocationId === location.id}
              onSearch={handleSearchLocation}
            />
          </motion.div>
        ))}
      </div>

      {/* No locations message */}
      {locations.length === 0 && (
        <motion.div
          className="text-center py-12 text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg mb-2">🤔</p>
          <p>탐색할 수 있는 장소가 없습니다.</p>
        </motion.div>
      )}

      {/* Evidence reveal modal */}
      {currentDiscovery && (
        <EvidenceRevealCard
          isOpen={modalOpen}
          evidenceFound={currentDiscovery.evidenceFound}
          location={currentDiscovery.location}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
