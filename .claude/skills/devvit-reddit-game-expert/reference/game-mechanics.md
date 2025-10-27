# Game Mechanics

Complete guide to Action Points System and Evidence Discovery.

## Action Points System

### Configuration
```typescript
interface ActionPointsConfig {
  initial: number;     // Starting AP (3)
  maximum: number;     // Max AP cap (12)
  costs: {
    quick: number;     // Quick search (1 AP)
    thorough: number;  // Thorough search (2 AP)
    exhaustive: number;// Exhaustive search (3 AP)
  };
}
```

### Player State
```typescript
interface ActionPointsState {
  current: number;              // Current available AP
  total: number;                // Total acquired AP
  spent: number;                // Total spent AP
  initial: number;              // Initial AP at game start
  acquisitionHistory: APAcquisition[];
  spendingHistory: APSpending[];
  acquiredTopics: string[];     // Topic IDs already triggered
  bonusesAcquired: string[];    // Bonus IDs already acquired
  emergencyAPUsed: boolean;     // Emergency AP flag (1-time only)
}

interface APAcquisition {
  amount: number;
  source: 'interrogation' | 'emergency' | 'bonus';
  suspectId?: string;
  topics?: string[];
  timestamp: string;
}

interface APSpending {
  amount: number;
  purpose: 'location_search';
  locationId: string;
  searchType: 'quick' | 'thorough' | 'exhaustive';
  evidenceFound: number;
  timestamp: string;
}
```

## AP Acquisition

### Topic-Based Rewards
Each suspect has 5-7 AP topics:

```typescript
interface APTopic {
  id: string;
  category: 'alibi' | 'relationship' | 'motive' | 'evidence' | 'background';
  keywords: string[];         // Trigger words
  apReward: number;           // AP amount (1-2)
  requiresQuality: boolean;   // Needs quality check
  description: string;
  triggered: boolean;         // Already used flag
}
```

Example topics:
```typescript
const suspectTopics = [
  {
    id: 'topic-alibi-1',
    category: 'alibi',
    keywords: ['어디', '있었', '당시', '시간'],
    apReward: 1,
    requiresQuality: true,
    description: '알리바이 정보 획득'
  },
  {
    id: 'topic-relationship-1',
    category: 'relationship',
    keywords: ['피해자', '관계', '알고'],
    apReward: 1,
    requiresQuality: true
  }
];
```

### Conversation Analysis
```typescript
function analyzeConversation(
  userMessage: string,
  aiResponse: string,
  suspect: Suspect,
  playerAP: ActionPointsState
): APAnalysisResult {
  let totalAPGained = 0;
  const triggeredTopics: string[] = [];

  // 1. Topic detection
  for (const topic of suspect.apTopics) {
    if (topic.triggered) continue;

    // Keyword matching
    const hasKeyword = topic.keywords.some(keyword =>
      userMessage.includes(keyword) || aiResponse.includes(keyword)
    );

    if (hasKeyword) {
      // Quality check (if required)
      if (topic.requiresQuality) {
        const qualityScore = assessResponseQuality(aiResponse);
        if (qualityScore < 0.6) continue;
      }

      totalAPGained += topic.apReward;
      triggeredTopics.push(topic.id);
      topic.triggered = true;
    }
  }

  // 2. Bonus detection
  const bonus = detectBonus(userMessage, aiResponse);
  if (bonus && !playerAP.bonusesAcquired.includes(bonus.id)) {
    totalAPGained += bonus.reward;
    playerAP.bonusesAcquired.push(bonus.id);
  }

  return {
    apGained: totalAPGained,
    triggeredTopics,
    bonusId: bonus?.id
  };
}
```

### Quality Assessment
```typescript
async function assessResponseQuality(response: string): Promise<number> {
  const prompt = `
  Assess if this AI response provides useful information for investigation (0-1):
  "${response}"

  Return only a number 0-1.
  `;

  const result = await geminiModel.generateContent(prompt);
  return parseFloat(result.response.text());
}
```

### Bonus Triggers
```typescript
interface APBonus {
  id: string;
  type: 'insight' | 'pressure' | 'followup';
  trigger: (message: string, response: string) => boolean;
  reward: number;
}

const bonuses: APBonus[] = [
  {
    id: 'bonus-insight-1',
    type: 'insight',
    trigger: (msg, res) =>
      msg.length > 100 && res.includes('진실') || res.includes('사실은'),
    reward: 1
  },
  {
    id: 'bonus-followup-1',
    type: 'followup',
    trigger: (msg, res) =>
      msg.includes('왜') || msg.includes('어떻게'),
    reward: 1
  }
];
```

## AP Spending

### Search Types
```typescript
type SearchType = 'quick' | 'thorough' | 'exhaustive';

const searchCosts = {
  quick: 1,       // Fast but low discovery rate
  thorough: 2,    // Balanced
  exhaustive: 3   // Slow but high discovery rate
};
```

### Spending Workflow
```typescript
async function spendAP(
  playerState: PlayerState,
  searchType: SearchType,
  locationId: string
): Promise<SearchResult> {
  const apCost = caseData.actionPoints.costs[searchType];

  // 1. Check AP sufficiency
  if (playerState.actionPoints.current < apCost) {
    // Emergency AP (1-time only)
    if (!playerState.actionPoints.emergencyAPUsed) {
      const emergencyAP = provideEmergencyAP(playerState);
      throw new InsufficientAPError('emergency_provided', emergencyAP);
    } else {
      throw new InsufficientAPError('insufficient', 0);
    }
  }

  // 2. Deduct AP
  playerState.actionPoints.current -= apCost;
  playerState.actionPoints.spent += apCost;

  // 3. Record spending
  playerState.actionPoints.spendingHistory.push({
    amount: apCost,
    purpose: 'location_search',
    locationId,
    searchType,
    evidenceFound: 0,  // Updated after discovery
    timestamp: new Date().toISOString()
  });

  // 4. Discover evidence
  const discoveredEvidence = discoverEvidence(location, searchType, playerState);

  // Update spending record
  const lastSpending = playerState.actionPoints.spendingHistory.at(-1);
  lastSpending.evidenceFound = discoveredEvidence.length;

  return { discoveredEvidence, apRemaining: playerState.actionPoints.current };
}
```

### Emergency AP System
```typescript
function provideEmergencyAP(playerState: ActionPointsState): number {
  if (playerState.emergencyAPUsed) return 0;

  const emergencyAmount = 2;  // Enough for thorough search

  playerState.actionPoints.current += emergencyAmount;
  playerState.actionPoints.total += emergencyAmount;
  playerState.actionPoints.emergencyAPUsed = true;

  playerState.actionPoints.acquisitionHistory.push({
    amount: emergencyAmount,
    source: 'emergency',
    timestamp: new Date().toISOString()
  });

  return emergencyAmount;
}
```

## Evidence Discovery

### Evidence Structure
```typescript
interface EvidenceItem {
  id: string;
  type: 'physical' | 'digital' | 'testimony' | 'document';
  name: string;
  description: string;
  significance: string;       // Why it matters
  importance: 1 | 2 | 3;      // 1=low, 2=medium, 3=critical
  relatedSuspect?: string;    // Suspect ID
  discoveryProbability: {
    quick: number;            // 0-1 probability
    thorough: number;
    exhaustive: number;
  };
}
```

### Location Structure
```typescript
interface Location {
  id: string;
  name: string;
  description: string;
  emoji: string;
  evidenceItems: EvidenceItem[];
}
```

### Discovery Probabilities
```typescript
const probabilityByImportance = {
  // Critical evidence (importance: 3)
  critical: {
    quick: 0.4,       // 40% chance
    thorough: 0.7,    // 70% chance
    exhaustive: 0.95  // 95% chance
  },
  // Supporting evidence (importance: 2)
  supporting: {
    quick: 0.6,
    thorough: 0.85,
    exhaustive: 1.0
  },
  // Low importance / Red herring (importance: 1)
  low: {
    quick: 0.8,
    thorough: 0.9,
    exhaustive: 1.0
  }
};
```

### Discovery Algorithm
```typescript
function discoverEvidence(
  location: Location,
  searchType: SearchType,
  playerState: PlayerState
): EvidenceItem[] {
  const discovered: EvidenceItem[] = [];

  for (const evidence of location.evidenceItems) {
    // Skip if already found
    if (playerState.discoveredEvidence.some(e => e.id === evidence.id)) {
      continue;
    }

    // Roll for discovery
    const probability = evidence.discoveryProbability[searchType];
    const roll = Math.random();

    if (roll < probability) {
      discovered.push(evidence);
      playerState.discoveredEvidence.push(evidence);
    }
  }

  // Update location visit tracking
  if (!playerState.visitedLocations.includes(location.id)) {
    playerState.visitedLocations.push(location.id);
  }

  playerState.locationSearchCounts[location.id] =
    (playerState.locationSearchCounts[location.id] || 0) + 1;

  return discovered;
}
```

### Evidence Distribution
```typescript
interface EvidenceDistribution {
  criticalCount: 3;      // Decisive evidence
  supportingCount: 4-6;  // Supporting clues
  redHerringCount: 2-3;  // Misleading clues
  perLocationMin: 2;     // Min per location
  perLocationMax: 4;     // Max per location
}

function generateEvidenceDistribution(
  locations: Location[],
  suspects: Suspect[]
): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];

  // Critical evidence (3 items)
  for (let i = 0; i < 3; i++) {
    evidence.push({
      id: `critical-${i + 1}`,
      type: 'physical',
      importance: 3,
      discoveryProbability: {
        quick: 0.4,
        thorough: 0.7,
        exhaustive: 0.95
      }
    });
  }

  // Supporting evidence (4-6 items)
  for (let i = 0; i < 5; i++) {
    evidence.push({
      id: `supporting-${i + 1}`,
      type: 'document',
      importance: 2,
      discoveryProbability: {
        quick: 0.6,
        thorough: 0.85,
        exhaustive: 1.0
      }
    });
  }

  // Red herrings (2-3 items)
  for (let i = 0; i < 2; i++) {
    evidence.push({
      id: `red-herring-${i + 1}`,
      type: 'testimony',
      importance: 1,
      discoveryProbability: {
        quick: 0.8,
        thorough: 0.9,
        exhaustive: 1.0
      }
    });
  }

  // Distribute to locations
  distributeEvidenceToLocations(evidence, locations);

  return evidence;
}
```

## AP Integrity Check

### Validation
```typescript
function verifyAPIntegrity(
  playerAP: ActionPointsState,
  configAP: ActionPointsConfig
): IntegrityResult {
  const violations: string[] = [];

  // 1. Total AP check
  const maxPossibleAP =
    configAP.initial +
    (suspect1Topics.length + suspect2Topics.length + suspect3Topics.length) +
    (emergencyAP ? 2 : 0) +
    maxBonuses;

  if (playerAP.total > maxPossibleAP) {
    violations.push(`Total AP (${playerAP.total}) exceeds maximum possible (${maxPossibleAP})`);
  }

  // 2. Current AP check
  const expectedCurrent = playerAP.total - playerAP.spent;
  if (playerAP.current !== expectedCurrent) {
    violations.push(`Current AP (${playerAP.current}) != total - spent (${expectedCurrent})`);
  }

  // 3. History consistency
  const historyTotal = playerAP.acquisitionHistory.reduce((sum, a) => sum + a.amount, 0);
  const historySpent = playerAP.spendingHistory.reduce((sum, s) => sum + s.amount, 0);

  if (historyTotal !== playerAP.total) {
    violations.push('Acquisition history mismatch');
  }

  if (historySpent !== playerAP.spent) {
    violations.push('Spending history mismatch');
  }

  // 4. Topic duplication check
  const uniqueTopics = new Set(playerAP.acquiredTopics);
  if (uniqueTopics.size !== playerAP.acquiredTopics.length) {
    violations.push('Duplicate AP topics detected');
  }

  return {
    isValid: violations.length === 0,
    violations,
    stats: {
      current: playerAP.current,
      total: playerAP.total,
      spent: playerAP.spent,
      maxPossible: maxPossibleAP
    }
  };
}
```

## Fair Play Principles

1. **Deterministic Discovery**: Same search = same evidence (no random re-rolls)
2. **No Duplicate Topics**: Each topic triggers once
3. **AP Cap Enforcement**: Cannot exceed maximum (12 AP)
4. **Emergency AP Limit**: Only once per game
5. **Quality Threshold**: Low-quality questions don't earn AP
6. **Integrity Validation**: Server-side verification on submission
