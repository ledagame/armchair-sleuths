/**
 * PHASE3_INTEGRATION_EXAMPLES.tsx
 *
 * Practical examples for integrating Phase 3 UX enhancements
 * Copy-paste ready code snippets for common use cases
 */

import { useState } from 'react';
import { EvidenceDetailModal } from '@/client/components/investigation/EvidenceDetailModal';
import { EvidenceComparison } from '@/client/components/investigation/EvidenceComparison';
import { OnboardingTooltip, EVIDENCE_ONBOARDING_STEPS } from '@/client/components/common/OnboardingTooltip';
import { useBookmarks } from '@/client/hooks/useBookmarks';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { SuspectConnection } from '@/client/components/investigation/SuspectConnections';

// =============================================================================
// EXAMPLE 1: Enhanced Evidence Detail Modal with All Features
// =============================================================================

export function ExampleEvidenceDetailWithConnections() {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allEvidence, setAllEvidence] = useState<EvidenceItem[]>([]);

  // Mock data for suspect connections
  const getSuspectConnections = (evidence: EvidenceItem): SuspectConnection[] => {
    // In real app, this would come from your data layer
    return [
      {
        suspectId: 'suspect-1',
        suspectName: '김철수',
        relationship: '주요 용의자',
        relationshipType: 'primary',
        description: '이 증거는 김철수의 알리바이와 직접적으로 모순됩니다. 사건 당시 현장에 있었을 가능성이 높습니다.',
      },
      {
        suspectId: 'suspect-2',
        suspectName: '이영희',
        relationship: '증언 제공',
        relationshipType: 'testimony',
        description: '이영희는 이 증거에 대한 중요한 증언을 제공했습니다.',
      },
    ];
  };

  // Get related evidence based on location or type
  const getRelatedEvidence = (evidence: EvidenceItem): EvidenceItem[] => {
    return allEvidence.filter(
      (ev) =>
        ev.id !== evidence.id &&
        (ev.foundAtLocationId === evidence.foundAtLocationId ||
          ev.type === evidence.type)
    );
  };

  const handleSuspectClick = (suspectId: string) => {
    console.log('Navigate to suspect:', suspectId);
    // Implement navigation to suspect tab/profile
    setIsModalOpen(false);
    // switchToSuspectTab(suspectId);
  };

  const handleRelatedEvidenceClick = (evidenceId: string) => {
    const newEvidence = allEvidence.find((e) => e.id === evidenceId);
    if (newEvidence) {
      setSelectedEvidence(newEvidence);
      // Modal stays open, just updates content
    }
  };

  if (!selectedEvidence) return null;

  return (
    <EvidenceDetailModal
      evidence={selectedEvidence}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      // Optional enhancements
      suspectConnections={getSuspectConnections(selectedEvidence)}
      onSuspectClick={handleSuspectClick}
      relatedEvidence={getRelatedEvidence(selectedEvidence)}
      onRelatedEvidenceClick={handleRelatedEvidenceClick}
      discoveredAt={Date.now() - 1000 * 60 * 15} // 15 minutes ago
      discoveryLocation="범죄 현장"
    />
  );
}

// =============================================================================
// EXAMPLE 2: Evidence Comparison Feature
// =============================================================================

export function ExampleEvidenceComparison() {
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [allEvidence, setAllEvidence] = useState<EvidenceItem[]>([]);
  const [preselected, setPreselected] = useState<EvidenceItem[]>([]);

  // Open comparison with preselected evidence
  const handleCompareEvidence = (evidenceIds: string[]) => {
    const selected = allEvidence.filter((e) => evidenceIds.includes(e.id));
    setPreselected(selected);
    setComparisonOpen(true);
  };

  return (
    <>
      {/* Button to open comparison */}
      <button
        onClick={() => setComparisonOpen(true)}
        className="px-4 py-2 bg-detective-gold text-noir-charcoal font-bold rounded-lg"
      >
        ⚖️ 증거 비교하기
      </button>

      {/* Comparison modal */}
      <EvidenceComparison
        isOpen={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        availableEvidence={allEvidence}
        preselectedEvidence={preselected}
      />
    </>
  );
}

// =============================================================================
// EXAMPLE 3: Bookmark System Integration
// =============================================================================

export function ExampleBookmarkSystem() {
  const caseId = 'case-001';
  const userId = 'user-123';
  const [allEvidence, setAllEvidence] = useState<EvidenceItem[]>([]);

  const {
    bookmarkedIds,
    toggleBookmark,
    isBookmarked,
    getBookmarkedEvidence,
    clearAllBookmarks,
    bookmarkCount,
  } = useBookmarks(caseId, userId);

  const bookmarkedEvidence = getBookmarkedEvidence(allEvidence);

  return (
    <div>
      {/* Bookmark counter */}
      <div className="mb-4">
        <span className="text-detective-gold font-bold">
          📌 {bookmarkCount}개의 북마크
        </span>
        {bookmarkCount > 0 && (
          <button
            onClick={clearAllBookmarks}
            className="ml-4 text-sm text-red-400 hover:text-red-300"
          >
            모두 지우기
          </button>
        )}
      </div>

      {/* Evidence list with bookmark buttons */}
      <div className="space-y-3">
        {allEvidence.map((evidence) => (
          <div key={evidence.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
            <span>{evidence.name}</span>
            <button
              onClick={() => toggleBookmark(evidence.id)}
              className={`px-3 py-1 rounded ${
                isBookmarked(evidence.id)
                  ? 'bg-detective-gold text-noir-charcoal'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {isBookmarked(evidence.id) ? '🔖 북마크됨' : '북마크'}
            </button>
          </div>
        ))}
      </div>

      {/* Bookmarked evidence filter */}
      {bookmarkCount > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-3">북마크된 증거</h3>
          <div className="space-y-2">
            {bookmarkedEvidence.map((evidence) => (
              <div key={evidence.id} className="p-3 bg-detective-gold/20 rounded-lg border border-detective-gold">
                {evidence.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EXAMPLE 4: Onboarding Tooltips
// =============================================================================

export function ExampleOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Custom onboarding steps
  const customSteps = [
    {
      id: 'step-1',
      title: '환영합니다!',
      content: '이 기능의 사용법을 알려드리겠습니다.',
      emoji: '👋',
    },
    {
      id: 'step-2',
      title: '증거 수집',
      content: '장소를 탐색하여 증거를 수집하세요.',
      emoji: '🔍',
    },
    {
      id: 'step-3',
      title: '준비 완료!',
      content: '이제 본격적으로 시작해보세요!',
      emoji: '🎉',
    },
  ];

  return (
    <div>
      {/* Manual trigger button (for testing) */}
      <button
        onClick={() => {
          localStorage.removeItem('my-feature:onboarding');
          setShowOnboarding(true);
        }}
        className="px-4 py-2 bg-gray-700 text-white rounded"
      >
        온보딩 다시 보기
      </button>

      {/* Onboarding component */}
      {showOnboarding && (
        <OnboardingTooltip
          steps={customSteps}
          storageKey="my-feature:onboarding"
          onComplete={() => {
            console.log('Onboarding completed!');
            setShowOnboarding(false);
          }}
        />
      )}
    </div>
  );
}

// =============================================================================
// EXAMPLE 5: Complete Evidence Notebook Integration
// =============================================================================

export function ExampleCompleteIntegration() {
  const caseId = 'case-001';
  const userId = 'user-123';

  const [allEvidence, setAllEvidence] = useState<EvidenceItem[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const { isBookmarked, toggleBookmark, getBookmarkedEvidence } = useBookmarks(caseId, userId);

  const handleEvidenceClick = (evidence: EvidenceItem) => {
    setSelectedEvidence(evidence);
    setIsDetailModalOpen(true);
  };

  const getSuspectConnections = (evidence: EvidenceItem): SuspectConnection[] => {
    // Your logic to determine suspect connections
    // This could be based on evidence.pointsToSuspect or other metadata
    return [];
  };

  const getRelatedEvidence = (evidence: EvidenceItem): EvidenceItem[] => {
    return allEvidence.filter(
      (ev) =>
        ev.id !== evidence.id &&
        (ev.foundAtLocationId === evidence.foundAtLocationId ||
          ev.type === evidence.type)
    );
  };

  return (
    <div className="p-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-detective-gold">수사 노트</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setIsComparisonOpen(true)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            ⚖️ 증거 비교
          </button>
        </div>
      </div>

      {/* Evidence grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allEvidence.map((evidence) => (
          <div
            key={evidence.id}
            className="p-4 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:border-detective-gold transition-colors"
            onClick={() => handleEvidenceClick(evidence)}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-white">{evidence.name}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(evidence.id);
                }}
                className={`${
                  isBookmarked(evidence.id) ? 'text-detective-gold' : 'text-gray-400'
                }`}
              >
                🔖
              </button>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">{evidence.description}</p>
          </div>
        ))}
      </div>

      {/* Evidence Detail Modal */}
      {selectedEvidence && (
        <EvidenceDetailModal
          evidence={selectedEvidence}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          suspectConnections={getSuspectConnections(selectedEvidence)}
          onSuspectClick={(suspectId) => {
            console.log('Navigate to suspect:', suspectId);
          }}
          relatedEvidence={getRelatedEvidence(selectedEvidence)}
          onRelatedEvidenceClick={(evidenceId) => {
            const newEvidence = allEvidence.find((e) => e.id === evidenceId);
            if (newEvidence) {
              setSelectedEvidence(newEvidence);
            }
          }}
          discoveredAt={Date.now()}
          discoveryLocation={selectedEvidence.foundAtLocationId}
        />
      )}

      {/* Evidence Comparison Modal */}
      <EvidenceComparison
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        availableEvidence={allEvidence}
      />

      {/* Onboarding */}
      {showOnboarding && (
        <OnboardingTooltip
          steps={EVIDENCE_ONBOARDING_STEPS}
          storageKey={`armchair-sleuths:onboarding:${caseId}`}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

// =============================================================================
// EXAMPLE 6: Enhanced Evidence Discovery Flow
// =============================================================================

export function ExampleDiscoveryFlow() {
  const [discoveredEvidence, setDiscoveredEvidence] = useState<EvidenceItem[]>([]);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'locations' | 'evidence'>('locations');

  const handleEvidenceDiscovered = (evidence: EvidenceItem[]) => {
    setDiscoveredEvidence(evidence);
    setShowDiscoveryModal(true);
  };

  const handleEvidenceClickInDiscovery = (evidenceId: string) => {
    // Close discovery modal with animation
    setShowDiscoveryModal(false);

    // Wait for modal close animation to complete
    setTimeout(() => {
      // Switch to evidence tab
      setActiveTab('evidence');

      // Set selected evidence ID for auto-open
      setSelectedEvidenceId(evidenceId);
    }, 300);
  };

  return (
    <div>
      {/* Discovery Modal */}
      {/* This is already implemented in EvidenceDiscoveryModal */}

      {/* Evidence Notebook will auto-open detail modal when selectedEvidenceId is set */}
      {/* This is already implemented in EvidenceNotebookSection */}
    </div>
  );
}

// =============================================================================
// UTILITY: Reset All Onboarding (for development)
// =============================================================================

export function resetAllOnboarding() {
  const keys = Object.keys(localStorage).filter((key) => key.includes('onboarding'));
  keys.forEach((key) => localStorage.removeItem(key));
  console.log(`Reset ${keys.length} onboarding states`);
}

// Usage in browser console:
// resetAllOnboarding()
