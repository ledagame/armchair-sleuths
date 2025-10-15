/**
 * Location.ts
 *
 * Location exploration type definitions
 * Supports multilingual content for location exploration system
 */

import type { SupportedLanguage } from './i18n';

/**
 * Exploration area within a location
 * Each area can be examined by the player
 */
export interface ExplorationArea {
  id: string;
  name: string;
  description: string;
  clues: string[];  // Clues that can be discovered in this area
  interactable: boolean;  // Can the player interact with objects here?
}

/**
 * Location exploration content in a single language
 */
export interface LocationExplorationContent {
  areas: ExplorationArea[];
  atmosphere: string;
  initialDescription: string;  // First impression when entering the location
  detailedDescription: string;  // More detailed examination result
}

/**
 * Multilingual location exploration data
 * CRITICAL: Same areas and clues, different language presentation
 */
export interface LocationExploration {
  locationId: string;
  caseId: string;

  translations: {
    ko: LocationExplorationContent;
    en: LocationExplorationContent;
  };

  metadata: {
    totalAreas: number;
    totalClues: number;
    criticalClueCount: number;  // Number of clues directly related to solution
  };

  generatedAt: number;
}

/**
 * Options for generating location exploration
 */
export interface GenerateLocationExplorationOptions {
  includeRedHerrings?: boolean;  // Include misleading clues
  clueDistribution?: 'concentrated' | 'distributed';  // How clues are spread
  difficulty?: 'easy' | 'medium' | 'hard';
}

/**
 * Type guard to check if an object is a LocationExploration
 */
export function isLocationExploration(obj: unknown): obj is LocationExploration {
  if (!obj || typeof obj !== 'object') return false;

  const candidate = obj as Partial<LocationExploration>;

  return (
    typeof candidate.locationId === 'string' &&
    typeof candidate.caseId === 'string' &&
    typeof candidate.translations === 'object' &&
    candidate.translations !== null &&
    'ko' in candidate.translations &&
    'en' in candidate.translations &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null
  );
}

/**
 * Get location exploration content in specific language
 */
export function getLocationInLanguage(
  exploration: LocationExploration,
  language: SupportedLanguage
): LocationExplorationContent {
  return exploration.translations[language];
}

/**
 * Validate that both language versions have the same structure
 * CRITICAL: Same number of areas and clues in both languages
 */
export function validateLocationStructure(
  exploration: LocationExploration
): boolean {
  const { ko, en } = exploration.translations;
  const { totalAreas, totalClues } = exploration.metadata;

  // Check area count matches
  if (ko.areas.length !== en.areas.length) return false;
  if (ko.areas.length !== totalAreas) return false;

  // Check each area has same number of clues
  for (let i = 0; i < ko.areas.length; i++) {
    const koArea = ko.areas[i];
    const enArea = en.areas[i];
    if (!koArea || !enArea) return false;
    if (koArea.clues.length !== enArea.clues.length) return false;
  }

  // Count total clues
  const koTotalClues = ko.areas.reduce((sum, area) => sum + area.clues.length, 0);
  const enTotalClues = en.areas.reduce((sum, area) => sum + area.clues.length, 0);

  if (koTotalClues !== enTotalClues) return false;
  if (koTotalClues !== totalClues) return false;

  return true;
}
