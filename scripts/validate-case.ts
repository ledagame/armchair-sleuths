#!/usr/bin/env ts-node
/**
 * validate-case.ts
 *
 * 케이스 유효성 검증 스크립트
 */

import { CaseRepository } from '../../../src/server/services/repositories/kv/CaseRepository';
import { FileStorageAdapter } from '../../../src/server/adapters/FileStorageAdapter';
import { KVStoreManager } from '../../../src/server/services/repositories/kv/KVStoreManager';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

async function validateCase(caseId: string): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. 케이스 존재 확인
  const caseData = await CaseRepository.getCase(caseId);
  if (!caseData) {
    errors.push(`Case not found: ${caseId}`);
    return { isValid: false, errors, warnings };
  }

  // 2. 용의자 데이터 확인
  const suspects = await CaseRepository.getCaseSuspects(caseId);

  if (suspects.length !== 3) {
    errors.push(`Expected 3 suspects, found ${suspects.length}`);
  }

  // 3. 진범 확인
  const guiltyCount = suspects.filter(s => s.isGuilty).length;
  if (guiltyCount !== 1) {
    errors.push(`Expected exactly 1 guilty suspect, found ${guiltyCount}`);
  }

  // 4. 5W1H 완전성 확인
  const requiredFields = ['who', 'what', 'where', 'when', 'why', 'how'];
  const missingSolution = requiredFields.filter(field => !caseData.solution[field]);
  if (missingSolution.length > 0) {
    errors.push(`Missing solution fields: ${missingSolution.join(', ')}`);
  }

  // 5. 피해자 정보 확인
  if (!caseData.victim.name) {
    errors.push('Victim name is missing');
  }
  if (!caseData.victim.background) {
    errors.push('Victim background is missing');
  }

  // 6. 무기/장소 정보 확인
  if (!caseData.weapon?.name) {
    errors.push('Weapon information is missing');
  }
  if (!caseData.location?.name) {
    errors.push('Location information is missing');
  }

  // 7. 경고 사항
  suspects.forEach((suspect, index) => {
    if (!suspect.background) {
      warnings.push(`Suspect ${index + 1} (${suspect.name}) missing background`);
    }
    if (!suspect.personality) {
      warnings.push(`Suspect ${index + 1} (${suspect.name}) missing personality`);
    }
  });

  if (!caseData.imageUrl) {
    warnings.push('Case scene image is missing');
  }

  const missingProfileImages = suspects.filter(s => !s.profileImageUrl).length;
  if (missingProfileImages > 0) {
    warnings.push(`${missingProfileImages} suspects missing profile images`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

async function main() {
  const args = process.argv.slice(2);

  const caseId = args.find(arg => arg.startsWith('--case-id='))?.split('=')[1];
  const fix = args.includes('--fix');
  const verbose = args.includes('--verbose');

  if (!caseId) {
    console.error('❌ Error: --case-id parameter required');
    console.error('Usage: npx tsx scripts/validate-case.ts --case-id=case-2025-01-19');
    process.exit(1);
  }

  console.log('🔍 Case Validation');
  console.log('==================\n');

  // Storage 어댑터 초기화
  const storageAdapter = new FileStorageAdapter('./local-data');
  KVStoreManager.setAdapter(storageAdapter);

  console.log(`📋 Validating case: ${caseId}\n`);

  try {
    const result = await validateCase(caseId);

    if (result.isValid) {
      console.log('✅ Case is valid!\n');
    } else {
      console.log('❌ Case has errors:\n');
      result.errors.forEach(error => {
        console.log(`   🔴 ${error}`);
      });
      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:\n');
      result.warnings.forEach(warning => {
        console.log(`   🟡 ${warning}`);
      });
      console.log('');
    }

    if (verbose && result.isValid && result.warnings.length === 0) {
      const caseData = await CaseRepository.getCase(caseId);
      const suspects = await CaseRepository.getCaseSuspects(caseId);

      console.log('📊 Detailed Information:\n');
      console.log(`Victim: ${caseData?.victim.name}`);
      console.log(`Suspects: ${suspects.map(s => s.name).join(', ')}`);
      console.log(`Guilty: ${suspects.find(s => s.isGuilty)?.name}`);
      console.log(`Solution WHO: ${caseData?.solution.who}`);
    }

    if (fix && !result.isValid) {
      console.log('🔧 Auto-fix is not yet implemented');
      console.log('   Please fix errors manually or regenerate the case');
    }

    process.exit(result.isValid ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Validation failed:');
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

export { validateCase, main };
