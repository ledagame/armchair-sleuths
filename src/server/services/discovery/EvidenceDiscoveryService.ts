/**
 * EvidenceDiscoveryService.ts
 *
 * 증거 발견 로직을 처리하는 서비스
 * Implements 3-tier search system: Quick, Thorough, Exhaustive
 * Fair Play compliant: Uses probability-based discovery
 */

import type {
  SearchLocationRequest,
  SearchLocationResult,
  EvidenceDistribution,
  SEARCH_ACTION_COSTS,
} from '@/shared/types/Discovery';
import type { EvidenceItem, PlayerEvidenceState, SearchType } from '@/shared/types/Evidence';
import type { Location } from '@/shared/types/Case';
import { LocationDiscoveryService } from './LocationDiscoveryService';

export class EvidenceDiscoveryService {
  private locationService: LocationDiscoveryService;

  constructor() {
    this.locationService = new LocationDiscoveryService();
  }

  /**
   * 장소 탐색 수행 (3-tier search system)
   *
   * @param request - 탐색 요청 (includes searchType and userId)
   * @param distribution - 증거 분배 데이터
   * @param allEvidence - 전체 증거 목록
   * @param locations - 전체 장소 목록
   * @param playerState - 플레이어 증거 발견 상태
   * @returns 탐색 결과
   */
  async searchLocation(
    request: SearchLocationRequest,
    distribution: EvidenceDistribution,
    allEvidence: EvidenceItem[],
    locations: Location[],
    playerState: PlayerEvidenceState
  ): Promise<SearchLocationResult> {
    // 장소 정보 조회
    const location = locations.find((loc) => loc.id === request.locationId);
    if (!location) {
      throw new Error(`장소를 찾을 수 없습니다: ${request.locationId}`);
    }

    // 장소의 증거 ID 목록 조회
    const evidenceIds = this.locationService.getLocationEvidence(
      distribution,
      request.locationId
    );

    // 해당 장소의 실제 증거 객체들
    const locationEvidence = allEvidence.filter((e) =>
      evidenceIds.includes(e.id)
    );

    // 이미 발견한 증거 필터링
    const alreadyDiscoveredIds = new Set(
      playerState.discoveredEvidence.map((d) => d.evidenceId)
    );
    const undiscoveredEvidence = locationEvidence.filter(
      (e) => !alreadyDiscoveredIds.has(e.id)
    );

    // 이미 탐색한 장소인지 확인
    const alreadySearched = playerState.searchHistory.some(
      (s) => s.locationId === request.locationId
    );

    // 탐색 수행 (확률 기반)
    const discoveredEvidence = this.performSearch(
      undiscoveredEvidence,
      request.searchType
    );

    // Action cost 계산
    const actionCosts: Record<SearchType, number> = {
      quick: 1,
      thorough: 2,
      exhaustive: 3,
    };
    const actionCost = actionCosts[request.searchType];

    // 장소 완료율 계산
    const totalEvidenceAtLocation = locationEvidence.length;
    const discoveredAtLocation =
      playerState.discoveredEvidence.filter((d) =>
        evidenceIds.includes(d.evidenceId)
      ).length + discoveredEvidence.length;
    const completionRate =
      totalEvidenceAtLocation > 0
        ? Math.round((discoveredAtLocation / totalEvidenceAtLocation) * 100)
        : 100;

    // 결과 반환
    return {
      success: true,
      location: {
        id: location.id,
        name: location.name,
        imageUrl: location.imageUrl,
      },
      searchType: request.searchType,
      evidenceFound: discoveredEvidence,
      evidenceMissed:
        request.searchType === 'exhaustive'
          ? undiscoveredEvidence.length - discoveredEvidence.length
          : undefined,
      totalSearched:
        new Set(playerState.searchHistory.map((s) => s.locationId)).size +
        (alreadySearched ? 0 : 1),
      remainingLocations:
        locations.length -
        new Set(playerState.searchHistory.map((s) => s.locationId)).size -
        (alreadySearched ? 0 : 1),
      alreadySearched,
      actionCost,
      completionRate,
      timestamp: new Date(),
    };
  }

  /**
   * Perform search using probability-based discovery
   * Each evidence item has individual discovery probability based on:
   * - Search type (quick/thorough/exhaustive)
   * - Discovery difficulty (obvious/medium/hidden)
   * - Evidence relevance (critical/important/minor)
   *
   * @param evidence - Undiscovered evidence at this location
   * @param searchType - Type of search being performed
   * @returns Discovered evidence items
   */
  private performSearch(
    evidence: EvidenceItem[],
    searchType: SearchType
  ): EvidenceItem[] {
    if (evidence.length === 0) {
      return [];
    }

    const discovered: EvidenceItem[] = [];

    for (const item of evidence) {
      // Get probability for this search type
      const probability = item.discoveryProbability[searchType];

      // Roll for discovery
      if (Math.random() < probability) {
        discovered.push(item);
      }
    }

    return discovered;
  }
}
