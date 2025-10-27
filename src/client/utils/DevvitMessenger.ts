/**
 * DevvitMessenger.ts
 *
 * Type-safe Devvit ↔ WebView 통신 유틸리티
 * 메시지 송수신 및 PostData 접근 제공
 */

import type {
  DevvitToWebViewMessage,
  WebViewToDevvitMessage,
  DevvitPostData,
} from '../../shared/types/DevvitMessages';

/**
 * DevvitMessenger
 *
 * Devvit과 WebView 간의 타입 안전 통신 제공
 *
 * 사용 예시:
 * ```typescript
 * // PostData 가져오기
 * const postData = DevvitMessenger.getPostData();
 * const caseId = postData?.caseId;
 *
 * // Devvit에게 메시지 전송
 * DevvitMessenger.send({
 *   type: 'STATE_CHANGED',
 *   payload: { screen: 'investigation' }
 * });
 *
 * // Devvit 메시지 수신
 * DevvitMessenger.listen((message) => {
 *   if (message.type === 'NAVIGATE') {
 *     navigateToScreen(message.payload.to);
 *   }
 * });
 * ```
 */
export class DevvitMessenger {
  /**
   * 메시지 리스너 목록
   */
  private static listeners: Array<(message: DevvitToWebViewMessage) => void> = [];

  /**
   * 초기화 여부
   */
  private static initialized = false;

  /**
   * DevvitMessenger 초기화
   * window message 이벤트 리스너 등록
   */
  static initialize(): void {
    if (this.initialized) {
      return;
    }

    // window postMessage 이벤트 리스너 등록
    window.addEventListener('message', (event: MessageEvent) => {
      try {
        const message = event.data as DevvitToWebViewMessage;

        // 메시지 타입 검증
        if (!this.isValidDevvitMessage(message)) {
          return;
        }

        // 모든 리스너에게 전달
        this.listeners.forEach((listener) => {
          try {
            listener(message);
          } catch (error) {
            console.error('[DevvitMessenger] Listener error:', error);
          }
        });
      } catch (error) {
        console.error('[DevvitMessenger] Message processing error:', error);
      }
    });

    this.initialized = true;
    console.log('[DevvitMessenger] Initialized');
  }

  /**
   * Devvit에게 메시지 전송
   *
   * @param message - WebView → Devvit 메시지
   */
  static send(message: WebViewToDevvitMessage): void {
    try {
      // Devvit 환경에서는 parent.postMessage 사용
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
        console.log('[DevvitMessenger] Sent:', message.type);
      } else {
        console.warn('[DevvitMessenger] Not in Devvit iframe context');
      }
    } catch (error) {
      console.error('[DevvitMessenger] Send error:', error);
    }
  }

  /**
   * Devvit 메시지 수신 리스너 등록
   *
   * @param callback - 메시지 수신 시 호출될 콜백
   * @returns 리스너 제거 함수
   */
  static listen(callback: (message: DevvitToWebViewMessage) => void): () => void {
    // 자동 초기화
    if (!this.initialized) {
      this.initialize();
    }

    this.listeners.push(callback);

    // 리스너 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * window.__POST_DATA__ 가져오기
   *
   * @returns Devvit PostData 또는 undefined
   */
  static getPostData(): DevvitPostData | undefined {
    return window.__POST_DATA__;
  }

  /**
   * 특정 PostData 필드 가져오기
   *
   * @param key - PostData 키
   * @returns 해당 필드 값 또는 undefined
   */
  static getPostDataField<K extends keyof DevvitPostData>(
    key: K
  ): DevvitPostData[K] | undefined {
    return window.__POST_DATA__?.[key];
  }

  /**
   * Devvit 환경 여부 확인
   *
   * @returns Devvit iframe 내부에서 실행 중이면 true
   */
  static isDevvitEnvironment(): boolean {
    return window.parent !== window && window.__POST_DATA__ !== undefined;
  }

  /**
   * 메시지 타입 검증 (Type Guard)
   *
   * @param message - 검증할 메시지
   * @returns DevvitToWebViewMessage 타입이면 true
   */
  private static isValidDevvitMessage(message: unknown): message is DevvitToWebViewMessage {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const msg = message as { type?: string };

    // Devvit → WebView 메시지 타입 검증
    const validTypes = ['INIT_GAME', 'UPDATE_STATE', 'NAVIGATE'];
    return typeof msg.type === 'string' && validTypes.includes(msg.type);
  }

  /**
   * WebView 준비 완료 메시지 전송
   *
   * 편의 메서드: 앱 로드 완료 시 호출
   */
  static notifyReady(version?: string): void {
    this.send({
      type: 'READY',
      payload: { version },
    });
  }

  /**
   * 게임 상태 변경 알림
   *
   * 편의 메서드: 화면 전환 시 호출
   */
  static notifyStateChanged(screen: string, data?: Record<string, unknown>): void {
    this.send({
      type: 'STATE_CHANGED',
      payload: { screen: screen as any, data },
    });
  }

  /**
   * 에러 알림
   *
   * 편의 메서드: 에러 발생 시 호출
   */
  static notifyError(message: string, stack?: string): void {
    this.send({
      type: 'ERROR',
      payload: { message, stack },
    });
  }

  /**
   * 게임 완료 알림
   *
   * 편의 메서드: 게임 완료 시 호출
   */
  static notifyGameComplete(caseId: string, score: number): void {
    this.send({
      type: 'GAME_COMPLETE',
      payload: {
        caseId,
        score,
        completedAt: Date.now(),
      },
    });
  }

  /**
   * 모든 리스너 제거 (테스트용)
   */
  static clearListeners(): void {
    this.listeners = [];
  }

  /**
   * 초기화 상태 리셋 (테스트용)
   */
  static reset(): void {
    this.listeners = [];
    this.initialized = false;
  }
}

// 자동 초기화 (프로덕션 환경)
if (typeof window !== 'undefined') {
  DevvitMessenger.initialize();
}
