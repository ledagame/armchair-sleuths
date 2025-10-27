/**
 * Progress Indicator Component
 * 
 * Displays real-time progress of script execution with progress bar,
 * current step display, collapsible output panel, and cancel button.
 * 
 * @example
 * ```tsx
 * <ProgressIndicator
 *   execution={{
 *     executionId: '123',
 *     status: 'running',
 *     progress: 60,
 *     currentStep: 'Testing emotional states',
 *     output: ['Testing COOPERATIVE state...', '✓ Test passed']
 *   }}
 *   onCancel={() => cancelExecution('123')}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface ExecutionStatus {
  /** Unique execution ID */
  executionId: string;
  /** Current status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** Progress percentage (0-100) */
  progress: number;
  /** Current step description */
  currentStep: string;
  /** Output lines */
  output: string[];
  /** Script name */
  scriptName?: string;
}

export interface ProgressIndicatorProps {
  /** Execution status */
  execution: ExecutionStatus;
  /** Callback when user cancels execution */
  onCancel: () => void;
  /** Whether to show output by default */
  defaultOutputExpanded?: boolean;
}

/**
 * ProgressIndicator Component
 * 
 * Shows real-time progress of script execution with a progress bar,
 * current step information, and collapsible output panel.
 */
export function ProgressIndicator({
  execution,
  onCancel,
  defaultOutputExpanded = false,
}: ProgressIndicatorProps) {
  const [isOutputExpanded, setIsOutputExpanded] = useState(
    defaultOutputExpanded
  );

  const getStatusColor = () => {
    switch (execution.status) {
      case 'running':
        return 'bg-blue-600';
      case 'completed':
        return 'bg-green-600';
      case 'failed':
        return 'bg-red-600';
      case 'cancelled':
        return 'bg-gray-600';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (execution.status) {
      case 'running':
        return '▶️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⏹️';
      default:
        return '⏸️';
    }
  };

  const getStatusLabel = () => {
    switch (execution.status) {
      case 'running':
        return 'Running';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Pending';
    }
  };

  const isRunning = execution.status === 'running';
  const isComplete =
    execution.status === 'completed' ||
    execution.status === 'failed' ||
    execution.status === 'cancelled';

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span role="img" aria-hidden="true">
              {getStatusIcon()}
            </span>
            <h3 className="text-sm font-semibold text-gray-900">
              {getStatusLabel()}:{' '}
              {execution.scriptName || execution.executionId}
            </h3>
          </div>
          {isRunning && (
            <span className="text-xs text-gray-500">
              {execution.progress}%
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4 px-4 py-4">
        {/* Progress Bar */}
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-300 ${getStatusColor()}`}
              style={{ width: `${execution.progress}%` }}
              role="progressbar"
              aria-valuenow={execution.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress: ${execution.progress}%`}
            />
          </div>
        </div>

        {/* Current Step */}
        {execution.currentStep && (
          <div>
            <label className="text-xs font-medium text-gray-500">
              Current:
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {execution.currentStep}
            </p>
          </div>
        )}

        {/* Output Panel */}
        {execution.output.length > 0 && (
          <div>
            <button
              onClick={() => setIsOutputExpanded(!isOutputExpanded)}
              className="flex w-full items-center justify-between text-left text-xs font-medium text-gray-500 hover:text-gray-700"
              aria-expanded={isOutputExpanded}
              aria-controls="output-panel"
            >
              <span>
                {isOutputExpanded ? '▼' : '▶'} Output (
                {execution.output.length} lines)
              </span>
            </button>

            {isOutputExpanded && (
              <div
                id="output-panel"
                className="mt-2 max-h-48 overflow-y-auto rounded border border-gray-200 bg-gray-50 p-3"
              >
                <pre className="text-xs font-mono text-gray-700">
                  {execution.output.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap">
                      {line}
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {isRunning && (
        <div className="border-t border-gray-200 px-4 py-3">
          <button
            onClick={onCancel}
            className="w-full rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Cancel execution"
          >
            Cancel Execution
          </button>
        </div>
      )}

      {isComplete && (
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-center text-xs text-gray-500">
            Execution {execution.status} at{' '}
            {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
