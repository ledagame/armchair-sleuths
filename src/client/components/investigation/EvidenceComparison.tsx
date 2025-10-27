/**
 * EvidenceComparison.tsx
 *
 * Side-by-side evidence comparison feature
 * Allows comparing 2-3 pieces of evidence to find similarities and differences
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EvidenceItem } from '@/shared/types/Evidence';
import { getEvidenceRarity } from '@/client/utils/evidenceRarity';

export interface EvidenceComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  availableEvidence: EvidenceItem[];
  preselectedEvidence?: EvidenceItem[];
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
 * Comparison Row Component
 */
interface ComparisonRowProps {
  label: string;
  values: (string | number)[];
  highlight?: boolean;
}

function ComparisonRow({ label, values, highlight }: ComparisonRowProps) {
  // Check if all values are the same
  const allSame = values.every(v => v === values[0]);

  return (
    <div
      className={`
        grid gap-3 p-3 rounded-lg border-2
        ${highlight && !allSame
          ? 'border-yellow-500 bg-yellow-900/10'
          : 'border-gray-700 bg-gray-900/30'
        }
      `}
      style={{ gridTemplateColumns: `150px repeat(${values.length}, 1fr)` }}
    >
      <div className="font-semibold text-gray-400 text-sm flex items-center">
        {label}
      </div>
      {values.map((value, index) => (
        <div
          key={index}
          className={`
            text-sm text-white p-2 rounded
            ${highlight && value !== values[0] ? 'bg-yellow-900/30 font-semibold' : ''}
          `}
        >
          {value}
        </div>
      ))}
    </div>
  );
}

/**
 * EvidenceComparison Component
 */
export function EvidenceComparison({
  isOpen,
  onClose,
  availableEvidence,
  preselectedEvidence = [],
}: EvidenceComparisonProps) {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem[]>(
    preselectedEvidence.slice(0, 3)
  );
  const [selectionMode, setSelectionMode] = useState(preselectedEvidence.length < 2);

  const handleAddEvidence = (evidence: EvidenceItem) => {
    if (selectedEvidence.length < 3 && !selectedEvidence.find(e => e.id === evidence.id)) {
      const newSelection = [...selectedEvidence, evidence];
      setSelectedEvidence(newSelection);
      if (newSelection.length >= 2) {
        setSelectionMode(false);
      }
    }
  };

  const handleRemoveEvidence = (evidenceId: string) => {
    const newSelection = selectedEvidence.filter(e => e.id !== evidenceId);
    setSelectedEvidence(newSelection);
    if (newSelection.length < 2) {
      setSelectionMode(true);
    }
  };

  const canCompare = selectedEvidence.length >= 2;

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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-noir-charcoal border-2 border-detective-gold rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-noir-charcoal border-b border-detective-gold/30 z-10 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-detective-gold flex items-center gap-2">
                    <span>⚖️</span>
                    <span>증거 비교</span>
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800
                             focus:outline-none focus:ring-2 focus:ring-detective-gold"
                    aria-label="닫기"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!canCompare && (
                  <p className="text-gray-400 text-sm mt-2">
                    비교할 증거를 2-3개 선택하세요 (현재: {selectedEvidence.length})
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Selection Mode */}
                {selectionMode && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">증거 선택</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableEvidence.map((evidence) => {
                        const isSelected = selectedEvidence.find(e => e.id === evidence.id);
                        const rarityConfig = getEvidenceRarity(evidence);

                        return (
                          <button
                            key={evidence.id}
                            onClick={() => handleAddEvidence(evidence)}
                            disabled={!!isSelected}
                            className={`
                              p-4 rounded-lg border-2 text-left transition-all
                              ${isSelected
                                ? 'border-detective-gold bg-detective-gold/10 opacity-50 cursor-not-allowed'
                                : `${rarityConfig.borderColor} ${rarityConfig.bgColor} hover:scale-102`
                              }
                            `}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">{getEvidenceEmoji(evidence.type)}</span>
                              <span className="font-bold text-white text-sm">{evidence.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {evidence.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Evidence Pills */}
                {selectedEvidence.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">선택된 증거</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvidence.map((evidence) => (
                        <div
                          key={evidence.id}
                          className="flex items-center gap-2 px-4 py-2 bg-detective-gold/20 border border-detective-gold rounded-full"
                        >
                          <span>{getEvidenceEmoji(evidence.type)}</span>
                          <span className="text-sm font-semibold text-white">{evidence.name}</span>
                          <button
                            onClick={() => handleRemoveEvidence(evidence.id)}
                            className="text-gray-400 hover:text-white transition-colors"
                            aria-label={`${evidence.name} 제거`}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {selectedEvidence.length < 3 && (
                        <button
                          onClick={() => setSelectionMode(true)}
                          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-full
                                   text-sm text-gray-300 hover:bg-gray-600 transition-colors"
                        >
                          + 증거 추가
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Comparison Table */}
                {canCompare && !selectionMode && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-bold text-white mb-4">비교 결과</h3>

                    {/* Basic Info */}
                    <ComparisonRow
                      label="증거 이름"
                      values={selectedEvidence.map(e => e.name)}
                    />
                    <ComparisonRow
                      label="증거 유형"
                      values={selectedEvidence.map(e => e.type)}
                      highlight
                    />
                    <ComparisonRow
                      label="중요도"
                      values={selectedEvidence.map(e => e.relevance)}
                      highlight
                    />
                    <ComparisonRow
                      label="발견 장소"
                      values={selectedEvidence.map(e => e.foundAtLocationId)}
                      highlight
                    />

                    {/* Descriptions */}
                    <div className="mt-6">
                      <h4 className="text-md font-bold text-detective-gold mb-3">상세 설명</h4>
                      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${selectedEvidence.length}, 1fr)` }}>
                        {selectedEvidence.map((evidence) => (
                          <div key={evidence.id} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                            <div className="font-semibold text-white mb-2 flex items-center gap-2">
                              <span>{getEvidenceEmoji(evidence.type)}</span>
                              <span>{evidence.name}</span>
                            </div>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {evidence.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analysis Tips */}
                    <div className="mt-6 p-4 bg-detective-gold/10 rounded-lg border border-detective-gold/30">
                      <h4 className="text-md font-bold text-detective-gold mb-2 flex items-center gap-2">
                        <span>💡</span>
                        <span>분석 팁</span>
                      </h4>
                      <ul className="text-sm text-gray-300 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-detective-gold">•</span>
                          <span>노란색으로 표시된 항목은 증거 간 차이가 있습니다</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-detective-gold">•</span>
                          <span>같은 장소에서 발견된 증거들은 서로 연관되어 있을 가능성이 높습니다</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-detective-gold">•</span>
                          <span>서로 다른 유형의 증거를 조합하면 사건의 전체 그림을 볼 수 있습니다</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-noir-charcoal border-t border-detective-gold/30 p-6">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-detective-gold hover:bg-detective-gold/90
                           text-noir-charcoal font-bold rounded-lg
                           transition-all transform hover:scale-105 active:scale-95"
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
