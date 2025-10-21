/**
 * ImageStorageService.ts
 *
 * Manages image URL storage in KV store for evidence and location images.
 * Note: Gemini API returns hosted URLs, so no actual upload needed.
 */

import type { IStorageAdapter } from '../repositories/adapters/IStorageAdapter';
import type {
  EvidenceImageStatusResponse,
  LocationImageStatusResponse
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

  // ========== Status Management ==========

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
  }
}
