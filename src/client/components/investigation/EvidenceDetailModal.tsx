/**
 * EvidenceDetailModal.tsx
 *
 * Detailed view modal for selected evidence
 * Shows complete information including hints and analysis
 *
 * REFACTORED: Noir detective design system integration
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EvidenceItem } from '@/shared/types/Evidence';
import { SuspectConnections, type SuspectConnection } from './SuspectConnections';
import { RelatedEvidence } from './RelatedEvidence';
import { ImageLightbox } from '../discovery/ImageLightbox';
import { getEvidenceRarity } from '@/client/utils/evidenceRarity';
import { formatRelativeTime, formatAbsoluteTime } from '@/client/utils/timeFormat';
import { useFocusTrap } from '@/client/hooks/useFocusTrap';

export interface EvidenceDetailModalProps {
  evidence: EvidenceItem | null;
  isOpen: boolean;
  onClose: () => void;
  // Optional: Suspect connections data
  suspectConnections?: SuspectConnection[];
  onSuspectClick?: (suspectId: string) => void;
  // Optional: Related evidence data
  relatedEvidence?: EvidenceItem[];
  onRelatedEvidenceClick?: (evidenceId: string) => void;
  // Optional: Discovery metadata
  discoveredAt?: Date | number;
  discoveryLocation?: string;
}

/**
 * Get emoji for evidence type
 */
function getEvidenceEmoji(type: EvidenceItem['type']): string {
  const emojiMap: Record<EvidenceItem['type'], string> = {
    physical: '🔍',
    testimony: '💬',
    financial: '💰',
    communication: '📱',
    alibi: '⏰',
    forensic: '🔬',
    documentary: '📄',
  };
  return emojiMap[type] || '📋';
}

/**
 * Get color for evidence relevance - using design tokens
 */
function getRelevanceColor(relevance: EvidenceItem['relevance']): string {
  const colorMap: Record<EvidenceItem['relevance'], string> = {
    critical: 'border-evidence-blood bg-evidence-blood/20',
    important: 'border-detective-amber bg-detective-amber/20',
    minor: 'border-noir-fog bg-noir-gunmetal',
  };
  return colorMap[relevance] || 'border-noir-fog bg-noir-gunmetal';
}

/**
 * Get label for evidence relevance (Korean)
 */
function getRelevanceLabel(relevance: EvidenceItem['relevance']): string {
  const labelMap: Record<EvidenceItem['relevance'], string> = {
    critical: '핵심 증거',
    important: '중요 증거',
    minor: '보조 증거',
  };
  return labelMap[relevance] || '증거';
}

/**
 * EvidenceDetailModal Component
 * Enhanced with suspect connections, related evidence, and comprehensive metadata
 */
export function EvidenceDetailModal({
  evidence,
  isOpen,
  onClose,
  suspectConnections = [],
  onSuspectClick,
  relatedEvidence = [],
  onRelatedEvidenceClick,
  discoveredAt,
  discoveryLocation,
}: EvidenceDetailModalProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Focus trap for accessibility
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!evidence) return null;

  const rarityConfig = getEvidenceRarity(evidence);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background-overlay z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
            onClick={onClose}
            aria-label="닫기"
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              ref={modalRef}
              className="bg-noir-charcoal border-2 border-detective-gold rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-glow-strong"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{
                duration: 0.25,
                ease: [0.65, 0, 0.35, 1]
              }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="evidence-detail-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-noir-charcoal border-b border-detective-gold/30 z-10">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <span className="text-3xl sm:text-4xl flex-shrink-0" aria-hidden="true">
                        {getEvidenceEmoji(evidence.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2
                          id="evidence-detail-title"
                          className="text-lg sm:text-2xl font-display font-bold text-text-primary break-words"
                        >
                          {evidence.name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`
                            text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block font-semibold
                            ${getRelevanceColor(evidence.relevance)}
                          `}>
                            {getRelevanceLabel(evidence.relevance)}
                          </span>
                          <span className={`
                            text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full inline-block font-semibold
                            ${rarityConfig.borderColor} ${rarityConfig.bgColor} ${rarityConfig.color}
                          `}>
                            {rarityConfig.emoji} {rarityConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bookmark button */}
                      <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`
                          flex-shrink-0 transition-all duration-base p-2 sm:p-2.5 rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-charcoal
                          min-w-[48px] min-h-[48px] flex items-center justify-center
                          ${isBookmarked
                            ? 'text-detective-gold bg-detective-gold/20 hover:bg-detective-gold/30'
                            : 'text-text-muted hover:text-text-primary hover:bg-noir-gunmetal'
                          }
                        `}
                        aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
                        type="button"
                      >
                        <svg
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          fill={isBookmarked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                          />
                        </svg>
                      </button>

                      {/* Close button - Touch-friendly */}
                      <button
                        onClick={onClose}
                        className="
                          flex-shrink-0 text-text-muted hover:text-text-primary
                          transition-all duration-base p-2 sm:p-2.5
                          hover:bg-noir-gunmetal rounded-lg
                          focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-charcoal
                          min-w-[48px] min-h-[48px] flex items-center justify-center
                        "
                        aria-label="닫기"
                        type="button"
                      >
                        <svg
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-detective-gold mb-2 flex items-center gap-2">
                    <span aria-hidden="true">📝</span>
                    <span>상세 설명</span>
                  </h3>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                    {evidence.description}
                  </p>
                </div>

                {/* Discovery Hint */}
                {evidence.discoveryHint && (
                  <div className="bg-noir-gunmetal p-4 rounded-lg border border-noir-fog">
                    <h3 className="text-sm font-bold text-text-secondary mb-2 flex items-center gap-2">
                      <span aria-hidden="true">💡</span>
                      <span>발견 단서</span>
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {evidence.discoveryHint}
                    </p>
                  </div>
                )}

                {/* Interpretation Hint */}
                {evidence.interpretationHint && (
                  <div className="bg-detective-gold/10 p-4 rounded-lg border border-detective-gold/30">
                    <h3 className="text-sm font-bold text-detective-gold mb-2 flex items-center gap-2">
                      <span aria-hidden="true">🔎</span>
                      <span>분석 힌트</span>
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {evidence.interpretationHint}
                    </p>
                  </div>
                )}

                {/* Evidence Image with Lightbox */}
                {evidence.imageUrl && (
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-detective-gold mb-3 flex items-center gap-2">
                      <span aria-hidden="true">📸</span>
                      <span>증거 사진</span>
                    </h3>
                    <motion.div
                      className="rounded-lg overflow-hidden border-2 border-noir-fog cursor-pointer hover:border-detective-brass transition-all duration-base"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsLightboxOpen(true)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsLightboxOpen(true);
                        }
                      }}
                      aria-label="이미지 확대"
                    >
                      <img
                        src={evidence.imageUrl}
                        alt={evidence.name}
                        className="w-full h-auto"
                        loading="lazy"
                      />
                      <div className="p-2 bg-noir-gunmetal text-center">
                        <p className="text-xs text-text-muted">
                          🔍 클릭하여 확대
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Suspect Connections */}
                {suspectConnections.length > 0 && (
                  <SuspectConnections
                    evidence={evidence}
                    connections={suspectConnections}
                    onSuspectClick={onSuspectClick}
                  />
                )}

                {/* Related Evidence */}
                {relatedEvidence.length > 0 && (
                  <RelatedEvidence
                    evidence={evidence}
                    relatedEvidence={relatedEvidence}
                    onEvidenceClick={onRelatedEvidenceClick}
                  />
                )}

                {/* Comprehensive Metadata */}
                <div className="space-y-3">
                  <h3 className="text-base sm:text-lg font-bold text-detective-gold mb-3 flex items-center gap-2">
                    <span aria-hidden="true">ℹ️</span>
                    <span>증거 정보</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-noir-gunmetal rounded-lg border border-noir-fog">
                    <div>
                      <p className="text-xs text-text-muted mb-1 font-semibold">증거 유형</p>
                      <p className="text-sm text-text-secondary flex items-center gap-2">
                        <span aria-hidden="true">{getEvidenceEmoji(evidence.type)}</span>
                        <span>{evidence.type}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1 font-semibold">중요도</p>
                      <p className="text-sm text-text-secondary">
                        {getRelevanceLabel(evidence.relevance)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1 font-semibold">발견 장소</p>
                      <p className="text-sm text-text-secondary">
                        {discoveryLocation || evidence.foundAtLocationId}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1 font-semibold">희귀도</p>
                      <p className={`text-sm ${rarityConfig.color} font-semibold`}>
                        {rarityConfig.emoji} {rarityConfig.label}
                      </p>
                    </div>
                    {discoveredAt && (
                      <>
                        <div>
                          <p className="text-xs text-text-muted mb-1 font-semibold">발견 시각</p>
                          <p className="text-sm text-text-secondary">
                            {formatRelativeTime(discoveredAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-text-muted mb-1 font-semibold">정확한 시각</p>
                          <p className="text-sm text-text-secondary">
                            {formatAbsoluteTime(discoveredAt)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Image Lightbox */}
              {isLightboxOpen && evidence.imageUrl && (
                <ImageLightbox
                  imageUrl={evidence.imageUrl}
                  evidenceName={evidence.name}
                  onClose={() => setIsLightboxOpen(false)}
                />
              )}

              {/* Footer */}
              <div className="sticky bottom-0 bg-noir-charcoal border-t border-detective-gold/30 p-4 sm:p-6">
                <button
                  onClick={onClose}
                  className="btn-primary w-full min-h-[48px] px-6 py-3"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
