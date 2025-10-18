/**
 * DailyCaseScheduler.ts
 *
 * Devvit Scheduler를 사용한 매일 케이스 자동 생성
 * 매일 자정(UTC)에 새로운 케이스를 생성
 */

import { Devvit } from 'devvit';
import { createGeminiClient } from '../services/gemini/GeminiClient';
import { createCaseGeneratorService } from '../services/case/CaseGeneratorService';
import { CaseRepository } from '../services/repositories/kv/CaseRepository';

/**
 * 매일 케이스 생성 스케줄러
 *
 * Devvit Scheduler API 사용:
 * - 1초 실행 제한 없음
 * - 백그라운드 실행
 * - 크론 표현식 지원
 */
Devvit.addSchedulerJob({
  name: 'daily-case-generation',
  onRun: async (_event, context) => {
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

      // 2. 새 케이스 생성
      const geminiClient = createGeminiClient();
      const caseGenerator = createCaseGeneratorService(geminiClient);

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

      // 에러를 던지면 Devvit이 자동으로 재시도
      throw error;
    }
  }
});

/**
 * 스케줄러 등록 및 설정
 */
export function registerDailyCaseScheduler(context: any) {
  // 매일 자정 UTC에 실행
  // 크론 표현식: "0 0 * * *" = 매일 00:00 UTC
  context.scheduler.runJob({
    name: 'daily-case-generation',
    cron: '0 0 * * *' // 매일 자정
  });

  console.log('✅ Daily case scheduler registered (cron: 0 0 * * *)');
}

/**
 * 수동 케이스 생성 트리거 (개발/테스트용)
 */
Devvit.addSchedulerJob({
  name: 'manual-case-generation',
  onRun: async (_event, context) => {
    console.log('🔄 Manual case generation triggered...');

    const startTime = Date.now();

    try {
      const geminiClient = createGeminiClient();
      const caseGenerator = createCaseGeneratorService(geminiClient);

      const newCase = await caseGenerator.generateCase({
        date: new Date(),
        includeImage: false, // Skip case scene image for faster testing
        includeSuspectImages: true // ✅ But include suspect profile images
      });

      console.log(`✅ Manual case generated: ${newCase.caseId}`);
      console.log(`   - Suspect Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);
      console.log(`⏱️ Completed in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error('❌ Manual case generation failed:', error);
      throw error;
    }
  }
});

/**
 * 수동 트리거 헬퍼 (개발용)
 */
export function triggerManualCaseGeneration(context: any) {
  context.scheduler.runJob({
    name: 'manual-case-generation',
    runAt: new Date(Date.now() + 1000) // 1초 후 실행
  });

  console.log('✅ Manual case generation scheduled');
}

/**
 * 특정 날짜의 케이스 생성 (백필용)
 */
Devvit.addSchedulerJob({
  name: 'backfill-case-generation',
  onRun: async (event, context) => {
    console.log('🔄 Backfill case generation started...');

    const startTime = Date.now();
    const targetDate = event.data?.date ? new Date(event.data.date) : new Date();

    try {
      const geminiClient = createGeminiClient();
      const caseGenerator = createCaseGeneratorService(geminiClient);

      const newCase = await caseGenerator.generateCase({
        date: targetDate,
        includeImage: event.data?.includeImage || false,
        includeSuspectImages: event.data?.includeSuspectImages !== undefined
          ? event.data.includeSuspectImages
          : true // ✅ Default to true for suspect images
      });

      console.log(`✅ Backfill case generated for ${targetDate.toISOString().split('T')[0]}: ${newCase.caseId}`);
      console.log(`   - Suspect Images: ${newCase.suspects.filter(s => s.profileImageUrl).length}/${newCase.suspects.length}`);
      console.log(`⏱️ Completed in ${Date.now() - startTime}ms`);

    } catch (error) {
      console.error(`❌ Backfill case generation failed for ${targetDate.toISOString().split('T')[0]}:`, error);
      throw error;
    }
  }
});

/**
 * 백필 트리거 헬퍼
 */
export function triggerBackfillCaseGeneration(
  context: any,
  date: Date,
  includeImage: boolean = false
) {
  context.scheduler.runJob({
    name: 'backfill-case-generation',
    runAt: new Date(Date.now() + 1000),
    data: {
      date: date.toISOString(),
      includeImage
    }
  });

  console.log(`✅ Backfill case generation scheduled for ${date.toISOString().split('T')[0]}`);
}

/**
 * 스케줄러 상태 확인
 */
export async function getSchedulerStatus(context: any): Promise<{
  dailySchedulerActive: boolean;
  nextRun?: Date;
  lastRun?: Date;
}> {
  // Devvit Scheduler API를 통해 상태 확인
  // TODO: Devvit API 문서에 따라 구현

  return {
    dailySchedulerActive: true,
    // nextRun, lastRun은 Scheduler API에서 제공하는 메서드로 조회
  };
}

/**
 * 모든 스케줄러 초기화 (앱 설치 시 호출)
 */
export function initializeAllSchedulers(context: any) {
  console.log('🔄 Initializing all schedulers...');

  // 1. 매일 케이스 생성 스케줄러
  registerDailyCaseScheduler(context);

  // 2. 첫 케이스 즉시 생성 (앱 설치 직후)
  triggerManualCaseGeneration(context);

  console.log('✅ All schedulers initialized');
}
