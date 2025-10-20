/**
 * APAcquisitionService.ts
 *
 * Core AP (Action Points) acquisition logic for suspect interrogation system.
 * Implements hybrid detection mechanism:
 * - Layer 1: Topic detection (alibi, relationship, motive)
 * - Layer 2: Information value bonuses (suspect mentions, location refs, secrets)
 *
 * Phase 1 MVP: Simple keyword matching and quality checks only.
 * Phase 3: Validation, edge case handling, and anti-cheat measures.
 */

import type { APTopic } from '@/shared/types/Case';
import type { APAcquisition, ActionPointsState } from '@/shared/types/Evidence';

/**
 * Suspect data required for AP analysis
 */
interface SuspectForAP {
  id: string;
  name: string;
  apTopics: APTopic[];
}

/**
 * Case data required for bonus detection
 */
interface CaseDataForAP {
  suspects: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string }>;
  actionPoints: {
    maximum: number;
  };
}

/**
 * AP Acquisition Service
 * Analyzes conversations to determine AP rewards
 */
export class APAcquisitionService {
  /**
   * Analyze user message and AI response to determine AP rewards
   *
   * @param userMessage - Player's question/message to suspect
   * @param aiResponse - Suspect's AI-generated response
   * @param suspect - Suspect being interrogated
   * @param caseData - Current case data
   * @param playerState - Player's current AP state
   * @param conversationId - Unique conversation identifier
   * @returns AP gained and acquisition records
   */
  analyzeConversation(
    userMessage: string,
    aiResponse: string,
    suspect: SuspectForAP,
    caseData: CaseDataForAP,
    playerState: ActionPointsState,
    conversationId: string
  ): { apGained: number; acquisitions: APAcquisition[] } {
    // Phase 3: Enhanced logging for debugging
    console.log('[AP] Analyzing conversation:', {
      suspectId: suspect.id,
      userMessageLength: userMessage.length,
      aiResponseLength: aiResponse.length,
      currentAP: playerState.current
    });

    const acquisitions: APAcquisition[] = [];
    let totalAP = 0;

    // Layer 1: Topic Detection
    const topicResult = this.detectTopic(userMessage, suspect, playerState, conversationId);
    if (topicResult) {
      // Phase 3: Enhanced topic logging
      console.log('[AP] Topic triggered:', {
        topicId: topicResult.topic.id,
        category: topicResult.topic.category,
        reward: topicResult.topic.apReward,
        description: topicResult.topic.description,
        requiresQuality: topicResult.topic.requiresQuality
      });

      // Validate response quality if required
      if (topicResult.topic.requiresQuality) {
        if (!this.evaluateResponseQuality(aiResponse)) {
          // Quality check failed, no AP
          console.log(`[AP] Quality check failed for topic ${topicResult.topic.id}`);
          return { apGained: 0, acquisitions: [] };
        }
      }
      acquisitions.push(topicResult.acquisition);
      totalAP += topicResult.acquisition.amount;
      console.log(`[AP] Topic detected: ${topicResult.topic.id} (+${topicResult.acquisition.amount} AP)`);
    }

    // Layer 2: Bonus Information Detection
    const bonusAcquisitions = this.detectBonusInfo(
      aiResponse,
      suspect.id,
      caseData,
      playerState,
      conversationId
    );
    acquisitions.push(...bonusAcquisitions);
    const bonusAP = bonusAcquisitions.reduce((sum, acq) => sum + acq.amount, 0);
    totalAP += bonusAP;

    // Phase 3: Enhanced bonus logging
    if (bonusAP > 0) {
      console.log('[AP] Bonuses detected:', bonusAcquisitions.map(b => ({
        type: b.bonusType,
        amount: b.amount,
        reason: b.reason
      })));
      console.log(`[AP] Bonuses total: +${bonusAP} AP from ${bonusAcquisitions.length} sources`);
    }

    // Check maximum limit
    const newTotal = playerState.current + totalAP;
    if (newTotal > caseData.actionPoints.maximum) {
      const cappedAP = caseData.actionPoints.maximum - playerState.current;
      console.log(`[AP] Capped at maximum: ${totalAP} -> ${cappedAP} AP`);
      totalAP = cappedAP;

      // Trim acquisitions to reflect capped amount
      acquisitions.length = 0;
      if (totalAP > 0) {
        acquisitions.push({
          timestamp: new Date(),
          amount: totalAP,
          source: 'bonus',
          suspectId: suspect.id,
          conversationId,
          reason: 'AP 최대치 도달'
        });
      }
    }

    // Phase 3: Final analysis summary
    console.log('[AP] Conversation analysis complete:', {
      apGained: totalAP,
      newTotal: playerState.current + totalAP,
      capped: newTotal > caseData.actionPoints.maximum
    });

    return { apGained: totalAP, acquisitions };
  }

  /**
   * Detect if user message triggers a topic
   *
   * @param userMessage - Player's message
   * @param suspect - Suspect being interrogated
   * @param playerState - Player's current AP state
   * @param conversationId - Conversation identifier
   * @returns Topic and acquisition record if triggered, null otherwise
   */
  private detectTopic(
    userMessage: string,
    suspect: SuspectForAP,
    playerState: ActionPointsState,
    conversationId: string
  ): { topic: APTopic; acquisition: APAcquisition } | null {
    const messageLower = userMessage.toLowerCase();

    for (const topic of suspect.apTopics) {
      // Check if already triggered
      const topicKey = `${suspect.id}:${topic.id}`;
      if (playerState.acquiredTopics.has(topicKey)) {
        continue;
      }

      // Check for keyword match
      const hasKeyword = topic.keywords.some(keyword =>
        messageLower.includes(keyword.toLowerCase())
      );

      if (hasKeyword) {
        return {
          topic,
          acquisition: {
            timestamp: new Date(),
            amount: topic.apReward,
            source: 'topic',
            suspectId: suspect.id,
            topicId: topic.id,
            conversationId,
            reason: topic.description
          }
        };
      }
    }

    return null;
  }

  /**
   * Evaluate AI response quality
   * Requirements:
   * - Minimum 50 characters
   * - Contains specific information (time, location, or person references)
   *
   * @param aiResponse - Suspect's response to evaluate
   * @returns true if quality requirements met
   */
  private evaluateResponseQuality(aiResponse: string): boolean {
    // Minimum length check
    if (aiResponse.length < 50) {
      return false;
    }

    // Check for specific information indicators
    const hasTimeReference = /\d{1,2}(시|:|am|pm|오전|오후)/.test(aiResponse);
    const hasLocationReference = /(에서|장소|방|집|사무실|파티|거리|빌딩)/.test(aiResponse);
    const hasPersonReference = /(씨|님|그|그녀|그들|사람|친구|동료)/.test(aiResponse);

    return hasTimeReference || hasLocationReference || hasPersonReference;
  }

  /**
   * Detect bonus information in AI response
   * Bonuses:
   * - Other suspects mention (+1 AP, once per suspect)
   * - Location mention (+1 AP, once per suspect)
   * - Victim secret mention (+1 AP, once per suspect)
   *
   * @param aiResponse - AI response to analyze
   * @param suspectId - Current suspect ID
   * @param caseData - Case data for cross-references
   * @param playerState - Player's AP state
   * @param conversationId - Conversation identifier
   * @returns Array of bonus acquisitions
   */
  private detectBonusInfo(
    aiResponse: string,
    suspectId: string,
    caseData: CaseDataForAP,
    playerState: ActionPointsState,
    conversationId: string
  ): APAcquisition[] {
    const acquisitions: APAcquisition[] = [];

    // Bonus 1: Other suspect mention
    const suspectBonusKey = `${suspectId}:suspect`;
    if (!playerState.bonusesAcquired.has(suspectBonusKey)) {
      const otherSuspects = caseData.suspects.filter(s => s.id !== suspectId);
      const mentionsOtherSuspect = otherSuspects.some(s =>
        aiResponse.includes(s.name)
      );

      if (mentionsOtherSuspect) {
        acquisitions.push({
          timestamp: new Date(),
          amount: 1,
          source: 'bonus',
          suspectId,
          bonusType: 'suspect',
          conversationId,
          reason: '다른 용의자 정보 획득'
        });
      }
    }

    // Bonus 2: Location mention
    const locationBonusKey = `${suspectId}:location`;
    if (!playerState.bonusesAcquired.has(locationBonusKey)) {
      const mentionsLocation = caseData.locations?.some(loc =>
        aiResponse.includes(loc.name)
      ) || false;

      if (mentionsLocation) {
        acquisitions.push({
          timestamp: new Date(),
          amount: 1,
          source: 'bonus',
          suspectId,
          bonusType: 'location',
          conversationId,
          reason: '장소 정보 획득'
        });
      }
    }

    // Bonus 3: Victim secret (simple heuristic)
    const secretBonusKey = `${suspectId}:secret`;
    if (!playerState.bonusesAcquired.has(secretBonusKey)) {
      const secretKeywords = ['비밀', '숨기', '몰랐', '알려지지 않은', '숨겨진', '모르는'];
      const mentionsSecret = secretKeywords.some(keyword =>
        aiResponse.includes(keyword)
      );

      if (mentionsSecret) {
        acquisitions.push({
          timestamp: new Date(),
          amount: 1,
          source: 'bonus',
          suspectId,
          bonusType: 'secret',
          conversationId,
          reason: '피해자 비밀 정보 획득'
        });
      }
    }

    return acquisitions;
  }

  /**
   * Emergency AP: Give 2 AP if player has 0 AP and hasn't used emergency yet
   * This is a safety mechanism to prevent players from getting stuck.
   *
   * @param playerState - Player's current AP state
   * @returns Emergency AP acquisition if eligible, null otherwise
   */
  provideEmergencyAP(
    playerState: ActionPointsState
  ): APAcquisition | null {
    if (playerState.current === 0 && !playerState.emergencyAPUsed) {
      return {
        timestamp: new Date(),
        amount: 2,
        source: 'bonus',
        suspectId: 'system',
        conversationId: 'emergency',
        reason: '긴급 AP 지원 (1회 한정)'
      };
    }
    return null;
  }

  /**
   * Phase 3: Validate AP operation is within legal bounds
   * Prevents client-side tampering and overflow/underflow attacks
   *
   * @param currentAP - Current AP balance
   * @param operation - Operation type (add or subtract)
   * @param amount - Amount to add or subtract
   * @param maximum - Maximum AP cap
   * @returns Validation result with adjusted amount if needed
   */
  validateAPBounds(
    currentAP: number,
    operation: 'add' | 'subtract',
    amount: number,
    maximum: number
  ): { valid: boolean; adjustedAmount: number; reason?: string } {
    // Validate input parameters
    if (amount < 0) {
      return {
        valid: false,
        adjustedAmount: 0,
        reason: 'Negative AP amount not allowed'
      };
    }

    if (!Number.isInteger(amount)) {
      return {
        valid: false,
        adjustedAmount: 0,
        reason: `AP amount must be an integer, got: ${amount}`
      };
    }

    if (operation === 'add') {
      // Check maximum cap
      const newTotal = currentAP + amount;
      if (newTotal > maximum) {
        const adjustedAmount = maximum - currentAP;
        return {
          valid: true,
          adjustedAmount: Math.max(0, adjustedAmount),
          reason: `AP capped at maximum (${maximum})`
        };
      }
    }

    if (operation === 'subtract') {
      // Check minimum (can't go negative)
      const newTotal = currentAP - amount;
      if (newTotal < 0) {
        return {
          valid: false,
          adjustedAmount: 0,
          reason: `Insufficient AP (have: ${currentAP}, need: ${amount})`
        };
      }
    }

    return { valid: true, adjustedAmount: amount };
  }

  /**
   * Phase 3: Detect suspicious AP acquisition patterns (anti-cheat)
   * Non-blocking for MVP - logs warnings only
   *
   * @param acquisitionHistory - Player's AP acquisition history
   * @returns Suspicion detection result
   */
  detectSuspiciousActivity(
    acquisitionHistory: APAcquisition[]
  ): { suspicious: boolean; reason?: string } {
    if (acquisitionHistory.length === 0) {
      return { suspicious: false };
    }

    // Check 1: Rapid-fire acquisitions (possible exploit)
    const recentAcquisitions = acquisitionHistory.filter(
      a => Date.now() - a.timestamp.getTime() < 60000 // Last minute
    );

    if (recentAcquisitions.length > 10) {
      return {
        suspicious: true,
        reason: `Too many AP acquisitions in short time (${recentAcquisitions.length} in last minute, max: 10)`
      };
    }

    // Check 2: Duplicate topic acquisitions (should be prevented by server logic)
    const topicKeys = new Map<string, number>();
    for (const acq of acquisitionHistory) {
      if (acq.source === 'topic' && acq.topicId && acq.suspectId) {
        const key = `${acq.suspectId}:${acq.topicId}`;
        const count = topicKeys.get(key) || 0;
        topicKeys.set(key, count + 1);

        if (count > 0) {
          // Duplicate topic trigger detected
          return {
            suspicious: true,
            reason: `Duplicate topic acquisition detected: ${key} (acquired ${count + 1} times)`
          };
        }
      }
    }

    // Check 3: Duplicate bonus acquisitions (should be prevented by server logic)
    const bonusKeys = new Map<string, number>();
    for (const acq of acquisitionHistory) {
      if (acq.source === 'bonus' && acq.bonusType && acq.suspectId) {
        const key = `${acq.suspectId}:${acq.bonusType}`;
        const count = bonusKeys.get(key) || 0;
        bonusKeys.set(key, count + 1);

        if (count > 0) {
          return {
            suspicious: true,
            reason: `Duplicate bonus acquisition detected: ${key} (acquired ${count + 1} times)`
          };
        }
      }
    }

    // Check 4: Unreasonably large single acquisition
    const MAX_SINGLE_ACQUISITION = 10; // Topics give max 3 AP, so 10 is very suspicious
    const largeAcquisition = acquisitionHistory.find(a => a.amount > MAX_SINGLE_ACQUISITION);
    if (largeAcquisition) {
      return {
        suspicious: true,
        reason: `Unreasonably large single acquisition: ${largeAcquisition.amount} AP (max expected: ${MAX_SINGLE_ACQUISITION})`
      };
    }

    return { suspicious: false };
  }

  /**
   * Phase 3: Verify AP integrity by calculating expected values
   * Detects discrepancies between reported and calculated values
   *
   * @param playerState - Player's AP state to verify
   * @returns Integrity check result
   */
  verifyAPIntegrity(
    playerState: ActionPointsState
  ): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Calculate expected total from history
    const expectedTotal = playerState.initial +
      playerState.acquisitionHistory.reduce((sum, acq) => sum + acq.amount, 0);

    // Calculate expected spent from history
    const expectedSpent = playerState.spendingHistory.reduce((sum, spend) => sum + spend.amount, 0);

    // Calculate expected current
    const expectedCurrent = expectedTotal - expectedSpent;

    // Check for discrepancies
    if (playerState.total !== expectedTotal) {
      issues.push(`Total AP mismatch: reported ${playerState.total}, expected ${expectedTotal}`);
    }

    if (playerState.spent !== expectedSpent) {
      issues.push(`Spent AP mismatch: reported ${playerState.spent}, expected ${expectedSpent}`);
    }

    if (playerState.current !== expectedCurrent) {
      issues.push(`Current AP mismatch: reported ${playerState.current}, expected ${expectedCurrent}`);
    }

    // Check for negative values (should never happen)
    if (playerState.current < 0) {
      issues.push(`Negative current AP: ${playerState.current}`);
    }

    if (playerState.spent < 0) {
      issues.push(`Negative spent AP: ${playerState.spent}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
