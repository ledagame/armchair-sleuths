/**
 * diagnose-case.ts
 *
 * 케이스 데이터를 상세히 분석하고 불일치를 찾는 스크립트
 *
 * Usage: npx tsx scripts/diagnose-case.ts <caseId>
 * Example: npx tsx scripts/diagnose-case.ts case-2025-10-17
 */

import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';
import { CaseValidator } from '../src/server/services/validation/CaseValidator';

async function diagnoseCaseData(caseId: string): Promise<void> {
  console.log('='.repeat(80));
  console.log(`케이스 진단: ${caseId}`);
  console.log('='.repeat(80));
  console.log('');

  try {
    // 1. 케이스 데이터 조회
    console.log('📋 케이스 데이터:');
    console.log('-'.repeat(80));
    const caseData = await KVStoreManager.getCase(caseId);
    if (!caseData) {
      console.error(`❌ 케이스를 찾을 수 없습니다: ${caseId}`);
      return;
    }

    console.log(`ID: ${caseData.id}`);
    console.log(`날짜: ${caseData.date}`);
    console.log(`피해자: ${caseData.victim.name}`);
    console.log(`무기: ${caseData.weapon.name}`);
    console.log(`장소: ${caseData.location.name}`);
    console.log(`생성 시간: ${new Date(caseData.generatedAt).toLocaleString()}`);
    console.log(`케이스 데이터의 용의자 수: ${caseData.suspects.length}`);
    console.log('');

    // 2. 케이스 데이터의 용의자 목록
    console.log('👥 케이스 데이터의 용의자 목록:');
    console.log('-'.repeat(80));
    caseData.suspects.forEach((suspect, index) => {
      console.log(`${index + 1}. ${suspect.name} (${suspect.id})`);
      console.log(`   - Archetype: ${suspect.archetype}`);
      console.log(`   - 진범: ${suspect.isGuilty ? '✅ 예' : '❌ 아니오'}`);
    });
    console.log('');

    // 3. Redis Set의 용의자 ID 목록
    console.log('🔑 Redis Set의 용의자 ID 목록:');
    console.log('-'.repeat(80));
    const suspects = await KVStoreManager.getCaseSuspects(caseId);
    const suspectIds = suspects.map((s) => s.id);
    console.log(`Redis Set 크기: ${suspectIds.length}`);
    suspectIds.forEach((id, index) => {
      console.log(`${index + 1}. ${id}`);
    });
    console.log('');

    // 4. 각 용의자의 상세 데이터
    console.log('📝 용의자 상세 데이터:');
    console.log('-'.repeat(80));
    for (const suspect of suspects) {
      const suspectData = suspect;
      if (!suspectData) {
        console.error(`❌ 용의자 데이터를 찾을 수 없습니다: ${suspect.id}`);
        continue;
      }

      console.log(`\n용의자: ${suspectData.name} (${suspectData.id})`);
      console.log(`  - Case ID: ${suspectData.caseId}`);
      console.log(`  - Archetype: ${suspectData.archetype}`);
      console.log(`  - Background: ${suspectData.background.substring(0, 100)}...`);
      console.log(`  - Personality: ${suspectData.personality.substring(0, 100)}...`);
      console.log(`  - 진범: ${suspectData.isGuilty ? '✅ 예' : '❌ 아니오'}`);
      console.log(
        `  - 프로필 이미지: ${suspectData.profileImageUrl ? '✅ 있음' : '❌ 없음'}`
      );
      if (suspectData.profileImageUrl) {
        const urlStr = String(suspectData.profileImageUrl);
        const preview = urlStr.length > 80 ? urlStr.substring(0, 80) + '...' : urlStr;
        console.log(`    URL: ${preview}`);
      }
    }
    console.log('');

    // 5. 불일치 항목 하이라이트
    console.log('⚠️  불일치 항목:');
    console.log('-'.repeat(80));
    const caseDataSuspectIds = new Set(caseData.suspects.map((s) => s.id));
    const redisSetIds = new Set(suspectIds);

    let hasInconsistency = false;

    // 케이스 데이터 vs Redis Set
    if (caseData.suspects.length !== suspectIds.length) {
      console.log(
        `❌ 용의자 수 불일치: 케이스 데이터(${caseData.suspects.length}) vs Redis Set(${suspectIds.length})`
      );
      hasInconsistency = true;
    }

    // Redis Set에만 있는 ID
    for (const id of suspectIds) {
      if (!caseDataSuspectIds.has(id)) {
        console.log(`❌ Redis Set에만 있는 ID: ${id}`);
        hasInconsistency = true;
      }
    }

    // 케이스 데이터에만 있는 ID
    for (const suspect of caseData.suspects) {
      if (!redisSetIds.has(suspect.id)) {
        console.log(`❌ 케이스 데이터에만 있는 ID: ${suspect.id}`);
        hasInconsistency = true;
      }
    }

    // 진범 수 확인
    const guiltyCount = caseData.suspects.filter((s) => s.isGuilty).length;
    if (guiltyCount !== 1) {
      console.log(`❌ 진범 수 오류: ${guiltyCount}명 (예상: 1명)`);
      hasInconsistency = true;
    }

    if (!hasInconsistency) {
      console.log('✅ 불일치 항목 없음');
    }
    console.log('');

    // 6. CaseValidator 실행
    console.log('🔍 CaseValidator 검증 결과:');
    console.log('-'.repeat(80));
    const validationResult = await CaseValidator.validateCase(caseId);

    if (validationResult.valid) {
      console.log('✅ 검증 통과');
    } else {
      console.log('❌ 검증 실패');
    }

    if (validationResult.errors.length > 0) {
      console.log('\n에러:');
      validationResult.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    if (validationResult.warnings.length > 0) {
      console.log('\n경고:');
      validationResult.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('진단 완료');
    console.log('='.repeat(80));
  } catch (error) {
    console.error('진단 중 오류 발생:', error);
    throw error;
  }
}

// 메인 실행
async function main() {
  const caseId = process.argv[2];

  if (!caseId) {
    console.error('사용법: npx tsx scripts/diagnose-case.ts <caseId>');
    console.error('예시: npx tsx scripts/diagnose-case.ts case-2025-10-17');
    process.exit(1);
  }

  // 로컬 파일 스토리지 어댑터 설정
  KVStoreManager.setAdapter(new FileStorageAdapter('./local-data'));

  await diagnoseCaseData(caseId);
}

main().catch((error) => {
  console.error('스크립트 실행 실패:', error);
  process.exit(1);
});
