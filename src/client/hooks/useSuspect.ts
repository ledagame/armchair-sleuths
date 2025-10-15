/**
 * useSuspect Hook
 *
 * Manages suspect selection and state
 * Provides utilities for working with suspect data
 */

import { useState, useCallback, useMemo } from 'react';
import type { Suspect, UseSuspectReturn } from '../types';

/**
 * Hook for managing suspect selection and interaction
 */
export function useSuspect(suspects: Suspect[]): UseSuspectReturn {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get currently selected suspect
  const selectedSuspect = useMemo(() => {
    if (!selectedSuspectId) return null;
    return suspects.find((s) => s.id === selectedSuspectId) || null;
  }, [selectedSuspectId, suspects]);

  // Select a suspect by ID
  const selectSuspect = useCallback(
    (suspectId: string) => {
      const suspect = suspects.find((s) => s.id === suspectId);

      if (!suspect) {
        setError(`Suspect not found: ${suspectId}`);
        return;
      }

      setSelectedSuspectId(suspectId);
      setError(null);
    },
    [suspects]
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedSuspectId(null);
    setError(null);
  }, []);

  return {
    suspects,
    selectedSuspect,
    selectSuspect,
    clearSelection,
    loading: false, // No async operations in this hook
    error,
  };
}
