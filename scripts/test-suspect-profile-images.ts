/**
 * test-suspect-profile-images.ts
 *
 * 용의자 프로필 이미지 생성 테스트
 *
 * 사용법:
 * npx tsx scripts/test-suspect-profile-images.ts
 */

// .env.local 파일 로드
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createGeminiClient } from '../src/server/services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../src/server/services/case/CaseGeneratorService';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { MemoryStorageAdapter } from '../src/server/services/repositories/adapters/MemoryStorageAdapter';

async function testSuspectProfileImages() {
  console.log('🎨 용의자 프로필 이미지 생성 테스트 시작\n');

  try {
    // Storage adapter 초기화 (로컬 테스트용)
    const storageAdapter = new MemoryStorageAdapter();
    KVStoreManager.setAdapter(storageAdapter);

    console.log('✅ Storage adapter 초기화 완료');

    // Gemini 클라이언트 생성
    const geminiClient = createGeminiClient();

    console.log('✅ Gemini 클라이언트 초기화 완료');
    console.log(`   Vercel Function URL: ${process.env.VERCEL_IMAGE_FUNCTION_URL}\n`);

    // 케이스 생성 서비스 초기화
    const caseGenerator = createCaseGeneratorService(geminiClient);

    console.log('🔄 용의자 프로필 이미지 포함 케이스 생성 중...');
    console.log('   (3명의 용의자 × 약 8초 = 24초 예상)\n');

    const startTime = Date.now();

    // 용의자 이미지 포함하여 케이스 생성
    const generatedCase = await caseGenerator.generateCase({
      includeImage: false, // 케이스 이미지는 스킵
      includeSuspectImages: true, // 용의자 프로필 이미지 생성
      temperature: 0.8
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ 케이스 생성 완료! (${duration}초 소요)`);
    console.log(`   케이스 ID: ${generatedCase.id}`);
    console.log(`   날짜: ${generatedCase.date}`);
    console.log(`   피해자: ${generatedCase.victim.name}\n`);

    // 각 용의자의 프로필 이미지 확인
    console.log('👥 용의자 프로필 이미지:');
    generatedCase.suspects.forEach((suspect, index) => {
      console.log(`\n${index + 1}. ${suspect.name} (${suspect.archetype})`);
      console.log(`   배경: ${suspect.background.substring(0, 80)}...`);

      if (suspect.profileImageUrl) {
        const sizeKB = (suspect.profileImageUrl.length * 0.75 / 1024).toFixed(1);
        console.log(`   ✅ 프로필 이미지: ${sizeKB} KB`);
        console.log(`   URL 시작: ${suspect.profileImageUrl.substring(0, 50)}...`);
      } else {
        console.log(`   ❌ 프로필 이미지 없음`);
      }
    });

    // 성공률 계산
    const imagesGenerated = generatedCase.suspects.filter(s => s.profileImageUrl).length;
    const totalSuspects = generatedCase.suspects.length;
    const successRate = ((imagesGenerated / totalSuspects) * 100).toFixed(0);

    console.log(`\n📊 통계:`);
    console.log(`   생성된 이미지: ${imagesGenerated}/${totalSuspects}`);
    console.log(`   성공률: ${successRate}%`);
    console.log(`   총 소요 시간: ${duration}초`);
    console.log(`   평균 시간/이미지: ${(parseFloat(duration) / imagesGenerated).toFixed(1)}초`);

    // 비용 계산
    const imageCost = imagesGenerated * 0.039;
    console.log(`\n💰 비용:`);
    console.log(`   이미지 생성: $${imageCost.toFixed(3)}`);
    console.log(`   16일 운영 (1일 1케이스): $${(imageCost * 16).toFixed(2)}`);

    console.log('\n🎉 테스트 완료!\n');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    if (error instanceof Error) {
      console.error('   상세:', error.message);
      console.error('   스택:', error.stack);
    }
    process.exit(1);
  }
}

// 스크립트 실행
testSuspectProfileImages();
