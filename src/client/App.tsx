/**
 * App.tsx
 *
 * Main application component for Armchair Sleuths
 * Handles routing, state management, and screen orchestration
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaseOverview } from './components/case/CaseOverview';
import { SubmissionForm } from './components/submission/SubmissionForm';
import { ResultView } from './components/results/ResultView';
import { CinematicIntro } from './components/intro/cinematic/CinematicIntro';
import { ThreeSlideIntro } from './components/intro/ThreeSlideIntro';
import { InvestigationScreen } from './components/InvestigationScreen';
import { useCase } from './hooks/useCase';
import { useSuspect } from './hooks/useSuspect';
import { useSubmission } from './hooks/useSubmission';
import type { GameScreen, W4HAnswer, ScoringResult } from './types';

/**
 * Main App Component
 */
export const App = () => {
  // Game state
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('loading');
  const [userId, setUserId] = useState<string>('');
  const [scoringResult, setScoringResult] = useState<ScoringResult | null>(null);

  // Fetch case data
  const { caseData, loading: caseLoading, error: caseError, generating } = useCase();

  // Initialize user ID (in production, this would come from Reddit context)
  useEffect(() => {
    // Generate a unique user ID for this session
    // In production Devvit app, use context.reddit.getCurrentUsername()
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      localStorage.setItem('userId', newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Update screen based on case loading state
  useEffect(() => {
    if (caseLoading) {
      setCurrentScreen('loading');
    } else if (caseError) {
      setCurrentScreen('loading'); // Show error in loading screen
    } else if (caseData && currentScreen === 'loading') {
      // NEW: Check for introSlides first (3-slide system), then fall back to introNarration (5-scene cinematic)
      if (caseData.introSlides) {
        setCurrentScreen('intro'); // NEW: Use ThreeSlideIntro
      } else if (caseData.introNarration) {
        setCurrentScreen('intro'); // LEGACY: Use CinematicIntro
      } else {
        setCurrentScreen('case-overview');
      }
    }
  }, [caseLoading, caseError, caseData, currentScreen]);

  // Suspect management (only initialize when caseData is available)
  const { suspects, clearSelection } = useSuspect(
    caseData?.suspects || []
  );

  // Submission management
  const { submitAnswer, submitting } = useSubmission({
    caseId: caseData?.id || '',
    userId,
  });

  // Navigation handlers
  const handleIntroComplete = useCallback(() => {
    setCurrentScreen('case-overview');
  }, []);

  const handleStartInvestigation = useCallback(() => {
    // Always go to unified investigation screen (locations + suspects)
    setCurrentScreen('investigation');
  }, []);

  const handleGoToSubmission = useCallback(() => {
    setCurrentScreen('submission');
    clearSelection();
  }, [clearSelection]);

  const handleBackToInvestigation = useCallback(() => {
    setCurrentScreen('investigation');
  }, []);

  const handleSubmitAnswer = useCallback(
    async (answer: W4HAnswer) => {
      try {
        const result = await submitAnswer(answer);
        setScoringResult(result);
        setCurrentScreen('results');
      } catch (error) {
        console.error('Submission failed:', error);
        // Error is already handled in the hook
      }
    },
    [submitAnswer]
  );

  /**
   * Screen transition variants for AnimatePresence
   * Smooth fade + subtle slide animation
   */
  const screenVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.65, 0, 0.35, 1], // Custom easing curve
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: [0.65, 0, 0.35, 1],
      },
    },
  };

  // Render different screens
  const renderScreen = () => {
    // Loading screen - Mobile-First Noir Detective Design
    if (currentScreen === 'loading') {
      return (
        <div className="
          flex flex-col items-center justify-center
          min-h-screen
          px-4 sm:px-6
          bg-noir-deepBlack text-text-primary
        ">
          {caseLoading && (
            <>
              {/* Spinner - Using design system spinner class */}
              <div className="
                spinner
                w-16 h-16 sm:w-20 sm:h-20
                mb-6
              " />

              {generating ? (
                <>
                  <p className="
                    text-xl sm:text-2xl lg:text-3xl
                    font-display font-bold
                    text-detective-gold
                    text-center
                    mb-2
                  ">
                    🎲 새로운 사건을 생성하는 중...
                  </p>
                  <p className="
                    text-sm sm:text-base
                    text-text-secondary
                    text-center
                    max-w-md
                  ">
                    AI가 오늘의 미스터리를 만들고 있습니다 (30-60초 소요)
                  </p>
                </>
              ) : (
                <>
                  <p className="
                    text-xl sm:text-2xl lg:text-3xl
                    font-display font-bold
                    text-detective-gold
                    text-center
                    mb-2
                  ">
                    사건 파일을 불러오는 중...
                  </p>
                  <p className="
                    text-sm sm:text-base
                    text-text-secondary
                    text-center
                  ">
                    오늘의 미스터리를 준비하고 있습니다
                  </p>
                </>
              )}
            </>
          )}

          {caseError && (
            <>
              <div className="text-6xl sm:text-7xl mb-6" aria-hidden="true">❌</div>
              <p className="
                text-xl sm:text-2xl lg:text-3xl
                font-display font-bold
                text-evidence-blood
                text-center
                mb-3
              ">
                사건 파일을 불러올 수 없습니다
              </p>
              <p className="
                text-sm sm:text-base
                text-text-secondary
                text-center
                mb-8
                max-w-md
              ">
                {caseError}
              </p>

              {/* Action Buttons - Touch-Friendly */}
              <div className="
                mt-6
                flex flex-col sm:flex-row
                gap-4
                w-full sm:w-auto
                px-4 sm:px-0
              ">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/case/generate', { method: 'POST' });
                      if (response.ok) {
                        setTimeout(() => window.location.reload(), 2000);
                      }
                    } catch (e) {
                      console.error('Generation failed:', e);
                    }
                  }}
                  className="
                    btn-primary
                    px-6 py-3
                    min-h-[48px]
                    text-base sm:text-lg
                    font-bold
                    rounded-lg
                    w-full sm:w-auto
                  "
                  aria-label="새 케이스 생성하기"
                >
                  🎲 새 케이스 생성
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="
                    btn-secondary
                    px-6 py-3
                    min-h-[48px]
                    text-base sm:text-lg
                    font-bold
                    rounded-lg
                    w-full sm:w-auto
                  "
                  aria-label="페이지 새로고침"
                >
                  다시 시도
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    // Intro screen - support both new 3-slide system and legacy cinematic
    if (currentScreen === 'intro' && caseData) {
      // NEW: 3-slide system (preferred)
      // Add defensive null checks to ensure all required fields exist
      if (caseData.introSlides?.discovery && caseData.introSlides?.suspects && caseData.introSlides?.challenge) {
        return (
          <ThreeSlideIntro
            slides={caseData.introSlides}
            cinematicImages={caseData.cinematicImages}
            onComplete={handleIntroComplete}
            showSkipButton={true}
          />
        );
      }

      // LEGACY: 5-scene cinematic (backward compatibility)
      if (caseData.introNarration) {
        return (
          <CinematicIntro
            narration={caseData.introNarration}
            cinematicImages={caseData.cinematicImages}
            onComplete={handleIntroComplete}
          />
        );
      }

      // FALLBACK: If no intro data is available, skip to case overview
      console.warn('No intro data available, skipping to case overview');
      setCurrentScreen('case-overview');
    }

    // Case overview screen - Mobile-First Noir Design
    if (currentScreen === 'case-overview' && caseData) {
      return (
        <div className="
          min-h-screen
          bg-noir-deepBlack
          text-text-primary
        ">
          <CaseOverview caseData={caseData} onStartInvestigation={handleStartInvestigation} />
        </div>
      );
    }

    // Investigation screen (Unified: Locations + Suspects)
    if (currentScreen === 'investigation' && caseData) {
      return (
        <InvestigationScreen
          caseId={caseData.id}
          userId={userId}
          caseData={caseData}
          suspects={suspects}
          onGoToSubmission={handleGoToSubmission}
        />
      );
    }

    // Submission screen - Mobile-First Noir Design
    if (currentScreen === 'submission' && caseData) {
      return (
        <div className="
          min-h-screen
          bg-noir-deepBlack
          text-text-primary
          px-4 py-6
          sm:px-6 sm:py-8
        ">
          {/* Header with back button */}
          <div className="
            mb-6 sm:mb-8
            flex flex-col sm:flex-row
            items-start sm:items-center
            justify-between
            gap-4
          ">
            <div>
              <h1 className="
                text-2xl sm:text-3xl lg:text-4xl
                font-display font-bold
                text-detective-gold
              ">
                📝 최종 답안 제출
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-1">
                {caseData.date} 사건
              </p>
            </div>
            <button
              onClick={handleBackToInvestigation}
              className="
                btn-ghost
                px-4 py-2
                sm:px-6 sm:py-3
                min-h-[44px]
                rounded-lg
                font-semibold
                transition-all
                w-full sm:w-auto
              "
              aria-label="수사 화면으로 돌아가기"
            >
              ← 수사로 돌아가기
            </button>
          </div>

          <SubmissionForm
            onSubmit={handleSubmitAnswer}
            submitting={submitting}
            suspects={suspects.map((s) => ({ id: s.id, name: s.name }))}
          />
        </div>
      );
    }

    // Results screen - Mobile-First Noir Design
    if (currentScreen === 'results' && scoringResult && caseData) {
      return (
        <div className="
          min-h-screen
          bg-noir-deepBlack
          text-text-primary
          px-4 py-6
          sm:px-6 sm:py-8
        ">
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="
              text-2xl sm:text-3xl lg:text-4xl
              font-display font-bold
              text-detective-gold
              mb-2
            ">
              🎯 채점 결과
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              {caseData.date} 사건
            </p>
          </div>

          <ResultView result={scoringResult} caseId={caseData.id} />

          {/* Actions */}
          <div className="
            mt-6 sm:mt-8
            flex flex-col sm:flex-row
            gap-4
            justify-center
            px-4 sm:px-0
          ">
            <button
              onClick={() => window.location.reload()}
              className="
                btn-primary
                px-6 py-3
                sm:px-8 sm:py-4
                min-h-[48px]
                text-base sm:text-lg
                font-bold
                rounded-lg
                transition-all
                w-full sm:w-auto
              "
              aria-label="새 게임 시작하기"
            >
              🔄 새 게임 시작
            </button>
          </div>
        </div>
      );
    }

    // Fallback - Mobile-First Noir Design
    return (
      <div className="
        flex items-center justify-center
        min-h-screen
        px-4
        bg-noir-deepBlack
        text-text-primary
      ">
        <p className="text-lg sm:text-xl font-display text-detective-gold">
          알 수 없는 화면 상태입니다.
        </p>
      </div>
    );
  };

  return (
    <div className="app min-h-screen bg-noir-deepBlack">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
