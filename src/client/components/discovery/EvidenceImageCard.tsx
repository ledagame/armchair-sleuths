/**
 * EvidenceImageCard.tsx
 *
 * Evidence image card with progressive loading
 *
 * States:
 * - loading: Shows skeleton loader
 * - loaded: Shows actual image with hover effects
 * - error: Shows fallback gradient
 *
 * REFACTORED: Noir detective design system integration
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { EvidenceItem } from '../../../shared/types/Evidence';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { ImageLightbox } from './ImageLightbox';

interface EvidenceImageCardProps {
  evidence: EvidenceItem;
  imageUrl?: string;
  imageStatus: 'loading' | 'loaded' | 'error';
  onClick?: () => void;
}

/**
 * Evidence image card with progressive loading
 */
export function EvidenceImageCard({
  evidence,
  imageUrl,
  imageStatus,
  onClick
}: EvidenceImageCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleClick = () => {
    // If onClick is provided (e.g., from discovery modal), use it for navigation
    // Otherwise, open lightbox for in-place viewing
    if (onClick) {
      onClick();
    } else if (imageStatus === 'loaded' && imageUrl) {
      setIsLightboxOpen(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="evidence-image-card relative rounded-lg overflow-hidden bg-noir-charcoal border-2 border-noir-fog hover:border-detective-brass transition-all duration-base"
        onClick={handleClick}
        style={{
          cursor: (onClick || (imageStatus === 'loaded' && imageUrl)) ? 'pointer' : 'default',
          aspectRatio: '1 / 1',
        }}
        role={onClick || (imageStatus === 'loaded' && imageUrl) ? 'button' : 'img'}
        tabIndex={onClick || (imageStatus === 'loaded' && imageUrl) ? 0 : -1}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && (onClick || (imageStatus === 'loaded' && imageUrl))) {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label={`${evidence.name} 증거 이미지`}
      >
        {/* Loading State */}
        {imageStatus === 'loading' && (
          <div className="w-full h-full">
            <SkeletonLoader />
          </div>
        )}

        {/* Loaded State */}
        {imageStatus === 'loaded' && imageUrl && (
          <motion.img
            src={imageUrl}
            alt={evidence.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            loading="lazy"
          />
        )}

        {/* Error State (Fallback Gradient) - using noir palette */}
        {imageStatus === 'error' && (
          <div
            className="w-full h-full bg-gradient-to-br from-evidence-poison to-evidence-clue flex items-center justify-center p-4 sm:p-5"
          >
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">🔍</div>
              <div className="text-sm sm:text-base font-medium text-text-primary">{evidence.name}</div>
            </div>
          </div>
        )}

        {/* Evidence Name Overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-noir-deepBlack/90 via-noir-deepBlack/60 to-transparent p-3 sm:p-4"
        >
          <p className="text-sm sm:text-base font-semibold text-text-primary truncate">
            {evidence.name}
          </p>
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      {isLightboxOpen && imageUrl && (
        <ImageLightbox
          imageUrl={imageUrl}
          evidenceName={evidence.name}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
    </>
  );
}
