import express from 'express';
import { InitResponse, IncrementResponse, DecrementResponse } from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { createGeminiClient } from './services/gemini/GeminiClient';
import { createCaseGeneratorService } from './services/case/CaseGeneratorService';
import { CaseRepository } from './services/repositories/kv/CaseRepository';
import { createSuspectAIService } from './services/suspect/SuspectAIService';
import { createW4HValidator } from './services/scoring/W4HValidator';
import { createScoringEngine } from './services/scoring/ScoringEngine';
import { KVStoreManager } from './services/repositories/kv/KVStoreManager';
import { DevvitStorageAdapter } from './services/repositories/adapters/DevvitStorageAdapter';

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
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

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
 * GET /api/case/today
 * 오늘의 케이스 조회
 */
router.get('/api/case/today', async (_req, res): Promise<void> => {
  try {
    const todaysCase = await CaseRepository.getTodaysCase();

    if (!todaysCase) {
      res.status(404).json({
        error: 'No case found',
        message: 'Today\'s case has not been generated yet'
      });
      return;
    }

    // 클라이언트에게 전달 (solution 제외)
    res.json({
      id: todaysCase.id,
      date: todaysCase.date,
      victim: todaysCase.victim,
      weapon: todaysCase.weapon,
      location: todaysCase.location,
      suspects: todaysCase.suspects,
      imageUrl: todaysCase.imageUrl,
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
      emotionalState: s.emotionalState
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

    // AI 서비스 생성
    const geminiClient = createGeminiClient();
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

    const geminiClient = createGeminiClient();
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

    // 채점
    const geminiClient = createGeminiClient();
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

    const geminiClient = createGeminiClient();
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

    const geminiClient = createGeminiClient();
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
