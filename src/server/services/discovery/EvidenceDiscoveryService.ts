/**
 * EvidenceDiscoveryService.ts
 *
 * 증거 발견 로직을 처리하는 서비스
 * MVP: Quick Search만 지원 (70% base success rate)
 */

import type {
  SearchLocationRequest,
  SearchLocationResult,
  EvidenceDistribution,
} from '@/shared/types/Discovery';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { Location } from '@/shared/types/Case';
import { LocationDiscoveryService } from './LocationDiscoveryService';

/**
 * Quick Search 확률 분포
 * - 10% 확률로 0개 발견
 * - 70% 확률로 1개 발견
 * - 20% 확률로 2개 발견
 */
const QUICK_SEARCH_PROBABILITY = {
  zero: 0.1,  // 0개 발견
  one: 0.7,   // 1개 발견
  two: 0.2,   // 2개 발견
};

export class EvidenceDiscoveryService {
  private locationService: LocationDiscoveryService;

  constructor() {
    this.locationService = new LocationDiscoveryService();
  }

  /**
   * 장소 탐색 수행
   *
   * @param request - 탐색 요청
   * @param distribution - 증거 분배 데이터
   * @param allEvidence - 전체 증거 목록
   * @param locations - 전체 장소 목록
   * @param alreadySearchedLocations - 이미 탐색한 장소 ID 목록
   * @returns 탐색 결과
   */
  async searchLocation(
    request: SearchLocationRequest,
    distribution: EvidenceDistribution,
    allEvidence: EvidenceItem[],
    locations: Location[],
    alreadySearchedLocations: string[]
  ): Promise<SearchLocationResult> {
    // 장소 정보 조회
    const location = locations.find((loc) => loc.id === request.locationId);
    if (!location) {
      throw new Error(`장소를 찾을 수 없습니다: ${request.locationId}`);
    }

    // 이미 탐색한 장소인지 확인
    const alreadySearched = alreadySearchedLocations.includes(request.locationId);

    // 장소의 증거 ID 목록 조회
    const evidenceIds = this.locationService.getLocationEvidence(
      distribution,
      request.locationId
    );

    // 해당 장소의 실제 증거 객체들
    const locationEvidence = allEvidence.filter((e) =>
      evidenceIds.includes(e.id)
    );

    // Quick Search 수행
    const discoveredEvidence = this.performQuickSearch(locationEvidence);

    // 결과 반환
    return {
      success: true,
      location: {
        id: location.id,
        name: location.name,
      },
      evidenceFound: discoveredEvidence,
      totalSearched: alreadySearchedLocations.length + (alreadySearched ? 0 : 1),
      remainingLocations: locations.length - (alreadySearchedLocations.length + (alreadySearched ? 0 : 1)),
      alreadySearched,
    };
  }

  /**
   * Quick Search 실행
   * 확률적으로 0-2개의 증거를 발견
   *
   * @param locationEvidence - 해당 장소의 증거 목록
   * @returns 발견된 증거 목록
   */
  private performQuickSearch(locationEvidence: EvidenceItem[]): EvidenceItem[] {
    if (locationEvidence.length === 0) {
      return [];
    }

    // 발견할 증거 개수 결정 (확률적)
    const evidenceCount = this.determineEvidenceCount();

    // 실제로 발견 가능한 개수 제한
    const actualCount = Math.min(evidenceCount, locationEvidence.length);

    if (actualCount === 0) {
      return [];
    }

    // 랜덤하게 증거 선택
    const shuffled = this.shuffleArray([...locationEvidence]);
    return shuffled.slice(0, actualCount);
  }

  /**
   * Quick Search 확률 분포에 따라 발견할 증거 개수 결정
   *
   * @returns 발견할 증거 개수 (0-2)
   */
  private determineEvidenceCount(): number {
    const rand = Math.random();

    if (rand < QUICK_SEARCH_PROBABILITY.zero) {
      return 0; // 10% 확률
    } else if (rand < QUICK_SEARCH_PROBABILITY.zero + QUICK_SEARCH_PROBABILITY.one) {
      return 1; // 70% 확률
    } else {
      return 2; // 20% 확률
    }
  }

  /**
   * Fisher-Yates 셔플 알고리즘
   *
   * @param array - 셔플할 배열
   * @returns 셔플된 배열
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
