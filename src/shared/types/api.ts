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
