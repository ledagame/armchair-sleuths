import { useState, useEffect, useRef } from 'react';
import type { ImageGenerationStatus } from '../../shared/types';

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
          `/api/case/${caseId}/evidence-images/status`,
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
