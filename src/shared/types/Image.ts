/**
 * Image generation status types
 * Shared between client (UI state) and server (generation tracking)
 *
 * This file was created to fix type boundary violations where client code
 * was directly importing server-only types. These types are now properly
 * placed in the shared layer.
 *
 * Related files:
 * - Client: useEvidenceImages.ts, useLocationImages.ts
 * - Server: ImageStorageService.ts, EvidenceImageGeneratorService.ts, LocationImageGeneratorService.ts
 */

/**
 * Status of image generation process
 * - pending: Not started yet
 * - generating: Currently generating images
 * - completed: All images generated successfully
 * - partial: Some images generated, some failed
 * - failed: All images failed to generate
 */
export type ImageGenerationStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'partial'
  | 'failed';

/**
 * Evidence image generation status response
 * Used by client to poll generation progress and display UI
 */
export interface EvidenceImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>; // evidenceId -> imageUrl
  currentBatch?: number; // Current batch being processed
  estimatedTimeRemaining?: number; // Estimated seconds remaining
  lastUpdated: string; // ISO timestamp of last update
}

/**
 * Location image generation status response
 * Similar to EvidenceImageStatusResponse but for location images
 */
export interface LocationImageStatusResponse {
  status: ImageGenerationStatus;
  totalCount: number;
  completedCount: number;
  images: Record<string, string | undefined>; // locationId -> imageUrl
  lastUpdated: string; // ISO timestamp of last update
}

/**
 * Options for image generation
 * Used by server services to configure generation behavior
 */
export interface ImageGenerationOptions {
  batchSize?: number; // Number of images per batch (default: 3)
  delayBetweenImages?: number; // Milliseconds between images (default: 500)
  maxRetries?: number; // Max retries per image (default: 2)
}
