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
 */

import { useState, useEffect, useRef } from 'react';
import type {
  Suspect,
  SuspectImagesMap,
  SuspectImageState,
  UseSuspectImagesReturn,
  SuspectImageApiResponse,
} from '../types';

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
  const [images, setImages] = useState<SuspectImagesMap>(new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  // Track which suspects we've already attempted to fetch
  // This prevents re-fetching on re-renders
  const fetchedSuspectsRef = useRef<Set<string>>(new Set());

  // AbortController for cleanup on unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Filter suspects that need image loading
    const suspectsToFetch = suspects.filter((suspect) => {
      // Skip if already fetched
      if (fetchedSuspectsRef.current.has(suspect.id)) {
        return false;
      }

      // Skip if profileImageUrl already exists (backwards compatibility)
      if (suspect.profileImageUrl) {
        // Set the image immediately from existing data
        setImages((prev) => {
          const next = new Map(prev);
          next.set(suspect.id, {
            imageUrl: suspect.profileImageUrl!,
            loading: false,
            error: null,
          });
          return next;
        });
        fetchedSuspectsRef.current.add(suspect.id);
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
        next.set(suspect.id, {
          imageUrl: null,
          loading: true,
          error: null,
        });
        fetchedSuspectsRef.current.add(suspect.id);
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
            next.set(suspectId, {
              imageUrl,
              loading: false,
              error,
            });
          }
        });

        return next;
      });

      setIsLoading(false);
      setIsComplete(true);

      console.log('[useSuspectImages] Image loading complete');
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
