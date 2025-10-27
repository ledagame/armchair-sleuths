/**
 * SearchMethodSelector.tsx
 *
 * Allows player to choose search method (Quick/Thorough/Exhaustive)
 * Displays action point costs and success rates
 *
 * REFACTORED: Noir detective design system integration
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
    color: 'from-detective-gold to-detective-amber',
  },
  {
    type: 'thorough',
    name: 'Thorough Search',
    nameKo: '철저한 탐색',
    description: 'Balanced approach',
    descriptionKo: '균형잡힌 접근',
    actionCost: 2,
    icon: '🔍',
    color: 'from-evidence-clue to-detective-gold',
  },
  {
    type: 'exhaustive',
    name: 'Exhaustive Search',
    nameKo: '완전한 탐색',
    description: 'Find almost everything',
    descriptionKo: '거의 모든 것을 발견',
    actionCost: 3,
    icon: '🔬',
    color: 'from-evidence-poison to-evidence-blood',
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
 * - Mobile-first responsive design
 */
export function SearchMethodSelector({
  selectedMethod,
  onSelect,
  disabled = false,
  actionPoints,
}: SearchMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm sm:text-base font-medium text-text-secondary">탐색 방법 선택:</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                relative p-3 sm:p-4 min-h-[120px] rounded-lg border-2 transition-all duration-base
                ${isSelected
                  ? 'border-detective-gold bg-detective-gold/20 shadow-glow'
                  : 'border-noir-fog bg-noir-charcoal'
                }
                ${isDisabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:border-detective-brass hover:bg-noir-gunmetal cursor-pointer'
                }
              `}
              whileHover={!isDisabled ? { scale: 1.03 } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
              aria-pressed={isSelected}
              aria-disabled={isDisabled}
              aria-label={`${method.nameKo} - ${method.actionCost} AP ${!canAfford ? '(AP 부족)' : ''}`}
            >
              {/* Icon */}
              <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">{method.icon}</div>

              {/* Name */}
              <div className="text-sm sm:text-base font-bold text-text-primary mb-2">
                {method.nameKo}
              </div>

              {/* Action Cost */}
              <div className="flex items-center justify-center gap-1 mb-2">
                <span className="text-xs text-text-muted">AP:</span>
                <span
                  className={`text-base sm:text-lg font-bold ${
                    canAfford ? 'text-detective-gold' : 'text-evidence-blood'
                  }`}
                >
                  {method.actionCost}
                </span>
              </div>

              {/* Description */}
              <div className="text-xs sm:text-sm text-text-secondary">
                {method.descriptionKo}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <span className="text-detective-gold text-xl sm:text-2xl" aria-hidden="true">✓</span>
                </motion.div>
              )}

              {/* Insufficient funds indicator */}
              {!canAfford && actionPoints !== undefined && (
                <div className="absolute inset-0 flex items-center justify-center bg-noir-deepBlack/80 rounded-lg">
                  <span className="text-evidence-blood text-xs sm:text-sm font-bold">
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
        <div className="flex items-center justify-between text-sm sm:text-base mt-3 p-3 sm:p-4 bg-noir-gunmetal border border-noir-fog rounded-lg">
          <span className="text-text-secondary">보유 액션 포인트:</span>
          <span className="text-detective-gold font-bold text-base sm:text-lg">{actionPoints} AP</span>
        </div>
      )}
    </div>
  );
}
