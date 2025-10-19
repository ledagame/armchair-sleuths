/**
 * 백그라운드 시네마틱 이미지 생성 트리거 엔드포인트
 *
 * POST /api/cases/[caseId]/background-images
 * - Fire-and-forget 패턴으로 백그라운드 작업 시작
 * - 즉시 202 Accepted 응답 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { CinematicBackgroundService } from '@/server/services/background/CinematicBackgroundService';
import { GeminiClient } from '@/server/services/gemini/GeminiClient';
import { CaseRepository } from '@/server/services/repositories/kv/CaseRepository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<NextResponse> {
  try {
    const { caseId } = await params;

    // Validate caseId
    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // 케이스 존재 여부 확인
    const exists = await CaseRepository.caseExists(caseId);
    if (!exists) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // 백그라운드 이미지 생성 서비스 초기화
    const geminiClient = new GeminiClient();
    const backgroundService = new CinematicBackgroundService(geminiClient);

    // Fire-and-forget: 백그라운드에서 비동기 실행
    // 주의: await을 사용하지 않음!
    backgroundService.generateCinematicImages(caseId).catch((error) => {
      console.error(`[Background] Image generation failed for case ${caseId}:`, error);
    });

    // 즉시 응답 반환 (타임아웃 방지)
    return NextResponse.json(
      {
        message: 'Background image generation started',
        caseId,
        status: 'generating'
      },
      { status: 202 } // 202 Accepted
    );

  } catch (error) {
    console.error('Error starting background image generation:', error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to start background image generation'
      },
      { status: 500 }
    );
  }
}
