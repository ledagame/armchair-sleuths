/**
 * useGamification.ts
 *
 * Comprehensive hook for integrating all gamification features
 * Combines detective personalities, achievements, milestones, and effects
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { DetectiveArchetype } from '../utils/detectiveVoices';
import { determineArchetype } from '../utils/detectiveVoices';
import { checkAchievements, type Achievement } from '../utils/evidenceRarity';

export interface GamificationState {
  // Detective personality
  detectiveArchetype: DetectiveArchetype;

  // Achievements
  achievements: Achievement[];
  newAchievements: Achievement[];

  // Milestones
  currentProgress: number;
  previousProgress: number;
  showMilestone: boolean;

  // Player stats
  playerStats: {
    totalEvidence: number;
    thoroughSearches: number;
    quickSearches: number;
    exhaustiveSearches: number;
  };
}

export interface GamificationActions {
  // Archetype selection
  setArchetype: (archetype: DetectiveArchetype) => void;

  // Achievement management
  dismissAchievement: (achievementId: string) => void;

  // Milestone management
  closeMilestone: () => void;

  // Stats tracking
  recordEvidenceFound: (count: number) => void;
  recordSearch: (type: 'quick' | 'thorough' | 'exhaustive') => void;
}

export interface UseGamificationOptions {
  evidenceList?: EvidenceItem[];
  searchHistory?: Array<{ searchType: string }>;
  initialArchetype?: DetectiveArchetype;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onMilestoneReached?: (milestone: number) => void;
}

/**
 * Hook to manage all gamification state and actions
 */
export function useGamification(options: UseGamificationOptions = {}) {
  const {
    evidenceList = [],
    searchHistory = [],
    initialArchetype,
    onAchievementUnlocked,
    onMilestoneReached,
  } = options;

  // Player stats
  const [playerStats, setPlayerStats] = useState({
    totalEvidence: evidenceList.length,
    thoroughSearches: searchHistory.filter(s => s.searchType === 'thorough').length,
    quickSearches: searchHistory.filter(s => s.searchType === 'quick').length,
    exhaustiveSearches: searchHistory.filter(s => s.searchType === 'exhaustive').length,
  });

  // Detective archetype
  const [detectiveArchetype, setDetectiveArchetype] = useState<DetectiveArchetype>(() => {
    if (initialArchetype) return initialArchetype;

    // Try to load from localStorage
    const saved = localStorage.getItem('detective-archetype');
    if (saved) {
      return saved as DetectiveArchetype;
    }

    // Auto-determine from player stats
    return determineArchetype(playerStats);
  });

  // Save archetype to localStorage when changed
  useEffect(() => {
    localStorage.setItem('detective-archetype', detectiveArchetype);
  }, [detectiveArchetype]);

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  // Check for new achievements when evidence or searches change
  useEffect(() => {
    const currentAchievements = checkAchievements(evidenceList, searchHistory);

    // Find newly unlocked achievements
    const previousIds = new Set(achievements.map(a => a.id));
    const newlyUnlocked = currentAchievements.filter(a => !previousIds.has(a.id));

    if (newlyUnlocked.length > 0) {
      setAchievements(currentAchievements);
      setNewAchievements(prev => [...prev, ...newlyUnlocked]);

      // Notify callback
      newlyUnlocked.forEach(achievement => {
        onAchievementUnlocked?.(achievement);
      });
    }
  }, [evidenceList, searchHistory, achievements, onAchievementUnlocked]);

  // Milestone tracking
  const [previousProgress, setPreviousProgress] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);

  // Calculate current progress (0-100)
  const currentProgress = useMemo(() => {
    if (evidenceList.length === 0) return 0;

    // Calculate based on total possible evidence
    // This assumes you have metadata about total evidence available
    // For now, we'll use a simple calculation
    const totalPossible = 20; // TODO: Get from case metadata
    return Math.min((evidenceList.length / totalPossible) * 100, 100);
  }, [evidenceList]);

  // Check for milestone crossings
  useEffect(() => {
    const milestones = [25, 50, 75, 100];
    const crossedMilestone = milestones.find(
      m => currentProgress >= m && previousProgress < m
    );

    if (crossedMilestone) {
      setShowMilestone(true);
      onMilestoneReached?.(crossedMilestone);
    }

    setPreviousProgress(currentProgress);
  }, [currentProgress, previousProgress, onMilestoneReached]);

  // Actions
  const setArchetype = useCallback((archetype: DetectiveArchetype) => {
    setDetectiveArchetype(archetype);
  }, []);

  const dismissAchievement = useCallback((achievementId: string) => {
    setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  const closeMilestone = useCallback(() => {
    setShowMilestone(false);
  }, []);

  const recordEvidenceFound = useCallback((count: number) => {
    setPlayerStats(prev => ({
      ...prev,
      totalEvidence: prev.totalEvidence + count,
    }));
  }, []);

  const recordSearch = useCallback((type: 'quick' | 'thorough' | 'exhaustive') => {
    setPlayerStats(prev => ({
      ...prev,
      [`${type}Searches`]: prev[`${type}Searches` as keyof typeof prev] + 1,
    }));
  }, []);

  // State object
  const state: GamificationState = {
    detectiveArchetype,
    achievements,
    newAchievements,
    currentProgress,
    previousProgress,
    showMilestone,
    playerStats,
  };

  // Actions object
  const actions: GamificationActions = {
    setArchetype,
    dismissAchievement,
    closeMilestone,
    recordEvidenceFound,
    recordSearch,
  };

  return {
    state,
    actions,
  };
}

/**
 * Hook for simple achievement tracking
 */
export function useAchievementTracking(
  evidenceList: EvidenceItem[],
  searchHistory: Array<{ searchType: string }>
) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const currentAchievements = checkAchievements(evidenceList, searchHistory);

    // Find newly unlocked
    const previousIds = new Set(achievements.map(a => a.id));
    const newlyUnlocked = currentAchievements.filter(a => !previousIds.has(a.id));

    if (newlyUnlocked.length > 0) {
      setAchievements(currentAchievements);
      setNewAchievements(prev => [...prev, ...newlyUnlocked]);
    }
  }, [evidenceList, searchHistory, achievements]);

  const dismissAchievement = useCallback((achievementId: string) => {
    setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  return {
    achievements,
    newAchievements,
    dismissAchievement,
  };
}

/**
 * Hook for detective archetype management
 */
export function useDetectiveArchetype(playerStats?: {
  thoroughSearches?: number;
  quickSearches?: number;
  exhaustiveSearches?: number;
}) {
  const [archetype, setArchetype] = useState<DetectiveArchetype>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('detective-archetype');
    if (saved) {
      return saved as DetectiveArchetype;
    }

    // Auto-determine from player stats
    return determineArchetype(playerStats);
  });

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem('detective-archetype', archetype);
  }, [archetype]);

  // Update archetype when stats change significantly
  useEffect(() => {
    if (playerStats) {
      const autoArchetype = determineArchetype(playerStats);

      // Only auto-update if user hasn't manually selected
      const hasManualSelection = localStorage.getItem('detective-archetype-manual');
      if (!hasManualSelection) {
        setArchetype(autoArchetype);
      }
    }
  }, [playerStats]);

  const setArchetypeManually = useCallback((newArchetype: DetectiveArchetype) => {
    setArchetype(newArchetype);
    localStorage.setItem('detective-archetype-manual', 'true');
  }, []);

  return {
    archetype,
    setArchetype: setArchetypeManually,
  };
}
