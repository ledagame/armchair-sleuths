# Robust Image Generation Architecture

**Problem:** Promise.race timeout not working in Devvit scheduler for 14-image generation (4 locations + 10 evidence)

**Current Situation:**
- 60-second timeout via `Promise.race` with `setTimeout`
- 2/14 images succeeded, 2 hung indefinitely
- Sequential batch processing (batches of 3) within Devvit
- Devvit scheduler environment has unreliable `setTimeout` behavior

**Root Cause:**
- Devvit serverless environment may not support standard `setTimeout`
- Background scheduler can be suspended/throttled
- No guarantee of continuous execution in Devvit context

---

## Solution: Hybrid Resilient Queue Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ DEVVIT SCHEDULER (Initiator Only)                              │
│                                                                 │
│ 1. generateCase()                                               │
│ 2. Create ImageGenerationJob in KV                             │
│ 3. Trigger Vercel Function (fire-and-forget)                   │
│ 4. Return immediately                                           │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ POST /api/generate-case-images
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ VERCEL SERVERLESS FUNCTION (Worker)                            │
│ Timeout: 5 minutes (Pro plan)                                  │
│                                                                 │
│ 1. Receive job: {caseId, evidence[], locations[]}              │
│ 2. Generate 14 images (parallel batches)                       │
│    - Evidence: Batch of 5 parallel                             │
│    - Locations: Batch of 4 parallel                            │
│    - Total: ~2 batches, ~60-90 seconds                         │
│ 3. Progressive updates to KV via webhook                       │
│ 4. Final webhook: completion status                            │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ POST /api/webhook/image-progress
             ▼
┌─────────────────────────────────────────────────────────────────┐
│ DEVVIT WEBHOOK RECEIVER (State Manager)                        │
│                                                                 │
│ 1. Update ImageGenerationJob in KV                             │
│ 2. Store completed images                                      │
│ 3. Track progress (completedCount/totalCount)                  │
│ 4. Client polls for updates                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### 1. Data Structures (KV Store)

#### ImageGenerationJob

```typescript
interface ImageGenerationJob {
  caseId: string;
  status: 'pending' | 'generating' | 'completed' | 'partial' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;

  // Image generation targets
  evidence: EvidenceItem[];        // 10 items
  locations: Location[];           // 4 items
  totalImages: 14;

  // Progress tracking
  completedImages: number;
  failedImages: number;

  // Results (populated progressively)
  evidenceImages: Record<string, string>;   // evidenceId → imageUrl
  locationImages: Record<string, string>;   // locationId → imageUrl
  failedIds: string[];

  // Error handling
  retryCount: number;
  lastError?: string;
}
```

**Storage Key:** `case:${caseId}:image-job`

### 2. Vercel Function Modification

**File:** `api/generate-case-images.ts` (NEW)

**Purpose:** Generate all 14 case images (evidence + locations)

**Input:**
```typescript
interface CaseImageGenerationRequest {
  caseId: string;
  evidence: EvidenceItem[];
  locations: Location[];
  webhookUrl: string;
}
```

**Output (Webhook):**
```typescript
interface ImageProgressUpdate {
  caseId: string;
  status: 'generating' | 'completed' | 'partial' | 'failed';
  completedImages: number;
  totalImages: number;
  evidenceImages: Record<string, string>;
  locationImages: Record<string, string>;
  failedIds: string[];
}
```

**Processing Strategy:**
```typescript
// Batch 1: Evidence images (5 parallel)
// Batch 2: Evidence images (5 parallel)
// Batch 3: Location images (4 parallel)
//
// Progressive webhooks after each batch
// Final webhook with completion status
```

**Timeout Handling:**
- Vercel 5-minute limit (enough for 14 images)
- Per-image timeout: 60 seconds (Gemini API)
- Use native `AbortController` with `signal`
- Fail gracefully, report partial success

### 3. Devvit Integration

#### A. Job Creation (CaseGeneratorService)

```typescript
async generateCase(options: GenerateCaseOptions): Promise<GeneratedCase> {
  // ... existing case generation ...

  // Create image generation job
  const imageJob: ImageGenerationJob = {
    caseId: savedCase.id,
    status: 'pending',
    createdAt: Date.now(),
    evidence: evidence,
    locations: locations,
    totalImages: evidence.length + locations.length,
    completedImages: 0,
    failedImages: 0,
    evidenceImages: {},
    locationImages: {},
    failedIds: [],
    retryCount: 0
  };

  // Store job in KV
  await KVStoreManager.put(
    `case:${savedCase.id}:image-job`,
    imageJob
  );

  // Trigger Vercel Function (fire-and-forget)
  this.triggerImageGeneration(savedCase.id, evidence, locations)
    .catch(error => {
      console.error('Failed to trigger image generation:', error);
      // Update job status to failed
      KVStoreManager.put(`case:${savedCase.id}:image-job`, {
        ...imageJob,
        status: 'failed',
        lastError: error.message
      });
    });

  return savedCase; // Return immediately
}
```

#### B. Webhook Receiver (server/index.ts)

```typescript
// POST /api/webhook/image-progress
async function handleImageProgress(req: Request): Promise<Response> {
  const payload: ImageProgressUpdate = await req.json();

  // Update job in KV
  const jobKey = `case:${payload.caseId}:image-job`;
  const job = await KVStoreManager.get<ImageGenerationJob>(jobKey);

  if (!job) {
    return new Response('Job not found', { status: 404 });
  }

  const updatedJob: ImageGenerationJob = {
    ...job,
    status: payload.status,
    completedImages: payload.completedImages,
    evidenceImages: payload.evidenceImages,
    locationImages: payload.locationImages,
    failedIds: payload.failedIds,
    completedAt: payload.status === 'completed' || payload.status === 'failed'
      ? Date.now()
      : undefined
  };

  await KVStoreManager.put(jobKey, updatedJob);

  // Also update legacy image status for backward compatibility
  await KVStoreManager.put(`case:${payload.caseId}:image-status`, {
    status: payload.status === 'completed' ? 'ready' : payload.status,
    completedAt: updatedJob.completedAt
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

#### C. Client Polling (Frontend)

```typescript
// Poll for image generation progress
async function pollImageProgress(caseId: string): Promise<ImageGenerationJob> {
  const jobKey = `case:${caseId}:image-job`;
  const job = await KVStoreManager.get<ImageGenerationJob>(jobKey);

  if (!job) {
    throw new Error('Image generation job not found');
  }

  return job;
}

// Usage in UI
const [imageProgress, setImageProgress] = useState<ImageGenerationJob | null>(null);

useEffect(() => {
  if (caseId) {
    const interval = setInterval(async () => {
      const job = await pollImageProgress(caseId);
      setImageProgress(job);

      if (job.status === 'completed' || job.status === 'failed') {
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }
}, [caseId]);
```

---

## Vercel Function Implementation

### File: `api/generate-case-images.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import sharp from 'sharp';

// 5-minute timeout (Vercel Pro)
export const config = {
  maxDuration: 300,
};

interface CaseImageGenerationRequest {
  caseId: string;
  evidence: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  locations: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  webhookUrl: string;
}

interface ImageProgressUpdate {
  caseId: string;
  status: 'generating' | 'completed' | 'partial' | 'failed';
  completedImages: number;
  totalImages: number;
  evidenceImages: Record<string, string>;
  locationImages: Record<string, string>;
  failedIds: string[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const startTime = Date.now();
  console.log('🎬 Case image generation started');

  try {
    const { caseId, evidence, locations, webhookUrl } =
      req.body as CaseImageGenerationRequest;

    // Validation
    if (!caseId || !webhookUrl) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const totalImages = evidence.length + locations.length;
    console.log(`📋 Case: ${caseId}`);
    console.log(`📋 Evidence: ${evidence.length}`);
    console.log(`📋 Locations: ${locations.length}`);
    console.log(`📋 Total: ${totalImages}`);

    const evidenceImages: Record<string, string> = {};
    const locationImages: Record<string, string> = {};
    const failedIds: string[] = [];
    let completedImages = 0;

    // Helper: Send progress webhook
    const sendProgress = async (status: ImageProgressUpdate['status']) => {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId,
            status,
            completedImages,
            totalImages,
            evidenceImages,
            locationImages,
            failedIds
          } as ImageProgressUpdate)
        });
        console.log(`📡 Progress webhook sent: ${completedImages}/${totalImages}`);
      } catch (error) {
        console.error('Failed to send progress webhook:', error);
      }
    };

    // Send initial webhook
    await sendProgress('generating');

    // BATCH 1: Evidence images (first 5)
    console.log('\n📦 Batch 1: Evidence images (1-5)...');
    const evidenceBatch1 = evidence.slice(0, 5);
    const evidenceResults1 = await Promise.allSettled(
      evidenceBatch1.map(item => generateEvidenceImage(item))
    );

    evidenceResults1.forEach((result, index) => {
      const item = evidenceBatch1[index];
      if (result.status === 'fulfilled') {
        evidenceImages[item.id] = result.value;
        completedImages++;
        console.log(`✅ ${item.id}`);
      } else {
        failedIds.push(item.id);
        console.error(`❌ ${item.id}:`, result.reason);
      }
    });

    await sendProgress('generating');

    // BATCH 2: Evidence images (last 5)
    console.log('\n📦 Batch 2: Evidence images (6-10)...');
    const evidenceBatch2 = evidence.slice(5, 10);
    const evidenceResults2 = await Promise.allSettled(
      evidenceBatch2.map(item => generateEvidenceImage(item))
    );

    evidenceResults2.forEach((result, index) => {
      const item = evidenceBatch2[index];
      if (result.status === 'fulfilled') {
        evidenceImages[item.id] = result.value;
        completedImages++;
        console.log(`✅ ${item.id}`);
      } else {
        failedIds.push(item.id);
        console.error(`❌ ${item.id}:`, result.reason);
      }
    });

    await sendProgress('generating');

    // BATCH 3: Location images (all 4)
    console.log('\n📦 Batch 3: Location images (all 4)...');
    const locationResults = await Promise.allSettled(
      locations.map(loc => generateLocationImage(loc))
    );

    locationResults.forEach((result, index) => {
      const loc = locations[index];
      if (result.status === 'fulfilled') {
        locationImages[loc.id] = result.value;
        completedImages++;
        console.log(`✅ ${loc.id}`);
      } else {
        failedIds.push(loc.id);
        console.error(`❌ ${loc.id}:`, result.reason);
      }
    });

    // Determine final status
    const finalStatus = completedImages === 0 ? 'failed'
      : completedImages < totalImages ? 'partial'
      : 'completed';

    await sendProgress(finalStatus);

    const duration = Date.now() - startTime;
    console.log(`\n✅ Generation complete: ${completedImages}/${totalImages} in ${duration}ms`);

    res.status(200).json({
      success: true,
      caseId,
      status: finalStatus,
      completedImages,
      totalImages,
      duration
    });

  } catch (error) {
    console.error('💥 Fatal error:', error);
    res.status(500).json({
      error: 'Image generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Generate evidence image with timeout and compression
async function generateEvidenceImage(item: {
  id: string;
  name: string;
  description: string;
}): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Evidence photography: ${item.name}. ${item.description}. Clear detail, forensic quality, neutral background.`;

  // AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        number_of_images: 1,
        aspect_ratio: '1:1',
        safety_filter_level: 'block_some'
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      throw new Error('No image data in response');
    }

    // Compress with Sharp
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const compressedBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Timeout: ${item.id} exceeded 60s`);
    }
    throw error;
  }
}

// Generate location image (similar to evidence)
async function generateLocationImage(location: {
  id: string;
  name: string;
  description: string;
}): Promise<string> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `Atmospheric environmental photography: ${location.name}. ${location.description}. Film noir aesthetic, dramatic lighting, moody atmosphere, empty location.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        prompt,
        number_of_images: 1,
        aspect_ratio: '1:1',
        safety_filter_level: 'block_some'
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

    if (!base64Image) {
      throw new Error('No image data in response');
    }

    const imageBuffer = Buffer.from(base64Image, 'base64');
    const compressedBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: 'cover' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Timeout: ${location.id} exceeded 60s`);
    }
    throw error;
  }
}
```

---

## Edge Cases & Error Handling

### 1. Partial Success
**Scenario:** 10/14 images generated, 4 failed

**Handling:**
- Mark job status as `partial`
- Store successful images in KV
- Log failed IDs for manual retry
- Frontend shows partial images with placeholders

### 2. Complete Failure
**Scenario:** All images timeout or fail

**Handling:**
- Mark job status as `failed`
- Store error details in job
- Retry mechanism (manual or automatic)
- Frontend shows error state with retry button

### 3. Webhook Failure
**Scenario:** Vercel generates images but webhook fails

**Handling:**
- Retry webhook 3 times with exponential backoff
- If all retries fail, log error but keep images
- Client polling will eventually detect no progress
- Manual recovery: Check Vercel logs, re-trigger webhook

### 4. Vercel Timeout
**Scenario:** 14 images take >5 minutes

**Handling:**
- Generate first 10 images (most important)
- Return partial success
- Queue remaining 4 for separate batch
- Frontend shows progressive loading

### 5. Devvit Crash During Trigger
**Scenario:** Scheduler crashes before Vercel call

**Handling:**
- Job remains in `pending` status in KV
- Separate cleanup job checks for stale `pending` jobs
- Retry stale jobs automatically
- Alert on stuck jobs >10 minutes old

---

## Performance Characteristics

### Time Estimates

**Optimistic (100% success):**
- Evidence Batch 1 (5 parallel): 15-20 seconds
- Evidence Batch 2 (5 parallel): 15-20 seconds
- Location Batch (4 parallel): 12-15 seconds
- **Total:** 42-55 seconds

**Realistic (90% success, some retries):**
- With Gemini retries: 60-90 seconds
- **Total:** 60-90 seconds

**Pessimistic (50% success, many failures):**
- Multiple retries, timeouts: 120-180 seconds
- **Total:** 2-3 minutes

### Resource Usage

**Vercel:**
- Function invocations: 1 per case
- Execution time: ~60-90 seconds
- Memory: ~256MB (Sharp compression)
- Cost: ~$0.03 per case (Pro plan)

**Gemini API:**
- 14 image requests per case
- Cost: 14 × $0.039 = $0.546 per case
- Rate limit: 60 requests/minute (safe within limits)

**Devvit KV:**
- Job storage: ~2KB per case
- Progress updates: ~5-10 updates per case
- Cost: Negligible

---

## Migration Strategy

### Phase 1: Setup (No Code Changes)
1. Deploy new Vercel function: `api/generate-case-images.ts`
2. Test with dummy data
3. Verify webhooks work

### Phase 2: Parallel Testing
1. Keep existing background generation
2. Add new queue-based generation
3. Compare results
4. Monitor success rates

### Phase 3: Cutover
1. Switch `CaseGeneratorService.generateCase()` to use queue
2. Remove old background generation
3. Update frontend to poll job status
4. Monitor production

### Phase 4: Cleanup
1. Remove old image generation services
2. Archive old code
3. Update documentation

---

## Monitoring & Observability

### Metrics to Track

1. **Success Rate:** `completedImages / totalImages`
2. **Generation Time:** `completedAt - createdAt`
3. **Failure Rate:** `failedImages / totalImages`
4. **Webhook Latency:** Time to receive webhook
5. **Stuck Jobs:** Jobs in `generating` for >10 minutes

### Logging Strategy

**Devvit:**
- Job creation: `console.log('Image job created:', caseId)`
- Vercel trigger: `console.log('Vercel triggered:', caseId)`
- Webhook received: `console.log('Webhook received:', caseId, status)`

**Vercel:**
- Batch start: `console.log('Batch N: X images')`
- Image success: `console.log('✅', imageId)`
- Image failure: `console.error('❌', imageId, error)`
- Final status: `console.log('Complete:', status, completedImages)`

### Alerts

1. **Failure rate >50%:** Investigate Gemini API issues
2. **Stuck jobs >10 min:** Check Vercel logs
3. **Webhook failures:** Check Devvit endpoint health

---

## Testing Plan

### Unit Tests

```typescript
// Test job creation
describe('ImageGenerationJob', () => {
  it('creates job with correct structure', () => {
    const job = createImageJob(caseId, evidence, locations);
    expect(job.totalImages).toBe(14);
    expect(job.status).toBe('pending');
  });
});

// Test webhook handling
describe('handleImageProgress', () => {
  it('updates job status correctly', async () => {
    const payload = { caseId, status: 'completed', ... };
    await handleImageProgress(payload);
    const job = await getImageJob(caseId);
    expect(job.status).toBe('completed');
  });
});
```

### Integration Tests

```typescript
// Test full flow
describe('Image Generation Flow', () => {
  it('generates all 14 images successfully', async () => {
    const caseId = await generateCase();
    const job = await pollUntilComplete(caseId, 120000); // 2 min timeout
    expect(job.completedImages).toBe(14);
    expect(job.status).toBe('completed');
  });

  it('handles partial failure gracefully', async () => {
    // Mock Gemini to fail 4 images
    mockGeminiFailures(['evidence-1', 'evidence-2', 'location-3', 'location-4']);
    const caseId = await generateCase();
    const job = await pollUntilComplete(caseId, 120000);
    expect(job.completedImages).toBe(10);
    expect(job.status).toBe('partial');
  });
});
```

### Load Tests

```bash
# Generate 10 cases simultaneously
for i in {1..10}; do
  curl -X POST https://your-devvit-app.com/api/generate-case &
done
wait

# Check success rates
curl https://your-devvit-app.com/api/metrics/image-generation
```

---

## Alternative Approaches (Considered but Rejected)

### 1. Full Parallel with Promise.allSettled
**Why Rejected:**
- Doesn't solve timeout issue in Devvit
- Would still hang if `setTimeout` doesn't work
- No progress tracking

### 2. Streaming/Chunked Approach
**Why Rejected:**
- Complex state management
- Multiple scheduler invocations unreliable
- Higher latency

### 3. Client-Side Generation
**Why Rejected:**
- Can't access Gemini API from Reddit client
- CORS issues
- Security concerns (API key exposure)

---

## Conclusion

**Recommended Solution:** Hybrid Queue + Vercel Worker

**Key Benefits:**
1. ✅ Reliable timeout handling (AbortController in Vercel)
2. ✅ Progress tracking (webhook updates)
3. ✅ Graceful degradation (partial success)
4. ✅ Separation of concerns (Devvit initiates, Vercel executes)
5. ✅ Production-ready (5-minute Vercel timeout, proven architecture)

**Trade-offs:**
1. ❌ Additional infrastructure (Vercel function)
2. ❌ Slightly higher latency (webhook roundtrip)
3. ❌ More complex than in-process generation
4. ✅ BUT: Much more reliable and maintainable

**Next Steps:**
1. Implement `api/generate-case-images.ts`
2. Add webhook receiver in Devvit
3. Modify `CaseGeneratorService` to use queue
4. Test with production data
5. Deploy and monitor
