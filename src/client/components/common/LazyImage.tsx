/**
 * LazyImage.tsx
 *
 * Lazy-loaded image component with loading states and fallbacks
 * Optimized for performance with Intersection Observer
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  eager?: boolean; // Skip lazy loading
}

type ImageLoadState = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * LazyImage Component
 * Implements lazy loading with Intersection Observer API
 */
export function LazyImage({
  src,
  alt,
  fallbackSrc,
  placeholder,
  className = '',
  width,
  height,
  onLoad,
  onError,
  eager = false,
}: LazyImageProps) {
  const [loadState, setLoadState] = useState<ImageLoadState>('idle');
  const [currentSrc, setCurrentSrc] = useState<string>(placeholder || '');
  const [isInView, setIsInView] = useState(eager);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /**
   * Setup Intersection Observer for lazy loading
   */
  useEffect(() => {
    if (eager || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [eager]);

  /**
   * Load image when in view
   */
  useEffect(() => {
    if (!isInView || !src) return;

    setLoadState('loading');

    const img = new Image();

    img.onload = () => {
      setCurrentSrc(src);
      setLoadState('loaded');
      onLoad?.();
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);

      // Try fallback if available
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        console.log(`Trying fallback image: ${fallbackSrc}`);
        setCurrentSrc(fallbackSrc);

        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setLoadState('loaded');
        };
        fallbackImg.onerror = () => {
          setLoadState('error');
          onError?.(new Error(`Failed to load image and fallback: ${src}`));
        };
        fallbackImg.src = fallbackSrc;
      } else {
        setLoadState('error');
        onError?.(new Error(`Failed to load image: ${src}`));
      }
    };

    img.src = src;
  }, [isInView, src, fallbackSrc, currentSrc, onLoad, onError]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <AnimatePresence mode="wait">
        {/* Loading state */}
        {loadState === 'loading' && (
          <motion.div
            key="loading"
            className="absolute inset-0 flex items-center justify-center bg-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 border-4 border-gray-600 border-t-detective-gold rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Error state */}
        {loadState === 'error' && (
          <motion.div
            key="error"
            className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-4xl mb-2">🖼️</span>
            <span className="text-sm">이미지 없음</span>
          </motion.div>
        )}

        {/* Loaded image */}
        {loadState === 'loaded' && currentSrc && (
          <motion.img
            key="image"
            ref={imgRef}
            src={currentSrc}
            alt={alt}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            loading="lazy"
          />
        )}

        {/* Placeholder */}
        {loadState === 'idle' && (
          <div
            ref={imgRef}
            className="w-full h-full bg-gray-800 animate-pulse"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Evidence image with automatic fallback
 */
export interface EvidenceImageProps {
  evidenceId: string;
  imageUrl?: string;
  evidenceName: string;
  className?: string;
  eager?: boolean;
}

export function EvidenceImage({
  evidenceId,
  imageUrl,
  evidenceName,
  className = '',
  eager = false,
}: EvidenceImageProps) {
  // Generate fallback gradient based on evidence ID
  const getFallbackGradient = (id: string): string => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue}, 50%, 30%), hsl(${(hue + 60) % 360}, 50%, 20%))`;
  };

  if (!imageUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center ${className}`}
        style={{ background: getFallbackGradient(evidenceId) }}
      >
        <span className="text-6xl mb-2">📋</span>
        <span className="text-sm text-gray-400 text-center px-4">
          {evidenceName}
        </span>
      </div>
    );
  }

  return (
    <LazyImage
      src={imageUrl}
      alt={evidenceName}
      className={className}
      eager={eager}
      onError={(error) => {
        console.error(`Failed to load evidence image for ${evidenceId}:`, error);
      }}
    />
  );
}

/**
 * Suspect image with automatic fallback
 */
export interface SuspectImageProps {
  suspectId: string;
  imageUrl?: string;
  suspectName: string;
  className?: string;
  eager?: boolean;
}

export function SuspectImage({
  suspectId,
  imageUrl,
  suspectName,
  className = '',
  eager = false,
}: SuspectImageProps) {
  const getAvatarEmoji = (id: string): string => {
    const emojis = ['👤', '👨', '👩', '🧑', '👴', '👵', '🧔', '👨‍💼', '👩‍💼'];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return emojis[hash % emojis.length];
  };

  if (!imageUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 ${className}`}
      >
        <span className="text-6xl mb-2">{getAvatarEmoji(suspectId)}</span>
        <span className="text-sm text-gray-400 text-center px-4">
          {suspectName}
        </span>
      </div>
    );
  }

  return (
    <LazyImage
      src={imageUrl}
      alt={suspectName}
      className={className}
      eager={eager}
      onError={(error) => {
        console.error(`Failed to load suspect image for ${suspectId}:`, error);
      }}
    />
  );
}

/**
 * Progressive image loader with blur effect
 */
export interface ProgressiveImageProps {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
}

export function ProgressiveImage({
  src,
  placeholderSrc,
  alt,
  className = '',
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    img.onerror = () => {
      setIsLoading(false);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={currentSrc || src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{
          filter: isLoading && placeholderSrc ? 'blur(10px)' : 'blur(0px)',
        }}
        animate={{
          filter: isLoading && placeholderSrc ? 'blur(10px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.3 }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 border-4 border-gray-600 border-t-detective-gold rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
}
