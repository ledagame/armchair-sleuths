/**
 * Validation Error Panel Component
 * 
 * Displays validation errors for skills with inline annotations and fix suggestions.
 * Provides a "Fix Skill" button to help users resolve issues.
 * 
 * @example
 * ```tsx
 * <ValidationErrorPanel
 *   skillName="my-skill"
 *   errors={[
 *     {
 *       field: 'metadata.name',
 *       message: 'Skill name must be in kebab-case',
 *       severity: 'error',
 *       line: 5,
 *       suggestion: 'Change "MySkill" to "my-skill"'
 *     },
 *     {
 *       field: 'metadata.triggers',
 *       message: 'At least one trigger keyword is required',
 *       severity: 'error',
 *       line: 12
 *     }
 *   ]}
 *   onFixSkill={() => openSkillFile()}
 *   onDismiss={() => closePanel()}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface ValidationError {
  /** Field that has the error */
  field: string;
  /** Error message */
  message: string;
  /** Error severity */
  severity: 'error' | 'warning';
  /** Line number in file (if applicable) */
  line?: number;
  /** Column number in file (if applicable) */
  column?: number;
  /** Suggestion for fixing the error */
  suggestion?: string;
  /** File path where error occurred */
  file?: string;
}

export interface ValidationErrorPanelProps {
  /** Name of the skill with errors */
  skillName: string;
  /** List of validation errors */
  errors: ValidationError[];
  /** Callback when user clicks Fix Skill button */
  onFixSkill: () => void;
  /** Callback when user dismisses panel */
  onDismiss: () => void;
  /** Whether to show compact view */
  compact?: boolean;
}

/**
 * ValidationErrorPanel Component
 * 
 * Displays validation errors with inline annotations and provides
 * quick actions to help users fix issues.
 */
export function ValidationErrorPanel({
  skillName,
  errors,
  onFixSkill,
  onDismiss,
  compact = false,
}: ValidationErrorPanelProps) {
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(
    new Set()
  );

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  const toggleError = (index: number) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedErrors(newExpanded);
  };

  const getErrorIcon = (severity: ValidationError['severity']) => {
    return severity === 'error' ? '❌' : '⚠️';
  };

  const getErrorStyles = (severity: ValidationError['severity']) => {
    if (severity === 'warning') {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-900',
        iconColor: 'text-yellow-600',
      };
    }
    return {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600',
    };
  };

  return (
    <div className="w-full rounded-lg border border-red-200 bg-red-50 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-red-200 px-4 py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-hidden="true">
              🔍
            </span>
            <h3 className="text-sm font-semibold text-red-900">
              Validation Errors: {skillName}
            </h3>
          </div>
          <p className="mt-1 text-xs text-red-700">
            {errorCount} error{errorCount !== 1 ? 's' : ''}
            {warningCount > 0 &&
              `, ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-1 text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label="Dismiss panel"
        >
          <span role="img" aria-hidden="true">
            ✕
          </span>
        </button>
      </div>

      {/* Error List */}
      <div className="max-h-96 overflow-y-auto px-4 py-3">
        <ul className="space-y-2">
          {errors.map((error, index) => {
            const styles = getErrorStyles(error.severity);
            const isExpanded = expandedErrors.has(index);

            return (
              <li
                key={index}
                className={`rounded-lg border p-3 ${styles.bgColor} ${styles.borderColor}`}
              >
                <button
                  onClick={() => toggleError(index)}
                  className="flex w-full items-start gap-2 text-left"
                  aria-expanded={isExpanded}
                >
                  {/* Icon */}
                  <span
                    className={`text-base ${styles.iconColor}`}
                    role="img"
                    aria-hidden="true"
                  >
                    {getErrorIcon(error.severity)}
                  </span>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-medium ${styles.textColor}`}>
                        {error.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </div>

                    {/* Field and Location */}
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                      <span className="font-mono">{error.field}</span>
                      {error.line !== undefined && (
                        <span>
                          Line {error.line}
                          {error.column !== undefined && `:${error.column}`}
                        </span>
                      )}
                      {error.file && (
                        <span className="font-mono">{error.file}</span>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && error.suggestion && (
                      <div className="mt-3 rounded bg-white bg-opacity-50 p-2">
                        <p className="text-xs font-semibold text-gray-700">
                          💡 Suggestion:
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {error.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-red-200 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-red-700">
            Fix these issues to use this skill
          </p>
          <button
            onClick={onFixSkill}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            aria-label="Open skill file to fix errors"
          >
            Fix Skill
          </button>
        </div>
      </div>
    </div>
  );
}
