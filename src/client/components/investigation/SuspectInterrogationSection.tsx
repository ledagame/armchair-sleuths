/**
 * SuspectInterrogationSection.tsx
 *
 * Suspect Interrogation section for parallel investigation
 * Extracted from App.tsx investigation logic
 */

import { SuspectPanel } from '../suspect/SuspectPanel';
import { ChatInterface } from '../chat/ChatInterface';
import { useSuspect } from '../../hooks/useSuspect';
import { useChat } from '../../hooks/useChat';
import type { Suspect } from '../../types';

export interface SuspectInterrogationSectionProps {
  caseId: string;
  userId: string;
  suspects: Suspect[];
}

/**
 * SuspectInterrogationSection Component
 *
 * Features:
 * - Suspect panel for selection
 * - AI-powered chat interface
 * - Emotional state tracking
 * - Conversation history
 */
export function SuspectInterrogationSection({
  caseId,
  userId,
  suspects,
}: SuspectInterrogationSectionProps) {
  // Suspect selection management
  const { selectedSuspect, selectSuspect } = useSuspect(suspects);

  // Chat management (only active when suspect is selected)
  const { messages, sendMessage, loading: chatLoading } = useChat({
    suspectId: selectedSuspect?.id || '',
    userId,
    enabled: !!selectedSuspect,
  });

  // Defensive check: Ensure suspects exist
  if (!suspects || suspects.length === 0) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">용의자 데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-400 mb-2">사건 데이터에 용의자 정보가 없습니다.</p>
          <p className="text-sm text-gray-500 mb-6">케이스 ID: {caseId}</p>
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
    <div className="p-6">
      {/* Suspect Panel */}
      <SuspectPanel
        suspects={suspects}
        selectedSuspectId={selectedSuspect?.id || null}
        onSelectSuspect={selectSuspect}
      />

      {/* Chat Interface (shown when suspect is selected) */}
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

      {/* Helper message when no suspect is selected */}
      {!selectedSuspect && (
        <div className="mt-12 text-center">
          <div className="text-6xl mb-4">👆</div>
          <h3 className="text-xl font-bold text-gray-300 mb-2">
            용의자를 선택하여 심문을 시작하세요
          </h3>
          <p className="text-gray-500">
            각 용의자의 프로필을 확인하고 대화를 나눠보세요
          </p>
        </div>
      )}
    </div>
  );
}
