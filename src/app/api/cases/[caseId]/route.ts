import { NextRequest, NextResponse } from 'next/server';
import { KVStoreManager } from '@/server/services/kv/KVStoreManager';
import type { CaseData } from '@/types/game';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<NextResponse<CaseData | { error: string }>> {
  try {
    const { caseId } = await params;

    // Validate caseId
    if (!caseId) {
      return NextResponse.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Get case data from KV store
    const caseData = await KVStoreManager.getCase(caseId);

    // Return 404 if case not found
    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Return complete case data
    return NextResponse.json(caseData);

  } catch (error) {
    console.error('Error fetching case data:', error);

    return NextResponse.json(
      {
        error: error instanceof Error
          ? error.message
          : 'Failed to fetch case data'
      },
      { status: 500 }
    );
  }
}