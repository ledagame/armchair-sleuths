/**
 * TEMPORARY DEBUG ENDPOINTS
 *
 * Add these endpoints to src/server/index.ts after line 184 (after the /api/case/generate endpoint)
 * to help diagnose the suspects issue.
 *
 * REMEMBER TO REMOVE THESE AFTER DEBUGGING!
 */

// =============================================================================
// 🔧 DEBUG ENDPOINTS (REMOVE AFTER FIXING SUSPECTS ISSUE)
// =============================================================================

/**
 * POST /api/debug/regenerate-today
 * Delete today's case and regenerate it to test suspect storage
 */
router.post('/api/debug/regenerate-today', async (_req, res): Promise<void> => {
  try {
    console.log('🔧 DEBUG: Regenerating today\'s case...');

    const today = new Date().toISOString().split('T')[0];
    const caseId = `case-${today}`;

    // Delete existing case if it exists
    const existingCase = await CaseRepository.getCaseById(caseId);
    if (existingCase) {
      await CaseRepository.deleteCase(caseId);
      console.log(`🗑️  DEBUG: Deleted existing case: ${caseId}`);
    } else {
      console.log(`ℹ️  DEBUG: No existing case found for ${caseId}`);
    }

    // Generate new case
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    console.log('🔄 DEBUG: Starting case generation...');
    const caseData = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false
    });

    console.log(`✅ DEBUG: Case generated: ${caseData.id}`);

    // Verify suspects were saved
    const suspects = await CaseRepository.getCaseSuspects(caseData.id);
    console.log(`📊 DEBUG: Retrieved ${suspects.length} suspects for case ${caseData.id}`);

    res.json({
      success: true,
      message: 'Case regenerated successfully',
      caseId: caseData.id,
      date: caseData.date,
      suspectsCount: suspects.length,
      suspects: suspects.map(s => ({
        id: s.id,
        name: s.name,
        archetype: s.archetype
      }))
    });
  } catch (error) {
    console.error('❌ DEBUG: Error regenerating case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/debug/redis/:key
 * Inspect raw Redis values
 */
router.get('/api/debug/redis/:key(*)', async (req, res): Promise<void> => {
  try {
    const key = req.params.key;
    console.log(`🔍 DEBUG: Fetching Redis key: ${key}`);

    const value = await redis.get(key);

    if (value === null) {
      res.json({
        key,
        value: null,
        exists: false,
        message: 'Key not found in Redis'
      });
    } else {
      // Try to parse as JSON for better display
      let parsed = null;
      try {
        parsed = JSON.parse(value);
      } catch (e) {
        // Not JSON, that's ok
      }

      res.json({
        key,
        value,
        parsed,
        exists: true,
        length: value.length
      });
    }
  } catch (error) {
    console.error('❌ DEBUG: Error fetching Redis key:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/debug/case/:caseId
 * Detailed case inspection
 */
router.get('/api/debug/case/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;
    console.log(`🔍 DEBUG: Inspecting case: ${caseId}`);

    // Get case data
    const caseData = await CaseRepository.getCaseById(caseId);

    if (!caseData) {
      res.status(404).json({
        error: 'Case not found',
        caseId
      });
      return;
    }

    // Get suspects from index
    const suspects = await CaseRepository.getCaseSuspects(caseId);

    // Get raw Redis data
    const caseKey = `case:${caseId}`;
    const suspectsIndexKey = `case:${caseId}:suspects`;

    const rawCaseData = await redis.get(caseKey);
    const rawSuspectsIndex = await redis.get(suspectsIndexKey);

    // Parse suspects index
    let suspectsIndexParsed = null;
    if (rawSuspectsIndex) {
      try {
        suspectsIndexParsed = JSON.parse(rawSuspectsIndex);
      } catch (e) {
        console.error('Failed to parse suspects index:', e);
      }
    }

    // Get individual suspect data
    const suspectDetails = [];
    if (suspectsIndexParsed && Array.isArray(suspectsIndexParsed)) {
      for (const suspectId of suspectsIndexParsed) {
        const suspectKey = `suspect:${suspectId}`;
        const rawSuspect = await redis.get(suspectKey);
        suspectDetails.push({
          id: suspectId,
          key: suspectKey,
          exists: rawSuspect !== null,
          data: rawSuspect ? JSON.parse(rawSuspect) : null
        });
      }
    }

    res.json({
      caseId,
      case: {
        id: caseData.id,
        date: caseData.date,
        generatedAt: caseData.generatedAt,
        suspectsInCaseData: caseData.suspects.length
      },
      suspects: {
        fromRepository: suspects.length,
        repositoryData: suspects.map(s => ({
          id: s.id,
          name: s.name,
          archetype: s.archetype
        }))
      },
      redis: {
        caseKey: {
          key: caseKey,
          exists: rawCaseData !== null,
          size: rawCaseData?.length || 0
        },
        suspectsIndexKey: {
          key: suspectsIndexKey,
          exists: rawSuspectsIndex !== null,
          raw: rawSuspectsIndex,
          parsed: suspectsIndexParsed,
          count: Array.isArray(suspectsIndexParsed) ? suspectsIndexParsed.length : 0
        },
        individualSuspects: suspectDetails
      }
    });
  } catch (error) {
    console.error('❌ DEBUG: Error inspecting case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/debug/test-storage
 * Test basic storage operations
 */
router.post('/api/debug/test-storage', async (_req, res): Promise<void> => {
  try {
    console.log('🔧 DEBUG: Testing storage operations...');

    const testKey = 'debug-test-set';
    const testMembers = ['member1', 'member2', 'member3'];

    // Test sAdd
    console.log(`📝 Testing sAdd with key: ${testKey}`);
    for (const member of testMembers) {
      await devvitAdapter.sAdd(testKey, member);
    }

    // Test sMembers
    console.log(`📖 Testing sMembers with key: ${testKey}`);
    const retrieved = await devvitAdapter.sMembers(testKey);

    // Test individual get/set
    const testDataKey = 'debug-test-data';
    const testData = { foo: 'bar', timestamp: Date.now() };

    console.log(`📝 Testing set with key: ${testDataKey}`);
    await devvitAdapter.set(testDataKey, JSON.stringify(testData));

    console.log(`📖 Testing get with key: ${testDataKey}`);
    const retrievedData = await devvitAdapter.get(testDataKey);

    // Cleanup
    await devvitAdapter.del(testKey, testDataKey);

    res.json({
      success: true,
      tests: {
        sAdd: {
          added: testMembers,
          count: testMembers.length
        },
        sMembers: {
          retrieved,
          count: retrieved.length,
          matches: JSON.stringify(testMembers.sort()) === JSON.stringify(retrieved.sort())
        },
        setAndGet: {
          original: testData,
          retrieved: retrievedData ? JSON.parse(retrievedData) : null,
          matches: retrievedData === JSON.stringify(testData)
        }
      }
    });
  } catch (error) {
    console.error('❌ DEBUG: Error testing storage:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// =============================================================================
// END DEBUG ENDPOINTS
// =============================================================================
