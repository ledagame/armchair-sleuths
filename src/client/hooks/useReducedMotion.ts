/**
 * useReducedMotion.ts
 *
 * Hook to detect user's motion preferences
 * Respects prefers-reduced-motion media query for accessibility
 */

import { useEffect, useState } from 'react';

/**
 * Hook to detect if user prefers reduced motion
 *
 * @returns boolean indicating if reduced motion is preferred
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window and matchMedia are available
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Get animation variants that respect reduced motion preference
 *
 * @param reducedMotion - Whether reduced motion is preferred
 * @param fullAnimation - Full animation variants
 * @param reducedAnimation - Reduced animation variants
 * @returns Animation variants based on preference
 */
export function getAccessibleVariants<T>(
  reducedMotion: boolean,
  fullAnimation: T,
  reducedAnimation: T
): T {
  return reducedMotion ? reducedAnimation : fullAnimation;
}

/**
 * Get animation duration that respects reduced motion preference
 *
 * @param reducedMotion - Whether reduced motion is preferred
 * @param fullDuration - Full animation duration
 * @param reducedDuration - Reduced animation duration (default: 0)
 * @returns Duration based on preference
 */
export function getAccessibleDuration(
  reducedMotion: boolean,
  fullDuration: number,
  reducedDuration: number = 0
): number {
  return reducedMotion ? reducedDuration : fullDuration;
}

/**
 * Get spring configuration that respects reduced motion preference
 *
 * @param reducedMotion - Whether reduced motion is preferred
 * @param fullSpring - Full spring configuration
 * @returns Spring configuration based on preference
 */
export function getAccessibleSpring(
  reducedMotion: boolean,
  fullSpring: { stiffness: number; damping: number }
): { stiffness: number; damping: number; duration?: number } {
  if (reducedMotion) {
    return { stiffness: 500, damping: 50, duration: 0.01 };
  }
  return fullSpring;
}

/**
 * Hook to get accessible animation configuration
 *
 * @returns Object with reduced motion state and helper functions
 */
export function useAccessibleAnimation() {
  const prefersReducedMotion = useReducedMotion();

  return {
    prefersReducedMotion,
    getVariants: <T,>(fullAnimation: T, reducedAnimation: T) =>
      getAccessibleVariants(prefersReducedMotion, fullAnimation, reducedAnimation),
    getDuration: (fullDuration: number, reducedDuration = 0) =>
      getAccessibleDuration(prefersReducedMotion, fullDuration, reducedDuration),
    getSpring: (fullSpring: { stiffness: number; damping: number }) =>
      getAccessibleSpring(prefersReducedMotion, fullSpring),
  };
}
