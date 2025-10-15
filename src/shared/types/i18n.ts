/**
 * i18n.ts
 *
 * Multilingual type definitions for Armchair Sleuths
 * Ensures same game with different language presentations
 */

import type { LocationExploration } from './Location';
import type { MultilingualEvidence } from './Evidence';

/**
 * Supported languages for the game
 * Start with Korean (ko) and English (en) for competition
 */
export type SupportedLanguage = 'ko' | 'en';

/**
 * Default language (used as fallback)
 */
export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko';

/**
 * Multilingual text content
 * Each text field has translations for all supported languages
 */
export interface MultilingualText {
  ko: string;
  en: string;
}

/**
 * Multilingual weapon definition
 * Language-independent ID with translated name/description
 */
export interface MultilingualWeapon {
  id: string;  // Language-independent identifier (e.g., 'poison', 'knife')
  translations: {
    ko: {
      name: string;
      description: string;
    };
    en: {
      name: string;
      description: string;
    };
  };
}

/**
 * Multilingual location definition
 * Language-independent ID with translated name/description
 */
export interface MultilingualLocation {
  id: string;  // Language-independent identifier (e.g., 'study', 'garden')
  translations: {
    ko: {
      name: string;
      description: string;
    };
    en: {
      name: string;
      description: string;
    };
  };
}

/**
 * Multilingual motive definition
 * Language-independent ID with translated name/description
 */
export interface MultilingualMotive {
  id: string;  // Language-independent identifier (e.g., 'revenge', 'money')
  translations: {
    ko: {
      name: string;
      description: string;
    };
    en: {
      name: string;
      description: string;
    };
  };
}

/**
 * Victim information in specific language
 */
export interface VictimContent {
  name: string;
  age: number;
  occupation: string;
  background: string;
  personality: string;
}

/**
 * Suspect information in specific language
 */
export interface SuspectContent {
  id: string;
  name: string;
  age: number;
  occupation: string;
  relation: string;
  background: string;
  personality: string;
  alibi: string;
  motive: string;
  isGuilty: boolean;
}

/**
 * Solution information in specific language
 */
export interface SolutionContent {
  who: string;
  how: string;
  when: string;
  where: string;
  why: string;
  evidence: string[];
}

/**
 * Complete case content in a single language
 * This is what the player sees
 */
export interface CaseContent {
  victim: VictimContent;
  suspects: SuspectContent[];
  solution: SolutionContent;
  title: string;
  description: string;
  setting: string;
}

/**
 * Multilingual case structure
 * CRITICAL: All languages share same culprit, story, solution
 * Only the language presentation differs
 */
export interface MultilingualCase {
  // Case identification (NO language code in ID!)
  id: string;  // Format: "case-YYYY-MM-DD" (e.g., "case-2025-01-15")
  date: string;  // ISO date string
  baseLanguage: SupportedLanguage;

  // All language versions of the same game
  translations: {
    ko: CaseContent;
    en: CaseContent;
  };

  // Language-independent metadata
  // These ensure consistency across languages
  metadata: {
    weaponId: string;
    motiveId: string;
    locationId: string;
    guiltyIndex: number;  // CRITICAL: Same culprit index in all languages
  };

  // Multilingual game elements
  weapon: MultilingualWeapon;
  location: MultilingualLocation;
  motive: MultilingualMotive;

  // Location exploration content (Phase 1)
  locationExploration?: LocationExploration;

  // Evidence collection (Phase 1)
  evidence?: MultilingualEvidence;

  // Generation metadata
  generatedAt: number;  // Unix timestamp
  version: number;  // Schema version for migrations
}

/**
 * Options for generating a multilingual case
 */
export interface GenerateMultilingualCaseOptions {
  date?: Date;
  languages?: SupportedLanguage[];
  includeImage?: boolean;
}

/**
 * Multilingual case element (weapon, location, motive)
 * Used for the element library
 */
export interface MultilingualElement {
  id: string;
  translations: {
    ko: {
      name: string;
      description: string;
    };
    en: {
      name: string;
      description: string;
    };
  };
}

/**
 * Type guard to check if an object is a MultilingualCase
 */
export function isMultilingualCase(obj: unknown): obj is MultilingualCase {
  if (!obj || typeof obj !== 'object') return false;

  const candidate = obj as Partial<MultilingualCase>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.baseLanguage === 'string' &&
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
 * Get case content in specific language
 * Falls back to base language if requested language not available
 */
export function getCaseInLanguage(
  multilingualCase: MultilingualCase,
  language: SupportedLanguage
): CaseContent {
  return multilingualCase.translations[language] ||
         multilingualCase.translations[multilingualCase.baseLanguage];
}

/**
 * Verify that all language versions have the same culprit
 * CRITICAL validation for game consistency
 */
export function validateCulpritConsistency(
  multilingualCase: MultilingualCase
): boolean {
  const { metadata, translations } = multilingualCase;
  const { guiltyIndex } = metadata;

  // Check Korean version
  const koGuilty = translations.ko.suspects.find(s => s.isGuilty);
  const koIndex = translations.ko.suspects.indexOf(koGuilty!);

  // Check English version
  const enGuilty = translations.en.suspects.find(s => s.isGuilty);
  const enIndex = translations.en.suspects.indexOf(enGuilty!);

  // All must match the metadata guiltyIndex
  return (
    koIndex === guiltyIndex &&
    enIndex === guiltyIndex &&
    koIndex === enIndex
  );
}
