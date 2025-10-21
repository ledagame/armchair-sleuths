import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse, InterrogationResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort, settings } from '@devvit/web/server';
import { createPost } from './core/post';
import { createGeminiClient } from './services/gemini/GeminiClient';
import { createCaseGeneratorService } from './services/case/CaseGeneratorService';
import { CaseRepository } from './services/repositories/kv/CaseRepository';
import { createSuspectAIService } from './services/suspect/SuspectAIService';
import { createW4HValidator } from './services/scoring/W4HValidator';
import { createScoringEngine } from './services/scoring/ScoringEngine';
import { KVStoreManager } from './services/repositories/kv/KVStoreManager';
import { DevvitStorageAdapter } from './services/repositories/adapters/DevvitStorageAdapter';
// Evidence Discovery System imports
import { EvidenceDiscoveryService } from './services/discovery/EvidenceDiscoveryService';
import { createPlayerEvidenceStateService } from './services/state/PlayerEvidenceStateService';
import { createActionPointsService } from './services/discovery/ActionPointsService';
import type { SearchLocationRequest } from '../shared/types/Discovery';
// AP Acquisition System imports (Phase 2)
import { APAcquisitionService } from './services/ap/APAcquisitionService';
// Scheduler initialization
import { initializeAllSchedulers } from './schedulers/DailyCaseScheduler';

const app = express();

// Initialize Devvit storage adapter for production
const devvitAdapter = new DevvitStorageAdapter();
KVStoreManager.setAdapter(devvitAdapter);

// Initialize AP service (Phase 2)
const apService = new APAcquisitionService();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const [count, username] = await Promise.all([
        redis.get('count'),
        reddit.getCurrentUsername(),
      ]);

      res.json({
        type: 'init',
        postId: postId,
        count: count ? parseInt(count) : 0,
        username: username ?? 'anonymous',
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, IncrementResponse | { status: string; message: string }, unknown>(
  '/api/increment',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', 1),
      postId,
      type: 'increment',
    });
  }
);

router.post<{ postId: string }, DecrementResponse | { status: string; message: string }, unknown>(
  '/api/decrement',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    res.json({
      count: await redis.incrBy('count', -1),
      postId,
      type: 'decrement',
    });
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    // Get API key from settings (must be in route handler context)
    const apiKey = await settings.get('geminiApiKey');

    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize schedulers (pre-generate daily cases) - fire and forget
    console.log('🔧 App installed - initializing schedulers...');
    initializeAllSchedulers(apiKey as string).catch(error => {
      console.error('❌ Background scheduler initialization failed:', error);
    });

    const post = await createPost();

    res.json({
      status: 'success',
      message: `App installed successfully! Scheduler initialized. Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error during app installation: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to install app',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new unique game case from menu...');

    // 1. Get Gemini API key
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        status: 'error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    // 2. Generate timestamp-based unique case ID
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();
    const customCaseId = `case-${dateStr}-${timestamp}`;

    console.log(`📝 Generating case with ID: ${customCaseId}`);

    // 3. Generate new case with images
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const newCase = await caseGenerator.generateCase({
      date: now,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8,
      customCaseId: customCaseId
    });

    console.log(`✅ Case generated: ${newCase.id}`);
    console.log(`   - Victim: ${newCase.victim.name}`);
    console.log(`   - Suspects: ${newCase.suspects.map(s => s.name).join(', ')}`);
    console.log(`   - Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);

    // 4. Create post title with game info
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`;

    console.log(`📮 Creating Reddit post: ${postTitle}`);

    // 5. Create Reddit post with unique case
    const post = await createPost({
      caseId: newCase.id,
      title: postTitle,
      subredditName: context.subredditName
    });

    console.log(`✅ Post created: ${post.id}`);

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

/**
 * POST /internal/menu/test-media-upload
 * Run media upload validation tests from menu
 */
router.post('/internal/menu/test-media-upload', async (_req, res): Promise<void> => {
  try {
    console.log('🧪 Running media upload validation tests from menu...');

    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({
        status: 'error',
        message: 'Gemini API key not configured'
      });
      return;
    }

    // Import test class
    const { MediaUploadTest } = await import('./test/MediaUploadTest');
    const tester = new MediaUploadTest(context, apiKey);

    // Run all tests
    console.log('🚀 Starting test suite...');
    const results = await tester.runAllTests();

    const allPassed = results.every(r => r.success);
    const summary = {
      totalTests: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => r.success === false).length,
      totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
    };

    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${summary.totalTests}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Duration: ${summary.totalDuration}ms`);
    console.log(`   Status: ${allPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}\n`);

    // Return results (Devvit will show this to the user)
    res.json({
      status: allPassed ? 'success' : 'partial_success',
      message: `Tests complete: ${summary.passed}/${summary.totalTests} passed`,
      results,
      summary
    });

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    res.status(500).json({
      status: 'error',
      message: `Test suite failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// =============================================================================
// 🎮 GAME API ROUTES
// =============================================================================

/**
 * POST /api/case/generate
 * 오늘의 케이스 생성 (관리자용)
 */
router.post('/api/case/generate', async (_req, res): Promise<void> => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    console.log('🔄 Generating today\'s case...');
    const caseData = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false, // Skip case image for faster generation
      includeSuspectImages: true,
      includeCinematicImages: true
    });

    console.log(`✅ Case generated: ${caseData.id}`);
    console.log(`   - Suspect Images: ${caseData.suspects.filter(s => s.profileImageUrl).length}/${caseData.suspects.length}`);

    res.json({
      success: true,
      message: 'Case generated successfully',
      caseId: caseData.id,
      date: caseData.date,
      locations: caseData.locations,
      evidenceCount: caseData.evidence?.length
    });
  } catch (error) {
    console.error('Error generating case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate case'
    });
  }
});

/**
 * POST /api/case/regenerate
 * 케이스 재생성 (이미지 없는 케이스 삭제 후 이미지 포함 재생성)
 */
router.post('/api/case/regenerate', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.body;

    if (!caseId) {
      res.status(400).json({
        error: 'Bad request',
        message: 'caseId is required'
      });
      return;
    }

    console.log(`🔄 Regenerating case: ${caseId}`);

    // 1. Check if case exists
    const existingCase = await CaseRepository.getCaseById(caseId);

    if (!existingCase) {
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${caseId} does not exist`
      });
      return;
    }

    // 2. Check if images are already present
    const existingSuspects = await CaseRepository.getCaseSuspects(caseId);
    const suspectsWithImages = existingSuspects.filter(s => s.profileImageUrl);

    if (suspectsWithImages.length === existingSuspects.length && existingSuspects.length > 0) {
      console.log(`✅ Case ${caseId} already has all images`);
      res.json({
        success: true,
        message: 'Case already has profile images',
        caseId,
        suspectsWithImages: suspectsWithImages.length,
        totalSuspects: existingSuspects.length
      });
      return;
    }

    console.log(`⚠️  Case ${caseId} missing images: ${suspectsWithImages.length}/${existingSuspects.length}`);

    // 3. Delete old case
    console.log(`🗑️  Deleting old case: ${caseId}`);
    await CaseRepository.deleteCase(caseId);

    // 4. Generate new case with images
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    // Parse date from caseId (format: case-YYYY-MM-DD)
    const dateStr = caseId.replace('case-', '');
    const caseDate = new Date(dateStr);

    console.log(`🎨 Generating new case with images for ${dateStr}...`);

    const newCase = await caseGenerator.generateCase({
      date: caseDate,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8
    });

    const imagesGenerated = newCase.suspects.filter(s => s.profileImageUrl).length;

    console.log(`✅ Case regenerated successfully: ${newCase.id}`);
    console.log(`   - Images: ${imagesGenerated}/${newCase.suspects.length}`);

    res.json({
      success: true,
      message: 'Case regenerated with profile images',
      caseId: newCase.id,
      date: newCase.date,
      suspectsWithImages: imagesGenerated,
      totalSuspects: newCase.suspects.length
    });

  } catch (error) {
    console.error('Error regenerating case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to regenerate case'
    });
  }
});

/**
 * POST /api/create-game-post
 * 새로운 게임 케이스 생성 및 자동 Reddit 포스트 업로드
 *
 * 개발 중 새 기능 테스트용: 타임스탬프 기반 고유 케이스 ID 생성하여
 * 각 포스트마다 독립적인 게임 시나리오 제공 (넷플릭스 모델)
 */
router.post('/api/create-game-post', async (req, res): Promise<void> => {
  try {
    console.log('🎮 Creating new game case and post...');

    // 1. Get Gemini API key
    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    // 2. Generate timestamp-based unique case ID
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();
    const customCaseId = `case-${dateStr}-${timestamp}`;

    console.log(`📝 Generating case with ID: ${customCaseId}`);

    // 3. Generate new case with images
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const newCase = await caseGenerator.generateCase({
      date: now,
      includeImage: true,
      includeSuspectImages: true,
      includeCinematicImages: true,
      temperature: 0.8,
      customCaseId: customCaseId
    });

    console.log(`✅ Case generated: ${newCase.id}`);
    console.log(`   - Victim: ${newCase.victim.name}`);
    console.log(`   - Suspects: ${newCase.suspects.map(s => s.name).join(', ')}`);
    console.log(`   - Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);

    // 4. Create post title with game info
    const suspectNames = newCase.suspects.map(s => s.name).join(', ');
    const postTitle = `🔍 ${dateStr} 미스터리 | 용의자: ${suspectNames}`;

    console.log(`📮 Creating Reddit post: ${postTitle}`);

    // 5. Create Reddit post
    const post = await createPost({
      caseId: newCase.id,
      title: postTitle,
      subredditName: 'armchair_sleuths_dev' // Dev subreddit
    });

    console.log(`✅ Post created: ${post.id}`);

    // 6. Return success response
    res.json({
      success: true,
      message: 'Game case and post created successfully',
      caseId: newCase.id,
      date: newCase.date,
      postId: post.id,
      postUrl: post.url,
      postTitle: postTitle,
      suspects: newCase.suspects.map(s => ({
        name: s.name,
        archetype: s.archetype,
        hasImage: !!s.profileImageUrl
      })),
      victim: newCase.victim.name,
      generatedAt: newCase.generatedAt
    });

  } catch (error) {
    console.error('Error creating game post:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to create game post'
    });
  }
});

/**
 * DELETE /api/case/:caseId
 * 케이스 삭제 (개발/관리자용)
 */
router.delete('/api/case/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;

    console.log(`🗑️  Deleting case: ${caseId}`);

    const existingCase = await CaseRepository.getCaseById(caseId);

    if (!existingCase) {
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${caseId} does not exist`
      });
      return;
    }

    await CaseRepository.deleteCase(caseId);

    console.log(`✅ Case deleted: ${caseId}`);

    res.json({
      success: true,
      message: 'Case deleted successfully',
      caseId
    });

  } catch (error) {
    console.error('Error deleting case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete case'
    });
  }
});

/**
 * GET /api/case/today?language=ko|en
 * 오늘의 케이스 조회 (다국어 지원)
 * 자동 이미지 감지 및 재생성 포함
 *
 * Query Parameters:
 *   - language: 'ko' | 'en' (default: 'ko')
 *
 * TODO: Update to use MultilingualCase from CaseRepository
 * Currently returns legacy single-language format
 */
router.get('/api/case/today', async (req, res): Promise<void> => {
  try {
    // Get language from query parameter (default: 'ko')
    const language = (req.query.language as string) || 'ko';

    // Validate language parameter
    if (language !== 'ko' && language !== 'en') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Invalid language parameter. Use "ko" or "en"'
      });
      return;
    }

    const todaysCase = await CaseRepository.getTodaysCase();

    if (!todaysCase) {
      res.status(404).json({
        error: 'No case found',
        message: 'Today\'s case has not been generated yet'
      });
      return;
    }

    // Fetch full suspect data with emotionalState, background, and personality
    const fullSuspects = await CaseRepository.getCaseSuspects(todaysCase.id);

    // Add logging
    console.log(`📋 Fetched ${fullSuspects.length} suspects for case ${todaysCase.id} (language: ${language})`);

    if (fullSuspects.length === 0) {
      console.warn(`⚠️  WARNING: No suspects found for case ${todaysCase.id}`);
      console.warn(`   Case suspects array from storage:`, todaysCase.suspects);
    }

    // SEAMLESS AUTO-REGENERATION: Check if ALL images are missing
    const suspectsWithImages = fullSuspects.filter(s => s.profileImageUrl);

    // Only regenerate if NO images exist (not partial failure)
    if (fullSuspects.length > 0 && suspectsWithImages.length === 0) {
      console.warn(`⚠️  Case ${todaysCase.id} missing ALL profile images: ${suspectsWithImages.length}/${fullSuspects.length}`);
      console.log(`🔄 Auto-regenerating case with images...`);

      try {
        // Delete old case
        await CaseRepository.deleteCase(todaysCase.id);

        // Generate new case with images
        const apiKey = await settings.get<string>('geminiApiKey');

        if (apiKey) {
          const geminiClient = createGeminiClient(apiKey);
          const caseGenerator = createCaseGeneratorService(geminiClient);

          const dateStr = todaysCase.date;
          const caseDate = new Date(dateStr);

          const regeneratedCase = await caseGenerator.generateCase({
            date: caseDate,
            includeImage: true,
            includeSuspectImages: true,
            includeCinematicImages: true,
            temperature: 0.8
          });

          console.log(`✅ Auto-regeneration complete: ${regeneratedCase.id}`);
          console.log(`   - Images: ${regeneratedCase.suspects.filter(s => s.profileImageUrl).length}/${regeneratedCase.suspects.length}`);

          // Fetch the regenerated suspects
          const regeneratedSuspects = await CaseRepository.getCaseSuspects(regeneratedCase.id);

          // Return regenerated case data (without large images)
          const suspectsData = regeneratedSuspects.map(s => ({
            id: s.id,
            caseId: s.caseId,
            name: s.name,
            archetype: s.archetype,
            background: s.background,
            personality: s.personality,
            emotionalState: s.emotionalState,
            hasProfileImage: !!s.profileImageUrl
          }));

          res.json({
            id: regeneratedCase.id,
            date: regeneratedCase.date,
            language: language,
            victim: regeneratedCase.victim,
            weapon: regeneratedCase.weapon,
            location: regeneratedCase.location,
            suspects: suspectsData,
            imageUrl: regeneratedCase.imageUrl,
            introNarration: regeneratedCase.introNarration,
            locations: regeneratedCase.locations,
            evidence: regeneratedCase.evidence, // Include evidence items for discovery system
            evidenceDistribution: regeneratedCase.evidenceDistribution,
            actionPoints: regeneratedCase.actionPoints, // AP configuration (Phase 2)
            generatedAt: regeneratedCase.generatedAt,
            _autoRegenerated: true
          });
          return;
        }
      } catch (error) {
        console.error('Auto-regeneration failed, serving existing case:', error);
        // Fall through to serve existing case if regeneration fails
      }
    }

    // Map to client format (exclude isGuilty for security)
    // Phase 1 Fix: Don't include large base64 images in initial response
    // Client will fetch images separately via /api/suspect-image/:suspectId
    const suspectsData = fullSuspects.map(s => ({
      id: s.id,
      caseId: s.caseId,
      name: s.name,
      archetype: s.archetype,
      background: s.background,
      personality: s.personality,
      emotionalState: s.emotionalState,
      hasProfileImage: !!s.profileImageUrl
    }));

    // 클라이언트에게 전달 (solution 제외)
    res.json({
      id: todaysCase.id,
      date: todaysCase.date,
      language: language,
      victim: todaysCase.victim,
      weapon: todaysCase.weapon,
      location: todaysCase.location,
      suspects: suspectsData,
      imageUrl: todaysCase.imageUrl,
      introNarration: todaysCase.introNarration,
      locations: todaysCase.locations,
      evidence: todaysCase.evidence, // Include evidence items for discovery system
      evidenceDistribution: todaysCase.evidenceDistribution,
      actionPoints: todaysCase.actionPoints, // AP configuration (Phase 2)
      generatedAt: todaysCase.generatedAt
    });
  } catch (error) {
    console.error('Error fetching today\'s case:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch today\'s case'
    });
  }
});

/**
 * GET /api/case/:caseId
 * 특정 케이스 ID로 케이스 조회
 *
 * 각 포스트마다 고유한 케이스를 로드할 수 있도록 지원
 * 타임스탬프 기반 케이스 ID를 통해 과거 게임들을 모두 플레이 가능
 */
router.get('/api/case/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;

    // Get language from query parameter (default: 'ko')
    const language = (req.query.language as string) || 'ko';

    // Validate language parameter
    if (language !== 'ko' && language !== 'en') {
      res.status(400).json({
        error: 'Bad request',
        message: 'Invalid language parameter. Use "ko" or "en"'
      });
      return;
    }

    const caseData = await CaseRepository.getCaseById(caseId);

    if (!caseData) {
      res.status(404).json({
        error: 'No case found',
        message: `Case with ID ${caseId} not found`
      });
      return;
    }

    // Fetch full suspect data
    const fullSuspects = await CaseRepository.getCaseSuspects(caseData.id);

    console.log(`📋 Fetched ${fullSuspects.length} suspects for case ${caseData.id} (language: ${language})`);

    // Map to client format (exclude isGuilty, don't include large base64 images)
    const suspectsData = fullSuspects.map(s => ({
      id: s.id,
      caseId: s.caseId,
      name: s.name,
      archetype: s.archetype,
      background: s.background,
      personality: s.personality,
      emotionalState: s.emotionalState,
      hasProfileImage: !!s.profileImageUrl
    }));

    res.json({
      id: caseData.id,
      date: caseData.date,
      language: language,
      victim: caseData.victim,
      weapon: caseData.weapon,
      location: caseData.location,
      suspects: suspectsData,
      imageUrl: caseData.imageUrl,
      introNarration: caseData.introNarration,
      locations: caseData.locations,
      evidence: caseData.evidence, // Include evidence items for discovery system
      evidenceDistribution: caseData.evidenceDistribution,
      actionPoints: caseData.actionPoints, // AP configuration (Phase 2)
      generatedAt: caseData.generatedAt
    });
  } catch (error) {
    console.error(`Error fetching case ${req.params.caseId}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch case'
    });
  }
});

/**
 * GET /api/case/:caseId/evidence-images/status
 * Get evidence image generation status for a case
 */
router.get('/api/case/:caseId/evidence-images/status', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;

    // Get storage adapter
    const adapter = KVStoreManager.getAdapter();
    const storageService = new (await import('./services/image/ImageStorageService')).ImageStorageService(adapter);

    // Get status from KV store
    const status = await storageService.getEvidenceImageStatus(caseId);

    if (!status) {
      // No status found - return default pending state
      res.json({
        status: 'pending',
        totalCount: 0,
        completedCount: 0,
        images: {},
        lastUpdated: new Date().toISOString()
      });
      return;
    }

    res.json(status);
  } catch (error) {
    console.error(`Error fetching evidence image status for case ${req.params.caseId}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch evidence image status'
    });
  }
});

/**
 * GET /api/case/:caseId/location-images/status
 * Get location image generation status for a case
 */
router.get('/api/case/:caseId/location-images/status', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;

    // Get storage adapter
    const adapter = KVStoreManager.getAdapter();
    const storageService = new (await import('./services/image/ImageStorageService')).ImageStorageService(adapter);

    // Get status from KV store
    const status = await storageService.getLocationImageStatus(caseId);

    if (!status) {
      // No status found - return default pending state
      res.json({
        status: 'pending',
        totalCount: 0,
        completedCount: 0,
        images: {},
        lastUpdated: new Date().toISOString()
      });
      return;
    }

    res.json(status);
  } catch (error) {
    console.error(`Error fetching location image status for case ${req.params.caseId}:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch location image status'
    });
  }
});

/**
 * GET /api/suspects/:caseId
 * 케이스의 용의자 목록 조회
 */
router.get('/api/suspects/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;

    const suspects = await CaseRepository.getCaseSuspects(caseId);

    // 클라이언트에게 전달 (배경, 성격 포함, but isGuilty 제외)
    const suspectData = suspects.map(s => ({
      id: s.id,
      caseId: s.caseId,
      name: s.name,
      archetype: s.archetype,
      background: s.background,
      personality: s.personality,
      emotionalState: s.emotionalState,
      profileImageUrl: s.profileImageUrl
    }));

    res.json({ suspects: suspectData });
  } catch (error) {
    console.error('Error fetching suspects:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch suspects'
    });
  }
});

/**
 * GET /api/suspect-image/:suspectId
 * 용의자 프로필 이미지 개별 조회 (base64 data URL)
 *
 * Phase 1 Fix: Large images fetched separately to avoid 500 error
 */
router.get('/api/suspect-image/:suspectId', async (req, res): Promise<void> => {
  try {
    const { suspectId } = req.params;

    const suspect = await CaseRepository.getSuspectById(suspectId);

    if (!suspect) {
      res.status(404).json({
        error: 'Not found',
        message: 'Suspect not found'
      });
      return;
    }

    if (!suspect.profileImageUrl) {
      res.status(404).json({
        error: 'Not found',
        message: 'Profile image not available for this suspect'
      });
      return;
    }

    // Return just the image data
    res.json({
      suspectId: suspect.id,
      profileImageUrl: suspect.profileImageUrl
    });

  } catch (error) {
    console.error('Error fetching suspect image:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch suspect image'
    });
  }
});

// =============================================================================
// INTERROGATION API WITH AP INTEGRATION (Phase 2)
// =============================================================================

/**
 * Initialize action points for a player if not already initialized
 * Ensures backward compatibility with legacy player states
 */
function initializeActionPoints(
  caseData: { actionPoints: { initial: number } },
  playerState: { actionPoints?: any }
): void {
  if (!playerState.actionPoints) {
    playerState.actionPoints = {
      current: caseData.actionPoints.initial,
      total: caseData.actionPoints.initial,
      spent: 0,
      initial: caseData.actionPoints.initial,
      acquisitionHistory: [],
      spendingHistory: [],
      acquiredTopics: new Set<string>(),
      bonusesAcquired: new Set<string>(),
      emergencyAPUsed: false
    };
    console.log(`[AP] Initialized action points for player: ${playerState.actionPoints.initial} AP`);
  }
}

/**
 * POST /api/chat/:suspectId
 * AI 용의자와 대화 + AP 획득 (Phase 2)
 */
router.post('/api/chat/:suspectId', async (req, res): Promise<void> => {
  try {
    const { suspectId } = req.params;
    const { userId, message, caseId } = req.body;

    if (!userId || !message) {
      res.status(400).json({
        error: 'Bad request',
        message: 'userId and message are required'
      });
      return;
    }

    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    // AI 서비스 생성
    const geminiClient = createGeminiClient(apiKey);
    const suspectAI = createSuspectAIService(geminiClient);

    // 응답 생성
    const chatResponse = await suspectAI.generateResponse(suspectId, userId, message);

    // ===== Phase 2: AP Acquisition Logic =====
    // Get suspect data for AP analysis
    const suspect = await KVStoreManager.getSuspect(suspectId);

    if (!suspect) {
      console.error(`[AP] Suspect not found: ${suspectId}`);
      res.status(404).json({
        error: 'Suspect not found',
        message: `Suspect ${suspectId} not found`
      });
      return;
    }

    // Get case data
    const resolvedCaseId = caseId || suspect.caseId;
    const caseData = await KVStoreManager.getCase(resolvedCaseId);

    if (!caseData) {
      console.error(`[AP] Case not found: ${resolvedCaseId}`);
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${resolvedCaseId} not found`
      });
      return;
    }

    // Get or initialize player state
    let playerState = await KVStoreManager.getPlayerEvidenceState(resolvedCaseId, userId);

    if (!playerState) {
      // Initialize new player state
      const stateService = createPlayerEvidenceStateService();
      playerState = stateService.initializeState(resolvedCaseId, userId);
      console.log(`[AP] Created new player state for ${userId} in case ${resolvedCaseId}`);
    }

    // Initialize AP if missing (backward compatibility)
    initializeActionPoints(caseData, playerState);

    // Analyze conversation for AP rewards
    const conversationId = `${resolvedCaseId}:${suspectId}:${userId}`;
    const apResult = apService.analyzeConversation(
      message,
      chatResponse.response,
      suspect,
      caseData,
      playerState.actionPoints,
      conversationId
    );

    // Update player state with AP acquisitions
    if (apResult.apGained > 0) {
      playerState.actionPoints.current += apResult.apGained;
      playerState.actionPoints.total += apResult.apGained;

      // Track acquired topics and bonuses
      for (const acquisition of apResult.acquisitions) {
        playerState.actionPoints.acquisitionHistory.push(acquisition);

        if (acquisition.source === 'topic' && acquisition.topicId) {
          playerState.actionPoints.acquiredTopics.add(`${suspectId}:${acquisition.topicId}`);
        }
        if (acquisition.source === 'bonus' && acquisition.bonusType) {
          playerState.actionPoints.bonusesAcquired.add(`${suspectId}:${acquisition.bonusType}`);
        }
      }

      // Save updated state
      playerState.lastUpdated = new Date();
      await KVStoreManager.savePlayerEvidenceState(playerState);

      console.log(`[AP] Player ${userId} gained ${apResult.apGained} AP (new total: ${playerState.actionPoints.current})`);
    }

    // Build response with AP data (conforming to InterrogationResponse type)
    const response: InterrogationResponse = {
      success: true,
      aiResponse: chatResponse.response, // Map 'response' to 'aiResponse'
      conversationId: conversationId,
      playerState: {
        currentAP: playerState.actionPoints.current,
        totalAP: playerState.actionPoints.total,
        spentAP: playerState.actionPoints.spent
      }
    };

    // Add AP acquisition breakdown if AP was gained
    if (apResult.apGained > 0) {
      response.apAcquisition = {
        amount: apResult.apGained,
        reason: apResult.acquisitions.map(a => a.reason).join(', '),
        breakdown: {
          topicAP: apResult.acquisitions
            .filter(a => a.source === 'topic')
            .reduce((sum, a) => sum + a.amount, 0),
          bonusAP: apResult.acquisitions
            .filter(a => a.source === 'bonus')
            .reduce((sum, a) => sum + a.amount, 0)
        },
        newTotal: playerState.actionPoints.current
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate AI response'
    });
  }
});

/**
 * GET /api/conversation/:suspectId/:userId
 * 대화 기록 조회
 */
router.get('/api/conversation/:suspectId/:userId', async (req, res): Promise<void> => {
  try {
    const { suspectId, userId } = req.params;

    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const suspectAI = createSuspectAIService(geminiClient);

    const history = await suspectAI.getConversationHistory(suspectId, userId);

    res.json({ messages: history });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch conversation history'
    });
  }
});

/**
 * POST /api/submit
 * 답안 제출 및 채점
 */
router.post('/api/submit', async (req, res): Promise<void> => {
  try {
    const { userId, caseId, answers } = req.body;

    if (!userId || !caseId || !answers) {
      res.status(400).json({
        error: 'Bad request',
        message: 'userId, caseId, and answers are required'
      });
      return;
    }

    // 정답 조회
    const caseData = await CaseRepository.getCaseById(caseId);

    if (!caseData) {
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${caseId} does not exist`
      });
      return;
    }

    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    // 채점
    const geminiClient = createGeminiClient(apiKey);
    const validator = createW4HValidator(geminiClient);
    const scoringEngine = createScoringEngine(validator);

    const result = await scoringEngine.scoreSubmission(
      userId,
      caseId,
      answers,
      caseData.solution
    );

    res.json(result);
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to score submission'
    });
  }
});

/**
 * GET /api/leaderboard/:caseId
 * 리더보드 조회
 */
router.get('/api/leaderboard/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const validator = createW4HValidator(geminiClient);
    const scoringEngine = createScoringEngine(validator);

    const leaderboard = await scoringEngine.getLeaderboard(caseId, limit);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch leaderboard'
    });
  }
});

/**
 * GET /api/stats/:caseId
 * 케이스 통계
 */
router.get('/api/stats/:caseId', async (req, res): Promise<void> => {
  try {
    const { caseId } = req.params;

    const apiKey = await settings.get<string>('geminiApiKey');

    if (!apiKey) {
      console.error('Gemini API key not configured');
      res.status(500).json({
        error: 'Configuration error',
        message: 'Gemini API key not configured. Please set it in app settings.'
      });
      return;
    }

    const geminiClient = createGeminiClient(apiKey);
    const validator = createW4HValidator(geminiClient);
    const scoringEngine = createScoringEngine(validator);

    const stats = await scoringEngine.getCaseStatistics(caseId);

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch statistics'
    });
  }
});

// =============================================================================
// EVIDENCE DISCOVERY SYSTEM API ROUTES WITH AP DEDUCTION (Phase 2)
// =============================================================================

/**
 * POST /api/location/search
 * 장소 탐색 및 증거 발견 + AP 차감 (Phase 2)
 *
 * Request body: { caseId, userId, locationId, searchType: 'quick'|'thorough'|'exhaustive' }
 * Returns: { success, evidenceFound[], actionPointsRemaining, completionRate, playerState }
 */
router.post('/api/location/search', async (req, res): Promise<void> => {
  try {
    const { caseId, userId, locationId, searchType } = req.body as SearchLocationRequest;

    // Validate input
    if (!caseId || !userId || !locationId || !searchType) {
      res.status(400).json({
        error: 'Bad request',
        message: 'caseId, userId, locationId, and searchType are required'
      });
      return;
    }

    if (!['quick', 'thorough', 'exhaustive'].includes(searchType)) {
      res.status(400).json({
        error: 'Bad request',
        message: 'searchType must be one of: quick, thorough, exhaustive'
      });
      return;
    }

    // Get case data
    const caseData = await CaseRepository.getCaseById(caseId);
    if (!caseData) {
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${caseId} not found`
      });
      return;
    }

    // Check if locations, evidence, and evidenceDistribution exist
    // Legacy cases created before discovery system won't have these fields
    const isLegacyCase = !caseData.locations || !caseData.evidence || !caseData.evidenceDistribution;

    // Handle legacy cases with fallback evidence
    if (isLegacyCase) {
      console.warn(`⚠️ Legacy case detected: ${caseId} - using fallback evidence`);

      // Fallback evidence for legacy cases
      const fallbackEvidence: import('../shared/types/Evidence').EvidenceItem[] = [
        {
          id: `fallback-ev-${Date.now()}-1`,
          type: 'physical',
          name: '의심스러운 흔적',
          description: '현장에서 발견된 단서입니다',
          importance: 2,
          discoveredAt: Date.now(),
        },
        {
          id: `fallback-ev-${Date.now()}-2`,
          type: 'digital',
          name: '디지털 기록',
          description: '관련 정보가 담긴 기록입니다',
          importance: 1,
          discoveredAt: Date.now(),
        },
      ];

      // Simple search result for legacy cases
      const legacyResult = {
        success: true,
        evidenceFound: searchType === 'quick' ? fallbackEvidence.slice(0, 1) : fallbackEvidence,
        completionRate: searchType === 'quick' ? 25 : searchType === 'thorough' ? 50 : 100,
        message: `${searchType === 'quick' ? '1' : '2'}개의 증거를 발견했습니다!`,
        actionPointsRemaining: 3 - (searchType === 'quick' ? 1 : searchType === 'thorough' ? 2 : 3),
      };

      res.status(200).json(legacyResult);
      return;
    }

    // Get or initialize player evidence state
    const stateService = createPlayerEvidenceStateService();
    let playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

    if (!playerState) {
      playerState = stateService.initializeState(caseId, userId);
      console.log(`[Discovery] Created new player state for ${userId}`);
    }

    // Initialize AP if missing (backward compatibility)
    initializeActionPoints(caseData, playerState);

    // ===== Phase 2: Check AP availability and deduct =====
    const apCost = caseData.actionPoints.costs[searchType];

    console.log(`[AP] Search request: ${searchType} (cost: ${apCost} AP, current: ${playerState.actionPoints.current} AP)`);

    if (playerState.actionPoints.current < apCost) {
      // Check for emergency AP
      const emergencyAP = apService.provideEmergencyAP(playerState.actionPoints);

      if (emergencyAP) {
        playerState.actionPoints.current += emergencyAP.amount;
        playerState.actionPoints.total += emergencyAP.amount;
        playerState.actionPoints.emergencyAPUsed = true;
        playerState.actionPoints.acquisitionHistory.push(emergencyAP);
        await KVStoreManager.savePlayerEvidenceState(playerState);

        console.log(`[AP] Emergency AP provided: +${emergencyAP.amount} AP`);

        // Now check again
        if (playerState.actionPoints.current < apCost) {
          res.status(400).json({
            error: 'AP_INSUFFICIENT',
            message: `AP가 부족합니다. 필요: ${apCost}, 현재: ${playerState.actionPoints.current}`,
            currentAP: playerState.actionPoints.current,
            requiredAP: apCost
          });
          return;
        }
      } else {
        res.status(400).json({
          error: 'AP_INSUFFICIENT',
          message: `AP가 부족합니다. 필요: ${apCost}, 현재: ${playerState.actionPoints.current}`,
          currentAP: playerState.actionPoints.current,
          requiredAP: apCost
        });
        return;
      }
    }

    // Deduct AP
    playerState.actionPoints.current -= apCost;
    playerState.actionPoints.spent += apCost;

    const location = caseData.locations.find(l => l.id === locationId);
    playerState.actionPoints.spendingHistory.push({
      timestamp: new Date(),
      amount: apCost,
      action: searchType,
      locationId,
      locationName: location?.name || locationId
    });

    console.log(`[AP] AP deducted: -${apCost} AP (remaining: ${playerState.actionPoints.current} AP)`);

    // Perform search
    const discoveryService = new EvidenceDiscoveryService();
    const searchRequest: SearchLocationRequest = {
      caseId,
      userId,
      locationId,
      searchType
    };

    const searchResult = await discoveryService.searchLocation(
      searchRequest,
      caseData.evidenceDistribution,
      caseData.evidence,
      caseData.locations,
      playerState
    );

    // Update player state with discovered evidence
    const updatedState = stateService.recordDiscovery(
      playerState,
      searchResult.evidenceFound,
      searchType,
      locationId
    );

    // Calculate efficiency
    const totalEvidence = caseData.evidence.length;
    const finalState = stateService.calculateEfficiency(updatedState, totalEvidence);

    // Save updated state
    finalState.lastUpdated = new Date();
    await KVStoreManager.savePlayerEvidenceState(finalState);

    // Return search result with AP info
    res.json({
      ...searchResult,
      playerState: {
        currentAP: finalState.actionPoints.current,
        totalAP: finalState.actionPoints.total,
        spentAP: finalState.actionPoints.spent
      },
      playerStats: stateService.getStatsSummary(finalState)
    });

  } catch (error) {
    console.error('Error searching location:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Failed to search location'
    });
  }
});

/**
 * GET /api/player-state/:caseId/:userId
 * 플레이어 증거 발견 상태 조회
 *
 * Returns: PlayerEvidenceState with AP info
 */
router.get('/api/player-state/:caseId/:userId', async (req, res): Promise<void> => {
  try {
    const { caseId, userId } = req.params;

    const playerState = await KVStoreManager.getPlayerEvidenceState(caseId, userId);

    if (!playerState) {
      res.status(404).json({
        error: 'Player state not found',
        message: 'No evidence discovery state found for this player and case'
      });
      return;
    }

    res.json({
      ...playerState,
      actionPointsRemaining: playerState.actionPoints?.current || 0,
      actionPointsUsed: playerState.actionPoints?.spent || 0
    });

  } catch (error) {
    console.error('Error fetching player state:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch player state'
    });
  }
});

/**
 * POST /api/player-state/initialize
 * 플레이어 증거 발견 상태 초기화
 *
 * Request body: { caseId, userId }
 * Returns: PlayerEvidenceState
 */
router.post('/api/player-state/initialize', async (req, res): Promise<void> => {
  try {
    const { caseId, userId } = req.body;

    if (!caseId || !userId) {
      res.status(400).json({
        error: 'Bad request',
        message: 'caseId and userId are required'
      });
      return;
    }

    // Check if case exists
    const caseData = await CaseRepository.getCaseById(caseId);
    if (!caseData) {
      res.status(404).json({
        error: 'Case not found',
        message: `Case ${caseId} not found`
      });
      return;
    }

    // Initialize state
    const stateService = createPlayerEvidenceStateService();
    const playerState = stateService.initializeState(caseId, userId);

    // Initialize AP (Phase 2)
    initializeActionPoints(caseData, playerState);

    // Save to storage
    await KVStoreManager.savePlayerEvidenceState(playerState);

    console.log(`✅ Initialized player state for user ${userId} in case ${caseId}`);

    res.json({
      ...playerState,
      actionPointsRemaining: playerState.actionPoints.current,
      actionPointsUsed: playerState.actionPoints.spent
    });

  } catch (error) {
    console.error('Error initializing player state:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to initialize player state'
    });
  }
});

// =============================================================================
// AP STATUS ENDPOINT (Phase 2)
// =============================================================================

/**
 * GET /api/player/:userId/ap-status
 * 현재 AP 상태 조회
 *
 * Query params:
 *   - caseId (optional): If not provided, uses today's case
 *
 * Returns: Current AP status including acquisition and spending history counts
 */
router.get('/api/player/:userId/ap-status', async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;
    const queryCaseId = req.query.caseId as string | undefined;

    // Get case ID (from query or use today's case)
    let caseData;
    if (queryCaseId) {
      caseData = await KVStoreManager.getCase(queryCaseId);
    } else {
      caseData = await KVStoreManager.getTodaysCase();
    }

    if (!caseData) {
      res.status(404).json({
        success: false,
        error: 'Case not found',
        message: 'No case found for the specified ID or today\'s date'
      });
      return;
    }

    // Get player state
    let playerState = await KVStoreManager.getPlayerEvidenceState(caseData.id, userId);

    if (!playerState) {
      // Initialize if not exists
      const stateService = createPlayerEvidenceStateService();
      playerState = stateService.initializeState(caseData.id, userId);
      initializeActionPoints(caseData, playerState);
      await KVStoreManager.savePlayerEvidenceState(playerState);
    } else {
      // Initialize AP if missing (backward compatibility)
      initializeActionPoints(caseData, playerState);
      await KVStoreManager.savePlayerEvidenceState(playerState);
    }

    res.json({
      success: true,
      actionPoints: {
        current: playerState.actionPoints.current,
        maximum: caseData.actionPoints.maximum,
        total: playerState.actionPoints.total,
        spent: playerState.actionPoints.spent,
        initial: playerState.actionPoints.initial,
        emergencyAPUsed: playerState.actionPoints.emergencyAPUsed,
        acquisitionCount: playerState.actionPoints.acquisitionHistory.length,
        spendingCount: playerState.actionPoints.spendingHistory.length
      }
    });

  } catch (error) {
    console.error('AP status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch AP status'
    });
  }
});

// =============================================================================
// AP INTEGRITY CHECK ENDPOINT (Phase 3)
// =============================================================================
/**
 * GET /api/admin/ap-integrity/:userId
 * AP 무결성 검사 (디버깅 및 모니터링용)
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

// =============================================================================
// 🧪 POC WEBHOOK RECEIVER
// =============================================================================
/**
 * POST /api/webhook/poc-test
 * Webhook receiver for PoC testing (Test 4 & Test 5)
 */
router.post('/api/webhook/poc-test', async (req, res): Promise<void> => {
  const receivedAt = Date.now();
  const payload = req.body;

  console.log('📥 PoC Webhook received:', {
    test: payload.test,
    caseId: payload.caseId,
    timestamp: payload.timestamp,
    imageCount: payload.images?.length
  });

  // Validate payload structure
  const isValid = payload.test && (payload.test === 'poc-webhook' || payload.test === 'poc-e2e');

  res.json({
    received: true,
    timestamp: receivedAt,
    valid: isValid,
    message: isValid
      ? '✅ Valid webhook received'
      : '❌ Invalid payload structure',
    receivedPayload: {
      test: payload.test,
      caseId: payload.caseId,
      hasImages: !!payload.images,
      imageCount: payload.images?.length || 0
    }
  });
});

// =============================================================================
// 🧪 MEDIA UPLOAD API VALIDATION TESTS
// =============================================================================
// Temporary test routes for validating context.media.upload() API
// TODO: Remove after validation complete

import { MediaUploadTest } from './test/MediaUploadTest';

/**
 * GET /api/test/media-check
 * Test 1: API 존재 확인
 */
router.get('/api/test/media-check', async (_req, res): Promise<void> => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const tester = new MediaUploadTest(context, apiKey);
    const result = await tester.testApiAvailability();

    res.json(result);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test/upload-single
 * Test 2: 단일 이미지 업로드
 */
router.post('/api/test/upload-single', async (_req, res): Promise<void> => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const tester = new MediaUploadTest(context, apiKey);
    const result = await tester.testSingleUpload();

    res.json(result);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test/upload-sequential
 * Test 3: 순차 업로드
 */
router.post('/api/test/upload-sequential', async (req, res): Promise<void> => {
  try {
    const count = parseInt(req.query.count as string) || 5;

    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const tester = new MediaUploadTest(context, apiKey);
    const result = await tester.testSequentialUploads(count);

    res.json(result);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test/upload-parallel
 * Test 4: 병렬 업로드
 */
router.post('/api/test/upload-parallel', async (req, res): Promise<void> => {
  try {
    const count = parseInt(req.query.count as string) || 5;

    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const tester = new MediaUploadTest(context, apiKey);
    const result = await tester.testParallelUploads(count);

    res.json(result);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test/upload-full
 * Test 5: 전체 규모 테스트 (14개)
 */
router.post('/api/test/upload-full', async (_req, res): Promise<void> => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const tester = new MediaUploadTest(context, apiKey);
    const result = await tester.testFullScale();

    res.json(result);
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/test/run-all
 * 모든 테스트 순차 실행
 */
router.post('/api/test/run-all', async (_req, res): Promise<void> => {
  try {
    const apiKey = await settings.get<string>('geminiApiKey');
    if (!apiKey) {
      res.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    const tester = new MediaUploadTest(context, apiKey);
    const results = await tester.runAllTests();

    res.json({
      allTests: results,
      summary: {
        totalTests: results.length,
        passed: results.filter(r => r.success).length,
        failed: results.filter(r => r.success === false).length,
        totalDuration: results.reduce((sum, r) => sum + r.duration, 0)
      }
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
