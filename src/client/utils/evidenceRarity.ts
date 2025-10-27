/**
 * evidenceRarity.ts
 *
 * Evidence rarity and visual effects system
 * Makes evidence discoveries feel special and rewarding
 */

import type { EvidenceItem } from '@/shared/types/Evidence';

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'legendary' | 'secret';

export interface RarityConfig {
  tier: RarityTier;
  color: string;
  bgColor: string;
  borderColor: string;
  glowColor: string;
  label: string;
  emoji: string;
  animation: 'fade' | 'sparkle' | 'shine' | 'rainbow' | 'confetti';
}

/**
 * Rarity tier configurations
 */
export const RARITY_CONFIGS: Record<RarityTier, RarityConfig> = {
  common: {
    tier: 'common',
    color: 'text-gray-400',
    bgColor: 'bg-gray-900/20',
    borderColor: 'border-gray-500',
    glowColor: 'shadow-gray-500/20',
    label: '일반',
    emoji: '📄',
    animation: 'fade',
  },
  uncommon: {
    tier: 'uncommon',
    color: 'text-blue-400',
    bgColor: 'bg-blue-900/20',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/30',
    label: '유용',
    emoji: '📘',
    animation: 'fade',
  },
  rare: {
    tier: 'rare',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
    borderColor: 'border-purple-500',
    glowColor: 'shadow-purple-500/40',
    label: '중요',
    emoji: '💎',
    animation: 'sparkle',
  },
  legendary: {
    tier: 'legendary',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
    borderColor: 'border-yellow-500',
    glowColor: 'shadow-yellow-500/50',
    label: '핵심',
    emoji: '⭐',
    animation: 'shine',
  },
  secret: {
    tier: 'secret',
    color: 'text-pink-400',
    bgColor: 'bg-gradient-to-r from-pink-900/20 to-purple-900/20',
    borderColor: 'border-pink-500',
    glowColor: 'shadow-pink-500/60',
    label: '숨겨진',
    emoji: '🎁',
    animation: 'confetti',
  },
};

/**
 * Determine rarity tier based on evidence properties
 */
export function getRarityTier(evidence: EvidenceItem): RarityTier {
  // Secret: Evidence with special hints or easter eggs
  if (evidence.interpretationHint && evidence.discoveryHint.includes('숨겨진')) {
    return 'secret';
  }

  // Legendary: Critical evidence
  if (evidence.relevance === 'critical') {
    return 'legendary';
  }

  // Rare: Important evidence
  if (evidence.relevance === 'important') {
    return 'rare';
  }

  // Uncommon: Minor evidence with discovery hints
  if (evidence.relevance === 'minor' && evidence.discoveryHint) {
    return 'uncommon';
  }

  // Common: Everything else
  return 'common';
}

/**
 * Get rarity config for evidence
 */
export function getEvidenceRarity(evidence: EvidenceItem): RarityConfig {
  const tier = getRarityTier(evidence);
  return RARITY_CONFIGS[tier];
}

/**
 * Get animation duration based on rarity
 */
export function getAnimationDuration(rarity: RarityTier): number {
  const durations: Record<RarityTier, number> = {
    common: 300,
    uncommon: 400,
    rare: 500,
    legendary: 700,
    secret: 1000,
  };
  return durations[rarity];
}

/**
 * Get stagger delay for multiple evidence reveals
 */
export function getStaggerDelay(index: number, rarity: RarityTier): number {
  const baseDelay = 100;
  const rarityMultiplier: Record<RarityTier, number> = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    legendary: 2,
    secret: 2.5,
  };
  return baseDelay * index * rarityMultiplier[rarity];
}

/**
 * Get discovery flavor text based on rarity
 */
export function getDiscoveryFlavorText(rarity: RarityTier): string {
  const texts: Record<RarityTier, string[]> = {
    common: [
      '증거를 발견했습니다.',
      '단서를 찾았습니다.',
      '흔적을 발견했습니다.',
    ],
    uncommon: [
      '유용한 증거를 발견했습니다!',
      '괜찮은 단서를 찾았습니다!',
      '의미있는 흔적을 발견했습니다!',
    ],
    rare: [
      '중요한 증거를 발견했습니다!',
      '결정적인 단서를 찾았습니다!',
      '핵심 흔적을 발견했습니다!',
    ],
    legendary: [
      '놀라운 발견입니다! 핵심 증거를 찾았습니다!',
      '대단한 발견입니다! 사건의 열쇠를 찾았습니다!',
      '엄청난 발견입니다! 결정적 증거를 확보했습니다!',
    ],
    secret: [
      '세상에! 숨겨진 비밀을 발견했습니다!',
      '믿을 수 없어요! 은밀한 증거를 찾아냈습니다!',
      '놀랍습니다! 비밀스러운 단서를 발견했습니다!',
    ],
  };

  const options = texts[rarity];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Achievement tracking for special discoveries
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

export function checkAchievements(
  evidence: EvidenceItem[],
  searchHistory: Array<{ searchType: string }>
): Achievement[] {
  const achievements: Achievement[] = [];

  // Caffeine Detective: Found evidence in 3+ locations
  const uniqueLocations = new Set(evidence.map(e => e.foundAtLocationId));
  if (uniqueLocations.size >= 3) {
    achievements.push({
      id: 'caffeine-detective',
      name: '카페인 탐정',
      description: '3개 이상의 장소에서 증거를 발견했습니다',
      emoji: '☕',
      unlocked: true,
    });
  }

  // Thorough Investigator: All evidence in one location
  const locationGroups = evidence.reduce((acc, e) => {
    acc[e.foundAtLocationId] = (acc[e.foundAtLocationId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxInOneLocation = Math.max(...Object.values(locationGroups), 0);
  if (maxInOneLocation >= 5) {
    achievements.push({
      id: 'thorough-investigator',
      name: '철저한 수사관',
      description: '한 장소에서 5개 이상의 증거를 발견했습니다',
      emoji: '🔍',
      unlocked: true,
    });
  }

  // Sherlock Holmes: Found all critical evidence
  const criticalCount = evidence.filter(e => e.relevance === 'critical').length;
  if (criticalCount >= 3) {
    achievements.push({
      id: 'sherlock-holmes',
      name: '셜록 홈즈',
      description: '모든 핵심 증거를 발견했습니다',
      emoji: '🎩',
      unlocked: true,
    });
  }

  // Eagle Eye: Used exhaustive search 5+ times
  const exhaustiveSearches = searchHistory.filter(
    s => s.searchType === 'exhaustive'
  ).length;
  if (exhaustiveSearches >= 5) {
    achievements.push({
      id: 'eagle-eye',
      name: '독수리 눈',
      description: '완벽한 탐색을 5번 이상 수행했습니다',
      emoji: '🦅',
      unlocked: true,
    });
  }

  // Speed Demon: Used only quick searches
  const allQuick = searchHistory.every(s => s.searchType === 'quick');
  if (allQuick && searchHistory.length >= 3) {
    achievements.push({
      id: 'speed-demon',
      name: '스피드 데몬',
      description: '빠른 탐색만으로 증거를 찾았습니다',
      emoji: '⚡',
      unlocked: true,
    });
  }

  return achievements;
}

/**
 * Get celebration message based on milestone
 */
export function getCelebrationMessage(milestone: string): {
  title: string;
  message: string;
  emoji: string;
} {
  const celebrations: Record<string, { title: string; message: string; emoji: string }> = {
    first_evidence: {
      title: '첫 번째 증거!',
      message: '훌륭한 시작입니다. 계속해서 조사를 진행하세요!',
      emoji: '🌟',
    },
    half_complete: {
      title: '절반 달성!',
      message: '순조롭게 진행하고 있습니다. 계속 수사하세요!',
      emoji: '📊',
    },
    all_evidence: {
      title: '모든 증거 수집 완료!',
      message: '대단합니다! 이제 추리를 시작할 시간입니다!',
      emoji: '🎉',
    },
    critical_found: {
      title: '핵심 증거 발견!',
      message: '사건 해결의 열쇠를 찾았습니다!',
      emoji: '🔑',
    },
    location_complete: {
      title: '장소 탐색 완료!',
      message: '이 장소의 모든 증거를 찾았습니다!',
      emoji: '✅',
    },
  };

  return celebrations[milestone] || celebrations.first_evidence;
}
