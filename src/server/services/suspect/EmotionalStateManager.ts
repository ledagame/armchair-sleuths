/**
 * EmotionalStateManager.ts
 *
 * Spirit of Kiro 패턴: Emotional State System
 * 동적 AI 용의자 감정 상태 관리
 */

import { KVStoreManager, type SuspectData } from '../repositories/kv/KVStoreManager';

export type EmotionalTone = 'cooperative' | 'nervous' | 'defensive' | 'aggressive';

export interface EmotionalState {
  suspicionLevel: number; // 0-100
  tone: EmotionalTone;
  lastUpdated: number;
}

export interface EmotionalUpdate {
  suspicionDelta: number; // -10 ~ +10
  reason: string;
}

/**
 * 용의자 감정 상태 관리자
 */
export class EmotionalStateManager {
  /**
   * 초기 감정 상태 생성
   */
  static createInitialState(): EmotionalState {
    return {
      suspicionLevel: 0,
      tone: 'cooperative',
      lastUpdated: Date.now()
    };
  }

  /**
   * 의심 레벨 기반 tone 계산
   */
  static calculateTone(suspicionLevel: number): EmotionalTone {
    if (suspicionLevel < 25) {
      return 'cooperative';
    } else if (suspicionLevel < 50) {
      return 'nervous';
    } else if (suspicionLevel < 75) {
      return 'defensive';
    } else {
      return 'aggressive';
    }
  }

  /**
   * 감정 상태 업데이트
   */
  static updateState(
    currentState: EmotionalState,
    update: EmotionalUpdate
  ): EmotionalState {
    // 의심 레벨 업데이트 (0-100 범위 유지)
    let newSuspicionLevel = currentState.suspicionLevel + update.suspicionDelta;
    newSuspicionLevel = Math.max(0, Math.min(100, newSuspicionLevel));

    // Tone 재계산
    const newTone = this.calculateTone(newSuspicionLevel);

    console.log(`🎭 Emotional state updated: ${currentState.suspicionLevel} → ${newSuspicionLevel} (${update.reason})`);
    console.log(`   Tone: ${currentState.tone} → ${newTone}`);

    return {
      suspicionLevel: newSuspicionLevel,
      tone: newTone,
      lastUpdated: Date.now()
    };
  }

  /**
   * 사용자 질문 분석하여 의심 레벨 변화 계산
   */
  static analyzeQuestionImpact(question: string, isGuilty: boolean): EmotionalUpdate {
    const lowerQuestion = question.toLowerCase();

    // 공격적인 질문 감지
    const aggressiveKeywords = [
      '거짓말',
      '숨기',
      '범인',
      '살인',
      '죽였',
      '알리바이',
      '증거',
      '모순'
    ];

    const isAggressive = aggressiveKeywords.some(keyword =>
      lowerQuestion.includes(keyword)
    );

    // 범인인 경우 더 큰 영향
    const multiplier = isGuilty ? 1.5 : 1.0;

    if (isAggressive) {
      // 공격적인 질문: +5 ~ +10
      const delta = Math.round((5 + Math.random() * 5) * multiplier);
      return {
        suspicionDelta: delta,
        reason: 'Aggressive questioning'
      };
    }

    // 일반 질문: +1 ~ +3
    const delta = Math.round((1 + Math.random() * 2) * multiplier);
    return {
      suspicionDelta: delta,
      reason: 'Normal questioning'
    };
  }

  /**
   * 용의자 감정 상태 조회
   */
  static async getSuspectState(suspectId: string): Promise<EmotionalState> {
    const suspect = await KVStoreManager.getSuspect(suspectId);

    if (!suspect) {
      throw new Error(`Suspect not found: ${suspectId}`);
    }

    return suspect.emotionalState;
  }

  /**
   * 용의자 감정 상태 저장
   */
  static async updateSuspectState(
    suspectId: string,
    update: EmotionalUpdate
  ): Promise<EmotionalState> {
    const suspect = await KVStoreManager.getSuspect(suspectId);

    if (!suspect) {
      throw new Error(`Suspect not found: ${suspectId}`);
    }

    // 현재 상태 업데이트
    const newState = this.updateState(suspect.emotionalState, update);

    // KV 저장
    await KVStoreManager.updateSuspectEmotion(suspectId, newState);

    return newState;
  }

  /**
   * 대화 기록 기반 감정 상태 조정
   */
  static async handleConversationUpdate(
    suspectId: string,
    userQuestion: string
  ): Promise<EmotionalState> {
    const suspect = await KVStoreManager.getSuspect(suspectId);

    if (!suspect) {
      throw new Error(`Suspect not found: ${suspectId}`);
    }

    // 질문 영향 분석
    const impact = this.analyzeQuestionImpact(userQuestion, suspect.isGuilty);

    // 상태 업데이트
    return await this.updateSuspectState(suspectId, impact);
  }

  /**
   * Tone에 따른 응답 스타일 가이드
   */
  static getToneGuidance(tone: EmotionalTone): string {
    switch (tone) {
      case 'cooperative':
        return '협조적이고 차분하게 답변합니다. 정보를 기꺼이 공유합니다.';

      case 'nervous':
        return '긴장하고 불안해하며 답변합니다. 말을 더듬거나 방어적인 뉘앙스가 있습니다.';

      case 'defensive':
        return '방어적이고 경계하며 답변합니다. 질문의 의도를 의심하고 최소한의 정보만 제공합니다.';

      case 'aggressive':
        return '공격적이고 적대적으로 답변합니다. 질문을 거부하거나 역공합니다.';
    }
  }

  /**
   * 감정 상태 리셋 (테스트/관리용)
   */
  static async resetSuspectState(suspectId: string): Promise<void> {
    const initialState = this.createInitialState();
    await KVStoreManager.updateSuspectEmotion(suspectId, initialState);
    console.log(`✅ Suspect ${suspectId} emotional state reset`);
  }

  /**
   * 모든 용의자 상태 요약
   */
  static async summarizeCaseEmotions(caseId: string): Promise<{
    suspectId: string;
    name: string;
    suspicionLevel: number;
    tone: EmotionalTone;
    isGuilty: boolean;
  }[]> {
    const suspects = await KVStoreManager.getCaseSuspects(caseId);

    return suspects.map(suspect => ({
      suspectId: suspect.id,
      name: suspect.name,
      suspicionLevel: suspect.emotionalState.suspicionLevel,
      tone: suspect.emotionalState.tone,
      isGuilty: suspect.isGuilty
    }));
  }
}
