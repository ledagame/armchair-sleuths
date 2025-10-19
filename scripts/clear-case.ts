/**
 * clear-case.ts
 *
 * 케이스를 안전하게 삭제하는 스크립트
 *
 * Usage: npx tsx scripts/clear-case.ts <caseId>
 * Example: npx tsx scripts/clear-case.ts case-2025-10-17
 */

import * as readline from 'readline';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';
import { CaseValidator } from '../src/server/services/validation/CaseValidator';

/**
 * 사용자 확인 프롬프트
 */
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * 케이스 삭제 전 진단 실행
 */
async function diagnoseCaseBeforeDelete(caseId: string): Promise<void> {
  console.log('='.repeat(80));
  console.log(`삭제 전 케이스 진단: ${caseId}`);
  console.log('='.repeat(80));
  console.log('');

  const caseData = await KVStoreManager.getCase(caseId);
  if (!caseData) {
    console.log(`❌ 케이스를 찾을 수 없습니다: ${caseId}`);
    return;
  }

  console.log(`케이스 ID: ${caseData.id}`);
  console.log(`날짜: ${caseData.date}`);
  console.log(`피해자: ${caseData.victim.name}`);
  console.log(`생성 시간: ${new Date(caseData.generatedAt).toLocaleString()}`);
  console.log('');

  const suspectIds = await KVStoreManager.getCaseSuspects(caseId);
  console.log(`용의자 수: ${suspectIds.length}`);
  caseData.suspects.forEach((suspect, index) => {
    console.log(`  ${index + 1}. ${suspect.name} (${suspect.id})`);
  });
  console.log('');

  const validationResult = await CaseValidator.validateCase(caseId);
  if (validationResult.valid) {
    console.log('✅ 검증 상태: 정상');
  } else {
    console.log('❌ 검증 상태: 오류 있음');
    if (validationResult.errors.length > 0) {
      console.log('에러:');
      validationResult.errors.forEach((error) => {
        console.log(`  - ${error}`);
      });
    }
  }
  console.log('');
}

/**
 * 케이스 삭제 후 검증
 */
async function verifyCaseDeletion(caseId: string): Promise<boolean> {
  console.log('');
  console.log('삭제 후 검증 중...');
  console.log('-'.repeat(80));

  const caseData = await KVStoreManager.getCase(caseId);
  const suspectIds = await KVStoreManager.getCaseSuspects(caseId);

  let allDeleted = true;

  if (caseData !== null) {
    console.log(`❌ 케이스 데이터가 여전히 존재합니다: case:${caseId}`);
    allDeleted = false;
  } else {
    console.log(`✅ 케이스 데이터 삭제 확인`);
  }

  if (suspectIds.length > 0) {
    console.log(`❌ 용의자 Set에 ${suspectIds.length}개의 ID가 남아있습니다`);
    allDeleted = false;
  } else {
    console.log(`✅ 용의자 Set 삭제 확인`);
  }

  // 각 용의자 데이터 확인
  for (const suspectId of suspectIds) {
    const suspectData = await KVStoreManager.getSuspect(suspectId);
    if (suspectData !== null) {
      console.log(`❌ 용의자 데이터가 여전히 존재합니다: ${suspectId}`);
      allDeleted = false;
    }
  }

  if (allDeleted) {
    console.log('');
    console.log('✅ 모든 데이터가 성공적으로 삭제되었습니다.');
  } else {
    console.log('');
    console.log('⚠️ 일부 데이터가 삭제되지 않았습니다.');
  }

  return allDeleted;
}

/**
 * 메인 실행
 */
async function main() {
  const caseId = process.argv[2];

  if (!caseId) {
    console.error('사용법: npx tsx scripts/clear-case.ts <caseId>');
    console.error('예시: npx tsx scripts/clear-case.ts case-2025-10-17');
    process.exit(1);
  }

  // 로컬 파일 스토리지 어댑터 설정
  KVStoreManager.setAdapter(new FileStorageAdapter('./local-data'));

  // 1. 삭제 전 진단
  await diagnoseCaseBeforeDelete(caseId);

  // 2. 사용자 확인
  const confirmed = await askConfirmation(
    `⚠️  정말로 케이스 "${caseId}"를 삭제하시겠습니까? (y/n): `
  );

  if (!confirmed) {
    console.log('삭제가 취소되었습니다.');
    process.exit(0);
  }

  console.log('');
  console.log('='.repeat(80));
  console.log('케이스 삭제 시작');
  console.log('='.repeat(80));
  console.log('');

  // 3. 케이스 삭제
  try {
    await KVStoreManager.clearCaseData(caseId);
  } catch (error) {
    console.error('삭제 중 오류 발생:', error);
    process.exit(1);
  }

  // 4. 삭제 후 검증
  const success = await verifyCaseDeletion(caseId);

  console.log('');
  console.log('='.repeat(80));
  if (success) {
    console.log('✅ 케이스 삭제 완료');
  } else {
    console.log('⚠️ 케이스 삭제 완료 (일부 데이터 남아있음)');
  }
  console.log('='.repeat(80));

  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('스크립트 실행 실패:', error);
  process.exit(1);
});
