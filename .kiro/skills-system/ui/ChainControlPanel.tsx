/**
 * Chain Control Panel Component
 * 
 * Provides control buttons for managing skill chain execution:
 * Retry, Skip, Abort buttons, error details display, and resume from checkpoint.
 * 
 * @example
 * ```tsx
 * <ChainControlPanel
 *   chain={skillChain}
 *   currentStep={2}
 *   onRetry={(stepIndex) => retryStep(stepIndex)}
 *   onSkip={(stepIndex) => skipStep(stepIndex)}
 *   onAbort={() => abortChain()}
 *   onResume={(checkpointId) => resumeFromCheckpoint(checkpointId)}
 * />
 * ```
 */

import React, { useState } from 'react';
import type { SkillChain, SkillChainStep } from './SkillChainDiagram';

export interface ChainControlPanelProps {
  /** Skill chain being executed */
  chain: SkillChain;
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback to retry a failed step */
  onRetry: (stepIndex: number) => void;
  /** Callback to skip a step */
  onSkip: (stepIndex: number) => void;
  /** Callback to abort the entire chain */
  onAbort: () => void;
  /** Callback to resume from a checkpoint */
  onResume?: (checkpointId: string) => void;
  /** Available checkpoints */
  checkpoints?: Checkpoint[];
  /** Whether chain is currently executing */
  isExecuting?: boolean;
}

export interface Checkpoint {
  /** Checkpoint ID */
  id: string;
  /** Step index where checkpoint was created */
  stepIndex: number;
  /** Timestamp */
  timestamp: Date;
  /** Description */
  description?: string;
}

/**
 * ChainControlPanel Component
 * 
 * Provides controls for managing skill chain execution with retry, skip,
 * abort, and resume capabilities.
 */
export function ChainControlPanel({
  chain,
  currentStep,
  onRetry,
  onSkip,
  onAbort,
  onResume,
  checkpoints = [],
  isExecuting = false,
}: ChainControlPanelProps) {
  const [showCheckpoints, setShowCheckpoints] = useState(false);
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);

  const currentStepData = chain.steps[currentStep];
  const hasFailedStep = currentStepData?.status === 'failed';
  const canRetry = hasFailedStep && !isExecuting;
  const canSkip = hasFailedStep && !isExecuting;
  const canResume = checkpoints.length > 0 && !isExecuting;

  const handleAbort = () => {
    if (showAbortConfirm) {
      onAbort();
      setShowAbortConfirm(false);
    } else {
      setShowAbortConfirm(true);
    }
  };

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Chain Controls
        </h3>
      </div>

      {/* Body */}
      <div className="space-y-4 px-4 py-4">
        {/* Error Details (if current step failed) */}
        {hasFailedStep && currentStepData.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="flex items-start gap-2">
              <span className="text-lg" role="img" aria-hidden="true">
                ⚠️
              </span>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold text-red-900">
                  Step {currentStep + 1} Failed
                </h4>
                <p className="text-xs text-red-700">
                  {currentStepData.action}
                </p>
                <div className="rounded bg-white bg-opacity-50 p-2">
                  <p className="text-xs font-mono text-red-800">
                    {currentStepData.error}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Retry Button */}
          <button
            onClick={() => onRetry(currentStep)}
            disabled={!canRetry}
            className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              canRetry
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500'
                : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            }`}
            aria-label="Retry failed step"
          >
            <span role="img" aria-hidden="true">
              🔄
            </span>
            Retry
          </button>

          {/* Skip Button */}
          <button
            onClick={() => onSkip(currentStep)}
            disabled={!canSkip}
            className={`flex items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              canSkip
                ? 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 focus:ring-yellow-500'
                : 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            }`}
            aria-label="Skip failed step"
          >
            <span role="img" aria-hidden="true">
              ⏭️
            </span>
            Skip
          </button>
        </div>

        {/* Abort Button */}
        <button
          onClick={handleAbort}
          disabled={!isExecuting && !showAbortConfirm}
          className={`flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            showAbortConfirm
              ? 'border-red-600 bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
              : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-500'
          }`}
          aria-label={showAbortConfirm ? 'Confirm abort chain' : 'Abort chain'}
        >
          <span role="img" aria-hidden="true">
            ⏹️
          </span>
          {showAbortConfirm ? 'Click Again to Confirm Abort' : 'Abort Chain'}
        </button>

        {showAbortConfirm && (
          <p className="text-center text-xs text-gray-500">
            This will stop the chain execution immediately
          </p>
        )}

        {/* Resume from Checkpoint */}
        {canResume && (
          <div className="space-y-2">
            <button
              onClick={() => setShowCheckpoints(!showCheckpoints)}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-expanded={showCheckpoints}
              aria-controls="checkpoints-list"
            >
              <span className="flex items-center gap-2">
                <span role="img" aria-hidden="true">
                  💾
                </span>
                Resume from Checkpoint
              </span>
              <span>{showCheckpoints ? '▼' : '▶'}</span>
            </button>

            {showCheckpoints && onResume && (
              <div
                id="checkpoints-list"
                className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                {checkpoints.map((checkpoint) => (
                  <button
                    key={checkpoint.id}
                    onClick={() => {
                      onResume(checkpoint.id);
                      setShowCheckpoints(false);
                    }}
                    className="flex w-full items-start gap-2 rounded border border-gray-300 bg-white p-2 text-left text-xs transition-colors hover:bg-gray-50"
                  >
                    <span className="font-mono text-gray-500">
                      Step {checkpoint.stepIndex + 1}
                    </span>
                    <div className="flex-1">
                      {checkpoint.description && (
                        <p className="text-gray-700">
                          {checkpoint.description}
                        </p>
                      )}
                      <p className="text-gray-500">
                        {checkpoint.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Status Info */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Current Step:</span>
              <span className="font-medium">
                {currentStep + 1} / {chain.steps.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium capitalize">
                {currentStepData?.status || 'Unknown'}
              </span>
            </div>
            {isExecuting && (
              <div className="flex justify-between">
                <span>Executing:</span>
                <span className="font-medium text-blue-600">Yes</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
