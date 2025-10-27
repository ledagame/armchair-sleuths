/**
 * HTTPGameAPIClient.ts
 *
 * HTTP를 통한 GameAPI 인터페이스 실제 구현
 * fetch API를 사용하여 백엔드와 통신
 *
 * 특징:
 * 1. 타입 안전성: 모든 응답을 GameAPI 타입으로 변환
 * 2. 에러 처리: 일관된 에러 처리 및 변환
 * 3. 재사용 가능: baseUrl을 주입받아 다양한 환경 지원
 */

import type { GameAPI } from './GameAPI';
import { APIError, isAPIError } from './GameAPI';
import { API_ENDPOINTS } from '../../shared/api/endpoints';
import type { CaseData, W4HAnswer, ScoringResult, CaseApiResponse } from '../types';
import type {
  InterrogationResponse,
  SearchLocationResponse,
  ImageGenerationStatusResponse,
  APStatusResponse,
} from '../../shared/types/api';
import type { SearchLocationRequest } from '../../shared/types/Discovery';

/**
 * HTTPGameAPIClient
 *
 * GameAPI 인터페이스의 HTTP 구현체
 * fetch API를 사용하여 실제 백엔드와 통신
 */
export class HTTPGameAPIClient implements GameAPI {
  private baseUrl: string;

  /**
   * HTTPGameAPIClient 생성자
   *
   * @param baseUrl - API 베이스 URL (기본값: '')
   */
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // ===========================================================================
  // Private Helper Methods (비공개 헬퍼 메서드)
  // ===========================================================================

  /**
   * HTTP 응답 처리 및 타입 변환
   *
   * @param response - fetch 응답
   * @returns 파싱된 JSON 데이터
   * @throws APIError - HTTP 에러 또는 JSON 파싱 실패 시
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // HTTP 에러 체크
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      if (isAPIError(errorData)) {
        throw new APIError(response.status, errorData.message, errorData);
      }

      throw new APIError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    // JSON 파싱
    try {
      return await response.json();
    } catch (error) {
      throw new APIError(response.status, 'Failed to parse JSON response', error);
    }
  }

  /**
   * GET 요청
   *
   * @param endpoint - API 엔드포인트
   * @returns 응답 데이터
   */
  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(this.baseUrl + endpoint);
    return this.handleResponse<T>(response);
  }

  /**
   * POST 요청
   *
   * @param endpoint - API 엔드포인트
   * @param body - 요청 바디
   * @returns 응답 데이터
   */
  private async post<T>(endpoint: string, body?: unknown): Promise<T> {
    const response = await fetch(this.baseUrl + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : null,
    });
    return this.handleResponse<T>(response);
  }

  /**
   * CaseApiResponse → CaseData 변환
   *
   * @param apiResponse - API 응답
   * @returns CaseData
   */
  private transformCaseData(apiResponse: CaseApiResponse): CaseData {
    const caseData: CaseData = {
      id: apiResponse.id,
      date: apiResponse.date,
      victim: apiResponse.victim,
      weapon: apiResponse.weapon,
      location: apiResponse.location,
      suspects: apiResponse.suspects || [],
      generatedAt: apiResponse.generatedAt,
    };

    // Only add optional fields if they exist (exactOptionalPropertyTypes compliance)
    if (apiResponse.locations) caseData.locations = apiResponse.locations;
    if (apiResponse.evidence) caseData.evidence = apiResponse.evidence;
    if (apiResponse.evidenceDistribution) caseData.evidenceDistribution = apiResponse.evidenceDistribution;
    if (apiResponse.imageUrl) caseData.imageUrl = apiResponse.imageUrl;
    if (apiResponse.cinematicImages) caseData.cinematicImages = apiResponse.cinematicImages;
    if (apiResponse.introSlides) caseData.introSlides = apiResponse.introSlides;
    if (apiResponse.introNarration) caseData.introNarration = apiResponse.introNarration;

    return caseData;
  }

  // ===========================================================================
  // Case Management (케이스 관리)
  // ===========================================================================

  async getCaseToday(): Promise<CaseData> {
    console.log('[HTTPGameAPIClient] Fetching today\'s case...');
    const response = await this.get<CaseApiResponse>(API_ENDPOINTS.CASE_TODAY);
    console.log('[HTTPGameAPIClient] Today\'s case loaded:', response.id);
    return this.transformCaseData(response);
  }

  async getCaseById(caseId: string): Promise<CaseData> {
    console.log(`[HTTPGameAPIClient] Fetching case: ${caseId}...`);
    const response = await this.get<CaseApiResponse>(API_ENDPOINTS.CASE_BY_ID(caseId));
    console.log('[HTTPGameAPIClient] Case loaded:', response.id);
    return this.transformCaseData(response);
  }

  async generateCase(): Promise<{ caseId: string }> {
    console.log('[HTTPGameAPIClient] Generating new case...');
    const response = await this.post<{ caseId: string }>(API_ENDPOINTS.CASE_GENERATE);
    console.log('[HTTPGameAPIClient] Case generated:', response.caseId);
    return response;
  }

  async getImageStatus(caseId: string): Promise<ImageGenerationStatusResponse> {
    console.log(`[HTTPGameAPIClient] Fetching image status for case: ${caseId}...`);
    const response = await this.get<ImageGenerationStatusResponse>(
      API_ENDPOINTS.CASE_IMAGE_STATUS(caseId)
    );
    console.log('[HTTPGameAPIClient] Image status:', response.complete ? 'Complete' : 'In progress');
    return response;
  }

  // ===========================================================================
  // Suspect Management (용의자 관리)
  // ===========================================================================

  async askSuspect(
    suspectId: string,
    message: string,
    userId: string,
    caseId: string,
    conversationId?: string
  ): Promise<InterrogationResponse> {
    console.log(`[HTTPGameAPIClient] Asking suspect: ${suspectId}...`);
    const response = await this.post<InterrogationResponse>(
      API_ENDPOINTS.SUSPECT_ASK(suspectId),
      {
        userId,
        message,
        caseId,
        conversationId: conversationId || `conv-${suspectId}-${Date.now()}`,
      }
    );
    console.log('[HTTPGameAPIClient] Suspect responded');
    return response;
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
    console.log(`[HTTPGameAPIClient] Fetching conversation: ${suspectId}/${userId}...`);
    const response = await this.get<{
      messages: Array<{
        role: 'user' | 'suspect';
        content: string;
        timestamp: number;
      }>;
    }>(API_ENDPOINTS.SUSPECT_CONVERSATION(suspectId, userId));
    console.log(`[HTTPGameAPIClient] Conversation loaded: ${response.messages.length} messages`);
    return response;
  }

  // ===========================================================================
  // Evidence Discovery (증거 발견)
  // ===========================================================================

  async searchLocation(request: SearchLocationRequest): Promise<SearchLocationResponse> {
    console.log(`[HTTPGameAPIClient] Searching location: ${request.locationId}...`);
    const response = await this.post<SearchLocationResponse>(
      API_ENDPOINTS.LOCATION_SEARCH,
      request
    );
    console.log(
      `[HTTPGameAPIClient] Search complete: ${response.evidenceFound.length} evidence found`
    );
    return response;
  }

  // ===========================================================================
  // Submission (답안 제출)
  // ===========================================================================

  async submitAnswer(userId: string, caseId: string, answers: W4HAnswer): Promise<ScoringResult> {
    console.log(`[HTTPGameAPIClient] Submitting answer for case: ${caseId}...`);
    const response = await this.post<ScoringResult>(API_ENDPOINTS.SUBMIT_ANSWER, {
      userId,
      caseId,
      answers,
    });
    console.log(`[HTTPGameAPIClient] Answer submitted: Score ${response.score}`);
    return response;
  }

  // ===========================================================================
  // Player State (플레이어 상태)
  // ===========================================================================

  async getPlayerState(caseId: string, userId: string): Promise<APStatusResponse> {
    console.log(`[HTTPGameAPIClient] Fetching player state: ${caseId}/${userId}...`);
    const response = await this.get<APStatusResponse>(
      API_ENDPOINTS.PLAYER_STATE(caseId, userId)
    );
    console.log(
      `[HTTPGameAPIClient] Player state loaded: ${response.actionPoints.current} AP`
    );
    return response;
  }
}
