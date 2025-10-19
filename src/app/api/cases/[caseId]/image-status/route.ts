/**
 * 시네마틱 이미지 생성 상태 조회 엔드포인트
 *
 * GET /api/cases/[caseId]/image-status
 * - 클라이언트 폴링용
 * - 이미지 생성 상태, 완성된 이미지, 메타데이터 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { CaseRepository } from '@/server/services/repositories/kv/CaseRepository';
import type { ImageGenerationStatus, CinematicImages, ImageGenerationMeta } from '@/shared/types/index';

interface ImageStatusResponse {
  status: ImageGenerationStatus;
  images: CinematicImages | null;
  meta?: ImageGenerationMeta;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<NextResponse<ImageStatusResponse>> {
  try {
    const { caseId } = await params;

    // Validate caseId
    if (!caseId) {
      return NextResponse.json(
        {
          status: 'failed' as ImageGenerationStatus,
          images: null,
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
          status: 'failed' as ImageGenerationStatus,
          images: null,
          error: 'Case not found'
        },
        { status: 404 }
      );
    }

    // 이미지 생성 상태 조회
    const imageStatus = await CaseRepository.getImageGenerationStatus(caseId);

    // 상태 정보 반환
    return NextResponse.json({
      status: imageStatus.status,
      images: imageStatus.images,
      meta: imageStatus.meta
    });

  } catch (error) {
    console.error('Error fetching image generation status:', error);

    return NextResponse.json(
      {
        status: 'failed' as ImageGenerationStatus,
        images: null,
        error: error instanceof Error
          ? error.message
          : 'Failed to fetch image generation status'
      },
      { status: 500 }
    );
  }
}
