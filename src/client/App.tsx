/**
 * App.tsx
 *
 * Main application component for Armchair Sleuths
 * Handles routing, state management, and screen orchestration
 */

import { useState, useEffect, useCallback } from 'react';
import { CaseOverview } from './components/case/CaseOverview';
import { SuspectPanel } from './components/suspect/SuspectPanel';
import { ChatInterface } from './components/chat/ChatInterface';
import { SubmissionForm } from './components/submission/SubmissionForm';
import { ResultView } from './components/results/ResultView';
import { CinematicIntro } from './components/intro/cinematic/CinematicIntro';
import { LocationExplorer } from './components/discovery/LocationExplorer';
import { useCase } from './hooks/useCase';
import { useSuspect } from './hooks/useSuspect';
import { useChat } from './hooks/useChat';
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
      // 나레이션이 있으면 intro로, 없으면 case-overview로
      if (caseData.introNarration) {
        setCurrentScreen('intro');
      } else {
        setCurrentScreen('case-overview');
      }
    }
  }, [caseLoading, caseError, caseData, currentScreen]);

  // Suspect management (only initialize when caseData is available)
  const { suspects, selectedSuspect, selectSuspect, clearSelection } = useSuspect(
    caseData?.suspects || []
  );

  // Chat management (only initialize when suspect is selected)
  const {
    messages,
    sendMessage,
    loading: chatLoading,
  } = useChat({
    suspectId: selectedSuspect?.id || '',
    userId,
    enabled: !!selectedSuspect,
  });

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

  // Render different screens
  const renderScreen = () => {
    // Loading screen
    if (currentScreen === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
          {caseLoading && (
            <>
              <div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full mb-4" />
              {generating ? (
                <>
                  <p className="text-xl font-bold">🎲 새로운 사건을 생성하는 중...</p>
                  <p className="text-sm text-gray-400 mt-2">AI가 오늘의 미스터리를 만들고 있습니다 (30-60초 소요)</p>
                </>
              ) : (
                <>
                  <p className="text-xl font-bold">사건 파일을 불러오는 중...</p>
                  <p className="text-sm text-gray-400 mt-2">오늘의 미스터리를 준비하고 있습니다</p>
                </>
              )}
            </>
          )}
          {caseError && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <p className="text-xl font-bold text-red-400">사건 파일을 불러올 수 없습니다</p>
              <p className="text-sm text-gray-400 mt-2">{caseError}</p>
              <div className="mt-6 flex gap-4">
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
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
                >
                  🎲 새 케이스 생성
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                >
                  다시 시도
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    // Intro narration screen
    if (currentScreen === 'intro' && caseData && caseData.introNarration) {
      return (
        <CinematicIntro
          narration={caseData.introNarration}
          cinematicImages={caseData.cinematicImages}
          onComplete={handleIntroComplete}
        />
      );
    }

    // Case overview screen
    if (currentScreen === 'case-overview' && caseData) {
      return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
          <CaseOverview caseData={caseData} onStartInvestigation={handleStartInvestigation} />
        </div>
      );
    }

    // Investigation screen
    if (currentScreen === 'investigation' && caseData) {
      // Defensive check: Ensure suspects exist
      if (!suspects || suspects.length === 0) {
        return (
          <div className="min-h-screen bg-gray-950 text-white p-6">
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2">용의자 데이터를 불러올 수 없습니다</h2>
              <p className="text-gray-400 mb-2">사건 데이터에 용의자 정보가 없습니다.</p>
              <p className="text-sm text-gray-500 mb-6">케이스 ID: {caseData.id}</p>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    try {
                      console.log('🎲 케이스 재생성 시작...');
                      const response = await fetch('/api/case/generate', { method: 'POST' });
                      if (response.ok) {
                        console.log('✅ 생성 성공! 2초 후 새로고침...');
                        setTimeout(() => window.location.reload(), 2000);
                      } else {
                        console.error('❌ 생성 실패');
                      }
                    } catch (e) {
                      console.error('Generation failed:', e);
                    }
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
                >
                  🎲 케이스 재생성
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold"
                >
                  다시 시도
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
          {/* Header with navigation */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🔍 수사 진행 중</h1>
              <p className="text-gray-400">{caseData.date} 사건</p>
            </div>
            <button
              onClick={handleGoToSubmission}
              className="
                px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800
                rounded-lg font-bold transition-all
              "
            >
              📝 답안 제출하기
            </button>
          </div>

          {/* Location Explorer - 장소 탐색 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">🗺️ 장소 탐색</h2>
            <LocationExplorer
              caseId={caseData.id}
              locations={caseData.locations || []}
              onSearchLocation={async (locationId: string) => {
                const response = await fetch(`/api/cases/${caseData.id}/search-location`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ locationId, searchType: 'quick' })
                });
                return response.json();
              }}
            />
          </div>

          {/* Suspect selection */}
          <SuspectPanel
            suspects={suspects}
            selectedSuspectId={selectedSuspect?.id || null}
            onSelectSuspect={selectSuspect}
          />

          {/* Chat interface (shown when suspect is selected) */}
          {selectedSuspect && (
            <div className="mt-6">
              <ChatInterface
                suspectName={selectedSuspect.name}
                suspectId={selectedSuspect.id}
                userId={userId}
                messages={messages}
                onSendMessage={sendMessage}
                loading={chatLoading}
              />
            </div>
          )}
        </div>
      );
    }

    // Submission screen
    if (currentScreen === 'submission' && caseData) {
      return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
          {/* Header with back button */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📝 최종 답안 제출</h1>
              <p className="text-gray-400">{caseData.date} 사건</p>
            </div>
            <button
              onClick={handleBackToInvestigation}
              className="
                px-6 py-3 bg-gray-700 hover:bg-gray-600
                rounded-lg font-bold transition-all
              "
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

    // Results screen
    if (currentScreen === 'results' && scoringResult && caseData) {
      return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">🎯 채점 결과</h1>
            <p className="text-gray-400">{caseData.date} 사건</p>
          </div>

          <ResultView result={scoringResult} caseId={caseData.id} />

          {/* Actions */}
          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="
                px-6 py-3 bg-blue-600 hover:bg-blue-700
                rounded-lg font-bold transition-all
              "
            >
              🔄 새 게임 시작
            </button>
          </div>
        </div>
      );
    }

    // Fallback
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p>알 수 없는 화면 상태입니다.</p>
      </div>
    );
  };

  return (
    <div className="app min-h-screen bg-gray-950 text-white">
      {renderScreen()}
    </div>
  );
};
