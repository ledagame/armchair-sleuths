/**
 * MockGameAPIClient.ts
 *
 * 테스트용 GameAPI Mock 구현
 * 실제 백엔드 없이 클라이언트 로직을 테스트할 수 있음
 *
 * 사용 예시:
 * ```typescript
 * const mockAPI = new MockGameAPIClient();
 * const caseData = await mockAPI.getCaseToday();
 * ```
 */

import type { GameAPI } from './GameAPI';
import { APIError } from './GameAPI';
import type { CaseData, W4HAnswer, ScoringResult } from '../types';
import type {
  InterrogationResponse,
  SearchLocationResponse,
  ImageGenerationStatusResponse,
  APStatusResponse,
} from '../../shared/types/api';
import type { SearchLocationRequest } from '../../shared/types/Discovery';

/**
 * MockGameAPIClient
 *
 * GameAPI 인터페이스의 Mock 구현체
 * 하드코딩된 테스트 데이터를 반환
 */
export class MockGameAPIClient implements GameAPI {
  private delay: number;
  private shouldFail: boolean;

  /**
   * MockGameAPIClient 생성자
   *
   * @param delay - 응답 지연 시간 (ms, 기본값: 100ms)
   * @param shouldFail - 에러 시뮬레이션 여부 (기본값: false)
   */
  constructor(delay: number = 100, shouldFail: boolean = false) {
    this.delay = delay;
    this.shouldFail = shouldFail;
  }

  /**
   * 응답 지연 시뮬레이션
   */
  private async simulateDelay(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, this.delay));
  }

  /**
   * 에러 시뮬레이션
   */
  private throwIfShouldFail(message: string): void {
    if (this.shouldFail) {
      throw new APIError(500, message);
    }
  }

  // ===========================================================================
  // Case Management (케이스 관리)
  // ===========================================================================

  async getCaseToday(): Promise<CaseData> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to fetch today\'s case');

    console.log('[MockGameAPIClient] Returning mock case data');

    return {
      id: 'mock-case-001',
      date: '2025-01-15',
      victim: {
        name: '존 도우',
        background: '유명한 사업가',
        relationship: '피해자',
      },
      weapon: {
        name: '권총',
        description: '.45 구경 권총',
      },
      location: {
        name: '사무실',
        description: '피해자의 개인 사무실',
      },
      suspects: [
        {
          id: 'suspect-001',
          caseId: 'mock-case-001',
          name: '제인 스미스',
          archetype: 'business_partner',
          background: '피해자의 비즈니스 파트너',
          personality: '차갑고 계산적',
          emotionalState: {
            suspicionLevel: 70,
            tone: 'defensive',
          },
        },
        {
          id: 'suspect-002',
          caseId: 'mock-case-001',
          name: '마이크 존슨',
          archetype: 'employee',
          background: '피해자의 비서',
          personality: '충성스럽지만 긴장함',
          emotionalState: {
            suspicionLevel: 40,
            tone: 'nervous',
          },
        },
      ],
      locations: [
        {
          id: 'loc-001',
          name: '사무실',
          description: '피해자의 개인 사무실',
          emoji: '🏢',
        },
        {
          id: 'loc-002',
          name: '회의실',
          description: '주요 회의실',
          emoji: '📊',
        },
      ],
      generatedAt: Date.now(),
    };
  }

  async getCaseById(caseId: string): Promise<CaseData> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to fetch case by ID');

    console.log(`[MockGameAPIClient] Returning mock case: ${caseId}`);

    // getCaseToday와 동일한 데이터 반환 (실제로는 caseId에 따라 다를 수 있음)
    const caseData = await this.getCaseToday();
    return { ...caseData, id: caseId };
  }

  async generateCase(): Promise<{ caseId: string }> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to generate case');

    const caseId = `mock-case-${Date.now()}`;
    console.log(`[MockGameAPIClient] Generated mock case: ${caseId}`);

    return { caseId };
  }

  async getImageStatus(caseId: string): Promise<ImageGenerationStatusResponse> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to fetch image status');

    console.log(`[MockGameAPIClient] Returning mock image status for: ${caseId}`);

    return {
      caseId,
      evidence: {
        status: 'complete',
        total: 10,
        completed: 10,
        failed: 0,
        completedAt: new Date().toISOString(),
      },
      location: {
        status: 'complete',
        total: 4,
        completed: 4,
        failed: 0,
        completedAt: new Date().toISOString(),
      },
      complete: true,
      lastUpdated: new Date().toISOString(),
    };
  }

  // ===========================================================================
  // Suspect Management (용의자 관리)
  // ===========================================================================

  async askSuspect(
    suspectId: string,
    message: string,
    _userId: string,
    _caseId: string,
    conversationId?: string
  ): Promise<InterrogationResponse> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to ask suspect');

    console.log(`[MockGameAPIClient] Suspect ${suspectId} responding to: "${message}"`);

    return {
      success: true,
      aiResponse: `[Mock Response] 저는 그 시간에 회의실에 있었습니다. 누군가 증명해줄 수 있습니다.`,
      conversationId: conversationId || `mock-conv-${Date.now()}`,
      apAcquisition: {
        amount: 1,
        reason: '새로운 정보를 획득했습니다',
        breakdown: {
          topicAP: 1,
          bonusAP: 0,
        },
        newTotal: 4,
      },
      playerState: {
        currentAP: 4,
        totalAP: 4,
        spentAP: 0,
      },
    };
  }

  async getConversation(
    suspectId: string,
    userId: string
  ): Promise<{
    messages: Array<{
      role: 'user' | 'suspect';
      content: string;
      timestamp: number;
    }>;
  }> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to fetch conversation');

    console.log(`[MockGameAPIClient] Returning mock conversation for: ${suspectId}/${userId}`);

    return {
      messages: [
        {
          role: 'user',
          content: '사건 당시 어디에 있었습니까?',
          timestamp: Date.now() - 60000,
        },
        {
          role: 'suspect',
          content: '회의실에 있었습니다.',
          timestamp: Date.now() - 59000,
        },
      ],
    };
  }

  // ===========================================================================
  // Evidence Discovery (증거 발견)
  // ===========================================================================

  async searchLocation(request: SearchLocationRequest): Promise<SearchLocationResponse> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to search location');

    console.log(`[MockGameAPIClient] Searching location: ${request.locationId}`);

    return {
      success: true,
      evidenceFound: [
        {
          id: 'evidence-001',
          type: 'physical',
          name: '지문',
          description: '문 손잡이에서 발견된 지문',
          importance: 8,
          discoveredAt: Date.now(),
        },
      ],
      completionRate: 50,
      message: '1개의 증거를 발견했습니다!',
      playerState: {
        currentAP: 2,
        totalAP: 3,
        spentAP: 1,
      },
    };
  }

  // ===========================================================================
  // Submission (답안 제출)
  // ===========================================================================

  async submitAnswer(userId: string, caseId: string, _answers: W4HAnswer): Promise<ScoringResult> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to submit answer');

    console.log(`[MockGameAPIClient] Submitting answer for: ${caseId}`);

    return {
      userId,
      caseId,
      score: 85,
      isCorrect: true,
      breakdown: {
        who: { score: 10, feedback: '정확합니다!' },
        what: { score: 10, feedback: '정확합니다!' },
        where: { score: 10, feedback: '정확합니다!' },
        when: { score: 10, feedback: '정확합니다!' },
        why: { score: 8, feedback: '거의 정확합니다.' },
        how: { score: 7, feedback: '일부 세부 사항이 누락되었습니다.' },
      },
      submittedAt: Date.now(),
      rank: 5,
      totalParticipants: 42,
    };
  }

  // ===========================================================================
  // Player State (플레이어 상태)
  // ===========================================================================

  async getPlayerState(caseId: string, userId: string): Promise<APStatusResponse> {
    await this.simulateDelay();
    this.throwIfShouldFail('Mock: Failed to fetch player state');

    console.log(`[MockGameAPIClient] Returning mock player state for: ${caseId}/${userId}`);

    return {
      success: true,
      actionPoints: {
        current: 3,
        maximum: 10,
        total: 5,
        spent: 2,
        initial: 3,
        emergencyAPUsed: false,
        acquisitionCount: 2,
        spendingCount: 2,
      },
    };
  }
}
