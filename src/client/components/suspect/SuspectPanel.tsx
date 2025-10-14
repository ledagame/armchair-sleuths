/**
 * SuspectPanel.tsx
 *
 * 용의자 패널 컴포넌트 (MVP)
 */

import React from 'react';

export interface Suspect {
  id: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  emotionalState: {
    suspicionLevel: number;
    tone: 'cooperative' | 'nervous' | 'defensive' | 'aggressive';
  };
}

export interface SuspectPanelProps {
  suspects: Suspect[];
  selectedSuspectId: string | null;
  onSelectSuspect: (suspectId: string) => void;
}

export function SuspectPanel({ suspects, selectedSuspectId, onSelectSuspect }: SuspectPanelProps) {
  const getToneEmoji = (tone: string) => {
    switch (tone) {
      case 'cooperative': return '😊';
      case 'nervous': return '😰';
      case 'defensive': return '😠';
      case 'aggressive': return '😡';
      default: return '😐';
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'cooperative': return 'text-green-400';
      case 'nervous': return 'text-yellow-400';
      case 'defensive': return 'text-orange-400';
      case 'aggressive': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="suspect-panel p-6">
      <h2 className="text-2xl font-bold mb-4">🕵️ 용의자</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suspects.map((suspect) => (
          <button
            key={suspect.id}
            onClick={() => onSelectSuspect(suspect.id)}
            className={`
              p-4 rounded-lg text-left transition-all
              ${selectedSuspectId === suspect.id
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-gray-800 hover:bg-gray-700'}
            `}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">{suspect.name}</h3>
              <span className={`text-2xl ${getToneColor(suspect.emotionalState.tone)}`}>
                {getToneEmoji(suspect.emotionalState.tone)}
              </span>
            </div>

            <p className="text-sm text-gray-400 mb-2">{suspect.archetype}</p>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">의심 레벨:</span>
              <div className="flex-1 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${suspect.emotionalState.suspicionLevel}%` }}
                />
              </div>
              <span className={getToneColor(suspect.emotionalState.tone)}>
                {suspect.emotionalState.suspicionLevel}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
