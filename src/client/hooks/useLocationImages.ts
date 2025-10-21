import { useState, useEffect, useRef } from 'react';
import type { ImageGenerationStatus } from '../../shared/types';

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
          `/api/case/${caseId}/location-images/status`,
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
