/**
 * useCase Hook
 *
 * Manages case data fetching and state
 * Handles loading, error states, and data caching
 * Supports loading specific cases via postData.caseId (for archive/historical games)
 */

import { useState, useEffect, useCallback } from 'react';
import type { CaseData, UseCaseReturn, CaseApiResponse, ApiError } from '../types';

// Devvit postData interface
interface DevvitPostData {
  gameState?: string;
  score?: number;
  caseId?: string; // Custom case ID for loading specific historical cases
}

// Access Devvit postData from window (set by Devvit framework)
declare global {
  interface Window {
    __POST_DATA__?: DevvitPostData;
  }
}

/**
 * Hook for fetching and managing case data
 * - If postData.caseId exists: loads that specific case (for historical posts)
 * - Otherwise: loads today's case (default behavior)
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
      // Check if postData contains a specific caseId
      const postData = window.__POST_DATA__;
      const specificCaseId = postData?.caseId;

      // Determine which endpoint to use
      const endpoint = specificCaseId
        ? `/api/case/${specificCaseId}`
        : '/api/case/today';

      console.log(specificCaseId
        ? `📦 Loading specific case: ${specificCaseId}`
        : '📅 Loading today\'s case'
      );

      const response = await fetch(endpoint);

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

            // 🔧 FIX: Include locations, evidence, and evidenceDistribution in transformation
            const transformedCase: CaseData = {
              id: retryData.id,
              date: retryData.date,
              victim: retryData.victim,
              weapon: retryData.weapon,
              location: retryData.location,
              suspects: retryData.suspects || [],
              locations: retryData.locations, // Include discovery locations
              evidence: retryData.evidence, // Include evidence items
              evidenceDistribution: retryData.evidenceDistribution, // Include evidence distribution
              imageUrl: retryData.imageUrl,
              cinematicImages: retryData.cinematicImages,
              introSlides: retryData.introSlides, // NEW: 3-slide intro system
              introNarration: retryData.introNarration, // LEGACY: backward compatibility
              generatedAt: retryData.generatedAt,
            };

            // Log discovery data status
            console.log(`✅ Case loaded with ${retryData.locations?.length || 0} locations and evidence distribution`);

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

      // Validate discovery data
      if (!data.locations || data.locations.length === 0) {
        console.warn('⚠️ Case fetched but no locations found - discovery system will use fallback');
      } else {
        console.log(`✅ Discovery data loaded: ${data.locations.length} locations`);
      }

      // 🔧 FIX: Transform API response to CaseData INCLUDING locations, evidence, and evidenceDistribution
      const transformedCase: CaseData = {
        id: data.id,
        date: data.date,
        victim: data.victim,
        weapon: data.weapon,
        location: data.location,
        suspects: data.suspects || [],
        locations: data.locations, // Include discovery locations
        evidence: data.evidence, // Include evidence items
        evidenceDistribution: data.evidenceDistribution, // Include evidence distribution
        imageUrl: data.imageUrl,
        cinematicImages: data.cinematicImages,
        introSlides: data.introSlides, // NEW: 3-slide intro system
        introNarration: data.introNarration, // LEGACY: backward compatibility
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
  }, [generateCase]);

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
