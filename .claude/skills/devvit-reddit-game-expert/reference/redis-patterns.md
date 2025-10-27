# Redis KV Store Patterns

Complete guide to Redis usage in Devvit Reddit games.

## Key Naming Conventions

### Hierarchical Naming
```
entity:identifier[:subidentifier]
```

Examples:
```
case:case-2025-10-21
case:date:2025-10-21
suspect:case-2025-10-21-suspect-1
player:reddit-user-123:case-2025-10-21
conversation:reddit-user-123-suspect-1-session-abc
submission:reddit-user-123:case-2025-10-21
leaderboard:case-2025-10-21
```

### Index Keys
Use separate keys for lookups:
```
case:date:2025-10-21 → "case-2025-10-21"  (string value)
case:case-2025-10-21:suspects → ["suspect-1", "suspect-2", "suspect-3"]  (JSON array)
```

## Data Structures

### String (JSON)
Most common: Store objects as JSON strings.

```typescript
// Set
await redis.set('case:case-123', JSON.stringify(caseData));

// Get
const json = await redis.get('case:case-123');
const caseData = JSON.parse(json);

// Set with expiry
await redis.set('temp:session-abc', JSON.stringify(data), { expiration: 3600 });
```

### Hash
For structured data with frequent field updates.

```typescript
// Set multiple fields
await redis.hSet('player:user123', {
  score: '100',
  level: '5',
  lastAction: new Date().toISOString()
});

// Get all fields
const playerData = await redis.hGetAll('player:user123');
// { score: '100', level: '5', lastAction: '...' }

// Get single field
const score = await redis.hGet('player:user123', 'score');

// Increment field
await redis.hIncrBy('player:user123', 'score', 10);
```

### Sorted Set (Leaderboard)
For rankings.

```typescript
// Add entry
await redis.zAdd('leaderboard:case-123', {
  member: 'user456',
  score: 95
});

// Get top 10 (descending)
const top10 = await redis.zRange('leaderboard:case-123', 0, 9, {
  reverse: true,
  by: 'score'
});
// [ { member: 'user456', score: 95 }, ... ]

// Get user rank
const rank = await redis.zRank('leaderboard:case-123', 'user456', {
  reverse: true
});

// Get score
const score = await redis.zScore('leaderboard:case-123', 'user456');
```

### List (Rare)
For ordered collections (logs, messages).

```typescript
// Push to right
await redis.rPush('logs:case-123', JSON.stringify(logEntry));

// Get range
const logs = await redis.lRange('logs:case-123', 0, -1);
```

## Common Patterns

### Case Data Storage

```typescript
interface CaseDataPattern {
  // Main case data
  'case:{caseId}': {
    id: string;
    date: string;
    title: string;
    summary: string;
    imageUrl: string;
    locations: Location[];
    actionPoints: ActionPointsConfig;
    suspectIds: string[];
  };

  // Date index
  'case:date:{YYYY-MM-DD}': string;  // caseId

  // Suspects index
  'case:{caseId}:suspects': string[];  // suspectIds
}

// Save case
async function saveCase(caseData: Case): Promise<void> {
  // Main case
  await redis.set(`case:${caseData.id}`, JSON.stringify(caseData));

  // Date index
  await redis.set(`case:date:${caseData.date}`, caseData.id);

  // Suspects index
  await redis.set(`case:${caseData.id}:suspects`, JSON.stringify(caseData.suspectIds));
}

// Load case
async function loadCase(caseId: string): Promise<Case> {
  const caseJson = await redis.get(`case:${caseId}`);
  return JSON.parse(caseJson);
}

// Load today's case
async function loadTodaysCase(): Promise<Case> {
  const today = new Date().toISOString().split('T')[0];
  const caseId = await redis.get(`case:date:${today}`);

  if (!caseId) {
    return null;
  }

  return loadCase(caseId);
}
```

### Suspect Data Storage

```typescript
interface SuspectDataPattern {
  'suspect:{suspectId}': {
    id: string;
    caseId: string;
    name: string;
    archetype: string;
    isGuilty: boolean;
    profileImageUrl: string;  // Base64 JPEG (~16KB)
    hasProfileImage: boolean;
    apTopics: APTopic[];
  };
}

// Save suspect
async function saveSuspect(suspect: Suspect): Promise<void> {
  await redis.set(`suspect:${suspect.id}`, JSON.stringify(suspect));
}

// Load suspect
async function loadSuspect(suspectId: string): Promise<Suspect> {
  const suspectJson = await redis.get(`suspect:${suspectId}`);
  return JSON.parse(suspectJson);
}

// Load all case suspects
async function loadCaseSuspects(caseId: string): Promise<Suspect[]> {
  const suspectIdsJson = await redis.get(`case:${caseId}:suspects`);
  const suspectIds = JSON.parse(suspectIdsJson);

  // Parallel loading
  const suspects = await Promise.all(
    suspectIds.map(id => loadSuspect(id))
  );

  return suspects;
}
```

### Player State Management

```typescript
interface PlayerStatePattern {
  'player:{userId}:{caseId}': {
    caseId: string;
    userId: string;
    actionPoints: ActionPointsState;
    discoveredEvidence: EvidenceItem[];
    visitedLocations: string[];
    locationSearchCounts: Record<string, number>;
    hasSubmitted: boolean;
  };
}

// Initialize player
async function initializePlayer(userId: string, caseId: string): Promise<PlayerState> {
  const caseData = await loadCase(caseId);

  const playerState: PlayerState = {
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

  return playerState;
}

// Update player state
async function updatePlayerState(playerState: PlayerState): Promise<void> {
  await redis.set(
    `player:${playerState.userId}:${playerState.caseId}`,
    JSON.stringify(playerState)
  );
}

// Load player state
async function loadPlayerState(userId: string, caseId: string): Promise<PlayerState | null> {
  const stateJson = await redis.get(`player:${userId}:${caseId}`);
  return stateJson ? JSON.parse(stateJson) : null;
}
```

### Conversation History

```typescript
interface ConversationPattern {
  'conversation:{conversationId}': {
    conversationId: string;
    userId: string;
    suspectId: string;
    caseId: string;
    messages: Message[];
    createdAt: string;
    lastMessageAt: string;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  apGained?: number;
  triggeredTopics?: string[];
}

// Save conversation
async function saveConversation(conversation: Conversation): Promise<void> {
  await redis.set(
    `conversation:${conversation.conversationId}`,
    JSON.stringify(conversation)
  );
}

// Load conversation
async function loadConversation(conversationId: string): Promise<Conversation | null> {
  const convJson = await redis.get(`conversation:${conversationId}`);
  return convJson ? JSON.parse(convJson) : null;
}

// Append message
async function appendMessage(conversationId: string, message: Message): Promise<void> {
  const conversation = await loadConversation(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  conversation.messages.push(message);
  conversation.lastMessageAt = message.timestamp;

  await saveConversation(conversation);
}
```

### Submission Storage

```typescript
interface SubmissionPattern {
  'submission:{userId}:{caseId}': {
    userId: string;
    caseId: string;
    selectedSuspectId: string;
    reasoning: string;
    isCorrect: boolean;
    score: number;
    apIntegrity: IntegrityResult;
    submittedAt: string;
  };
}

// Save submission
async function saveSubmission(submission: Submission): Promise<void> {
  await redis.set(
    `submission:${submission.userId}:${submission.caseId}`,
    JSON.stringify(submission)
  );
}

// Check if submitted
async function hasSubmitted(userId: string, caseId: string): Promise<boolean> {
  const submission = await redis.get(`submission:${userId}:${caseId}`);
  return submission !== null;
}
```

### Leaderboard Management

```typescript
// Add/update score
async function updateLeaderboard(caseId: string, userId: string, score: number): Promise<void> {
  await redis.zAdd(`leaderboard:${caseId}`, {
    member: userId,
    score: score
  });
}

// Get top N
async function getTopScores(caseId: string, limit: number = 100): Promise<LeaderboardEntry[]> {
  const entries = await redis.zRange(`leaderboard:${caseId}`, 0, limit - 1, {
    reverse: true,
    by: 'score'
  });

  return entries.map((entry, index) => ({
    rank: index + 1,
    userId: entry.member,
    score: entry.score
  }));
}

// Get user rank
async function getUserRank(caseId: string, userId: string): Promise<number | null> {
  const rank = await redis.zRank(`leaderboard:${caseId}`, userId, {
    reverse: true
  });

  return rank !== null ? rank + 1 : null;
}
```

## Batch Operations

### Parallel Reads
```typescript
// Load multiple keys in parallel
async function loadMultiple(keys: string[]): Promise<any[]> {
  const results = await Promise.all(
    keys.map(key => redis.get(key))
  );

  return results.map(json => JSON.parse(json));
}

// mGet (single Redis call)
async function mGetMultiple(keys: string[]): Promise<any[]> {
  const results = await redis.mGet(keys);
  return results.map(json => JSON.parse(json));
}
```

### Batch Writes
```typescript
// mSet (single Redis call)
async function mSetMultiple(entries: Record<string, any>): Promise<void> {
  const serialized = Object.fromEntries(
    Object.entries(entries).map(([key, value]) => [key, JSON.stringify(value)])
  );

  await redis.mSet(serialized);
}
```

## Data Lifecycle

### Case Lifecycle
```
1. Generation (Scheduler/Manual)
   └─ case:{caseId}
   └─ case:date:{date}
   └─ suspect:{suspectId} x3

2. Player Interaction
   └─ player:{userId}:{caseId}
   └─ conversation:{conversationId}

3. Submission
   └─ submission:{userId}:{caseId}
   └─ leaderboard:{caseId} (sorted set)

4. Cleanup (Optional)
   └─ Delete old cases after N days
```

### Cleanup Strategy
```typescript
async function cleanupOldCases(daysOld: number): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  // Find old cases
  const oldCases = await findCasesBefore(cutoffDate);

  for (const caseId of oldCases) {
    // Delete case
    await redis.del(`case:${caseId}`);

    // Delete suspects
    const suspectIds = JSON.parse(await redis.get(`case:${caseId}:suspects`));
    await Promise.all(suspectIds.map(id => redis.del(`suspect:${id}`)));

    // Delete leaderboard
    await redis.del(`leaderboard:${caseId}`);

    // Note: Player states and submissions can be kept for analytics
  }
}
```

## Performance Tips

1. **Use JSON.stringify/parse**: Redis stores strings, always serialize objects
2. **Parallel reads**: Use `Promise.all()` for independent reads
3. **Batch operations**: Use `mGet/mSet` for multiple keys
4. **Key expiry**: Set TTL for temporary data
5. **Index keys**: Separate index keys for efficient lookups
6. **Hash for updates**: Use hashes when frequently updating specific fields

## Error Handling

```typescript
async function safeRedisGet<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const json = await redis.get(key);
    return json ? JSON.parse(json) : defaultValue;
  } catch (error) {
    console.error(`Redis get failed for key ${key}:`, error);
    return defaultValue;
  }
}

async function safeRedisSet(key: string, value: any): Promise<boolean> {
  try {
    await redis.set(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Redis set failed for key ${key}:`, error);
    return false;
  }
}
```
