/**
 * InvestigationScreen.tsx
 *
 * Unified Investigation Screen with parallel gameplay
 * Allows free switching between Location Exploration and Suspect Interrogation
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LocationExplorerSection } from './investigation/LocationExplorerSection';
import { SuspectInterrogationSection } from './investigation/SuspectInterrogationSection';
import type { CaseData, Suspect } from '../types';

export interface InvestigationScreenProps {
  caseId: string;
  userId: string;
  caseData: CaseData;
  suspects: Suspect[];
  onGoToSubmission: () => void;
}

type InvestigationTab = 'locations' | 'suspects';

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
];

/**
 * InvestigationScreen Component
 *
 * Features:
 * - Tab navigation between Locations and Suspects
 * - Free switching between tabs
 * - Shared action points and player state
 * - Seamless parallel investigation
 */
export function InvestigationScreen({
  caseId,
  userId,
  caseData,
  suspects,
  onGoToSubmission,
}: InvestigationScreenProps) {
  const [activeTab, setActiveTab] = useState<InvestigationTab>('locations');

  // Determine initial AP based on case difficulty (from caseData if available)
  const initialAP = 10; // TODO: Get from caseData or difficulty
  const maxAP = 10;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900 border-b-2 border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-detective-gold">
                🔍 수사 중
              </h1>
              <p className="text-gray-400 text-sm">{caseData.date} 사건</p>
            </div>
            <button
              onClick={onGoToSubmission}
              className="
                px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800
                rounded-lg font-bold transition-all transform hover:scale-105
                shadow-lg
              "
            >
              📝 수사 완료 (답안 제출)
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative flex-1 px-6 py-4 rounded-t-lg font-bold
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gray-950 text-detective-gold border-t-2 border-x-2 border-detective-gold'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-750 hover:text-gray-200'
                    }
                  `}
                >
                  {/* Active indicator */}
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

                  <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>

                  {isActive && (
                    <p className="text-xs text-gray-400 mt-1">
                      {tab.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* Location Exploration Section */}
        {activeTab === 'locations' && (
          <motion.div
            key="locations"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LocationExplorerSection
              caseId={caseId}
              userId={userId}
              locations={caseData.locations || []}
              initialAP={initialAP}
              maxAP={maxAP}
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
            transition={{ duration: 0.3 }}
          >
            <SuspectInterrogationSection
              caseId={caseId}
              userId={userId}
              suspects={suspects}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
