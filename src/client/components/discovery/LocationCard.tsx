/**
 * LocationCard.tsx
 *
 * Individual location card component for evidence discovery
 * Displays location with interactive search functionality and visual state transitions
 * Supports 3-tier search system with search method selection
 *
 * REFACTORED: Noir detective design system integration
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExplorationArea } from '@/shared/types/Location';
import type { SearchType } from '@/shared/types/Evidence';
import { SearchMethodSelector } from './SearchMethodSelector';
import { SkeletonLoader } from '../ui/SkeletonLoader';

export interface LocationCardProps {
  location: {
    id: string;
    name: string;
    description: string;
    emoji: string;
    imageUrl?: string;
  };
  imageStatus?: 'loading' | 'loaded' | 'error';
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
  imageStatus = 'error',
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

  // Visual state based on search status - using design tokens
  const borderColor = isSearched
    ? 'border-evidence-clue'
    : isSearching
      ? 'border-detective-amber'
      : 'border-noir-fog';

  const bgColor = isSearched
    ? 'bg-evidence-clue/10'
    : isSearching
      ? 'bg-detective-gold/10'
      : 'bg-noir-charcoal';

  const cursorStyle = isSearched || isSearching ? 'cursor-not-allowed' : 'cursor-pointer';

  return (
    <>
      <motion.button
        onClick={handleCardClick}
        disabled={isSearched || isSearching}
        className={`
          relative w-full p-4 sm:p-6 rounded-lg text-left transition-all duration-base
          border-2 ${borderColor} ${bgColor} ${cursorStyle}
          ${!isSearched && !isSearching ? 'hover:shadow-glow-strong' : ''}
          focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
        `}
        // Hover animation (only when not searched/searching)
        whileHover={!isSearched && !isSearching ? {
          scale: 1.02,
          y: -4,
          transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] as const }
        } : {}}
        // Click animation
        whileTap={!isSearched && !isSearching ? {
          scale: 0.98,
          transition: { duration: 0.1 }
        } : {}}
        // Initial animation on mount
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        aria-label={`${location.name} ${isSearched ? '탐색 완료' : '탐색하기'}`}
        aria-disabled={isSearched || isSearching}
      >
      {/* Location Image/Icon */}
      <div className="mb-3 flex justify-center">
        {imageStatus === 'loading' ? (
          <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden">
            <SkeletonLoader />
          </div>
        ) : imageStatus === 'loaded' && location.imageUrl ? (
          <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden">
            <motion.img
              src={location.imageUrl}
              alt={location.name}
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        ) : (
          <div className="text-4xl sm:text-5xl">{location.emoji}</div>
        )}
      </div>

      {/* Location Name */}
      <h3 className="text-lg sm:text-xl font-display font-bold mb-2 text-center text-detective-gold">
        {location.name}
      </h3>

      {/* Location Description */}
      <p className="text-sm sm:text-base text-text-secondary text-center mb-4 line-clamp-2">
        {location.description}
      </p>

      {/* Status Indicator */}
      <div className="flex justify-center items-center min-h-[32px]">
        {isSearching && (
          <motion.div
            className="flex items-center gap-2 text-detective-amber"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
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
            <span className="text-sm sm:text-base font-medium">탐색 중...</span>
          </motion.div>
        )}

        {isSearched && (
          <motion.div
            className="flex items-center gap-2 text-evidence-clue"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium">탐색 완료</span>
          </motion.div>
        )}

        {!isSearching && !isSearched && (
          <div className="flex items-center gap-2 text-detective-gold">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <span className="text-sm sm:text-base font-medium">탐색하기</span>
          </div>
        )}
      </div>

      {/* Completion Rate (for searched locations) */}
      {isSearched && completionRate > 0 && (
        <div className="mt-4">
          <div className="text-xs text-text-muted mb-1 text-center">완료율</div>
          <div className="w-full bg-noir-gunmetal rounded-full h-2 overflow-hidden border border-noir-fog">
            <motion.div
              className="h-2 bg-gradient-to-r from-evidence-clue to-detective-gold"
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="text-xs text-evidence-clue mt-1 font-bold text-center">
            {completionRate}%
          </div>
        </div>
      )}

      {/* Searched overlay */}
      {isSearched && (
        <motion.div
          className="absolute inset-0 bg-evidence-clue/5 rounded-lg pointer-events-none"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSearchModal(false)}
          >
            <motion.div
              className="bg-noir-charcoal border-2 border-detective-gold rounded-xl p-6 max-w-md w-full shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className="text-4xl sm:text-5xl mb-2">{location.emoji}</div>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-detective-gold mb-2">
                  {location.name}
                </h3>
                <p className="text-sm sm:text-base text-text-secondary">{location.description}</p>
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
                  className="flex-1 min-h-[48px] px-4 py-2 sm:px-5 sm:py-3 bg-noir-gunmetal hover:bg-noir-smoke text-text-primary font-semibold rounded-lg transition-all duration-base focus:outline-none focus:ring-2 focus:ring-detective-brass focus:ring-offset-2 focus:ring-offset-noir-charcoal"
                >
                  취소
                </button>
                <button
                  onClick={handleSearchConfirm}
                  className="flex-1 min-h-[48px] btn-primary"
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
