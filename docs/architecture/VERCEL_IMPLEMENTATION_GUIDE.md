# Vercel Blob Upload Implementation Guide
## Quick Start for Image Persistence

**Timeline**: 1-2 days
**Difficulty**: Medium
**Cost**: Free (1GB Blob storage included)

---

## Prerequisites

- [ ] Vercel account with project deployed
- [ ] Vercel Blob storage enabled
- [ ] `BLOB_READ_WRITE_TOKEN` environment variable
- [ ] `vercelImageFunctionUrl` configured in Devvit app settings

---

## Step 1: Create Vercel Upload Endpoint

### 1.1 Install Dependencies

```bash
cd your-vercel-project
npm install @vercel/blob
```

### 1.2 Create `/api/upload-image.ts`

```typescript
/**
 * Vercel Edge Function: Upload Image to Blob Storage
 *
 * Receives Gemini temporary URL, downloads image, uploads to Vercel Blob,
 * returns permanent URL.
 */

import { put } from '@vercel/blob';

export const config = {
  runtime: 'edge',
  maxDuration: 60 // Edge functions can run up to 60s
};

interface UploadRequest {
  imageUrl: string;      // Gemini temporary URL
  filename: string;       // e.g., "case-123/evidence/ev-001.jpg"
  caseId: string;         // For organization
  type: 'evidence' | 'location' | 'suspect' | 'cinematic';
}

interface UploadResponse {
  success: boolean;
  url?: string;          // Permanent Vercel Blob URL
  size?: number;
  uploadedAt?: string;
  error?: string;
}

export default async function handler(req: Request): Promise<Response> {
  // Only allow POST
  if (req.method !== 'POST') {
    return Response.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }

  try {
    const body: UploadRequest = await req.json();
    const { imageUrl, filename, caseId, type } = body;

    // Validate input
    if (!imageUrl || !filename || !caseId || !type) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log(`[Upload] Starting: ${filename} from ${imageUrl}`);

    // 1. Download image from Gemini URL
    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(30000) // 30s timeout
    });

    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }

    const imageBlob = await imageResponse.blob();
    console.log(`[Upload] Downloaded: ${imageBlob.size} bytes`);

    // 2. Upload to Vercel Blob
    const blob = await put(filename, imageBlob, {
      access: 'public',
      addRandomSuffix: false, // Keep exact filename
      cacheControlMaxAge: 31536000, // Cache for 1 year
      contentType: imageBlob.type || 'image/jpeg'
    });

    console.log(`[Upload] Success: ${blob.url}`);

    // 3. Return permanent URL
    const response: UploadResponse = {
      success: true,
      url: blob.url,
      size: blob.size,
      uploadedAt: blob.uploadedAt.toISOString()
    };

    return Response.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=31536000'
      }
    });

  } catch (error) {
    console.error('[Upload] Error:', error);

    const errorResponse: UploadResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };

    return Response.json(errorResponse, { status: 500 });
  }
}
```

### 1.3 Configure Environment Variables

```bash
# In Vercel Dashboard → Project → Settings → Environment Variables
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx

# Or via CLI:
vercel env add BLOB_READ_WRITE_TOKEN
```

### 1.4 Deploy

```bash
vercel --prod
```

Your endpoint will be available at:
```
https://your-project.vercel.app/api/upload-image
```

---

## Step 2: Update Devvit ImageStorageService

### 2.1 Add Upload Method to `ImageStorageService.ts`

```typescript
// Add this import at the top
import { settings } from '@devvit/web/server';

export class ImageStorageService {
  constructor(private kvStore: IStorageAdapter) {
    // ... existing constructor
  }

  /**
   * Convert Gemini temporary URL to permanent Vercel Blob URL
   *
   * @param geminiUrl - Temporary Gemini URL (expires in 24-48h)
   * @param caseId - Case identifier
   * @param imageId - Image identifier (evidence/location/suspect ID)
   * @param type - Image type for organization
   * @returns Permanent Vercel Blob URL
   */
  async convertToPermanentUrl(
    geminiUrl: string,
    caseId: string,
    imageId: string,
    type: 'evidence' | 'location' | 'suspect' | 'cinematic'
  ): Promise<string> {
    // Get Vercel function URL from settings
    const vercelFunctionUrl = await settings.get<string>('vercelImageFunctionUrl');

    if (!vercelFunctionUrl) {
      console.warn('⚠️  VERCEL_IMAGE_FUNCTION_URL not configured, using temporary URL');
      return geminiUrl; // Graceful degradation
    }

    const maxRetries = 3;
    const retryDelay = 2000; // 2s

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 [Attempt ${attempt}/${maxRetries}] Uploading: ${imageId}`);

        const response = await fetch(`${vercelFunctionUrl}/api/upload-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrl: geminiUrl,
            filename: `${caseId}/${type}/${imageId}.jpg`,
            caseId,
            type
          }),
          signal: AbortSignal.timeout(45000) // 45s timeout
        });

        if (!response.ok) {
          // Retry on 5xx errors
          if (response.status >= 500 && attempt < maxRetries) {
            console.warn(`⚠️  Server error ${response.status}, retrying...`);
            await this.sleep(retryDelay * attempt);
            continue;
          }

          throw new Error(`Upload failed with status ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.url) {
          throw new Error(result.error || 'Upload failed without URL');
        }

        console.log(`✅ Permanent URL: ${result.url}`);
        return result.url;

      } catch (error) {
        console.error(`❌ Upload attempt ${attempt} failed:`, error);

        // Last attempt failed - return temporary URL as fallback
        if (attempt === maxRetries) {
          console.error('All upload attempts exhausted, using temporary URL');
          return geminiUrl;
        }

        // Wait before retry
        await this.sleep(retryDelay * attempt);
      }
    }

    // Should never reach here, but TypeScript needs it
    return geminiUrl;
  }

  /**
   * Batch convert multiple URLs to permanent storage
   *
   * @param images - Array of image metadata
   * @param concurrency - Max parallel uploads (default: 5)
   * @returns Array of permanent URLs
   */
  async convertBatchToPermanentUrls(
    images: Array<{
      geminiUrl: string;
      caseId: string;
      imageId: string;
      type: 'evidence' | 'location' | 'suspect' | 'cinematic';
    }>,
    concurrency: number = 5
  ): Promise<string[]> {
    const results: string[] = [];

    console.log(`\n📦 Batch Upload Started: ${images.length} images`);
    console.log(`   Concurrency: ${concurrency} parallel uploads`);

    // Process in batches
    for (let i = 0; i < images.length; i += concurrency) {
      const batch = images.slice(i, i + concurrency);
      const batchNumber = Math.floor(i / concurrency) + 1;
      const totalBatches = Math.ceil(images.length / concurrency);

      console.log(`\n📦 Batch ${batchNumber}/${totalBatches}: ${batch.length} images`);

      // Upload batch in parallel
      const urls = await Promise.all(
        batch.map(img =>
          this.convertToPermanentUrl(
            img.geminiUrl,
            img.caseId,
            img.imageId,
            img.type
          )
        )
      );

      results.push(...urls);

      console.log(`✅ Batch ${batchNumber} complete: ${urls.length} uploaded`);

      // Rate limit protection: wait 1s between batches
      if (i + concurrency < images.length) {
        await this.sleep(1000);
      }
    }

    console.log(`\n✅ Batch Upload Complete: ${results.length}/${images.length} successful\n`);

    return results;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ... rest of existing methods
}
```

---

## Step 3: Update Image Generation Services

### 3.1 Update `EvidenceImageGeneratorService.ts`

```typescript
// Find the section where images are generated and stored
// (Around line 90 in your current code)

// BEFORE:
if (result.success && result.imageUrl) {
  await this.storageService.storeEvidenceImageUrl(caseId, item.id, result.imageUrl);
  images[item.id] = result.imageUrl;
  completedCount++;
  console.log(`   ✅ Success: ${item.id}`);
}

// AFTER:
if (result.success && result.imageUrl) {
  // Convert temporary Gemini URL to permanent Vercel Blob URL
  const permanentUrl = await this.storageService.convertToPermanentUrl(
    result.imageUrl,
    caseId,
    item.id,
    'evidence'
  );

  await this.storageService.storeEvidenceImageUrl(caseId, item.id, permanentUrl);
  images[item.id] = permanentUrl;
  completedCount++;
  console.log(`   ✅ Success: ${item.id}`);
}
```

### 3.2 Update `LocationImageGeneratorService.ts`

```typescript
// Find the section where location images are stored
// (Around line 60 in your current code)

// BEFORE:
if (result.success && result.imageUrl) {
  await this.storageService.storeLocationImageUrl(caseId, location.id, result.imageUrl);
  images[location.id] = result.imageUrl;
  completedCount++;
  console.log(`   ✅ Success: ${location.id}`);
}

// AFTER:
if (result.success && result.imageUrl) {
  // Convert temporary Gemini URL to permanent Vercel Blob URL
  const permanentUrl = await this.storageService.convertToPermanentUrl(
    result.imageUrl,
    caseId,
    location.id,
    'location'
  );

  await this.storageService.storeLocationImageUrl(caseId, location.id, permanentUrl);
  images[location.id] = permanentUrl;
  completedCount++;
  console.log(`   ✅ Success: ${location.id}`);
}
```

### 3.3 Update `CinematicImageService.ts`

```typescript
// Find where cinematic images are generated
// Add upload step after generation

async generateCinematicImages(
  caseId: string,
  victim: any,
  location: any,
  suspects: any[]
): Promise<CinematicImages> {
  const images: CinematicImages = {};

  // Generate establishing scene
  const establishingUrl = await this.generateEstablishingScene(...);
  if (establishingUrl) {
    // NEW: Upload to permanent storage
    images.establishing = await this.imageStorageService.convertToPermanentUrl(
      establishingUrl,
      caseId,
      'establishing',
      'cinematic'
    );
  }

  // Repeat for other scenes...

  return images;
}
```

---

## Step 4: Optional Optimization - Batch Upload

For even faster processing, use the batch method:

```typescript
// In CaseGeneratorService.ts, after all images are generated:

async generateCase(options: GenerateCaseOptions): Promise<GeneratedCase> {
  // ... existing case generation code ...

  // Collect all images for batch upload
  const imagesToUpload: Array<{
    geminiUrl: string;
    caseId: string;
    imageId: string;
    type: 'evidence' | 'location' | 'suspect' | 'cinematic';
  }> = [];

  // Add evidence images
  evidence.forEach(ev => {
    if (ev.imageUrl) {
      imagesToUpload.push({
        geminiUrl: ev.imageUrl,
        caseId: newCase.id,
        imageId: ev.id,
        type: 'evidence'
      });
    }
  });

  // Add location images
  locations.forEach(loc => {
    if (loc.imageUrl) {
      imagesToUpload.push({
        geminiUrl: loc.imageUrl,
        caseId: newCase.id,
        imageId: loc.id,
        type: 'location'
      });
    }
  });

  // Batch upload all images (5 at a time)
  const permanentUrls = await imageStorageService.convertBatchToPermanentUrls(
    imagesToUpload,
    5 // Concurrency
  );

  // Update case data with permanent URLs
  // ... map permanent URLs back to evidence/locations ...

  return newCase;
}
```

---

## Step 5: Testing

### 5.1 Local Testing (Vercel Dev Server)

```bash
cd your-vercel-project
vercel dev

# Test upload endpoint:
curl -X POST http://localhost:3000/api/upload-image \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://generativelanguage.googleapis.com/v1beta/files/...",
    "filename": "test/evidence/ev-001.jpg",
    "caseId": "test-case-001",
    "type": "evidence"
  }'
```

Expected response:
```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/test/evidence/ev-001-xyz123.jpg",
  "size": 125840,
  "uploadedAt": "2025-10-21T12:00:00.000Z"
}
```

### 5.2 Devvit Playtest

```bash
devvit playtest armchair_sleuths_dev

# In browser console, check logs:
# - Look for "📤 Uploading: ..." messages
# - Verify "✅ Permanent URL: https://blob.vercel-storage.com/..."
# - Check images load correctly
```

### 5.3 Production Test

```bash
# Create a test case via menu
# Monitor Vercel logs: https://vercel.com/your-project/logs

# Check uploaded images in Vercel Blob:
# https://vercel.com/your-project/storage
```

---

## Step 6: Monitoring & Debugging

### 6.1 Vercel Dashboard

1. Go to: https://vercel.com/your-project/storage
2. View all uploaded blobs
3. Check storage usage
4. Monitor upload frequency

### 6.2 Add Logging Endpoint (Optional)

```typescript
// /api/upload-stats.ts
import { list } from '@vercel/blob';

export default async function handler(req: Request) {
  const { blobs } = await list();

  const stats = {
    totalBlobs: blobs.length,
    totalSize: blobs.reduce((sum, b) => sum + b.size, 0),
    byType: blobs.reduce((acc, b) => {
      const type = b.pathname.split('/')[1]; // Extract type from path
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return Response.json(stats);
}
```

Access at: `https://your-project.vercel.app/api/upload-stats`

### 6.3 Error Tracking

Add to Vercel function:

```typescript
import * as Sentry from '@sentry/nextjs'; // Optional

export default async function handler(req: Request) {
  try {
    // ... upload logic ...
  } catch (error) {
    // Log to Sentry (optional)
    Sentry.captureException(error);

    // Always log to console (shows in Vercel logs)
    console.error('[Upload] Error:', {
      error: error.message,
      stack: error.stack,
      url: req.url
    });

    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

---

## Step 7: Cost Management

### 7.1 Vercel Blob Pricing

**Free Tier (Hobby Plan)**:
- Storage: 1GB
- Bandwidth: 100GB/month
- Writes: Unlimited

**Pro Plan** ($20/month base + usage):
- Storage: $0.15/GB/month
- Bandwidth: $0.10/GB
- Writes: Free

### 7.2 Cost Calculator

```typescript
// For your use case:
const imagesPerCase = 14;
const avgImageSize = 150; // KB
const casesPerMonth = 30;

const storagePerMonth = (imagesPerCase * avgImageSize * casesPerMonth) / 1024; // MB
const storageInGB = storagePerMonth / 1024;

console.log(`Monthly storage needed: ${storageInGB.toFixed(2)} GB`);
// Result: ~0.06 GB (well under 1GB free tier)

const users = 100;
const casesPerUser = 5;
const bandwidth = (users * casesPerUser * imagesPerCase * avgImageSize) / 1024 / 1024; // GB

console.log(`Monthly bandwidth: ${bandwidth.toFixed(2)} GB`);
// Result: ~1.05 GB (under 100GB free tier)
```

**Conclusion**: You'll stay on free tier for months

### 7.3 Set Up Billing Alerts

1. Go to Vercel Dashboard → Settings → Billing
2. Set spending limit: $5/month
3. Enable email notifications

---

## Step 8: Advanced Features (Future)

### 8.1 Image Optimization

```typescript
// Add compression to Vercel function
import sharp from 'sharp';

const optimizedBuffer = await sharp(await imageBlob.arrayBuffer())
  .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
  .jpeg({ quality: 85, progressive: true, mozjpeg: true })
  .toBuffer();

const blob = await put(filename, optimizedBuffer, { ... });
```

**Benefit**: Reduces storage by 60-80%

### 8.2 Lazy Deletion

```typescript
// Clean up old case images after 30 days
import { del } from '@vercel/blob';

export async function cleanupOldImages() {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const { blobs } = await list();

  for (const blob of blobs) {
    if (new Date(blob.uploadedAt).getTime() < thirtyDaysAgo) {
      await del(blob.url);
      console.log(`Deleted old image: ${blob.pathname}`);
    }
  }
}
```

### 8.3 CDN Purging

```typescript
// Force CDN cache refresh after image update
await put(filename, imageBlob, {
  access: 'public',
  cacheControlMaxAge: 0 // Force immediate refresh
});
```

---

## Troubleshooting

### Issue: "BLOB_READ_WRITE_TOKEN is not defined"

**Solution**: Set environment variable in Vercel dashboard

```bash
vercel env add BLOB_READ_WRITE_TOKEN
# Paste token from: https://vercel.com/account/tokens
```

### Issue: "Failed to download image: 404"

**Cause**: Gemini URL expired before upload

**Solution**: Reduce delay between generation and upload

```typescript
// Generate and upload immediately (don't batch generation)
const result = await imageGenerator.generateSingle(request);
const permanentUrl = await storageService.convertToPermanentUrl(result.imageUrl, ...);
```

### Issue: "Upload timeout after 60s"

**Cause**: Network too slow or image too large

**Solution**: Increase timeout or compress image

```typescript
// In Vercel function config:
export const config = {
  runtime: 'edge',
  maxDuration: 300 // 5 minutes (max for Edge)
};
```

### Issue: "All upload attempts failed, using temporary URL"

**Cause**: Vercel function down or network issues

**Solution**: App gracefully degrades to temporary URLs. Check Vercel status:
https://www.vercel-status.com/

---

## Quick Reference

### Key Files Modified

```
your-vercel-project/
  └── api/
      └── upload-image.ts        (NEW)

armchair-sleuths/
  └── src/
      └── server/
          └── services/
              └── image/
                  └── ImageStorageService.ts           (UPDATED)
              └── EvidenceImageGeneratorService.ts     (UPDATED)
              └── LocationImageGeneratorService.ts     (UPDATED)
              └── CinematicImageService.ts             (UPDATED)
```

### Environment Variables

```bash
# Vercel
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx

# Devvit App Settings
vercelImageFunctionUrl=https://your-project.vercel.app
```

### Key Commands

```bash
# Deploy Vercel function
vercel --prod

# Test locally
vercel dev

# View logs
vercel logs

# Check storage usage
vercel blob list
```

---

## Success Metrics

After implementation, verify:

- [ ] Images persist beyond 24-48 hours
- [ ] Upload success rate > 99%
- [ ] Total upload time < 60s for 14 images
- [ ] Client load time < 3s for all images
- [ ] Vercel storage usage < 1GB
- [ ] No errors in Vercel logs
- [ ] Mobile app displays images correctly
- [ ] Old cases still playable with images

---

**Implementation Time**: 4-6 hours
**Complexity**: Medium
**Impact**: High - Solves image persistence completely

Ready to start implementing? Let me know if you need any clarification!
