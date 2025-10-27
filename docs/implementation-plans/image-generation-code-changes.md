# Image Generation Architecture - Code Changes Required

**Problem:** 14 images (4 locations + 10 evidence) hang indefinitely in Devvit scheduler due to unreliable `setTimeout`

**Solution:** Offload to Vercel serverless function with robust timeout handling

---

## File Structure

```
api/
  generate-case-images.ts          # NEW - Vercel function for 14 images
  generate-all-images.ts           # EXISTING - Keep for suspects/cinematic

src/server/
  services/
    case/
      CaseGeneratorService.ts      # MODIFY - Remove background generation
    image/
      ImageGenerationJobManager.ts # NEW - Job queue management

src/shared/types/
  ImageGeneration.ts               # NEW - Job types

server/index.ts                    # MODIFY - Add webhook receiver
```

---

## 1. NEW: Vercel Function (`api/generate-case-images.ts`)

**Purpose:** Generate 14 images (10 evidence + 4 locations) with reliable timeout

**Key Features:**
- AbortController for 60-second per-image timeout
- 3 parallel batches (5+5+4)
- Progressive webhook updates
- Graceful partial success

**See:** `docs/implementation-plans/robust-image-generation-architecture.md` for full implementation

---

## 2. NEW: Job Manager (`src/server/services/image/ImageGenerationJobManager.ts`)

```typescript
import { KVStoreManager } from '../repositories/kv/KVStoreManager';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { Location } from '@/shared/types/Discovery';

export interface ImageGenerationJob {
  caseId: string;
  status: 'pending' | 'generating' | 'completed' | 'partial' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;

  // Targets
  evidence: EvidenceItem[];
  locations: Location[];
  totalImages: number;

  // Progress
  completedImages: number;
  failedImages: number;

  // Results
  evidenceImages: Record<string, string>;   // evidenceId → imageUrl
  locationImages: Record<string, string>;   // locationId → imageUrl
  failedIds: string[];

  // Error handling
  retryCount: number;
  lastError?: string;
}

export class ImageGenerationJobManager {
  /**
   * Create a new image generation job
   */
  static async createJob(
    caseId: string,
    evidence: EvidenceItem[],
    locations: Location[]
  ): Promise<ImageGenerationJob> {
    const job: ImageGenerationJob = {
      caseId,
      status: 'pending',
      createdAt: Date.now(),
      evidence,
      locations,
      totalImages: evidence.length + locations.length,
      completedImages: 0,
      failedImages: 0,
      evidenceImages: {},
      locationImages: {},
      failedIds: [],
      retryCount: 0
    };

    await KVStoreManager.put(`case:${caseId}:image-job`, job);
    console.log(`📋 Image job created for case ${caseId}: ${job.totalImages} images`);

    return job;
  }

  /**
   * Get job status
   */
  static async getJob(caseId: string): Promise<ImageGenerationJob | null> {
    return await KVStoreManager.get<ImageGenerationJob>(`case:${caseId}:image-job`);
  }

  /**
   * Update job with progress
   */
  static async updateJob(
    caseId: string,
    updates: Partial<ImageGenerationJob>
  ): Promise<void> {
    const job = await this.getJob(caseId);
    if (!job) {
      throw new Error(`Job not found for case ${caseId}`);
    }

    const updatedJob = { ...job, ...updates };
    await KVStoreManager.put(`case:${caseId}:image-job`, updatedJob);
  }

  /**
   * Trigger Vercel function to generate images
   */
  static async triggerGeneration(
    caseId: string,
    evidence: EvidenceItem[],
    locations: Location[],
    vercelUrl: string,
    webhookUrl: string
  ): Promise<void> {
    console.log(`🚀 Triggering Vercel image generation for case ${caseId}`);
    console.log(`   - Evidence: ${evidence.length}`);
    console.log(`   - Locations: ${locations.length}`);
    console.log(`   - Webhook: ${webhookUrl}`);

    const response = await fetch(`${vercelUrl}/generate-case-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId,
        evidence: evidence.map(e => ({
          id: e.id,
          name: e.name,
          description: e.description
        })),
        locations: locations.map(l => ({
          id: l.id,
          name: l.name,
          description: l.description
        })),
        webhookUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Vercel trigger failed (${response.status}): ${errorText}`);
    }

    console.log(`✅ Vercel function triggered successfully`);
  }

  /**
   * Handle progress webhook from Vercel
   */
  static async handleProgressWebhook(payload: {
    caseId: string;
    status: ImageGenerationJob['status'];
    completedImages: number;
    totalImages: number;
    evidenceImages: Record<string, string>;
    locationImages: Record<string, string>;
    failedIds: string[];
  }): Promise<void> {
    console.log(`📡 Progress webhook received for case ${payload.caseId}`);
    console.log(`   Status: ${payload.status}`);
    console.log(`   Progress: ${payload.completedImages}/${payload.totalImages}`);

    await this.updateJob(payload.caseId, {
      status: payload.status,
      completedImages: payload.completedImages,
      evidenceImages: payload.evidenceImages,
      locationImages: payload.locationImages,
      failedIds: payload.failedIds,
      completedAt: payload.status === 'completed' || payload.status === 'failed'
        ? Date.now()
        : undefined
    });

    // Update legacy image status for backward compatibility
    await KVStoreManager.put(`case:${payload.caseId}:image-status`, {
      status: payload.status === 'completed' ? 'ready' : payload.status,
      completedAt: payload.status === 'completed' || payload.status === 'failed'
        ? Date.now()
        : undefined
    });

    console.log(`✅ Job updated successfully`);
  }

  /**
   * Check for stale jobs and retry
   */
  static async retryStaleJobs(maxAgeMs: number = 600000): Promise<void> {
    // TODO: Implement job cleanup
    // 1. List all jobs with status 'pending' or 'generating'
    // 2. Check if createdAt > maxAgeMs ago
    // 3. Retry or mark as failed
  }
}
```

---

## 3. MODIFY: CaseGeneratorService (`src/server/services/case/CaseGeneratorService.ts`)

**Changes:**

### A. Remove Old Background Generation

```typescript
// REMOVE these lines (around line 340-355):
// const imageGenerationPromise = this.startBackgroundImageGeneration(
//   savedCase.id,
//   evidence,
//   locations,
//   guiltyIndex
// );
// (globalThis as any).__imageGenerationPromises.set(savedCase.id, imageGenerationPromise);
```

### B. Add New Queue-Based Generation

```typescript
// REPLACE with this (around line 338):

// 6.8. Queue-based image generation via Vercel (non-blocking)
console.log(`🎨 Queueing image generation for case ${savedCase.id}...`);

// Create job
await ImageGenerationJobManager.createJob(
  savedCase.id,
  evidence,
  locations
);

// Trigger Vercel function (fire-and-forget)
if (vercelImageFunctionUrl && devvitBaseUrl) {
  const webhookUrl = `${devvitBaseUrl}/api/webhook/image-progress`;

  ImageGenerationJobManager.triggerGeneration(
    savedCase.id,
    evidence,
    locations,
    vercelImageFunctionUrl,
    webhookUrl
  )
  .then(() => {
    console.log(`✅ Image generation triggered successfully`);
  })
  .catch((error) => {
    console.error(`❌ Failed to trigger image generation:`, error);
    // Update job status to failed
    ImageGenerationJobManager.updateJob(savedCase.id, {
      status: 'failed',
      lastError: error.message
    }).catch(err => console.error('Failed to update job status:', err));
  });
} else {
  console.warn(`⚠️  Vercel configuration missing, skipping image generation`);
  await ImageGenerationJobManager.updateJob(savedCase.id, {
    status: 'failed',
    lastError: 'Vercel configuration not provided'
  });
}
```

### C. Add Import

```typescript
import { ImageGenerationJobManager } from '../image/ImageGenerationJobManager';
```

### D. Keep Method for Reference (Optional)

```typescript
// OPTIONAL: Keep this method but don't call it
// Useful for local development/testing
/**
 * @deprecated Use ImageGenerationJobManager instead
 * @see ImageGenerationJobManager.triggerGeneration
 */
private startBackgroundImageGeneration(
  caseId: string,
  evidence: EvidenceItem[],
  locations: DiscoveryLocation[],
  guiltyIndex: number
): Promise<void> {
  // ... existing implementation ...
  // Mark as deprecated but keep for fallback
}
```

---

## 4. MODIFY: Server Index (`src/server/index.ts`)

**Add Webhook Route:**

```typescript
import { ImageGenerationJobManager } from './services/image/ImageGenerationJobManager';

// Add this route handler (around line 200-300, with other routes)
Devvit.addCustomPostType({
  name: 'ArmchairSleuths',
  height: 'tall',
  render: (context) => {
    return (
      <vstack>
        {/* ... existing UI ... */}
      </vstack>
    );
  }
});

// ADD NEW ROUTE:
/**
 * Webhook receiver for image generation progress
 * Called by Vercel function after each batch
 */
app.post('/api/webhook/image-progress', async (req, res) => {
  try {
    const payload = await req.json();
    console.log(`📡 Image progress webhook received:`, payload);

    await ImageGenerationJobManager.handleProgressWebhook(payload);

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

**Note:** Exact route registration depends on your Devvit setup. Adjust as needed.

---

## 5. NEW: Type Definitions (`src/shared/types/ImageGeneration.ts`)

```typescript
export interface ImageGenerationJob {
  caseId: string;
  status: 'pending' | 'generating' | 'completed' | 'partial' | 'failed';
  createdAt: number;
  startedAt?: number;
  completedAt?: number;

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

  totalImages: number;
  completedImages: number;
  failedImages: number;

  evidenceImages: Record<string, string>;
  locationImages: Record<string, string>;
  failedIds: string[];

  retryCount: number;
  lastError?: string;
}

export interface ImageProgressWebhook {
  caseId: string;
  status: ImageGenerationJob['status'];
  completedImages: number;
  totalImages: number;
  evidenceImages: Record<string, string>;
  locationImages: Record<string, string>;
  failedIds: string[];
}
```

---

## 6. OPTIONAL: Frontend Polling (if needed)

**File:** `src/client/hooks/useImageGenerationProgress.ts`

```typescript
import { useState, useEffect } from 'react';
import type { ImageGenerationJob } from '@/shared/types/ImageGeneration';

export function useImageGenerationProgress(caseId: string | null) {
  const [job, setJob] = useState<ImageGenerationJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caseId) return;

    let interval: NodeJS.Timeout;

    const poll = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/image-job/${caseId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch job: ${response.status}`);
        }

        const jobData: ImageGenerationJob = await response.json();
        setJob(jobData);
        setError(null);

        // Stop polling if complete or failed
        if (jobData.status === 'completed' || jobData.status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    // Initial poll
    poll();

    // Poll every 2 seconds
    interval = setInterval(poll, 2000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [caseId]);

  return { job, loading, error };
}
```

---

## 7. Deployment Checklist

### Environment Variables (Vercel)

```bash
GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variables (Devvit Settings)

```typescript
// In Devvit Developer Portal
VERCEL_IMAGE_FUNCTION_URL=https://your-vercel-app.vercel.app/api
DEVVIT_BASE_URL=https://your-devvit-app.reddit.com
```

### Deployment Steps

1. **Deploy Vercel Function**
   ```bash
   cd api/
   vercel deploy --prod
   ```

2. **Update Devvit Settings**
   - Go to Devvit Developer Portal
   - Add `VERCEL_IMAGE_FUNCTION_URL`
   - Add `DEVVIT_BASE_URL`

3. **Deploy Devvit App**
   ```bash
   npm run build
   devvit upload
   ```

4. **Test with Force Generation**
   ```bash
   # Call force generation endpoint
   curl -X POST https://your-devvit-app.com/api/generate-case-force
   ```

5. **Monitor Logs**
   - Vercel logs: `vercel logs --follow`
   - Devvit logs: Check developer portal

---

## 8. Testing Strategy

### Unit Tests

```typescript
// Test job creation
describe('ImageGenerationJobManager', () => {
  it('creates job with correct structure', async () => {
    const job = await ImageGenerationJobManager.createJob(
      'test-case',
      mockEvidence,
      mockLocations
    );

    expect(job.totalImages).toBe(14);
    expect(job.status).toBe('pending');
  });

  it('handles progress webhook correctly', async () => {
    await ImageGenerationJobManager.handleProgressWebhook({
      caseId: 'test-case',
      status: 'completed',
      completedImages: 14,
      totalImages: 14,
      evidenceImages: {},
      locationImages: {},
      failedIds: []
    });

    const job = await ImageGenerationJobManager.getJob('test-case');
    expect(job?.status).toBe('completed');
  });
});
```

### Integration Tests

```typescript
// Test full flow
describe('Image Generation Flow', () => {
  it('generates 14 images successfully', async () => {
    const caseData = await generateCase();

    // Poll for completion
    let job: ImageGenerationJob | null = null;
    for (let i = 0; i < 60; i++) { // 2 minutes
      job = await ImageGenerationJobManager.getJob(caseData.id);
      if (job?.status === 'completed' || job?.status === 'failed') {
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    expect(job?.status).toBe('completed');
    expect(job?.completedImages).toBe(14);
  });
});
```

---

## 9. Rollback Plan

If the new architecture fails:

1. **Revert CaseGeneratorService Changes**
   ```bash
   git revert <commit-hash>
   ```

2. **Re-enable Old Background Generation**
   - Uncomment `startBackgroundImageGeneration` call
   - Remove `ImageGenerationJobManager` calls

3. **Keep Vercel Function**
   - Can be used for manual retry
   - Doesn't interfere with old code

---

## 10. Monitoring & Alerts

### Key Metrics

1. **Job Success Rate**
   ```typescript
   const successRate = completedImages / totalImages;
   // Alert if < 0.9 (90%)
   ```

2. **Average Generation Time**
   ```typescript
   const avgTime = (completedAt - createdAt) / 1000; // seconds
   // Alert if > 120 seconds (2 minutes)
   ```

3. **Stuck Jobs**
   ```typescript
   const stuckJobs = await getJobsOlderThan(600000); // 10 minutes
   // Alert if > 0
   ```

### Logging

**Console logs to monitor:**
- `📋 Image job created`
- `🚀 Triggering Vercel`
- `📡 Progress webhook received`
- `✅ Job updated successfully`
- `❌ Failed to trigger image generation`

---

## Summary

**Files to Create:**
1. `api/generate-case-images.ts` - Vercel function
2. `src/server/services/image/ImageGenerationJobManager.ts` - Job manager
3. `src/shared/types/ImageGeneration.ts` - Type definitions

**Files to Modify:**
1. `src/server/services/case/CaseGeneratorService.ts` - Remove old generation
2. `src/server/index.ts` - Add webhook route

**Configuration:**
1. Vercel: `GEMINI_API_KEY`
2. Devvit: `VERCEL_IMAGE_FUNCTION_URL`, `DEVVIT_BASE_URL`

**Testing:**
1. Unit tests for job manager
2. Integration test for full flow
3. Load test with 10 concurrent cases

**Time Estimate:**
- Implementation: 4-6 hours
- Testing: 2-3 hours
- Deployment & monitoring: 1-2 hours
- **Total: 7-11 hours**
