export type InitResponse = {
  type: 'init';
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: 'increment';
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: 'decrement';
  postId: string;
  count: number;
};

// =============================================================================
// AP INTEGRATION API TYPES (Phase 2)
// =============================================================================

/**
 * AP Acquisition breakdown in interrogation response
 */
export interface APAcquisitionBreakdown {
  amount: number;
  reason: string;
  breakdown: {
    topicAP: number;
    bonusAP: number;
  };
  newTotal: number;
}

/**
 * Player AP state summary
 */
export interface PlayerAPState {
  currentAP: number;
  totalAP: number;
  spentAP: number;
}

/**
 * Interrogation/Chat response with AP data
 */
export interface InterrogationResponse {
  success: boolean;
  aiResponse: string;
  conversationId: string;
  apAcquisition?: APAcquisitionBreakdown;
  playerState: PlayerAPState;
}

/**
 * Search location response with AP data
 */
export interface SearchLocationResponse {
  success: boolean;
  evidenceFound: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    importance: number;
    discoveredAt: number;
  }>;
  completionRate: number;
  message: string;
  playerState: PlayerAPState;
}

/**
 * AP status response
 */
export interface APStatusResponse {
  success: boolean;
  actionPoints: {
    current: number;
    maximum: number;
    total: number;
    spent: number;
    initial: number;
    emergencyAPUsed: boolean;
    acquisitionCount: number;
    spendingCount: number;
  };
}

// =============================================================================
// IMAGE GENERATION STATUS API (GAP-002)
// =============================================================================

/**
 * Image type status
 * Tracks generation progress for a specific image category (evidence or location)
 */
export interface ImageTypeStatus {
  /** Current generation status */
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  /** Total number of images to generate */
  total: number;
  /** Number of images successfully generated */
  completed: number;
  /** Number of images that failed to generate */
  failed: number;
  /** ISO timestamp when generation started */
  startedAt?: string;
  /** ISO timestamp when generation completed */
  completedAt?: string;
}

/**
 * Unified image generation status response
 * GET /api/case/:caseId/image-status
 *
 * Returns real-time progress for both evidence and location image generation.
 * Frontend polls this endpoint every 5s to track async background generation.
 */
export interface ImageGenerationStatusResponse {
  /** Case ID */
  caseId: string;
  /** Evidence image generation status */
  evidence: ImageTypeStatus;
  /** Location image generation status */
  location: ImageTypeStatus;
  /** True if all images are generated (both evidence and location complete) */
  complete: boolean;
  /** ISO timestamp of last status update */
  lastUpdated: string;
}

// =============================================================================
// CASE MANAGEMENT API TYPES
// =============================================================================

/**
 * Generate case response
 * POST /api/case/generate
 */
export interface GenerateCaseResponse {
  success: boolean;
  message: string;
  caseId: string;
  date: string;
  locations: Array<{
    id: string;
    name: string;
    description: string;
    emoji: string;
  }>;
  evidenceCount: number;
}

/**
 * Regenerate case request
 * POST /api/case/regenerate
 */
export interface RegenerateCaseRequest {
  caseId: string;
}

/**
 * Regenerate case response
 * POST /api/case/regenerate
 */
export interface RegenerateCaseResponse {
  success: boolean;
  message: string;
  caseId: string;
  date: string;
  suspectsWithImages: number;
  totalSuspects: number;
}

/**
 * Create game post response
 * POST /api/create-game-post
 */
export interface CreateGamePostResponse {
  success: boolean;
  message: string;
  caseId: string;
  date: string;
  postId: string;
  postUrl: string;
  postTitle: string;
  suspects: Array<{
    name: string;
    archetype: string;
    hasImage: boolean;
  }>;
  victim: string;
  generatedAt: number;
}

/**
 * Delete case response
 * DELETE /api/case/:caseId
 */
export interface DeleteCaseResponse {
  success: boolean;
  message: string;
  caseId: string;
}

/**
 * Emotional state
 */
export interface EmotionalState {
  suspicionLevel: number;
  tone: 'cooperative' | 'nervous' | 'defensive' | 'aggressive';
  lastUpdated: number;
}

/**
 * Victim data
 */
export interface VictimData {
  name: string;
  background: string;
  relationship: string;
}

/**
 * Weapon data
 */
export interface WeaponData {
  name: string;
  description: string;
}

/**
 * Location data
 */
export interface LocationData {
  name: string;
  description: string;
}

/**
 * Suspect data (client-safe, isGuilty excluded)
 */
export interface SuspectData {
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: EmotionalState;
  hasProfileImage: boolean;
}

/**
 * Case API response
 * GET /api/case/today
 * GET /api/case/:caseId
 */
export interface CaseApiResponse {
  id: string;
  date: string;
  language: 'ko' | 'en';
  victim: VictimData;
  weapon: WeaponData;
  location: LocationData;
  suspects: SuspectData[];
  imageUrl?: string;
  introNarration?: any; // LEGACY
  introSlides?: any; // NEW
  cinematicImages?: any;
  locations: Array<{
    id: string;
    name: string;
    description: string;
    emoji: string;
  }>;
  evidence: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    importance: number;
  }>;
  evidenceDistribution: any;
  actionPoints: {
    initial: number;
    maximum: number;
    costs: {
      quick: number;
      thorough: number;
      exhaustive: number;
    };
  };
  generatedAt: number;
  playerState?: {
    actionPointsRemaining: number;
    actionPointsUsed: number;
    [key: string]: any;
  };
  _autoRegenerated?: boolean;
}

// =============================================================================
// SUSPECT & INTERROGATION API TYPES
// =============================================================================

/**
 * Get suspects response
 * GET /api/suspects/:caseId
 */
export interface GetSuspectsResponse {
  suspects: Array<{
    id: string;
    caseId: string;
    name: string;
    archetype: string;
    background: string;
    personality: string;
    emotionalState: EmotionalState;
    profileImageUrl?: string;
  }>;
}

/**
 * Get suspect image response
 * GET /api/suspect-image/:suspectId
 */
export interface GetSuspectImageResponse {
  suspectId: string;
  profileImageUrl: string;
}

/**
 * Get conversation response
 * GET /api/conversation/:suspectId/:userId
 */
export interface GetConversationResponse {
  messages: Array<{
    role: 'user' | 'suspect';
    content: string;
    timestamp: number;
  }>;
}

// =============================================================================
// EVIDENCE DISCOVERY API TYPES
// =============================================================================

/**
 * Get player state response
 * GET /api/player-state/:caseId/:userId
 */
export interface GetPlayerStateResponse {
  caseId: string;
  userId: string;
  actionPointsRemaining: number;
  actionPointsUsed: number;
  discoveredEvidence: Array<{
    evidenceId: string;
    discoveredAt: Date;
    searchType: 'quick' | 'thorough' | 'exhaustive';
    locationId: string;
  }>;
  searchHistory: Array<{
    locationId: string;
    searchType: 'quick' | 'thorough' | 'exhaustive';
    timestamp: Date;
    evidenceFound: number;
  }>;
  lastUpdated: Date;
  [key: string]: any;
}

/**
 * Initialize player state request
 * POST /api/player-state/initialize
 */
export interface InitializePlayerStateRequest {
  caseId: string;
  userId: string;
}

/**
 * Initialize player state response
 * POST /api/player-state/initialize
 */
export interface InitializePlayerStateResponse extends GetPlayerStateResponse {}

// =============================================================================
// SUBMISSION & SCORING API TYPES
// =============================================================================

/**
 * Submit answer request
 * POST /api/submit
 */
export interface SubmitAnswerRequest {
  userId: string;
  caseId: string;
  answers: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
}

/**
 * Submit answer response
 * POST /api/submit
 */
export interface SubmitAnswerResponse {
  userId: string;
  caseId: string;
  score: number;
  isCorrect: boolean;
  feedback: {
    who: { correct: boolean; feedback: string };
    what: { correct: boolean; feedback: string };
    where: { correct: boolean; feedback: string };
    when: { correct: boolean; feedback: string };
    why: { correct: boolean; feedback: string };
    how: { correct: boolean; feedback: string };
  };
  submittedAt: number;
}

/**
 * Get leaderboard response
 * GET /api/leaderboard/:caseId
 */
export interface GetLeaderboardResponse {
  leaderboard: Array<{
    userId: string;
    score: number;
    isCorrect: boolean;
    submittedAt: number;
  }>;
}

/**
 * Get case stats response
 * GET /api/stats/:caseId
 */
export interface GetCaseStatsResponse {
  totalSubmissions: number;
  correctSubmissions: number;
  averageScore: number;
  [key: string]: any;
}

// =============================================================================
// ACTION POINTS (AP) INTEGRITY API TYPES
// =============================================================================

/**
 * AP integrity response
 * GET /api/admin/ap-integrity/:userId
 */
export interface APIntegrityResponse {
  success: boolean;
  userId: string;
  caseId: string;
  integrity: 'VALID' | 'SUSPICIOUS' | 'INVALID' | 'NOT_INITIALIZED';
  issues: string[];
  stats: {
    current: number;
    total: number;
    spent: number;
    initial: number;
    acquisitions: number;
    spendings: number;
    acquiredTopics: number;
    bonusesAcquired: number;
    emergencyAPUsed: boolean;
  };
  calculatedValues: {
    expectedTotal: number;
    expectedSpent: number;
    expectedCurrent: number;
  };
  recentActivity: {
    lastAcquisition: any | null;
    lastSpending: any | null;
    acquisitionsLast60Seconds: number;
  };
}

// =============================================================================
// IMAGE STATUS API TYPES
// =============================================================================

/**
 * Evidence image status response
 * GET /api/case/:caseId/evidence-images/status
 */
export interface EvidenceImageStatusResponse {
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  totalCount: number;
  completedCount: number;
  images: Record<string, string>; // evidenceId -> imageUrl
  lastUpdated: string;
}

/**
 * Location image status response
 * GET /api/case/:caseId/location-images/status
 */
export interface LocationImageStatusResponse {
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  totalCount: number;
  completedCount: number;
  images: Record<string, string>; // locationId -> imageUrl
  lastUpdated: string;
}

// =============================================================================
// ERROR RESPONSE TYPES
// =============================================================================

/**
 * Standard API error response
 */
export interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: unknown;
}
