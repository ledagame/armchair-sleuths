/**
 * Discovery.ts
 *
 * 증거 발견 시스템 타입 정의 (MVP - Medium 난이도)
 */

import type { EvidenceItem } from './Evidence';

/**
 * 탐색 타입 (MVP는 Quick만 지원)
 */
export type SearchType = 'quick' | 'thorough' | 'exhaustive';

/**
 * 증거 분배 전략
 */
export interface EvidenceDistributionConfig {
  criticalCount: number;      // Critical 증거 개수
  supportingCount: number;     // Supporting 증거 개수
  redHerringCount: number;     // Red Herring 증거 개수
  perLocationMin: number;      // 장소당 최소 증거
  perLocationMax: number;      // 장소당 최대 증거
}

/**
 * 장소별 증거 배치
 */
export interface LocationEvidenceMap {
  locationId: string;
  evidenceIds: string[];  // 이 장소에 배치된 증거 ID 목록
}

/**
 * 전체 증거 분배 결과
 */
export interface EvidenceDistribution {
  caseId: string;
  locations: LocationEvidenceMap[];
  config: EvidenceDistributionConfig;
  totalEvidence: number;
  generatedAt: number;
}

/**
 * 탐색 요청
 */
export interface SearchLocationRequest {
  caseId: string;
  locationId: string;
  searchType: SearchType;  // MVP: 항상 "quick"
}

/**
 * 탐색 결과
 */
export interface SearchLocationResult {
  success: boolean;
  location: {
    id: string;
    name: string;
  };
  evidenceFound: EvidenceItem[];  // 발견된 증거 목록
  totalSearched: number;           // 총 탐색한 장소 수
  remainingLocations: number;      // 남은 장소 수
  alreadySearched: boolean;        // 이미 탐색한 장소인지
}

/**
 * 플레이어 탐색 상태
 */
export interface PlayerDiscoveryState {
  caseId: string;
  totalEvidenceFound: number;
  locationsSearched: string[];
  evidenceByLocation: Record<string, string[]>;  // locationId -> evidenceIds
  lastUpdated: number;
}

/**
 * 개별 장소 탐색 기록
 */
export interface LocationSearchRecord {
  searched: boolean;
  evidenceFound: string[];
  searchType: SearchType;
  timestamp: number;
}
