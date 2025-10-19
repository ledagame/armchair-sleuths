/**
 * CinematicBackgroundService.ts
 *
 * 백그라운드 시네마틱 이미지 생성 서비스
 * - 비동기 이미지 생성 오케스트레이션
 * - 상태 추적 및 KV Store 업데이트
 * - 에러 처리 및 재시도 로직
 */

import { CinematicImageService } from '../image/CinematicImageService';
import { CaseRepository } from '../repositories/kv/CaseRepository';
import { GeminiClient } from '../gemini/GeminiClient';
import type { CinematicImages, ImageGenerationMeta } from '../../../shared/types/index';

/**
 * 백그라운드 이미지 생성 서비스
 *
 * 타임아웃을 피하기 위해 시네마틱 이미지를 백그라운드에서 생성
 */
export class CinematicBackgroundService {
  private cinematicImageService: CinematicImageService;

  constructor(geminiClient: GeminiClient) {
    this.cinematicImageService = new CinematicImageService(geminiClient);
  }

  /**
   * 시네마틱 이미지 생성 (백그라운드)
   *
   * @param caseId - 케이스 ID
   * @param autoRetry - 자동 재시도 활성화 여부 (기본값: true)
   * @param maxAutoRetries - 최대 자동 재시도 횟수 (기본값: 2)
   */
  async generateCinematicImages(
    caseId: string,
    autoRetry: boolean = true,
    maxAutoRetries: number = 2
  ): Promise<void> {
    try {
      console.log(`🎬 [Background] Starting cinematic image generation for case: ${caseId}`);

      // 현재 재시도 횟수 확인
      const currentStatus = await CaseRepository.getImageGenerationStatus(caseId);
      const retryCount = currentStatus.meta?.retryCount || 0;

      // 1. 상태 업데이트: 생성 시작
      await CaseRepository.updateImageGenerationStatus(caseId, 'generating', {
        startedAt: Date.now(),
        retryCount,
        progress: {
          establishing: 'pending',
          confrontation: 'pending',
          action: 'pending'
        }
      });

      // 2. 케이스 데이터 조회
      const caseData = await CaseRepository.getCaseById(caseId);
      if (!caseData) {
        throw new Error(`Case not found: ${caseId}`);
      }

      // 3. 시네마틱 이미지 생성
      const cinematicImages = await this.generateImagesWithProgress(
        caseId,
        caseData.location,
        caseData.weapon,
        caseData.victim.name
      );

      // 4. 생성된 이미지 저장
      await CaseRepository.updateCinematicImages(caseId, cinematicImages);

      console.log(`✅ [Background] Cinematic images generation completed for case: ${caseId}`);

    } catch (error) {
      console.error(`❌ [Background] Failed to generate cinematic images for case ${caseId}:`, error);

      // 현재 재시도 횟수 확인
      const currentStatus = await CaseRepository.getImageGenerationStatus(caseId);
      const retryCount = currentStatus.meta?.retryCount || 0;

      // 자동 재시도 로직
      if (autoRetry && retryCount < maxAutoRetries) {
        const nextRetryCount = retryCount + 1;
        console.log(`🔄 [Background] Auto-retry attempt ${nextRetryCount}/${maxAutoRetries} for case: ${caseId}`);

        // 재시도 카운트 증가 및 상태 업데이트
        await CaseRepository.updateImageGenerationStatus(caseId, 'generating', {
          retryCount: nextRetryCount,
          failureReason: error instanceof Error ? error.message : 'Unknown error'
        });

        // 짧은 딜레이 후 재시도 (백오프 전략: 2^retryCount 초)
        const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delayMs));

        // 재귀 호출로 재시도 (autoRetry는 유지)
        return this.generateCinematicImages(caseId, autoRetry, maxAutoRetries);
      }

      // 최대 재시도 초과 또는 자동 재시도 비활성화 시 실패 상태로 설정
      await CaseRepository.updateImageGenerationStatus(caseId, 'failed', {
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        retryCount: retryCount + 1
      });

      throw error;
    }
  }

  /**
   * 진행 상황 추적하며 이미지 생성
   *
   * @param caseId - 케이스 ID
   * @param location - 장소 정보
   * @param weapon - 무기 정보
   * @param victimName - 피해자 이름
   * @returns 생성된 이미지 URL 맵
   */
  private async generateImagesWithProgress(
    caseId: string,
    location: { name: string; description: string; atmosphere?: string },
    weapon: { name: string; description: string },
    victimName: string
  ): Promise<CinematicImages> {
    console.log(`🎨 [Background] Calling CinematicImageService for all 3 scenes...`);

    // CinematicImageService가 내부적으로 모든 씬을 순차 생성
    const cinematicImages = await this.cinematicImageService.generateCinematicImages(
      {
        name: location.name,
        description: location.description,
        atmosphere: location.atmosphere || location.description
      } as any,
      {
        name: weapon.name,
        description: weapon.description
      } as any,
      victimName
    );

    // 생성된 이미지 개수 확인
    const generatedCount = Object.keys(cinematicImages).filter(
      key => cinematicImages[key as keyof CinematicImages]
    ).length;

    console.log(`✅ [Background] Generated ${generatedCount}/3 cinematic images`);

    // 최소 1개 이상의 이미지가 생성되었는지 확인
    if (generatedCount === 0) {
      throw new Error('No cinematic images were generated');
    }

    // 부분 성공 상태 처리
    if (generatedCount < 3) {
      console.warn(`⚠️ [Background] Partial success: ${generatedCount}/3 images generated`);
      await CaseRepository.updateImageGenerationStatus(caseId, 'partial');
    }

    return cinematicImages;
  }

  /**
   * 개별 씬 생성 진행 상황 업데이트
   *
   * @param caseId - 케이스 ID
   * @param sceneType - 씬 타입
   * @param status - 생성 상태
   */
  private async updateSceneProgress(
    caseId: string,
    sceneType: 'establishing' | 'confrontation' | 'action',
    status: 'pending' | 'generating' | 'completed' | 'failed'
  ): Promise<void> {
    try {
      const currentStatus = await CaseRepository.getImageGenerationStatus(caseId);
      const updatedProgress = {
        ...currentStatus.meta?.progress,
        [sceneType]: status
      };

      await CaseRepository.updateImageGenerationStatus(caseId, 'generating', {
        progress: updatedProgress as ImageGenerationMeta['progress']
      });
    } catch (error) {
      console.error(`Failed to update scene progress for ${sceneType}:`, error);
      // 진행 상황 업데이트 실패는 치명적이지 않음
    }
  }

  /**
   * 이미지 생성 재시도
   *
   * @param caseId - 케이스 ID
   * @param maxRetries - 최대 재시도 횟수
   */
  async retryImageGeneration(caseId: string, maxRetries: number = 3): Promise<void> {
    const currentStatus = await CaseRepository.getImageGenerationStatus(caseId);
    const retryCount = (currentStatus.meta?.retryCount || 0) + 1;

    if (retryCount > maxRetries) {
      console.error(`❌ [Background] Max retries (${maxRetries}) exceeded for case: ${caseId}`);
      await CaseRepository.updateImageGenerationStatus(caseId, 'failed', {
        failureReason: `Max retries (${maxRetries}) exceeded`,
        retryCount
      });
      throw new Error('Max retries exceeded');
    }

    console.log(`🔄 [Background] Retry attempt ${retryCount}/${maxRetries} for case: ${caseId}`);

    await CaseRepository.updateImageGenerationStatus(caseId, 'pending', {
      retryCount
    });

    await this.generateCinematicImages(caseId);
  }
}
