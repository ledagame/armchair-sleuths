/**
 * KVStoreManager.ts
 *
 * Devvit Redis KV 추상화 레이어
 * 타입 안전성과 편의 메서드 제공
 */

import { redis } from '@devvit/web/server';

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
  /**
   * 케이스 저장
   */
  static async saveCase(caseData: CaseData): Promise<void> {
    const key = `case:${caseData.id}`;
    await redis.set(key, JSON.stringify(caseData));

    // 날짜 인덱스 저장 (검색 최적화)
    const dateKey = `case:date:${caseData.date}`;
    await redis.set(dateKey, caseData.id);
  }

  /**
   * 케이스 조회
   */
  static async getCase(caseId: string): Promise<CaseData | null> {
    const key = `case:${caseId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as CaseData;
  }

  /**
   * 특정 날짜의 케이스 조회
   */
  static async getCaseByDate(date: string): Promise<CaseData | null> {
    const dateKey = `case:date:${date}`;
    const caseId = await redis.get(dateKey);

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
    const key = `suspect:${suspectData.id}`;
    await redis.set(key, JSON.stringify(suspectData));

    // 케이스별 용의자 인덱스
    const caseKey = `case:${suspectData.caseId}:suspects`;
    await redis.sAdd(caseKey, suspectData.id);
  }

  /**
   * 용의자 조회
   */
  static async getSuspect(suspectId: string): Promise<SuspectData | null> {
    const key = `suspect:${suspectId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as SuspectData;
  }

  /**
   * 케이스의 모든 용의자 조회
   */
  static async getCaseSuspects(caseId: string): Promise<SuspectData[]> {
    const caseKey = `case:${caseId}:suspects`;
    const suspectIds = await redis.sMembers(caseKey);

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
    const key = `conversation:${conversation.caseId}:${conversation.suspectId}:${conversation.userId}`;
    await redis.set(key, JSON.stringify(conversation));
  }

  /**
   * 대화 조회
   */
  static async getConversation(
    caseId: string,
    suspectId: string,
    userId: string
  ): Promise<ConversationData | null> {
    const key = `conversation:${caseId}:${suspectId}:${userId}`;
    const data = await redis.get(key);

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
    const key = `submission:${submission.caseId}:${submission.userId}`;
    await redis.set(key, JSON.stringify(submission));

    // 케이스별 제출 인덱스
    const caseKey = `case:${submission.caseId}:submissions`;
    await redis.sAdd(caseKey, submission.userId);
  }

  /**
   * 사용자 답안 조회
   */
  static async getSubmission(
    caseId: string,
    userId: string
  ): Promise<SubmissionData | null> {
    const key = `submission:${caseId}:${userId}`;
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as SubmissionData;
  }

  /**
   * 케이스의 모든 제출 조회 (리더보드용)
   */
  static async getCaseSubmissions(caseId: string): Promise<SubmissionData[]> {
    const caseKey = `case:${caseId}:submissions`;
    const userIds = await redis.sMembers(caseKey);

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
    const key = `case:${caseId}`;
    const caseData = await this.getCase(caseId);

    if (caseData) {
      // 날짜 인덱스 삭제
      const dateKey = `case:date:${caseData.date}`;
      await redis.del(dateKey);
    }

    // 케이스 삭제
    await redis.del(key);

    // 관련 용의자들 삭제
    const caseKey = `case:${caseId}:suspects`;
    const suspectIds = await redis.sMembers(caseKey);
    for (const suspectId of suspectIds) {
      await redis.del(`suspect:${suspectId}`);
    }
    await redis.del(caseKey);

    // 제출 인덱스 삭제 (제출 데이터는 보존)
    const submissionsKey = `case:${caseId}:submissions`;
    await redis.del(submissionsKey);
  }
}
