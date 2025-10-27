/**
 * Type definitions for Few-Shot Example System
 * 
 * These types define the structure for suspect dialogue examples
 * used to train AI responses across different emotional states.
 */

/**
 * Emotional states that suspects can exhibit during interrogation
 */
export enum EmotionalState {
  COOPERATIVE = 'COOPERATIVE',
  NERVOUS = 'NERVOUS',
  DEFENSIVE = 'DEFENSIVE',
  AGGRESSIVE = 'AGGRESSIVE'
}

/**
 * Analysis of a suspect's response across four quality dimensions
 */
export interface Analysis {
  /** How well the response matches the archetype's vocabulary and style */
  characterConsistency: string;
  
  /** How well the response aligns with the emotional state and word count */
  emotionalAlignment: string;
  
  /** Quality and specificity of information provided (guilty vs innocent patterns) */
  informationContent: string;
  
  /** Natural dialogue quality (contractions, idioms, natural phrasing) */
  naturalDialogue: string;
  
  /** Actual word count of the response */
  wordCount: number;
  
  /** Target word count range for this emotional state */
  targetRange: [number, number];
}

/**
 * A complete few-shot example showing detective question, suspect response, and analysis
 */
export interface FewShotExample {
  /** Unique identifier for this example */
  id: string;
  
  /** Archetype name (e.g., "Wealthy Heir", "Talented Artist") */
  archetype: string;
  
  /** Emotional state for this example */
  emotionalState: EmotionalState;
  
  /** Whether the suspect is guilty in this example */
  isGuilty: boolean;
  
  /** The detective's question */
  question: string;
  
  /** The suspect's response */
  response: string;
  
  /** Detailed analysis of the response quality */
  analysis: Analysis;
}

/**
 * Word count ranges for each emotional state (English)
 */
export const WORD_COUNT_RANGES: Record<EmotionalState, [number, number]> = {
  [EmotionalState.COOPERATIVE]: [40, 80],
  [EmotionalState.NERVOUS]: [30, 60],
  [EmotionalState.DEFENSIVE]: [15, 40],
  [EmotionalState.AGGRESSIVE]: [10, 30]
};

/**
 * Word count ranges for Korean (75% of English)
 */
export const WORD_COUNT_RANGES_KO: Record<EmotionalState, [number, number]> = {
  [EmotionalState.COOPERATIVE]: [30, 60],
  [EmotionalState.NERVOUS]: [22, 45],
  [EmotionalState.DEFENSIVE]: [11, 30],
  [EmotionalState.AGGRESSIVE]: [7, 22]
};
