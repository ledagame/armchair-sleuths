/**
 * useCase Hook
 *
 * Manages case data fetching and state
 * Handles loading, error states, and data caching
 */

import { useState, useEffect, useCallback } from 'react';
import type { CaseData, UseCaseReturn, CaseApiResponse, ApiError } from '../types';

/**
 * Hook for fetching and managing today's case data
 */
export function useCase(): UseCaseReturn {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);

  const generateCase = useCallback(async () => {
    setGenerating(true);
    setError(null);

    try {
      console.log('🔄 Generating today\'s case...');
      const response = await fetch('/api/case/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate case');
      }

      const result = await response.json();
      console.log('✅ Case generated:', result.caseId);

      // Wait a bit for the case to be fully saved, then fetch it
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
  }, []);

  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/case/today');

      if (!response.ok) {
        const errorData: ApiError = await response.json();

        // If case doesn't exist, try to generate it automatically
        if (response.status === 404 && errorData.message?.includes('not been generated')) {
          console.log('📭 No case found. Auto-generating...');
          const generated = await generateCase();

          if (generated) {
            // Retry fetching after generation
            const retryResponse = await fetch('/api/case/today');
            if (!retryResponse.ok) {
              throw new Error('Case generated but failed to fetch');
            }
            const retryData: CaseApiResponse = await retryResponse.json();
            const transformedCase: CaseData = {
              id: retryData.id,
              date: retryData.date,
              victim: retryData.victim,
              weapon: retryData.weapon,
              location: retryData.location,
              suspects: retryData.suspects || [],
              imageUrl: retryData.imageUrl,
              generatedAt: retryData.generatedAt,
            };
            setCaseData(transformedCase);
            return;
          }
        }

        throw new Error(errorData.message || 'Failed to fetch case');
      }

      const data: CaseApiResponse = await response.json();

      // Validate suspects exist
      if (!data.suspects || data.suspects.length === 0) {
        console.warn('⚠️ Case fetched but no suspects found');
        console.warn('Case data:', data);
      } else {
        console.log(`✅ Case loaded: ${data.id} with ${data.suspects.length} suspects`);
      }

      // Transform API response to CaseData with suspects
      const transformedCase: CaseData = {
        id: data.id,
        date: data.date,
        victim: data.victim,
        weapon: data.weapon,
        location: data.location,
        suspects: data.suspects || [],
        imageUrl: data.imageUrl,
        generatedAt: data.generatedAt,
      };

      setCaseData(transformedCase);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch case:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
