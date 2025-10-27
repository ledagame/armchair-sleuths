/**
 * GameAPIContext.tsx
 *
 * GameAPI 인스턴스를 Context로 제공
 * 의존성 주입(Dependency Injection) 패턴 구현
 *
 * 장점:
 * 1. 테스트 용이성: Mock API로 교체 가능
 * 2. 환경 분리: 개발/프로덕션 환경별로 다른 API 사용 가능
 * 3. 일관성: 모든 컴포넌트가 동일한 API 인스턴스 사용
 *
 * 사용 예시:
 * ```typescript
 * // App.tsx
 * <GameAPIProvider>
 *   <MyComponent />
 * </GameAPIProvider>
 *
 * // MyComponent.tsx
 * const api = useGameAPI();
 * const caseData = await api.getCaseToday();
 * ```
 */

import { createContext, useContext, useMemo, ReactNode } from 'react';
import type { GameAPI } from '../api/GameAPI';
import { HTTPGameAPIClient } from '../api/HTTPGameAPIClient';
import { MockGameAPIClient } from '../api/MockGameAPIClient';

// =============================================================================
// Context
// =============================================================================

const GameAPIContext = createContext<GameAPI | null>(null);

// =============================================================================
// Provider Props
// =============================================================================

interface GameAPIProviderProps {
  children: ReactNode;
  /**
   * API 인스턴스 (선택적)
   * 제공하지 않으면 자동으로 HTTPGameAPIClient 생성
   */
  api?: GameAPI;
  /**
   * Mock API 사용 여부 (테스트용)
   */
  useMock?: boolean;
  /**
   * API 베이스 URL (기본값: '')
   */
  baseUrl?: string;
}

// =============================================================================
// Provider Component
// =============================================================================

/**
 * GameAPIProvider
 *
 * GameAPI 인스턴스를 Context로 제공하는 Provider
 *
 * @param children - 자식 컴포넌트
 * @param api - 커스텀 API 인스턴스 (선택적)
 * @param useMock - Mock API 사용 여부 (기본값: false)
 * @param baseUrl - API 베이스 URL (기본값: '')
 */
export function GameAPIProvider({
  children,
  api,
  useMock = false,
  baseUrl = '',
}: GameAPIProviderProps) {
  // API 인스턴스 생성 (memoization)
  const apiInstance = useMemo(() => {
    // 커스텀 API가 제공된 경우 그것 사용
    if (api) {
      console.log('[GameAPIProvider] Using custom API instance');
      return api;
    }

    // Mock API 사용 (테스트 환경)
    if (useMock) {
      console.log('[GameAPIProvider] Using MockGameAPIClient');
      return new MockGameAPIClient();
    }

    // HTTP API 사용 (프로덕션 환경)
    console.log(`[GameAPIProvider] Using HTTPGameAPIClient with baseUrl: "${baseUrl}"`);
    return new HTTPGameAPIClient(baseUrl);
  }, [api, useMock, baseUrl]);

  return <GameAPIContext.Provider value={apiInstance}>{children}</GameAPIContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * useGameAPI Hook
 *
 * GameAPI 인스턴스에 접근
 *
 * @returns GameAPI 인스턴스
 * @throws Error - GameAPIProvider 없이 사용 시
 *
 * 사용 예시:
 * ```typescript
 * const api = useGameAPI();
 * const caseData = await api.getCaseToday();
 * ```
 */
export function useGameAPI(): GameAPI {
  const api = useContext(GameAPIContext);

  if (!api) {
    throw new Error('useGameAPI must be used within GameAPIProvider');
  }

  return api;
}

// =============================================================================
// Convenience Hooks (Optional - 특정 API 메서드만 사용)
// =============================================================================

/**
 * Case 관련 API만 사용하는 Hook
 */
export function useCaseAPI() {
  const api = useGameAPI();
  return {
    getCaseToday: api.getCaseToday.bind(api),
    getCaseById: api.getCaseById.bind(api),
    generateCase: api.generateCase.bind(api),
    getImageStatus: api.getImageStatus.bind(api),
  };
}

/**
 * Suspect 관련 API만 사용하는 Hook
 */
export function useSuspectAPI() {
  const api = useGameAPI();
  return {
    askSuspect: api.askSuspect.bind(api),
    getConversation: api.getConversation.bind(api),
  };
}

/**
 * Discovery 관련 API만 사용하는 Hook
 */
export function useDiscoveryAPI() {
  const api = useGameAPI();
  return {
    searchLocation: api.searchLocation.bind(api),
  };
}

/**
 * Submission 관련 API만 사용하는 Hook
 */
export function useSubmissionAPI() {
  const api = useGameAPI();
  return {
    submitAnswer: api.submitAnswer.bind(api),
  };
}

/**
 * Player State 관련 API만 사용하는 Hook
 */
export function usePlayerStateAPI() {
  const api = useGameAPI();
  return {
    getPlayerState: api.getPlayerState.bind(api),
  };
}
