'use client';

/**
 * CaseClient.tsx
 *
 * Client component for case detail page
 * Handles LocationExplorer integration and API calls
 */

import { useState } from 'react';
import { LocationExplorer } from '@/client/components/discovery/LocationExplorer';
import type { SearchLocationResult } from '@/shared/types/Discovery';

interface CaseClientProps {
  caseId: string;
  locations: Array<{
    id: string;
    name: string;
    description: string;
    emoji: string;
  }>;
}

/**
 * Client component for case investigation
 */
export default function CaseClient({ caseId, locations }: CaseClientProps) {
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle location search via API
   */
  const handleSearchLocation = async (locationId: string): Promise<SearchLocationResult> => {
    try {
      setError(null);

      const response = await fetch(`/api/cases/${caseId}/search-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locationId,
          searchType: 'quick', // MVP: always quick search
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Search failed: ${response.status}`);
      }

      const result = await response.json();

      // Validate result structure
      if (!result.success || !result.location || !Array.isArray(result.evidenceFound)) {
        throw new Error('Invalid search result format');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Location search error:', err);

      // Return error result
      return {
        success: false,
        location: {
          id: locationId,
          name: 'Unknown',
        },
        evidenceFound: [],
        totalSearched: 0,
        remainingLocations: locations.length,
        alreadySearched: false,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="text-red-400 font-bold mb-1">오류 발생</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Location Explorer */}
      <LocationExplorer
        caseId={caseId}
        locations={locations}
        onSearchLocation={handleSearchLocation}
      />

      {/* Investigation Tips */}
      <div className="bg-noir-charcoal border border-detective-gold/30 rounded-lg p-6">
        <h3 className="text-xl font-bold text-detective-gold mb-4 flex items-center gap-2">
          <span>💡</span>
          <span>조사 가이드</span>
        </h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-start gap-3">
            <span className="text-detective-gold font-bold">1.</span>
            <span>각 장소를 탐색하여 증거를 수집하세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-detective-gold font-bold">2.</span>
            <span>발견한 증거들을 종합하여 범인을 추리하세요</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-detective-gold font-bold">3.</span>
            <span>증거의 중요도를 파악하여 사건을 재구성하세요</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
