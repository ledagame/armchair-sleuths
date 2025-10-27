/**
 * ThreeSlideIntro.tsx
 *
 * NEW: 3-slide intro system (replaces old 3-phase narration + 5-scene cinematic)
 * Based on murder-mystery-intro skill patterns
 *
 * Features:
 * - Mobile-first swipe/tap navigation
 * - 3 slides: Discovery → Suspects → Challenge
 * - Cinematic background images (discovery, suspects, challenge)
 * - Progress indicators
 * - Skip functionality
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Slide1Discovery } from './slides/Slide1Discovery';
import { Slide2Suspects } from './slides/Slide2Suspects';
import { Slide3Challenge } from './slides/Slide3Challenge';
import type { IntroSlides, CinematicImages } from '../../../shared/types';

/**
 * ThreeSlideIntro Props
 */
export interface ThreeSlideIntroProps {
  /** 3-slide intro data */
  slides: IntroSlides;

  /** Cinematic background images (3 images mapped to 3 slides) */
  cinematicImages?: CinematicImages;

  /** Callback when intro completes */
  onComplete: () => void;

  /** Skip button visibility (default: true) */
  showSkipButton?: boolean;
}

/**
 * Slide type for navigation
 */
type SlideType = 'discovery' | 'suspects' | 'challenge';

/**
 * ThreeSlideIntro Component
 *
 * Mobile-first 3-slide intro with swipe/tap navigation:
 * 1. Discovery: Time, location, victim, constraint
 * 2. Suspects: Suspect cards with roles and claims
 * 3. Challenge: Stakes, question, CTA button
 */
export function ThreeSlideIntro({
  slides,
  cinematicImages = {},
  onComplete,
  showSkipButton = true,
}: ThreeSlideIntroProps) {
  // ============================================================================
  // Safety Check: Ensure all required slides exist
  // ============================================================================

  if (!slides || !slides.discovery || !slides.suspects || !slides.challenge) {
    console.error('ThreeSlideIntro: Missing required slide data', slides);
    // Call onComplete immediately to skip broken intro
    useEffect(() => {
      onComplete();
    }, [onComplete]);

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-noir-deepBlack">
        <div className="text-center">
          <p className="text-xl text-text-primary">Loading intro...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // State
  // ============================================================================

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slide order
  const slideTypes: SlideType[] = ['discovery', 'suspects', 'challenge'];
  const currentSlideType = slideTypes[currentSlideIndex];

  // ============================================================================
  // Navigation Handlers
  // ============================================================================

  /**
   * Go to next slide (or complete if on last slide)
   */
  const handleNext = useCallback(() => {
    if (currentSlideIndex < slideTypes.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else {
      // Last slide → complete
      onComplete();
    }
  }, [currentSlideIndex, slideTypes.length, onComplete]);

  /**
   * Go to previous slide
   */
  const handlePrevious = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    }
  }, [currentSlideIndex]);

  /**
   * Skip to end (complete immediately)
   */
  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ============================================================================
  // Touch/Swipe Handlers (Mobile-First)
  // ============================================================================

  const MIN_SWIPE_DISTANCE = 50; // Minimum distance for swipe detection

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      // Swipe left → next slide
      handleNext();
    } else if (isRightSwipe) {
      // Swipe right → previous slide
      handlePrevious();
    }
  };

  // ============================================================================
  // Keyboard Navigation
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrevious, handleSkip]);

  // ============================================================================
  // Focus Management (WCAG 2.4.3) - Focus first button on slide change
  // ============================================================================

  useEffect(() => {
    // Focus the primary action button when slide changes
    const primaryButton = containerRef.current?.querySelector('[data-slide-action="primary"]');
    if (primaryButton instanceof HTMLElement) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        primaryButton.focus();
      }, 100);
    }
  }, [currentSlideIndex]);

  // ============================================================================
  // Background Image for Current Slide
  // ============================================================================

  const currentBackgroundImage = cinematicImages?.[currentSlideType];

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col bg-noir-deepBlack overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Murder mystery introduction"
    >
      {/* Background Image Layer */}
      {currentBackgroundImage && (
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${currentBackgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
          aria-hidden="true"
        />
      )}

      {/* Noir Gradient Overlay (for text readability) */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-noir-deepBlack/90 via-noir-charcoal/70 to-noir-deepBlack/90"
        aria-hidden="true"
      />

      {/* Screen Reader Live Region for Slide Announcements (WCAG 4.1.2, 4.1.3) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        Slide {currentSlideIndex + 1} of {slideTypes.length}: {currentSlideType} slide
      </div>

      {/* Slide Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12">
        {currentSlideType === 'discovery' && (
          <Slide1Discovery
            slide={slides.discovery}
            onNext={handleNext}
          />
        )}

        {currentSlideType === 'suspects' && (
          <Slide2Suspects
            slide={slides.suspects}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}

        {currentSlideType === 'challenge' && (
          <Slide3Challenge
            slide={slides.challenge}
            onStart={onComplete}
            onPrevious={handlePrevious}
          />
        )}
      </div>

      {/* Bottom Controls */}
      <div className="relative z-20 px-4 py-4 sm:px-6 sm:py-5 md:px-6 md:py-6 flex items-center justify-between">
        {/* Progress Indicators (Left) - WCAG 2.5.5 compliant touch targets */}
        <div className="flex items-center gap-2 sm:gap-1">
          {slideTypes.map((type, index) => (
            <button
              key={type}
              onClick={() => setCurrentSlideIndex(index)}
              className={`
                h-3 md:h-2 rounded-full transition-all duration-300
                min-w-[48px] min-h-[48px] md:min-w-0 md:min-h-0
                flex items-center justify-center p-3 md:p-0
                hover:bg-detective-gold/10 md:hover:bg-transparent
                ${index === currentSlideIndex
                  ? 'bg-detective-gold/20 md:bg-transparent'
                  : ''}
              `}
              aria-label={`Go to ${type} slide (${index + 1} of ${slideTypes.length})`}
              aria-current={index === currentSlideIndex ? 'true' : 'false'}
            >
              <span
                className={`
                  block h-3 md:h-2 rounded-full transition-all duration-300
                  ${index === currentSlideIndex
                    ? 'w-10 sm:w-8 bg-detective-gold'
                    : index < currentSlideIndex
                    ? 'w-3 md:w-2 bg-detective-brass'
                    : 'w-3 md:w-2 bg-noir-fog'
                  }
                `}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        {/* Skip Button (Right) */}
        {showSkipButton && (
          <button
            onClick={handleSkip}
            className="
              px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3
              min-h-[48px]
              bg-noir-gunmetal/50 hover:bg-detective-gold/20 active:bg-detective-gold/30
              border-2 border-detective-brass hover:border-detective-gold
              rounded-lg sm:rounded-xl
              text-detective-gold hover:text-detective-amber text-sm sm:text-base font-semibold
              transition-all duration-base
              backdrop-blur-md
              focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
            "
            aria-label="Skip introduction"
          >
            Skip
          </button>
        )}
      </div>

      {/* Swipe Hint (Mobile, shows on first slide only) - WCAG 1.4.3 compliant contrast */}
      {currentSlideIndex === 0 && (
        <div
          className="
            absolute bottom-24 sm:bottom-20 left-1/2 -translate-x-1/2
            md:hidden
            text-detective-gold/90 text-sm font-medium
            animate-pulse
            px-4 py-2 bg-noir-charcoal/50 rounded-full backdrop-blur-sm
          "
          aria-hidden="true"
        >
          👈 Swipe to continue 👉
        </div>
      )}
    </div>
  );
}
