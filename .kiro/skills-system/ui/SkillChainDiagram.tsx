/**
 * Skill Chain Diagram Component
 * 
 * Displays a visual workflow diagram showing the execution order of skills in a chain.
 * Shows step status indicators and progress tracking.
 * 
 * @example
 * ```tsx
 * <SkillChainDiagram
 *   chain={{
 *     name: 'Improve Suspect System',
 *     steps: [
 *       { skill: { metadata: { name: 'suspect-ai-prompter' } }, status: 'completed', action: 'Analyze PROMPT.md' },
 *       { skill: { metadata: { name: 'suspect-ai-prompter' } }, status: 'running', action: 'Generate Examples' },
 *       { skill: { metadata: { name: 'suspect-ai-prompter' } }, status: 'pending', action: 'Validate Quality' }
 *     ],
 *     estimatedDuration: 120,
 *     requiredPermissions: ['read:./skills', 'write:./skills']
 *   }}
 *   currentStep={1}
 * />
 * ```
 */

import React from 'react';
import type { Skill } from '../core/types';

export interface SkillChainStep {
  /** Skill to execute */
  skill: Skill;
  /** Action description */
  action: string;
  /** Input data for this step */
  inputs?: Record<string, any>;
  /** Output data from this step */
  outputs?: Record<string, any>;
  /** Step status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  /** Error message if failed */
  error?: string;
}

export interface SkillChain {
  /** Chain name */
  name?: string;
  /** Steps in the chain */
  steps: SkillChainStep[];
  /** Estimated total duration in seconds */
  estimatedDuration?: number;
  /** Required permissions for the chain */
  requiredPermissions?: string[];
}

export interface SkillChainDiagramProps {
  /** Skill chain to display */
  chain: SkillChain;
  /** Current step index (0-based) */
  currentStep?: number;
  /** Whether to show compact view */
  compact?: boolean;
}

/**
 * SkillChainDiagram Component
 * 
 * Visualizes a skill execution chain with status indicators and progress tracking.
 */
export function SkillChainDiagram({
  chain,
  currentStep = 0,
  compact = false,
}: SkillChainDiagramProps) {
  const getStepIcon = (status: SkillChainStep['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'running':
        return '▶';
      case 'failed':
        return '✕';
      case 'skipped':
        return '⊘';
      default:
        return '⏸';
    }
  };

  const getStepStyles = (status: SkillChainStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          bgColor: 'bg-green-100',
          borderColor: 'border-green-300',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
        };
      case 'running':
        return {
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-300',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
      case 'failed':
        return {
          bgColor: 'bg-red-100',
          borderColor: 'border-red-300',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
        };
      case 'skipped':
        return {
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-300',
          textColor: 'text-gray-600',
          iconColor: 'text-gray-500',
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          iconColor: 'text-gray-400',
        };
    }
  };

  const completedSteps = chain.steps.filter(
    (step) => step.status === 'completed'
  ).length;
  const totalSteps = chain.steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">
            {chain.name || 'Skill Chain'}
          </h3>
          <span className="text-xs text-gray-500">
            {completedSteps}/{totalSteps} steps
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Chain progress: ${progressPercentage.toFixed(0)}%`}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3 px-4 py-4">
        {chain.steps.map((step, index) => {
          const styles = getStepStyles(step.status);
          const isCurrentStep = index === currentStep;

          return (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < chain.steps.length - 1 && (
                <div
                  className="absolute left-4 top-8 h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              )}

              {/* Step Card */}
              <div
                className={`relative flex items-start gap-3 rounded-lg border p-3 transition-all ${
                  isCurrentStep ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                } ${styles.bgColor} ${styles.borderColor}`}
              >
                {/* Status Icon */}
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white ${styles.iconColor}`}
                  aria-label={`Step ${index + 1} status: ${step.status}`}
                >
                  <span className="text-lg" role="img" aria-hidden="true">
                    {getStepIcon(step.status)}
                  </span>
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${styles.textColor}`}>
                      {index + 1}. {step.action}
                    </h4>
                    {!compact && (
                      <span className={`text-xs ${styles.textColor}`}>
                        {step.status}
                      </span>
                    )}
                  </div>

                  <p className={`text-xs ${styles.textColor}`}>
                    └─ {step.skill.metadata.name}
                  </p>

                  {/* Error Message */}
                  {step.status === 'failed' && step.error && (
                    <div className="mt-2 rounded bg-white bg-opacity-50 p-2">
                      <p className="text-xs font-mono text-red-700">
                        {step.error}
                      </p>
                    </div>
                  )}

                  {/* Outputs (for completed steps) */}
                  {!compact &&
                    step.status === 'completed' &&
                    step.outputs &&
                    Object.keys(step.outputs).length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <span className="font-medium">Outputs:</span>{' '}
                        {Object.keys(step.outputs).join(', ')}
                      </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {chain.estimatedDuration && (
        <div className="border-t border-gray-200 px-4 py-3">
          <p className="text-xs text-gray-500">
            Estimated duration: ~
            {chain.estimatedDuration < 60
              ? `${chain.estimatedDuration}s`
              : `${Math.floor(chain.estimatedDuration / 60)}m`}
          </p>
        </div>
      )}
    </div>
  );
}
