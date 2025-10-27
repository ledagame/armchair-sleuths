/**
 * IntroSlides.ts
 *
 * Type definitions for the new 3-slide intro system
 * Based on murder-mystery-intro skill guidelines
 */

/**
 * Slide 1: Discovery
 * Establishes time, location, victim, and primary constraint
 * Word limit: 30-40 words
 */
export interface Slide1Discovery {
  /** Time and location in one line (e.g., "2:47 AM - TechVision HQ, 42nd Floor") */
  timeLocation: string;

  /** Victim statement (e.g., "CEO Sarah Chen found dead in the server room") */
  victimStatement: string;

  /** Primary constraint (e.g., "Emergency lockdown activated") */
  constraint: string;
}

/**
 * Suspect Card for Slide 2
 * Contains minimal information to preserve mystery
 */
export interface SuspectCard {
  /** Links to Suspect.id in the database */
  suspectId: string;

  /** Suspect name */
  name: string;

  /** Role in 1-2 words (e.g., "CTO", "Chief Scientist") */
  role: string;

  /** Short claim starting with "I" (e.g., "I was debugging in Lab 3") */
  claim: string;

  /** Whether profile image is available for progressive loading */
  hasProfileImage: boolean;
}

/**
 * Slide 2: Suspects
 * Lists 3-4 suspects with minimal information (no motives, backstories, relationships)
 * Word limit: 60-80 words
 */
export interface Slide2Suspects {
  /** Array of 3-4 suspect cards */
  suspectCards: SuspectCard[];

  /** Statement about all suspects (e.g., "All four had server access") */
  constraintStatement: string;

  /** Tension builder (e.g., "Someone triggered the lockdown") */
  tensionLine: string;
}

/**
 * Slide 3: Challenge
 * Presents the challenge to the player with a call-to-action
 * Word limit: 20-30 words
 */
export interface Slide3Challenge {
  /** First statement line (e.g., "Four suspects") */
  statementLine1: string;

  /** Second statement line (e.g., "One crime scene") */
  statementLine2: string;

  /** Third statement line (e.g., "Every second counts") */
  statementLine3: string;

  /** Question to player (e.g., "Who killed Sarah Chen?") */
  question: string;

  /** Call-to-action button text (e.g., "START INVESTIGATION") */
  cta: string;
}

/**
 * Complete 3-slide intro structure
 * Replaces the old IntroNarration {atmosphere, incident, stakes}
 */
export interface IntroSlides {
  /** Slide 1: Discovery of the crime */
  discovery: Slide1Discovery;

  /** Slide 2: Suspects introduction */
  suspects: Slide2Suspects;

  /** Slide 3: Challenge and CTA */
  challenge: Slide3Challenge;
}

/**
 * Validation result for intro slides
 */
export interface IntroSlidesValidationResult {
  /** Whether the slides pass validation */
  isValid: boolean;

  /** List of validation issues if any */
  issues: string[];

  /** Optional warnings that don't block generation */
  warnings?: string[];
}
