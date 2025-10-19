/**
 * 수동 재시도 엔드포인트
 *
 * POST /api/cases/[caseId]/retry-images
 * - 실패한 이미지 생성을 수동으로 재시도
 * - 자동 재시도를 비활성화하고 1회만 재시도
 */

import { NextRequest, NextResponse } from 'next/server';
import { CinematicBackgroundService } from '@/server/services/background/CinematicBackgroundService';
import { GeminiClient } from '@/server/services/gemini/GeminiClient';
import { CaseRepository } from '@/server/services/repositories/kv/CaseRepository';

interface RetryRequest {
  /** 강제 재시도 여부 (상태 무시) */
  force?: boolean;
}

interface RetryResponse {
  message: string;
  caseId: string;
  previousStatus: string;
  retryCount: number;
  error?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<NextResponse<RetryResponse>> {
  try {
    const { caseId } = await params;

    // Validate caseId
    if (!caseId) {
      return NextResponse.json(
        {
          message: 'Failed to retry',
          caseId: '',
          previousStatus: '',
          retryCount: 0,
          error: 'Case ID is required'
        },
        { status: 400 }
      );
    }

    // 케이스 존재 여부 확인
    const exists = await CaseRepository.caseExists(caseId);
    if (!exists) {
      return NextResponse.json(
        {
          message: 'Failed to retry',
          caseId,
          previousStatus: '',
          retryCount: 0,
          error: 'Case not found'
        },
        { status: 404 }
      );
    }

    // 현재 상태 확인
    const currentStatus = await CaseRepository.getImageGenerationStatus(caseId);

    // 요청 본문 파싱
    const body: RetryRequest = await request.json().catch(() => ({}));

    // force가 아니면 completed 상태에서는 재시도 불가
    if (!body.force && currentStatus.status === 'completed') {
      return NextResponse.json(
        {
          message: 'No retry needed',
          caseId,
          previousStatus: currentStatus.status,
          retryCount: currentStatus.meta?.retryCount || 0,
          error: 'Images already completed'
        },
        { status: 400 }
      );
    }

    console.log(`[Retry] Manual retry requested for case: ${caseId}, previous status: ${currentStatus.status}`);

    // 백그라운드 서비스 초기화
    const geminiClient = new GeminiClient();
    const backgroundService = new CinematicBackgroundService(geminiClient);

    // 상태를 pending으로 리셋 (재시도 카운트는 유지)
    await CaseRepository.updateImageGenerationStatus(caseId, 'pending', {
      retryCount: currentStatus.meta?.retryCount || 0,
      failureReason: undefined
    });

    // Fire-and-forget: 백그라운드에서 재시도 (자동 재시도 비활성화)
    // 주의: await을 사용하지 않음!
    backgroundService.generateCinematicImages(caseId, false, 0).catch((error) => {
      console.error(`[Retry] Manual retry failed for case ${caseId}:`, error);
    });

    // 즉시 응답 반환
    return NextResponse.json(
      {
        message: 'Manual retry started',
        caseId,
        previousStatus: currentStatus.status,
        retryCount: currentStatus.meta?.retryCount || 0
      },
      { status: 202 } // 202 Accepted
    );

  } catch (error) {
    console.error('Error during manual retry:', error);

    return NextResponse.json(
      {
        message: 'Retry failed',
        caseId: '',
        previousStatus: '',
        retryCount: 0,
        error: error instanceof Error
          ? error.message
          : 'Failed to start manual retry'
      },
      { status: 500 }
    );
  }
}
