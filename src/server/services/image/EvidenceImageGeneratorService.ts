/**
 * EvidenceImageGeneratorService.ts
 *
 * Generates images for evidence items in background with progressive updates.
 * Uses batching and prioritization to optimize generation time.
 */

import { ImageGenerator, ImageGenerationRequest } from '../generators/ImageGenerator';
import { ImageStorageService } from './ImageStorageService';
import type { MultilingualEvidence, EvidenceItem } from '../../../shared/types/Evidence';
import type { EvidenceImageStatusResponse, ImageGenerationOptions } from '../../../shared/types';

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
      'obvious': 0,
      'medium': 1,
      'hidden': 2
    };

    return [...items].sort((a, b) => {
      const orderA = difficultyOrder[a.discoveryDifficulty] ?? 999;
      const orderB = difficultyOrder[b.discoveryDifficulty] ?? 999;
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
