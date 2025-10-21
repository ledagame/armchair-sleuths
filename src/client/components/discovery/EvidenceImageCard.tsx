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
 *
 * States:
 * - loading: Shows skeleton loader
 * - loaded: Shows actual image with hover effects
 * - error: Shows fallback SVG gradient
 */
export function EvidenceImageCard({
  evidence,
  imageUrl,
  imageStatus,
  onClick
}: EvidenceImageCardProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleClick = () => {
    if (imageStatus === 'loaded' && imageUrl) {
      setIsLightboxOpen(true);
    }
    onClick?.();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="evidence-image-card"
        onClick={handleClick}
        style={{
          cursor: imageStatus === 'loaded' ? 'pointer' : 'default',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          aspectRatio: '1 / 1',
          background: '#1a1a1a'
        }}
      >
        {/* Loading State */}
        {imageStatus === 'loading' && (
          <SkeletonLoader />
        )}

        {/* Loaded State */}
        {imageStatus === 'loaded' && imageUrl && (
          <motion.img
            src={imageUrl}
            alt={evidence.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            whileHover={{ scale: 1.05 }}
          />
        )}

        {/* Error State (Fallback SVG) */}
        {imageStatus === 'error' && (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              textAlign: 'center',
              padding: '20px'
            }}
          >
            <div>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div>{evidence.name}</div>
            </div>
          </div>
        )}

        {/* Evidence Name Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
            padding: '12px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {evidence.name}
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
