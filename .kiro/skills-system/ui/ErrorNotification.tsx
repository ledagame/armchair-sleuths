/**
 * Error Notification Component
 * 
 * Displays error messages with troubleshooting suggestions and help links.
 * Used for general error notifications throughout the skill system.
 * 
 * @example
 * ```tsx
 * <ErrorNotification
 *   error={{
 *     title: 'Skill Activation Failed',
 *     message: 'Could not activate suspect-ai-prompter',
 *     details: 'Missing required dependency: gemini-image-generator',
 *     suggestions: [
 *       'Install the missing skill',
 *       'Check skill dependencies in SKILL.yaml'
 *     ],
 *     helpUrl: 'https://docs.kiro.dev/skills/troubleshooting'
 *   }}
 *   onDismiss={() => closeNotification()}
 * />
 * ```
 */

import React from 'react';

export interface ErrorInfo {
  /** Error title */
  title: string;
  /** Error message */
  message: string;
  /** Detailed error information */
  details?: string;
  /** Troubleshooting suggestions */
  suggestions?: string[];
  /** Link to help documentation */
  helpUrl?: string;
  /** Error code (for reference) */
  code?: string;
}

export interface ErrorNotificationProps {
  /** Error information */
  error: ErrorInfo;
  /** Callback when user dismisses notification */
  onDismiss: () => void;
  /** Auto-dismiss after milliseconds (0 = no auto-dismiss) */
  autoDismiss?: number;
  /** Severity level */
  severity?: 'error' | 'warning';
}

/**
 * ErrorNotification Component
 * 
 * A notification component for displaying errors with helpful troubleshooting
 * information and links to documentation.
 */
export function ErrorNotification({
  error,
  onDismiss,
  autoDismiss = 0,
  severity = 'error',
}: ErrorNotificationProps) {
  // Auto-dismiss timer
  React.useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(onDismiss, autoDismiss);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, onDismiss]);

  const getStyles = () => {
    if (severity === 'warning') {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconBgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        icon: '⚠️',
        titleColor: 'text-yellow-900',
        textColor: 'text-yellow-700',
        linkColor: 'text-yellow-800 hover:text-yellow-900',
      };
    }

    return {
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      icon: '❌',
      titleColor: 'text-red-900',
      textColor: 'text-red-700',
      linkColor: 'text-red-800 hover:text-red-900',
    };
  };

  const styles = getStyles();

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-4 shadow-sm ${styles.bgColor} ${styles.borderColor}`}
      role="alert"
      aria-live="assertive"
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
      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className={`text-sm font-semibold ${styles.titleColor}`}>
              {error.title}
            </h4>
            {error.code && (
              <p className={`mt-0.5 text-xs font-mono ${styles.textColor}`}>
                Error Code: {error.code}
              </p>
            )}
          </div>
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

        {/* Message */}
        <p className={`text-sm ${styles.textColor}`}>{error.message}</p>

        {/* Details */}
        {error.details && (
          <div className="rounded bg-white bg-opacity-50 p-3">
            <p className={`text-xs font-mono ${styles.textColor}`}>
              {error.details}
            </p>
          </div>
        )}

        {/* Troubleshooting Suggestions */}
        {error.suggestions && error.suggestions.length > 0 && (
          <div>
            <h5 className={`text-xs font-semibold ${styles.titleColor}`}>
              💡 Troubleshooting Suggestions:
            </h5>
            <ul className={`mt-2 space-y-1 text-xs ${styles.textColor}`}>
              {error.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Help Link */}
        {error.helpUrl && (
          <div className="pt-1">
            <a
              href={error.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-xs font-medium underline transition-colors hover:no-underline ${styles.linkColor}`}
            >
              View Help Documentation
              <span role="img" aria-hidden="true">
                →
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
