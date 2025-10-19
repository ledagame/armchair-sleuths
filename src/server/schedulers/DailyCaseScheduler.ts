/**
 * DailyCaseScheduler.ts
 *
 * Devvit Scheduler를 사용한 매일 케이스 자동 생성
 * 매일 자정(UTC)에 새로운 케이스를 생성
 *
 * Note: @devvit/web architecture - API key passed from route handler
 */

import { createGeminiClient } from '../services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../services/case/CaseGeneratorService';
import { CaseRepository } from '../services/repositories/kv/CaseRepository';

/**
 * 매일 케이스 생성 핸들러
 * @param apiKey - Gemini API key (passed from route handler where settings are accessible)
 */
export async function generateDailyCase(apiKey: string): Promise<void> {
  console.log('🔄 Daily case generation started...');

  const startTime = Date.now();

  try {
    // 1. 오늘의 케이스가 이미 있는지 확인
    const existingCase = await CaseRepository.getTodaysCase();

    if (existingCase) {
      console.log(`✅ Today's case already exists: ${existingCase.id}`);
      console.log(`⏱️ Completed in ${Date.now() - startTime}ms`);
      return;
    }

    // 2. Gemini client 생성
    const geminiClient = createGeminiClient(apiKey);
    const caseGenerator = createCaseGeneratorService(geminiClient);

    // 3. 새 케이스 생성
    const newCase = await caseGenerator.generateCase({
      date: new Date(),
      includeImage: true, // Generate case scene image
      includeSuspectImages: true // ✅ Generate suspect profile images
    });

    console.log(`✅ New case generated: ${newCase.caseId}`);
    console.log(`   - Victim: ${newCase.victim.name}`);
    console.log(`   - Weapon: ${newCase.weapon.name}`);
    console.log(`   - Location: ${newCase.location.name}`);
    console.log(`   - Suspects: ${newCase.suspects.length}`);
    console.log(`   - Case Image: ${newCase.imageUrl ? 'Yes' : 'No'}`);
    console.log(`   - Suspect Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);
    console.log(`⏱️ Completed in ${Date.now() - startTime}ms`);

  } catch (error) {
    console.error('❌ Daily case generation failed:', error);
    throw error;
  }
}

/**
 * 모든 스케줄러 초기화 (앱 설치 시 호출)
 * @param apiKey - Gemini API key (passed from route handler)
 */
export async function initializeAllSchedulers(apiKey: string): Promise<void> {
  console.log('🔄 Initializing schedulers...');

  try {
    // 즉시 첫 케이스 생성 (백그라운드 실행)
    console.log('🎯 Generating first case immediately...');
    await generateDailyCase(apiKey);

    console.log('✅ Schedulers initialized successfully');
  } catch (error) {
    console.error('❌ Scheduler initialization failed:', error);
    // 에러가 나도 앱 설치는 계속 진행
  }
}
