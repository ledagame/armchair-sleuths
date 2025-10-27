/**
 * useCase Hook
 *
 * Manages case data fetching and state
 * Handles loading, error states, and data caching
 * Supports loading specific cases via postData.caseId (for archive/historical games)
 *
 * REFACTORED: Now uses GameAPI architecture with Repository Pattern
 */

import { useState, useEffect, useCallback } from 'react';
import { useGameAPI } from '../contexts/GameAPIContext';
import { DevvitMessenger } from '../utils/DevvitMessenger';
import { APIError } from '../api/GameAPI';
import type { CaseData, UseCaseReturn } from '../types';

/**
 * Hook for fetching and managing case data
 * - If postData.caseId exists: loads that specific case (for historical posts)
 * - Otherwise: loads today's case (default behavior)
 *
 * @returns UseCaseReturn - case data, loading states, error, and refetch function
 */
export function useCase(): UseCaseReturn {
  const api = useGameAPI();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  /**
   * Generate a new case
   * Used when today's case doesn't exist yet
   */
  const generateCase = useCallback(async (): Promise<boolean> => {
    setGenerating(true);
    setError(null);

    try {
      console.log('🔄 Generating today\'s case...');
      const result = await api.generateCase();
      console.log('✅ Case generated:', result.caseId);

      // Wait a bit for the case to be fully saved
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate case';
      setError(errorMessage);
      console.error('Failed to generate case:', err);
      return false;
    } finally {
      setGenerating(false);
    }
  }, [api]);

  /**
   * Fetch case data
   * - Checks postData for specific caseId
   * - Auto-generates if case doesn't exist (404)
   * - Validates suspects and discovery data
   */
  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if postData contains a specific caseId
      const postData = DevvitMessenger.getPostData();
      const specificCaseId = postData?.caseId;

      console.log(specificCaseId
        ? `📦 Loading specific case: ${specificCaseId}`
        : '📅 Loading today\'s case'
      );

      // Fetch case using GameAPI
      let data: CaseData;
      try {
        data = specificCaseId
          ? await api.getCaseById(specificCaseId)
          : await api.getCaseToday();
      } catch (err) {
        // If case doesn't exist (404), try to generate it automatically
        if (err instanceof APIError && err.status === 404 && err.message?.includes('not been generated')) {
          console.log('📭 No case found. Auto-generating...');
          const generated = await generateCase();

          if (generated) {
            // Retry fetching after generation
            data = await api.getCaseToday();
            console.log(`✅ Case loaded with ${data.locations?.length || 0} locations and evidence distribution`);
            setCaseData(data);
            return;
          }
        }

        throw err;
      }

      // Validate suspects exist
      if (!data.suspects || data.suspects.length === 0) {
        console.warn('⚠️ Case fetched but no suspects found');
        console.warn('Case data:', data);
      } else {
        console.log(`✅ Case loaded: ${data.id} with ${data.suspects.length} suspects`);
      }

      // Validate discovery data
      if (!data.locations || data.locations.length === 0) {
        console.warn('⚠️ Case fetched but no locations found - discovery system will use fallback');
      } else {
        console.log(`✅ Discovery data loaded: ${data.locations.length} locations`);
      }

      setCaseData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch case:', err);
    } finally {
      setLoading(false);
    }
  }, [api, generateCase]);

  // Fetch on mount
  useEffect(() => {
    void fetchCase();
  }, [fetchCase]);

  return {
    caseData,
    loading,
    generating,
    error,
    refetch: fetchCase,
  };
}
