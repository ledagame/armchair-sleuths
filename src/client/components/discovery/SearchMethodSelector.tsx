/**
 * SearchMethodSelector.tsx
 *
 * Allows player to choose search method (Quick/Thorough/Exhaustive)
 * Displays action point costs and success rates
 */

import { motion } from 'framer-motion';
import type { SearchType } from '@/shared/types/Evidence';

export interface SearchMethodSelectorProps {
  selectedMethod: SearchType;
  onSelect: (method: SearchType) => void;
  disabled?: boolean;
  actionPoints?: number;
}

/**
 * Search method configuration
 */
const SEARCH_METHODS: Array<{
  type: SearchType;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  actionCost: number;
  icon: string;
  color: string;
}> = [
  {
    type: 'quick',
    name: 'Quick Search',
    nameKo: '빠른 탐색',
    description: 'Fast but less thorough',
    descriptionKo: '빠르지만 덜 철저함',
    actionCost: 1,
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    type: 'thorough',
    name: 'Thorough Search',
    nameKo: '철저한 탐색',
    description: 'Balanced approach',
    descriptionKo: '균형잡힌 접근',
    actionCost: 2,
    icon: '🔍',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'exhaustive',
    name: 'Exhaustive Search',
    nameKo: '완전한 탐색',
    description: 'Find almost everything',
    descriptionKo: '거의 모든 것을 발견',
    actionCost: 3,
    icon: '🔬',
    color: 'from-purple-500 to-pink-500',
  },
];

/**
 * SearchMethodSelector Component
 *
 * Features:
 * - Visual representation of each search method
 * - Action point cost display
 * - Disabled state when insufficient action points
 * - Smooth animations
 */
export function SearchMethodSelector({
  selectedMethod,
  onSelect,
  disabled = false,
  actionPoints,
}: SearchMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">탐색 방법 선택:</p>

      <div className="grid grid-cols-3 gap-2">
        {SEARCH_METHODS.map((method) => {
          const isSelected = selectedMethod === method.type;
          const canAfford = actionPoints === undefined || actionPoints >= method.actionCost;
          const isDisabled = disabled || !canAfford;

          return (
            <motion.button
              key={method.type}
              onClick={() => !isDisabled && onSelect(method.type)}
              disabled={isDisabled}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-detective-gold bg-detective-gold bg-opacity-20'
                  : 'border-gray-600 bg-gray-800'
                }
                ${isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-detective-gold hover:bg-opacity-10 cursor-pointer'
                }
              `}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
            >
              {/* Icon */}
              <div className="text-2xl mb-1">{method.icon}</div>

              {/* Name */}
              <div className="text-sm font-bold text-white mb-1">
                {method.nameKo}
              </div>

              {/* Action Cost */}
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xs text-gray-400">AP:</span>
                <span
                  className={`text-sm font-bold ${
                    canAfford ? 'text-detective-gold' : 'text-red-400'
                  }`}
                >
                  {method.actionCost}
                </span>
              </div>

              {/* Description */}
              <div className="text-xs text-gray-400">
                {method.descriptionKo}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-1 right-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <span className="text-detective-gold text-lg">✓</span>
                </motion.div>
              )}

              {/* Insufficient funds indicator */}
              {!canAfford && actionPoints !== undefined && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <span className="text-red-400 text-xs font-bold">
                    AP 부족
                  </span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Action Points Display */}
      {actionPoints !== undefined && (
        <div className="flex items-center justify-between text-sm mt-2 p-2 bg-gray-800 rounded">
          <span className="text-gray-400">보유 액션 포인트:</span>
          <span className="text-detective-gold font-bold">{actionPoints} AP</span>
        </div>
      )}
    </div>
  );
}
