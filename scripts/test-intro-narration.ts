#!/usr/bin/env ts-node
/**
 * test-intro-narration.ts
 *
 * 인트로 나레이션 품질 테스트 스크립트
 * 향상된 프롬프트가 고품질 나레이션을 생성하는지 검증
 */

import { createGeminiClient } from '../../../src/server/services/gemini/GeminiClient.ts';
import { createCaseGeneratorService } from '../../../src/server/services/case/CaseGeneratorService.ts';
import { FileStorageAdapter } from '../../../src/server/adapters/FileStorageAdapter.ts';
import { KVStoreManager } from '../../../src/server/services/repositories/kv/KVStoreManager.ts';

async function main() {
  console.log('🎭 인트로 나레이션 품질 테스트');
  console.log('================================\n');

  // 1. 환경 설정 확인
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ 오류: GEMINI_API_KEY 환경 변수가 설정되지 않았습니다');
    console.error('   설정 방법: export GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  // 2. Storage 어댑터 초기화
  const storageAdapter = new FileStorageAdapter('./local-data');
  KVStoreManager.setAdapter(storageAdapter);
  console.log('✅ Storage 어댑터 초기화 완료\n');

  // 3. Gemini 클라이언트 및 케이스 생성기 초기화
  const geminiClient = createGeminiClient(apiKey);
  const caseGenerator = createCaseGeneratorService(geminiClient);

  // 4. 케이스 생성 (이미지 제외하여 빠른 테스트)
  console.log('📅 테스트 케이스 생성 중...\n');

  try {
    const generatedCase = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: false,
      includeSuspectImages: false
    });

    console.log('✅ 케이스 생성 완료!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 케이스 기본 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Case ID: ${generatedCase.id}`);
    console.log(`피해자: ${generatedCase.victim.name}`);
    console.log(`장소: ${generatedCase.location.name}`);
    console.log(`무기: ${generatedCase.weapon.name}`);
    console.log(`용의자 수: ${generatedCase.suspects.length}명\n`);

    // 5. 나레이션 품질 분석
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎭 인트로 나레이션 (ATMOSPHERE)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(generatedCase.introNarration.atmosphere);
    console.log(`\n단어 수: ${generatedCase.introNarration.atmosphere.split(' ').length}개`);
    console.log(`글자 수: ${generatedCase.introNarration.atmosphere.length}자\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 사건 발생 (INCIDENT)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(generatedCase.introNarration.incident);
    console.log(`\n단어 수: ${generatedCase.introNarration.incident.split(' ').length}개`);
    console.log(`글자 수: ${generatedCase.introNarration.incident.length}자\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚡ 위기 상황 (STAKES)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(generatedCase.introNarration.stakes);
    console.log(`\n단어 수: ${generatedCase.introNarration.stakes.split(' ').length}개`);
    console.log(`글자 수: ${generatedCase.introNarration.stakes.length}자\n`);

    // 6. 품질 평가 지표
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 품질 평가 지표');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const fullText = `${generatedCase.introNarration.atmosphere} ${generatedCase.introNarration.incident} ${generatedCase.introNarration.stakes}`;

    // 금지된 상투어 체크
    const forbiddenPhrases = [
      '어둡고 폭풍우 치는 밤',
      '그들은 거의 알지 못했다',
      '폭풍 전의 고요',
      '아름다운 저택',
      '무서운 분위기'
    ];

    const foundCliches = forbiddenPhrases.filter(phrase =>
      fullText.includes(phrase)
    );

    console.log(`\n✓ 상투어 회피: ${foundCliches.length === 0 ? '✅ 통과' : '❌ 실패'}`);
    if (foundCliches.length > 0) {
      console.log(`  발견된 상투어: ${foundCliches.join(', ')}`);
    }

    // 감각적 표현 체크 (간단한 휴리스틱)
    const sensoryKeywords = {
      시각: ['빛', '그림자', '색', '어둠', '밝', '빛나', '반짝', '희미'],
      청각: ['소리', '울리', '조용', '침묵', '속삭', '외치', '울음', '메아리'],
      후각: ['냄새', '향기', '악취', '쾨쾨', '향수'],
      촉각: ['차가', '뜨거', '질감', '거칠', '부드러', '축축', '건조'],
      미각: ['쓴', '달콤', '짠', '시큼']
    };

    const detectedSenses = Object.entries(sensoryKeywords).filter(([sense, keywords]) =>
      keywords.some(keyword => fullText.includes(keyword))
    ).map(([sense]) => sense);

    console.log(`\n✓ 감각적 묘사 (목표: 3개 이상): ${detectedSenses.length >= 3 ? '✅ 통과' : '⚠️  검토 필요'}`);
    console.log(`  감지된 감각: ${detectedSenses.join(', ')} (${detectedSenses.length}개)`);

    // 비유적 표현 체크
    const metaphorKeywords = ['처럼', '같은', '마치', '듯', '인', '의'];
    const metaphorCount = metaphorKeywords.reduce((count, keyword) =>
      count + (fullText.match(new RegExp(keyword, 'g')) || []).length, 0
    );

    console.log(`\n✓ 비유적 표현: ${metaphorCount > 0 ? '✅ 발견됨' : '⚠️  검토 필요'}`);
    console.log(`  비유 표현 추정치: ${metaphorCount}개`);

    // 구체성 체크 (명사 vs 형용사 비율)
    const hasSpecificDetails = /\d+|시간|분|미터|층|개|명/.test(fullText);
    console.log(`\n✓ 구체적 세부사항: ${hasSpecificDetails ? '✅ 발견됨' : '⚠️  검토 필요'}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 종합 평가');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const qualityScore = [
      foundCliches.length === 0,
      detectedSenses.length >= 3,
      metaphorCount > 0,
      hasSpecificDetails
    ].filter(Boolean).length;

    const grade = qualityScore === 4 ? '🌟 우수' :
                  qualityScore === 3 ? '✅ 양호' :
                  qualityScore === 2 ? '⚠️  개선 필요' :
                  '❌ 재작업 필요';

    console.log(`\n품질 점수: ${qualityScore}/4`);
    console.log(`평가: ${grade}\n`);

    if (qualityScore < 4) {
      console.log('개선 권장 사항:');
      if (foundCliches.length > 0) {
        console.log('  - 상투어 제거 필요');
      }
      if (detectedSenses.length < 3) {
        console.log('  - 더 많은 감각적 묘사 추가 (목표: 3개 이상)');
      }
      if (metaphorCount === 0) {
        console.log('  - 비유적 표현 추가');
      }
      if (!hasSpecificDetails) {
        console.log('  - 구체적 세부사항 추가 (숫자, 시간, 크기 등)');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ 케이스 생성 실패:');
    console.error(error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch(console.error);
}

export { main };
