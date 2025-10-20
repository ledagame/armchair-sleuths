/**
 * Evidence.ts
 *
 * Evidence type definitions for murder mystery game
 * Implements 3-Clue Rule, Fair Play, and Gumshoe principles
 */

import type { SupportedLanguage } from './i18n';

/**
 * Evidence relevance levels
 */
export type EvidenceRelevance = 'critical' | 'important' | 'minor';

/**
 * Evidence types
 */
export type EvidenceType =
  | 'physical'      // Physical objects found at scene
  | 'testimony'     // Witness statements
  | 'financial'     // Financial records
  | 'communication' // Phone, email, messages
  | 'alibi'         // Location/time evidence
  | 'forensic'      // Scientific analysis
  | 'documentary';  // Written documents

/**
 * Discovery difficulty levels
 * - obvious: Easy to find (70-90% base probability)
 * - medium: Requires attention (40-70% base probability)
 * - hidden: Difficult to find (10-40% base probability)
 */
export type DiscoveryDifficulty = 'obvious' | 'medium' | 'hidden';

/**
 * Search type for location exploration
 */
export type SearchType = 'quick' | 'thorough' | 'exhaustive';

/**
 * Discovery probability for each search type
 */
export interface DiscoveryProbability {
  quick: number;      // 0.0 - 1.0
  thorough: number;   // 0.0 - 1.0
  exhaustive: number; // 0.0 - 1.0
}

/**
 * Single evidence item in a specific language
 */
export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  name: string;
  description: string;
  discoveryHint: string;  // How to find this evidence
  interpretationHint: string;  // What this evidence might mean
  relevance: EvidenceRelevance;
  pointsToSuspect?: number;  // Index of suspect this evidence points to (0, 1, or 2)

  // Discovery system
  discoveryDifficulty: DiscoveryDifficulty;
  discoveryProbability: DiscoveryProbability;

  // Location information
  foundAtLocationId: string;
  foundAtAreaId?: string;  // Optional: specific area within location

  // Visual content
  imageUrl?: string;
  imageGeneratedAt?: number;
}

/**
 * Evidence collection in a single language
 */
export interface EvidenceContent {
  items: EvidenceItem[];
  summary: string;  // Overall summary of evidence
}

/**
 * Multilingual evidence data
 * CRITICAL: Same evidence items, different language presentation
 */
export interface MultilingualEvidence {
  caseId: string;
  locationId: string;

  translations: {
    ko: EvidenceContent;
    en: EvidenceContent;
  };

  metadata: {
    totalItems: number;
    criticalCount: number;  // Number of critical evidence items
    threeClueRuleCompliant: boolean;  // Does it satisfy 3-clue rule?
    guiltyIndex: number;  // Index of guilty suspect
    evidencePointingToGuilty: number;  // Number of evidence items pointing to guilty
  };

  generatedAt: number;
}

/**
 * Options for generating evidence
 */
export interface GenerateEvidenceOptions {
  minCriticalEvidence?: number;  // Minimum critical evidence (default: 3)
  includeRedHerrings?: boolean;  // Include misleading evidence
  difficulty?: 'easy' | 'medium' | 'hard';
  fairPlayCompliant?: boolean;  // Ensure all evidence is discoverable (default: true)
}

/**
 * Discovered evidence record
 * Tracks when and how a player discovered specific evidence
 */
export interface DiscoveredEvidenceRecord {
  evidenceId: string;
  discoveredAt: Date;
  discoveryMethod: SearchType;
  locationId: string;
  areaId?: string;
}

/**
 * Player evidence discovery statistics
 */
export interface EvidenceDiscoveryStats {
  totalSearches: number;
  quickSearches: number;
  thoroughSearches: number;
  exhaustiveSearches: number;
  totalEvidenceFound: number;
  criticalEvidenceFound: number;
  importantEvidenceFound: number;
  minorEvidenceFound: number;
  efficiency: number;  // Percentage of available evidence found
}

/**
 * Player evidence state
 * Tracks all evidence discoveries for a player in a specific case
 */
export interface PlayerEvidenceState {
  caseId: string;
  userId: string;
  discoveredEvidence: DiscoveredEvidenceRecord[];
  searchHistory: Array<{
    locationId: string;
    searchType: SearchType;
    timestamp: Date;
    evidenceFound: number;
  }>;
  stats: EvidenceDiscoveryStats;
  lastUpdated: Date;
}

/**
 * Type guard to check if an object is MultilingualEvidence
 */
export function isMultilingualEvidence(obj: unknown): obj is MultilingualEvidence {
  if (!obj || typeof obj !== 'object') return false;

  const candidate = obj as Partial<MultilingualEvidence>;

  return (
    typeof candidate.caseId === 'string' &&
    typeof candidate.locationId === 'string' &&
    typeof candidate.translations === 'object' &&
    candidate.translations !== null &&
    'ko' in candidate.translations &&
    'en' in candidate.translations &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null &&
    typeof candidate.metadata.guiltyIndex === 'number'
  );
}

/**
 * Get evidence content in specific language
 */
export function getEvidenceInLanguage(
  evidence: MultilingualEvidence,
  language: SupportedLanguage
): EvidenceContent {
  return evidence.translations[language];
}

/**
 * Validate 3-Clue Rule compliance
 * CRITICAL: Must have at least 3 independent critical clues pointing to guilty
 */
export function validateThreeClueRule(
  evidence: MultilingualEvidence
): boolean {
  const { criticalCount, evidencePointingToGuilty, threeClueRuleCompliant } = evidence.metadata;

  // Must have at least 3 critical evidence items
  if (criticalCount < 3) return false;

  // At least 3 evidence items must point to guilty suspect
  if (evidencePointingToGuilty < 3) return false;

  // Metadata flag must be true
  if (!threeClueRuleCompliant) return false;

  return true;
}

/**
 * Validate that both language versions have the same structure
 * CRITICAL: Same number of evidence items, same types, same relevance
 */
export function validateEvidenceStructure(
  evidence: MultilingualEvidence
): boolean {
  const { ko, en } = evidence.translations;
  const { totalItems, criticalCount } = evidence.metadata;

  // Check item count matches
  if (ko.items.length !== en.items.length) return false;
  if (ko.items.length !== totalItems) return false;

  // Check each evidence item has matching structure
  for (let i = 0; i < ko.items.length; i++) {
    const koItem = ko.items[i];
    const enItem = en.items[i];

    // Items must exist
    if (!koItem || !enItem) return false;

    // Same ID
    if (koItem.id !== enItem.id) return false;

    // Same type
    if (koItem.type !== enItem.type) return false;

    // Same relevance
    if (koItem.relevance !== enItem.relevance) return false;

    // Same suspect pointer (if present)
    if (koItem.pointsToSuspect !== enItem.pointsToSuspect) return false;
  }

  // Count critical items
  const koCriticalCount = ko.items.filter(item => item.relevance === 'critical').length;
  const enCriticalCount = en.items.filter(item => item.relevance === 'critical').length;

  if (koCriticalCount !== enCriticalCount) return false;
  if (koCriticalCount !== criticalCount) return false;

  return true;
}

/**
 * Validate Fair Play principle
 * All evidence must be discoverable and interpretable by player
 */
export function validateFairPlay(
  evidence: MultilingualEvidence
): boolean {
  const { ko } = evidence.translations;

  // Every evidence item must have discovery hint
  for (const item of ko.items) {
    if (!item.discoveryHint || item.discoveryHint.trim().length === 0) {
      return false;
    }
  }

  // Critical evidence must have interpretation hints
  const criticalItems = ko.items.filter(item => item.relevance === 'critical');
  for (const item of criticalItems) {
    if (!item.interpretationHint || item.interpretationHint.trim().length === 0) {
      return false;
    }
  }

  return true;
}

/**
 * Discovery probability presets by difficulty and relevance
 * Ensures Fair Play: critical evidence always discoverable on thorough search
 */
export const DISCOVERY_PROBABILITY_PRESETS: Record<
  DiscoveryDifficulty,
  Record<EvidenceRelevance, DiscoveryProbability>
> = {
  obvious: {
    critical: { quick: 0.9, thorough: 1.0, exhaustive: 1.0 },
    important: { quick: 0.8, thorough: 0.95, exhaustive: 1.0 },
    minor: { quick: 0.7, thorough: 0.9, exhaustive: 1.0 },
  },
  medium: {
    critical: { quick: 0.6, thorough: 0.85, exhaustive: 1.0 },
    important: { quick: 0.5, thorough: 0.75, exhaustive: 0.95 },
    minor: { quick: 0.4, thorough: 0.65, exhaustive: 0.9 },
  },
  hidden: {
    critical: { quick: 0.3, thorough: 0.7, exhaustive: 0.95 },
    important: { quick: 0.2, thorough: 0.55, exhaustive: 0.85 },
    minor: { quick: 0.1, thorough: 0.4, exhaustive: 0.75 },
  },
};

/**
 * Get discovery probability for evidence based on difficulty and relevance
 */
export function getDiscoveryProbability(
  difficulty: DiscoveryDifficulty,
  relevance: EvidenceRelevance
): DiscoveryProbability {
  return DISCOVERY_PROBABILITY_PRESETS[difficulty][relevance];
}

/**
 * Validate discovery probabilities ensure Fair Play
 * Critical evidence must have >= 70% probability on thorough search
 */
export function validateDiscoveryProbabilities(
  evidence: MultilingualEvidence
): boolean {
  const { ko } = evidence.translations;

  for (const item of ko.items) {
    // Critical evidence must be discoverable
    if (item.relevance === 'critical') {
      if (item.discoveryProbability.thorough < 0.7) {
        return false;
      }
      if (item.discoveryProbability.exhaustive < 0.95) {
        return false;
      }
    }

    // All probabilities must be valid (0-1) and increasing
    const { quick, thorough, exhaustive } = item.discoveryProbability;
    if (quick < 0 || quick > 1) return false;
    if (thorough < 0 || thorough > 1) return false;
    if (exhaustive < 0 || exhaustive > 1) return false;
    if (quick > thorough || thorough > exhaustive) return false;
  }

  return true;
}
