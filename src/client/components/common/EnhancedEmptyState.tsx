/**
 * EnhancedEmptyState.tsx
 *
 * Whimsy-enhanced empty states with personality and humor
 * Turns boring "no data" screens into encouraging moments
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface EnhancedEmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  mood?: 'encouraging' | 'mysterious' | 'playful' | 'urgent';
}

/**
 * Enhanced empty state with animated icon and personality
 */
export function EnhancedEmptyState({
  icon = '🔍',
  title,
  description,
  action,
  children,
  mood = 'encouraging',
}: EnhancedEmptyStateProps) {
  // Icon animations based on mood
  const iconAnimations = {
    encouraging: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, -5, 0],
    },
    mysterious: {
      scale: [1, 1.05, 1],
      opacity: [0.8, 1, 0.8],
    },
    playful: {
      y: [0, -10, 0],
      rotate: [0, 10, -10, 0],
    },
    urgent: {
      scale: [1, 1.15, 1],
      rotate: [0, -3, 3, 0],
    },
  };

  // Button colors based on mood
  const buttonColors = {
    encouraging: 'bg-detective-gold hover:bg-detective-gold/90 text-noir-charcoal',
    mysterious: 'bg-purple-600 hover:bg-purple-700 text-white',
    playful: 'bg-pink-600 hover:bg-pink-700 text-white',
    urgent: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <motion.div
      className="text-center py-12 px-6 bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-700"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated icon */}
      <motion.div
        className="text-6xl mb-4"
        initial={{ scale: 0 }}
        animate={{
          scale: 1,
          ...iconAnimations[mood],
        }}
        transition={{
          scale: { delay: 0.1, type: 'spring', stiffness: 200 },
          ...iconAnimations[mood],
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        }}
      >
        {icon}
      </motion.div>

      {/* Title with fade-in */}
      <motion.h3
        className="text-xl font-bold text-gray-300 mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      {/* Description with fade-in */}
      <motion.p
        className="text-gray-500 mb-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {/* Action button with hover effects */}
      {action && (
        <motion.button
          onClick={action.onClick}
          className={`
            px-6 py-3 font-bold rounded-lg
            transition-all
            ${buttonColors[mood]}
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}

      {/* Additional content */}
      {children && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Playful empty evidence state
 */
export function PlayfulEmptyEvidenceState({ onExplore }: { onExplore?: () => void }) {
  const funFacts = [
    '진짜 탐정들은 증거 수집에 사건 해결 시간의 80%를 쓴답니다!',
    '셜록 홈즈는 발자국만 보고도 158가지를 알아낼 수 있었대요.',
    '첫 번째 증거가 가장 중요한 경우가 많아요. 꼼꼼히 보세요!',
    '때로는 가장 작은 단서가 사건을 해결하기도 해요.',
  ];

  const randomFact = funFacts[Math.floor(Math.random() * funFacts.length)];

  return (
    <EnhancedEmptyState
      icon="🕵️"
      title="증거 수집이 필요해요!"
      description="진짜 탐정처럼 현장을 샅샅이 뒤져보세요. 놓친 단서는 없을까요?"
      action={
        onExplore
          ? {
              label: '탐색 시작하기 🔍',
              onClick: onExplore,
            }
          : undefined
      }
      mood="playful"
    >
      <div className="mt-8 max-w-2xl mx-auto">
        {/* Fun fact */}
        <motion.div
          className="bg-detective-gold/10 border border-detective-gold/30 rounded-lg p-4 mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-gray-300 italic">
            💡 <strong>탐정 Tip:</strong> {randomFact}
          </p>
        </motion.div>

        {/* Search type guide */}
        <div className="bg-noir-charcoal border border-detective-gold/30 rounded-lg p-6">
          <h4 className="text-lg font-bold text-detective-gold mb-4 flex items-center gap-2 justify-center">
            <span>🎯</span>
            <span>탐색 방법 안내</span>
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            <motion.div
              className="space-y-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl text-center">⚡</div>
              <h5 className="font-bold text-white text-sm text-center">빠른 탐색</h5>
              <p className="text-xs text-gray-400">
                시간이 없다면! 눈에 보이는 증거를 빠르게 수집합니다.
              </p>
              <div className="text-xs text-detective-gold font-bold text-center">
                AP 1 • 성공률 중
              </div>
            </motion.div>

            <motion.div
              className="space-y-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl text-center">🔍</div>
              <h5 className="font-bold text-white text-sm text-center">철저한 탐색</h5>
              <p className="text-xs text-gray-400">
                추천! 구석구석 살피며 숨겨진 증거도 찾아냅니다.
              </p>
              <div className="text-xs text-detective-gold font-bold text-center">
                AP 2 • 성공률 높음
              </div>
            </motion.div>

            <motion.div
              className="space-y-2 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl text-center">🔬</div>
              <h5 className="font-bold text-white text-sm text-center">완벽한 탐색</h5>
              <p className="text-xs text-gray-400">
                완벽주의자라면! 모든 것을 뒤집어 거의 모든 증거를 찾습니다.
              </p>
              <div className="text-xs text-detective-gold font-bold text-center">
                AP 3 • 성공률 매우 높음
              </div>
            </motion.div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              <span className="text-detective-gold font-bold">전략 팁:</span> 의심스러운 장소는
              철저하게 조사하세요. 핵심 증거는 쉽게 드러나지 않아요! 🎯
            </p>
          </div>
        </div>
      </div>
    </EnhancedEmptyState>
  );
}

/**
 * Mysterious no results state
 */
export function MysteriousNoResultsState({ filterType, onClearFilter }: { filterType: string; onClearFilter: () => void }) {
  return (
    <EnhancedEmptyState
      icon="🤔"
      title={`${filterType} 증거가... 없어요?`}
      description="흠... 수상한데요. 이 유형의 증거가 정말 없는 걸까요, 아니면 아직 발견하지 못한 걸까요?"
      action={{
        label: '전체 증거 보기',
        onClick: onClearFilter,
      }}
      mood="mysterious"
    >
      <div className="mt-6 space-y-3">
        <p className="text-sm text-gray-400">다음을 시도해보세요:</p>
        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>🔍</span>
            <span>다른 장소를 더 탐색해보기</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🎯</span>
            <span>철저한 탐색으로 숨겨진 증거 찾기</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>필터를 바꿔서 다른 증거 확인하기</span>
          </div>
        </div>
      </div>
    </EnhancedEmptyState>
  );
}

/**
 * Encouraging progress state
 */
export function EncouragingProgressState({
  current,
  total,
  label,
  onContinue,
}: {
  current: number;
  total: number;
  label: string;
  onContinue?: () => void;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const remaining = total - current;

  const encouragements = [
    '거의 다 왔어요!',
    '잘하고 있어요!',
    '계속 이 페이스로!',
    '멋져요, 탐정님!',
  ];

  const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

  return (
    <EnhancedEmptyState
      icon="📊"
      title={percentage < 50 ? '좋은 시작이에요!' : encouragement}
      description={`${current}개 / ${total}개 ${label} (${percentage}%) - ${remaining}개만 더 찾으면 돼요!`}
      action={
        onContinue
          ? {
              label: '탐색 계속하기 →',
              onClick: onContinue,
            }
          : undefined
      }
      mood="encouraging"
    >
      <div className="max-w-md mx-auto">
        {/* Animated progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden relative">
          <motion.div
            className="h-4 bg-gradient-to-r from-detective-gold to-yellow-600 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Shine effect on progress bar */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
                ease: 'linear',
              }}
            />
          </motion.div>
        </div>

        {/* Milestone celebrations */}
        {percentage >= 25 && percentage < 50 && (
          <motion.p
            className="text-sm text-green-400 mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓ 1/4 달성!
          </motion.p>
        )}
        {percentage >= 50 && percentage < 75 && (
          <motion.p
            className="text-sm text-blue-400 mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓✓ 절반 넘었어요!
          </motion.p>
        )}
        {percentage >= 75 && percentage < 100 && (
          <motion.p
            className="text-sm text-purple-400 mt-2"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ✓✓✓ 거의 다 왔어요!
          </motion.p>
        )}
        {percentage === 100 && (
          <motion.p
            className="text-sm text-detective-gold mt-2 font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            🎉 완벽해요!
          </motion.p>
        )}
      </div>
    </EnhancedEmptyState>
  );
}

/**
 * Urgent call-to-action state
 */
export function UrgentActionState({ title, description, action }: {
  title: string;
  description: string;
  action: { label: string; onClick: () => void };
}) {
  return (
    <EnhancedEmptyState
      icon="⚠️"
      title={title}
      description={description}
      action={action}
      mood="urgent"
    >
      <motion.div
        className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg"
        animate={{
          borderColor: ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.6)', 'rgba(239, 68, 68, 0.3)'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <p className="text-sm text-red-300">
          시간이 중요해요! 빠르게 행동하세요.
        </p>
      </motion.div>
    </EnhancedEmptyState>
  );
}
