/**
 * test-game-flow.ts
 *
 * 게임 전체 흐름 테스트 스크립트
 *
 * 사용법:
 * npx tsx scripts/test-game-flow.ts
 */

// .env.local 파일 로드 (필수!)
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { createGeminiClient } from '../src/server/services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../src/server/services/case/CaseGeneratorService';
import { CaseRepository } from '../src/server/services/repositories/kv/CaseRepository';
import { createSuspectAIService } from '../src/server/services/suspect/SuspectAIService';
import { createW4HValidator } from '../src/server/services/scoring/W4HValidator';
import { createScoringEngine } from '../src/server/services/scoring/ScoringEngine';
import { KVStoreManager } from '../src/server/services/repositories/kv/KVStoreManager';
import { FileStorageAdapter } from '../src/server/services/repositories/adapters/FileStorageAdapter';

async function testGameFlow() {
  console.log('🎮 게임 흐름 테스트 시작\n');

  // Initialize file storage adapter for local testing
  const storageAdapter = new FileStorageAdapter('./local-data');
  KVStoreManager.setAdapter(storageAdapter);

  // 1️⃣ 케이스 생성 테스트
  console.log('1️⃣ 케이스 생성 테스트');
  console.log('━'.repeat(60));

  try {
    const geminiClient = createGeminiClient();
    const caseGenerator = createCaseGeneratorService(geminiClient);

    console.log('⏳ 케이스 생성 중... (30-60초 소요)');
    const testDate = new Date();
    const caseData = await caseGenerator.generateCase({ date: testDate });

    console.log('✅ 케이스 생성 완료!');
    console.log(`   - ID: ${caseData.id}`);
    console.log(`   - 날짜: ${caseData.date}`);
    console.log(`   - 피해자: ${caseData.victim.name}`);
    console.log(`   - 무기: ${caseData.weapon.name}`);
    console.log(`   - 장소: ${caseData.location.name}`);
    console.log(`   - 용의자 수: ${caseData.suspects.length}`);
    console.log(`   - 이미지 URL: ${caseData.imageUrl ? '생성됨' : '없음'}`);
    console.log(`   - 진범: ${caseData.suspects.find(s => s.isGuilty)?.name}\n`);

    // 2️⃣ 용의자 조회 테스트
    console.log('2️⃣ 용의자 조회 테스트');
    console.log('━'.repeat(60));

    const suspects = await CaseRepository.getCaseSuspects(caseData.id);
    console.log(`✅ 용의자 ${suspects.length}명 조회 완료:`);
    suspects.forEach((suspect, index) => {
      console.log(`   ${index + 1}. ${suspect.name} (${suspect.archetype})`);
      console.log(`      - 배경: ${suspect.background.substring(0, 50)}...`);
      console.log(`      - 감정 상태: ${suspect.emotionalState.tone} (의심도: ${suspect.emotionalState.suspicionLevel})`);
    });
    console.log('');

    // 3️⃣ AI 대화 테스트
    console.log('3️⃣ AI 대화 테스트');
    console.log('━'.repeat(60));

    if (suspects.length === 0) {
      throw new Error('No suspects found for the case. Case creation may have failed.');
    }

    const suspectAI = createSuspectAIService(geminiClient);
    const testSuspect = suspects[0];
    const testUserId = 'test-user-001';
    const testQuestion = '사건 당일 어디 있었습니까?';

    console.log(`⏳ ${testSuspect.name}에게 질문 중...`);
    console.log(`   질문: "${testQuestion}"`);

    const chatResponse = await suspectAI.generateResponse(
      testSuspect.id,
      testUserId,
      testQuestion
    );

    console.log('✅ AI 응답 생성 완료!');
    console.log(`   응답: "${chatResponse.response}"`);
    console.log(`   감정 상태: ${chatResponse.emotionalState.tone} (의심도: ${chatResponse.emotionalState.suspicionLevel})`);
    console.log(`   대화 횟수: ${chatResponse.conversationCount}\n`);

    // 4️⃣ 대화 기록 조회 테스트
    console.log('4️⃣ 대화 기록 조회 테스트');
    console.log('━'.repeat(60));

    const conversationHistory = await suspectAI.getConversationHistory(
      testSuspect.id,
      testUserId
    );

    console.log(`✅ 대화 기록 ${conversationHistory.length}개 조회 완료:`);
    conversationHistory.forEach((msg, index) => {
      const role = msg.role === 'user' ? '탐정' : testSuspect.name;
      console.log(`   ${index + 1}. [${role}] ${msg.content.substring(0, 50)}...`);
    });
    console.log('');

    // 5️⃣ 답변 제출 및 채점 테스트
    console.log('5️⃣ 답변 제출 및 채점 테스트');
    console.log('━'.repeat(60));

    const validator = createW4HValidator(geminiClient);
    const scoringEngine = createScoringEngine(validator);

    // 정답 확인
    const guiltyName = caseData.suspects.find(s => s.isGuilty)?.name || '';
    console.log(`   정답: ${guiltyName}`);

    // 테스트 답변 (의도적으로 일부만 정답)
    const userAnswer = {
      who: guiltyName, // 정답
      what: caseData.solution.what, // 정답
      where: '잘못된 장소', // 오답
      when: caseData.solution.when, // 정답
      why: '잘못된 동기', // 오답
      how: caseData.solution.how // 정답
    };

    console.log('⏳ 채점 중... (10-20초 소요)');
    const scoringResult = await scoringEngine.scoreSubmission(
      testUserId,
      caseData.id,
      userAnswer,
      caseData.solution
    );

    console.log('✅ 채점 완료!');
    console.log(`   총점: ${scoringResult.totalScore}/100`);
    console.log(`   정답 여부: ${scoringResult.isCorrect ? '✅ 정답!' : '❌ 오답'}`);
    console.log(`   순위: ${scoringResult.rank}위`);
    console.log('\n   항목별 점수:');
    console.log(`   - 범인 (누가): ${scoringResult.breakdown.who.score}/100 ${scoringResult.breakdown.who.isCorrect ? '✅' : '❌'}`);
    console.log(`   - 살인방법 (무엇을): ${scoringResult.breakdown.what.score}/100 ${scoringResult.breakdown.what.isCorrect ? '✅' : '❌'}`);
    console.log(`   - 장소 (어디서): ${scoringResult.breakdown.where.score}/100 ${scoringResult.breakdown.where.isCorrect ? '✅' : '❌'}`);
    console.log(`   - 시간 (언제): ${scoringResult.breakdown.when.score}/100 ${scoringResult.breakdown.when.isCorrect ? '✅' : '❌'}`);
    console.log(`   - 동기 (왜): ${scoringResult.breakdown.why.score}/100 ${scoringResult.breakdown.why.isCorrect ? '✅' : '❌'}`);
    console.log(`   - 방법 (어떻게): ${scoringResult.breakdown.how.score}/100 ${scoringResult.breakdown.how.isCorrect ? '✅' : '❌'}`);
    console.log('');

    // 6️⃣ 리더보드 조회 테스트
    console.log('6️⃣ 리더보드 조회 테스트');
    console.log('━'.repeat(60));

    const leaderboard = await scoringEngine.getLeaderboard(caseData.id, 10);
    console.log(`✅ 리더보드 ${leaderboard.length}개 항목 조회 완료:`);
    leaderboard.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.userId} - ${entry.score}점 ${entry.isCorrect ? '✅' : ''}`);
    });
    console.log('');

    // 7️⃣ 통계 조회 테스트
    console.log('7️⃣ 통계 조회 테스트');
    console.log('━'.repeat(60));

    const stats = await scoringEngine.getCaseStatistics(caseData.id);
    console.log('✅ 통계 조회 완료:');
    console.log(`   - 총 제출 수: ${stats.totalSubmissions}`);
    console.log(`   - 정답자 수: ${stats.correctSubmissions}`);

    // Calculate success rate from available data
    const successRate = stats.totalSubmissions > 0
      ? (stats.correctSubmissions / stats.totalSubmissions * 100)
      : 0;
    console.log(`   - 정답률: ${successRate.toFixed(1)}%`);
    console.log(`   - 평균 점수: ${stats.averageScore?.toFixed(1) ?? 0}점`);
    console.log(`   - 최고 점수: ${stats.highestScore}점`);
    console.log('');

    console.log('🎉 모든 테스트 완료!\n');

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
testGameFlow();
