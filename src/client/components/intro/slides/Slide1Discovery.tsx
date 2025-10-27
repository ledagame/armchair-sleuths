/**
 * Slide1Discovery.tsx
 *
 * Slide 1: Discovery
 * - Time & Location (exact timestamp, specific place)
 * - Victim Statement ("found dead")
 * - Primary Constraint (locked room, timeframe, etc.)
 *
 * Design: Direct, immediate language with ominous undertones
 * Word limit: 30-40 words total
 */

'use client';

import { useEffect, useState } from 'react';
import type { Slide1Discovery as Slide1Data } from '../../../../shared/types';

/**
 * Slide1Discovery Props
 */
export interface Slide1DiscoveryProps {
  /** Slide 1 data */
  slide: Slide1Data;

  /** Callback to go to next slide */
  onNext: () => void;
}

/**
 * Slide1Discovery Component
 *
 * Displays the crime scene discovery with dramatic reveal animation
 */
export function Slide1Discovery({ slide, onNext }: Slide1DiscoveryProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        w-full max-w-4xl mx-auto
        flex flex-col items-center justify-center gap-8 md:gap-12
        transition-all duration-1000
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Slide Title - WCAG 1.4.3 compliant contrast */}
      <div className="text-center">
        <h2 className="text-evidence-blood text-sm sm:text-base font-mono uppercase tracking-wider mb-2">
          ⚠️ Crime Scene Discovery
        </h2>
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-evidence-blood to-transparent" />
      </div>

      {/* Content Lines (3 lines with emphasis) */}
      <div className="w-full space-y-6 md:space-y-8 text-center">
        {/* Line 1: Time & Location */}
        <div
          className="
            text-text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            font-display font-bold
            tracking-wide
            animate-fade-in-up
          "
          style={{
            animationDelay: '0.2s',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
          }}
        >
          {slide.timeLocation}
        </div>

        {/* Line 2: Victim Statement (emphasized) */}
        <div
          className="
            text-evidence-blood text-3xl sm:text-4xl md:text-5xl lg:text-6xl
            font-display font-extrabold
            tracking-tight
            animate-fade-in-up
          "
          style={{
            animationDelay: '0.6s',
            textShadow: '0 6px 20px rgba(139, 0, 0, 0.6)',
          }}
        >
          {slide.victimStatement}
        </div>

        {/* Line 3: Constraint */}
        <div
          className="
            text-text-secondary text-xl sm:text-2xl md:text-3xl lg:text-4xl
            font-display italic
            tracking-wide
            animate-fade-in-up
          "
          style={{
            animationDelay: '1.0s',
            textShadow: '0 3px 10px rgba(0, 0, 0, 0.8)',
          }}
        >
          {slide.constraint}
        </div>
      </div>

      {/* Tap to Continue Hint - WCAG 2.5.5 compliant touch target */}
      <button
        onClick={onNext}
        className="
          group
          mt-8 px-8 py-3 sm:px-10 sm:py-4
          min-h-[48px] sm:min-h-[56px]
          bg-noir-gunmetal/50 hover:bg-detective-gold/20 active:bg-detective-gold/30
          border-2 border-detective-brass hover:border-detective-gold
          rounded-lg sm:rounded-xl
          text-detective-gold hover:text-detective-amber text-base sm:text-lg font-semibold
          transition-all duration-base
          backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
          animate-fade-in-up
        "
        style={{
          animationDelay: '1.4s',
        }}
        aria-label="Continue to suspect information slide"
        data-slide-action="primary"
      >
        <span className="flex items-center gap-3">
          Continue
          <span className="text-xl group-hover:translate-x-1 transition-transform">
            →
          </span>
        </span>
      </button>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }

        /* Accessibility: Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
