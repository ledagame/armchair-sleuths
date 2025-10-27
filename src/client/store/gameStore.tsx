/**
 * gameStore.ts
 *
 * 전역 게임 상태 관리 (Context API 기반)
 * Zustand 없이 React Context로 간단한 상태 관리 구현
 *
 * 관리 대상:
 * - currentScreen: 현재 화면
 * - userId: 사용자 ID
 * - caseId: 현재 케이스 ID
 *
 * localStorage와 자동 동기화
 *
 * 사용 예시:
 * ```typescript
 * const { currentScreen, setCurrentScreen } = useGameStore();
 * setCurrentScreen('investigation');
 * ```
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { GameScreen } from '../types';

// =============================================================================
// Store State Interface
// =============================================================================

export interface GameStoreState {
  currentScreen: GameScreen;
  userId: string;
  caseId: string | null;
}

export interface GameStoreActions {
  setCurrentScreen: (screen: GameScreen) => void;
  setUserId: (id: string) => void;
  setCaseId: (id: string | null) => void;
  reset: () => void;
}

export type GameStore = GameStoreState & GameStoreActions;

// =============================================================================
// Default State
// =============================================================================

const DEFAULT_STATE: GameStoreState = {
  currentScreen: 'loading',
  userId: '',
  caseId: null,
};

// =============================================================================
// localStorage Keys
// =============================================================================

const STORAGE_KEYS = {
  USER_ID: 'userId',
  CASE_ID: 'caseId',
  CURRENT_SCREEN: 'currentScreen',
} as const;

// =============================================================================
// Context
// =============================================================================

const GameStoreContext = createContext<GameStore | null>(null);

// =============================================================================
// Provider Component
// =============================================================================

interface GameStoreProviderProps {
  children: ReactNode;
}

export function GameStoreProvider({ children }: GameStoreProviderProps) {
  // State
  const [currentScreen, setCurrentScreenState] = useState<GameScreen>(() => {
    // localStorage에서 초기값 로드
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SCREEN);
    return (saved as GameScreen) || DEFAULT_STATE.currentScreen;
  });

  const [userId, setUserIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_ID);
    if (saved) {
      return saved;
    }

    // 새 사용자 ID 생성
    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(STORAGE_KEYS.USER_ID, newUserId);
    return newUserId;
  });

  const [caseId, setCaseIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASE_ID);
    return saved || DEFAULT_STATE.caseId;
  });

  // Actions with localStorage sync
  const setCurrentScreen = useCallback((screen: GameScreen) => {
    setCurrentScreenState(screen);
    localStorage.setItem(STORAGE_KEYS.CURRENT_SCREEN, screen);
    console.log('[GameStore] Screen changed:', screen);
  }, []);

  const setUserId = useCallback((id: string) => {
    setUserIdState(id);
    localStorage.setItem(STORAGE_KEYS.USER_ID, id);
    console.log('[GameStore] User ID set:', id);
  }, []);

  const setCaseId = useCallback((id: string | null) => {
    setCaseIdState(id);
    if (id) {
      localStorage.setItem(STORAGE_KEYS.CASE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CASE_ID);
    }
    console.log('[GameStore] Case ID set:', id);
  }, []);

  const reset = useCallback(() => {
    setCurrentScreenState(DEFAULT_STATE.currentScreen);
    setCaseIdState(DEFAULT_STATE.caseId);
    // userId는 유지 (세션 간 유지)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SCREEN);
    localStorage.removeItem(STORAGE_KEYS.CASE_ID);
    console.log('[GameStore] State reset');
  }, []);

  // Store value
  const store: GameStore = {
    currentScreen,
    userId,
    caseId,
    setCurrentScreen,
    setUserId,
    setCaseId,
    reset,
  };

  return <GameStoreContext.Provider value={store}>{children}</GameStoreContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

/**
 * useGameStore Hook
 *
 * 전역 게임 상태에 접근
 *
 * @returns GameStore 인스턴스
 * @throws Error - Provider 없이 사용 시
 */
export function useGameStore(): GameStore {
  const store = useContext(GameStoreContext);

  if (!store) {
    throw new Error('useGameStore must be used within GameStoreProvider');
  }

  return store;
}

// =============================================================================
// Selector Hooks (Optional - for optimization)
// =============================================================================

/**
 * 현재 화면만 구독
 */
export function useCurrentScreen(): [GameScreen, (screen: GameScreen) => void] {
  const { currentScreen, setCurrentScreen } = useGameStore();
  return [currentScreen, setCurrentScreen];
}

/**
 * 사용자 ID만 구독
 */
export function useUserId(): [string, (id: string) => void] {
  const { userId, setUserId } = useGameStore();
  return [userId, setUserId];
}

/**
 * 케이스 ID만 구독
 */
export function useCaseId(): [string | null, (id: string | null) => void] {
  const { caseId, setCaseId } = useGameStore();
  return [caseId, setCaseId];
}
