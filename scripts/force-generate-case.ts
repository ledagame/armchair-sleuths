/**
 * force-generate-case.ts
 *
 * 서버에서 직접 케이스를 생성하는 스크립트
 *
 * 실행: npx tsx scripts/force-generate-case.ts
 */

import { DevvitStorageAdapter } from '../src/server/services/repositories/adapters/DevvitStorageAdapter';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { CaseRepository } from '../src/server/services/repositories/kv/CaseRepository';
import { createGeminiClient } from '../src/server/services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../src/server/services/case/CaseGeneratorService';

async function main() {
  console.log('🎬 강제 케이스 생성 시작...\n');

  try {
    // 1. 스토리지 어댑터 초기화 확인
    console.log('📦 1단계: 스토리지 어댑터 확인...');
    const adapter = KVStoreManager['adapter'];
    if (!adapter) {
      console.error('❌ 스토리지 어댑터가 초기화되지 않았습니다!');
      console.log('   FileStorageAdapter를 사용하여 로컬 테스트...\n');
    } else {
      console.log('✅ 스토리지 어댑터 준비 완료\n');
    }

    // 2. Gemini API 키 확인
    console.log('🔑 2단계: Gemini API 키 확인...');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY 환경변수가 설정되지 않았습니다!');
      console.error('   .env.local 파일을 확인하세요.\n');
      process.exit(1);
    }
    console.log(`✅ API 키 확인 완료: ${apiKey.substring(0, 10)}...\n`);

    // 3. 케이스 생성
    console.log('🎲 3단계: AI로 케이스 생성 중...');
    console.log('   ⏰ 30-60초가 소요될 수 있습니다...\n');

    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const caseData = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false
    });

    console.log('✅✅✅ 케이스 생성 성공!\n');

    // 4. 결과 출력
    console.log('═══════════════════════════════════════');
    console.log('📋 생성된 케이스 정보:');
    console.log('═══════════════════════════════════════');
    console.log(`케이스 ID: ${caseData.id}`);
    console.log(`날짜: ${caseData.date}`);
    console.log(`피해자: ${caseData.victim.name}`);
    console.log(`무기: ${caseData.weapon.name}`);
    console.log(`장소: ${caseData.location.name}`);
    console.log(`용의자: ${caseData.suspects.length}명`);
    console.log('');

    console.log('👥 용의자 목록:');
    caseData.suspects.forEach((s, i) => {
      console.log(`  ${i + 1}. ${s.name} (${s.archetype})`);
      console.log(`     배경: ${s.background.substring(0, 60)}...`);
    });
    console.log('');

    // 5. 저장 확인
    console.log('📦 5단계: 저장 확인...');
    const savedCase = await CaseRepository.getTodaysCase();
    const savedSuspects = await CaseRepository.getCaseSuspects(caseData.id);

    console.log(`✅ 케이스 저장 확인: ${savedCase?.id}`);
    console.log(`✅ 용의자 저장 확인: ${savedSuspects.length}명`);
    console.log('');

    if (savedSuspects.length === caseData.suspects.length) {
      console.log('═══════════════════════════════════════');
      console.log('🎉🎉🎉 모든 데이터가 정상 저장되었습니다! 🎉🎉🎉');
      console.log('═══════════════════════════════════════');
      console.log('');
      console.log('다음 단계:');
      console.log('1. Devvit 앱 페이지로 이동');
      console.log('2. F5(새로고침) 실행');
      console.log('3. 용의자 3명이 표시되는지 확인');
      console.log('');
    } else {
      console.error('❌ 경고: 용의자 저장 수가 일치하지 않습니다!');
      console.error(`   생성: ${caseData.suspects.length}명, 저장: ${savedSuspects.length}명`);
    }

  } catch (error) {
    console.error('\n❌ 오류 발생:');
    console.error(error);
    process.exit(1);
  }
}

main();
