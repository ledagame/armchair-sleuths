/**
 * LocationImageGeneratorService.ts
 *
 * Generates images for locations in background with sequential processing.
 * Simpler than evidence generation (no batching, no prioritization).
 */

import { ImageGenerator, ImageGenerationRequest } from '../generators/ImageGenerator';
import { ImageStorageService } from './ImageStorageService';
import type { Location } from '../../../shared/types/Discovery';
import type { LocationImageStatusResponse, ImageGenerationOptions } from '../../../shared/types';

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
    locations: Location[],
    options: ImageGenerationOptions = {}
  ): Promise<void> {
    const delay = options.delayBetweenImages || this.DEFAULT_DELAY;

    console.log(`\n🗺️  ============================================`);
    console.log(`🗺️  Location Image Generation Started`);
    console.log(`🗺️  Case: ${caseId}`);
    console.log(`🗺️  Total Locations: ${locations.length}`);
    console.log(`🗺️  ============================================\n`);

    // Initialize status
    await this.updateStatus(caseId, {
      status: 'generating',
      totalCount: locations.length,
      completedCount: 0,
      images: {},
      lastUpdated: new Date().toISOString()
    });

    let completedCount = 0;
    const images: Record<string, string | undefined> = {};

    // Generate sequentially (like CinematicImageService)
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];

      try {
        console.log(`🗺️  Generating image ${i + 1}/${locations.length}: ${location.id} (${location.name})`);

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
      if (i < locations.length - 1) {
        await this.sleep(delay);
      }

      // Update progress after each image
      await this.updateStatus(caseId, {
        status: 'generating',
        totalCount: locations.length,
        completedCount,
        images,
        lastUpdated: new Date().toISOString()
      });
    }

    // Determine final status
    const finalStatus = completedCount === 0 ? 'failed'
      : completedCount < locations.length ? 'partial'
      : 'completed';

    await this.updateStatus(caseId, {
      status: finalStatus,
      totalCount: locations.length,
      completedCount,
      images,
      lastUpdated: new Date().toISOString()
    });

    console.log(`\n✅ ============================================`);
    console.log(`✅ Location Image Generation Complete`);
    console.log(`✅ Status: ${finalStatus.toUpperCase()}`);
    console.log(`✅ Success: ${completedCount}/${locations.length} (${Math.round(completedCount / locations.length * 100)}%)`);
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
