/**
 * apValidation.ts
 *
 * Middleware for validating AP (Action Points) operations
 * Prevents client-side tampering and ensures server-side authority
 *
 * Phase 3: Security & Validation
 */

import { Request, Response, NextFunction } from 'express';
import { KVStoreManager } from '../services/repositories/kv/KVStoreManager';
import type { PlayerEvidenceState } from '@/shared/types/Evidence';
import type { Case } from '@/shared/types/Case';

/**
 * Extended Request type with validated state
 */
export interface APValidatedRequest extends Request {
  validatedState?: {
    playerState: PlayerEvidenceState;
    caseData: Case;
  };
}

/**
 * Validate AP operations to prevent client-side tampering
 * Ensures all AP operations are verified server-side
 *
 * Usage:
 *   router.post('/api/action', validateAPOperation, handler);
 */
export async function validateAPOperation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId, caseId } = req.body;

    // Validate required parameters
    if (!userId || !caseId) {
      res.status(400).json({
        success: false,
        error: 'MISSING_PARAMS',
        message: 'userId and caseId are required'
      });
      return;
    }

    // Get server-side player state (source of truth)
    const playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

    if (!playerState) {
      res.status(404).json({
        success: false,
        error: 'PLAYER_STATE_NOT_FOUND',
        message: `No player state found for user ${userId} in case ${caseId}`
      });
      return;
    }

    // Get case data for validation
    const caseData = await KVStoreManager.getCase(caseId);

    if (!caseData) {
      res.status(404).json({
        success: false,
        error: 'CASE_NOT_FOUND',
        message: `Case ${caseId} not found`
      });
      return;
    }

    // Attach validated state to request for use in handlers
    (req as APValidatedRequest).validatedState = {
      playerState,
      caseData
    };

    console.log('[AP Validation] Passed:', {
      userId,
      caseId,
      currentAP: playerState.actionPoints?.current || 0,
      totalAP: playerState.actionPoints?.total || 0
    });

    next();
  } catch (error) {
    console.error('[AP Validation] Error:', error);
    res.status(500).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: 'Failed to validate AP operation',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Validate that client-provided AP values match server state
 * Use this to detect client-side tampering attempts
 *
 * Usage:
 *   const tampered = detectAPTampering(clientAP, serverState.actionPoints.current);
 */
export function detectAPTampering(
  clientProvidedAP: number | undefined,
  serverAP: number
): { tampered: boolean; reason?: string } {
  // If client didn't provide AP, no tampering
  if (clientProvidedAP === undefined) {
    return { tampered: false };
  }

  // Check for mismatch
  if (clientProvidedAP !== serverAP) {
    return {
      tampered: true,
      reason: `Client AP (${clientProvidedAP}) does not match server AP (${serverAP})`
    };
  }

  return { tampered: false };
}

/**
 * Validate AP amount is within reasonable bounds
 * Prevents overflow/underflow attacks
 */
export function validateAPAmount(
  amount: number,
  context: string
): { valid: boolean; reason?: string } {
  // Check for negative values
  if (amount < 0) {
    return {
      valid: false,
      reason: `Negative AP amount not allowed (${context})`
    };
  }

  // Check for unreasonably large values (DoS prevention)
  const MAX_REASONABLE_AP = 1000;
  if (amount > MAX_REASONABLE_AP) {
    return {
      valid: false,
      reason: `AP amount too large: ${amount} (max: ${MAX_REASONABLE_AP})`
    };
  }

  // Check for non-integer values
  if (!Number.isInteger(amount)) {
    return {
      valid: false,
      reason: `AP amount must be an integer, got: ${amount}`
    };
  }

  return { valid: true };
}
