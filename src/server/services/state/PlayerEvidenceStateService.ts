/**
 * PlayerEvidenceStateService.ts
 *
 * Manages player evidence discovery state
 * Tracks discovered evidence, search history, and statistics
 */

import type {
  PlayerEvidenceState,
  DiscoveredEvidenceRecord,
  EvidenceDiscoveryStats,
  SearchType,
  EvidenceItem,
} from '@/shared/types/Evidence';

/**
 * PlayerEvidenceStateService
 *
 * Handles all player evidence state operations
 */
export class PlayerEvidenceStateService {
  /**
   * Initialize new player evidence state for a case
   *
   * @param caseId - Case ID
   * @param userId - User ID
   * @returns Initial player state
   */
  initializeState(caseId: string, userId: string): PlayerEvidenceState {
    return {
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
  }

  /**
   * Record discovered evidence
   *
   * @param state - Current player state
   * @param evidence - Evidence items discovered
   * @param searchType - Type of search performed
   * @param locationId - Location where evidence was found
   * @param areaId - Optional specific area
   * @returns Updated state
   */
  recordDiscovery(
    state: PlayerEvidenceState,
    evidence: EvidenceItem[],
    searchType: SearchType,
    locationId: string,
    areaId?: string
  ): PlayerEvidenceState {
    const now = new Date();

    // Add discovered evidence records
    const newDiscoveries: DiscoveredEvidenceRecord[] = evidence.map((item) => ({
      evidenceId: item.id,
      discoveredAt: now,
      discoveryMethod: searchType,
      locationId,
      areaId,
    }));

    // Update search history
    const searchHistoryEntry = {
      locationId,
      searchType,
      timestamp: now,
      evidenceFound: evidence.length,
    };

    // Update stats
    const updatedStats = this.updateStats(
      state.stats,
      evidence,
      searchType,
      state.discoveredEvidence.length + evidence.length
    );

    return {
      ...state,
      discoveredEvidence: [...state.discoveredEvidence, ...newDiscoveries],
      searchHistory: [...state.searchHistory, searchHistoryEntry],
      stats: updatedStats,
      lastUpdated: now,
    };
  }

  /**
   * Update discovery statistics
   *
   * @param currentStats - Current statistics
   * @param newEvidence - Newly discovered evidence
   * @param searchType - Type of search performed
   * @param totalDiscovered - Total evidence discovered so far (after this discovery)
   * @returns Updated stats
   */
  private updateStats(
    currentStats: EvidenceDiscoveryStats,
    newEvidence: EvidenceItem[],
    searchType: SearchType,
    totalDiscovered: number
  ): EvidenceDiscoveryStats {
    // Count evidence by relevance
    const criticalCount = newEvidence.filter(
      (e) => e.relevance === 'critical'
    ).length;
    const importantCount = newEvidence.filter(
      (e) => e.relevance === 'important'
    ).length;
    const minorCount = newEvidence.filter((e) => e.relevance === 'minor').length;

    // Update search type counters
    const searchTypeCounts = {
      quick: currentStats.quickSearches + (searchType === 'quick' ? 1 : 0),
      thorough: currentStats.thoroughSearches + (searchType === 'thorough' ? 1 : 0),
      exhaustive:
        currentStats.exhaustiveSearches + (searchType === 'exhaustive' ? 1 : 0),
    };

    return {
      totalSearches: currentStats.totalSearches + 1,
      quickSearches: searchTypeCounts.quick,
      thoroughSearches: searchTypeCounts.thorough,
      exhaustiveSearches: searchTypeCounts.exhaustive,
      totalEvidenceFound: totalDiscovered,
      criticalEvidenceFound: currentStats.criticalEvidenceFound + criticalCount,
      importantEvidenceFound: currentStats.importantEvidenceFound + importantCount,
      minorEvidenceFound: currentStats.minorEvidenceFound + minorCount,
      efficiency: currentStats.efficiency, // Will be calculated separately
    };
  }

  /**
   * Calculate discovery efficiency
   * Efficiency = (Total Evidence Found / Total Available Evidence) * 100
   *
   * @param state - Player state
   * @param totalAvailableEvidence - Total evidence available in case
   * @returns Updated state with calculated efficiency
   */
  calculateEfficiency(
    state: PlayerEvidenceState,
    totalAvailableEvidence: number
  ): PlayerEvidenceState {
    const efficiency =
      totalAvailableEvidence > 0
        ? (state.stats.totalEvidenceFound / totalAvailableEvidence) * 100
        : 0;

    return {
      ...state,
      stats: {
        ...state.stats,
        efficiency: Math.round(efficiency * 100) / 100, // Round to 2 decimals
      },
      lastUpdated: new Date(),
    };
  }

  /**
   * Check if evidence has been discovered
   *
   * @param state - Player state
   * @param evidenceId - Evidence ID to check
   * @returns True if discovered
   */
  isEvidenceDiscovered(state: PlayerEvidenceState, evidenceId: string): boolean {
    return state.discoveredEvidence.some((d) => d.evidenceId === evidenceId);
  }

  /**
   * Get evidence discovered at specific location
   *
   * @param state - Player state
   * @param locationId - Location ID
   * @returns Array of evidence IDs discovered at this location
   */
  getEvidenceAtLocation(
    state: PlayerEvidenceState,
    locationId: string
  ): string[] {
    return state.discoveredEvidence
      .filter((d) => d.locationId === locationId)
      .map((d) => d.evidenceId);
  }

  /**
   * Get search count for specific location
   *
   * @param state - Player state
   * @param locationId - Location ID
   * @returns Number of times this location has been searched
   */
  getLocationSearchCount(
    state: PlayerEvidenceState,
    locationId: string
  ): number {
    return state.searchHistory.filter((s) => s.locationId === locationId).length;
  }

  /**
   * Get most recent search at location
   *
   * @param state - Player state
   * @param locationId - Location ID
   * @returns Most recent search record or undefined
   */
  getLastSearchAtLocation(
    state: PlayerEvidenceState,
    locationId: string
  ):
    | {
        searchType: SearchType;
        timestamp: Date;
        evidenceFound: number;
      }
    | undefined {
    const searches = state.searchHistory.filter((s) => s.locationId === locationId);
    return searches.length > 0 ? searches[searches.length - 1] : undefined;
  }

  /**
   * Get discovery statistics summary
   *
   * @param state - Player state
   * @returns Formatted statistics object
   */
  getStatsSummary(state: PlayerEvidenceState): {
    totalSearches: number;
    searchBreakdown: {
      quick: number;
      thorough: number;
      exhaustive: number;
    };
    evidenceFound: {
      total: number;
      critical: number;
      important: number;
      minor: number;
    };
    efficiency: number;
    averageEvidencePerSearch: number;
  } {
    const averageEvidencePerSearch =
      state.stats.totalSearches > 0
        ? state.stats.totalEvidenceFound / state.stats.totalSearches
        : 0;

    return {
      totalSearches: state.stats.totalSearches,
      searchBreakdown: {
        quick: state.stats.quickSearches,
        thorough: state.stats.thoroughSearches,
        exhaustive: state.stats.exhaustiveSearches,
      },
      evidenceFound: {
        total: state.stats.totalEvidenceFound,
        critical: state.stats.criticalEvidenceFound,
        important: state.stats.importantEvidenceFound,
        minor: state.stats.minorEvidenceFound,
      },
      efficiency: state.stats.efficiency,
      averageEvidencePerSearch: Math.round(averageEvidencePerSearch * 100) / 100,
    };
  }
}

/**
 * Factory function to create PlayerEvidenceStateService
 */
export function createPlayerEvidenceStateService(): PlayerEvidenceStateService {
  return new PlayerEvidenceStateService();
}
