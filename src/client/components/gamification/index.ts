/**
 * gamification/index.ts
 *
 * Barrel export for all gamification components
 */

export { AchievementToast, AchievementToastManager } from './AchievementToast';
export type { AchievementToastProps } from './AchievementToast';

export { MilestoneCelebration, useMilestoneTracking } from './MilestoneCelebration';
export type { MilestoneConfig, MilestoneCelebrationProps } from './MilestoneCelebration';

export {
  DetectiveArchetypeSelector,
  ArchetypeSelectorButton,
} from './DetectiveArchetypeSelector';
export type {
  DetectiveArchetypeInfo,
  DetectiveArchetypeSelectorProps,
  ArchetypeSelectorButtonProps,
} from './DetectiveArchetypeSelector';
