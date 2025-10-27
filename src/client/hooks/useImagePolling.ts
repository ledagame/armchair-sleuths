/**
 * useImagePolling Hook
 *
 * Polls backend for image generation status and triggers callbacks when complete
 *
 * Features:
 * - Configurable polling interval and timeout
 * - Automatic cleanup on unmount
 * - Error resilience with retry logic
 * - AbortController for request cancellation
 * - Works with both React and Devvit environments
 * - Zero re-renders when inactive
 *
 * @example
 * ```tsx
 * const { status, isPolling, isComplete } = useImagePolling({
 *   caseId: 'case-2025-10-25',
 *   enabled: true,
 *   onComplete: () => refetchLocations()
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Status of a single image generation category (evidence or location)
 */
export interface ImageCategoryStatus {
  /** Current generation status */
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  /** Total number of images to generate */
  total: number;
  /** Number of images successfully generated */
  completed: number;
}

/**
 * Overall image generation status for a case
 */
export interface ImageGenerationStatus {
  /** Evidence image generation status */
  evidence: ImageCategoryStatus;
  /** Location image generation status */
  location: ImageCategoryStatus;
  /** True when BOTH evidence AND location are complete */
  complete: boolean;
}

/**
 * Configuration options for useImagePolling hook
 */
export interface UseImagePollingOptions {
  /** Case ID to poll image status for */
  caseId: string;
  /** Whether polling is active (default: true) */
  enabled?: boolean;
  /** Polling interval in milliseconds (default: 5000ms) */
  interval?: number;
  /** Maximum polling duration before timeout (default: 120000ms / 2 minutes) */
  timeout?: number;
  /** Callback triggered when image generation completes */
  onComplete?: () => void;
  /** Callback triggered on fatal error (404, timeout, max retries) */
  onError?: (error: Error) => void;
}

/**
 * Return value from useImagePolling hook
 */
export interface UseImagePollingReturn {
  /** Current image generation status (null until first successful poll) */
  status: ImageGenerationStatus | null;
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Whether image generation is complete */
  isComplete: boolean;
  /** Error if polling failed (null if no error) */
  error: Error | null;
  /** Manually reset and restart polling */
  reset: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_INTERVAL = 5000; // 5 seconds
const DEFAULT_TIMEOUT = 120000; // 2 minutes
const MAX_RETRIES = 3; // Maximum consecutive failures before stopping

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for polling image generation status
 *
 * Polls `/api/case/:caseId/image-status` at regular intervals until:
 * - Generation completes (status.complete === true)
 * - Timeout is reached
 * - Max retries exceeded
 * - Component unmounts
 * - enabled becomes false
 *
 * @param options - Configuration options
 * @returns Polling status, state, and control functions
 */
export function useImagePolling(
  options: UseImagePollingOptions
): UseImagePollingReturn {
  // Destructure options with defaults
  const {
    caseId,
    enabled = true,
    interval = DEFAULT_INTERVAL,
    timeout = DEFAULT_TIMEOUT,
    onComplete,
    onError,
  } = options;

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  const [status, setStatus] = useState<ImageGenerationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // --------------------------------------------------------------------------
  // Refs (don't trigger re-renders)
  // --------------------------------------------------------------------------

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  // --------------------------------------------------------------------------
  // Poll Function
  // --------------------------------------------------------------------------

  /**
   * Execute a single poll request
   * Called immediately and then at regular intervals
   */
  const poll = useCallback(
    async (signal: AbortSignal) => {
      try {
        const response = await fetch(`/api/case/${caseId}/image-status`, {
          signal,
        });

        if (!response.ok) {
          // 404 = case doesn't exist (fatal error)
          if (response.status === 404) {
            throw new Error('Case not found');
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: ImageGenerationStatus = await response.json();

        // Update status
        setStatus(data);

        // Check if complete
        if (data.complete) {
          console.log('[useImagePolling] Image generation complete!');
          stopPolling();
          setIsComplete(true);
          onComplete?.();
        }

        // Reset retry count on successful poll
        retryCountRef.current = 0;
      } catch (err) {
        // Ignore AbortError (intentional cancellation)
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('[useImagePolling] Poll aborted (expected)');
          return;
        }

        console.error('[useImagePolling] Poll error:', err);

        // Increment retry counter
        retryCountRef.current++;

        // Stop polling after max retries
        if (retryCountRef.current >= MAX_RETRIES) {
          console.error(
            '[useImagePolling] Max retries exceeded. Stopping polling.'
          );
          stopPolling();
          const errorObj =
            err instanceof Error ? err : new Error('Polling failed');
          setError(errorObj);
          onError?.(errorObj);
        }
      }
    },
    [caseId, onComplete, onError]
  );

  // --------------------------------------------------------------------------
  // Start Polling
  // --------------------------------------------------------------------------

  /**
   * Start the polling loop
   * - Polls immediately
   * - Then polls at regular intervals
   * - Sets timeout timer
   */
  const startPolling = useCallback(() => {
    // Don't start if already polling or if caseId is empty
    if (!caseId || isPolling) {
      return;
    }

    console.log(
      `[useImagePolling] Starting polling for case ${caseId} (interval: ${interval}ms, timeout: ${timeout}ms)`
    );

    // Clear any existing polling first
    stopPolling();

    // Create new AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Reset state
    setIsPolling(true);
    setIsComplete(false);
    setError(null);
    retryCountRef.current = 0;

    // Set timeout timer
    timeoutTimerRef.current = setTimeout(() => {
      console.warn(
        '[useImagePolling] Timeout reached. Stopping polling.'
      );
      stopPolling();
      const timeoutError = new Error('Polling timeout exceeded');
      setError(timeoutError);
      onError?.(timeoutError);
    }, timeout);

    // Poll immediately
    void poll(signal);

    // Then poll at intervals
    pollIntervalRef.current = setInterval(() => {
      void poll(signal);
    }, interval);
  }, [caseId, interval, timeout, poll, onError, isPolling]);

  // --------------------------------------------------------------------------
  // Stop Polling
  // --------------------------------------------------------------------------

  /**
   * Stop polling and clean up all timers/controllers
   * Safe to call multiple times
   */
  const stopPolling = useCallback(() => {
    // Clear interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    // Clear timeout
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }

    // Abort in-flight requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsPolling(false);
  }, []);

  // --------------------------------------------------------------------------
  // Reset Function
  // --------------------------------------------------------------------------

  /**
   * Manually reset state and restart polling
   * Useful for retry after error
   */
  const reset = useCallback(() => {
    console.log('[useImagePolling] Manual reset triggered');

    // Reset all state
    setStatus(null);
    setIsComplete(false);
    setError(null);
    retryCountRef.current = 0;

    // Restart polling if enabled
    if (enabled && caseId) {
      startPolling();
    }
  }, [enabled, caseId, startPolling]);

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------

  /**
   * Main effect: Start/stop polling based on enabled flag and caseId
   */
  useEffect(() => {
    if (enabled && caseId) {
      startPolling();
    } else {
      stopPolling();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      stopPolling();
    };
  }, [enabled, caseId, startPolling, stopPolling]);

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------

  return {
    status,
    isPolling,
    isComplete,
    error,
    reset,
  };
}

// ============================================================================
// Utility: Global Polling Instance Tracker (Optional Enhancement)
// ============================================================================

/**
 * Global map to track polling instances per caseId
 * Prevents multiple components from polling the same case simultaneously
 *
 * USAGE (optional):
 * ```typescript
 * // In hook, before starting polling:
 * if (globalPollingInstances.has(caseId)) {
 *   console.log('[useImagePolling] Another component already polling this case');
 *   return;
 * }
 * globalPollingInstances.set(caseId, abortControllerRef.current);
 *
 * // In cleanup:
 * globalPollingInstances.delete(caseId);
 * ```
 */
export const globalPollingInstances = new Map<string, AbortController>();

// ============================================================================
// Export
// ============================================================================

export default useImagePolling;
