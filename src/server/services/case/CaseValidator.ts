/**
 * CaseValidator.ts
 *
 * 케이스 생성 전후 검증 로직 집중화
 * - 데이터 무결성 보장
 * - 버그 조기 발견
 * - 명확한 에러 메시지 제공
 */

import type { Weapon, Motive, Location, Suspect } from './CaseElementLibrary';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'critical' | 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * 케이스 검증 클래스
 */
export class CaseValidator {
  /**
   * 케이스 생성 전 검증 (Pre-validation)
   *
   * 케이스 요소가 올바르게 선택되었는지 확인
   */
  static validateCaseElements(elements: {
    weapon: Weapon;
    motive: Motive;
    location: Location;
    suspects: Suspect[];
  }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 필수 요소 존재 확인
    if (!elements.weapon || !elements.motive || !elements.location) {
      errors.push({
        field: 'elements',
        message: 'Missing required case elements (weapon, motive, or location)',
        severity: 'critical'
      });
    }

    // 2. 용의자 수 검증 (정확히 3명)
    if (!elements.suspects || elements.suspects.length !== 3) {
      errors.push({
        field: 'suspects',
        message: `Expected exactly 3 suspects, got ${elements.suspects?.length || 0}`,
        severity: 'critical'
      });
    }

    // 3. 요소 데이터 완성도 검증
    if (elements.weapon) {
      if (!elements.weapon.name || elements.weapon.name.trim().length === 0) {
        errors.push({
          field: 'weapon.name',
          message: 'Weapon name is required',
          severity: 'error'
        });
      }
      if (!elements.weapon.description || elements.weapon.description.trim().length === 0) {
        warnings.push({
          field: 'weapon.description',
          message: 'Weapon description is empty',
          suggestion: 'Provide a description for better case quality'
        });
      }
    }

    if (elements.location) {
      if (!elements.location.name || elements.location.name.trim().length === 0) {
        errors.push({
          field: 'location.name',
          message: 'Location name is required',
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings
    };
  }

  /**
   * 생성된 케이스 검증 (Post-validation)
   *
   * AI가 생성한 케이스가 올바른지 확인
   */
  static validateGeneratedCase(caseStory: {
    victim: { name: string; background: string; relationship: string };
    suspects: Array<{ name: string; background: string; personality: string; isGuilty: boolean }>;
    solution: {
      who: string;
      what: string;
      where: string;
      when: string;
      why: string;
      how: string;
    };
  }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 범인 정확히 1명 검증 (가장 중요)
    const guiltyCount = caseStory.suspects.filter(s => s.isGuilty).length;
    if (guiltyCount !== 1) {
      errors.push({
        field: 'suspects.isGuilty',
        message: `Expected exactly 1 guilty suspect, found ${guiltyCount}`,
        severity: 'critical'
      });
    }

    // 2. 피해자 정보 검증
    if (!caseStory.victim.name || caseStory.victim.name.trim().length === 0) {
      errors.push({
        field: 'victim.name',
        message: 'Victim name is required',
        severity: 'critical'
      });
    }

    if (!caseStory.victim.background || caseStory.victim.background.trim().length < 20) {
      errors.push({
        field: 'victim.background',
        message: 'Victim background is too short (minimum 20 characters)',
        severity: 'error'
      });
    }

    // 3. 용의자 정보 검증
    caseStory.suspects.forEach((suspect, index) => {
      if (!suspect.name || suspect.name.trim().length === 0) {
        errors.push({
          field: `suspects[${index}].name`,
          message: `Suspect ${index + 1} name is required`,
          severity: 'error'
        });
      }

      if (!suspect.background || suspect.background.trim().length < 20) {
        errors.push({
          field: `suspects[${index}].background`,
          message: `Suspect ${index + 1} background is too short (minimum 20 characters)`,
          severity: 'error'
        });
      }

      if (!suspect.personality || suspect.personality.trim().length < 10) {
        warnings.push({
          field: `suspects[${index}].personality`,
          message: `Suspect ${index + 1} personality is too short`,
          suggestion: 'Provide more detailed personality traits'
        });
      }
    });

    // 4. 5W1H 완성도 검증
    const requiredSolutionFields: Array<keyof typeof caseStory.solution> = [
      'who',
      'what',
      'where',
      'when',
      'why',
      'how'
    ];

    const missingSolutionFields = requiredSolutionFields.filter(field => {
      const value = caseStory.solution[field];
      return !value || value.trim().length < 10;
    });

    if (missingSolutionFields.length > 0) {
      errors.push({
        field: 'solution',
        message: `Incomplete or too short solution fields: ${missingSolutionFields.join(', ')}`,
        severity: 'error'
      });
    }

    // 5. 범인 이름 일치 검증
    const guiltySuspect = caseStory.suspects.find(s => s.isGuilty);
    if (guiltySuspect && caseStory.solution.who !== guiltySuspect.name) {
      warnings.push({
        field: 'solution.who',
        message: `Solution 'who' (${caseStory.solution.who}) does not match guilty suspect (${guiltySuspect.name})`,
        suggestion: `Update solution.who to "${guiltySuspect.name}"`
      });
    }

    // 6. 해결책 논리성 검증
    if (caseStory.solution.who && caseStory.solution.how) {
      // 범인 이름이 how 설명에 포함되어 있는지 확인
      if (!caseStory.solution.how.includes(caseStory.solution.who)) {
        warnings.push({
          field: 'solution.how',
          message: 'The guilty suspect name is not mentioned in the "how" explanation',
          suggestion: 'Include the guilty suspect name in the method description'
        });
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings
    };
  }

  /**
   * 검증 결과 로깅
   *
   * 구조화된 형식으로 검증 결과 출력
   */
  static logValidationResult(result: ValidationResult, context: string): void {
    if (result.isValid) {
      console.log(`✅ ${context} validation passed`);
    } else {
      console.error(`❌ ${context} validation failed`);
      result.errors.forEach(error => {
        const prefix = error.severity === 'critical' ? '🔴' : '🟡';
        console.error(`  ${prefix} [${error.severity}] ${error.field}: ${error.message}`);
      });
    }

    if (result.warnings.length > 0) {
      console.warn(`⚠️  ${context} has ${result.warnings.length} warning(s):`);
      result.warnings.forEach(warning => {
        console.warn(`  - ${warning.field}: ${warning.message}`);
        if (warning.suggestion) {
          console.warn(`    💡 Suggestion: ${warning.suggestion}`);
        }
      });
    }
  }

  /**
   * 데이터 무결성 검증
   *
   * 케이스와 용의자 간 참조 무결성 확인
   */
  static validateDataIntegrity(caseData: {
    suspects: Array<{ id: string; isGuilty: boolean }>;
    solution: { who: string };
  }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // 1. 용의자 ID 중복 검증
    const suspectIds = caseData.suspects.map(s => s.id);
    const uniqueIds = new Set(suspectIds);
    if (uniqueIds.size !== suspectIds.length) {
      errors.push({
        field: 'suspects.id',
        message: 'Duplicate suspect IDs detected',
        severity: 'critical'
      });
    }

    // 2. 범인 ID 일관성 검증
    const guiltyCount = caseData.suspects.filter(s => s.isGuilty).length;
    if (guiltyCount !== 1) {
      errors.push({
        field: 'suspects.isGuilty',
        message: `Data integrity violation: ${guiltyCount} guilty suspects (expected 1)`,
        severity: 'critical'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 빠른 검증 (핵심 항목만)
   *
   * 성능이 중요한 경우 사용
   */
  static quickValidate(caseStory: {
    suspects: Array<{ isGuilty: boolean }>;
    solution: { who: string; what: string; where: string; when: string; why: string; how: string };
  }): boolean {
    // 1. 범인 1명 확인
    const guiltyCount = caseStory.suspects.filter(s => s.isGuilty).length;
    if (guiltyCount !== 1) return false;

    // 2. 5W1H 모두 존재 확인
    const solutionFields = ['who', 'what', 'where', 'when', 'why', 'how'] as const;
    const allFieldsPresent = solutionFields.every(field => {
      const value = caseStory.solution[field];
      return value && value.trim().length > 0;
    });

    return allFieldsPresent;
  }
}
