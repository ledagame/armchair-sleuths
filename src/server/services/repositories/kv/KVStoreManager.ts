/**
 * KVStoreManager.ts
 *
 * Devvit Redis KV 추상화 레이어
 * 타입 안전성과 편의 메서드 제공
 */

import { IStorageAdapter } from '../adapters/IStorageAdapter';
import type { IntroNarration, IntroSlides, CinematicImages, ImageGenerationStatus, ImageGenerationMeta } from '../../../shared/types/index';
import type { Location, EvidenceDistribution } from '../../../shared/types/Discovery';
import type { EvidenceItem, PlayerEvidenceState } from '../../../shared/types/Evidence';
import type { APTopic, ActionPointsConfig } from '../../../shared/types/Case';

export interface CaseData {
  id: string;
  date: string; // ISO 8601 format
  victim: {
    name: string;
    background: string;
    relationship: string;
  };
  weapon: {
    name: string;
    description: string;
  };
  location: {
    name: string;
    description: string;
  };
  suspects: Array<{
    id: string;
    name: string;
    archetype: string;
    isGuilty: boolean;
  }>;
  solution: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
  generatedAt: number; // timestamp
  imageUrl?: string;
  cinematicImages?: CinematicImages; // 시네마틱 인트로 이미지 (Gemini API로 생성, 3개 핵심 씬)
  introNarration?: IntroNarration; // 인트로 나레이션 (Gemini API로 생성) - DEPRECATED, use introSlides
  introSlides?: IntroSlides; // NEW: 3-slide intro system (discovery, suspects, challenge)
  // Image generation status (백그라운드 생성 추적)
  imageGenerationStatus?: ImageGenerationStatus; // 이미지 생성 상태
  imageGenerationMeta?: ImageGenerationMeta; // 이미지 생성 메타데이터
  // Discovery system data
  locations?: Location[]; // 탐색 가능한 장소 목록 (4개, Medium 난이도)
  evidence?: EvidenceItem[]; // 증거 목록 (10개, Medium 난이도)
  evidenceDistribution?: EvidenceDistribution; // 증거 분배 정보
  // Action Points system
  actionPoints: ActionPointsConfig; // AP configuration (initial, maximum, costs)
}

export interface SuspectData {
  id: string;
  caseId: string;
  name: string;
  archetype: string;
  background: string;
  personality: string;
  isGuilty: boolean;
  emotionalState: {
    suspicionLevel: number; // 0-100
    tone: 'cooperative' | 'nervous' | 'defensive' | 'aggressive';
    lastUpdated: number; // timestamp
  };
  profileImageUrl?: string; // Profile image (Base64 data URL)
  apTopics: APTopic[]; // AP topics for this suspect
}

export interface ConversationData {
  caseId: string;
  suspectId: string;
  userId: string;
  messages: Array<{
    role: 'user' | 'suspect';
    content: string;
    timestamp: number;
  }>;
  lastMessageAt: number;
}

export interface SubmissionData {
  userId: string;
  caseId: string;
  submittedAt: number;
  answers: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
  score?: number;
  isCorrect?: boolean;
}

/**
 * Devvit Redis KV 추상화 매니저
 */
export class KVStoreManager {
  private static adapter: IStorageAdapter;

  /**
   * Sets the storage adapter for the KV store.
   * Must be called before using any other methods.
   *
   * @param adapter - The storage adapter implementation to use
   */
  static setAdapter(adapter: IStorageAdapter): void {
    console.log('🔧 KVStoreManager.setAdapter: Setting adapter:', adapter ? 'EXISTS' : 'UNDEFINED');
    this.adapter = adapter;
    console.log('✅ KVStoreManager.setAdapter: Adapter set successfully');
  }

  /**
   * Gets the current storage adapter.
   * @returns The storage adapter instance
   */
  static getAdapter(): IStorageAdapter {
    console.log('🔍 KVStoreManager.getAdapter: Called, adapter:', this.adapter ? 'EXISTS' : 'UNDEFINED');
    if (!this.adapter) {
      console.error('❌ KVStoreManager.getAdapter: Adapter not initialized!');
      throw new Error('Storage adapter not initialized. Call setAdapter() first.');
    }
    console.log('✅ KVStoreManager.getAdapter: Returning adapter');
    return this.adapter;
  }

  /**
   * 케이스 저장
   */
  static async saveCase(caseData: CaseData): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `case:${caseData.id}`;
    await this.adapter.set(key, JSON.stringify(caseData));

    // 날짜 인덱스 저장 (검색 최적화)
    const dateKey = `case:date:${caseData.date}`;
    await this.adapter.set(dateKey, caseData.id);
  }

  /**
   * 케이스 조회
   */
  static async getCase(caseId: string): Promise<CaseData | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `case:${caseId}`;
    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as CaseData;
  }

  /**
   * 특정 날짜의 케이스 조회
   */
  static async getCaseByDate(date: string): Promise<CaseData | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const dateKey = `case:date:${date}`;
    const caseId = await this.adapter.get(dateKey);

    if (!caseId) {
      return null;
    }

    return this.getCase(caseId);
  }

  /**
   * 오늘의 케이스 조회
   */
  static async getTodaysCase(): Promise<CaseData | null> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return this.getCaseByDate(today);
  }

  /**
   * 용의자 저장
   */
  static async saveSuspect(suspectData: SuspectData): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `suspect:${suspectData.id}`;
    await this.adapter.set(key, JSON.stringify(suspectData));

    // 케이스별 용의자 인덱스
    const caseKey = `case:${suspectData.caseId}:suspects`;
    await this.adapter.sAdd(caseKey, suspectData.id);
  }

  /**
   * 용의자 조회
   */
  static async getSuspect(suspectId: string): Promise<SuspectData | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `suspect:${suspectId}`;
    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as SuspectData;
  }

  /**
   * 케이스의 모든 용의자 조회
   */
  static async getCaseSuspects(caseId: string): Promise<SuspectData[]> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const caseKey = `case:${caseId}:suspects`;
    const suspectIds = await this.adapter.sMembers(caseKey);

    const suspects: SuspectData[] = [];
    for (const suspectId of suspectIds) {
      const suspect = await this.getSuspect(suspectId);
      if (suspect) {
        suspects.push(suspect);
      }
    }

    return suspects;
  }

  /**
   * 용의자 감정 상태 업데이트
   */
  static async updateSuspectEmotion(
    suspectId: string,
    emotionalState: SuspectData['emotionalState']
  ): Promise<void> {
    const suspect = await this.getSuspect(suspectId);
    if (!suspect) {
      throw new Error(`Suspect not found: ${suspectId}`);
    }

    suspect.emotionalState = {
      ...emotionalState,
      lastUpdated: Date.now()
    };

    await this.saveSuspect(suspect);
  }

  /**
   * 대화 저장
   */
  static async saveConversation(conversation: ConversationData): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `conversation:${conversation.caseId}:${conversation.suspectId}:${conversation.userId}`;
    await this.adapter.set(key, JSON.stringify(conversation));
  }

  /**
   * 대화 조회
   */
  static async getConversation(
    caseId: string,
    suspectId: string,
    userId: string
  ): Promise<ConversationData | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `conversation:${caseId}:${suspectId}:${userId}`;
    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as ConversationData;
  }

  /**
   * 대화에 메시지 추가
   */
  static async addMessage(
    caseId: string,
    suspectId: string,
    userId: string,
    role: 'user' | 'suspect',
    content: string
  ): Promise<void> {
    let conversation = await this.getConversation(caseId, suspectId, userId);

    if (!conversation) {
      conversation = {
        caseId,
        suspectId,
        userId,
        messages: [],
        lastMessageAt: Date.now()
      };
    }

    conversation.messages.push({
      role,
      content,
      timestamp: Date.now()
    });

    conversation.lastMessageAt = Date.now();

    await this.saveConversation(conversation);
  }

  /**
   * 답안 제출 저장
   */
  static async saveSubmission(submission: SubmissionData): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `submission:${submission.caseId}:${submission.userId}`;
    await this.adapter.set(key, JSON.stringify(submission));

    // 케이스별 제출 인덱스
    const caseKey = `case:${submission.caseId}:submissions`;
    await this.adapter.sAdd(caseKey, submission.userId);
  }

  /**
   * 사용자 답안 조회
   */
  static async getSubmission(
    caseId: string,
    userId: string
  ): Promise<SubmissionData | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `submission:${caseId}:${userId}`;
    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as SubmissionData;
  }

  /**
   * 케이스의 모든 제출 조회 (리더보드용)
   */
  static async getCaseSubmissions(caseId: string): Promise<SubmissionData[]> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const caseKey = `case:${caseId}:submissions`;
    const userIds = await this.adapter.sMembers(caseKey);

    const submissions: SubmissionData[] = [];
    for (const userId of userIds) {
      const submission = await this.getSubmission(caseId, userId);
      if (submission) {
        submissions.push(submission);
      }
    }

    // 점수 순으로 정렬
    return submissions.sort((a, b) => (b.score || 0) - (a.score || 0));
  }

  /**
   * 리더보드 조회 (점수 기준 상위 N명)
   */
  static async getLeaderboard(caseId: string, limit: number = 10): Promise<SubmissionData[]> {
    const submissions = await this.getCaseSubmissions(caseId);
    return submissions.slice(0, limit);
  }

  // =============================================================================
  // Evidence Discovery System
  // =============================================================================

  /**
   * 플레이어 증거 상태 저장
   */
  static async savePlayerEvidenceState(state: PlayerEvidenceState): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `player-state:${state.caseId}:${state.userId}`;

    // Convert Sets to arrays for JSON serialization
    const serializable = {
      ...state,
      actionPoints: {
        ...state.actionPoints,
        acquiredTopics: Array.from(state.actionPoints.acquiredTopics),
        bonusesAcquired: Array.from(state.actionPoints.bonusesAcquired)
      }
    };

    await this.adapter.set(key, JSON.stringify(serializable));
  }

  /**
   * 플레이어 증거 상태 조회
   */
  static async getPlayerEvidenceState(
    caseId: string,
    userId: string
  ): Promise<PlayerEvidenceState | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `player-state:${caseId}:${userId}`;
    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);

    // Convert date strings back to Date objects and arrays back to Sets
    return {
      ...parsed,
      discoveredEvidence: parsed.discoveredEvidence.map((d: any) => ({
        ...d,
        discoveredAt: new Date(d.discoveredAt)
      })),
      searchHistory: parsed.searchHistory.map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      })),
      lastUpdated: new Date(parsed.lastUpdated),
      actionPoints: {
        ...parsed.actionPoints,
        acquisitionHistory: parsed.actionPoints.acquisitionHistory.map((a: any) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })),
        spendingHistory: parsed.actionPoints.spendingHistory.map((s: any) => ({
          ...s,
          timestamp: new Date(s.timestamp)
        })),
        acquiredTopics: new Set(parsed.actionPoints.acquiredTopics),
        bonusesAcquired: new Set(parsed.actionPoints.bonusesAcquired)
      }
    } as PlayerEvidenceState;
  }

  /**
   * 증거 분배 정보 저장
   */
  static async saveEvidenceDistribution(distribution: EvidenceDistribution): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `evidence-distribution:${distribution.caseId}`;
    await this.adapter.set(key, JSON.stringify(distribution));
  }

  /**
   * 증거 분배 정보 조회
   */
  static async getEvidenceDistribution(caseId: string): Promise<EvidenceDistribution | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `evidence-distribution:${caseId}`;
    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as EvidenceDistribution;
  }

  /**
   * 범용 키-값 저장 (Generic put method)
   * 임의의 객체를 JSON으로 직렬화하여 저장
   */
  static async put(key: string, value: any): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    await this.adapter.set(key, JSON.stringify(value));
  }

  /**
   * 범용 키-값 조회 (Generic get method)
   * JSON으로 직렬화된 데이터를 파싱하여 반환
   */
  static async get<T = any>(key: string): Promise<T | null> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const data = await this.adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as T;
  }

  /**
   * 캐시 초기화 (개발/테스트용)
   */
  static async clearAllData(): Promise<void> {
    console.warn('⚠️ Clearing all data - use only for development/testing!');
    // Redis의 모든 키 삭제는 Devvit에서 직접 지원하지 않으므로
    // 각 키를 명시적으로 삭제해야 함
    // 프로덕션에서는 사용하지 않음
  }

  /**
   * 특정 케이스 데이터 삭제 (관리자용)
   */
  static async deleteCase(caseId: string): Promise<void> {
    if (!this.adapter) {
      throw new Error('Storage adapter not initialized. Call KVStoreManager.setAdapter() first.');
    }

    const key = `case:${caseId}`;
    const caseData = await this.getCase(caseId);

    if (caseData) {
      // 날짜 인덱스 삭제
      const dateKey = `case:date:${caseData.date}`;
      await this.adapter.del(dateKey);
    }

    // 케이스 삭제
    await this.adapter.del(key);

    // 관련 용의자들 삭제
    const caseKey = `case:${caseId}:suspects`;
    const suspectIds = await this.adapter.sMembers(caseKey);
    for (const suspectId of suspectIds) {
      await this.adapter.del(`suspect:${suspectId}`);
    }
    await this.adapter.del(caseKey);

    // 제출 인덱스 삭제 (제출 데이터는 보존)
    const submissionsKey = `case:${caseId}:submissions`;
    await this.adapter.del(submissionsKey);

    // Evidence distribution 삭제
    const distributionKey = `evidence-distribution:${caseId}`;
    await this.adapter.del(distributionKey);
  }
}
