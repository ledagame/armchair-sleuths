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
