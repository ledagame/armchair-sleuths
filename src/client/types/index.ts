/**
 * Client-side TypeScript types
 * Matches backend data models from server services
 */

// ============================================================================
// Case Types
// ============================================================================

export interface Victim {
  name: string;
  background: string;
  relationship: string;
}

export interface Weapon {
  name: string;
  description: string;
  deadly: boolean;
  category: string;
}

export interface Location {
  name: string;
  description: string;
  atmosphere: string;
  props: string[];
}

export interface Suspect {
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: EmotionalState;
  profileImageUrl?: string; // Profile image (Base64 data URL) - backwards compatibility
  hasProfileImage?: boolean; // Flag to indicate if profile image is available for lazy loading
}

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
  imageUrl?: string;
  generatedAt: number;
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
  conversationCount: number;
}

// ============================================================================
// Submission Types (5W1H)
// ============================================================================

export interface W4HAnswer {
  who: string;   // 누가 (범인의 이름)
  what: string;  // 무엇을 (살인 방법)
  where: string; // 어디서 (구체적 장소)
  when: string;  // 언제 (시간대)
  why: string;   // 왜 (동기)
  how: string;   // 어떻게 (실행 방법)
}

export interface W4HValidationDetail {
  score: number;      // 0-100
  isCorrect: boolean;
  feedback: string;
}

export interface W4HValidationResult {
  who: W4HValidationDetail;
  what: W4HValidationDetail;
  where: W4HValidationDetail;
  when: W4HValidationDetail;
  why: W4HValidationDetail;
  how: W4HValidationDetail;
  totalScore: number;
  isFullyCorrect: boolean;
}

export interface ScoringResult {
  userId: string;
  caseId: string;
  totalScore: number; // 0-100
  isCorrect: boolean;
  breakdown: W4HValidationResult;
  submittedAt: number;
  rank?: number;
}

// ============================================================================
// Leaderboard Types
// ============================================================================

export interface LeaderboardEntry {
  userId: string;
  score: number;
  isCorrect: boolean;
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

export interface CaseApiResponse {
  id: string;
  date: string;
  victim: Victim;
  weapon: Weapon;
  location: Location;
  suspects: Suspect[];
  imageUrl?: string;
  generatedAt: number;
}

export interface SuspectsApiResponse {
  suspects: Suspect[];
}

export interface ConversationApiResponse {
  messages: ChatMessage[];
}

export interface LeaderboardApiResponse {
  leaderboard: LeaderboardEntry[];
}

export interface SuspectImageApiResponse {
  suspectId: string;
  profileImageUrl: string; // Base64 data URL
}

// ============================================================================
// UI State Types
// ============================================================================

export type GameScreen =
  | 'loading'
  | 'case-overview'
  | 'investigation'
  | 'submission'
  | 'results';

export interface GameState {
  screen: GameScreen;
  caseData: CaseData | null;
  selectedSuspectId: string | null;
  hasSubmitted: boolean;
  scoringResult: ScoringResult | null;
}

// ============================================================================
// Suspect Image Types (Progressive Loading)
// ============================================================================

/**
 * State of a suspect's profile image during progressive loading
 */
export interface SuspectImageState {
  /** Base64 data URL of the loaded image */
  imageUrl: string | null;
  /** Whether the image is currently being fetched */
  loading: boolean;
  /** Error message if image fetch failed */
  error: string | null;
}

/**
 * Map of suspect ID to their image state
 */
export type SuspectImagesMap = Map<string, SuspectImageState>;

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
  loading: boolean;
  error: string | null;
}

export interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  conversationCount: number;
}

export interface UseSubmissionReturn {
  submitAnswer: (answer: W4HAnswer) => Promise<ScoringResult>;
  submitting: boolean;
  error: string | null;
}

/**
 * Return type for useSuspectImages hook
 */
export interface UseSuspectImagesReturn {
  /** Map of suspect ID to their image state */
  images: SuspectImagesMap;
  /** Whether any images are currently loading */
  isLoading: boolean;
  /** Whether all images have finished loading (success or failure) */
  isComplete: boolean;
}
