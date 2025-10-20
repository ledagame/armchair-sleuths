/**
 * ActionPointsService.ts
 *
 * Manages action points for evidence discovery
 * Players spend action points to search locations
 */

import type { SearchType } from '@/shared/types/Evidence';

/**
 * Action point costs by search type
 */
const ACTION_POINT_COSTS: Record<SearchType, number> = {
  quick: 1,
  thorough: 2,
  exhaustive: 3,
};

/**
 * Action point allocation by difficulty
 * Medium difficulty: 10 evidence items, 4 locations
 * Players should be able to do ~8-10 searches
 */
const ACTION_POINTS_BY_DIFFICULTY = {
  easy: 15,    // Generous for beginners
  medium: 12,  // Balanced for standard play
  hard: 10,    // Tight for challenging gameplay
};

export class ActionPointsService {
  /**
   * Initialize action points based on case difficulty
   *
   * @param difficulty - Case difficulty level
   * @returns Initial action points
   */
  initializeActionPoints(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): number {
    return ACTION_POINTS_BY_DIFFICULTY[difficulty];
  }

  /**
   * Calculate action point cost for a search type
   *
   * @param searchType - Type of search (quick/thorough/exhaustive)
   * @returns Action point cost
   */
  getSearchCost(searchType: SearchType): number {
    return ACTION_POINT_COSTS[searchType];
  }

  /**
   * Deduct action points for a search
   *
   * @param currentPoints - Current action points
   * @param searchType - Type of search performed
   * @returns Remaining action points
   * @throws Error if insufficient action points
   */
  deductActionPoints(currentPoints: number, searchType: SearchType): number {
    const cost = this.getSearchCost(searchType);

    if (currentPoints < cost) {
      throw new Error(
        `Insufficient action points. Required: ${cost}, Available: ${currentPoints}`
      );
    }

    return currentPoints - cost;
  }

  /**
   * Check if player has enough action points for a search
   *
   * @param currentPoints - Current action points
   * @param searchType - Type of search to perform
   * @returns True if search is affordable
   */
  canAffordSearch(currentPoints: number, searchType: SearchType): boolean {
    const cost = this.getSearchCost(searchType);
    return currentPoints >= cost;
  }

  /**
   * Get recommended search types based on remaining action points
   *
   * @param currentPoints - Current action points
   * @returns Array of affordable search types
   */
  getAffordableSearchTypes(currentPoints: number): SearchType[] {
    const affordable: SearchType[] = [];

    if (this.canAffordSearch(currentPoints, 'quick')) {
      affordable.push('quick');
    }
    if (this.canAffordSearch(currentPoints, 'thorough')) {
      affordable.push('thorough');
    }
    if (this.canAffordSearch(currentPoints, 'exhaustive')) {
      affordable.push('exhaustive');
    }

    return affordable;
  }

  /**
   * Calculate action point efficiency
   * Measures evidence found per action point spent
   *
   * @param evidenceFound - Total evidence found
   * @param actionPointsUsed - Total action points spent
   * @returns Efficiency ratio (evidence per AP)
   */
  calculateEfficiency(evidenceFound: number, actionPointsUsed: number): number {
    if (actionPointsUsed === 0) return 0;
    return Math.round((evidenceFound / actionPointsUsed) * 100) / 100;
  }
}

/**
 * Factory function to create ActionPointsService
 */
export function createActionPointsService(): ActionPointsService {
  return new ActionPointsService();
}
