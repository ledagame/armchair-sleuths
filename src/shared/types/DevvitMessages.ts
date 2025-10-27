/**
 * DevvitMessages.ts
 *
 * Type-safe Devvit ↔ WebView 통신 인터페이스
 * 양방향 메시지 타입 정의 및 PostData 인터페이스
 */

import type { GameScreen } from '../../client/types';

// =============================================================================
// Devvit → WebView Messages (Devvit가 WebView에게 보내는 메시지)
// =============================================================================

/**
 * 게임 초기화 메시지
 * Devvit 포스트가 WebView를 처음 로드할 때 전송
 */
export interface InitGameMessage {
  type: 'INIT_GAME';
  payload: {
    /** 특정 케이스 ID (아카이브용) */
    caseId?: string;
    /** Reddit 사용자 ID */
    userId?: string;
    /** 초기 게임 상태 */
    gameState?: string;
    /** 초기 점수 */
    score?: number;
  };
}

/**
 * 게임 상태 업데이트 메시지
 * Devvit가 게임 상태를 변경할 때 전송
 */
export interface UpdateStateMessage {
  type: 'UPDATE_STATE';
  payload: {
    /** 현재 화면 */
    screen: GameScreen;
    /** 추가 상태 데이터 */
    data?: Record<string, unknown>;
  };
}

/**
 * 화면 전환 메시지
 * Devvit가 특정 화면으로 이동 요청
 */
export interface NavigateMessage {
  type: 'NAVIGATE';
  payload: {
    /** 이동할 화면 */
    to: GameScreen;
  };
}

/**
 * Devvit → WebView 메시지 유니온 타입
 */
export type DevvitToWebViewMessage =
  | InitGameMessage
  | UpdateStateMessage
  | NavigateMessage;

// =============================================================================
// WebView → Devvit Messages (WebView가 Devvit에게 보내는 메시지)
// =============================================================================

/**
 * WebView 준비 완료 메시지
 * WebView가 로드 완료되어 메시지 수신 준비됨
 */
export interface ReadyMessage {
  type: 'READY';
  payload: {
    /** WebView 버전 */
    version?: string;
  };
}

/**
 * 게임 상태 변경 알림 메시지
 * WebView가 게임 상태를 변경했을 때 Devvit에게 알림
 */
export interface StateChangedMessage {
  type: 'STATE_CHANGED';
  payload: {
    /** 변경된 화면 */
    screen: GameScreen;
    /** 추가 상태 데이터 */
    data?: Record<string, unknown>;
  };
}

/**
 * 에러 발생 메시지
 * WebView에서 에러 발생 시 Devvit에게 알림
 */
export interface ErrorMessage {
  type: 'ERROR';
  payload: {
    /** 에러 메시지 */
    message: string;
    /** 에러 스택 트레이스 (선택적) */
    stack?: string;
  };
}

/**
 * 게임 완료 메시지
 * 사용자가 게임을 완료했을 때 Devvit에게 알림
 */
export interface GameCompleteMessage {
  type: 'GAME_COMPLETE';
  payload: {
    /** 케이스 ID */
    caseId: string;
    /** 최종 점수 */
    score: number;
    /** 완료 시간 (타임스탬프) */
    completedAt: number;
  };
}

/**
 * WebView → Devvit 메시지 유니온 타입
 */
export type WebViewToDevvitMessage =
  | ReadyMessage
  | StateChangedMessage
  | ErrorMessage
  | GameCompleteMessage;

// =============================================================================
// Devvit PostData Interface
// =============================================================================

/**
 * window.__POST_DATA__ 인터페이스
 * Devvit 프레임워크가 WebView에 제공하는 초기 데이터
 */
export interface DevvitPostData {
  /** 게임 상태 (직렬화된 JSON) */
  gameState?: string;
  /** 현재 점수 */
  score?: number;
  /** 특정 케이스 ID (아카이브 포스트용) */
  caseId?: string;
  /** Reddit 사용자 ID */
  userId?: string;
}

// =============================================================================
// Global Window Type Extension
// =============================================================================

/**
 * Window 객체에 __POST_DATA__ 추가
 */
declare global {
  interface Window {
    __POST_DATA__?: DevvitPostData;
  }
}
