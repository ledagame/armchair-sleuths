/**
 * regenerate-case-with-images.ts
 *
 * 오래된 케이스 삭제 + 이미지 포함 새 케이스 생성
 *
 * 사용법:
 * npx tsx scripts/regenerate-case-with-images.ts [date]
 *
 * 예시:
 * npx tsx scripts/regenerate-case-with-images.ts 2025-10-18
 */

// .env.local 파일 로드
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createGeminiClient } from '../src/server/services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../src/server/services/case/CaseGeneratorService';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { MemoryStorageAdapter } from '../src/server/services/repositories/adapters/MemoryStorageAdapter';
import { CaseRepository } from '../src/server/services/repositories/kv/CaseRepository';

async function regenerateCaseWithImages() {
  // 날짜 파라미터 (기본값: 오늘)
  const dateArg = process.argv[2];
  const targetDate = dateArg ? new Date(dateArg) : new Date();
  const dateStr = targetDate.toISOString().split('T')[0];
  const caseId = `case-${dateStr}`;

  console.log('🔄 케이스 재생성 시작...');
  console.log(`   날짜: ${dateStr}`);
  console.log(`   케이스 ID: ${caseId}\n`);

  try {
    // Storage adapter 초기화
    const storageAdapter = new MemoryStorageAdapter();
    KVStoreManager.setAdapter(storageAdapter);

    console.log('✅ Storage adapter 초기화 완료\n');

    // 1. 기존 케이스 확인
    console.log('🔍 기존 케이스 확인 중...');
    const existingCase = await CaseRepository.getCaseById(caseId);

    if (existingCase) {
      console.log(`⚠️  기존 케이스 발견: ${caseId}`);

      // 용의자 데이터 확인
      const existingSuspects = await CaseRepository.getCaseSuspects(caseId);
      const suspectsWithImages = existingSuspects.filter(s => s.profileImageUrl);

      console.log(`   - 용의자 수: ${existingSuspects.length}`);
      console.log(`   - 이미지 있는 용의자: ${suspectsWithImages.length}/${existingSuspects.length}`);

      if (suspectsWithImages.length === existingSuspects.length) {
        console.log('\n✅ 이미 모든 용의자가 프로필 이미지를 가지고 있습니다!');
        console.log('   재생성이 필요하지 않습니다.');
        return;
      }

      // 2. 오래된 케이스 삭제
      console.log(`\n🗑️  오래된 케이스 삭제 중...`);
      await CaseRepository.deleteCase(caseId);
      console.log(`✅ 케이스 삭제 완료: ${caseId}`);
    } else {
      console.log(`ℹ️  기존 케이스 없음. 새로 생성합니다.\n`);
    }

    // 3. 새 케이스 생성 (이미지 포함)
    console.log(`🎨 새 케이스 생성 중 (프로필 이미지 포함)...`);
    console.log(`   예상 소요 시간: ~15초\n`);

    const startTime = Date.now();

    const geminiClient = createGeminiClient();
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const newCase = await caseGenerator.generateCase({
      date: targetDate,
      includeImage: true, // 케이스 이미지 포함
      includeSuspectImages: true, // ✅ 용의자 프로필 이미지 포함
      temperature: 0.8
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ 새 케이스 생성 완료! (${duration}초 소요)`);
    console.log(`   케이스 ID: ${newCase.id}`);
    console.log(`   날짜: ${newCase.date}`);
    console.log(`   피해자: ${newCase.victim.name}`);

    // 4. 프로필 이미지 확인
    console.log(`\n👥 용의자 프로필 이미지:`);
    let totalImageSize = 0;

    newCase.suspects.forEach((suspect, index) => {
      console.log(`\n${index + 1}. ${suspect.name} (${suspect.archetype})`);

      if (suspect.profileImageUrl) {
        const sizeKB = (suspect.profileImageUrl.length * 0.75 / 1024).toFixed(1);
        totalImageSize += suspect.profileImageUrl.length * 0.75 / 1024;
        console.log(`   ✅ 프로필 이미지: ${sizeKB} KB`);
        console.log(`   URL 시작: ${suspect.profileImageUrl.substring(0, 50)}...`);
      } else {
        console.log(`   ❌ 프로필 이미지 없음`);
      }
    });

    // 5. 통계
    const imagesGenerated = newCase.suspects.filter(s => s.profileImageUrl).length;
    const successRate = ((imagesGenerated / newCase.suspects.length) * 100).toFixed(0);

    console.log(`\n📊 통계:`);
    console.log(`   생성된 이미지: ${imagesGenerated}/${newCase.suspects.length}`);
    console.log(`   성공률: ${successRate}%`);
    console.log(`   총 이미지 크기: ${totalImageSize.toFixed(1)} KB`);
    console.log(`   케이스 이미지: ${newCase.imageUrl ? 'Yes' : 'No'}`);

    console.log(`\n🎉 케이스 재생성 완료!`);
    console.log(`\n📝 다음 단계:`);
    console.log(`   1. Devvit playtest 새로고침 (devvit playtest)`);
    console.log(`   2. Reddit 페이지 새로고침`);
    console.log(`   3. Investigation 화면에서 프로필 이미지 확인`);

  } catch (error) {
    console.error('❌ 케이스 재생성 실패:', error);
    if (error instanceof Error) {
      console.error('   상세:', error.message);
      console.error('   스택:', error.stack);
    }
    process.exit(1);
  }
}

// 스크립트 실행
regenerateCaseWithImages();
