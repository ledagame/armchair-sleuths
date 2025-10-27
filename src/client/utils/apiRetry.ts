/**
 * apiRetry.ts
 *
 * Retry utilities for API calls with exponential backoff
 * Provides resilient network request handling
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
  onRetry?: (error: Error, attempt: number, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  shouldRetry: (error: Error) => {
    // Retry on network errors and 5xx server errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return true;
    }
    if (error.message.includes('500') || error.message.includes('503')) {
      return true;
    }
    return false;
  },
  onRetry: (error: Error, attempt: number, delayMs: number) => {
    console.log(`Retry attempt ${attempt} after ${delayMs}ms:`, error.message);
  },
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  // Add jitter (±20%) to prevent thundering herd
  const jitter = cappedDelay * 0.2 * (Math.random() - 0.5);
  return Math.round(cappedDelay + jitter);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if we should retry
      if (!opts.shouldRetry(lastError, attempt + 1)) {
        break;
      }

      // Calculate delay and wait
      const delayMs = calculateDelay(
        attempt + 1,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      opts.onRetry(lastError, attempt + 1, delayMs);
      await sleep(delayMs);
    }
  }

  throw lastError!;
}

/**
 * Fetch with retry - wrapper for fetch API
 */
export async function fetchWithRetry(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, init);

      // Throw on HTTP errors to trigger retry
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    {
      ...options,
      shouldRetry: (error: Error, attempt: number) => {
        // Custom retry logic for HTTP errors
        if (error.message.includes('404')) {
          // Don't retry 404s
          return false;
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          // Don't retry auth errors
          return false;
        }
        if (error.message.includes('400')) {
          // Don't retry bad requests
          return false;
        }
        // Retry 5xx errors and network errors
        return options?.shouldRetry?.(error, attempt) ?? DEFAULT_OPTIONS.shouldRetry(error, attempt);
      },
    }
  );
}

/**
 * Fetch JSON with retry and type safety
 */
export async function fetchJsonWithRetry<T>(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): Promise<T> {
  const response = await fetchWithRetry(url, init, options);
  return response.json() as Promise<T>;
}

/**
 * React hook-friendly API fetch with retry
 */
export interface UseFetchWithRetryState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Create a fetch handler with retry for React hooks
 */
export function createFetchWithRetry<T>(
  url: string,
  init?: RequestInit,
  options?: RetryOptions
): {
  fetch: () => Promise<T>;
  abort: () => void;
} {
  let abortController: AbortController | null = null;

  return {
    fetch: async () => {
      abortController = new AbortController();
      const response = await fetchWithRetry(
        url,
        { ...init, signal: abortController.signal },
        options
      );
      return response.json() as Promise<T>;
    },
    abort: () => {
      abortController?.abort();
    },
  };
}
