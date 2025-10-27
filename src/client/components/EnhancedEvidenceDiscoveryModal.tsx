/**
 * EnhancedEvidenceDiscoveryModal.tsx
 *
 * Whimsy-enhanced evidence discovery modal
 * Features detective personalities, rarity system, and celebration effects
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import type { EvidenceItem } from '../../shared/types/Evidence';
import { useEvidenceImages } from '../hooks/useEvidenceImages';
import { EvidenceImageCard } from './discovery/EvidenceImageCard';
import { ConfettiExplosion, SparkleEffect, ShineEffect, GlowPulse } from './effects/ConfettiExplosion';
import {
  getEvidenceRarity,
  getDiscoveryFlavorText,
  getStaggerDelay,
  getCelebrationMessage,
  type RarityTier,
} from '../utils/evidenceRarity';
import {
  getDiscoveryVoiceLine,
  determineArchetype,
  type DetectiveArchetype,
} from '../utils/detectiveVoices';

export interface EnhancedEvidenceDiscoveryModalProps {
  isOpen: boolean;
  caseId: string;
  evidenceFound: EvidenceItem[];
  locationName: string;
  completionRate: number;
  totalEvidence?: number;
  onClose: () => void;
  onContinue?: () => void;
  onEvidenceClick?: (evidenceId: string) => void;
  playerStats?: {
    totalEvidence: number;
    thoroughSearches: number;
    quickSearches: number;
    exhaustiveSearches: number;
  };
}

/**
 * Enhanced Evidence Discovery Modal
 *
 * Whimsy features:
 * - Detective personality voice lines
 * - Evidence rarity system with visual effects
 * - Confetti celebrations for important finds
 * - Animated reveals with staggered timing
 * - Progress milestones with special messages
 */
export function EnhancedEvidenceDiscoveryModal({
  isOpen,
  caseId,
  evidenceFound,
  locationName,
  completionRate,
  totalEvidence,
  onClose,
  onContinue,
  onEvidenceClick,
  playerStats,
}: EnhancedEvidenceDiscoveryModalProps) {
  const { images: evidenceImages, isLoading: evidenceImagesLoading } = useEvidenceImages(caseId);
  const [showConfetti, setShowConfetti] = useState(false);
  const [detectiveArchetype, setDetectiveArchetype] = useState<DetectiveArchetype>('enthusiast');

  // Determine detective personality based on player behavior
  useEffect(() => {
    if (playerStats) {
      const archetype = determineArchetype(playerStats);
      setDetectiveArchetype(archetype);
    }
  }, [playerStats]);

  // Trigger confetti for legendary/secret evidence
  useEffect(() => {
    if (isOpen && evidenceFound.length > 0) {
      const hasLegendary = evidenceFound.some(e => {
        const rarity = getEvidenceRarity(e);
        return rarity.tier === 'legendary' || rarity.tier === 'secret';
      });

      if (hasLegendary) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
  }, [isOpen, evidenceFound]);

  // Get detective voice line
  const hasCritical = evidenceFound.some(e => e.relevance === 'critical');
  const hasImportant = evidenceFound.some(e => e.relevance === 'important');
  const voiceLine = getDiscoveryVoiceLine(
    detectiveArchetype,
    evidenceFound.length,
    hasCritical,
    hasImportant
  );

  // Check for milestone celebration
  const getMilestone = () => {
    if (evidenceFound.length === 0) return null;
    if (hasCritical) return 'critical_found';
    if (completionRate >= 100) return 'location_complete';
    if (playerStats && playerStats.totalEvidence === 1) return 'first_evidence';
    if (completionRate >= 50 && completionRate < 100) return 'half_complete';
    return null;
  };

  const milestone = getMilestone();
  const celebration = milestone ? getCelebrationMessage(milestone) : null;

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Confetti Effect */}
          <ConfettiExplosion
            trigger={showConfetti}
            intensity={hasCritical ? 'high' : 'medium'}
          />

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
              className="bg-gray-900 border-2 border-detective-gold rounded-lg max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-900 border-b border-detective-gold/30 z-10">
                <div className="p-4 sm:p-6 relative">
                  {/* Close button */}
                  <button
                    onClick={onClose}
                    className="
                      absolute top-2 right-2 sm:top-4 sm:right-4 z-20
                      text-gray-400 hover:text-white
                      transition-all duration-200
                      p-2 sm:p-2.5
                      rounded-lg hover:bg-gray-800/80
                      focus:outline-none focus:ring-2 focus:ring-detective-gold
                      min-w-[44px] min-h-[44px]
                      flex items-center justify-center
                      backdrop-blur-sm bg-gray-900/80
                    "
                    aria-label="닫기"
                    type="button"
                  >
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="text-center pr-12 sm:pr-0">
                    <motion.div
                      className="text-5xl sm:text-6xl mb-3 sm:mb-4"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                      {evidenceFound.length > 0 ? '🔍' : '🤔'}
                    </motion.div>

                    {/* Celebration Title */}
                    {celebration ? (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="text-4xl mb-2">{celebration.emoji}</div>
                        <h2 className="text-xl sm:text-2xl font-bold text-detective-gold mb-2">
                          {celebration.title}
                        </h2>
                        <p className="text-sm text-gray-400">{celebration.message}</p>
                      </motion.div>
                    ) : (
                      <>
                        <h2 className="text-xl sm:text-2xl font-bold text-detective-gold mb-2">
                          탐색 완료!
                        </h2>
                        <p className="text-sm sm:text-base text-gray-400">
                          <span className="font-bold text-white">{locationName}</span> 탐색 결과
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Detective Voice Line */}
              {voiceLine && (
                <motion.div
                  className="px-6 pt-4 pb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-detective-gold/10 border border-detective-gold/30 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      {voiceLine.emoji && (
                        <span className="text-2xl flex-shrink-0">{voiceLine.emoji}</span>
                      )}
                      <p className="text-sm text-gray-300 italic flex-1">
                        "{voiceLine.text}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Evidence count */}
              <div className="p-6 border-b border-gray-800">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-5xl font-bold text-detective-gold mb-2">
                    {evidenceFound.length}
                  </div>
                  <div className="text-gray-400">
                    {evidenceFound.length === 0
                      ? '증거를 발견하지 못했습니다'
                      : `개의 증거 발견`}
                  </div>
                </motion.div>

                {/* Evidence list with rarity effects */}
                {evidenceFound.length > 0 && (
                  <motion.div
                    className="mt-4 grid grid-cols-1 gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {evidenceFound.map((evidence, index) => {
                      const rarity = getEvidenceRarity(evidence);
                      const staggerDelay = getStaggerDelay(index, rarity.tier);

                      return (
                        <motion.div
                          key={evidence.id}
                          className="relative"
                          initial={{ opacity: 0, x: -20, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ delay: 0.6 + staggerDelay / 1000 }}
                        >
                          {/* Rarity Effects */}
                          {rarity.tier === 'legendary' && <ShineEffect active />}
                          {rarity.tier === 'rare' && <SparkleEffect active />}
                          {(rarity.tier === 'legendary' || rarity.tier === 'rare') && (
                            <GlowPulse
                              color={rarity.tier === 'legendary' ? 'yellow' : 'purple'}
                              active
                            />
                          )}

                          <div
                            className={`
                              relative border-2 rounded-lg p-3 cursor-pointer
                              transition-all duration-200 hover:scale-105
                              ${rarity.borderColor} ${rarity.bgColor}
                            `}
                            onClick={() => onEvidenceClick?.(evidence.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
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
                                  onClick={() => onEvidenceClick?.(evidence.id)}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xl">{getEvidenceEmoji(evidence.type)}</span>
                                  <span className="text-lg">{rarity.emoji}</span>
                                </div>
                                <h3 className="font-bold text-white mb-1">{evidence.name}</h3>
                                <div className={`text-xs ${rarity.color} font-bold mb-2`}>
                                  {rarity.label}
                                </div>
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  {evidence.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </div>

              {/* Completion rate */}
              <div className="p-6 border-b border-gray-800">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">이 장소 탐색률</span>
                    <span className="text-lg font-bold text-detective-gold">
                      {Math.round(completionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden relative">
                    <motion.div
                      className="h-3 bg-gradient-to-r from-detective-gold to-yellow-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.8 }}
                    />
                    {completionRate === 100 && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 1, delay: 1.5 }}
                      />
                    )}
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
                <motion.button
                  onClick={handleContinue}
                  className="
                    w-full px-6 py-3 bg-detective-gold hover:bg-detective-gold/90
                    text-gray-900 font-bold rounded-lg
                    transition-all
                  "
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {completionRate >= 100 ? '다음 장소로 →' : '계속 수사하기'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
