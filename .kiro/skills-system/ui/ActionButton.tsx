/**
 * Action Button Component
 * 
 * Displays a clickable button for executing skill scripts.
 * Shows the script name and description to help users understand what the action does.
 * 
 * @example
 * ```tsx
 * <ActionButton
 *   scriptName="suspect:test"
 *   description="Test suspect responses"
 *   onClick={() => executeScript('suspect:test')}
 * />
 * ```
 * 
 * @example With custom icon and variant
 * ```tsx
 * <ActionButton
 *   scriptName="case:generate"
 *   description="Generate a new mystery case"
 *   onClick={handleGenerate}
 *   icon="🎲"
 *   variant="secondary"
 * />
 * ```
 */

import React from 'react';

export interface ActionButtonProps {
  /** Name of the script */
  scriptName: string;
  /** Description of what the script does */
  description: string;
  /** Callback when button is clicked */
  onClick: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Optional icon to display */
  icon?: string;
  /** Button variant style */
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * ActionButton Component
 * 
 * A button component for triggering skill script execution.
 * Displays the script name and description to provide context to the user.
 */
export function ActionButton({
  scriptName,
  description,
  onClick,
  disabled = false,
  icon = '▶',
  variant = 'primary',
}: ActionButtonProps) {
  // Determine button styles based on variant
  const getVariantStyles = () => {
    if (disabled) {
      return 'cursor-not-allowed bg-gray-200 text-gray-400 border-gray-300';
    }

    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      case 'secondary':
        return 'bg-gray-600 text-white border-gray-600 hover:bg-gray-700 focus:ring-gray-500';
      case 'outline':
        return 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50 focus:ring-blue-500';
      default:
        return 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-blue-500';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getVariantStyles()}`}
      aria-label={`Execute ${scriptName}: ${description}`}
    >
      {/* Icon */}
      <span className="text-lg" role="img" aria-hidden="true">
        {icon}
      </span>

      {/* Script Info */}
      <div className="flex flex-1 flex-col items-start text-left">
        <span className="text-sm font-semibold">{scriptName}</span>
        <span className="text-xs opacity-90">{description}</span>
      </div>
    </button>
  );
}
