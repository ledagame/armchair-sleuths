/**
 * usePlayerState Hook
 *
 * Manages player evidence discovery state
 * Fetches and tracks player's discovered evidence and search history
 */

import { useState, useEffect, useCallback } from 'react';
import type { PlayerEvidenceState, DiscoveredEvidenceRecord } from '../../shared/types/Evidence';

export interface UsePlayerStateOptions {
  caseId: string;
  userId: string;
  enabled?: boolean;
}

export interface UsePlayerStateReturn {
  playerState: PlayerEvidenceState | null;
  discoveredEvidence: DiscoveredEvidenceRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateState: (newState: Partial<PlayerEvidenceState>) => void;
}

/**
 * Hook for managing player evidence state
 *
 * Features:
 * - Fetches player state from backend
 * - Tracks discovered evidence
 * - Provides search history
 * - Updates state locally and on server
 */
export function usePlayerState({
  caseId,
  userId,
  enabled = true,
}: UsePlayerStateOptions): UsePlayerStateReturn {
  const [playerState, setPlayerState] = useState<PlayerEvidenceState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch player state from server
   */
  const fetchPlayerState = useCallback(async () => {
    if (!enabled || !caseId || !userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/player-state/${caseId}/${userId}`);

      if (!response.ok) {
        // If 404, player state doesn't exist yet - create initial state
        if (response.status === 404) {
          const initialState: PlayerEvidenceState = {
            caseId,
            userId,
            discoveredEvidence: [],
            searchHistory: [],
            stats: {
              totalSearches: 0,
              quickSearches: 0,
              thoroughSearches: 0,
              exhaustiveSearches: 0,
              totalEvidenceFound: 0,
              criticalEvidenceFound: 0,
              importantEvidenceFound: 0,
              minorEvidenceFound: 0,
              efficiency: 0,
            },
            lastUpdated: new Date(),
          };
          setPlayerState(initialState);
          return;
        }

        throw new Error(`Failed to fetch player state: ${response.statusText}`);
      }

      const data: PlayerEvidenceState = await response.json();
      setPlayerState(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch player state:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId, userId, enabled]);

  /**
   * Update player state locally
   */
  const updateState = useCallback((newState: Partial<PlayerEvidenceState>) => {
    setPlayerState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...newState,
        lastUpdated: new Date(),
      };
    });
  }, []);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    void fetchPlayerState();
  }, [fetchPlayerState]);

  return {
    playerState,
    discoveredEvidence: playerState?.discoveredEvidence || [],
    loading,
    error,
    refetch: fetchPlayerState,
    updateState,
  };
}
