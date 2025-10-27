/**
 * LoadingSkeleton.tsx
 *
 * Skeleton loading components for better perceived performance
 * Provides visual feedback while content is loading
 *
 * REFACTORED: Noir detective design system integration
 */

import { motion } from 'framer-motion';

/**
 * Base skeleton pulse animation
 */
const pulseAnimation = {
  initial: { opacity: 0.4 },
  animate: { opacity: 1 },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  },
};

/**
 * Generic skeleton box
 */
export interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`skeleton-shimmer rounded ${className}`}
      style={{ width, height }}
      aria-hidden="true"
      aria-busy="true"
    />
  );
}

/**
 * Evidence card skeleton
 */
export function EvidenceCardSkeleton() {
  return (
    <motion.div
      className="p-4 sm:p-5 rounded-lg border-2 border-noir-fog bg-noir-charcoal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-hidden="true"
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3 mb-3">
        <Skeleton width="40px" height="40px" className="flex-shrink-0 rounded-lg" />
        <div className="flex-1">
          <Skeleton width="60%" height="20px" className="mb-2" />
          <Skeleton width="40%" height="14px" />
        </div>
      </div>

      {/* Description lines */}
      <div className="space-y-2 mb-3">
        <Skeleton width="100%" height="14px" />
        <Skeleton width="85%" height="14px" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-noir-fog">
        <Skeleton width="40%" height="12px" />
        <Skeleton width="30%" height="12px" />
      </div>
    </motion.div>
  );
}

/**
 * Evidence list skeleton - shows multiple cards
 */
export interface EvidenceListSkeletonProps {
  count?: number;
}

export function EvidenceListSkeleton({ count = 6 }: EvidenceListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <EvidenceCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Evidence detail modal skeleton
 */
export function EvidenceDetailSkeleton() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton width="50px" height="50px" className="flex-shrink-0 rounded-lg" />
        <div className="flex-1">
          <Skeleton width="70%" height="24px" className="mb-2" />
          <Skeleton width="30%" height="20px" />
        </div>
      </div>

      {/* Description section */}
      <div>
        <Skeleton width="40%" height="20px" className="mb-3" />
        <div className="space-y-2">
          <Skeleton width="100%" height="16px" />
          <Skeleton width="95%" height="16px" />
          <Skeleton width="90%" height="16px" />
        </div>
      </div>

      {/* Hint sections */}
      <div className="space-y-4">
        <div className="p-4 bg-noir-charcoal rounded-lg border border-noir-fog">
          <Skeleton width="30%" height="16px" className="mb-2" />
          <Skeleton width="100%" height="14px" />
          <Skeleton width="80%" height="14px" className="mt-2" />
        </div>

        <div className="p-4 bg-noir-charcoal rounded-lg border border-noir-fog">
          <Skeleton width="30%" height="16px" className="mb-2" />
          <Skeleton width="100%" height="14px" />
          <Skeleton width="85%" height="14px" className="mt-2" />
        </div>
      </div>

      {/* Image placeholder */}
      <Skeleton width="100%" height="300px" className="rounded-lg" />

      {/* Metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Skeleton width="50%" height="12px" className="mb-1" />
          <Skeleton width="70%" height="14px" />
        </div>
        <div>
          <Skeleton width="50%" height="12px" className="mb-1" />
          <Skeleton width="70%" height="14px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Notebook header skeleton
 */
export function NotebookHeaderSkeleton() {
  return (
    <div className="mb-6 sm:mb-8">
      <Skeleton width="250px" height="36px" className="mb-2" />
      <Skeleton width="100%" className="max-w-md" height="20px" />

      <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4">
        <Skeleton width="150px" height="40px" className="rounded-lg" />
        <Skeleton width="150px" height="40px" className="rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Filter bar skeleton
 */
export function FilterBarSkeleton() {
  return (
    <div className="mb-4 sm:mb-6 flex gap-2 flex-wrap">
      <Skeleton width="120px" height="40px" className="rounded-lg" />
      <Skeleton width="100px" height="40px" className="rounded-lg" />
      <Skeleton width="110px" height="40px" className="rounded-lg" />
      <Skeleton width="90px" height="40px" className="rounded-lg" />
    </div>
  );
}

/**
 * Complete notebook skeleton combining all elements
 */
export function EvidenceNotebookSkeleton() {
  return (
    <div className="p-4 sm:p-6">
      <NotebookHeaderSkeleton />
      <FilterBarSkeleton />
      <EvidenceListSkeleton count={6} />
    </div>
  );
}

/**
 * Mini loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-noir-fog border-t-detective-gold rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      aria-label="로딩 중"
      role="status"
    />
  );
}

/**
 * Inline loading indicator with text
 */
export function InlineLoading({ text = '로딩 중...' }: { text?: string }) {
  return (
    <div className="flex items-center gap-3" role="status" aria-live="polite">
      <LoadingSpinner size="sm" />
      <span className="text-text-secondary text-sm sm:text-base">{text}</span>
    </div>
  );
}
