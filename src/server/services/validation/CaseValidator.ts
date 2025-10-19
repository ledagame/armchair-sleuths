/**
 * CaseValidator.ts
 *
 * 케이스 데이터의 일관성을 검증하는 클래스
 * 용의자 수, 진범 수, 필수 필드, 이미지 URL, Redis Set 일치 여부를 확인
 */

import { KVStoreManager, CaseData, SuspectData } from '../repositories/kv/KVStoreManager';

export interface CaseValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class CaseValidator {
  /**
   * 케이스 데이터의 일관성을 검증합니다.
   *
   * @param caseId - 검증할 케이스 ID
   * @returns 검증 결과 (valid, errors, warnings)
   */
  static async validateCase(caseId: string): Promise<CaseValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 1. 케이스 데이터 조회
      const caseData = await KVStoreManager.getCase(caseId);
      if (!caseData) {
        errors.push(`케이스를 찾을 수 없습니다: ${caseId}`);
        return { valid: false, errors, warnings };
      }

      // 2. 용의자 수 검증 (정확히 3명)
      const suspects = await KVStoreManager.getCaseSuspects(caseId);
      const suspectIds = suspects.map((s) => s.id);
      
      if (suspectIds.length !== 3) {
        errors.push(
          `용의자 수가 올바르지 않습니다. 예상: 3명, 실제: ${suspectIds.length}명`
        );
      }

      // 3. 케이스 데이터의 용의자 배열과 Redis Set 일치 확인
      if (caseData.suspects.length !== suspectIds.length) {
        errors.push(
          `케이스 데이터의 용의자 수(${caseData.suspects.length})와 Redis Set의 용의자 수(${suspectIds.length})가 일치하지 않습니다.`
        );
      }

      // 4. 진범 수 검증 (정확히 1명)
      const guiltyCount = caseData.suspects.filter((s) => s.isGuilty).length;
      if (guiltyCount !== 1) {
        errors.push(
          `진범 수가 올바르지 않습니다. 예상: 1명, 실제: ${guiltyCount}명`
        );
      }

      // 5. 각 용의자 데이터 검증
      for (const suspect of suspects) {
        const suspectData = suspect;

        if (!suspectData) {
          errors.push(`용의자 데이터를 찾을 수 없습니다: ${suspect.id}`);
          continue;
        }

        // 필수 필드 검증
        if (!suspectData.name || suspectData.name.trim() === '') {
          errors.push(`용의자 ${suspectData.id}의 이름이 누락되었습니다.`);
        }

        if (!suspectData.archetype || suspectData.archetype.trim() === '') {
          errors.push(`용의자 ${suspectData.id}의 archetype이 누락되었습니다.`);
        }

        if (!suspectData.background || suspectData.background.trim() === '') {
          errors.push(`용의자 ${suspectData.id}의 background가 누락되었습니다.`);
        }

        // 이미지 URL 검증 (경고)
        if (!suspectData.profileImageUrl) {
          warnings.push(
            `용의자 ${suspectData.name}(${suspectData.id})의 프로필 이미지 URL이 누락되었습니다.`
          );
        }

        // 케이스 ID 일치 확인
        if (suspectData.caseId !== caseId) {
          errors.push(
            `용의자 ${suspectData.id}의 caseId(${suspectData.caseId})가 현재 케이스 ID(${caseId})와 일치하지 않습니다.`
          );
        }
      }

      // 6. Redis Set의 ID가 실제 용의자 데이터에 모두 존재하는지 확인
      const caseDataSuspectIds = new Set(caseData.suspects.map((s) => s.id));
      for (const suspectId of suspectIds) {
        if (!caseDataSuspectIds.has(suspectId)) {
          errors.push(
            `Redis Set에 있는 용의자 ID ${suspectId}가 케이스 데이터의 용의자 배열에 없습니다.`
          );
        }
      }

      // 7. 케이스 데이터의 용의자 ID가 Redis Set에 모두 존재하는지 확인
      const redisSetIds = new Set(suspectIds);
      for (const suspect of caseData.suspects) {
        if (!redisSetIds.has(suspect.id)) {
          errors.push(
            `케이스 데이터의 용의자 ID ${suspect.id}가 Redis Set에 없습니다.`
          );
        }
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errors.push(`검증 중 오류 발생: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors, warnings };
    }
  }
}
