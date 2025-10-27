/**
 * useSuspectImages Hook
 *
 * Progressive image loading hook for suspect profile images
 * Features:
 * - Parallel fetching with Promise.allSettled
 * - Intelligent caching (no re-fetch on re-render)
 * - Per-suspect loading states
 * - Error resilience (one failure doesn't break others)
 * - Cleanup on unmount (AbortController)
 * - Global cache (persists across component mount/unmount)
 */

import { useState, useEffect, useRef } from 'react';
import type {
  Suspect,
  SuspectImagesMap,
  SuspectImageState,
  UseSuspectImagesReturn,
  SuspectImageApiResponse,
} from '../types';

// Global cache that persists across component mount/unmount
// This prevents re-fetching images when navigating between tabs
const globalImageCache = new Map<string, SuspectImageState>();
const globalFetchedSuspects = new Set<string>();

/**
 * Hook for progressive loading of suspect profile images
 *
 * @param suspects - Array of suspects to load images for
 * @returns Object containing images map, loading state, and completion state
 *
 * @example
 * ```tsx
 * const { images, isLoading, isComplete } = useSuspectImages(suspects);
 *
 * const imageState = images.get(suspect.id);
 * if (imageState?.loading) {
 *   return <SkeletonLoader />;
 * }
 * if (imageState?.imageUrl) {
 *   return <img src={imageState.imageUrl} />;
 * }
 * ```
 */
export function useSuspectImages(suspects: Suspect[]): UseSuspectImagesReturn {
  // State for image loading results
  // Initialize from global cache
  const [images, setImages] = useState<SuspectImagesMap>(() => {
    const initial = new Map<string, SuspectImageState>();
    suspects.forEach((suspect) => {
      const cached = globalImageCache.get(suspect.id);
      if (cached) {
        initial.set(suspect.id, cached);
      }
    });
    return initial;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // AbortController for cleanup on unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Filter suspects that need image loading
    const suspectsToFetch = suspects.filter((suspect) => {
      // Skip if already fetched (check global cache)
      if (globalFetchedSuspects.has(suspect.id)) {
        return false;
      }

      // Skip if profileImageUrl already exists (backwards compatibility)
      if (suspect.profileImageUrl) {
        // Set the image immediately from existing data
        const imageState = {
          imageUrl: suspect.profileImageUrl!,
          loading: false,
          error: null,
        };
        setImages((prev) => {
          const next = new Map(prev);
          next.set(suspect.id, imageState);
          return next;
        });
        // Store in global cache
        globalImageCache.set(suspect.id, imageState);
        globalFetchedSuspects.add(suspect.id);
        return false;
      }

      // Only fetch if hasProfileImage flag is true
      return suspect.hasProfileImage === true;
    });

    // If no suspects to fetch, mark as complete
    if (suspectsToFetch.length === 0) {
      setIsLoading(false);
      setIsComplete(true);
      return;
    }

    // Initialize AbortController for this fetch batch
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Initialize loading state for each suspect
    setIsLoading(true);
    setImages((prev) => {
      const next = new Map(prev);
      suspectsToFetch.forEach((suspect) => {
        const loadingState = {
          imageUrl: null,
          loading: true,
          error: null,
        };
        next.set(suspect.id, loadingState);
        // Mark as fetched to prevent duplicate fetches
        globalFetchedSuspects.add(suspect.id);
        // Store loading state in cache
        globalImageCache.set(suspect.id, loadingState);
      });
      return next;
    });

    // Fetch all images in parallel
    const fetchImages = async () => {
      console.log(`[useSuspectImages] Fetching ${suspectsToFetch.length} images in parallel...`);

      // Create fetch promises for all suspects
      const fetchPromises = suspectsToFetch.map(async (suspect) => {
        try {
          const response = await fetch(`/api/suspect-image/${suspect.id}`, {
            signal,
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data: SuspectImageApiResponse = await response.json();

          return {
            suspectId: suspect.id,
            imageUrl: data.profileImageUrl,
            error: null,
          };
        } catch (err) {
          // Handle abort gracefully
          if (err instanceof Error && err.name === 'AbortError') {
            console.log(`[useSuspectImages] Fetch aborted for suspect ${suspect.id}`);
            return null;
          }

          // Log error but don't throw (error resilience)
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.error(`[useSuspectImages] Failed to load image for ${suspect.id}:`, errorMessage);

          return {
            suspectId: suspect.id,
            imageUrl: null,
            error: errorMessage,
          };
        }
      });

      // Wait for all fetches to complete (success or failure)
      const results = await Promise.allSettled(fetchPromises);

      // Update state with results
      setImages((prev) => {
        const next = new Map(prev);

        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            const { suspectId, imageUrl, error } = result.value;
            const imageState = {
              imageUrl,
              loading: false,
              error,
            };
            next.set(suspectId, imageState);
            // Update global cache with final result
            globalImageCache.set(suspectId, imageState);
          }
        });

        return next;
      });

      setIsLoading(false);
      setIsComplete(true);

      console.log('[useSuspectImages] Image loading complete');
      console.log(`[useSuspectImages] Global cache now has ${globalImageCache.size} images`);
    };

    // Execute parallel fetch
    void fetchImages();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [suspects]);

  return {
    images,
    isLoading,
    isComplete,
  };
}
