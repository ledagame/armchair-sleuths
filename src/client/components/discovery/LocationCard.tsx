/**
 * LocationCard.tsx
 *
 * Individual location card component for evidence discovery
 * Displays location with interactive search functionality and visual state transitions
 * Supports 3-tier search system with search method selection
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExplorationArea } from '@/shared/types/Location';
import type { SearchType } from '@/shared/types/Evidence';
import { SearchMethodSelector } from './SearchMethodSelector';

export interface LocationCardProps {
  location: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    imageUrl?: string;
  };
  isSearched: boolean;
  isSearching?: boolean;
  completionRate?: number;
  actionPoints?: number;
  onSearch: (locationId: string, searchType: SearchType) => void;
}

/**
 * LocationCard component with three visual states:
 * - Unsearched: Ready for interaction with search method selection
 * - Searching: Loading animation
 * - Searched: Completed state with completion rate
 */
export function LocationCard({
  location,
  isSearched,
  isSearching = false,
  completionRate = 0,
  actionPoints,
  onSearch,
}: LocationCardProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedSearchType, setSelectedSearchType] = useState<SearchType>('thorough');

  const handleCardClick = () => {
    if (!isSearched && !isSearching) {
      setShowSearchModal(true);
    }
  };

  const handleSearchConfirm = () => {
    setShowSearchModal(false);
    onSearch(location.id, selectedSearchType);
  };

  // Visual state based on search status
  const borderColor = isSearched
    ? 'border-green-600'
    : isSearching
      ? 'border-yellow-500'
      : 'border-gray-700';

  const bgColor = isSearched
    ? 'bg-green-900/20'
    : isSearching
      ? 'bg-yellow-900/20'
      : 'bg-gray-800';

  const cursorStyle = isSearched || isSearching ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <>
      <motion.button
        onClick={handleCardClick}
        disabled={isSearched || isSearching}
        className={`
          relative w-full p-6 rounded-lg text-left transition-all
          border-2 ${borderColor} ${bgColor} ${cursorStyle}
        `}
        // Hover animation (only when not searched/searching)
        whileHover={!isSearched && !isSearching ? { scale: 1.03 } : {}}
        // Click animation
        whileTap={!isSearched && !isSearching ? { scale: 0.98 } : {}}
        // Initial animation on mount
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label={`${location.name} ${isSearched ? '탐색 완료' : '탐색하기'}`}
        aria-disabled={isSearched || isSearching}
      >
      {/* Location Icon */}
      <div className="text-5xl mb-3 flex justify-center">
        {location.emoji}
      </div>

      {/* Location Name */}
      <h3 className="text-xl font-bold mb-2 text-center text-detective-gold">
        {location.name}
      </h3>

      {/* Location Description */}
      <p className="text-sm text-gray-400 text-center mb-4 line-clamp-2">
        {location.description}
      </p>

      {/* Status Indicator */}
      <div className="flex justify-center items-center">
        {isSearching && (
          <motion.div
            className="flex items-center gap-2 text-yellow-400"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-sm font-medium">탐색 중...</span>
          </motion.div>
        )}

        {isSearched && (
          <motion.div
            className="flex items-center gap-2 text-green-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm font-medium">탐색 완료</span>
          </motion.div>
        )}

        {!isSearching && !isSearched && (
          <div className="flex items-center gap-2 text-detective-gold">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-sm font-medium">탐색하기</span>
          </div>
        )}
      </div>

      {/* Completion Rate (for searched locations) */}
      {isSearched && completionRate > 0 && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-400 mb-1">완료율</div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 bg-gradient-to-r from-green-400 to-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs text-green-400 mt-1 font-bold">
            {completionRate}%
          </div>
        </div>
      )}

      {/* Searched overlay */}
      {isSearched && (
        <motion.div
          className="absolute inset-0 bg-green-600/10 rounded-lg pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>

      {/* Search Method Selection Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              className="bg-gray-900 border-2 border-detective-gold rounded-lg p-6 max-w-md w-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">{location.emoji}</div>
                <h3 className="text-2xl font-bold text-detective-gold mb-2">
                  {location.name}
                </h3>
                <p className="text-sm text-gray-400">{location.description}</p>
              </div>

              {/* Search Method Selector */}
              <SearchMethodSelector
                selectedMethod={selectedSearchType}
                onSelect={setSelectedSearchType}
                actionPoints={actionPoints}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSearchModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSearchConfirm}
                  className="flex-1 px-4 py-2 bg-detective-gold hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors"
                >
                  탐색 시작
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
