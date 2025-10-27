import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/client/hooks/useFocusTrap';

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
 * - Focus trap for accessibility
 * - Keyboard controls (+/- for zoom)
 */
export function ImageLightbox({
  imageUrl,
  evidenceName,
  onClose
}: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const lightboxRef = useFocusTrap<HTMLDivElement>(true);

  // Handle escape key and zoom shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
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
        ref={lightboxRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.65, 0, 0.35, 1] }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label={`${evidenceName} 이미지 확대 보기`}
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
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
          <motion.button
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            whileHover={scale > 0.5 ? { scale: 1.1 } : {}}
            whileTap={scale > 0.5 ? { scale: 0.95 } : {}}
            aria-label="축소 (키보드: -)"
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              cursor: scale <= 0.5 ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              opacity: scale <= 0.5 ? 0.5 : 1
            }}
          >
            −
          </motion.button>
          <motion.button
            onClick={handleZoomIn}
            disabled={scale >= 3}
            whileHover={scale < 3 ? { scale: 1.1 } : {}}
            whileTap={scale < 3 ? { scale: 0.95 } : {}}
            aria-label="확대 (키보드: +)"
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              cursor: scale >= 3 ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              opacity: scale >= 3 ? 0.5 : 1
            }}
          >
            +
          </motion.button>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="닫기 (키보드: Esc)"
            style={{
              background: 'transparent',
              border: '2px solid white',
              color: 'white',
              width: '44px',
              height: '44px',
              minWidth: '44px',
              minHeight: '44px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '20px'
            }}
          >
            ✕
          </motion.button>
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
