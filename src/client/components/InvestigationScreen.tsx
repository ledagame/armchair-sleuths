/**
 * InvestigationScreen.tsx
 *
 * Unified Investigation Screen with parallel gameplay
 * Allows free switching between Location Exploration and Suspect Interrogation
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LocationExplorerSection } from './investigation/LocationExplorerSection';
import { SuspectInterrogationSection } from './investigation/SuspectInterrogationSection';
import { EvidenceNotebookSection } from './investigation/EvidenceNotebookSection';
import { MilestoneCelebration, useMilestoneTracking } from './gamification/MilestoneCelebration';
import { AchievementToast } from './gamification/AchievementToast';
import { useGamification } from '../hooks/useGamification';
import type { CaseData, Suspect } from '../types';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { Achievement } from '../utils/evidenceRarity';

export interface InvestigationScreenProps {
  caseId: string;
  userId: string;
  caseData: CaseData;
  suspects: Suspect[];
  onGoToSubmission: () => void;
}

type InvestigationTab = 'locations' | 'suspects' | 'evidence';

interface Tab {
  id: InvestigationTab;
  label: string;
  icon: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'locations',
    label: '장소 탐색',
    icon: '🗺️',
    description: '범죄 현장과 관련 장소를 탐색하여 증거를 수집하세요',
  },
  {
    id: 'suspects',
    label: '용의자 심문',
    icon: '👤',
    description: '용의자들을 심문하여 진실을 밝혀내세요',
  },
  {
    id: 'evidence',
    label: '수사 노트',
    icon: '📋',
    description: '발견한 증거를 정리하고 사건을 재구성하세요',
  },
];

/**
 * InvestigationScreen Component
 *
 * Features:
 * - Tab navigation between Locations and Suspects
 * - Free switching between tabs
 * - Shared action points and player state
 * - Seamless parallel investigation
 * - Achievement toast notifications
 * - Milestone celebrations
 */
export function InvestigationScreen({
  caseId,
  userId,
  caseData,
  suspects,
  onGoToSubmission,
}: InvestigationScreenProps) {
  const [activeTab, setActiveTab] = useState<InvestigationTab>('locations');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  // Track evidence discovery progress for milestone celebrations
  const [discoveredEvidence, setDiscoveredEvidence] = useState<EvidenceItem[]>([]);
  const [totalEvidenceCount, setTotalEvidenceCount] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);

  // Track search history for achievements
  const [searchHistory, setSearchHistory] = useState<Array<{ searchType: string }>>([]);

  // Achievement toast state
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Initialize gamification system
  const { state, actions } = useGamification({
    evidenceList: discoveredEvidence,
    searchHistory,
    onAchievementUnlocked: handleAchievementUnlocked,
  });

  /**
   * Handle new achievement unlocked
   */
  function handleAchievementUnlocked(achievement: Achievement) {
    setAchievementQueue((prev) => [...prev, achievement]);
  }

  /**
   * Show next achievement from queue
   */
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      const [next, ...rest] = achievementQueue;
      setCurrentAchievement(next);
      setAchievementQueue(rest);
    }
  }, [currentAchievement, achievementQueue]);

  /**
   * Handle toast dismissal
   */
  const handleToastClose = useCallback(() => {
    setCurrentAchievement(null);
    // Next achievement will auto-show via useEffect above
  }, []);

  /**
   * Switch to evidence tab with optional evidence selection
   */
  const handleSwitchToEvidenceTab = (evidenceId?: string) => {
    setActiveTab('evidence');
    if (evidenceId) {
      setSelectedEvidenceId(evidenceId);
    }
  };

  /**
   * Fetch player state to track evidence discovery progress
   */
  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        const response = await fetch(`/api/player-state/${caseId}/${userId}`);
        if (!response.ok) {
          console.error('[InvestigationScreen] Failed to fetch player state');
          return;
        }

        const data = await response.json();
        const discovered = data.discoveredEvidence || [];
        setDiscoveredEvidence(discovered);
      } catch (error) {
        console.error('[InvestigationScreen] Error fetching player state:', error);
      }
    };

    // Fetch immediately
    fetchPlayerState();

    // Poll for updates every 3 seconds to catch new evidence discoveries
    const pollInterval = setInterval(fetchPlayerState, 3000);

    return () => clearInterval(pollInterval);
  }, [caseId, userId]);

  /**
   * Get total evidence count from case data
   */
  useEffect(() => {
    if (caseData?.evidence) {
      setTotalEvidenceCount(caseData.evidence.length);
    }
  }, [caseData]);

  /**
   * Calculate progress percentage when evidence changes
   */
  useEffect(() => {
    if (totalEvidenceCount > 0) {
      const progress = (discoveredEvidence.length / totalEvidenceCount) * 100;
      setCurrentProgress(Math.min(progress, 100));
    }
  }, [discoveredEvidence, totalEvidenceCount]);

  // Use milestone tracking hook
  const {
    showCelebration,
    previousProgress,
    handleClose: closeMilestone,
  } = useMilestoneTracking(currentProgress);

  // Get AP configuration from caseData (Phase 2)
  const initialAP = caseData.actionPoints?.initial ?? 3;
  const maxAP = caseData.actionPoints?.maximum ?? 12;
  const maximumAP = caseData.actionPoints?.maximum ?? 12;

  return (
    <div className="min-h-screen bg-noir-deepBlack text-text-primary">
      {/* Achievement Toast - Fixed at top with highest z-index (z-60) */}
      <AchievementToast
        achievement={currentAchievement}
        onClose={handleToastClose}
        duration={5000}
      />

      {/* Header - Mobile-First Noir Design */}
      <div className="
        sticky top-0 z-50
        bg-noir-charcoal
        border-b-2 border-noir-fog
        shadow-lg
      ">
        <div className="
          max-w-7xl mx-auto
          px-4 py-4
          sm:px-6 sm:py-5
        ">
          <div className="
            flex flex-col sm:flex-row
            items-start sm:items-center
            justify-between
            gap-4
            mb-4 sm:mb-6
          ">
            <div>
              <h1 className="
                text-2xl sm:text-3xl lg:text-4xl
                font-display font-bold
                text-detective-gold
              ">
                🔍 수사 중
              </h1>
              <p className="
                text-xs sm:text-sm
                text-text-secondary
                mt-1
              ">
                {caseData.date} 사건
              </p>
            </div>
            <button
              onClick={onGoToSubmission}
              className="
                btn-primary
                px-4 py-3
                sm:px-6 sm:py-3
                min-h-[48px]
                text-sm sm:text-base
                font-bold
                rounded-lg
                transition-all
                transform hover:scale-105
                shadow-lg
                w-full sm:w-auto
              "
              aria-label="수사 완료하고 답안 제출하기"
            >
              📝 수사 완료 (답안 제출)
            </button>
          </div>

          {/* Tab Navigation - Mobile-First Touch-Friendly */}
          <div className="
            flex flex-col sm:flex-row
            gap-2
            overflow-x-auto
          ">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative
                    flex-1
                    px-3 py-3
                    sm:px-4 sm:py-4
                    min-h-[56px]
                    rounded-t-lg
                    font-bold
                    text-sm sm:text-base
                    transition-all duration-base
                    ${
                      isActive
                        ? 'bg-noir-deepBlack text-detective-gold border-t-2 border-x-2 border-detective-gold shadow-glow'
                        : 'bg-noir-gunmetal text-text-secondary hover:bg-noir-smoke hover:text-text-primary'
                    }
                  `}
                  aria-label={`${tab.label} 탭으로 전환`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Active indicator - Animated underline */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-detective-gold"
                      layoutId="activeTab"
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}

                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <span className="text-xl sm:text-2xl" aria-hidden="true">
                      {tab.icon}
                    </span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="inline sm:hidden text-xs">{tab.label}</span>
                  </div>

                  {/* Description - Only show on larger screens when active */}
                  {isActive && (
                    <p className="
                      hidden lg:block
                      text-xs
                      text-text-secondary
                      mt-1
                      text-center
                    ">
                      {tab.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area - Mobile-First Responsive */}
      <div className="
        max-w-7xl mx-auto
        px-4 py-6
        sm:px-6 sm:py-8
      ">
        {/* Location Exploration Section */}
        {activeTab === 'locations' && (
          <motion.div
            key="locations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] as const }}
          >
            <LocationExplorerSection
              caseId={caseId}
              userId={userId}
              locations={caseData.locations || []}
              initialAP={initialAP}
              maxAP={maxAP}
              onSwitchToEvidenceTab={handleSwitchToEvidenceTab}
            />
          </motion.div>
        )}

        {/* Suspect Interrogation Section */}
        {activeTab === 'suspects' && (
          <motion.div
            key="suspects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] as const }}
          >
            <SuspectInterrogationSection
              caseId={caseId}
              userId={userId}
              suspects={suspects}
              maximumAP={maximumAP}
            />
          </motion.div>
        )}

        {/* Evidence Notebook Section */}
        {activeTab === 'evidence' && (
          <motion.div
            key="evidence"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] as const }}
          >
            <EvidenceNotebookSection
              caseId={caseId}
              userId={userId}
              selectedEvidenceId={selectedEvidenceId}
              onClearSelection={() => setSelectedEvidenceId(null)}
            />
          </motion.div>
        )}
      </div>

      {/* Milestone Celebration Overlay */}
      <MilestoneCelebration
        currentProgress={currentProgress}
        previousProgress={previousProgress}
        isOpen={showCelebration}
        onClose={closeMilestone}
        duration={4000}
      />
    </div>
  );
}
