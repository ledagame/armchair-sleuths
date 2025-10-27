/**
 * EvidenceCard.tsx
 *
 * Individual evidence card for displaying in the evidence notebook
 * Shows evidence summary with click-to-expand functionality
 *
 * REFACTORED: Noir detective design system integration
 */

import { motion } from 'framer-motion';
import type { EvidenceItem } from '@/shared/types/Evidence';

export interface EvidenceCardProps {
  evidence: EvidenceItem;
  onClick: () => void;
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
    critical: 'border-evidence-blood bg-evidence-blood/10',
    important: 'border-detective-amber bg-detective-amber/10',
    minor: 'border-noir-fog bg-noir-gunmetal',
  };
  return colorMap[relevance] || 'border-noir-fog bg-noir-gunmetal';
}

/**
 * Get label for evidence relevance (Korean)
 */
function getRelevanceLabel(relevance: EvidenceItem['relevance']): string {
  const labelMap: Record<EvidenceItem['relevance'], string> = {
    critical: '핵심',
    important: '중요',
    minor: '보조',
  };
  return labelMap[relevance] || '증거';
}

/**
 * Get text color for relevance
 */
function getRelevanceTextColor(relevance: EvidenceItem['relevance']): string {
  const colorMap: Record<EvidenceItem['relevance'], string> = {
    critical: 'text-evidence-blood',
    important: 'text-detective-amber',
    minor: 'text-text-muted',
  };
  return colorMap[relevance] || 'text-text-muted';
}

/**
 * EvidenceCard Component
 */
export function EvidenceCard({ evidence, onClick }: EvidenceCardProps) {
  return (
    <motion.div
      className={`
        card p-4 sm:p-5 rounded-lg border-2 cursor-pointer
        transition-all duration-base
        hover:shadow-glow-strong active:scale-98
        ${getRelevanceColor(evidence.relevance)}
      `}
      onClick={onClick}
      whileHover={{
        y: -4,
        scale: 1.01,
        transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] }
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.1 }
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`${evidence.name} 증거 자세히 보기`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl" aria-hidden="true">
            {getEvidenceEmoji(evidence.type)}
          </span>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-text-primary">
              {evidence.name}
            </h3>
            <span className={`text-xs uppercase font-semibold ${getRelevanceTextColor(evidence.relevance)}`}>
              {getRelevanceLabel(evidence.relevance)}
            </span>
          </div>
        </div>
      </div>

      {/* Description preview */}
      <p className="text-sm sm:text-base text-text-secondary line-clamp-2 mb-2">
        {evidence.description}
      </p>

      {/* Click hint */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-noir-fog">
        <span className="text-xs sm:text-sm text-text-muted">
          발견 장소: {evidence.foundAtLocationId}
        </span>
        <span className="text-xs sm:text-sm text-detective-gold font-semibold hover:text-detective-amber transition-colors">
          자세히 보기 →
        </span>
      </div>
    </motion.div>
  );
}
