/**
 * DetectiveArchetypeSelector.tsx
 *
 * UI component for selecting detective personality archetype
 * Allows players to choose their preferred detective voice
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { DetectiveArchetype } from '../../utils/detectiveVoices';
import { getVoiceLine } from '../../utils/detectiveVoices';

export interface DetectiveArchetypeInfo {
  archetype: DetectiveArchetype;
  name: string;
  description: string;
  emoji: string;
  personality: string[];
  sampleVoiceLine: string;
}

const ARCHETYPE_INFO: DetectiveArchetypeInfo[] = [
  {
    archetype: 'sherlock',
    name: '셜록 (Sherlock)',
    description: '지적이고 자신감 넘치는 고전적 탐정',
    emoji: '🎩',
    personality: ['논리적', '자신감', '분석적'],
    sampleVoiceLine: '초등학생도 알 수 있는 증거지. 그러나 중요하네.',
  },
  {
    archetype: 'noir',
    name: '누아르 (Noir)',
    description: '냉소적이고 세상을 달관한 하드보일드 탐정',
    emoji: '🌃',
    personality: ['냉소적', '달관', '드라마틱'],
    sampleVoiceLine: '이 도시는 언제나 더러운 비밀을 숨기지.',
  },
  {
    archetype: 'enthusiast',
    name: '열정가 (Enthusiast)',
    description: '에너지 넘치고 열정적인 탐정',
    emoji: '🎉',
    personality: ['열정적', '긍정적', '활기찬'],
    sampleVoiceLine: '우와! 대박! 완전 핵심 증거잖아!',
  },
  {
    archetype: 'methodical',
    name: '방법론자 (Methodical)',
    description: '체계적이고 정확한 과학 수사관',
    emoji: '📌',
    personality: ['체계적', '정밀', '전문적'],
    sampleVoiceLine: '중요한 증거를 발견했습니다. 신중히 분석이 필요합니다.',
  },
  {
    archetype: 'rookie',
    name: '초보자 (Rookie)',
    description: '열심히 배우는 신참 탐정',
    emoji: '😊',
    personality: ['겸손', '열정', '친근'],
    sampleVoiceLine: '헉! 이거... 엄청 중요한 거 아니야?!',
  },
];

export interface DetectiveArchetypeSelectorProps {
  selectedArchetype: DetectiveArchetype;
  onSelect: (archetype: DetectiveArchetype) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * DetectiveArchetypeSelector Component
 *
 * Modal for selecting detective personality archetype
 */
export function DetectiveArchetypeSelector({
  selectedArchetype,
  onSelect,
  isOpen,
  onClose,
}: DetectiveArchetypeSelectorProps) {
  const [hoveredArchetype, setHoveredArchetype] = useState<DetectiveArchetype | null>(null);

  if (!isOpen) return null;

  const handleSelect = (archetype: DetectiveArchetype) => {
    onSelect(archetype);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="
          relative bg-gray-900 border-2 border-detective-gold
          rounded-xl shadow-2xl
          max-w-3xl w-full max-h-[90vh] overflow-y-auto
        "
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-detective-gold/30 z-10">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-detective-gold mb-2">
                  탐정 스타일 선택
                </h2>
                <p className="text-gray-400">
                  당신의 수사 스타일에 맞는 탐정 캐릭터를 선택하세요
                </p>
              </div>

              <button
                onClick={onClose}
                className="
                  text-gray-400 hover:text-white
                  transition-colors duration-200
                  p-2 rounded-lg hover:bg-gray-800
                  focus:outline-none focus:ring-2 focus:ring-detective-gold
                "
                aria-label="닫기"
                type="button"
              >
                <svg
                  className="w-6 h-6"
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
          </div>
        </div>

        {/* Archetype cards */}
        <div className="p-6 space-y-4">
          {ARCHETYPE_INFO.map((info, index) => {
            const isSelected = selectedArchetype === info.archetype;
            const isHovered = hoveredArchetype === info.archetype;

            return (
              <motion.button
                key={info.archetype}
                className={`
                  w-full text-left p-5 rounded-lg
                  border-2 transition-all duration-200
                  ${
                    isSelected
                      ? 'border-detective-gold bg-detective-gold/10'
                      : 'border-gray-700 bg-gray-800/50 hover:border-detective-gold/50 hover:bg-gray-800'
                  }
                `}
                onClick={() => handleSelect(info.archetype)}
                onMouseEnter={() => setHoveredArchetype(info.archetype)}
                onMouseLeave={() => setHoveredArchetype(null)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  {/* Emoji */}
                  <motion.div
                    className="text-5xl flex-shrink-0"
                    animate={{
                      scale: isHovered ? 1.2 : 1,
                      rotate: isHovered ? 10 : 0,
                    }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {info.emoji}
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {info.name}
                      </h3>
                      {isSelected && (
                        <motion.span
                          className="text-detective-gold"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring' }}
                        >
                          ✓
                        </motion.span>
                      )}
                    </div>

                    <p className="text-gray-400 mb-3">{info.description}</p>

                    {/* Personality traits */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {info.personality.map(trait => (
                        <span
                          key={trait}
                          className="
                            px-2 py-1 text-xs
                            bg-gray-700/50 text-gray-300
                            rounded-full
                          "
                        >
                          {trait}
                        </span>
                      ))}
                    </div>

                    {/* Sample voice line */}
                    <div
                      className={`
                        p-3 rounded border-l-4
                        ${
                          isSelected
                            ? 'border-detective-gold bg-detective-gold/5'
                            : 'border-gray-600 bg-gray-900/50'
                        }
                      `}
                    >
                      <p className="text-sm text-gray-300 italic">
                        "{info.sampleVoiceLine}"
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-detective-gold/30 p-6">
          <p className="text-center text-sm text-gray-400">
            선택한 탐정 스타일은 증거 발견 시 나타나는 멘트에 영향을 줍니다
          </p>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Compact archetype selector button
 */
export interface ArchetypeSelectorButtonProps {
  currentArchetype: DetectiveArchetype;
  onClick: () => void;
}

export function ArchetypeSelectorButton({
  currentArchetype,
  onClick,
}: ArchetypeSelectorButtonProps) {
  const info = ARCHETYPE_INFO.find(a => a.archetype === currentArchetype);

  if (!info) return null;

  return (
    <motion.button
      onClick={onClick}
      className="
        flex items-center gap-3 px-4 py-3
        bg-gray-800 hover:bg-gray-700
        border border-gray-700 hover:border-detective-gold/50
        rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-detective-gold
      "
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="text-3xl">{info.emoji}</span>
      <div className="text-left">
        <div className="text-xs text-gray-400">탐정 스타일</div>
        <div className="text-sm font-bold text-white">{info.name}</div>
      </div>
      <svg
        className="w-5 h-5 text-gray-400 ml-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </motion.button>
  );
}
