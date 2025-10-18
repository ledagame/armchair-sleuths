/**
 * SuspectPanel.tsx
 *
 * Suspect panel component - Enhanced production version
 * Displays all suspects with emotional states and selection
 */

import { } from 'react';
import type { Suspect, EmotionalTone } from '../../types';

export interface SuspectPanelProps {
  suspects: Suspect[];
  selectedSuspectId: string | null;
  onSelectSuspect: (suspectId: string) => void;
}

/**
 * Enhanced suspect panel with better visual feedback
 */
export function SuspectPanel({ suspects, selectedSuspectId, onSelectSuspect }: SuspectPanelProps) {
  // Get emoji for emotional tone
  const getToneEmoji = (tone: EmotionalTone): string => {
    const toneMap: Record<EmotionalTone, string> = {
      cooperative: '😊',
      nervous: '😰',
      defensive: '😠',
      aggressive: '😡',
    };
    return toneMap[tone] || '😐';
  };

  // Get color for emotional tone
  const getToneColor = (tone: EmotionalTone): string => {
    const colorMap: Record<EmotionalTone, string> = {
      cooperative: 'text-green-400',
      nervous: 'text-yellow-400',
      defensive: 'text-orange-400',
      aggressive: 'text-red-400',
    };
    return colorMap[tone] || 'text-gray-400';
  };

  // Get tone label in Korean
  const getToneLabel = (tone: EmotionalTone): string => {
    const labelMap: Record<EmotionalTone, string> = {
      cooperative: '협조적',
      nervous: '불안함',
      defensive: '방어적',
      aggressive: '공격적',
    };
    return labelMap[tone] || '알 수 없음';
  };

  // Get suspicion level color
  const getSuspicionColor = (level: number): string => {
    if (level >= 70) return 'bg-red-500';
    if (level >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="suspect-panel p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">🕵️ 용의자 심문</h2>
        <p className="text-gray-400">용의자를 선택하여 심문을 시작하세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suspects.map((suspect) => {
          const isSelected = selectedSuspectId === suspect.id;

          return (
            <button
              key={suspect.id}
              onClick={() => onSelectSuspect(suspect.id)}
              className={`
                p-6 rounded-lg text-left transition-all
                transform hover:scale-105 active:scale-95
                ${
                  isSelected
                    ? 'bg-blue-600 border-4 border-blue-400 shadow-lg shadow-blue-500/50'
                    : 'bg-gray-800 hover:bg-gray-700 border-2 border-transparent'
                }
              `}
            >
              {/* Profile Image */}
              {suspect.profileImageUrl && (
                <div className="mb-4 flex justify-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-700 shadow-lg">
                    <img
                      src={suspect.profileImageUrl}
                      alt={`${suspect.name} profile`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Profile image placeholder */}
              {!suspect.profileImageUrl && (
                <div className="mb-4 flex justify-center">
                  <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                    <span className="text-6xl">👤</span>
                  </div>
                </div>
              )}

              {/* Header with name and emotion */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{suspect.name}</h3>
                  <p className="text-sm text-gray-400">{suspect.archetype}</p>
                </div>
                <span className={`text-4xl ${getToneColor(suspect.emotionalState.tone)}`}>
                  {getToneEmoji(suspect.emotionalState.tone)}
                </span>
              </div>

              {/* Background */}
              <div className="mb-4 pb-4 border-b border-gray-700">
                <p className="text-xs text-gray-500 mb-1">배경</p>
                <p className="text-sm text-gray-300 line-clamp-2">{suspect.background}</p>
              </div>

              {/* Emotional state */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">감정 상태</span>
                  <span className={`text-xs font-bold ${getToneColor(suspect.emotionalState.tone)}`}>
                    {getToneLabel(suspect.emotionalState.tone)}
                  </span>
                </div>
              </div>

              {/* Suspicion level */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">의심 레벨</span>
                  <span className={`text-sm font-bold ${getToneColor(suspect.emotionalState.tone)}`}>
                    {suspect.emotionalState.suspicionLevel}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className={`
                      h-3 rounded-full transition-all duration-500 ease-out
                      ${getSuspicionColor(suspect.emotionalState.suspicionLevel)}
                    `}
                    style={{ width: `${suspect.emotionalState.suspicionLevel}%` }}
                  />
                </div>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div className="mt-4 pt-4 border-t border-blue-400">
                  <p className="text-sm text-center font-bold text-blue-200">
                    ✓ 선택됨
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!selectedSuspectId && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
          <p className="text-sm text-yellow-400 text-center">
            💡 용의자를 선택하면 대화를 시작할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}
