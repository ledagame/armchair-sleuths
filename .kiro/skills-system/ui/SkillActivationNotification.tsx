/**
 * Skill Activation Notification Component
 * 
 * Displays a notification when a skill is activated in the chat interface.
 * Shows the skill name and provides actions to view details or deactivate.
 */

import React from 'react';
import type { Skill } from '../core/types';

export interface SkillActivationNotificationProps {
  /** The activated skill */
  skill: Skill;
  /** Callback when user clicks "View Details" */
  onViewDetails: () => void;
  /** Callback when user clicks "Deactivate" */
  onDeactivate: () => void;
}

/**
 * SkillActivationNotification Component
 * 
 * A compact notification that appears in the chat interface when a skill is activated.
 * Provides quick actions for viewing details or deactivating the skill.
 */
export function SkillActivationNotification({
  skill,
  onViewDetails,
  onDeactivate,
}: SkillActivationNotificationProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
      {/* Icon and Skill Name */}
      <div className="flex flex-1 items-center gap-2">
        <span className="text-xl" role="img" aria-label="skill activated">
          🎯
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            Skill Activated
          </span>
          <span className="text-sm text-gray-700">{skill.metadata.name}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onViewDetails}
          className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          aria-label={`View details for ${skill.metadata.name}`}
        >
          View Details
        </button>
        <button
          onClick={onDeactivate}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
          aria-label={`Deactivate ${skill.metadata.name}`}
        >
          Deactivate
        </button>
      </div>
    </div>
  );
}
