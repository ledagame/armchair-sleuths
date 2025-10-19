#!/usr/bin/env ts-node
/**
 * generate-case.ts
 *
 * 완전한 케이스 생성 스크립트
 * CaseGeneratorService를 사용하여 새 케이스 생성
 */

import { createGeminiClient } from '../../../src/server/services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../../../src/server/services/case/CaseGeneratorService';
import { FileStorageAdapter } from '../../../src/server/adapters/FileStorageAdapter';
import { KVStoreManager } from '../../../src/server/services/repositories/kv/KVStoreManager';

interface GenerateCaseOptions {
  withImages?: boolean;
  caseId?: string;
  date?: string;
}

async function main() {
  const args = process.argv.slice(2);

  const options: GenerateCaseOptions = {
    withImages: args.includes('--with-images'),
    caseId: args.find(arg => arg.startsWith('--case-id='))?.split('=')[1],
    date: args.find(arg => arg.startsWith('--date='))?.split('=')[1]
  };

  console.log('🚀 Mystery Case Generator');
  console.log('========================\n');

  // 1. 환경 설정 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable not set');
    console.error('   Set it with: export GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // 2. Storage 어댑터 초기화
  const storageAdapter = new FileStorageAdapter('./local-data');
  KVStoreManager.setAdapter(storageAdapter);
  console.log('✅ Storage adapter initialized\n');

  // 3. Gemini 클라이언트 생성
  const geminiClient = createGeminiClient(apiKey);
  const caseGenerator = createCaseGeneratorService(geminiClient);

  // 4. 날짜 파싱
  const caseDate = options.date ? new Date(options.date) : new Date();

  // 5. 케이스 생성
  console.log(`📅 Generating case for: ${caseDate.toISOString().split('T')[0]}`);
  console.log(`🎨 Include images: ${options.withImages ? 'Yes' : 'No'}\n`);

  try {
    const generatedCase = await caseGenerator.generateCase({
      date: caseDate,
      includeImage: options.withImages,
      includeSuspectImages: options.withImages,
      customCaseId: options.caseId
    });

    console.log('\n✅ Case generated successfully!\n');
    console.log('📋 Case Summary:');
    console.log('================');
    console.log(`Case ID: ${generatedCase.id}`);
    console.log(`Date: ${generatedCase.date}`);
    console.log(`Victim: ${generatedCase.victim.name}`);
    console.log(`Weapon: ${generatedCase.weapon.name}`);
    console.log(`Location: ${generatedCase.location.name}`);
    console.log(`\nSuspects:`);
    generatedCase.suspects.forEach((suspect, index) => {
      console.log(`  ${index + 1}. ${suspect.name} (${suspect.archetype}) ${suspect.isGuilty ? '🔴 GUILTY' : '⚪'}`);
      if (suspect.profileImageUrl) {
        console.log(`     Image: Generated ✅`);
      }
    });
    console.log(`\nSolution:`);
    console.log(`  WHO: ${generatedCase.solution.who}`);
    console.log(`  WHAT: ${generatedCase.solution.what}`);
    console.log(`  WHERE: ${generatedCase.solution.where}`);
    console.log(`  WHEN: ${generatedCase.solution.when}`);
    console.log(`  WHY: ${generatedCase.solution.why}`);
    console.log(`  HOW: ${generatedCase.solution.how}`);

    if (generatedCase.imageUrl) {
      console.log(`\n🖼️  Case scene image: Generated ✅`);
    }

    console.log(`\n💾 Saved to KV store: ${generatedCase.id}`);

  } catch (error) {
    console.error('\n❌ Case generation failed:');
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

export { main };
