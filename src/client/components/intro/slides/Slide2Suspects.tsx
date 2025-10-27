/**
 * Slide2Suspects.tsx
 *
 * Slide 2: Suspects
 * - Suspect cards (3-4 dynamic): name, role (1-2 words), claim ("I was...")
 * - Constraint statement (all suspects had access/presence/capability)
 * - Tension line ("One of them is lying")
 *
 * Design: Minimal information (NO motives, backstories, relationships, evidence)
 * Word limit: 60-80 words total
 */

'use client';

import { useEffect, useState } from 'react';
import { useSuspectImages } from '../../../hooks/useSuspectImages';
import type { Slide2Suspects as Slide2Data, SuspectCard } from '../../../../shared/types';

/**
 * Slide2Suspects Props
 */
export interface Slide2SuspectsProps {
  /** Slide 2 data */
  slide: Slide2Data;

  /** Callback to go to next slide */
  onNext: () => void;

  /** Callback to go to previous slide */
  onPrevious: () => void;
}

/**
 * SuspectCardDisplay Props
 */
interface SuspectCardDisplayProps {
  suspect: SuspectCard;
  index: number;
  profileImageUrl?: string;
}

/**
 * SuspectCardDisplay Component
 *
 * Individual suspect card with profile image, name, role, and claim
 */
function SuspectCardDisplay({ suspect, index, profileImageUrl }: SuspectCardDisplayProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="
        flex flex-col items-center gap-3
        p-4 sm:p-5 md:p-6
        bg-noir-charcoal/60 backdrop-blur-sm
        border-2 border-noir-fog
        rounded-xl sm:rounded-2xl
        transition-all duration-300
        hover:border-detective-brass hover:bg-noir-charcoal/80
        animate-fade-in-scale
      "
      style={{
        animationDelay: `${0.2 + index * 0.15}s`,
      }}
    >
      {/* Profile Image */}
      <div className="relative w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-full overflow-hidden bg-noir-gunmetal border-2 border-detective-brass">
        {suspect.hasProfileImage && profileImageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="spinner w-8 h-8" />
              </div>
            )}
            <img
              src={profileImageUrl}
              alt={suspect.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)} // Show fallback on error
            />
          </>
        ) : (
          // Fallback: Initial letter
          <div className="w-full h-full flex items-center justify-center text-3xl md:text-4xl font-bold text-detective-brass">
            {suspect.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="text-detective-gold text-lg sm:text-xl font-bold text-center">
        {suspect.name}
      </h3>

      {/* Role (1-2 words) - WCAG 1.4.3 compliant contrast */}
      <div className="text-text-secondary text-sm sm:text-base font-medium text-center">
        {suspect.role}
      </div>

      {/* Claim (in quotes) */}
      <div className="text-text-secondary text-sm sm:text-base italic text-center max-w-[200px]">
        "{suspect.claim}"
      </div>
    </div>
  );
}

/**
 * Slide2Suspects Component
 *
 * Displays suspect cards with progressive reveal animation
 */
export function Slide2Suspects({ slide, onNext, onPrevious }: Slide2SuspectsProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Load suspect profile images (2-stage loading system)
  const { images: suspectImages } = useSuspectImages(
    slide.suspectCards.map(s => s.suspectId)
  );

  // Fade in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        w-full max-w-6xl mx-auto
        flex flex-col items-center justify-center gap-6 md:gap-8
        transition-all duration-1000
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {/* Slide Title - WCAG 1.4.3 compliant contrast */}
      <div className="text-center">
        <h2 className="text-detective-gold text-sm sm:text-base font-mono uppercase tracking-wider mb-2">
          🔍 The Suspects
        </h2>
        <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-detective-gold to-transparent" />
      </div>

      {/* Suspect Cards Grid (3-4 dynamic) */}
      <div
        className={`
          grid gap-4 md:gap-6 w-full
          ${slide.suspectCards.length === 3
            ? 'grid-cols-1 md:grid-cols-3'
            : 'grid-cols-2 md:grid-cols-4'
          }
        `}
      >
        {slide.suspectCards.map((suspect, index) => (
          <SuspectCardDisplay
            key={suspect.suspectId}
            suspect={suspect}
            index={index}
            profileImageUrl={suspectImages[suspect.suspectId]}
          />
        ))}
      </div>

      {/* Constraint Statement */}
      <div
        className="
          text-text-secondary text-lg sm:text-xl md:text-2xl
          font-display text-center
          max-w-2xl px-4
          animate-fade-in-up
        "
        style={{
          animationDelay: `${0.2 + slide.suspectCards.length * 0.15}s`,
          textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
        }}
      >
        {slide.constraintStatement}
      </div>

      {/* Tension Line (emphasized) */}
      <div
        className="
          text-evidence-blood text-xl sm:text-2xl md:text-3xl
          font-display font-bold italic text-center px-4
          animate-fade-in-up
        "
        style={{
          animationDelay: `${0.4 + slide.suspectCards.length * 0.15}s`,
          textShadow: '0 4px 12px rgba(139, 0, 0, 0.5)',
        }}
      >
        {slide.tensionLine}
      </div>

      {/* Navigation Buttons */}
      <div
        className="
          flex items-center gap-3 sm:gap-4 mt-4
          animate-fade-in-up
        "
        style={{
          animationDelay: `${0.6 + slide.suspectCards.length * 0.15}s`,
        }}
      >
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
          "
          aria-label="Go back to crime scene discovery slide"
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">←</span>
            Back
          </span>
        </button>

        <button
          onClick={onNext}
          className="
            group
            px-5 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-3
            min-h-[48px] sm:min-h-[56px]
            bg-noir-gunmetal/50 hover:bg-detective-gold/20 active:bg-detective-gold/30
            border-2 border-detective-brass hover:border-detective-gold
            rounded-lg sm:rounded-xl
            text-detective-gold hover:text-detective-amber text-base sm:text-lg font-semibold
            transition-all duration-base
            backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-deepBlack
          "
          aria-label="Continue to final challenge slide"
          data-slide-action="primary"
        >
          <span className="flex items-center gap-2">
            Continue
            <span className="text-xl group-hover:translate-x-1 transition-transform">
              →
            </span>
          </span>
        </button>
      </div>

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
            transform: scale(0.9);
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
          animation: fade-in-scale 0.6s ease-out both;
        }

        /* Accessibility: Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-fade-in-scale {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
