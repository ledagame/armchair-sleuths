/**
 * EvidenceRevealCard.tsx
 *
 * Modal overlay for evidence discovery results
 * Displays discovered evidence with animations and detailed information
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { EvidenceItem } from '@/shared/types/Evidence';

export interface EvidenceRevealCardProps {
  isOpen: boolean;
  evidenceFound: EvidenceItem[];
  location: {
    id: string;
    name: string;
  };
  onClose: () => void;
}

/**
 * EvidenceRevealCard - Modal for displaying discovered evidence
 * Features:
 * - Fade in + slide up animation
 * - Evidence cards with staggered reveal
 * - Discovery count display
 * - Click outside to close
 */
export function EvidenceRevealCard({
  isOpen,
  evidenceFound,
  location,
  onClose,
}: EvidenceRevealCardProps) {
  // Get emoji for evidence type
  const getEvidenceEmoji = (type: EvidenceItem['type']): string => {
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
  };

  // Get color for evidence relevance
  const getRelevanceColor = (relevance: EvidenceItem['relevance']): string => {
    const colorMap: Record<EvidenceItem['relevance'], string> = {
      critical: 'border-red-500 bg-red-900/20',
      important: 'border-yellow-500 bg-yellow-900/20',
      minor: 'border-gray-500 bg-gray-900/20',
    };
    return colorMap[relevance] || 'border-gray-500 bg-gray-900/20';
  };

  // Get label for evidence relevance (Korean)
  const getRelevanceLabel = (relevance: EvidenceItem['relevance']): string => {
    const labelMap: Record<EvidenceItem['relevance'], string> = {
      critical: '핵심 증거',
      important: '중요 증거',
      minor: '보조 증거',
    };
    return labelMap[relevance] || '증거';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-label="닫기"
          />

          {/* Modal content */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-noir-charcoal border-2 border-detective-gold rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="evidence-reveal-title"
            >
              {/* Header */}
              <div className="sticky top-0 bg-noir-charcoal border-b border-detective-gold/30 p-6 z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2
                    id="evidence-reveal-title"
                    className="text-2xl font-bold text-detective-gold"
                  >
                    🔍 증거 발견!
                  </h2>
                  <button
                    onClick={onClose}
                    className="
                      text-gray-400 hover:text-white transition-colors
                      p-2 hover:bg-gray-800 rounded-lg
                    "
                    aria-label="닫기"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-400">
                  <span className="font-bold text-detective-gold">{location.name}</span>
                  에서 증거를 발견했습니다
                </p>

                {/* Discovery count */}
                <motion.div
                  className="mt-4 text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <span className="inline-block px-4 py-2 bg-detective-gold/20 text-detective-gold rounded-full font-bold">
                    {evidenceFound.length}개 증거 발견!
                  </span>
                </motion.div>
              </div>

              {/* Evidence list */}
              <div className="p-6 space-y-4">
                {evidenceFound.length === 0 ? (
                  <motion.div
                    className="text-center py-8 text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-lg mb-2">🤔</p>
                    <p>이 장소에서는 증거를 발견하지 못했습니다.</p>
                  </motion.div>
                ) : (
                  evidenceFound.map((evidence, index) => (
                    <motion.div
                      key={evidence.id}
                      className={`
                        p-4 rounded-lg border-2 transition-all
                        ${getRelevanceColor(evidence.relevance)}
                      `}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                    >
                      {/* Evidence header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">
                            {getEvidenceEmoji(evidence.type)}
                          </span>
                          <div>
                            <h3 className="font-bold text-lg text-white">
                              {evidence.name}
                            </h3>
                            <span className="text-xs text-gray-400 uppercase">
                              {getRelevanceLabel(evidence.relevance)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Evidence description */}
                      <p className="text-sm text-gray-300 mb-3">
                        {evidence.description}
                      </p>

                      {/* Discovery hint */}
                      {evidence.discoveryHint && (
                        <div className="pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-500 mb-1">발견 단서</p>
                          <p className="text-sm text-gray-400">
                            {evidence.discoveryHint}
                          </p>
                        </div>
                      )}

                      {/* Interpretation hint (for critical evidence) */}
                      {evidence.relevance === 'critical' && evidence.interpretationHint && (
                        <div className="pt-3 border-t border-gray-700 mt-3">
                          <p className="text-xs text-red-400 mb-1">💡 분석 힌트</p>
                          <p className="text-sm text-gray-300">
                            {evidence.interpretationHint}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-noir-charcoal border-t border-detective-gold/30 p-6">
                <button
                  onClick={onClose}
                  className="
                    w-full px-6 py-3 bg-detective-gold hover:bg-detective-gold/90
                    text-noir-charcoal font-bold rounded-lg
                    transition-all transform hover:scale-105 active:scale-95
                  "
                >
                  확인
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
