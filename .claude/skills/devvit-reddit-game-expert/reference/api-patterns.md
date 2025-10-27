# API Patterns

Complete API design patterns for Devvit Reddit games.

## Endpoint Categories

### Case Management (6 endpoints)

#### GET /api/case/today
Fetch today's case with auto-regeneration if missing.

```typescript
app.get('/api/case/today', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  let caseId = await redis.get(`case:date:${today}`);

  if (!caseId) {
    // Auto-regenerate
    const newCase = await generateCase({ date: today });
    caseId = newCase.id;
  }

  const caseData = JSON.parse(await redis.get(`case:${caseId}`));

  // 2-stage loading: exclude profileImageUrl
  const suspects = await Promise.all(
    caseData.suspectIds.map(async (id) => {
      const suspect = JSON.parse(await redis.get(`suspect:${id}`));
      return {
        id: suspect.id,
        name: suspect.name,
        archetype: suspect.archetype,
        hasProfileImage: suspect.hasProfileImage,
        // profileImageUrl excluded
      };
    })
  );

  res.json({ ...caseData, suspects });
});
```

#### POST /api/case/generate
Manual case generation (admin/dev).

```typescript
app.post('/api/case/generate', async (req, res) => {
  const { date, includeImage, includeSuspectImages } = req.body;

  const caseData = await caseGenerator.generateCase({
    date: date || new Date(),
    includeImage: includeImage ?? true,
    includeSuspectImages: includeSuspectImages ?? true
  });

  res.json(caseData);
});
```

#### POST /api/case/regenerate
Regenerate case with new images.

```typescript
app.post('/api/case/regenerate', async (req, res) => {
  const { caseId } = req.body;

  const existingCase = JSON.parse(await redis.get(`case:${caseId}`));
  const newCase = await caseGenerator.generateCase({
    ...existingCase,
    includeImage: true,
    includeSuspectImages: true
  });

  res.json(newCase);
});
```

#### DELETE /api/case/:caseId
Delete case and related data.

```typescript
app.delete('/api/case/:caseId', async (req, res) => {
  const { caseId } = req.params;

  // Delete case
  await redis.del(`case:${caseId}`);

  // Delete suspects
  const suspectIds = JSON.parse(await redis.get(`case:${caseId}:suspects`) || '[]');
  await Promise.all(suspectIds.map(id => redis.del(`suspect:${id}`)));

  // Delete date index
  const caseData = JSON.parse(await redis.get(`case:${caseId}`));
  await redis.del(`case:date:${caseData.date}`);

  res.json({ success: true });
});
```

### Suspect & Interrogation (4 endpoints)

#### GET /api/suspect-image/:suspectId
2-stage loading: Individual image fetch.

```typescript
app.get('/api/suspect-image/:suspectId', async (req, res) => {
  const { suspectId } = req.params;

  const suspect = JSON.parse(await redis.get(`suspect:${suspectId}`));

  res.json({
    suspectId,
    profileImageUrl: suspect.profileImageUrl,  // ~16KB JPEG
    hasImage: suspect.hasProfileImage
  });
});
```

#### POST /api/chat/:suspectId
AI chat with AP acquisition.

```typescript
app.post('/api/chat/:suspectId', async (req, res) => {
  const { suspectId } = req.params;
  const { message, userId, conversationHistory } = req.body;

  // AI response
  const aiResponse = await geminiChat(suspectId, message, conversationHistory);

  // AP analysis
  const apResult = analyzeConversation(message, aiResponse, suspect);

  // Update player state
  const playerState = JSON.parse(await redis.get(`player:${userId}:${caseId}`));
  playerState.actionPoints.current += apResult.apGained;
  playerState.actionPoints.total += apResult.apGained;

  // Cap at maximum
  if (playerState.actionPoints.current > caseData.actionPoints.maximum) {
    playerState.actionPoints.current = caseData.actionPoints.maximum;
  }

  await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));

  res.json({
    response: aiResponse,
    actionPointsGained: apResult.apGained,
    triggeredTopics: apResult.triggeredTopics,
    currentActionPoints: playerState.actionPoints.current
  });
});
```

#### GET /api/conversation/:suspectId/:userId
Retrieve conversation history.

```typescript
app.get('/api/conversation/:suspectId/:userId', async (req, res) => {
  const { suspectId, userId } = req.params;

  const conversationId = `${userId}-${suspectId}`;
  const conversation = await redis.get(`conversation:${conversationId}`);

  res.json(conversation ? JSON.parse(conversation) : { messages: [] });
});
```

### Evidence Discovery (3 endpoints)

#### POST /api/location/search
Search location for evidence (AP spending).

```typescript
app.post('/api/location/search', async (req, res) => {
  const { caseId, userId, locationId, searchType } = req.body;

  const playerState = JSON.parse(await redis.get(`player:${userId}:${caseId}`));
  const apCost = caseData.actionPoints.costs[searchType];

  // AP check with emergency AP
  if (playerState.actionPoints.current < apCost) {
    if (!playerState.actionPoints.emergencyAPUsed) {
      playerState.actionPoints.current += 2;
      playerState.actionPoints.emergencyAPUsed = true;
      await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));

      return res.status(402).json({
        error: 'insufficient_ap',
        emergencyAPProvided: 2,
        currentAP: playerState.actionPoints.current
      });
    } else {
      return res.status(402).json({
        error: 'insufficient_ap',
        required: apCost,
        current: playerState.actionPoints.current
      });
    }
  }

  // Deduct AP
  playerState.actionPoints.current -= apCost;
  playerState.actionPoints.spent += apCost;

  // Evidence discovery (probability-based)
  const location = caseData.locations.find(l => l.id === locationId);
  const discoveredEvidence = [];

  for (const evidence of location.evidenceItems) {
    const probability = evidence.discoveryProbability[searchType];
    if (Math.random() < probability) {
      if (!playerState.discoveredEvidence.some(e => e.id === evidence.id)) {
        discoveredEvidence.push(evidence);
        playerState.discoveredEvidence.push(evidence);
      }
    }
  }

  // Update visit records
  if (!playerState.visitedLocations.includes(locationId)) {
    playerState.visitedLocations.push(locationId);
  }

  await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));

  const completionRate = (playerState.discoveredEvidence.length / totalEvidence) * 100;

  res.json({
    success: true,
    evidenceFound: discoveredEvidence,
    actionPointsRemaining: playerState.actionPoints.current,
    actionCost: apCost,
    completionRate
  });
});
```

#### POST /api/player-state/initialize
Initialize player state with default AP.

```typescript
app.post('/api/player-state/initialize', async (req, res) => {
  const { caseId, userId } = req.body;

  const caseData = JSON.parse(await redis.get(`case:${caseId}`));

  const playerState = {
    caseId,
    userId,
    actionPoints: {
      current: caseData.actionPoints.initial,
      total: caseData.actionPoints.initial,
      spent: 0,
      initial: caseData.actionPoints.initial,
      acquisitionHistory: [],
      spendingHistory: [],
      acquiredTopics: [],
      bonusesAcquired: [],
      emergencyAPUsed: false
    },
    discoveredEvidence: [],
    visitedLocations: [],
    locationSearchCounts: {},
    hasSubmitted: false
  };

  await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));

  res.json(playerState);
});
```

#### GET /api/player-state/:caseId/:userId
Get current player state.

```typescript
app.get('/api/player-state/:caseId/:userId', async (req, res) => {
  const { caseId, userId } = req.params;

  const playerState = await redis.get(`player:${userId}:${caseId}`);

  res.json(playerState ? JSON.parse(playerState) : null);
});
```

### Scoring & Submission (3 endpoints)

#### POST /api/submit
Submit answer and score.

```typescript
app.post('/api/submit', async (req, res) => {
  const { caseId, userId, selectedSuspectId, reasoning } = req.body;

  const playerState = JSON.parse(await redis.get(`player:${userId}:${caseId}`));

  if (playerState.hasSubmitted) {
    return res.status(400).json({ error: 'already_submitted' });
  }

  // Check answer
  const selectedSuspect = JSON.parse(await redis.get(`suspect:${selectedSuspectId}`));
  const isCorrect = selectedSuspect.isGuilty;

  // AP integrity check
  const integrityResult = verifyAPIntegrity(playerState.actionPoints, caseData.actionPoints);

  // Gemini scoring
  const scoringResult = await scoreReasoning(reasoning, caseData, isCorrect);

  const finalScore = isCorrect ? scoringResult.score : Math.min(scoringResult.score, 50);

  // Save submission
  const submission = {
    userId,
    caseId,
    selectedSuspectId,
    reasoning,
    isCorrect,
    score: finalScore,
    apIntegrity: integrityResult,
    submittedAt: new Date().toISOString()
  };

  await redis.set(`submission:${userId}:${caseId}`, JSON.stringify(submission));

  // Update leaderboard
  await redis.zAdd(`leaderboard:${caseId}`, {
    member: userId,
    score: finalScore
  });

  // Mark as submitted
  playerState.hasSubmitted = true;
  await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));

  res.json({
    isCorrect,
    score: finalScore,
    feedback: scoringResult.feedback
  });
});
```

#### GET /api/leaderboard/:caseId
Get leaderboard rankings.

```typescript
app.get('/api/leaderboard/:caseId', async (req, res) => {
  const { caseId } = req.params;
  const { limit = 100 } = req.query;

  const entries = await redis.zRange(`leaderboard:${caseId}`, 0, limit - 1, {
    reverse: true,
    by: 'score'
  });

  const leaderboard = entries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.member,
    score: entry.score
  }));

  res.json({
    caseId,
    entries: leaderboard,
    totalEntries: entries.length
  });
});
```

### Internal Endpoints (2)

#### POST /internal/menu/post-create
Devvit menu action handler.

```typescript
app.post('/internal/menu/post-create', async (req, res) => {
  const caseData = await getCaseData(caseId);

  const post = await reddit.submitCustomPost({
    title: caseData.title,
    subredditName: req.subredditName,
  });

  res.json({ postId: post.id });
});
```

#### POST /internal/on-app-install
App installation handler.

```typescript
app.post('/internal/on-app-install', async (req, res) => {
  console.log('App installed on subreddit:', req.subredditName);
  res.json({ success: true });
});
```

## Error Handling Patterns

### Standard Error Response
```typescript
try {
  // operation
} catch (error) {
  console.error('Operation failed:', error);
  res.status(500).json({
    error: 'operation_failed',
    message: error.message,
    timestamp: new Date().toISOString()
  });
}
```

### Validation Errors
```typescript
if (!caseId || !userId) {
  return res.status(400).json({
    error: 'validation_error',
    message: 'Missing required fields',
    required: ['caseId', 'userId']
  });
}
```

### AP Insufficient (402)
```typescript
if (playerState.actionPoints.current < apCost) {
  return res.status(402).json({
    error: 'insufficient_ap',
    required: apCost,
    current: playerState.actionPoints.current,
    canUseEmergency: !playerState.actionPoints.emergencyAPUsed
  });
}
```

## Request/Response Types

### Common Types
```typescript
// Case data
interface Case {
  id: string;
  date: string;
  title: string;
  summary: string;
  imageUrl?: string;
  locations: Location[];
  actionPoints: ActionPointsConfig;
  suspectIds: string[];
}

// Player state
interface PlayerState {
  caseId: string;
  userId: string;
  actionPoints: ActionPointsState;
  discoveredEvidence: EvidenceItem[];
  visitedLocations: string[];
  hasSubmitted: boolean;
}

// API response wrapper
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## Performance Considerations

- **Parallel fetches**: Use `Promise.all()` for multiple Redis reads
- **2-stage loading**: Keep initial payload < 10KB
- **Cache**: Use Redis for frequently accessed data
- **Timeout**: Set reasonable timeouts for AI calls (10-15 seconds)
- **Batch operations**: Use Redis `mGet/mSet` for multiple keys
