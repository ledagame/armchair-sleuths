/**
 * Discovery.ts
 *
 * 증거 발견 시스템 타입 정의
 * 3-tier search system: Quick, Thorough, Exhaustive
 */

import type { EvidenceItem, SearchType, PlayerEvidenceState } from './Evidence';

// Re-export SearchType for convenience
export type { SearchType };

/**
 * Location for evidence discovery
 */
export interface Location {
  id: string;
  name: string;
  description: string;
  emoji: string;
  imageUrl?: string;
}

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
 * Search action point costs
 */
export const SEARCH_ACTION_COSTS = {
  quick: 1,
  thorough: 2,
  exhaustive: 3,
} as const;

/**
 * 탐색 요청
 */
export interface SearchLocationRequest {
  caseId: string;
  userId: string;
  locationId: string;
  searchType: SearchType;
  areaId?: string;  // Optional: search specific area
}

/**
 * 탐색 결과
 */
export interface SearchLocationResult {
  success: boolean;
  location: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  searchType: SearchType;
  evidenceFound: EvidenceItem[];       // 발견된 증거 목록
  evidenceMissed?: number;              // 남은 미발견 증거 (exhaustive에만 표시)
  totalSearched: number;                // 총 탐색한 장소 수
  remainingLocations: number;           // 남은 장소 수
  alreadySearched: boolean;             // 이미 탐색한 장소인지
  actionPointsRemaining: number;        // 남은 액션 포인트
  actionCost: number;                   // 사용된 액션 포인트
  completionRate: number;               // 장소 완료율 (0-100)
  timestamp: Date;
}

/**
 * 플레이어 탐색 상태
 * Location-focused discovery tracking (complements PlayerEvidenceState)
 */
export interface PlayerDiscoveryState {
  caseId: string;
  userId: string;
  actionPoints: number;
  actionPointsUsed: number;
  locationsSearched: Map<string, LocationSearchRecord>;  // locationId -> record
  lastUpdated: Date;
}

/**
 * 개별 장소 탐색 기록
 */
export interface LocationSearchRecord {
  locationId: string;
  searches: Array<{
    searchType: SearchType;
    evidenceFound: string[];  // Evidence IDs found in this search
    timestamp: Date;
  }>;
  completionRate: number;  // 0-100
  totalEvidenceFound: number;
  lastSearched: Date;
}
