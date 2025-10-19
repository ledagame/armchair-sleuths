/**
 * /api/cases/[caseId]/search-location
 *
 * 장소 탐색 API 엔드포인트
 * POST: 장소를 탐색하고 증거를 발견
 */

import { NextRequest, NextResponse } from 'next/server';
import type { SearchLocationRequest, SearchLocationResult } from '@/shared/types/Discovery';
import { LocationDiscoveryService } from '@/server/services/discovery/LocationDiscoveryService';
import { EvidenceDiscoveryService } from '@/server/services/discovery/EvidenceDiscoveryService';
import { DiscoveryStateManager } from '@/server/services/discovery/DiscoveryStateManager';
import { KVStoreManager } from '@/server/services/repositories/kv/KVStoreManager';

interface RouteParams {
  params: Promise<{
    caseId: string;
  }>;
}

/**
 * POST /api/cases/[caseId]/search-location
 *
 * @param request - Next.js request object
 * @param params - Route parameters
 * @returns 탐색 결과
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<SearchLocationResult | { error: string }>> {
  try {
    // Next.js 15: params는 Promise
    const { caseId } = await params;

    // 요청 body 파싱
    const body = await request.json();
    const { locationId, searchType = 'quick' } = body;

    // Validation
    if (!locationId) {
      return NextResponse.json(
        { error: 'locationId is required' },
        { status: 400 }
      );
    }

    // TODO: 사용자 ID는 인증 시스템에서 가져와야 함
    // 임시로 'user-1' 사용
    const userId = 'user-1';

    // 케이스 데이터 조회
    const caseData = await KVStoreManager.getCase(caseId);
    if (!caseData) {
      return NextResponse.json(
        { error: `Case not found: ${caseId}` },
        { status: 404 }
      );
    }

    // 증거 분배 데이터 조회
    const distribution = await DiscoveryStateManager.getDistribution(caseId);
    if (!distribution) {
      return NextResponse.json(
        { error: `Evidence distribution not found for case: ${caseId}` },
        { status: 404 }
      );
    }

    // 플레이어 상태 조회
    const playerState = await DiscoveryStateManager.getPlayerState(caseId, userId);

    // locations와 evidence 데이터 조회
    const locations = caseData.locations || [];
    const allEvidence = caseData.evidence || [];

    // Validation: 데이터가 없으면 에러
    if (locations.length === 0 || allEvidence.length === 0) {
      return NextResponse.json(
        { error: `Case ${caseId} does not have discovery data. Please regenerate the case.` },
        { status: 404 }
      );
    }

    // 증거 발견 서비스 초기화
    const discoveryService = new EvidenceDiscoveryService();

    // 장소 탐색 수행
    const searchRequest: SearchLocationRequest = {
      caseId,
      locationId,
      searchType,
    };

    const result = await discoveryService.searchLocation(
      searchRequest,
      distribution,
      allEvidence,
      locations,
      playerState.locationsSearched
    );

    // 플레이어 상태 업데이트
    if (!result.alreadySearched) {
      const evidenceIds = result.evidenceFound.map((e) => e.id);
      await DiscoveryStateManager.recordLocationSearch(
        caseId,
        userId,
        locationId,
        evidenceIds
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error in search-location API:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { error: `Failed to search location: ${errorMessage}` },
      { status: 500 }
    );
  }
}
