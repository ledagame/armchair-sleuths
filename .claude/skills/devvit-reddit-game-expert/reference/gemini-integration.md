# Gemini AI Integration

Complete guide to integrating Google Gemini AI for case generation, suspect chat, and scoring.

## Setup

### Installation
```bash
npm install @google/generative-ai
```

### Client Initialization
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = await context.settings.get<string>('geminiApiKey');
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Models
const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
const proModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
```

### Model Selection
- **gemini-2.0-flash-exp**: Fast, cost-effective (case generation, chat)
- **gemini-1.5-pro**: High quality (scoring, complex analysis)

## Case Generation

### Generate Complete Case
```typescript
async function generateCase(options: {
  date: Date;
  language?: string;
  includeImage?: boolean;
  includeSuspectImages?: boolean;
}): Promise<Case> {
  const prompt = buildCasePrompt(options);

  const result = await flashModel.generateContent(prompt);
  const caseData = JSON.parse(result.response.text());

  // Validate structure
  validateCaseStructure(caseData);

  return caseData;
}
```

### Case Generation Prompt
```typescript
function buildCasePrompt(options: { date: Date; language?: string }): string {
  return `Generate a murder mystery case in JSON format.

Requirements:
- Date: ${options.date.toISOString().split('T')[0]}
- Language: ${options.language || 'Korean'}
- Setting: Modern Korea (Seoul area preferred)
- Difficulty: Medium

Structure (return ONLY valid JSON):
{
  "title": "string (compelling title)",
  "summary": "string (2-3 sentences)",
  "detailedDescription": "string (500+ characters, rich details)",
  "victim": {
    "name": "string",
    "age": number,
    "occupation": "string",
    "background": "string"
  },
  "crime": {
    "type": "murder",
    "method": "string (poison, stabbing, etc.)",
    "weapon": "string",
    "timeOfDeath": "string (시간 format)",
    "location": "string (detailed)"
  },
  "suspects": [
    {
      "name": "string (Korean name)",
      "age": number,
      "occupation": "string",
      "relationship": "string (to victim)",
      "personality": "string (archetype: nervous, arrogant, etc.)",
      "emotionalState": "string",
      "alibi": "string (detailed, with holes if guilty)",
      "motive": "string (if guilty, strong motive)",
      "isGuilty": boolean,
      "apTopics": [
        {
          "id": "topic-alibi-1",
          "category": "alibi",
          "keywords": ["어디", "있었", "당시"],
          "apReward": 1,
          "requiresQuality": true,
          "description": "알리바이 정보"
        },
        // 5-7 topics per suspect
      ]
    }
    // Exactly 3 suspects (1 guilty)
  ],
  "locations": [
    {
      "id": "loc-1",
      "name": "string (location name)",
      "description": "string",
      "emoji": "string (📍, 🏠, etc.)",
      "evidenceItems": [
        {
          "id": "ev-1",
          "type": "physical|digital|testimony|document",
          "name": "string",
          "description": "string",
          "significance": "string",
          "importance": 1|2|3,
          "relatedSuspect": "suspect-id or null",
          "discoveryProbability": {
            "quick": 0.3-0.8,
            "thorough": 0.6-0.9,
            "exhaustive": 0.9-1.0
          }
        }
        // 2-4 evidence items per location
      ]
    }
    // 3-5 locations
  ],
  "introNarration": "string (cinematic opening, 200-300 chars)"
}

Guidelines:
- Make the guilty suspect's clues subtle but discoverable
- Include red herrings for innocent suspects
- Ensure Fair Play: All clues available to solve
- AP topics should cover: alibi, relationship, motive, background, evidence
- Evidence distribution: 3 critical, 4-6 supporting, 2-3 red herrings
- Discovery probabilities: Critical < Supporting < Red Herrings
`;
}
```

### Structured Output (Optional)
Use response schema for strict structure:

```typescript
const caseSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    suspects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          isGuilty: { type: "boolean" }
        },
        required: ["name", "isGuilty"]
      }
    }
  },
  required: ["title", "suspects"]
};

const result = await flashModel.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: caseSchema
  }
});
```

## Image Generation (Imagen 3)

### Generate Case Scene Image
```typescript
import { ImageGenerationModel } from '@google-cloud/vertexai';

async function generateCaseImage(caseData: Case): Promise<string> {
  const prompt = buildImagePrompt(caseData);

  const imageModel = new ImageGenerationModel('imagegeneration@006');

  const [response] = await imageModel.generateImages({
    prompt,
    numberOfImages: 1,
    aspectRatio: '16:9',
    safetySetting: 'block_few'
  });

  const imageBuffer = response.images[0].bytesBase64Encoded;

  // Compress with Sharp
  const compressedBuffer = await sharp(Buffer.from(imageBuffer, 'base64'))
    .resize(1200, 675, { fit: 'cover' })
    .jpeg({ quality: 85 })
    .toBuffer();

  return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
}

function buildImagePrompt(caseData: Case): string {
  return `
  Crime scene photography, cinematic lighting, realistic style:
  ${caseData.crime.location} where ${caseData.crime.method} occurred.
  Moody atmosphere, ${caseData.crime.timeOfDeath} lighting.
  Professional crime scene, no people visible, focus on environment.
  High detail, photorealistic, 4K quality.
  `;
}
```

### Generate Suspect Profile Images
```typescript
async function generateSuspectImages(suspects: Suspect[]): Promise<void> {
  const imagePromises = suspects.map(suspect =>
    generateSuspectImage(suspect)
  );

  const results = await Promise.allSettled(imagePromises);

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      suspects[index].profileImageUrl = result.value;
      suspects[index].hasProfileImage = true;
    } else {
      console.error(`Image generation failed for suspect ${index}:`, result.reason);
      suspects[index].hasProfileImage = false;
    }
  });
}

async function generateSuspectImage(suspect: Suspect): Promise<string> {
  const prompt = `
  Professional portrait photo, realistic style:
  ${suspect.age} year old Korean ${suspect.occupation},
  ${suspect.personality} personality, ${suspect.emotionalState} expression.
  Studio lighting, neutral background, headshot, professional photography.
  High detail, photorealistic, 4K quality.
  `;

  // Vercel Function for better compression
  const response = await fetch(vercelImageFunctionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, suspectId: suspect.id })
  });

  const data = await response.json();
  return data.imageUrl;  // Pre-compressed to ~16KB JPEG
}
```

## Suspect Chat

### AI Suspect Personality
```typescript
async function chatWithSuspect(
  suspectId: string,
  userMessage: string,
  conversationHistory: Message[]
): Promise<string> {
  const suspect = await loadSuspect(suspectId);
  const caseData = await loadCase(suspect.caseId);

  const prompt = buildSuspectChatPrompt(suspect, caseData, userMessage, conversationHistory);

  const result = await flashModel.generateContent(prompt);
  return result.response.text();
}

function buildSuspectChatPrompt(
  suspect: Suspect,
  caseData: Case,
  userMessage: string,
  history: Message[]
): string {
  return `You are ${suspect.name}, a suspect in a murder investigation.

# Your Profile
- Age: ${suspect.age}
- Occupation: ${suspect.occupation}
- Relationship to victim: ${suspect.relationship}
- Personality: ${suspect.personality}
- Emotional state: ${suspect.emotionalState}
- Guilty: ${suspect.isGuilty ? 'YES' : 'NO'}

# Case Context
- Victim: ${caseData.victim.name}
- Crime: ${caseData.crime.method} at ${caseData.crime.location}
- Time: ${caseData.crime.timeOfDeath}

# Your Alibi
${suspect.alibi}

# Your Motive (if guilty)
${suspect.isGuilty ? suspect.motive : 'You have no motive - you are innocent.'}

# Conversation History
${history.map(m => `${m.role}: ${m.content}`).join('\n')}

# Current Question
Detective: ${userMessage}

# Instructions
1. Stay in character based on personality and emotional state
2. If guilty: Be defensive, have inconsistencies in alibi, show nervousness
3. If innocent: Be cooperative but may be confused or upset
4. Reveal information gradually - don't volunteer everything immediately
5. Show emotions appropriate to personality and guilt status
6. Respond naturally in Korean
7. Keep responses 2-4 sentences unless asked for detailed explanation

Your response:`;
}
```

### Conversation Management
```typescript
async function handleChatMessage(
  suspectId: string,
  userId: string,
  message: string
): Promise<ChatResponse> {
  const conversationId = `${userId}-${suspectId}`;
  let conversation = await loadConversation(conversationId);

  if (!conversation) {
    conversation = {
      conversationId,
      userId,
      suspectId,
      messages: [],
      createdAt: new Date().toISOString()
    };
  }

  // Add user message
  conversation.messages.push({
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  });

  // Get AI response
  const aiResponse = await chatWithSuspect(
    suspectId,
    message,
    conversation.messages
  );

  // Analyze for AP
  const apResult = analyzeConversation(message, aiResponse, suspect);

  // Add AI message
  conversation.messages.push({
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date().toISOString(),
    apGained: apResult.apGained,
    triggeredTopics: apResult.triggeredTopics
  });

  await saveConversation(conversation);

  return {
    response: aiResponse,
    apGained: apResult.apGained,
    triggeredTopics: apResult.triggeredTopics
  };
}
```

## Scoring System

### Reasoning Evaluation
```typescript
async function scoreReasoning(
  reasoning: string,
  caseData: Case,
  selectedSuspect: Suspect,
  isCorrect: boolean
): Promise<ScoringResult> {
  const prompt = buildScoringPrompt(reasoning, caseData, selectedSuspect, isCorrect);

  const result = await proModel.generateContent(prompt);  // Use Pro for quality
  const responseText = result.response.text();

  return {
    score: extractScore(responseText),
    feedback: extractFeedback(responseText),
    breakdown: extractBreakdown(responseText)
  };
}

function buildScoringPrompt(
  reasoning: string,
  caseData: Case,
  selectedSuspect: Suspect,
  isCorrect: boolean
): string {
  return `You are an expert detective evaluating another detective's reasoning.

# Case Summary
${caseData.summary}

# Selected Suspect
${selectedSuspect.name} (${isCorrect ? 'CORRECT' : 'WRONG'})

# Detective's Reasoning
"${reasoning}"

# Evaluation Criteria (100 points total)

1. **Logical Consistency** (30 points)
   - Does the reasoning follow logically?
   - Are conclusions supported by premises?
   - Any logical fallacies?

2. **Evidence Usage** (30 points)
   - How well does the reasoning incorporate evidence?
   - Are claims backed by facts?
   - Evidence cited correctly?

3. **Insight & Depth** (20 points)
   - Shows deep understanding of case?
   - Makes connections others might miss?
   - Goes beyond surface observations?

4. **Persuasiveness** (20 points)
   - Would this convince a jury?
   - Clear and compelling presentation?
   - Addresses counterarguments?

# Special Rules
- If WRONG suspect selected: Maximum 50 points possible
- If reasoning is generic/template-like: Reduce by 20 points
- If exceptional insight even with wrong suspect: Up to 70 points

# Response Format
Provide your evaluation in this EXACT format:

SCORE: [number 0-100]

BREAKDOWN:
- Logical Consistency: [X/30] - [reason]
- Evidence Usage: [X/30] - [reason]
- Insight & Depth: [X/20] - [reason]
- Persuasiveness: [X/20] - [reason]

FEEDBACK:
[2-3 sentences of constructive feedback]
`;
}
```

### Response Parsing
```typescript
function extractScore(response: string): number {
  const match = response.match(/SCORE:\s*(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function extractFeedback(response: string): string {
  const match = response.match(/FEEDBACK:\s*(.+?)(?:\n\n|$)/s);
  return match ? match[1].trim() : '';
}

function extractBreakdown(response: string): ScoringBreakdown {
  const breakdown = {
    logicalConsistency: 0,
    evidenceUsage: 0,
    insight: 0,
    persuasiveness: 0
  };

  const matches = {
    logicalConsistency: response.match(/Logical Consistency:\s*(\d+)/),
    evidenceUsage: response.match(/Evidence Usage:\s*(\d+)/),
    insight: response.match(/Insight & Depth:\s*(\d+)/),
    persuasiveness: response.match(/Persuasiveness:\s*(\d+)/)
  };

  Object.entries(matches).forEach(([key, match]) => {
    if (match) breakdown[key] = parseInt(match[1]);
  });

  return breakdown;
}
```

## Error Handling

### Retry Logic
```typescript
async function generateContentWithRetry<T>(
  generateFn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateFn();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  throw new Error('All retry attempts failed');
}
```

### Rate Limiting
```typescript
class GeminiRateLimiter {
  private lastCallTime = 0;
  private minInterval = 100;  // 100ms between calls

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;

    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }

    this.lastCallTime = Date.now();
    return fn();
  }
}
```

## Performance Tips

1. **Model Selection**: Use Flash for speed, Pro for quality
2. **Streaming**: Use streaming responses for chat
3. **Caching**: Cache AI responses when possible
4. **Parallel Calls**: Generate suspect images in parallel
5. **Timeout**: Set reasonable timeouts (10-15 seconds)
6. **Error Handling**: Always use try/catch with retries

## Cost Optimization

- **Flash model**: ~10x cheaper than Pro
- **Batch generation**: Generate all suspects at once
- **Response caching**: Store AI responses in Redis
- **Image compression**: Use Sharp to reduce size 10x
