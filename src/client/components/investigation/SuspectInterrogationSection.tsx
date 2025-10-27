/**
 * SuspectInterrogationSection.tsx
 *
 * Suspect Interrogation section for parallel investigation
 * Extracted from App.tsx investigation logic
 * Integrated with AP (Action Points) system
 */

import { SuspectPanel } from '../suspect/SuspectPanel';
import { ChatInterface } from '../chat/ChatInterface';
import { APHeader } from '../ap/APHeader';
import { APAcquisitionToast } from '../ap/APAcquisitionToast';
import { useSuspect } from '../../hooks/useSuspect';
import { useChat } from '../../hooks/useChat';
import type { Suspect } from '../../types';

export interface SuspectInterrogationSectionProps {
  caseId: string;
  userId: string;
  suspects: Suspect[];
  maximumAP?: number;
}

/**
 * SuspectInterrogationSection Component
 *
 * Features:
 * - Suspect panel for selection
 * - AI-powered chat interface
 * - AP header display and acquisition toasts
 * - Emotional state tracking
 * - Conversation history
 */
export function SuspectInterrogationSection({
  caseId,
  userId,
  suspects,
  maximumAP = 12,
}: SuspectInterrogationSectionProps) {
  // Suspect selection management
  const { selectedSuspect, selectSuspect } = useSuspect(suspects);

  // Chat management with AP integration (only active when suspect is selected)
  const {
    messages,
    sendMessage,
    loading: chatLoading,
    currentAP,
    latestAPGain,
    clearAPToast,
  } = useChat({
    suspectId: selectedSuspect?.id || '',
    userId,
    caseId,
    enabled: !!selectedSuspect,
  });

  // Defensive check: Ensure suspects exist
  if (!suspects || suspects.length === 0) {
    return (
      <div className="px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-evidence-blood mb-2">용의자 데이터를 불러올 수 없습니다</h2>
          <p className="text-text-secondary text-sm sm:text-base mb-2">사건 데이터에 용의자 정보가 없습니다.</p>
          <p className="text-xs sm:text-sm text-text-muted mb-6">케이스 ID: {caseId}</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
              className="px-6 py-3 min-h-[48px] bg-evidence-clue hover:bg-evidence-clue/90 text-text-primary rounded-lg sm:rounded-xl font-bold transition-all duration-base focus:outline-none focus:ring-2 focus:ring-evidence-clue focus:ring-offset-2 focus:ring-offset-noir-deepBlack"
            >
              🎲 케이스 재생성
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 min-h-[48px] bg-noir-gunmetal hover:bg-noir-smoke text-text-primary rounded-lg sm:rounded-xl font-bold transition-all duration-base focus:outline-none focus:ring-2 focus:ring-detective-brass focus:ring-offset-2 focus:ring-offset-noir-deepBlack"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
      {/* AP Header - Fixed position */}
      <APHeader current={currentAP} maximum={maximumAP} />

      {/* AP Acquisition Toast */}
      <APAcquisitionToast apGain={latestAPGain} onComplete={clearAPToast} />

      {/* Suspect Panel */}
      <SuspectPanel
        suspects={suspects}
        selectedSuspectId={selectedSuspect?.id || null}
        onSelectSuspect={selectSuspect}
      />

      {/* Chat Interface (shown when suspect is selected) */}
      {selectedSuspect && (
        <div className="mt-6 sm:mt-8">
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

      {/* Helper message when no suspect is selected */}
      {!selectedSuspect && (
        <div className="mt-12 sm:mt-16 md:mt-20 text-center px-4">
          <div className="text-5xl sm:text-6xl mb-4">👆</div>
          <h3 className="text-xl sm:text-2xl font-bold text-detective-gold mb-2 sm:mb-3">
            용의자를 선택하여 심문을 시작하세요
          </h3>
          <p className="text-text-secondary text-sm sm:text-base">
            각 용의자의 프로필을 확인하고 대화를 나눠보세요
          </p>
        </div>
      )}
    </div>
  );
}
