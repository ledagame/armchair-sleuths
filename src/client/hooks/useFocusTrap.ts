/**
 * useFocusTrap.ts
 *
 * Custom hook for trapping focus within modals and dialogs
 * Ensures keyboard navigation stays within the modal when open
 * Critical for WCAG 2.1 AA compliance
 */

import { useEffect, useRef } from 'react';

/**
 * Focus trap hook for accessible modals
 *
 * @param isActive - Whether the focus trap should be active
 * @returns ref - Ref to attach to the modal container
 *
 * Usage:
 * ```tsx
 * const modalRef = useFocusTrap(isOpen);
 * return <div ref={modalRef}>{...modal content}</div>
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(isActive: boolean) {
  const elementRef = useRef<T>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const element = elementRef.current;
    if (!element) return;

    // Store the previously focused element
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements within the modal
    const getFocusableElements = (): HTMLElement[] => {
      if (!element) return [];

      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];

      const focusableElements = element.querySelectorAll<HTMLElement>(
        focusableSelectors.join(', ')
      );

      return Array.from(focusableElements).filter((el) => {
        // Filter out hidden elements
        return el.offsetParent !== null;
      });
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab: Move focus backwards
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      }
      // Tab: Move focus forwards
      else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    // Cleanup: Restore focus to previously focused element
    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus();
      }
    };
  }, [isActive]);

  return elementRef;
}
