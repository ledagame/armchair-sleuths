/**
 * SuspectConnections.tsx
 *
 * Display suspects connected to a piece of evidence
 * Shows relationship type and provides navigation to suspect profiles
 */

import { motion } from 'framer-motion';
import type { EvidenceItem } from '@/shared/types/Evidence';

export interface SuspectConnection {
  suspectId: string;
  suspectName: string;
  relationship: '주요 용의자' | '알리바이 연관' | '증언 제공' | '관련 인물';
  relationshipType: 'primary' | 'alibi' | 'testimony' | 'related';
  description: string;
}

export interface SuspectConnectionsProps {
  evidence: EvidenceItem;
  connections: SuspectConnection[];
  onSuspectClick?: (suspectId: string) => void;
}

/**
 * Get color for relationship type
 */
function getRelationshipColor(type: SuspectConnection['relationshipType']): string {
  const colorMap = {
    primary: 'text-red-400 border-red-500 bg-red-900/20',
    alibi: 'text-yellow-400 border-yellow-500 bg-yellow-900/20',
    testimony: 'text-blue-400 border-blue-500 bg-blue-900/20',
    related: 'text-gray-400 border-gray-500 bg-gray-900/20',
  };
  return colorMap[type];
}

/**
 * Get emoji for relationship type
 */
function getRelationshipEmoji(type: SuspectConnection['relationshipType']): string {
  const emojiMap = {
    primary: '🎯',
    alibi: '⏰',
    testimony: '💬',
    related: '👤',
  };
  return emojiMap[type];
}

/**
 * SuspectConnections Component
 */
export function SuspectConnections({
  evidence,
  connections,
  onSuspectClick,
}: SuspectConnectionsProps) {
  if (!connections || connections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-detective-gold mb-3 flex items-center gap-2">
        <span>👥</span>
        <span>관련 용의자</span>
      </h3>

      <div className="space-y-2">
        {connections.map((connection, index) => (
          <motion.button
            key={connection.suspectId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSuspectClick?.(connection.suspectId)}
            className={`
              w-full p-4 rounded-lg border-2 text-left
              transition-all duration-200
              hover:scale-102 hover:shadow-lg
              focus:outline-none focus:ring-2 focus:ring-detective-gold focus:ring-offset-2 focus:ring-offset-noir-charcoal
              ${getRelationshipColor(connection.relationshipType)}
            `}
            aria-label={`${connection.suspectName} 프로필 보기`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl flex-shrink-0">
                  {getRelationshipEmoji(connection.relationshipType)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white text-base">
                    {connection.suspectName}
                  </div>
                  <div className="text-xs font-semibold opacity-90 mt-0.5">
                    {connection.relationship}
                  </div>
                  <p className="text-sm opacity-80 mt-2 leading-relaxed">
                    {connection.description}
                  </p>
                </div>
              </div>
              <span className="text-gray-400 text-sm flex-shrink-0">→</span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <p className="text-xs text-gray-400 text-center">
          💡 용의자를 클릭하면 상세 정보를 확인할 수 있습니다
        </p>
      </div>
    </div>
  );
}
