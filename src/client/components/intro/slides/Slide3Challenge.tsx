/**
 * Slide3Challenge.tsx
 *
 * Slide 3: Challenge
 * - 3 statement lines (rhythm: "X suspects", "Y constraint", "Z tension")
 * - Question to player (direct challenge)
 * - CTA button (START INVESTIGATION / BEGIN / INVESTIGATE)
 *
 * Design: Punchy, direct lines that drive urgency
 * Word limit: 20-30 words total
 */

'use client';

import { useEffect, useState } from 'react';
import type { Slide3Challenge as Slide3Data } from '../../../../shared/types';

/**
 * Slide3Challenge Props
 */
export interface Slide3ChallengeProps {
  /** Slide 3 data */
  slide: Slide3Data;

  /** Callback to start investigation (complete intro) */
  onStart: () => void;

  /** Callback to go to previous slide */
  onPrevious: () => void;
}

/**
 * Slide3Challenge Component
 *
 * Final slide that builds urgency and prompts user to begin investigation
 */
export function Slide3Challenge({ slide, onStart, onPrevious }: Slide3ChallengeProps) {
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
        <h2 className="text-evidence-clue text-sm sm:text-base font-mono uppercase tracking-wider mb-2">
          ⚡ The Challenge
        </h2>
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-evidence-clue to-transparent" />
      </div>

      {/* 3 Statement Lines (Rhythm) */}
      <div className="w-full space-y-4 sm:space-y-5 md:space-y-6 text-center px-4">
        {/* Statement Line 1 */}
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
          {slide.statementLine1}
        </div>

        {/* Statement Line 2 */}
        <div
          className="
            text-text-secondary text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            font-display font-bold
            tracking-wide
            animate-fade-in-up
          "
          style={{
            animationDelay: '0.4s',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
          }}
        >
          {slide.statementLine2}
        </div>

        {/* Statement Line 3 */}
        <div
          className="
            text-text-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl
            font-display font-bold
            tracking-wide
            animate-fade-in-up
          "
          style={{
            animationDelay: '0.6s',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
          }}
        >
          {slide.statementLine3}
        </div>
      </div>

      {/* Question (Hook) */}
      <div
        className="
          text-evidence-blood text-3xl sm:text-4xl md:text-5xl lg:text-6xl
          font-display font-extrabold italic
          tracking-tight text-center px-4
          animate-fade-in-up
        "
        style={{
          animationDelay: '0.8s',
          textShadow: '0 6px 20px rgba(139, 0, 0, 0.6)',
        }}
      >
        {slide.question}
      </div>

      {/* CTA Button (Primary Action) - WCAG 2.5.5 compliant touch target */}
      <button
        onClick={onStart}
        className="
          group
          mt-8 px-10 py-4 sm:px-12 sm:py-5 md:px-16 md:py-6
          min-h-[48px] sm:min-h-[56px]
          bg-gradient-to-r from-evidence-blood to-evidence-blood/90
          hover:from-evidence-blood/90 hover:to-evidence-blood/80
          active:from-evidence-blood active:to-evidence-blood
          border-2 border-detective-gold
          rounded-xl sm:rounded-2xl
          text-text-primary text-lg sm:text-xl md:text-2xl font-extrabold uppercase
          tracking-wider
          transition-all duration-300
          shadow-xl shadow-evidence-blood/30
          hover:shadow-2xl hover:shadow-evidence-blood/50
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-detective-gold/50
          animate-fade-in-scale
        "
        style={{
          animationDelay: '1.2s',
        }}
        aria-label="Begin murder mystery investigation"
        data-slide-action="primary"
      >
        <span className="flex items-center gap-3 sm:gap-4">
          {slide.cta}
          <span className="text-2xl sm:text-3xl group-hover:translate-x-2 transition-transform">
            🔍
          </span>
        </span>
      </button>

      {/* Back Button (Secondary Action) - WCAG 2.5.5 compliant touch target */}
      <button
        onClick={onPrevious}
        className="
          px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3
          min-h-[48px] sm:min-h-[56px]
          bg-noir-gunmetal/50 hover:bg-noir-smoke/50 active:bg-noir-fog/50
          border-2 border-noir-fog hover:border-detective-brass
          rounded-lg sm:rounded-xl
          text-text-secondary hover:text-text-primary text-base sm:text-lg font-semibold
          transition-all duration-base
          backdrop-blur-sm
          focus:outline-none focus:ring-2 focus:ring-detective-brass focus:ring-offset-2 focus:ring-offset-noir-deepBlack
          animate-fade-in-up
        "
        style={{
          animationDelay: '1.4s',
        }}
        aria-label="Go back to suspects slide"
      >
        <span className="flex items-center gap-2">
          <span className="text-xl">←</span>
          Back
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

        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out both;
        }

        .animate-fade-in-scale {
          animation: fade-in-scale 0.8s ease-out both;
        }

        /* Pulse animation for CTA button */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(220, 38, 38, 0.4);
          }
          50% {
            box-shadow: 0 0 60px rgba(220, 38, 38, 0.6);
          }
        }

        button:has(+ *) {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* Accessibility: Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-fade-in-scale {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          @keyframes pulse-glow {
            0%, 100% {
              box-shadow: 0 0 40px rgba(220, 38, 38, 0.4);
            }
          }
        }
      `}</style>
    </div>
  );
}
