/**
 * CaseOverview.tsx
 *
 * Case overview display component - Mobile-First Noir Detective Design
 * Shows victim, weapon, location, and mission details with responsive layout
 *
 * Design System: Noir Detective Theme
 * Accessibility: WCAG 2.1 AA compliant
 * Responsive: 320px → 2560px
 */

import { motion } from 'framer-motion';
import type { CaseData } from '../../types';

export interface CaseOverviewProps {
  caseData: CaseData;
  onStartInvestigation: () => void;
}

/**
 * Case Overview Component
 *
 * Features:
 * - Mobile-first responsive layout (1 col → 2 col → 3 col)
 * - Noir detective design system
 * - Stagger animation on mount
 * - Accessibility compliant (ARIA labels, focus management)
 * - Touch-friendly (≥44px targets)
 */
export function CaseOverview({ caseData, onStartInvestigation }: CaseOverviewProps) {
  // Animation variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.65, 0, 0.35, 1],
      },
    },
  };

  return (
    <motion.div
      className="case-overview px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header - Detective Gold Gradient */}
      <motion.div
        variants={itemVariants}
        className="
          detective-gradient
          p-6 sm:p-8
          rounded-lg sm:rounded-xl
          shadow-glow
          mb-6 sm:mb-8
        "
      >
        <h1 className="
          text-3xl sm:text-4xl lg:text-5xl
          font-display font-bold
          text-noir-deepBlack
          mb-2
        ">
          🕵️ 살인 사건 발생
        </h1>
        <p className="text-lg sm:text-xl text-noir-gunmetal font-semibold">
          {caseData.date}
        </p>
      </motion.div>

      {/* Crime Scene Image */}
      {caseData.imageUrl && (
        <motion.div
          variants={itemVariants}
          className="
            relative overflow-hidden
            rounded-lg sm:rounded-xl
            mb-6 sm:mb-8
            shadow-lg
          "
        >
          <img
            src={caseData.imageUrl}
            alt="범죄 현장 사진"
            className="
              w-full
              h-64 sm:h-80 lg:h-96
              object-cover
            "
            loading="lazy"
          />
          <div className="
            absolute inset-0
            bg-gradient-to-t from-noir-deepBlack/80 to-transparent
          " />
          <div className="
            absolute bottom-4 left-4
            sm:bottom-6 sm:left-6
          ">
            <p className="
              text-detective-gold
              text-lg sm:text-xl
              font-display font-bold
              mb-1
              text-glow
            ">
              범행 현장
            </p>
            <p className="text-text-primary text-sm sm:text-base">
              {caseData.location.name}
            </p>
          </div>
        </motion.div>
      )}

      {/* Case Details Grid - Mobile: 1 col, Tablet: 2 col, Desktop: 2 col */}
      <motion.div
        variants={itemVariants}
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4 sm:gap-6
          mb-6 sm:mb-8
        "
      >
        {/* Victim Info - Evidence Blood Theme */}
        <div
          className="
            bg-noir-charcoal
            p-6
            rounded-lg sm:rounded-xl
            border-2 border-evidence-blood
            hover:border-evidence-blood/70
            hover:shadow-md
            transition-all duration-base
          "
          role="article"
          aria-label="피해자 정보"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">👤</span>
            <h2 className="
              text-xl sm:text-2xl
              font-display font-bold
              text-detective-gold
            ">
              피해자
            </h2>
          </div>
          <p className="
            text-lg sm:text-xl
            font-semibold
            text-evidence-blood
            mb-2
          ">
            {caseData.victim.name}
          </p>
          <p className="text-sm sm:text-base text-text-secondary mb-3">
            {caseData.victim.background}
          </p>
          <div className="mt-4 pt-4 border-t border-noir-fog">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              관계
            </p>
            <p className="text-sm text-text-primary">
              {caseData.victim.relationship}
            </p>
          </div>
        </div>

        {/* Weapon Info - Detective Brass Theme */}
        <div
          className="
            bg-noir-charcoal
            p-6
            rounded-lg sm:rounded-xl
            border-2 border-detective-brass
            hover:border-detective-gold
            hover:shadow-md
            transition-all duration-base
          "
          role="article"
          aria-label="무기 정보"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">🔪</span>
            <h2 className="
              text-xl sm:text-2xl
              font-display font-bold
              text-detective-gold
            ">
              발견된 무기
            </h2>
          </div>
          <p className="
            text-lg sm:text-xl
            font-semibold
            text-detective-amber
            mb-2
          ">
            {caseData.weapon.name}
          </p>
          <p className="text-sm sm:text-base text-text-secondary">
            {caseData.weapon.description}
          </p>
        </div>

        {/* Location Info - Evidence Clue Theme */}
        <div
          className="
            bg-noir-charcoal
            p-6
            rounded-lg sm:rounded-xl
            border-2 border-evidence-clue
            hover:border-evidence-clue/70
            hover:shadow-md
            transition-all duration-base
          "
          role="article"
          aria-label="장소 정보"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">📍</span>
            <h2 className="
              text-xl sm:text-2xl
              font-display font-bold
              text-detective-gold
            ">
              범행 장소
            </h2>
          </div>
          <p className="
            text-lg sm:text-xl
            font-semibold
            text-evidence-clue
            mb-2
          ">
            {caseData.location.name}
          </p>
          <p className="text-sm sm:text-base text-text-secondary mb-3">
            {caseData.location.description}
          </p>
          <div className="mt-4 pt-4 border-t border-noir-fog">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
              분위기
            </p>
            <p className="text-sm text-text-primary">
              {caseData.location.atmosphere}
            </p>
          </div>
        </div>

        {/* Mission Info - Detective Gold Theme */}
        <div
          className="
            bg-noir-charcoal
            p-6
            rounded-lg sm:rounded-xl
            border-2 border-detective-gold
            shadow-glow
            hover:shadow-glow-strong
            transition-all duration-base
          "
          role="article"
          aria-label="임무 정보"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">🎯</span>
            <h2 className="
              text-xl sm:text-2xl
              font-display font-bold
              text-detective-gold
            ">
              당신의 임무
            </h2>
          </div>
          <div className="space-y-2 text-sm sm:text-base text-text-primary">
            <p className="flex items-start gap-2">
              <span className="text-detective-gold mt-1" aria-hidden="true">✓</span>
              <span>{caseData.suspects.length}명의 용의자와 대화하세요</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-detective-gold mt-1" aria-hidden="true">✓</span>
              <span>증거를 수집하고 모순을 찾으세요</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-detective-gold mt-1" aria-hidden="true">✓</span>
              <span>5W1H 답변을 제출하세요</span>
            </p>
          </div>
          <div className="
            mt-4 pt-4
            border-t border-noir-fog
            flex items-center gap-2
          ">
            <span className="text-detective-amber text-lg" aria-hidden="true">⚠️</span>
            <p className="text-xs sm:text-sm text-detective-amber font-semibold">
              한 번만 제출할 수 있습니다
            </p>
          </div>
        </div>
      </motion.div>

      {/* Suspects Preview */}
      <motion.div
        variants={itemVariants}
        className="
          bg-noir-charcoal
          p-6 sm:p-8
          rounded-lg sm:rounded-xl
          border-2 border-noir-fog
          hover:border-detective-brass
          transition-all duration-base
          mb-6 sm:mb-8
        "
        role="region"
        aria-label="용의자 목록"
      >
        <h3 className="
          text-xl sm:text-2xl
          font-display font-bold
          text-detective-gold
          mb-4 sm:mb-6
        ">
          🔍 용의자 ({caseData.suspects.length}명)
        </h3>
        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-4
        ">
          {caseData.suspects.map((suspect, index) => (
            <motion.div
              key={suspect.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 0.6 + index * 0.1,
              }}
              className="
                bg-noir-gunmetal
                p-4
                rounded-lg
                border border-noir-fog
                hover:border-detective-brass
                hover:bg-noir-smoke
                transition-all duration-base
              "
            >
              <p className="
                font-bold
                text-base sm:text-lg
                text-text-primary
                mb-1
              ">
                {suspect.name}
              </p>
              <p className="text-xs sm:text-sm text-text-muted capitalize">
                {suspect.archetype}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Start Investigation Button - Touch-Friendly */}
      <motion.div
        variants={itemVariants}
        className="flex justify-center pt-4 sm:pt-6"
      >
        <button
          onClick={onStartInvestigation}
          className="
            btn-primary
            px-8 py-4
            sm:px-10 sm:py-5
            text-lg sm:text-xl
            font-bold
            rounded-lg sm:rounded-xl
            min-h-[48px] sm:min-h-[56px]
            transform hover:scale-105 active:scale-95
            shadow-lg hover:shadow-glow-strong
            transition-all duration-base
            focus:outline-none focus:ring-4 focus:ring-detective-gold/50
          "
          aria-label="수사 시작하기"
        >
          🔍 수사 시작하기
        </button>
      </motion.div>
    </motion.div>
  );
}
