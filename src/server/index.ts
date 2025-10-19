import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
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
// ✅ Import scheduler initialization
import { initializeAllSchedulers } from './schedulers/DailyCaseScheduler';

const app = express();

// Initialize Devvit storage adapter for production
const devvitAdapter = new DevvitStorageAdapter();
KVStoreManager.setAdapter(devvitAdapter);

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

    // ✅ Initialize schedulers (pre-generate daily cases) - fire and forget
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
      includeCinematicImages: true, // ✅ Include cinematic intro images
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
      includeSuspectImages: true, // ✅ Include suspect profile images
      includeCinematicImages: true // ✅ Include cinematic intro images (5 scenes)
    });

    console.log(`✅ Case generated: ${caseData.id}`);
    console.log(`   - Suspect Images: ${caseData.suspects.filter(s => s.profileImageUrl).length}/${caseData.suspects.length}`);

    res.json({
      success: true,
      message: 'Case generated successfully',
      caseId: caseData.id,
      date: caseData.date
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
      includeCinematicImages: true, // ✅ Include cinematic intro images
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
      includeCinematicImages: true, // ✅ Include cinematic intro images
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
 * ✅ 자동 이미지 감지 및 재생성 포함
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

    // ✅ SEAMLESS AUTO-REGENERATION: Check if ALL images are missing
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
            includeCinematicImages: true, // ✅ Include cinematic intro images
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
            introNarration: regeneratedCase.introNarration, // ✅ Include intro narration
            generatedAt: regeneratedCase.generatedAt,
            _autoRegenerated: true // Flag to indicate auto-regeneration occurred
          });
          return;
        }
      } catch (error) {
        console.error('Auto-regeneration failed, serving existing case:', error);
        // Fall through to serve existing case if regeneration fails
      }
    }

    // Map to client format (exclude isGuilty for security)
    // ✅ Phase 1 Fix: Don't include large base64 images in initial response
    // Client will fetch images separately via /api/suspect-image/:suspectId
    const suspectsData = fullSuspects.map(s => ({
      id: s.id,
      caseId: s.caseId,
      name: s.name,
      archetype: s.archetype,
      background: s.background,
      personality: s.personality,
      emotionalState: s.emotionalState,
      hasProfileImage: !!s.profileImageUrl // Flag to indicate image availability
      // profileImageUrl will be fetched separately to avoid 500 error from large payload
      // isGuilty는 제외!
    }));

    // 클라이언트에게 전달 (solution 제외)
    // TODO: When MultilingualCase is stored, return language-specific content
    res.json({
      id: todaysCase.id,
      date: todaysCase.date,
      language: language, // Include selected language in response
      victim: todaysCase.victim,
      weapon: todaysCase.weapon,
      location: todaysCase.location,
      suspects: suspectsData,
      imageUrl: todaysCase.imageUrl,
      introNarration: todaysCase.introNarration, // ✅ Include intro narration
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
      introNarration: caseData.introNarration, // ✅ Include intro narration
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
      profileImageUrl: s.profileImageUrl // ✅ Profile image for UI display
      // isGuilty는 제외!
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

/**
 * POST /api/chat/:suspectId
 * AI 용의자와 대화
 */
router.post('/api/chat/:suspectId', async (req, res): Promise<void> => {
  try {
    const { suspectId } = req.params;
    const { userId, message } = req.body;

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
    const response = await suspectAI.generateResponse(suspectId, userId, message);

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

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
