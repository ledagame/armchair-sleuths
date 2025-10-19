/**
 * LoadingState.tsx
 *
 * Loading UI for cinematic image generation
 * Displays loading spinner, status updates, and retry button
 */

import React, { useState } from 'react';
import type { ImageGenerationStatus, ImageGenerationMeta } from '@/shared/types/index';

interface LoadingStateProps {
  /** Current generation status */
  status: ImageGenerationStatus;
  /** Generation metadata with progress info */
  meta?: ImageGenerationMeta;
  /** Case ID for retry functionality */
  caseId: string;
  /** Callback when retry is triggered (optional) */
  onRetry?: () => void;
}

/**
 * Get status message based on generation status
 */
function getStatusMessage(status: ImageGenerationStatus, meta?: ImageGenerationMeta): string {
  switch (status) {
    case 'pending':
      return '시네마틱 인트로 준비 중...';
    case 'generating':
      // Show progress if available
      if (meta?.progress) {
        const completed = Object.values(meta.progress).filter(s => s === 'completed').length;
        const total = 3; // 3 scenes
        return `시네마틱 이미지 생성 중... (${completed}/${total})`;
      }
      return '시네마틱 이미지 생성 중...';
    case 'partial':
      return '일부 이미지 생성 완료';
    case 'failed':
      return '이미지 생성 실패';
    case 'completed':
      return '시네마틱 인트로 준비 완료';
    default:
      return '로딩 중...';
  }
}

/**
 * LoadingState Component
 *
 * Shows a loading spinner with status message while cinematic images are being generated
 *
 * @example
 * ```tsx
 * <LoadingState status="generating" meta={meta} caseId={caseId} />
 * ```
 */
export function LoadingState({ status, meta, caseId, onRetry }: LoadingStateProps) {
  const message = getStatusMessage(status, meta);
  const [isRetrying, setIsRetrying] = useState(false);

  /**
   * Handle manual retry
   */
  const handleRetry = async () => {
    try {
      setIsRetrying(true);

      const response = await fetch(`/api/cases/${caseId}/retry-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: false })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('[LoadingState] Manual retry initiated');

      // Call optional callback
      if (onRetry) {
        onRetry();
      }

      // Reset retrying state after a short delay
      setTimeout(() => {
        setIsRetrying(false);
      }, 2000);

    } catch (error) {
      console.error('[LoadingState] Retry failed:', error);
      setIsRetrying(false);
      alert('재시도 요청 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Loading Spinner */}
      <div className="relative w-16 h-16 mb-8">
        <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>

      {/* Status Message */}
      <p className="text-xl text-slate-300 mb-4 animate-pulse">
        {message}
      </p>

      {/* Scene Progress (if available) */}
      {meta?.progress && (
        <div className="mt-6 w-full max-w-md">
          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{
                width: `${(
                  (meta.progress.establishing === 'completed' ? 33 : 0) +
                  (meta.progress.confrontation === 'completed' ? 33 : 0) +
                  (meta.progress.action === 'completed' ? 34 : 0)
                )}%`
              }}
            />
          </div>

          {/* Scene Status List */}
          <div className="space-y-2">
            {/* Establishing Scene */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-colors flex-shrink-0 ${
                meta.progress.establishing === 'completed'
                  ? 'bg-green-500'
                  : meta.progress.establishing === 'generating'
                  ? 'bg-amber-500 animate-pulse'
                  : meta.progress.establishing === 'failed'
                  ? 'bg-red-500'
                  : 'bg-slate-600'
              }`} />
              <span className={`text-sm transition-colors ${
                meta.progress.establishing === 'completed'
                  ? 'text-green-400'
                  : meta.progress.establishing === 'generating'
                  ? 'text-amber-400'
                  : meta.progress.establishing === 'failed'
                  ? 'text-red-400'
                  : 'text-slate-500'
              }`}>
                범죄 현장 발견 씬
              </span>
            </div>

            {/* Confrontation Scene */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-colors flex-shrink-0 ${
                meta.progress.confrontation === 'completed'
                  ? 'bg-green-500'
                  : meta.progress.confrontation === 'generating'
                  ? 'bg-amber-500 animate-pulse'
                  : meta.progress.confrontation === 'failed'
                  ? 'bg-red-500'
                  : 'bg-slate-600'
              }`} />
              <span className={`text-sm transition-colors ${
                meta.progress.confrontation === 'completed'
                  ? 'text-green-400'
                  : meta.progress.confrontation === 'generating'
                  ? 'text-amber-400'
                  : meta.progress.confrontation === 'failed'
                  ? 'text-red-400'
                  : 'text-slate-500'
              }`}>
                증거 대면 씬
              </span>
            </div>

            {/* Action Scene */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full transition-colors flex-shrink-0 ${
                meta.progress.action === 'completed'
                  ? 'bg-green-500'
                  : meta.progress.action === 'generating'
                  ? 'bg-amber-500 animate-pulse'
                  : meta.progress.action === 'failed'
                  ? 'bg-red-500'
                  : 'bg-slate-600'
              }`} />
              <span className={`text-sm transition-colors ${
                meta.progress.action === 'completed'
                  ? 'text-green-400'
                  : meta.progress.action === 'generating'
                  ? 'text-amber-400'
                  : meta.progress.action === 'failed'
                  ? 'text-red-400'
                  : 'text-slate-500'
              }`}>
                수사 시작 씬
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Additional Info for Failed/Partial States */}
      {status === 'failed' && meta?.failureReason && (
        <p className="text-sm text-red-400 mt-4 max-w-md text-center">
          오류: {meta.failureReason}
        </p>
      )}

      {status === 'partial' && (
        <p className="text-sm text-amber-400 mt-4 max-w-md text-center">
          일부 이미지만 생성되었습니다. 계속 진행합니다.
        </p>
      )}

      {/* Retry Button (show for failed or partial states) */}
      {(status === 'failed' || status === 'partial') && (
        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className={`mt-6 px-6 py-3 rounded-lg font-semibold transition-all ${
            isRetrying
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
          }`}
        >
          {isRetrying ? '재시도 중...' : '다시 시도'}
        </button>
      )}
    </div>
  );
}
