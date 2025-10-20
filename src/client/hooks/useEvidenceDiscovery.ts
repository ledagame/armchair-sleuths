/**
 * useEvidenceDiscovery Hook
 *
 * Manages evidence discovery operations
 * Handles location searches and updates player state
 */

import { useState, useCallback } from 'react';
import type { SearchType, EvidenceItem } from '../../shared/types/Evidence';
import type { SearchLocationResult } from '../../shared/types/Discovery';

export interface UseEvidenceDiscoveryOptions {
  caseId: string;
  userId: string;
  onDiscovery?: (result: SearchLocationResult) => void;
  onError?: (error: string) => void;
}

export interface UseEvidenceDiscoveryReturn {
  discoveredEvidence: EvidenceItem[];
  isSearching: boolean;
  searchError: string | null;
  lastSearchResult: SearchLocationResult | null;
  searchLocation: (locationId: string, searchType: SearchType) => Promise<SearchLocationResult>;
  clearError: () => void;
}

/**
 * Hook for managing evidence discovery
 *
 * Features:
 * - Performs location searches
 * - Tracks discovered evidence
 * - Handles loading and error states
 * - Calls backend API for search operations
 */
export function useEvidenceDiscovery({
  caseId,
  userId,
  onDiscovery,
  onError,
}: UseEvidenceDiscoveryOptions): UseEvidenceDiscoveryReturn {
  const [discoveredEvidence, setDiscoveredEvidence] = useState<EvidenceItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [lastSearchResult, setLastSearchResult] = useState<SearchLocationResult | null>(null);

  /**
   * Search a location for evidence
   */
  const searchLocation = useCallback(
    async (locationId: string, searchType: SearchType): Promise<SearchLocationResult> => {
      setIsSearching(true);
      setSearchError(null);

      try {
        const response = await fetch('/api/location/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            caseId,
            userId,
            locationId,
            searchType,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Location search failed');
        }

        const result: SearchLocationResult = await response.json();

        // Update local state
        setLastSearchResult(result);

        // Add newly discovered evidence to the list
        if (result.evidenceFound.length > 0) {
          setDiscoveredEvidence((prev) => {
            // Avoid duplicates
            const existingIds = new Set(prev.map((e) => e.id));
            const newEvidence = result.evidenceFound.filter((e) => !existingIds.has(e.id));
            return [...prev, ...newEvidence];
          });
        }

        // Call success callback
        if (onDiscovery) {
          onDiscovery(result);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setSearchError(errorMessage);

        // Call error callback
        if (onError) {
          onError(errorMessage);
        }

        console.error('Evidence discovery failed:', err);

        // Re-throw for caller to handle
        throw err;
      } finally {
        setIsSearching(false);
      }
    },
    [caseId, userId, onDiscovery, onError]
  );

  /**
   * Clear search error
   */
  const clearError = useCallback(() => {
    setSearchError(null);
  }, []);

  return {
    discoveredEvidence,
    isSearching,
    searchError,
    lastSearchResult,
    searchLocation,
    clearError,
  };
}
