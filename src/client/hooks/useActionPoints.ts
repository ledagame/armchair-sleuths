/**
 * useActionPoints Hook
 *
 * Manages action points (AP) for evidence discovery system
 * Tracks current AP, max AP, and provides methods to deduct and reset AP
 */

import { useState, useCallback, useEffect } from 'react';
import type { SearchType } from '../../shared/types/Evidence';
import { SEARCH_ACTION_COSTS } from '../../shared/types/Discovery';

export interface UseActionPointsOptions {
  initialAP?: number;
  maxAP?: number;
  caseId?: string;
  userId?: string;
}

export interface UseActionPointsReturn {
  currentAP: number;
  maxAP: number;
  canAfford: (searchType: SearchType) => boolean;
  deductAP: (searchType: SearchType) => boolean;
  resetAP: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for managing action points
 *
 * Features:
 * - Tracks current and max action points
 * - Validates affordability for search types
 * - Deducts AP with validation
 * - Persists AP state to localStorage
 */
export function useActionPoints({
  initialAP = 3,
  maxAP = 12,
  caseId,
  userId,
}: UseActionPointsOptions = {}): UseActionPointsReturn {
  const [currentAP, setCurrentAP] = useState<number>(initialAP);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Generate storage key for persistence
  const storageKey = caseId && userId ? `ap_${caseId}_${userId}` : null;

  // Load AP from localStorage on mount
  useEffect(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsedAP = parseInt(stored, 10);
          if (!isNaN(parsedAP) && parsedAP >= 0 && parsedAP <= maxAP) {
            setCurrentAP(parsedAP);
          }
        } catch (err) {
          console.error('Failed to load AP from storage:', err);
        }
      }
    }
  }, [storageKey, maxAP]);

  // Save AP to localStorage when it changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, currentAP.toString());
    }
  }, [currentAP, storageKey]);

  /**
   * Check if player can afford a search type
   */
  const canAfford = useCallback(
    (searchType: SearchType): boolean => {
      const cost = SEARCH_ACTION_COSTS[searchType];
      return currentAP >= cost;
    },
    [currentAP]
  );

  /**
   * Deduct action points for a search
   * Returns true if successful, false if insufficient AP
   */
  const deductAP = useCallback(
    (searchType: SearchType): boolean => {
      const cost = SEARCH_ACTION_COSTS[searchType];

      if (!canAfford(searchType)) {
        setError(`액션 포인트가 부족합니다 (필요: ${cost}AP, 현재: ${currentAP}AP)`);
        return false;
      }

      setCurrentAP((prev) => Math.max(0, prev - cost));
      setError(null);
      return true;
    },
    [canAfford, currentAP]
  );

  /**
   * Reset action points to maximum
   */
  const resetAP = useCallback(() => {
    setCurrentAP(maxAP);
    setError(null);
  }, [maxAP]);

  return {
    currentAP,
    maxAP,
    canAfford,
    deductAP,
    resetAP,
    loading,
    error,
  };
}
