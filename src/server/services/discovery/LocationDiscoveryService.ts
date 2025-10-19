/**
 * LocationDiscoveryService.ts
 *
 * 증거를 장소에 분배하고 관리하는 서비스
 * MVP: Medium 난이도 기준 (4 locations, 10 evidence)
 */

import type {
  EvidenceDistributionConfig,
  LocationEvidenceMap,
  EvidenceDistribution
} from '@/shared/types/Discovery';
import type { EvidenceItem } from '@/shared/types/Evidence';
import type { Location } from '@/shared/types/Case';

/**
 * Medium 난이도 기본 설정
 */
const MEDIUM_CONFIG: EvidenceDistributionConfig = {
  criticalCount: 4,
  supportingCount: 3,
  redHerringCount: 3,
  perLocationMin: 2,
  perLocationMax: 3,
};

export class LocationDiscoveryService {
  /**
   * 증거를 장소에 균등하게 분배
   *
   * @param caseId - 케이스 ID
   * @param locations - 장소 목록 (4개)
   * @param evidence - 증거 목록 (10개)
   * @returns 증거 분배 결과
   */
  distributeEvidence(
    caseId: string,
    locations: Location[],
    evidence: EvidenceItem[]
  ): EvidenceDistribution {
    // Validation
    if (locations.length !== 4) {
      throw new Error(`Medium 난이도는 정확히 4개 장소가 필요합니다. 현재: ${locations.length}개`);
    }

    if (evidence.length !== 10) {
      throw new Error(`Medium 난이도는 정확히 10개 증거가 필요합니다. 현재: ${evidence.length}개`);
    }

    // Fair Play 검증
    this.validateFairPlay(evidence);

    // 증거 섞기 (Fisher-Yates shuffle)
    const shuffledEvidence = this.shuffleArray([...evidence]);

    // 장소별 증거 분배
    const distribution: LocationEvidenceMap[] = [];
    let evidenceIndex = 0;

    for (const location of locations) {
      // 각 장소에 2-3개 증거 할당
      const evidenceCount = evidenceIndex === 0 ? 3 : 2; // 첫 장소는 3개, 나머지는 2개씩 (total 9개)
      const lastCount = evidence.length - evidenceIndex;
      const count = Math.min(evidenceCount, lastCount);

      const locationEvidence: string[] = [];
      for (let i = 0; i < count; i++) {
        locationEvidence.push(shuffledEvidence[evidenceIndex].id);
        evidenceIndex++;
      }

      distribution.push({
        locationId: location.id,
        evidenceIds: locationEvidence,
      });
    }

    // 남은 증거가 있으면 마지막 장소에 추가 (총 10개 보장)
    if (evidenceIndex < shuffledEvidence.length) {
      const lastLocation = distribution[distribution.length - 1];
      while (evidenceIndex < shuffledEvidence.length) {
        lastLocation.evidenceIds.push(shuffledEvidence[evidenceIndex].id);
        evidenceIndex++;
      }
    }

    return {
      caseId,
      locations: distribution,
      config: MEDIUM_CONFIG,
      totalEvidence: evidence.length,
      generatedAt: Date.now(),
    };
  }

  /**
   * 특정 장소의 증거 목록 조회
   *
   * @param distribution - 증거 분배 데이터
   * @param locationId - 장소 ID
   * @returns 해당 장소의 증거 ID 목록
   */
  getLocationEvidence(
    distribution: EvidenceDistribution,
    locationId: string
  ): string[] {
    const locationMap = distribution.locations.find(
      (loc) => loc.locationId === locationId
    );

    if (!locationMap) {
      throw new Error(`장소를 찾을 수 없습니다: ${locationId}`);
    }

    return locationMap.evidenceIds;
  }

  /**
   * Fair Play 검증
   * - Critical 증거가 4개인지 확인
   * - 모든 증거에 discoveryHint가 있는지 확인
   *
   * @param evidence - 증거 목록
   */
  private validateFairPlay(evidence: EvidenceItem[]): void {
    const criticalEvidence = evidence.filter((e) => e.relevance === 'critical');

    if (criticalEvidence.length !== MEDIUM_CONFIG.criticalCount) {
      throw new Error(
        `Fair Play 위반: Critical 증거는 ${MEDIUM_CONFIG.criticalCount}개여야 합니다. 현재: ${criticalEvidence.length}개`
      );
    }

    // 모든 증거에 discoveryHint 확인
    const missingHints = evidence.filter((e) => !e.discoveryHint);
    if (missingHints.length > 0) {
      throw new Error(
        `Fair Play 위반: 모든 증거는 discoveryHint가 필요합니다. 누락: ${missingHints.map((e) => e.id).join(', ')}`
      );
    }

    // Critical 증거에 interpretationHint 확인
    const missingInterpretation = criticalEvidence.filter(
      (e) => !e.interpretationHint
    );
    if (missingInterpretation.length > 0) {
      throw new Error(
        `Fair Play 위반: Critical 증거는 interpretationHint가 필요합니다. 누락: ${missingInterpretation.map((e) => e.id).join(', ')}`
      );
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
