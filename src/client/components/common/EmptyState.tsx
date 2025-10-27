/**
 * EmptyState.tsx
 *
 * Empty state components for various scenarios
 * Provides guidance and call-to-action when no content is available
 *
 * REFACTORED: Noir detective design system integration
 */

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  } | undefined;
  children?: ReactNode;
}

/**
 * Generic empty state component
 */
export function EmptyState({ icon = '🔍', title, description, action, children }: EmptyStateProps) {
  return (
    <motion.div
      className="text-center py-8 sm:py-12 px-4 sm:px-6 bg-noir-charcoal rounded-lg border-2 border-dashed border-noir-fog"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
    >
      <motion.div
        className="text-5xl sm:text-6xl mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        aria-hidden="true"
      >
        {icon}
      </motion.div>

      <motion.h3
        className="text-lg sm:text-xl font-bold text-text-primary mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>

      <motion.p
        className="text-sm sm:text-base text-text-secondary mb-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          onClick={action.onClick}
          className="btn-primary min-h-[48px] px-6 py-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}

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
 * Evidence Empty State (Enhanced for Phase 2)
 * Complete tutorial with 3-step guide, progress indicator, and action points breakdown
 */
interface EvidenceEmptyStateProps {
  onSwitchToLocationTab?: (() => void) | undefined;
}

export function EvidenceEmptyState({ onSwitchToLocationTab }: EvidenceEmptyStateProps) {
  return (
    <motion.div
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section with Magnifying Glass */}
      <div className="text-center mb-6 sm:mb-8">
        <motion.div
          className="text-6xl sm:text-8xl mb-4"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          aria-hidden="true"
        >
          🔍
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-display font-bold text-detective-gold mb-3">
          아직 발견한 증거가 없습니다
        </h2>

        <p className="text-text-secondary text-base sm:text-lg">
          사건을 해결하려면 먼저 장소를 탐색하여 증거를 수집해야 합니다
        </p>
      </div>

      {/* 3-Step Tutorial Guide */}
      <motion.div
        className="card-elevated p-5 sm:p-6 mb-6 sm:mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h3 className="text-lg sm:text-xl font-bold text-detective-gold mb-4 flex items-center gap-2">
          <span aria-hidden="true">📖</span>
          <span>증거 수집 가이드</span>
        </h3>

        <div className="space-y-3 sm:space-y-4">
          {/* Step 1: 장소 탐색 */}
          <motion.div
            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-noir-charcoal rounded-lg border border-noir-fog hover:border-detective-brass transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            role="article"
            aria-label="Step 1: 장소 탐색"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-detective-gold text-noir-deepBlack font-bold rounded-full flex items-center justify-center text-base sm:text-lg">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base text-text-primary mb-1">장소 탐색</h4>
              <p className="text-text-secondary text-xs sm:text-sm">
                "위치" 탭으로 이동하여 탐색 가능한 장소들을 확인하세요
              </p>
            </div>
            <div className="flex-shrink-0 text-xl sm:text-2xl" aria-hidden="true">🗺️</div>
          </motion.div>

          {/* Step 2: 정밀 수색 */}
          <motion.div
            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-noir-charcoal rounded-lg border border-noir-fog hover:border-detective-brass transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            role="article"
            aria-label="Step 2: 정밀 수색"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-detective-gold text-noir-deepBlack font-bold rounded-full flex items-center justify-center text-base sm:text-lg">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base text-text-primary mb-1">정밀 수색</h4>
              <p className="text-text-secondary text-xs sm:text-sm">
                관심 있는 장소를 선택하고 "정밀 수색" 버튼을 클릭하세요
              </p>
            </div>
            <div className="flex-shrink-0 text-xl sm:text-2xl" aria-hidden="true">🔬</div>
          </motion.div>

          {/* Step 3: 증거 발견 */}
          <motion.div
            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-noir-charcoal rounded-lg border border-noir-fog hover:border-detective-brass transition-colors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            role="article"
            aria-label="Step 3: 증거 발견"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-detective-gold text-noir-deepBlack font-bold rounded-full flex items-center justify-center text-base sm:text-lg">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm sm:text-base text-text-primary mb-1">증거 발견</h4>
              <p className="text-text-secondary text-xs sm:text-sm">
                발견한 증거는 자동으로 이 노트에 기록됩니다
              </p>
            </div>
            <div className="flex-shrink-0 text-xl sm:text-2xl" aria-hidden="true">📝</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Progress Indicator (0/10) */}
      <motion.div
        className="bg-noir-charcoal border border-noir-fog rounded-lg p-4 sm:p-6 mb-4 sm:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        role="region"
        aria-label="Progress indicator"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-sm sm:text-base text-text-secondary">수집 진행도</h4>
          <span className="text-detective-gold font-bold text-base sm:text-lg" aria-label="0 of 10 evidence collected">
            0/10
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-noir-gunmetal rounded-full h-3 overflow-hidden border border-noir-fog" role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={10}>
          <motion.div
            className="h-full bg-gradient-to-r from-detective-gold to-detective-amber"
            initial={{ width: '0%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 0.5, delay: 0.7 }}
          />
        </div>

        <p className="text-text-muted text-xs sm:text-sm mt-2">
          최소 5개의 증거를 수집해야 사건을 해결할 수 있습니다
        </p>
      </motion.div>

      {/* Action Points Cost Breakdown */}
      <motion.div
        className="bg-detective-gold/10 border border-detective-gold/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <h4 className="font-bold text-sm sm:text-base text-detective-gold mb-3 flex items-center gap-2">
          <span aria-hidden="true">⚡</span>
          <span>행동력 소모</span>
        </h4>

        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-noir-charcoal/50 rounded min-h-[48px]">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl" aria-hidden="true">👀</span>
              <span className="text-text-secondary">일반 수색</span>
            </div>
            <span className="text-detective-gold font-bold">2 AP</span>
          </div>
          <div className="flex items-center justify-between p-2 sm:p-3 bg-noir-charcoal/50 rounded min-h-[48px]">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl" aria-hidden="true">🔍</span>
              <span className="text-text-secondary">정밀 수색</span>
            </div>
            <span className="text-detective-gold font-bold">5 AP</span>
          </div>
          <div className="flex items-center justify-between p-2 sm:p-3 bg-noir-charcoal/50 rounded min-h-[48px]">
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl" aria-hidden="true">💬</span>
              <span className="text-text-secondary">심문</span>
            </div>
            <span className="text-detective-gold font-bold">3 AP</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-detective-gold/20">
          <p className="text-text-muted text-xs text-center">
            💡 행동력은 시간이 지나면 자동으로 회복됩니다
          </p>
        </div>
      </motion.div>

      {/* CTA Button: 장소 탐색하러 가기 */}
      {onSwitchToLocationTab && (
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            onClick={onSwitchToLocationTab}
            className="btn-primary min-h-[48px] px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go to location exploration"
          >
            🗺️ 장소 탐색하러 가기
          </motion.button>

          <p className="text-text-muted text-xs sm:text-sm mt-3">
            첫 번째 증거를 발견하고 수사를 시작하세요!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Empty evidence state (legacy - maintained for backwards compatibility)
 */
export function EmptyEvidenceState({ onExplore }: { onExplore?: (() => void) | undefined }) {
  return <EvidenceEmptyState onSwitchToLocationTab={onExplore} />;
}

/**
 * Filtered empty state (when filter returns no results)
 */
export function FilteredEmptyState({ filterType, onClearFilter }: { filterType: string; onClearFilter: () => void }) {
  return (
    <EmptyState
      icon="🔎"
      title={`${filterType} 증거가 없습니다`}
      description="이 유형의 증거를 아직 발견하지 못했습니다. 다른 필터를 선택하거나 더 많은 장소를 탐색하세요."
      action={{
        label: '전체 보기',
        onClick: onClearFilter,
      }}
    />
  );
}

/**
 * Error state with retry
 */
export function ErrorState({ error, onRetry }: { error: string; onRetry?: (() => void) | undefined }) {
  return (
    <motion.div
      className="p-4 sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-evidence-blood/20 border-2 border-evidence-blood rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-3 sm:gap-4">
          <motion.span
            className="text-3xl sm:text-4xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
            aria-hidden="true"
          >
            ⚠️
          </motion.span>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-evidence-blood mb-2">오류가 발생했습니다</h3>
            <p className="text-sm sm:text-base text-text-primary mb-4">{error}</p>

            <div className="flex flex-wrap gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="min-h-[48px] px-4 sm:px-6 py-2 bg-evidence-blood hover:bg-evidence-blood/90 text-text-primary font-bold rounded-lg transition-all duration-base transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-evidence-blood focus:ring-offset-2 focus:ring-offset-noir-deepBlack"
                >
                  다시 시도
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="min-h-[48px] px-4 sm:px-6 py-2 bg-noir-gunmetal hover:bg-noir-smoke text-text-primary font-bold rounded-lg transition-all duration-base transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-detective-brass focus:ring-offset-2 focus:ring-offset-noir-deepBlack"
              >
                새로고침
              </button>
            </div>

            <div className="mt-4 p-3 bg-noir-deepBlack/50 rounded text-xs sm:text-sm text-text-secondary">
              <p className="font-bold mb-1 text-text-primary">문제가 계속되면:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>인터넷 연결을 확인하세요</li>
                <li>브라우저 캐시를 삭제해보세요</li>
                <li>다른 브라우저를 사용해보세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Network error state (offline)
 */
export function OfflineState({ onRetry }: { onRetry?: (() => void) | undefined }) {
  return (
    <ErrorState
      error="네트워크 연결이 끊어졌습니다. 인터넷 연결을 확인하고 다시 시도해주세요."
      onRetry={onRetry}
    />
  );
}

/**
 * 404 Not Found state
 */
export function NotFoundState({ resourceName = '데이터', onGoBack }: { resourceName?: string; onGoBack?: (() => void) | undefined }) {
  return (
    <EmptyState
      icon="❓"
      title={`${resourceName}를 찾을 수 없습니다`}
      description="요청하신 정보를 찾을 수 없습니다. 이미 삭제되었거나 잘못된 주소일 수 있습니다."
      action={onGoBack ? {
        label: '돌아가기',
        onClick: onGoBack,
      } : undefined}
    />
  );
}

/**
 * Progress indicator with empty state
 */
export function ProgressEmptyState({
  current,
  total,
  label,
  onContinue,
}: {
  current: number;
  total: number;
  label: string;
  onContinue?: (() => void) | undefined;
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <EmptyState
      icon="📊"
      title={`${current}개 / ${total}개 ${label}`}
      description={`${percentage}% 진행되었습니다. ${total - current}개 더 발견하세요!`}
      action={onContinue ? {
        label: '계속 탐색하기',
        onClick: onContinue,
      } : undefined}
    >
      <div className="max-w-md mx-auto">
        <div className="w-full bg-noir-gunmetal rounded-full h-4 overflow-hidden border border-noir-fog">
          <motion.div
            className="h-4 bg-gradient-to-r from-detective-gold to-detective-amber rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </EmptyState>
  );
}
