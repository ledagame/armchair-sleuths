/**
 * CinematicIntro.tsx
 *
 * 시네마틱 인트로 메인 컴포넌트
 * - 5단계 씬 조합
 * - 이미지 배경 통합
 * - SceneManager 오케스트레이션
 */

'use client';

import { useMemo } from 'react';
import { SceneManager, CinematicScene } from './scenes/SceneManager';
import {
  EstablishingScene,
  EntryScene,
  ConfrontationScene,
  SuspectsScene,
  ActionScene,
} from './scenes/CinematicScenes';
import type { IntroNarration } from '../../../shared/types';

/**
 * CinematicIntro Props
 */
export interface CinematicIntroProps {
  /** 나레이션 데이터 */
  narration: IntroNarration;

  /** 시네마틱 이미지 URL 맵 (씬 타입 → 이미지 URL) */
  cinematicImages?: {
    establishing?: string;
    entry?: string;
    confrontation?: string;
    suspects?: string;
    action?: string;
  };

  /** 완료 시 콜백 */
  onComplete: () => void;

  /** Skip 시 콜백 (선택) */
  onSkip?: () => void;

  /** 자동 진행 여부 (기본: true) */
  autoProgress?: boolean;

  /** Skip 버튼 표시 여부 (기본: true) */
  showSkipButton?: boolean;
}

/**
 * CinematicIntro 컴포넌트
 *
 * 5단계 시네마틱 인트로를 제공합니다:
 * 1. Establishing: 범죄 현장 발견 (15s, Dissolve)
 * 2. Entry: 현장 진입 (15s, Wipe)
 * 3. Confrontation: 증거 대면 (20s, Zoom)
 * 4. Suspects: 용의자들 (20s, Slide)
 * 5. Action: 수사 시작 (20s, Dissolve)
 *
 * 총 90초, 60초 후 skip 가능
 */
export function CinematicIntro({
  narration,
  cinematicImages = {},
  onComplete,
  onSkip,
  autoProgress = true,
  showSkipButton = true,
}: CinematicIntroProps) {
  // ============================================================================
  // Scenes Construction
  // ============================================================================

  const scenes: CinematicScene[] = useMemo(
    () => [
      // Scene 1: Establishing (Discovery)
      {
        type: 'establishing',
        imageUrl: cinematicImages.establishing,
        duration: 15,
        transition: 'dissolve',
        content: <EstablishingScene narration={narration} />,
      },

      // Scene 2: Entry
      {
        type: 'entry',
        imageUrl: cinematicImages.entry,
        duration: 15,
        transition: 'wipe',
        content: <EntryScene narration={narration} />,
      },

      // Scene 3: Confrontation (Evidence)
      {
        type: 'confrontation',
        imageUrl: cinematicImages.confrontation,
        duration: 20,
        transition: 'zoom',
        content: <ConfrontationScene narration={narration} />,
      },

      // Scene 4: Suspects (Mission)
      {
        type: 'suspects',
        imageUrl: cinematicImages.suspects,
        duration: 20,
        transition: 'slide',
        content: <SuspectsScene narration={narration} />,
      },

      // Scene 5: Action (Beginning)
      {
        type: 'action',
        imageUrl: cinematicImages.action,
        duration: 20,
        transition: 'dissolve',
        content: <ActionScene narration={narration} />,
      },
    ],
    [narration, cinematicImages]
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <SceneManager
      scenes={scenes}
      onComplete={onComplete}
      onSkip={onSkip}
      autoProgress={autoProgress}
      showSkipButton={showSkipButton}
    />
  );
}
