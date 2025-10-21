import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageLightboxProps {
  imageUrl: string;
  evidenceName: string;
  onClose: () => void;
}

/**
 * Full-screen image lightbox with zoom and pan
 *
 * Features:
 * - Click outside to close
 * - Zoom in/out buttons
 * - Drag to pan when zoomed
 * - Escape key to close
 */
export function ImageLightbox({
  imageUrl,
  evidenceName,
  onClose
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}
      >
        {/* Image */}
        <motion.img
          src={imageUrl}
          alt={evidenceName}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale, opacity: 1 }}
          style={{
            maxWidth: '90%',
            maxHeight: '90%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
          drag={scale > 1}
          dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
          onClick={(e) => e.stopPropagation()}
        />

        {/* Controls */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '12px 20px',
            borderRadius: '24px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              opacity: scale <= 0.5 ? 0.5 : 1
            }}
          >
            −
          </button>
          <button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px',
              opacity: scale >= 3 ? 0.5 : 1
            }}
          >
            +
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Image Name */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white',
            fontSize: '24px',
            fontWeight: 600,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {evidenceName}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
