/**
 * ImageStorageService.ts
 *
 * Manages image URL storage in KV store for evidence and location images.
 * Note: Gemini API returns hosted URLs, so no actual upload needed.
 */

import type { IStorageAdapter } from '../repositories/adapters/IStorageAdapter';
import type {
  EvidenceImageStatusResponse,
  LocationImageStatusResponse,
  ImageTypeStatus,
  ImageGenerationStatusResponse
} from '../../../shared/types';

export class ImageStorageService {
  constructor(private kvStore: IStorageAdapter) {
    console.log('🔧 ImageStorageService: Constructor called with kvStore:', kvStore ? 'EXISTS' : 'UNDEFINED');
    if (!kvStore) {
      throw new Error('ImageStorageService: kvStore is required but was undefined!');
    }
  }

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
      await this.kvStore.set(key, imageUrl);
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
    const url = await this.kvStore.get(key);
    return url || undefined;
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
      await this.kvStore.set(key, imageUrl);
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
    const url = await this.kvStore.get(key);
    return url || undefined;
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

  // ========== Status Management (Legacy - Evidence & Location Separately) ==========

  /**
   * Store evidence image generation status
   */
  async storeEvidenceImageStatus(
    caseId: string,
    status: EvidenceImageStatusResponse
  ): Promise<void> {
    const key = `case:${caseId}:imageStatus:evidence`;
    await this.kvStore.set(key, JSON.stringify(status));
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
    await this.kvStore.set(key, JSON.stringify(status));
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

  // ========== NEW: Unified Status Management (GAP-002) ==========

  /**
   * Initialize unified image generation status
   * Called when case generation starts
   */
  async initializeImageGenerationStatus(
    caseId: string,
    evidenceCount: number,
    locationCount: number
  ): Promise<void> {
    const now = new Date().toISOString();

    const status: ImageGenerationStatusResponse = {
      caseId,
      evidence: {
        status: 'pending',
        total: evidenceCount,
        completed: 0,
        failed: 0,
        startedAt: undefined,
        completedAt: undefined
      },
      location: {
        status: 'pending',
        total: locationCount,
        completed: 0,
        failed: 0,
        startedAt: undefined,
        completedAt: undefined
      },
      complete: false,
      lastUpdated: now
    };

    const key = `case:${caseId}:generation:status`;
    await this.kvStore.set(key, JSON.stringify(status), { ttl: 86400 }); // 24h TTL

    console.log(`📊 [ImageStatus] Initialized status for ${caseId}: ${evidenceCount} evidence, ${locationCount} locations`);
  }

  /**
   * Get unified image generation status
   * Returns null if status not found
   */
  async getImageGenerationStatus(
    caseId: string
  ): Promise<ImageGenerationStatusResponse | null> {
    const key = `case:${caseId}:generation:status`;
    const data = await this.kvStore.get(key);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Update image generation progress for a specific type
   * Automatically calculates status based on counts
   */
  async updateImageProgress(
    caseId: string,
    type: 'evidence' | 'location',
    completed: number,
    failed: number
  ): Promise<void> {
    const status = await this.getImageGenerationStatus(caseId);
    if (!status) {
      console.warn(`⚠️  [ImageStatus] Cannot update progress: status not found for ${caseId}`);
      return;
    }

    const typeStatus = status[type];
    const now = new Date().toISOString();

    // Update counts
    typeStatus.completed = completed;
    typeStatus.failed = failed;

    // Update status based on progress
    const totalProcessed = completed + failed;

    if (totalProcessed === 0) {
      typeStatus.status = 'pending';
    } else if (totalProcessed < typeStatus.total) {
      typeStatus.status = 'in_progress';
      if (!typeStatus.startedAt) {
        typeStatus.startedAt = now;
      }
    } else if (totalProcessed === typeStatus.total) {
      if (failed === 0) {
        typeStatus.status = 'complete';
      } else if (completed === 0) {
        typeStatus.status = 'failed';
      } else {
        typeStatus.status = 'complete'; // Partial success still counts as complete
      }
      typeStatus.completedAt = now;
    }

    // Update overall completion
    const evidenceComplete = status.evidence.status === 'complete' || status.evidence.status === 'failed';
    const locationComplete = status.location.status === 'complete' || status.location.status === 'failed';
    status.complete = evidenceComplete && locationComplete;
    status.lastUpdated = now;

    // Save updated status
    const key = `case:${caseId}:generation:status`;
    await this.kvStore.set(key, JSON.stringify(status), { ttl: 86400 });

    console.log(
      `📊 [ImageStatus] Updated ${type} progress for ${caseId}: ` +
      `${completed}/${typeStatus.total} completed, ${failed} failed ` +
      `(status: ${typeStatus.status})`
    );
  }

  /**
   * Mark image type as started
   * Sets startedAt timestamp and updates status to in_progress
   */
  async markImageTypeStarted(
    caseId: string,
    type: 'evidence' | 'location'
  ): Promise<void> {
    const status = await this.getImageGenerationStatus(caseId);
    if (!status) {
      console.warn(`⚠️  [ImageStatus] Cannot mark started: status not found for ${caseId}`);
      return;
    }

    const typeStatus = status[type];
    const now = new Date().toISOString();

    typeStatus.status = 'in_progress';
    typeStatus.startedAt = now;
    status.lastUpdated = now;

    const key = `case:${caseId}:generation:status`;
    await this.kvStore.set(key, JSON.stringify(status), { ttl: 86400 });

    console.log(`📊 [ImageStatus] Marked ${type} as started for ${caseId}`);
  }

  /**
   * Increment completed count for a specific image type
   * Helper method for generators to call after each successful image
   */
  async incrementCompleted(
    caseId: string,
    type: 'evidence' | 'location'
  ): Promise<void> {
    const status = await this.getImageGenerationStatus(caseId);
    if (!status) return;

    const typeStatus = status[type];
    await this.updateImageProgress(
      caseId,
      type,
      typeStatus.completed + 1,
      typeStatus.failed
    );
  }

  /**
   * Increment failed count for a specific image type
   * Helper method for generators to call after each failed image
   */
  async incrementFailed(
    caseId: string,
    type: 'evidence' | 'location'
  ): Promise<void> {
    const status = await this.getImageGenerationStatus(caseId);
    if (!status) return;

    const typeStatus = status[type];
    await this.updateImageProgress(
      caseId,
      type,
      typeStatus.completed,
      typeStatus.failed + 1
    );
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
    await this.kvStore.del(`case:${caseId}:imageStatus:evidence`);
    await this.kvStore.del(`case:${caseId}:imageStatus:location`);
    await this.kvStore.del(`case:${caseId}:generation:status`);
  }
}
