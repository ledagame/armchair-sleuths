/**
 * EvidenceDiscoveryModal.tsx
 *
 * Modal overlay for displaying search results
 * Shows discovered evidence count, location completion rate, and next actions
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { EvidenceItem } from '../../shared/types/Evidence';
import { useEvidenceImages } from '../hooks/useEvidenceImages';
import { EvidenceImageCard } from './discovery/EvidenceImageCard';

export interface EvidenceDiscoveryModalProps {
  isOpen: boolean;
  caseId: string;
  evidenceFound: EvidenceItem[];
  locationName: string;
  completionRate: number;
  totalEvidence?: number;
  onClose: () => void;
  onContinue?: () => void;
}

/**
 * EvidenceDiscoveryModal Component
 *
 * Features:
 * - Displays discovered evidence count
 * - Shows location completion percentage
 * - Lists evidence items with visual indicators
 * - Provides continue/close actions
 */
export function EvidenceDiscoveryModal({
  isOpen,
  caseId,
  evidenceFound,
  locationName,
  completionRate,
  totalEvidence,
  onClose,
  onContinue,
}: EvidenceDiscoveryModalProps) {
  // Fetch evidence images
  const { images: evidenceImages, isLoading: evidenceImagesLoading } = useEvidenceImages(caseId);

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      onClose();
    }
  };

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
      critical: 'text-red-400',
      important: 'text-yellow-400',
      minor: 'text-gray-400',
    };
    return colorMap[relevance] || 'text-gray-400';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
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
              className="bg-gray-900 border-2 border-detective-gold rounded-lg max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="p-6 border-b border-detective-gold/30 relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2"
                  aria-label="닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center">
                  <motion.div
                    className="text-6xl mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    🔍
                  </motion.div>
                  <h2 className="text-2xl font-bold text-detective-gold mb-2">
                    탐색 완료!
                  </h2>
                  <p className="text-gray-400">
                    <span className="font-bold text-white">{locationName}</span> 탐색 결과
                  </p>
                </div>
              </div>

              {/* Evidence count */}
              <div className="p-6 border-b border-gray-800">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-5xl font-bold text-detective-gold mb-2">
                    {evidenceFound.length}
                  </div>
                  <div className="text-gray-400">
                    {evidenceFound.length === 0 ? '증거를 발견하지 못했습니다' : '개의 증거 발견'}
                  </div>
                </motion.div>

                {/* Evidence list preview with images */}
                {evidenceFound.length > 0 && (
                  <motion.div
                    className="mt-4 grid grid-cols-2 gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {evidenceFound.map((evidence, index) => (
                      <motion.div
                        key={evidence.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <EvidenceImageCard
                          evidence={evidence}
                          imageUrl={evidenceImages[evidence.id]}
                          imageStatus={
                            evidenceImagesLoading
                              ? 'loading'
                              : evidenceImages[evidence.id]
                                ? 'loaded'
                                : 'error'
                          }
                        />
                        <div className="mt-2 text-center">
                          <div className="text-sm font-bold text-white">{evidence.name}</div>
                          <div className={`text-xs ${getRelevanceColor(evidence.relevance)}`}>
                            {evidence.relevance === 'critical' && '핵심 증거'}
                            {evidence.relevance === 'important' && '중요 증거'}
                            {evidence.relevance === 'minor' && '보조 증거'}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Completion rate */}
              <div className="p-6 border-b border-gray-800">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">이 장소 탐색률</span>
                    <span className="text-lg font-bold text-detective-gold">
                      {Math.round(completionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-detective-gold to-yellow-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  {totalEvidence && (
                    <div className="text-xs text-gray-500 mt-1 text-center">
                      {evidenceFound.length} / {totalEvidence} 증거 발견
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Actions */}
              <div className="p-6">
                <button
                  onClick={handleContinue}
                  className="
                    w-full px-6 py-3 bg-detective-gold hover:bg-detective-gold/90
                    text-gray-900 font-bold rounded-lg
                    transition-all transform hover:scale-105 active:scale-95
                  "
                >
                  계속 수사하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
