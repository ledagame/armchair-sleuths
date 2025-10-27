---
name: devvit-reddit-game-expert
description: Expert in building Reddit games using Devvit platform (0.12.x). Specializes in Custom Posts with React, Express backend, Redis KV Store, Gemini AI integration, game mechanics (Action Points, Evidence Discovery), scheduler jobs, and 2-stage image loading. Use when developing Devvit apps, Reddit games, investigation mechanics, AI NPCs, leaderboards, or implementing daily content generation systems.
---

# Devvit Reddit Game Expert

## Quick Start

### Project Structure
```
project/
├── devvit.json          # Devvit config
├── src/
│   ├── main.ts          # Devvit entry (Scheduler, Custom Post)
│   ├── client/          # React frontend
│   │   └── index.html
│   ├── server/          # Express backend
│   │   └── index.ts
│   └── shared/          # Shared types
├── dist/
│   ├── client/          # Built React app
│   └── server/          # Built Express server
└── package.json
```

### Minimal Setup
```typescript
// src/main.ts
import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redis: true,
  http: true,
  redditAPI: true,
});

// Add scheduler, custom post, etc.
export default Devvit;
```

### devvit.json Config
```json
{
  "name": "your-game",
  "post": {
    "dir": "dist/client",
    "entrypoints": { "default": { "entry": "index.html" } }
  },
  "server": {
    "dir": "dist/server",
    "entry": "index.cjs"
  },
  "settings": {
    "global": {
      "geminiApiKey": { "type": "string", "isSecret": true }
    }
  }
}
```

## Devvit Platform Essentials

### Custom Post Type
Define interactive post rendering:

```typescript
// src/main.ts
Devvit.addCustomPostType({
  name: 'Game Post',
  height: 'tall',
  render: (context) => {
    // Returns React app via Devvit Web
    return <App context={context} />;
  }
});
```

### Scheduler (Daily Content)
```typescript
// Register job
Devvit.addSchedulerJob({
  name: 'daily-case-generation',
  onRun: async (event, context) => {
    const apiKey = await context.settings.get<string>('geminiApiKey');
    await generateDailyCase(apiKey);
  }
});

// Trigger on install
Devvit.addTrigger({
  event: 'AppInstall',
  onEvent: async (event, context) => {
    await context.scheduler.runJob({
      name: 'daily-case-generation',
      cron: '0 0 * * *',  // Daily at midnight UTC
    });
  }
});
```

### Menu Actions
```typescript
Devvit.addMenuItem({
  label: 'Create Game Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const post = await context.reddit.submitCustomPost({
      title: 'Daily Game',
      subredditName: context.subredditName,
    });
    context.ui.showToast('Post created!');
  }
});
```

### Settings (Secrets)
```typescript
Devvit.addSettings([
  {
    name: 'geminiApiKey',
    type: 'string',
    label: 'Gemini API Key',
    isSecret: true,
    scope: 'app'
  }
]);

// Access in code
const apiKey = await context.settings.get<string>('geminiApiKey');
```

## Architecture Patterns

### Client/Server Separation
**Client** (React): UI rendering, user interactions
**Server** (Express): Business logic, AI calls, Redis access

Communication via HTTP:
```typescript
// Client (src/client/App.tsx)
const response = await fetch('/api/case/today');
const caseData = await response.json();

// Server (src/server/index.ts)
app.get('/api/case/today', async (req, res) => {
  const caseData = await redis.get('case:today');
  res.json(caseData);
});
```

**Important**: All server endpoints MUST start with `/api/` or `/internal/`

### Express Server Setup
```typescript
// src/server/index.ts
import { Devvit } from '@devvit/public-api';
import express from 'express';

const app = express();
app.use(express.json());

// API routes
app.get('/api/case/today', async (req, res) => { /* ... */ });
app.post('/api/chat/:suspectId', async (req, res) => { /* ... */ });

// Internal routes (Devvit triggers)
app.post('/internal/scheduler/daily-case', async (req, res) => { /* ... */ });

Devvit.addCustomPostType({
  name: 'Game',
  render: () => <blocks><text>React App Here</text></blocks>
});

export default Devvit;
```

## Redis KV Store Patterns

See [reference/redis-patterns.md](reference/redis-patterns.md) for complete guide.

### Basic Operations
```typescript
// Set
await context.redis.set('key', JSON.stringify(data));

// Get
const json = await context.redis.get('key');
const data = JSON.parse(json);

// Hash (for structured data)
await context.redis.hSet('player:user123', {
  score: '100',
  level: '5'
});

const playerData = await context.redis.hGetAll('player:user123');
```

### Key Naming Convention
```
case:{caseId}                    # Case data
case:date:{YYYY-MM-DD}           # Date index → caseId
suspect:{suspectId}              # Suspect data
player:{userId}:{caseId}         # Player state
conversation:{conversationId}    # Chat history
submission:{userId}:{caseId}     # Submission
leaderboard:{caseId}             # Sorted set
```

### Data Lifecycle
```typescript
// Daily case generation
await redis.set('case:case-2025-10-21', JSON.stringify(caseData));
await redis.set('case:date:2025-10-21', 'case-2025-10-21');

// Player initialization
const playerState = {
  actionPoints: { current: 3, total: 3, spent: 0 },
  discoveredEvidence: [],
  hasSubmitted: false
};
await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));
```

## Game Mechanics

### Action Points System
See [reference/game-mechanics.md](reference/game-mechanics.md) for full details.

```typescript
interface ActionPointsConfig {
  initial: 3,       // Starting AP
  maximum: 12,      // Max AP cap
  costs: {
    quick: 1,       // Quick search
    thorough: 2,    // Thorough search
    exhaustive: 3   // Exhaustive search
  }
}
```

**AP Acquisition** (during interrogation):
```typescript
// Analyze conversation for AP rewards
function analyzeConversation(userMessage, aiResponse, suspect) {
  let apGained = 0;

  // Topic detection
  for (const topic of suspect.apTopics) {
    if (matchesKeywords(userMessage, topic.keywords)) {
      apGained += topic.apReward;  // +1-2 AP
    }
  }

  // Quality bonus (Gemini API)
  if (await isHighQualityQuestion(userMessage)) {
    apGained += 1;
  }

  return apGained;
}
```

**AP Spending** (location search):
```typescript
app.post('/api/location/search', async (req, res) => {
  const { locationId, searchType } = req.body;  // 'quick', 'thorough', 'exhaustive'
  const apCost = caseData.actionPoints.costs[searchType];

  // Check AP
  if (playerState.actionPoints.current < apCost) {
    // Emergency AP (1-time only)
    if (!playerState.actionPoints.emergencyAPUsed) {
      playerState.actionPoints.current += 2;
      playerState.actionPoints.emergencyAPUsed = true;
    } else {
      return res.status(402).json({ error: 'insufficient_ap' });
    }
  }

  // Deduct AP
  playerState.actionPoints.current -= apCost;
  playerState.actionPoints.spent += apCost;

  // Discover evidence (probability-based)
  const discoveredEvidence = rollForEvidence(location, searchType);

  res.json({ evidenceFound: discoveredEvidence, apRemaining });
});
```

### Evidence Discovery
```typescript
interface EvidenceItem {
  id: string;
  type: 'physical' | 'digital' | 'testimony' | 'document';
  name: string;
  importance: 1 | 2 | 3;  // 1=low, 2=medium, 3=critical
  discoveryProbability: {
    quick: 0.3,      // 30% chance
    thorough: 0.7,   // 70% chance
    exhaustive: 0.95 // 95% chance
  };
}

// Discovery logic
function rollForEvidence(location, searchType) {
  const found = [];
  for (const evidence of location.evidenceItems) {
    const probability = evidence.discoveryProbability[searchType];
    if (Math.random() < probability) {
      found.push(evidence);
    }
  }
  return found;
}
```

## AI Integration (Gemini)

See [reference/gemini-integration.md](reference/gemini-integration.md) for complete patterns.

### Case Generation
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const prompt = `Generate a murder mystery case...`;
const result = await model.generateContent(prompt);
const caseData = JSON.parse(result.response.text());
```

### AI Suspect Chat
```typescript
app.post('/api/chat/:suspectId', async (req, res) => {
  const { message, conversationHistory } = req.body;

  const prompt = `
  You are ${suspect.name}, a suspect in a murder case.
  Personality: ${suspect.personality}
  Background: ${suspect.background}

  User: ${message}
  `;

  const result = await model.generateContent(prompt);
  const aiResponse = result.response.text();

  // AP analysis
  const apGained = analyzeConversation(message, aiResponse, suspect);

  res.json({ response: aiResponse, apGained });
});
```

### Scoring System
```typescript
const prompt = `
Rate this reasoning 0-100:
Case: ${caseData.summary}
Reasoning: ${userReasoning}
Correct suspect: ${isCorrect ? 'Yes' : 'No'}

Criteria:
- Logical consistency (30 points)
- Evidence usage (30 points)
- Insight (20 points)
- Persuasiveness (20 points)
`;

const result = await model.generateContent(prompt);
const score = extractScore(result.response.text());
```

## Performance Optimization

### 2-Stage Image Loading
See [reference/image-optimization.md](reference/image-optimization.md) for details.

**Problem**: Large Base64 images (50-80KB) in initial payload cause 500 errors.

**Solution**: Progressive loading

**Stage 1** - Initial load (fast):
```typescript
// GET /api/case/today
{
  suspects: [
    {
      id, name, archetype,
      hasProfileImage: true  // Flag only
      // NO profileImageUrl
    }
  ]
}
```

**Stage 2** - Background load (parallel):
```typescript
// Frontend (Promise.allSettled)
const imagePromises = suspects.map(s =>
  fetch(`/api/suspect-image/${s.id}`)
);

const results = await Promise.allSettled(imagePromises);
results.forEach((result, index) => {
  if (result.status === 'fulfilled') {
    setImage(index, result.value.profileImageUrl);
  }
});

// Backend
app.get('/api/suspect-image/:suspectId', async (req, res) => {
  const suspect = await redis.get(`suspect:${suspectId}`);
  res.json({
    suspectId,
    profileImageUrl: suspect.profileImageUrl,  // ~16KB JPEG
    hasImage: true
  });
});
```

**Benefits**:
- Initial load: ~10KB (no images)
- Image load: ~5 seconds (3 images in parallel)
- Error resilient: One failure doesn't block others

### Image Compression (Sharp)
```typescript
import sharp from 'sharp';

const compressedBuffer = await sharp(imageBuffer)
  .resize(400, 400, { fit: 'cover' })
  .jpeg({ quality: 80 })
  .toBuffer();

const base64 = compressedBuffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;
```

Result: 1.5MB PNG → 16KB JPEG

## Common Tasks

### Create Daily Post (Auto)
```typescript
app.post('/api/create-game-post', async (req, res) => {
  const caseData = await getCaseData(caseId);

  const post = await reddit.submitCustomPost({
    title: caseData.title,
    subredditName: 'your_subreddit',
    preview: <blocks><text>Loading...</text></blocks>
  });

  res.json({ postId: post.id, url: post.url });
});
```

### Player State Initialization
```typescript
app.post('/api/player-state/initialize', async (req, res) => {
  const { userId, caseId } = req.body;

  const playerState = {
    actionPoints: {
      current: caseData.actionPoints.initial,  // 3
      total: caseData.actionPoints.initial,
      spent: 0,
      acquisitionHistory: [],
      spendingHistory: [],
      emergencyAPUsed: false
    },
    discoveredEvidence: [],
    visitedLocations: [],
    hasSubmitted: false
  };

  await redis.set(`player:${userId}:${caseId}`, JSON.stringify(playerState));
  res.json(playerState);
});
```

### Leaderboard Update
```typescript
// Use Redis Sorted Set
await redis.zAdd(`leaderboard:${caseId}`, {
  member: userId,
  score: finalScore
});

// Get top 100
const entries = await redis.zRange(`leaderboard:${caseId}`, 0, 99, {
  reverse: true,
  by: 'score'
});
```

### Data Consistency Check
```typescript
// Validate case structure
function validateCaseData(caseData) {
  if (!caseData.id || !caseData.title) {
    throw new Error('Missing required fields');
  }

  if (caseData.suspects.length !== 3) {
    throw new Error('Must have exactly 3 suspects');
  }

  const guiltyCount = caseData.suspects.filter(s => s.isGuilty).length;
  if (guiltyCount !== 1) {
    throw new Error('Must have exactly 1 guilty suspect');
  }

  // Check AP topics
  for (const suspect of caseData.suspects) {
    if (suspect.apTopics.length < 5) {
      throw new Error(`Suspect ${suspect.id} has too few AP topics`);
    }
  }
}
```

## Build & Deploy

### Build Commands
```bash
# Build all
npm run build

# Build separately
npm run build:client  # Vite → dist/client
npm run build:server  # Vite → dist/server
```

### Devvit Commands
```bash
# Local testing
devvit playtest

# Upload to Reddit
devvit upload

# Publish
devvit publish
```

### Troubleshooting

**500 Error on load**:
- Check payload size (use 2-stage loading)
- Verify all endpoints start with `/api/` or `/internal/`
- Check Redis data structure

**Scheduler not running**:
- Verify cron syntax: `'0 0 * * *'`
- Check AppInstall trigger registered
- View logs: `devvit logs`

**Images not loading**:
- Ensure `hasProfileImage` flag in initial payload
- Check `/api/suspect-image/:id` endpoint
- Verify Base64 encoding

## Reference Files

For detailed guides, see:

- [API Patterns](reference/api-patterns.md) - 20+ endpoint examples
- [Game Mechanics](reference/game-mechanics.md) - AP System, Evidence Discovery
- [Redis Patterns](reference/redis-patterns.md) - Data structures, key naming
- [Gemini Integration](reference/gemini-integration.md) - AI patterns, prompts
- [Image Optimization](reference/image-optimization.md) - Compression, loading strategies

## Utility Scripts

Validate case structure before saving:
```bash
tsx scripts/validate-case-structure.ts
```

See [scripts/validate-case-structure.ts](scripts/validate-case-structure.ts) for implementation.
