/**
 * Script Execution Dialog Component
 * 
 * Displays a confirmation dialog before executing a skill script.
 * Shows script details, required permissions, and estimated duration.
 * 
 * @example
 * ```tsx
 * <ScriptExecutionDialog
 *   script={{
 *     name: 'suspect:test',
 *     command: 'tsx scripts/test.ts',
 *     permissions: ['read:./skills/suspect-prompter', 'execute:npm/tsx'],
 *     estimatedDuration: 30
 *   }}
 *   onConfirm={() => executeScript()}
 *   onCancel={() => closeDialog()}
 * />
 * ```
 */

import React from 'react';

export interface Script {
  /** Name of the script */
  name: string;
  /** Command to execute */
  command: string;
  /** Description of what the script does */
  description?: string;
  /** Required permissions */
  permissions: string[];
  /** Estimated duration in seconds */
  estimatedDuration?: number;
  /** Working directory */
  workingDir?: string;
}

export interface ScriptExecutionDialogProps {
  /** Script to execute */
  script: Script;
  /** Callback when user confirms execution */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Whether the dialog is open */
  isOpen?: boolean;
}

/**
 * ScriptExecutionDialog Component
 * 
 * A modal dialog that displays script execution details and requests
 * user confirmation before proceeding with execution.
 */
export function ScriptExecutionDialog({
  script,
  onConfirm,
  onCancel,
  isOpen = true,
}: ScriptExecutionDialogProps) {
  if (!isOpen) return null;

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    if (seconds < 60) return `~${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `~${minutes}m ${remainingSeconds}s`
      : `~${minutes}m`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-gray-900"
          >
            Confirm Script Execution
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-4 px-6 py-4">
          {/* Script Info */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Script:
            </label>
            <p className="mt-1 text-base font-mono text-gray-900">
              {script.name}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Command:
            </label>
            <p className="mt-1 text-sm font-mono text-gray-600">
              {script.command}
            </p>
          </div>

          {script.description && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Description:
              </label>
              <p className="mt-1 text-sm text-gray-600">
                {script.description}
              </p>
            </div>
          )}

          {/* Required Permissions */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <span role="img" aria-hidden="true">
                🔒
              </span>
              Required Permissions:
            </label>
            <ul className="mt-2 space-y-1">
              {script.permissions.map((permission, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <span className="mt-0.5">•</span>
                  <span className="font-mono">{permission}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Estimated Duration */}
          {script.estimatedDuration !== undefined && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span role="img" aria-hidden="true">
                  ⏱️
                </span>
                Estimated Duration:
              </label>
              <p className="mt-1 text-sm text-gray-600">
                {formatDuration(script.estimatedDuration)}
              </p>
            </div>
          )}

          {/* Working Directory */}
          {script.workingDir && (
            <div>
              <label className="text-sm font-medium text-gray-700">
                Working Directory:
              </label>
              <p className="mt-1 text-sm font-mono text-gray-600">
                {script.workingDir}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Cancel script execution"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Confirm script execution"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
