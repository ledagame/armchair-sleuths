/**
 * RelatedEvidence.tsx
 *
 * Display evidence related to current evidence
 * Shows connections and allows quick navigation between evidence
 */

import { motion } from 'framer-motion';
import type { EvidenceItem } from '@/shared/types/Evidence';
import { getEvidenceRarity } from '@/client/utils/evidenceRarity';

export interface RelatedEvidenceProps {
  evidence: EvidenceItem;
  relatedEvidence: EvidenceItem[];
  onEvidenceClick?: (evidenceId: string) => void;
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
 * Group evidence by type
 */
function groupByType(evidence: EvidenceItem[]): Record<string, EvidenceItem[]> {
  return evidence.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, EvidenceItem[]>);
}

/**
 * Get Korean label for evidence type
 */
function getTypeLabel(type: EvidenceItem['type']): string {
  const labelMap: Record<EvidenceItem['type'], string> = {
    physical: '물리적 증거',
    testimony: '증언',
    financial: '금융 기록',
    communication: '통신 기록',
    alibi: '알리바이',
    forensic: '감식 결과',
    documentary: '문서',
  };
  return labelMap[type] || '증거';
}

/**
 * RelatedEvidence Component
 */
export function RelatedEvidence({
  evidence,
  relatedEvidence,
  onEvidenceClick,
}: RelatedEvidenceProps) {
  if (!relatedEvidence || relatedEvidence.length === 0) {
    return null;
  }

  const groupedEvidence = groupByType(relatedEvidence);
  const groups = Object.entries(groupedEvidence);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-detective-gold mb-3 flex items-center gap-2">
        <span>🔗</span>
        <span>연관 증거</span>
      </h3>

      {groups.map(([type, items], groupIndex) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
          className="space-y-2"
        >
          {/* Type Header */}
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
            <span>{getEvidenceEmoji(type as EvidenceItem['type'])}</span>
            <span>{getTypeLabel(type as EvidenceItem['type'])}</span>
            <span className="text-xs opacity-70">({items.length})</span>
          </div>

          {/* Evidence Items */}
          <div className="space-y-2 pl-6">
            {items.map((item, index) => {
              const rarityConfig = getEvidenceRarity(item);

              return (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: groupIndex * 0.1 + index * 0.05 }}
                  onClick={() => onEvidenceClick?.(item.id)}
                  className={`
                    w-full p-3 rounded-lg border-2 text-left
                    transition-all duration-200
                    hover:scale-102 hover:shadow-md
                    focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-charcoal
                    ${rarityConfig.borderColor} ${rarityConfig.bgColor}
                  `}
                  aria-label={`${item.name} 증거 보기`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-lg">{rarityConfig.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-white text-sm truncate">
                          {item.name}
                        </div>
                        <div className={`text-xs ${rarityConfig.color} font-semibold`}>
                          {rarityConfig.label}
                        </div>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm flex-shrink-0">→</span>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}

      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          💡 연관 증거를 함께 분석하면 사건의 전체 그림을 파악할 수 있습니다
        </p>
      </div>
    </div>
  );
}
