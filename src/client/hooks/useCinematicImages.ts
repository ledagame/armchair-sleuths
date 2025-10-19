/**
 * useCinematicImages Hook
 *
 * Background cinematic image generation polling hook
 * Features:
 * - Automatic polling for image generation status
 * - Status tracking (pending → generating → completed/partial/failed)
 * - Graceful error handling
 * - Cleanup on unmount (clear interval)
 */

import { useState, useEffect, useRef } from 'react';
import type { ImageGenerationStatus, CinematicImages, ImageGenerationMeta } from '@/shared/types/index';

/**
 * Hook return type
 */
export interface UseCinematicImagesReturn {
  /** Current generation status */
  status: ImageGenerationStatus;
  /** Generated cinematic images (null until completed) */
  images: CinematicImages | null;
  /** Generation metadata (progress, timing, etc.) */
  meta?: ImageGenerationMeta;
  /** Loading state (true when polling) */
  isLoading: boolean;
  /** Error message if generation failed */
  error: string | null;
}

/**
 * API response type for image status endpoint
 */
interface ImageStatusResponse {
  status: ImageGenerationStatus;
  images: CinematicImages | null;
  meta?: ImageGenerationMeta;
  error?: string;
}

/**
 * Hook for polling cinematic image generation status
 *
 * @param caseId - Case ID to poll for
 * @param enabled - Whether to enable polling (default: true)
 * @returns Object containing status, images, and loading state
 *
 * @example
 * ```tsx
 * const { status, images, isLoading } = useCinematicImages(caseId);
 *
 * if (status === 'generating') {
 *   return <LoadingSpinner />;
 * }
 * if (status === 'completed' && images) {
 *   return <CinematicIntro images={images} />;
 * }
 * ```
 */
export function useCinematicImages(
  caseId: string | null,
  enabled: boolean = true
): UseCinematicImagesReturn {
  // State
  const [status, setStatus] = useState<ImageGenerationStatus>('pending');
  const [images, setImages] = useState<CinematicImages | null>(null);
  const [meta, setMeta] = useState<ImageGenerationMeta | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and backoff strategy
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollCountRef = useRef<number>(0); // Track poll attempts for backoff

  useEffect(() => {
    // Skip if disabled or no caseId
    if (!enabled || !caseId) {
      return;
    }

    // Initialize AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Reset poll count
    pollCountRef.current = 0;

    /**
     * Calculate polling interval with exponential backoff
     * Intervals: 1s, 2s, 3s, 5s, 5s, ...
     * @returns Polling interval in milliseconds
     */
    const getPollingInterval = (): number => {
      const count = pollCountRef.current;
      if (count === 0) return 1000; // First poll: 1 second
      if (count === 1) return 2000; // Second poll: 2 seconds
      if (count === 2) return 3000; // Third poll: 3 seconds
      return 5000; // Subsequent polls: 5 seconds (max)
    };

    // Polling function
    const pollImageStatus = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/cases/${caseId}/image-status`, {
          signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ImageStatusResponse = await response.json();

        // Update state
        setStatus(data.status);
        setImages(data.images);
        setMeta(data.meta);

        if (data.error) {
          setError(data.error);
        }

        // Preload images when available
        if (data.images) {
          console.log('[useCinematicImages] Preloading images...');
          const imageUrls = [
            data.images.establishing,
            data.images.confrontation,
            data.images.action
          ].filter(Boolean) as string[];

          // Preload all available images
          imageUrls.forEach((url) => {
            const img = new Image();
            img.src = url;
            console.log(`[useCinematicImages] Preloading: ${url.substring(0, 50)}...`);
          });
        }

        // Stop polling if terminal state reached
        if (
          data.status === 'completed' ||
          data.status === 'partial' ||
          data.status === 'failed'
        ) {
          console.log(`[useCinematicImages] Polling stopped: status=${data.status}`);
          if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
          }
          setIsLoading(false);
          return;
        }

        // Increment poll count for backoff calculation
        pollCountRef.current++;

        // Schedule next poll with backoff interval
        const nextInterval = getPollingInterval();
        console.log(`[useCinematicImages] Next poll in ${nextInterval}ms (poll #${pollCountRef.current})`);

        intervalRef.current = setTimeout(() => {
          void pollImageStatus();
        }, nextInterval);

        setIsLoading(false);
      } catch (err) {
        // Handle abort gracefully
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[useCinematicImages] Polling aborted');
          return;
        }

        // Log error
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[useCinematicImages] Polling error:', errorMessage);
        setError(errorMessage);
        setIsLoading(false);

        // Retry polling after error with backoff
        pollCountRef.current++;
        const nextInterval = getPollingInterval();
        intervalRef.current = setTimeout(() => {
          void pollImageStatus();
        }, nextInterval);
      }
    };

    // Initial poll
    console.log(`[useCinematicImages] Starting polling for case: ${caseId} with backoff strategy`);
    void pollImageStatus();

    // Cleanup function
    return () => {
      console.log('[useCinematicImages] Cleaning up polling');

      // Clear timeout
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }

      // Abort ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [caseId, enabled]);

  return {
    status,
    images,
    meta,
    isLoading,
    error,
  };
}
