/**
 * Case.ts
 *
 * Case 관련 타입 정의
 * Location 타입은 Discovery.ts로 이동됨
 */

// Re-export Location from Discovery for convenience
export type { Location } from './Discovery';

/**
 * AP Topic Definition
 * Defines topics that trigger AP rewards during suspect interrogation
 */
export interface APTopic {
  id: string; // Format: "topic-alibi-1", "topic-relationship-1", etc.
  category: 'alibi' | 'relationship' | 'motive' | 'witness' | 'evidence';
  keywords: string[]; // Keywords that trigger this topic
  apReward: number; // AP reward (usually 1)
  requiresQuality: boolean; // Must pass quality check?
  description: string; // What this topic is about (e.g., "알리바이 정보 획득")
  triggered: boolean; // Has this been triggered already?
}

/**
 * Action Points Configuration
 * Defines initial AP, maximum AP, and costs for each search type
 */
export interface ActionPointsConfig {
  initial: number; // Starting AP (usually 3)
  maximum: number; // Maximum AP cap (usually 12)
  costs: {
    quick: number; // Quick search cost (usually 1)
    thorough: number; // Thorough search cost (usually 2)
    exhaustive: number; // Exhaustive search cost (usually 3)
  };
}

/**
 * Suspect with AP topics
 * Extends the basic suspect with AP acquisition topics
 */
export interface Suspect {
  id: string;
  name: string;
  archetype: string;
  isGuilty: boolean;
  apTopics: APTopic[]; // AP topics for this suspect
}
