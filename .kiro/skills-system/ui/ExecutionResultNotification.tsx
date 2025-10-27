/**
 * Execution Result Notification Component
 * 
 * Displays a notification when script execution completes (success or error).
 * Shows a summary of results and provides a button to view detailed information.
 * 
 * @example Success
 * ```tsx
 * <ExecutionResultNotification
 *   result={{
 *     success: true,
 *     scriptName: 'suspect:test',
 *     summary: 'All tests passed successfully',
 *     details: 'Tested 5 emotional states, all responses valid'
 *   }}
 *   onViewDetails={() => showDetails()}
 *   onDismiss={() => closeNotification()}
 * />
 * ```
 * 
 * @example Error
 * ```tsx
 * <ExecutionResultNotification
 *   result={{
 *     success: false,
 *     scriptName: 'case:generate',
 *     summary: 'Script execution failed',
 *     error: 'Missing required environment variable: GEMINI_API_KEY'
 *   }}
 *   onViewDetails={() => showErrorDetails()}
 *   onDismiss={() => closeNotification()}
 * />
 * ```
 */

import React from 'react';

export interface ExecutionResult {
  /** Whether execution was successful */
  success: boolean;
  /** Name of the executed script */
  scriptName: string;
  /** Brief summary of the result */
  summary: string;
  /** Detailed information (for success) */
  details?: string;
  /** Error message (for failure) */
  error?: string;
  /** Execution duration in seconds */
  duration?: number;
  /** Files modified during execution */
  filesModified?: string[];
}

export interface ExecutionResultNotificationProps {
  /** Execution result */
  result: ExecutionResult;
  /** Callback when user clicks View Details */
  onViewDetails?: () => void;
  /** Callback when user dismisses notification */
  onDismiss: () => void;
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number;
}

/**
 * ExecutionResultNotification Component
 * 
 * A notification component that displays the result of script execution,
 * showing success or error state with relevant information.
 */
export function ExecutionResultNotification({
  result,
  onViewDetails,
  onDismiss,
  autoDismiss = 0,
}: ExecutionResultNotificationProps) {
  // Auto-dismiss timer
  React.useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  const getNotificationStyles = () => {
    if (result.success) {
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconBgColor: 'bg-green-100',
        iconColor: 'text-green-600',
        icon: '✅',
        titleColor: 'text-green-900',
        textColor: 'text-green-700',
      };
    } else {
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconBgColor: 'bg-red-100',
        iconColor: 'text-red-600',
        icon: '❌',
        titleColor: 'text-red-900',
        textColor: 'text-red-700',
      };
    }
  };

  const styles = getNotificationStyles();

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm ${styles.bgColor} ${styles.borderColor}`}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBgColor}`}
      >
        <span
          className={`text-lg ${styles.iconColor}`}
          role="img"
          aria-hidden="true"
        >
          {styles.icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-2">
        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
            {result.success ? 'Execution Successful' : 'Execution Failed'}
          </h4>
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 rounded p-1 transition-colors hover:bg-black hover:bg-opacity-5 ${styles.iconColor}`}
            aria-label="Dismiss notification"
          >
            <span role="img" aria-hidden="true">
              ✕
            </span>
          </button>
        </div>

        {/* Script Name */}
        <p className={`text-xs font-mono ${styles.textColor}`}>
          {result.scriptName}
        </p>

        {/* Summary */}
        <p className={`text-sm ${styles.textColor}`}>{result.summary}</p>

        {/* Details or Error */}
        {result.success && result.details && (
          <p className={`text-xs ${styles.textColor}`}>{result.details}</p>
        )}

        {!result.success && result.error && (
          <div className="rounded bg-white bg-opacity-50 p-2">
            <p className={`text-xs font-mono ${styles.textColor}`}>
              {result.error}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {result.duration !== undefined && (
            <span className={styles.textColor}>
              Duration: {formatDuration(result.duration)}
            </span>
          )}

          {result.filesModified && result.filesModified.length > 0 && (
            <span className={styles.textColor}>
              {result.filesModified.length} file
              {result.filesModified.length !== 1 ? 's' : ''} modified
            </span>
          )}
        </div>

        {/* Actions */}
        {onViewDetails && (
          <div className="pt-1">
            <button
              onClick={onViewDetails}
              className={`text-xs font-medium underline transition-colors hover:no-underline ${styles.iconColor}`}
              aria-label="View detailed execution results"
            >
              View Details →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
