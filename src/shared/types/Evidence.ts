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
