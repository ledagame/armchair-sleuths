# Phase 2: Evidence System Image Generation - Implementation Plan

**Status**: Ready for Implementation
**Priority**: High
**Estimated Time**: 6-8 hours
**Risk Level**: Low (follows proven patterns)

---

## 📋 Executive Summary

This plan implements **Phase 2: Image Generation Integration** for the Evidence System, adding background image generation for evidence items and locations using the proven pattern from cinematic intro images.

### Critical Requirements Met

✅ **No Timeouts**: Images generate in background after case creation
✅ **Progressive Loading**: Frontend displays images as they become available
✅ **Graceful Degradation**: Game playable even if image generation fails
✅ **API Rate Limiting**: 500ms delays between images prevent API throttling
✅ **Status Tracking**: Real-time progress updates via polling

---

## 🎯 Objectives

1. Generate high-quality images for evidence items and locations
2. Prevent case creation timeouts by using background generation
3. Provide progressive image loading in frontend
4. Maintain system stability with graceful error handling
5. Follow existing codebase patterns and conventions

---

## 🏗️ Architecture Overview

```
Case Generation Flow:
┌─────────────────────────────────────────────────────────────┐
│ CaseGeneratorService.generateCase()                          │
│ 1. Generate story/suspects/evidence/locations (sync)        │
│ 2. Save case with imageStatus = 'pending'                   │
│ 3. Return case immediately ← NO WAITING FOR IMAGES          │
│ 4. Start background image generation (async, fire-and-forget)│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Background Image Generation (Parallel)                       │
├─────────────────────────────────────────────────────────────┤
│ Evidence Images:              │ Location Images:             │
│ - Sort by difficulty          │ - Generate sequentially      │
│ - Generate in batches of 3    │ - 500ms delay between images │
│ - 500ms delay between images  │ - Update status after each   │
│ - Update status after batch   │                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ Frontend Polling (useEvidenceImages / useLocationImages)     │
│ - Poll status endpoints with exponential backoff             │
│ - Display images progressively as they complete              │
│ - Show fallback SVGs for failed images                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Files to Create/Modify

### New Backend Files (6)

1. `src/server/services/image/EvidenceImageGeneratorService.ts`
2. `src/server/services/image/LocationImageGeneratorService.ts`
3. `src/server/services/image/ImageStorageService.ts`
4. `src/server/api/routes/evidenceImageStatus.ts`
5. `src/server/api/routes/locationImageStatus.ts`
6. `src/server/types/imageTypes.ts`

### New Frontend Files (5)

1. `src/client/hooks/useEvidenceImages.ts`
2. `src/client/hooks/useLocationImages.ts`
3. `src/client/components/evidence/EvidenceImageCard.tsx`
4. `src/client/components/evidence/ImageLightbox.tsx`
5. `src/client/components/common/SkeletonLoader.tsx`

### Modified Files (2)

1. `src/server/services/case/CaseGeneratorService.ts` (add background generation)
2. `src/server/types/caseTypes.ts` (add image status fields)

**Total**: 13 files

---

## 🔧 Detailed Implementation

### Step 1: Type Definitions

**File**: `src/server/types/imageTypes.ts`

```typescript
/**
 * Image generation status types for evidence and location images
 */

export type ImageGenerationStatus = 'pending' | 'generating' | 'completed' | 'partial' | 'failed';

export interface EvidenceImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>; // evidenceId -> imageUrl
  currentBatch?: number;
  estimatedTimeRemaining?: number; // seconds
  lastUpdated: string; // ISO timestamp
}

export interface LocationImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>; // locationId -> imageUrl
  lastUpdated: string;
}

export interface ImageGenerationOptions {
  batchSize?: number; // Evidence batch size (default: 3)
  delayBetweenImages?: number; // Milliseconds (default: 500)
  maxRetries?: number; // Per image (default: 2)
}
```

**File**: `src/server/types/caseTypes.ts` (modify)

```typescript
// Add to existing CaseData interface:

export interface CaseData {
  // ... existing fields ...

  // NEW: Image generation status tracking
  evidenceImageStatus?: {
    status: ImageGenerationStatus;
    totalCount: number;
    completedCount: number;
    currentBatch?: number;
    lastUpdated: string;
  };

  locationImageStatus?: {
    status: ImageGenerationStatus;
    totalCount: number;
    completedCount: number;
    lastUpdated: string;
  };
}

// Add to EvidenceItem interface:
export interface EvidenceItem {
  // ... existing fields ...
  imageUrl?: string; // NEW: Generated image URL
}

// Add to Location interface:
export interface Location {
  // ... existing fields ...
  imageUrl?: string; // NEW: Generated image URL
}
```

---

### Step 2: Image Storage Service

**File**: `src/server/services/image/ImageStorageService.ts`

```typescript
import { RedditAPIClient } from '@devvit/public-api';

/**
 * ImageStorageService
 *
 * Manages image URL storage in Devvit KV store.
 * Note: Gemini API returns hosted URLs, so no actual upload needed.
 */
export class ImageStorageService {
  constructor(private kvStore: RedditAPIClient) {}

  // ========== Evidence Images ==========

  /**
   * Store evidence image URL in KV
   */
  async storeEvidenceImageUrl(
    caseId: string,
    evidenceId: string,
    imageUrl: string | undefined
  ): Promise<void> {
    const key = `case:${caseId}:evidence:${evidenceId}:image`;
    if (imageUrl) {
      await this.kvStore.put(key, imageUrl);
    }
  }

  /**
   * Get evidence image URL from KV
   */
  async getEvidenceImageUrl(
    caseId: string,
    evidenceId: string
  ): Promise<string | undefined> {
    const key = `case:${caseId}:evidence:${evidenceId}:image`;
    return await this.kvStore.get(key);
  }

  /**
   * Get all evidence image URLs for a case
   */
  async getAllEvidenceImageUrls(
    caseId: string,
    evidenceIds: string[]
  ): Promise<Record<string, string | undefined>> {
    const urls: Record<string, string | undefined> = {};

    await Promise.all(
      evidenceIds.map(async (id) => {
        urls[id] = await this.getEvidenceImageUrl(caseId, id);
      })
    );

    return urls;
  }

  // ========== Location Images ==========

  /**
   * Store location image URL in KV
   */
  async storeLocationImageUrl(
    caseId: string,
    locationId: string,
    imageUrl: string | undefined
  ): Promise<void> {
    const key = `case:${caseId}:location:${locationId}:image`;
    if (imageUrl) {
      await this.kvStore.put(key, imageUrl);
    }
  }

  /**
   * Get location image URL from KV
   */
  async getLocationImageUrl(
    caseId: string,
    locationId: string
  ): Promise<string | undefined> {
    const key = `case:${caseId}:location:${locationId}:image`;
    return await this.kvStore.get(key);
  }

  /**
   * Get all location image URLs for a case
   */
  async getAllLocationImageUrls(
    caseId: string,
    locationIds: string[]
  ): Promise<Record<string, string | undefined>> {
    const urls: Record<string, string | undefined> = {};

    await Promise.all(
      locationIds.map(async (id) => {
        urls[id] = await this.getLocationImageUrl(caseId, id);
      })
    );

    return urls;
  }

  // ========== Status Management ==========

  /**
   * Store evidence image generation status
   */
  async storeEvidenceImageStatus(
    caseId: string,
    status: EvidenceImageStatusResponse
  ): Promise<void> {
    const key = `case:${caseId}:imageStatus:evidence`;
    await this.kvStore.put(key, JSON.stringify(status));
  }

  /**
   * Get evidence image generation status
   */
  async getEvidenceImageStatus(
    caseId: string
  ): Promise<EvidenceImageStatusResponse | null> {
    const key = `case:${caseId}:imageStatus:evidence`;
    const data = await this.kvStore.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Store location image generation status
   */
  async storeLocationImageStatus(
    caseId: string,
    status: LocationImageStatusResponse
  ): Promise<void> {
    const key = `case:${caseId}:imageStatus:location`;
    await this.kvStore.put(key, JSON.stringify(status));
  }

  /**
   * Get location image generation status
   */
  async getLocationImageStatus(
    caseId: string
  ): Promise<LocationImageStatusResponse | null> {
    const key = `case:${caseId}:imageStatus:location`;
    const data = await this.kvStore.get(key);
    return data ? JSON.parse(data) : null;
  }

  // ========== Utilities ==========

  /**
   * Get fallback URL for failed image generation
   */
  getFallbackUrl(type: 'evidence' | 'location'): string {
    return `/placeholder-${type}.svg`;
  }

  /**
   * Cleanup status keys after completion (optional)
   */
  async cleanupStatusKeys(caseId: string): Promise<void> {
    await this.kvStore.delete(`case:${caseId}:imageStatus:evidence`);
    await this.kvStore.delete(`case:${caseId}:imageStatus:location`);
  }
}
```

---

### Step 3: Evidence Image Generator Service

**File**: `src/server/services/image/EvidenceImageGeneratorService.ts`

```typescript
import { ImageGenerator, ImageGenerationRequest } from '../generators/ImageGenerator';
import { ImageStorageService } from './ImageStorageService';
import { MultilingualEvidence, EvidenceItem } from '../../types/caseTypes';
import { EvidenceImageStatusResponse, ImageGenerationOptions } from '../../types/imageTypes';

/**
 * EvidenceImageGeneratorService
 *
 * Generates images for evidence items in background with progressive updates.
 * Uses batching and prioritization to optimize generation time.
 */
export class EvidenceImageGeneratorService {
  private readonly DEFAULT_BATCH_SIZE = 3;
  private readonly DEFAULT_DELAY = 500; // ms

  constructor(
    private imageGenerator: ImageGenerator,
    private storageService: ImageStorageService
  ) {}

  /**
   * Generate all evidence images for a case (background operation)
   */
  async generateEvidenceImages(
    caseId: string,
    evidence: MultilingualEvidence,
    options: ImageGenerationOptions = {}
  ): Promise<void> {
    const items = evidence.translations.ko.items;
    const batchSize = options.batchSize || this.DEFAULT_BATCH_SIZE;
    const delay = options.delayBetweenImages || this.DEFAULT_DELAY;

    console.log(`\n🖼️  ============================================`);
    console.log(`🖼️  Evidence Image Generation Started`);
    console.log(`🖼️  Case: ${caseId}`);
    console.log(`🖼️  Total Evidence: ${items.length}`);
    console.log(`🖼️  Batch Size: ${batchSize}`);
    console.log(`🖼️  ============================================\n`);

    // Initialize status
    await this.updateStatus(caseId, {
      status: 'generating',
      totalCount: items.length,
      completedCount: 0,
      currentBatch: 1,
      images: {},
      lastUpdated: new Date().toISOString()
    });

    // Sort by difficulty (easy → medium → hard)
    // This ensures most discoverable evidence has images first
    const sortedItems = this.sortByDifficulty(items);

    // Split into batches
    const batches = this.createBatches(sortedItems, batchSize);

    let completedCount = 0;
    const images: Record<string, string | undefined> = {};

    // Process each batch sequentially
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const batchNumber = batchIndex + 1;

      console.log(`\n📦 Processing Evidence Batch ${batchNumber}/${batches.length}`);
      console.log(`   Items: ${batch.map(e => e.id).join(', ')}`);

      // Update current batch
      await this.updateStatus(caseId, {
        status: 'generating',
        totalCount: items.length,
        completedCount,
        currentBatch: batchNumber,
        images,
        lastUpdated: new Date().toISOString()
      });

      // Generate each image in batch sequentially
      for (let itemIndex = 0; itemIndex < batch.length; itemIndex++) {
        const item = batch[itemIndex];

        try {
          console.log(`   🖼️  Generating image for: ${item.id} (${item.name})`);

          const imageRequest = this.createImageRequest(item);
          const result = await this.imageGenerator.generateSingle(imageRequest);

          if (result.success && result.imageUrl) {
            // Store image URL
            await this.storageService.storeEvidenceImageUrl(caseId, item.id, result.imageUrl);
            images[item.id] = result.imageUrl;
            completedCount++;
            console.log(`      ✅ Success: ${item.id}`);
          } else {
            images[item.id] = undefined; // Mark as failed
            console.warn(`      ⚠️  Failed: ${item.id} - ${result.error}`);
          }
        } catch (error) {
          images[item.id] = undefined;
          console.error(`      ❌ Error: ${item.id}`, error);
        }

        // Rate limit delay (except last in batch)
        if (itemIndex < batch.length - 1) {
          await this.sleep(delay);
        }
      }

      // Update progress after batch
      await this.updateStatus(caseId, {
        status: 'generating',
        totalCount: items.length,
        completedCount,
        currentBatch: batchNumber,
        images,
        lastUpdated: new Date().toISOString()
      });

      console.log(`   ✅ Batch ${batchNumber} complete: ${batch.length} images`);
    }

    // Determine final status
    const finalStatus = completedCount === 0 ? 'failed'
      : completedCount < items.length ? 'partial'
      : 'completed';

    await this.updateStatus(caseId, {
      status: finalStatus,
      totalCount: items.length,
      completedCount,
      images,
      lastUpdated: new Date().toISOString()
    });

    console.log(`\n✅ ============================================`);
    console.log(`✅ Evidence Image Generation Complete`);
    console.log(`✅ Status: ${finalStatus.toUpperCase()}`);
    console.log(`✅ Success: ${completedCount}/${items.length} (${Math.round(completedCount / items.length * 100)}%)`);
    console.log(`✅ ============================================\n`);
  }

  /**
   * Sort evidence by difficulty (easy first)
   */
  private sortByDifficulty(items: EvidenceItem[]): EvidenceItem[] {
    const difficultyOrder: Record<string, number> = {
      'easy': 0,
      'medium': 1,
      'hard': 2
    };

    return [...items].sort((a, b) => {
      const orderA = difficultyOrder[a.difficulty] ?? 999;
      const orderB = difficultyOrder[b.difficulty] ?? 999;
      return orderA - orderB;
    });
  }

  /**
   * Split items into batches
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Create image generation request for evidence item
   */
  private createImageRequest(item: EvidenceItem): ImageGenerationRequest {
    return this.imageGenerator.generateEvidenceImageRequest(item);
  }

  /**
   * Update evidence image status in KV store
   */
  private async updateStatus(
    caseId: string,
    status: Partial<EvidenceImageStatusResponse>
  ): Promise<void> {
    const currentStatus = await this.storageService.getEvidenceImageStatus(caseId);
    const updatedStatus: EvidenceImageStatusResponse = {
      ...currentStatus,
      ...status,
      lastUpdated: new Date().toISOString()
    } as EvidenceImageStatusResponse;

    await this.storageService.storeEvidenceImageStatus(caseId, updatedStatus);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

### Step 4: Location Image Generator Service

**File**: `src/server/services/image/LocationImageGeneratorService.ts`

```typescript
import { ImageGenerator, ImageGenerationRequest } from '../generators/ImageGenerator';
import { ImageStorageService } from './ImageStorageService';
import { MultilingualLocation, Location } from '../../types/caseTypes';
import { LocationImageStatusResponse, ImageGenerationOptions } from '../../types/imageTypes';

/**
 * LocationImageGeneratorService
 *
 * Generates images for locations in background with sequential processing.
 * Simpler than evidence generation (no batching, no prioritization).
 */
export class LocationImageGeneratorService {
  private readonly DEFAULT_DELAY = 500; // ms

  constructor(
    private imageGenerator: ImageGenerator,
    private storageService: ImageStorageService
  ) {}

  /**
   * Generate all location images for a case (background operation)
   */
  async generateLocationImages(
    caseId: string,
    locations: MultilingualLocation,
    options: ImageGenerationOptions = {}
  ): Promise<void> {
    const locationList = locations.translations.ko.locations;
    const delay = options.delayBetweenImages || this.DEFAULT_DELAY;

    console.log(`\n🗺️  ============================================`);
    console.log(`🗺️  Location Image Generation Started`);
    console.log(`🗺️  Case: ${caseId}`);
    console.log(`🗺️  Total Locations: ${locationList.length}`);
    console.log(`🗺️  ============================================\n`);

    // Initialize status
    await this.updateStatus(caseId, {
      status: 'generating',
      totalCount: locationList.length,
      completedCount: 0,
      images: {},
      lastUpdated: new Date().toISOString()
    });

    let completedCount = 0;
    const images: Record<string, string | undefined> = {};

    // Generate sequentially (like CinematicImageService)
    for (let i = 0; i < locationList.length; i++) {
      const location = locationList[i];

      try {
        console.log(`🗺️  Generating image ${i + 1}/${locationList.length}: ${location.id} (${location.name})`);

        const imageRequest = this.createImageRequest(location);
        const result = await this.imageGenerator.generateSingle(imageRequest);

        if (result.success && result.imageUrl) {
          await this.storageService.storeLocationImageUrl(caseId, location.id, result.imageUrl);
          images[location.id] = result.imageUrl;
          completedCount++;
          console.log(`   ✅ Success: ${location.id}`);
        } else {
          images[location.id] = undefined;
          console.warn(`   ⚠️  Failed: ${location.id} - ${result.error}`);
        }
      } catch (error) {
        images[location.id] = undefined;
        console.error(`   ❌ Error: ${location.id}`, error);
      }

      // Rate limit delay (except last)
      if (i < locationList.length - 1) {
        await this.sleep(delay);
      }

      // Update progress after each image
      await this.updateStatus(caseId, {
        status: 'generating',
        totalCount: locationList.length,
        completedCount,
        images,
        lastUpdated: new Date().toISOString()
      });
    }

    // Determine final status
    const finalStatus = completedCount === 0 ? 'failed'
      : completedCount < locationList.length ? 'partial'
      : 'completed';

    await this.updateStatus(caseId, {
      status: finalStatus,
      totalCount: locationList.length,
      completedCount,
      images,
      lastUpdated: new Date().toISOString()
    });

    console.log(`\n✅ ============================================`);
    console.log(`✅ Location Image Generation Complete`);
    console.log(`✅ Status: ${finalStatus.toUpperCase()}`);
    console.log(`✅ Success: ${completedCount}/${locationList.length} (${Math.round(completedCount / locationList.length * 100)}%)`);
    console.log(`✅ ============================================\n`);
  }

  /**
   * Create image generation request for location
   */
  private createImageRequest(location: Location): ImageGenerationRequest {
    return this.imageGenerator.generateLocationImageRequest(location);
  }

  /**
   * Update location image status in KV store
   */
  private async updateStatus(
    caseId: string,
    status: Partial<LocationImageStatusResponse>
  ): Promise<void> {
    const currentStatus = await this.storageService.getLocationImageStatus(caseId);
    const updatedStatus: LocationImageStatusResponse = {
      ...currentStatus,
      ...status,
      lastUpdated: new Date().toISOString()
    } as LocationImageStatusResponse;

    await this.storageService.storeLocationImageStatus(caseId, updatedStatus);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

---

### Step 5: API Endpoints

**File**: `src/server/api/routes/evidenceImageStatus.ts`

```typescript
import { Context } from '@devvit/public-api';
import { ImageStorageService } from '../../services/image/ImageStorageService';
import { EvidenceImageStatusResponse } from '../../types/imageTypes';

/**
 * GET /api/cases/:caseId/evidence-images/status
 *
 * Returns current status of evidence image generation for a case.
 * Frontend polls this endpoint with exponential backoff.
 */
export async function getEvidenceImageStatus(
  context: Context,
  caseId: string
): Promise<EvidenceImageStatusResponse> {
  const storageService = new ImageStorageService(context.redis);

  // Get status from KV store
  const status = await storageService.getEvidenceImageStatus(caseId);

  if (!status) {
    // No status found - return default pending state
    return {
      status: 'pending',
      totalCount: 0,
      completedCount: 0,
      images: {},
      lastUpdated: new Date().toISOString()
    };
  }

  return status;
}
```

**File**: `src/server/api/routes/locationImageStatus.ts`

```typescript
import { Context } from '@devvit/public-api';
import { ImageStorageService } from '../../services/image/ImageStorageService';
import { LocationImageStatusResponse } from '../../types/imageTypes';

/**
 * GET /api/cases/:caseId/location-images/status
 *
 * Returns current status of location image generation for a case.
 * Frontend polls this endpoint with exponential backoff.
 */
export async function getLocationImageStatus(
  context: Context,
  caseId: string
): Promise<LocationImageStatusResponse> {
  const storageService = new ImageStorageService(context.redis);

  // Get status from KV store
  const status = await storageService.getLocationImageStatus(caseId);

  if (!status) {
    // No status found - return default pending state
    return {
      status: 'pending',
      totalCount: 0,
      completedCount: 0,
      images: {},
      lastUpdated: new Date().toISOString()
    };
  }

  return status;
}
```

---

### Step 6: Frontend Hooks

**File**: `src/client/hooks/useEvidenceImages.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import { ImageGenerationStatus } from '../../server/types/imageTypes';

interface UseEvidenceImagesReturn {
  status: ImageGenerationStatus;
  images: Record<string, string | undefined>;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for polling evidence image generation status
 *
 * Uses exponential backoff: 1s, 2s, 3s, 5s (max)
 * Automatically stops polling when terminal state reached
 */
export function useEvidenceImages(caseId: string): UseEvidenceImagesReturn {
  const [status, setStatus] = useState<ImageGenerationStatus>('pending');
  const [images, setImages] = useState<Record<string, string | undefined>>({});
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const pollCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!caseId) return;

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();

    const getPollingInterval = (): number => {
      const count = pollCountRef.current;
      if (count === 0) return 1000; // First poll: 1 second
      if (count === 1) return 2000; // Second poll: 2 seconds
      if (count === 2) return 3000; // Third poll: 3 seconds
      return 5000; // Subsequent polls: 5 seconds (max)
    };

    const pollImageStatus = async () => {
      try {
        const response = await fetch(
          `/api/cases/${caseId}/evidence-images/status`,
          { signal: abortControllerRef.current?.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch image status: ${response.status}`);
        }

        const data = await response.json();

        setStatus(data.status);
        setImages(data.images);
        setProgress({
          completed: data.completedCount,
          total: data.totalCount,
          percentage: data.totalCount > 0
            ? Math.round((data.completedCount / data.totalCount) * 100)
            : 0
        });
        setIsLoading(false);

        // Stop polling if terminal state reached
        const terminalStates: ImageGenerationStatus[] = ['completed', 'partial', 'failed'];
        if (terminalStates.includes(data.status)) {
          console.log(`Evidence image generation ${data.status}: ${data.completedCount}/${data.totalCount}`);
          return;
        }

        // Schedule next poll with backoff
        pollCountRef.current++;
        timeoutRef.current = setTimeout(pollImageStatus, getPollingInterval());
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // Component unmounted, ignore
          return;
        }
        console.error('Error polling evidence image status:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    // Start polling
    pollImageStatus();

    // Cleanup
    return () => {
      abortControllerRef.current?.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [caseId]);

  return {
    status,
    images,
    progress,
    isLoading,
    error
  };
}
```

**File**: `src/client/hooks/useLocationImages.ts`

```typescript
import { useState, useEffect, useRef } from 'react';
import { ImageGenerationStatus } from '../../server/types/imageTypes';

interface UseLocationImagesReturn {
  status: ImageGenerationStatus;
  images: Record<string, string | undefined>;
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook for polling location image generation status
 *
 * Similar to useEvidenceImages but for location images
 */
export function useLocationImages(caseId: string): UseLocationImagesReturn {
  const [status, setStatus] = useState<ImageGenerationStatus>('pending');
  const [images, setImages] = useState<Record<string, string | undefined>>({});
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const pollCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController>();

  useEffect(() => {
    if (!caseId) return;

    abortControllerRef.current = new AbortController();

    const getPollingInterval = (): number => {
      const count = pollCountRef.current;
      if (count === 0) return 1000;
      if (count === 1) return 2000;
      if (count === 2) return 3000;
      return 5000;
    };

    const pollImageStatus = async () => {
      try {
        const response = await fetch(
          `/api/cases/${caseId}/location-images/status`,
          { signal: abortControllerRef.current?.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch image status: ${response.status}`);
        }

        const data = await response.json();

        setStatus(data.status);
        setImages(data.images);
        setProgress({
          completed: data.completedCount,
          total: data.totalCount,
          percentage: data.totalCount > 0
            ? Math.round((data.completedCount / data.totalCount) * 100)
            : 0
        });
        setIsLoading(false);

        const terminalStates: ImageGenerationStatus[] = ['completed', 'partial', 'failed'];
        if (terminalStates.includes(data.status)) {
          console.log(`Location image generation ${data.status}: ${data.completedCount}/${data.totalCount}`);
          return;
        }

        pollCountRef.current++;
        timeoutRef.current = setTimeout(pollImageStatus, getPollingInterval());
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        console.error('Error polling location image status:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    pollImageStatus();

    return () => {
      abortControllerRef.current?.abort();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [caseId]);

  return {
    status,
    images,
    progress,
    isLoading,
    error
  };
}
```

---

### Step 7: Frontend Components

**File**: `src/client/components/evidence/EvidenceImageCard.tsx`

```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EvidenceItem } from '../../../server/types/caseTypes';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { ImageLightbox } from './ImageLightbox';

interface EvidenceImageCardProps {
  evidence: EvidenceItem;
  imageUrl?: string;
  imageStatus: 'loading' | 'loaded' | 'error';
  onClick?: () => void;
}

/**
 * Evidence image card with progressive loading
 *
 * States:
 * - loading: Shows skeleton loader
 * - loaded: Shows actual image with hover effects
 * - error: Shows fallback SVG gradient
 */
export function EvidenceImageCard({
  evidence,
  imageUrl,
  imageStatus,
  onClick
}: EvidenceImageCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleClick = () => {
    if (imageStatus === 'loaded' && imageUrl) {
      setIsLightboxOpen(true);
    }
    onClick?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="evidence-image-card"
        onClick={handleClick}
        style={{
          cursor: imageStatus === 'loaded' ? 'pointer' : 'default',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '1 / 1',
          background: '#1a1a1a'
        }}
      >
        {/* Loading State */}
        {imageStatus === 'loading' && (
          <SkeletonLoader />
        )}

        {/* Loaded State */}
        {imageStatus === 'loaded' && imageUrl && (
          <motion.img
            src={imageUrl}
            alt={evidence.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            whileHover={{ scale: 1.05 }}
          />
        )}

        {/* Error State (Fallback SVG) */}
        {imageStatus === 'error' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div>{evidence.name}</div>
            </div>
          </div>
        )}

        {/* Evidence Name Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {evidence.name}
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      {isLightboxOpen && imageUrl && (
        <ImageLightbox
          imageUrl={imageUrl}
          evidenceName={evidence.name}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
```

**File**: `src/client/components/evidence/ImageLightbox.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  imageUrl: string;
  evidenceName: string;
  onClose: () => void;
}

/**
 * Full-screen image lightbox with zoom and pan
 *
 * Features:
 * - Click outside to close
 * - Zoom in/out buttons
 * - Drag to pan when zoomed
 * - Escape key to close
 */
export function ImageLightbox({
  imageUrl,
  evidenceName,
  onClose
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
      >
        {/* Image */}
        <motion.img
          src={imageUrl}
          alt={evidenceName}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale, opacity: 1 }}
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
          drag={scale > 1}
          dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '12px 20px',
            borderRadius: '24px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              opacity: scale <= 0.5 ? 0.5 : 1
            }}
          >
            −
          </button>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              opacity: scale >= 3 ? 0.5 : 1
            }}
          >
            +
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Image Name */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '24px',
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {evidenceName}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

**File**: `src/client/components/common/SkeletonLoader.tsx`

```typescript
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Skeleton loader for image loading states
 */
export function SkeletonLoader() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#2a2a2a',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
        }}
      />
    </div>
  );
}
```

---

### Step 8: Integration with CaseGeneratorService

**File**: `src/server/services/case/CaseGeneratorService.ts` (modify)

Add these imports at the top:

```typescript
import { EvidenceImageGeneratorService } from '../image/EvidenceImageGeneratorService';
import { LocationImageGeneratorService } from '../image/LocationImageGeneratorService';
import { ImageStorageService } from '../image/ImageStorageService';
```

Modify the constructor to include new services:

```typescript
constructor(
  private geminiClient: GeminiClient,
  private imageGenerator: ImageGenerator,
  // NEW services:
  private evidenceImageGenerator: EvidenceImageGeneratorService,
  private locationImageGenerator: LocationImageGeneratorService,
  private imageStorageService: ImageStorageService,
  // ... existing parameters
) {}
```

Modify the `generateCase()` method (add at the end, before return):

```typescript
async generateCase(options: GenerateCaseOptions = {}): Promise<GeneratedCase> {
  // ... existing case generation logic ...

  // Step 5: Save case with image status = pending
  const savedCase = await this.saveCaseWithTransaction(
    caseStory,
    elements,
    suspectsWithImages,
    imageUrl,
    introNarration,
    date,
    customCaseId,
    locations,
    evidence,
    {
      // NEW: Initialize image generation status
      evidenceImageStatus: {
        status: 'pending',
        totalCount: evidence.translations.ko.items.length,
        completedCount: 0,
        lastUpdated: new Date().toISOString()
      },
      locationImageStatus: {
        status: 'pending',
        totalCount: locations.translations.ko.locations.length,
        completedCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  );

  console.log(`✅ Case generated successfully (images will generate in background)`);

  // Step 6: Start background image generation (NO AWAIT - fire and forget)
  this.startBackgroundImageGeneration(savedCase.id, evidence, locations)
    .catch(error => {
      console.error(`Background image generation failed for case ${savedCase.id}:`, error);
      // Don't throw - case already saved and returned
    });

  return savedCase; // ← Return immediately, don't wait for images
}
```

Add new private method:

```typescript
/**
 * Start background image generation (async, non-blocking)
 *
 * CRITICAL: This method is fire-and-forget to prevent case creation timeouts.
 * Images generate in background while frontend polls for status.
 */
private async startBackgroundImageGeneration(
  caseId: string,
  evidence: MultilingualEvidence,
  locations: MultilingualLocation
): Promise<void> {
  console.log(`\n🖼️  ============================================`);
  console.log(`🖼️  Background Image Generation Started`);
  console.log(`🖼️  Case ID: ${caseId}`);
  console.log(`🖼️  Evidence Items: ${evidence.translations.ko.items.length}`);
  console.log(`🖼️  Locations: ${locations.translations.ko.locations.length}`);
  console.log(`🖼️  ============================================\n`);

  // Generate evidence and location images in parallel
  // Both are fire-and-forget with their own error handling
  Promise.all([
    this.evidenceImageGenerator.generateEvidenceImages(caseId, evidence)
      .catch(error => {
        console.error(`Evidence image generation failed for case ${caseId}:`, error);
        // Update status to failed
        this.imageStorageService.storeEvidenceImageStatus(caseId, {
          status: 'failed',
          totalCount: evidence.translations.ko.items.length,
          completedCount: 0,
          images: {},
          lastUpdated: new Date().toISOString()
        });
      }),

    this.locationImageGenerator.generateLocationImages(caseId, locations)
      .catch(error => {
        console.error(`Location image generation failed for case ${caseId}:`, error);
        // Update status to failed
        this.imageStorageService.storeLocationImageStatus(caseId, {
          status: 'failed',
          totalCount: locations.translations.ko.locations.length,
          completedCount: 0,
          images: {},
          lastUpdated: new Date().toISOString()
        });
      })
  ]).then(() => {
    console.log(`\n✅ All background image generation complete for case ${caseId}\n`);
  });
}
```

---

## 🧪 Testing Strategy

### Unit Tests

1. **ImageStorageService Tests**
   - Test URL storage and retrieval
   - Test status updates
   - Test fallback URL generation

2. **EvidenceImageGeneratorService Tests**
   - Test batch generation logic
   - Test difficulty sorting
   - Test error handling (individual failures don't stop batch)
   - Test status updates at each stage

3. **LocationImageGeneratorService Tests**
   - Test sequential generation
   - Test rate limiting (500ms delays)
   - Test status updates

### Integration Tests

1. **End-to-End Case Generation**
   - Create case
   - Verify case returns immediately (<30s)
   - Poll image status endpoints
   - Verify images generate in background
   - Verify frontend receives progressive updates

2. **Error Scenarios**
   - Single image generation failure (should continue with others)
   - Complete image generation failure (case still playable)
   - API timeout (should not affect case creation)
   - Network interruption during polling (should resume)

### Manual Testing Checklist

- [ ] Create new case - verify returns within 30 seconds
- [ ] Open evidence board - verify skeleton loaders appear
- [ ] Wait for images - verify progressive loading
- [ ] Check all evidence images - verify fallback for failures
- [ ] Check all location images - verify proper display
- [ ] Click evidence image - verify lightbox opens
- [ ] Test zoom/pan in lightbox - verify smooth interaction
- [ ] Test with slow network - verify polling works correctly
- [ ] Test case with 15 evidence items - verify no timeout
- [ ] Close game during image generation - verify no errors

---

## 📊 Performance Metrics

### Expected Timings

| Operation | Time | Notes |
|-----------|------|-------|
| Case Generation | 15-25s | Unchanged from current |
| Single Evidence Image | 8-12s | Gemini API call |
| Evidence Batch (3 items) | ~30s | 3 × 10s + 2 × 0.5s delays |
| All Evidence (15 items) | ~150s | 5 batches × 30s |
| Single Location Image | 8-12s | Gemini API call |
| All Locations (8 items) | ~84s | 8 × 10s + 7 × 0.5s delays |
| **Total Background Time** | ~150s | Max (evidence, locations) running parallel |

### Resource Usage

- **KV Store Keys per Case**:
  - 1 case data key
  - 2 image status keys (evidence + location)
  - N evidence image keys (1 per evidence item)
  - M location image keys (1 per location)
  - **Total**: ~20-30 keys per case

- **API Calls per Case**:
  - Evidence images: 5-15 calls
  - Location images: 3-8 calls
  - Status updates: ~20-40 calls (during generation)
  - Frontend polls: 10-20 calls (until completion)
  - **Total**: ~40-80 API calls per case

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing complete
- [ ] Code review approved
- [ ] Performance metrics validated

### Deployment Steps

1. **Backend Deployment**
   - [ ] Deploy type definitions (`imageTypes.ts`, `caseTypes.ts`)
   - [ ] Deploy storage service (`ImageStorageService.ts`)
   - [ ] Deploy generator services (Evidence + Location)
   - [ ] Deploy API routes (status endpoints)
   - [ ] Update `CaseGeneratorService.ts`

2. **Frontend Deployment**
   - [ ] Deploy hooks (`useEvidenceImages.ts`, `useLocationImages.ts`)
   - [ ] Deploy components (ImageCard, Lightbox, SkeletonLoader)
   - [ ] Update Evidence Board component to use hooks

3. **Database Migration**
   - [ ] No schema migration needed (using KV store)
   - [ ] Verify KV store has sufficient capacity

### Post-Deployment

- [ ] Monitor case generation times (should remain <30s)
- [ ] Monitor image generation success rates
- [ ] Monitor API error rates
- [ ] Check frontend polling behavior
- [ ] Verify no timeout errors in logs

### Rollback Plan

If issues occur:
1. Remove background generation call from `CaseGeneratorService`
2. Cases will generate without images (graceful degradation)
3. Frontend will show fallback SVGs
4. Game remains fully playable

---

## 🔒 Timeout Prevention Validation

### Scenario 1: Case Creation Timeout

**Risk**: Case generation takes >30s and times out

**Prevention**:
- ✅ Images generate AFTER case save and response
- ✅ `generateCase()` returns immediately
- ✅ Background generation is fire-and-forget
- ✅ No await on image generation

**Validation**: Case generation time unchanged (~15-25s)

### Scenario 2: Image Generation Failures Cascade

**Risk**: Image generation errors break case creation

**Prevention**:
- ✅ Try-catch at every generation level
- ✅ Individual failures don't stop batch
- ✅ Status tracking allows partial completion
- ✅ Frontend handles undefined image URLs

**Validation**: Game playable even with 0% image success

### Scenario 3: Frontend Hangs Waiting for Images

**Risk**: Frontend blocks waiting for images that never complete

**Prevention**:
- ✅ Polling with exponential backoff (max 5s)
- ✅ AbortController cleanup on unmount
- ✅ Terminal status detection stops polling
- ✅ Skeleton loaders show progress state

**Validation**: Frontend remains responsive during generation

### Scenario 4: API Rate Limiting

**Risk**: Too many concurrent image requests trigger rate limits

**Prevention**:
- ✅ Sequential generation with 500ms delays
- ✅ Evidence batch size limited to 3
- ✅ No parallel image generation within batch
- ✅ Proven pattern from cinematic images

**Validation**: API rate limits respected (no throttling errors)

---

## 📝 Implementation Priority Order

### Phase 1: Core Infrastructure (2-3 hours)
1. Create type definitions
2. Implement ImageStorageService
3. Implement EvidenceImageGeneratorService
4. Implement LocationImageGeneratorService

### Phase 2: API Layer (1 hour)
5. Create status API endpoints
6. Wire up routing

### Phase 3: Frontend Hooks (1-2 hours)
7. Implement useEvidenceImages
8. Implement useLocationImages
9. Create SkeletonLoader component

### Phase 4: Frontend Components (1-2 hours)
10. Implement EvidenceImageCard
11. Implement ImageLightbox
12. Integrate into Evidence Board

### Phase 5: Integration (1 hour)
13. Update CaseGeneratorService
14. Add background generation call
15. Test end-to-end flow

### Phase 6: Testing & Validation (1-2 hours)
16. Unit tests
17. Integration tests
18. Manual testing
19. Performance validation

---

## ✅ Success Criteria

1. **No Timeouts**: Case generation completes in <30s (100% of cases)
2. **Image Generation**: >80% success rate for image generation
3. **Progressive Loading**: Images appear progressively in frontend
4. **Graceful Degradation**: Game playable with 0% image success
5. **No Errors**: No unhandled errors in console or logs
6. **Performance**: Background generation <3 minutes for full case
7. **User Experience**: Smooth loading states, no UI blocking

---

## 🎯 Next Steps After Phase 2

Once Phase 2 is complete and validated:

1. **Phase 3**: Advanced Evidence Discovery Mechanics
2. **Phase 4**: Evidence Chain Analysis System
3. **Phase 5**: Forensic Analysis Mini-Games
4. **Phase 6**: Evidence Contradiction Detection

---

## 📚 References

- EVIDENCE_SYSTEM_PHASES.md (original specification)
- CinematicImageService.ts (proven background generation pattern)
- useCinematicImages.ts (polling hook pattern)
- CaseGeneratorService.ts (integration example)
- ImageGenerator.ts (batch generation with retries)

---

**Plan Created**: 2025-10-21
**Plan Status**: ✅ Ready for Implementation
**Estimated Completion**: 6-8 hours
**Risk Assessment**: 🟢 Low Risk (proven patterns)
