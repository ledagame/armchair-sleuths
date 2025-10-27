/**
 * Rollback Dialog Component
 * 
 * Displays file changes diff and allows users to confirm rollback to previous state.
 * Shows what will be reverted before applying the rollback.
 * 
 * @example
 * ```tsx
 * <RollbackDialog
 *   changes={[
 *     {
 *       path: 'skills/my-skill/SKILL.yaml',
 *       operation: 'modify',
 *       before: 'version: 1.0.0',
 *       after: 'version: 1.1.0'
 *     },
 *     {
 *       path: 'skills/my-skill/scripts/new-script.ts',
 *       operation: 'create',
 *       after: 'console.log("Hello");'
 *     }
 *   ]}
 *   onConfirm={() => performRollback()}
 *   onCancel={() => closeDialog()}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface FileChange {
  /** File path */
  path: string;
  /** Type of change */
  operation: 'create' | 'modify' | 'delete';
  /** Content before change (for modify/delete) */
  before?: string;
  /** Content after change (for create/modify) */
  after?: string;
}

export interface RollbackDialogProps {
  /** List of file changes to rollback */
  changes: FileChange[];
  /** Callback when user confirms rollback */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Whether the dialog is open */
  isOpen?: boolean;
  /** Checkpoint description */
  checkpointDescription?: string;
}

/**
 * RollbackDialog Component
 * 
 * A modal dialog that shows file changes and requests confirmation
 * before rolling back to a previous state.
 */
export function RollbackDialog({
  changes,
  onConfirm,
  onCancel,
  isOpen = true,
  checkpointDescription,
}: RollbackDialogProps) {
  const [selectedChange, setSelectedChange] = useState<number | null>(null);

  if (!isOpen) return null;

  const getOperationIcon = (operation: FileChange['operation']) => {
    switch (operation) {
      case 'create':
        return '➕';
      case 'modify':
        return '✏️';
      case 'delete':
        return '🗑️';
    }
  };

  const getOperationLabel = (operation: FileChange['operation']) => {
    switch (operation) {
      case 'create':
        return 'Created';
      case 'modify':
        return 'Modified';
      case 'delete':
        return 'Deleted';
    }
  };

  const getOperationColor = (operation: FileChange['operation']) => {
    switch (operation) {
      case 'create':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'modify':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'delete':
        return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  const renderDiff = (change: FileChange) => {
    if (change.operation === 'create') {
      return (
        <div className="rounded bg-green-50 p-3">
          <p className="text-xs font-semibold text-green-900">
            This file will be deleted:
          </p>
          <pre className="mt-2 max-h-32 overflow-auto text-xs text-green-800">
            {change.after}
          </pre>
        </div>
      );
    }

    if (change.operation === 'delete') {
      return (
        <div className="rounded bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-900">
            This file will be restored:
          </p>
          <pre className="mt-2 max-h-32 overflow-auto text-xs text-red-800">
            {change.before}
          </pre>
        </div>
      );
    }

    // Modify operation
    return (
      <div className="space-y-2">
        <div className="rounded bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-900">- Before:</p>
          <pre className="mt-1 max-h-24 overflow-auto text-xs text-red-800">
            {change.before}
          </pre>
        </div>
        <div className="rounded bg-green-50 p-3">
          <p className="text-xs font-semibold text-green-900">+ After:</p>
          <pre className="mt-1 max-h-24 overflow-auto text-xs text-green-800">
            {change.after}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2
            id="dialog-title"
            className="text-lg font-semibold text-gray-900"
          >
            Confirm Rollback
          </h2>
          {checkpointDescription && (
            <p className="mt-1 text-sm text-gray-600">
              {checkpointDescription}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* File List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Changes ({changes.length})
              </h3>
              <ul className="mt-2 space-y-1">
                {changes.map((change, index) => (
                  <li key={index}>
                    <button
                      onClick={() => setSelectedChange(index)}
                      className={`flex w-full items-start gap-2 rounded p-2 text-left text-xs transition-colors ${
                        selectedChange === index
                          ? 'bg-blue-100'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <span role="img" aria-hidden="true">
                        {getOperationIcon(change.operation)}
                      </span>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-mono text-gray-900">
                          {change.path.split('/').pop()}
                        </p>
                        <p className="truncate text-gray-500">
                          {change.path}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Diff View */}
          <div className="flex-1 overflow-y-auto p-4">
            {selectedChange !== null ? (
              <div className="space-y-3">
                {/* File Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getOperationColor(
                        changes[selectedChange].operation
                      )}`}
                    >
                      {getOperationLabel(changes[selectedChange].operation)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-mono text-gray-900">
                    {changes[selectedChange].path}
                  </p>
                </div>

                {/* Diff */}
                {renderDiff(changes[selectedChange])}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Select a file to view changes
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="border-t border-yellow-200 bg-yellow-50 px-6 py-3">
          <div className="flex items-start gap-2">
            <span className="text-lg" role="img" aria-hidden="true">
              ⚠️
            </span>
            <p className="text-xs text-yellow-800">
              <strong>Warning:</strong> This will revert all changes made since
              the checkpoint. This action cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Cancel rollback"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Confirm rollback"
          >
            Confirm Rollback
          </button>
        </div>
      </div>
    </div>
  );
}
