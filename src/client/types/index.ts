/**
 * Type definitions for the Armchair Sleuths game
 */

import type { ActionPointsConfig } from '../../shared/types/Case';
import type { ImageGenerationStatus, IntroSlides } from '../../shared/types';

// ============================================================================
// Core Entity Types
// ============================================================================

export interface Victim {
  name: string;
  background: string;
  relationship: string;
}

export interface Weapon {
  name: string;
  description: string;
}

export interface Location {
  id?: string; // Optional: for generated locations in discovery system
  name: string;
  description: string;
  emoji?: string; // Optional: for UI display
  imageUrl?: string; // Optional: for visual presentation
}

export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: EmotionalState;
  hasProfileImage?: boolean; // Flag indicating if image exists (Phase 1)
  profileImageUrl?: string; // Full base64 data URL (loaded separately)
}

export interface Solution {
  who: string; // 범인
  what: string; // 범행 동기
  where: string; // 범행 장소
  when: string; // 범행 시각
  why: string; // 이유
  how: string; // 범행 수법
}

// ============================================================================
// Emotional State Types
// ============================================================================

export interface EmotionalState {
  suspicionLevel: number; // 0-100
  tone: EmotionalTone;
}

export type EmotionalTone = 'cooperative' | 'nervous' | 'defensive' | 'aggressive';

export interface CaseData {
  id: string;
  date: string; // YYYY-MM-DD format
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  locations?: Location[]; // Evidence discovery locations
  evidence?: any[]; // Evidence items for discovery system
  evidenceDistribution?: any; // Evidence distribution config (backend type)
  actionPoints?: ActionPointsConfig; // AP system configuration (Phase 2)
  imageUrl?: string;
  cinematicImages?: CinematicImages;
  introSlides?: IntroSlides; // NEW: 3-slide intro system (preferred)
  introNarration?: IntroNarration; // LEGACY: 5-scene cinematic (backward compatibility)
  generatedAt: number;

  // Phase 2: Evidence System Image Generation Status
  evidenceImageStatus?: {
    status: ImageGenerationStatus;
    totalCount: number;
    completedCount: number;
    currentBatch?: number;
    lastUpdated: string;
  };

  locationImageStatus?: {
    status: ImageGenerationStatus;
    totalCount: number;
    completedCount: number;
    lastUpdated: string;
  };
}

// ============================================================================
// Intro Narration Types
// ============================================================================

export type NarrationPhase = 'atmosphere' | 'incident' | 'stakes';

export interface IntroNarration {
  atmosphere: string;
  incident: string;
  stakes: string;
}

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'suspect';
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  suspectId: string;
  suspectName: string;
  response: string;
  emotionalState: {
    suspicionLevel: number;
    tone: EmotionalTone;
  };
}

export interface ConversationHistory {
  messages: ChatMessage[];
}

// ============================================================================
// Submission Types
// ============================================================================

export interface W4HAnswer {
  who: string;
  what: string;
  where: string;
  when: string;
  why: string;
  how: string;
}

export interface ScoringResult {
  userId: string;
  caseId: string;
  score: number;
  isCorrect: boolean;
  breakdown: {
    who: { score: number; feedback: string };
    what: { score: number; feedback: string };
    where: { score: number; feedback: string };
    when: { score: number; feedback: string };
    why: { score: number; feedback: string };
    how: { score: number; feedback: string };
  };
  submittedAt: number;
  rank?: number; // Position on leaderboard (1st, 2nd, etc.)
  totalParticipants?: number; // Total number of participants
}

// ============================================================================
// Leaderboard Types
// ============================================================================

export interface LeaderboardEntry {
  userId: string;
  score: number;
  submittedAt: number;
  rank: number;
}

export interface CaseStatistics {
  totalSubmissions: number;
  correctSubmissions: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
}

/**
 * API response for case data
 * Includes locations and evidenceDistribution for discovery system
 */
export interface CaseApiResponse {
  id: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  locations?: Location[]; // Evidence discovery locations (4 locations for Medium difficulty)
  evidence?: any[]; // Evidence items for discovery system (10 evidence pieces)
  evidenceDistribution?: any; // Evidence distribution configuration
  actionPoints?: ActionPointsConfig; // AP system configuration (Phase 2)
  imageUrl?: string;
  cinematicImages?: CinematicImages;
  introSlides?: IntroSlides; // NEW: 3-slide intro system (preferred)
  introNarration?: IntroNarration; // LEGACY: 5-scene cinematic (backward compatibility)
  generatedAt: number;
}

export interface SuspectsApiResponse {
  suspects: Suspect[];
}

export interface ConversationApiResponse {
  messages: ChatMessage[];
}

export interface SubmitApiResponse {
  success: boolean;
  result: ScoringResult;
}

// ============================================================================
// Cinematic Types
// ============================================================================

export interface CinematicImage {
  sceneNumber: number;
  description: string;
  imageUrl: string; // Base64 data URL
  prompt: string; // The prompt used to generate the image (for debugging)
}

export interface CinematicImages {
  intro: CinematicImage[]; // 3 key scenes for cinematic intro
  generatedAt: number;
}

// ============================================================================
// Game State Types
// ============================================================================

export type GameScreen =
  | 'loading'
  | 'intro'
  | 'case-overview'
  | 'investigation'
  | 'chat'
  | 'submission'
  | 'results';

// ============================================================================
// Hook Return Types
// ============================================================================

export interface UseCaseReturn {
  caseData: CaseData | null;
  loading: boolean;
  generating: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseSuspectReturn {
  suspects: Suspect[];
  selectedSuspect: Suspect | null;
  selectSuspect: (suspectId: string) => void;
  clearSelection: () => void;
  refetch: () => Promise<void>;
}

export interface UseSubmissionReturn {
  submitAnswer: (answer: W4HAnswer) => Promise<ScoringResult>;
  submitting: boolean;
  error: string | null;
}
