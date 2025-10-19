/**
 * CaseRepository.ts
 *
 * 케이스 관련 비즈니스 로직과 데이터 접근을 분리하는 Repository 패턴
 */

import { KVStoreManager, type CaseData, type SuspectData } from './KVStoreManager';
import type { IntroNarration } from '../../../shared/types/index';

export interface CreateCaseInput {
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
    name: string;
    archetype: string;
    background: string;
    personality: string;
    isGuilty: boolean;
    profileImageUrl?: string; // Profile image URL
  }>;
  solution: {
    who: string;
    what: string;
    where: string;
    when: string;
    why: string;
    how: string;
  };
  imageUrl?: string;
  introNarration?: IntroNarration; // 인트로 나레이션 (Gemini API로 생성)
}

/**
 * 케이스 데이터 접근 Repository
 */
export class CaseRepository {
  /**
   * 새로운 케이스 생성
   * @param input - 케이스 생성 데이터
   * @param date - 케이스 날짜 (선택, 기본값: 현재 날짜)
   * @param customCaseId - 커스텀 케이스 ID (선택, 타임스탬프 기반 고유 ID 생성 시 사용)
   */
  static async createCase(input: CreateCaseInput, date?: Date, customCaseId?: string): Promise<CaseData> {
    const targetDate = date || new Date();
    const dateStr = targetDate.toISOString().split('T')[0]; // YYYY-MM-DD

    // 케이스 ID 생성 (customCaseId가 있으면 사용, 없으면 기존 방식)
    const caseId = customCaseId || `case-${dateStr}`;

    // 용의자 ID 생성 및 매핑
    const suspectsWithIds = input.suspects.map((suspect, index) => ({
      id: `${caseId}-suspect-${index + 1}`,
      name: suspect.name,
      archetype: suspect.archetype,
      isGuilty: suspect.isGuilty
    }));

    // 케이스 데이터 구성
    const caseData: CaseData = {
      id: caseId,
      date: dateStr,
      victim: input.victim,
      weapon: input.weapon,
      location: input.location,
      suspects: suspectsWithIds,
      solution: input.solution,
      generatedAt: Date.now(),
      imageUrl: input.imageUrl,
      introNarration: input.introNarration
    };

    // 케이스 저장
    await KVStoreManager.saveCase(caseData);

    // 용의자 상세 데이터 저장
    for (let i = 0; i < input.suspects.length; i++) {
      const suspectInput = input.suspects[i];
      const suspectWithId = suspectsWithIds[i];

      const suspectData: SuspectData = {
        id: suspectWithId.id,
        caseId: caseId,
        name: suspectWithId.name,
        archetype: suspectWithId.archetype,
        background: suspectInput.background,
        personality: suspectInput.personality,
        isGuilty: suspectWithId.isGuilty,
        emotionalState: {
          suspicionLevel: 0, // 초기 의심 레벨
          tone: 'cooperative', // 초기 태도
          lastUpdated: Date.now()
        },
        profileImageUrl: suspectInput.profileImageUrl // Profile image URL
      };

      await KVStoreManager.saveSuspect(suspectData);
    }

    console.log(`✅ Case created: ${caseId} for date ${dateStr}`);

    return caseData;
  }

  /**
   * 오늘의 케이스 조회 또는 생성
   * (케이스가 없으면 null 반환 - CaseGeneratorService에서 생성)
   */
  static async getTodaysCase(): Promise<CaseData | null> {
    return await KVStoreManager.getTodaysCase();
  }

  /**
   * 특정 날짜의 케이스 조회
   */
  static async getCaseByDate(date: string): Promise<CaseData | null> {
    return await KVStoreManager.getCaseByDate(date);
  }

  /**
   * 케이스 ID로 조회
   */
  static async getCaseById(caseId: string): Promise<CaseData | null> {
    return await KVStoreManager.getCase(caseId);
  }

  /**
   * 케이스의 모든 용의자 조회
   */
  static async getCaseSuspects(caseId: string): Promise<SuspectData[]> {
    return await KVStoreManager.getCaseSuspects(caseId);
  }

  /**
   * 특정 용의자 조회
   */
  static async getSuspectById(suspectId: string): Promise<SuspectData | null> {
    return await KVStoreManager.getSuspect(suspectId);
  }

  /**
   * 용의자 감정 상태 업데이트
   * (AI 대화 중 동적으로 변화)
   */
  static async updateSuspectEmotionalState(
    suspectId: string,
    suspicionLevel: number,
    tone: 'cooperative' | 'nervous' | 'defensive' | 'aggressive'
  ): Promise<void> {
    await KVStoreManager.updateSuspectEmotion(suspectId, {
      suspicionLevel,
      tone,
      lastUpdated: Date.now()
    });

    console.log(`✅ Suspect ${suspectId} emotional state updated: ${tone}, suspicion: ${suspicionLevel}`);
  }

  /**
   * 케이스 삭제 (관리자 전용)
   */
  static async deleteCase(caseId: string): Promise<void> {
    await KVStoreManager.deleteCase(caseId);
    console.log(`✅ Case deleted: ${caseId}`);
  }

  /**
   * 케이스 존재 여부 확인
   */
  static async caseExists(caseId: string): Promise<boolean> {
    const caseData = await KVStoreManager.getCase(caseId);
    return caseData !== null;
  }

  /**
   * 오늘의 케이스가 생성되었는지 확인
   */
  static async hasTodaysCase(): Promise<boolean> {
    const todaysCase = await KVStoreManager.getTodaysCase();
    return todaysCase !== null;
  }

  /**
   * 케이스 이미지 URL 업데이트
   * (이미지 생성이 비동기로 완료된 후 호출)
   */
  static async updateCaseImage(caseId: string, imageUrl: string): Promise<void> {
    const caseData = await KVStoreManager.getCase(caseId);
    if (!caseData) {
      throw new Error(`Case not found: ${caseId}`);
    }

    caseData.imageUrl = imageUrl;
    await KVStoreManager.saveCase(caseData);

    console.log(`✅ Case image updated: ${caseId}`);
  }

  /**
   * 범인 찾기 (검증용)
   */
  static async getGuiltySuspect(caseId: string): Promise<SuspectData | null> {
    const suspects = await KVStoreManager.getCaseSuspects(caseId);
    return suspects.find(s => s.isGuilty) || null;
  }

  /**
   * 케이스 통계 정보
   */
  static async getCaseStats(caseId: string): Promise<{
    totalSubmissions: number;
    correctSubmissions: number;
    averageScore: number;
  }> {
    const submissions = await KVStoreManager.getCaseSubmissions(caseId);

    const totalSubmissions = submissions.length;
    const correctSubmissions = submissions.filter(s => s.isCorrect).length;
    const averageScore = totalSubmissions > 0
      ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions
      : 0;

    return {
      totalSubmissions,
      correctSubmissions,
      averageScore: Math.round(averageScore * 100) / 100 // 소수점 2자리
    };
  }

  /**
   * 리더보드 조회
   */
  static async getLeaderboard(caseId: string, limit: number = 10) {
    return await KVStoreManager.getLeaderboard(caseId, limit);
  }
}
