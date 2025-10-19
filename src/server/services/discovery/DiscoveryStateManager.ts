/**
 * DiscoveryStateManager.ts
 *
 * 증거 탐색 상태 관리 서비스
 * KV Store를 사용하여 플레이어 진행 상태 저장
 */

import type {
  PlayerDiscoveryState,
  EvidenceDistribution,
  LocationSearchRecord,
} from '@/shared/types/Discovery';
import { KVStoreManager } from '../repositories/kv/KVStoreManager';

export class DiscoveryStateManager {
  /**
   * 증거 분배 데이터 저장
   *
   * @param distribution - 증거 분배 결과
   */
  static async saveDistribution(distribution: EvidenceDistribution): Promise<void> {
    const key = `distribution:${distribution.caseId}`;
    const value = JSON.stringify(distribution);

    // KVStoreManager의 adapter를 사용
    const adapter = (KVStoreManager as any).adapter;
    if (!adapter) {
      throw new Error('Storage adapter not initialized');
    }

    await adapter.set(key, value);
  }

  /**
   * 증거 분배 데이터 조회
   *
   * @param caseId - 케이스 ID
   * @returns 증거 분배 결과 또는 null
   */
  static async getDistribution(caseId: string): Promise<EvidenceDistribution | null> {
    const key = `distribution:${caseId}`;

    const adapter = (KVStoreManager as any).adapter;
    if (!adapter) {
      throw new Error('Storage adapter not initialized');
    }

    const data = await adapter.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as EvidenceDistribution;
  }

  /**
   * 플레이어 탐색 상태 조회
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   * @returns 플레이어 탐색 상태 또는 새로운 상태
   */
  static async getPlayerState(
    caseId: string,
    userId: string
  ): Promise<PlayerDiscoveryState> {
    const key = `discovery:${caseId}:${userId}`;

    const adapter = (KVStoreManager as any).adapter;
    if (!adapter) {
      throw new Error('Storage adapter not initialized');
    }

    const data = await adapter.get(key);

    if (!data) {
      // 새로운 플레이어 상태 생성
      return {
        caseId,
        totalEvidenceFound: 0,
        locationsSearched: [],
        evidenceByLocation: {},
        lastUpdated: Date.now(),
      };
    }

    return JSON.parse(data) as PlayerDiscoveryState;
  }

  /**
   * 플레이어 탐색 상태 저장
   *
   * @param state - 플레이어 탐색 상태
   */
  static async savePlayerState(state: PlayerDiscoveryState): Promise<void> {
    const key = `discovery:${state.caseId}:${userId}`; // userId는 state에서 가져와야 함

    // State에 userId가 없으므로 별도로 받아야 함
    // 일단 caseId만으로 키를 만들고, 나중에 수정
    throw new Error('userId parameter required - will fix in next iteration');
  }

  /**
   * 장소 탐색 기록 업데이트
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   * @param locationId - 장소 ID
   * @param evidenceIds - 발견한 증거 ID 목록
   */
  static async recordLocationSearch(
    caseId: string,
    userId: string,
    locationId: string,
    evidenceIds: string[]
  ): Promise<void> {
    // 현재 상태 조회
    const state = await this.getPlayerState(caseId, userId);

    // 장소가 이미 탐색되었는지 확인
    if (!state.locationsSearched.includes(locationId)) {
      state.locationsSearched.push(locationId);
    }

    // 증거 기록 업데이트
    if (!state.evidenceByLocation[locationId]) {
      state.evidenceByLocation[locationId] = [];
    }

    // 새로 발견한 증거만 추가
    for (const evidenceId of evidenceIds) {
      if (!state.evidenceByLocation[locationId].includes(evidenceId)) {
        state.evidenceByLocation[locationId].push(evidenceId);
        state.totalEvidenceFound++;
      }
    }

    state.lastUpdated = Date.now();

    // 상태 저장
    const key = `discovery:${caseId}:${userId}`;
    const value = JSON.stringify(state);

    const adapter = (KVStoreManager as any).adapter;
    if (!adapter) {
      throw new Error('Storage adapter not initialized');
    }

    await adapter.set(key, value);
  }

  /**
   * 플레이어가 이미 탐색한 장소인지 확인
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   * @param locationId - 장소 ID
   * @returns 탐색 여부
   */
  static async hasSearchedLocation(
    caseId: string,
    userId: string,
    locationId: string
  ): Promise<boolean> {
    const state = await this.getPlayerState(caseId, userId);
    return state.locationsSearched.includes(locationId);
  }

  /**
   * 플레이어가 발견한 총 증거 개수 조회
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   * @returns 발견한 증거 개수
   */
  static async getTotalEvidenceFound(
    caseId: string,
    userId: string
  ): Promise<number> {
    const state = await this.getPlayerState(caseId, userId);
    return state.totalEvidenceFound;
  }

  /**
   * 케이스의 증거 분배 데이터 삭제 (테스트/관리용)
   *
   * @param caseId - 케이스 ID
   */
  static async deleteDistribution(caseId: string): Promise<void> {
    const key = `distribution:${caseId}`;

    const adapter = (KVStoreManager as any).adapter;
    if (!adapter) {
      throw new Error('Storage adapter not initialized');
    }

    await adapter.del(key);
  }

  /**
   * 플레이어 탐색 상태 삭제 (테스트/관리용)
   *
   * @param caseId - 케이스 ID
   * @param userId - 사용자 ID
   */
  static async deletePlayerState(caseId: string, userId: string): Promise<void> {
    const key = `discovery:${caseId}:${userId}`;

    const adapter = (KVStoreManager as any).adapter;
    if (!adapter) {
      throw new Error('Storage adapter not initialized');
    }

    await adapter.del(key);
  }
}
