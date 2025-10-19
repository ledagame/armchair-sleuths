/**
 * LocationCard.tsx
 *
 * Individual location card component for evidence discovery
 * Displays location with interactive search functionality and visual state transitions
 */

import { motion } from 'framer-motion';
import type { ExplorationArea } from '@/shared/types/Location';

export interface LocationCardProps {
  location: {
    id: string;
    name: string;
    description: string;
    emoji: string;
  };
  isSearched: boolean;
  isSearching?: boolean;
  onSearch: (locationId: string) => void;
}

/**
 * LocationCard component with three visual states:
 * - Unsearched: Ready for interaction
 * - Searching: Loading animation
 * - Searched: Completed state with checkmark
 */
export function LocationCard({
  location,
  isSearched,
  isSearching = false,
  onSearch,
}: LocationCardProps) {
  const handleClick = () => {
    if (!isSearched && !isSearching) {
      onSearch(location.id);
    }
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
    <motion.button
      onClick={handleClick}
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
  );
}
