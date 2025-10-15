/**
 * generate-case.ts
 *
 * 케이스 생성 스크립트 (이미지 없이 빠르게)
 *
 * 사용법:
 * npx tsx scripts/generate-case.ts
 *
 * 이미지 포함:
 * npx tsx scripts/generate-case.ts --with-image
 */

// .env.local 파일 로드 (필수!)
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createGeminiClient } from '../src/server/services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../src/server/services/case/CaseGeneratorService';
import { CaseRepository } from '../src/server/services/repositories/kv/CaseRepository';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';

async function generateCase() {
  const withImage = process.argv.includes('--with-image');

  console.log('🎲 케이스 생성 중...\n');
  console.log(`   이미지 생성: ${withImage ? 'Yes' : 'No (빠른 테스트)'}`);

  try {
    // Initialize file storage adapter for local execution
    const storageAdapter = new FileStorageAdapter('./local-data');
    KVStoreManager.setAdapter(storageAdapter);

    const geminiClient = createGeminiClient();
    const caseGenerator = createCaseGeneratorService(geminiClient);

    const today = new Date().toISOString().split('T')[0];
    console.log(`   날짜: ${today}\n`);

    const startTime = Date.now();

    const caseData = await caseGenerator.generateCase(today, withImage);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n✅ 케이스 생성 완료! (${duration}초 소요)\n`);
    console.log('━'.repeat(60));
    console.log(`📋 케이스 ID: ${caseData.id}`);
    console.log(`📅 날짜: ${caseData.date}`);
    console.log('━'.repeat(60));

    console.log('\n👤 피해자:');
    console.log(`   이름: ${caseData.victim.name}`);
    console.log(`   배경: ${caseData.victim.background}`);
    console.log(`   관계: ${caseData.victim.relationship}`);

    console.log('\n🔪 무기:');
    console.log(`   이름: ${caseData.weapon.name}`);
    console.log(`   설명: ${caseData.weapon.description}`);

    console.log('\n📍 장소:');
    console.log(`   이름: ${caseData.location.name}`);
    console.log(`   설명: ${caseData.location.description}`);

    console.log('\n🕵️ 용의자:');
    caseData.suspects.forEach((suspect, index) => {
      const isGuilty = suspect.isGuilty ? '⚠️ [진범]' : '';
      console.log(`\n   ${index + 1}. ${suspect.name} ${isGuilty}`);
      console.log(`      원형: ${suspect.archetype}`);
      console.log(`      배경: ${suspect.background}`);
      console.log(`      성격: ${suspect.personality}`);
      console.log(`      감정 상태: ${suspect.emotionalState.tone} (의심도: ${suspect.emotionalState.suspicionLevel})`);
    });

    console.log('\n🎯 정답 (5W1H):');
    console.log(`   누가 (Who): ${caseData.solution.who}`);
    console.log(`   무엇을 (What): ${caseData.solution.what}`);
    console.log(`   어디서 (Where): ${caseData.solution.where}`);
    console.log(`   언제 (When): ${caseData.solution.when}`);
    console.log(`   왜 (Why): ${caseData.solution.why}`);
    console.log(`   어떻게 (How): ${caseData.solution.how}`);

    if (caseData.imageUrl) {
      console.log(`\n🖼️ 이미지: 생성됨 (${caseData.imageUrl.length} chars)`);
    } else {
      console.log('\n🖼️ 이미지: 없음');
    }

    console.log('\n━'.repeat(60));
    console.log('💾 Saved to local file storage');
    console.log('   Location: ./local-data/');
    console.log('━'.repeat(60));

    // API 엔드포인트 안내
    console.log('\n📡 API 테스트:');
    console.log(`   GET /api/case/today`);
    console.log(`   GET /api/suspects/${caseData.id}`);
    console.log(`   POST /api/chat/:suspectId (body: { userId, message })`);
    console.log(`   POST /api/submit (body: { userId, caseId, answers })`);

    console.log('\n🎉 완료!\n');

  } catch (error) {
    console.error('❌ 케이스 생성 실패:', error);
    if (error instanceof Error) {
      console.error('   상세:', error.message);
      console.error('   스택:', error.stack);
    }
    process.exit(1);
  }
}

// 스크립트 실행
generateCase();
