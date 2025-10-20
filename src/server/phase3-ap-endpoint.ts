// =============================================================================
// AP INTEGRITY CHECK ENDPOINT (Phase 3)
// =============================================================================

/**
 * GET /api/admin/ap-integrity/:userId
 * AP 무결성 검사 (디버깅 및 모니터링용)
 *
 * Phase 3: Server-side validation and anti-cheat monitoring
 *
 * Query params:
 *   - caseId (optional): If not provided, uses today's case
 *
 * Returns: Integrity status, issues detected, and statistics
 */
router.get('/api/admin/ap-integrity/:userId', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const queryCaseId = req.query.caseId as string | undefined;

    // Get case data
    let caseData;
    if (queryCaseId) {
      caseData = await KVStoreManager.getCase(queryCaseId);
    } else {
      caseData = await KVStoreManager.getTodaysCase();
    }

    if (!caseData) {
      res.status(404).json({
        success: false,
        error: 'CASE_NOT_FOUND',
        message: 'No case found for the specified ID or today\'s date'
      });
      return;
    }

    const caseId = caseData.id;

    // Get player state
    const playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

    if (!playerState) {
      res.json({
        success: true,
        integrity: 'NOT_INITIALIZED',
        message: 'Player has not initialized AP system yet',
        userId,
        caseId
      });
      return;
    }

    // Check if AP is initialized
    if (!playerState.actionPoints) {
      res.json({
        success: true,
        integrity: 'NOT_INITIALIZED',
        message: 'Player state exists but AP not initialized',
        userId,
        caseId
      });
      return;
    }

    const ap = playerState.actionPoints;

    // Phase 3: Verify AP integrity
    const integrityCheck = apService.verifyAPIntegrity(ap);

    // Phase 3: Check for suspicious activity
    const suspiciousCheck = apService.detectSuspiciousActivity(ap.acquisitionHistory);

    // Collect all issues
    const allIssues = [
      ...integrityCheck.issues,
      ...(suspiciousCheck.suspicious ? [suspiciousCheck.reason || 'Unknown suspicious activity'] : [])
    ];

    // Determine overall integrity status
    let integrity: 'VALID' | 'SUSPICIOUS' | 'INVALID';
    if (!integrityCheck.valid) {
      integrity = 'INVALID';
    } else if (suspiciousCheck.suspicious) {
      integrity = 'SUSPICIOUS';
    } else {
      integrity = 'VALID';
    }

    // Log if issues found
    if (allIssues.length > 0) {
      console.warn(`[AP Integrity] Issues detected for user ${userId}:`, allIssues);
    }

    res.json({
      success: true,
      userId,
      caseId,
      integrity,
      issues: allIssues,
      stats: {
        current: ap.current,
        total: ap.total,
        spent: ap.spent,
        initial: ap.initial,
        acquisitions: ap.acquisitionHistory.length,
        spendings: ap.spendingHistory.length,
        acquiredTopics: ap.acquiredTopics.size,
        bonusesAcquired: ap.bonusesAcquired.size,
        emergencyAPUsed: ap.emergencyAPUsed
      },
      calculatedValues: {
        expectedTotal: ap.initial + ap.acquisitionHistory.reduce((sum, acq) => sum + acq.amount, 0),
        expectedSpent: ap.spendingHistory.reduce((sum, spend) => sum + spend.amount, 0),
        expectedCurrent: (ap.initial + ap.acquisitionHistory.reduce((sum, acq) => sum + acq.amount, 0)) -
                        ap.spendingHistory.reduce((sum, spend) => sum + spend.amount, 0)
      },
      recentActivity: {
        lastAcquisition: ap.acquisitionHistory.length > 0 ?
          ap.acquisitionHistory[ap.acquisitionHistory.length - 1] : null,
        lastSpending: ap.spendingHistory.length > 0 ?
          ap.spendingHistory[ap.spendingHistory.length - 1] : null,
        acquisitionsLast60Seconds: ap.acquisitionHistory.filter(
          a => Date.now() - a.timestamp.getTime() < 60000
        ).length
      }
    });

  } catch (error) {
    console.error('[AP Integrity] Error:', error);
    res.status(500).json({
      success: false,
      error: 'INTEGRITY_CHECK_FAILED',
      message: error instanceof Error ? error.message : 'Failed to check AP integrity'
    });
  }
});
