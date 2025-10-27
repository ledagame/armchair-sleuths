/**
 * Skill Card Component
 * 
 * Displays a skill in a card format with name, version, description, status badge, and action buttons.
 * Used in skill list views and skill management interfaces.
 * 
 * @example
 * ```tsx
 * <SkillCard
 *   skill={skill}
 *   onActivate={() => activateSkill(skill.metadata.name)}
 *   onViewDetails={() => showDetails(skill)}
 * />
 * ```
 * 
 * @example With all actions
 * ```tsx
 * <SkillCard
 *   skill={skill}
 *   onActivate={handleActivate}
 *   onViewDetails={handleViewDetails}
 *   onMoreActions={handleMoreActions}
 * />
 * ```
 */

import React from 'react';
import type { Skill } from '../core/types';

export interface SkillCardProps {
  /** The skill to display */
  skill: Skill;
  /** Callback when Activate button is clicked */
  onActivate?: () => void;
  /** Callback when Details button is clicked */
  onViewDetails?: () => void;
  /** Callback when More Actions button is clicked */
  onMoreActions?: () => void;
}

/**
 * Get status badge styling based on skill status
 */
function getStatusBadgeStyles(status: Skill['status']): {
  bgColor: string;
  textColor: string;
  icon: string;
  label: string;
} {
  switch (status) {
    case 'active':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: '✅',
        label: 'Active',
      };
    case 'inactive':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        icon: '⏸️',
        label: 'Inactive',
      };
    case 'error':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        icon: '❌',
        label: 'Error',
      };
  }
}

/**
 * SkillCard Component
 * 
 * A card component that displays skill information including name, version,
 * description, status, and provides action buttons for interaction.
 */
export function SkillCard({
  skill,
  onActivate,
  onViewDetails,
  onMoreActions,
}: SkillCardProps) {
  const statusBadge = getStatusBadgeStyles(skill.status);
  const isActive = skill.status === 'active';

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header: Icon, Name, Version, Status */}
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-2xl" role="img" aria-hidden="true">
            🎭
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900">
                {skill.metadata.name}
              </h3>
              <span className="text-xs text-gray-500">
                v{skill.metadata.version}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusBadge.bgColor} ${statusBadge.textColor}`}
          role="status"
          aria-label={`Status: ${statusBadge.label}`}
        >
          <span role="img" aria-hidden="true">
            {statusBadge.icon}
          </span>
          <span>{statusBadge.label}</span>
        </div>
      </div>

      {/* Body: Description */}
      <div className="flex-1 px-4 py-3">
        <p className="text-sm text-gray-600 line-clamp-2">
          {skill.metadata.description}
        </p>
      </div>

      {/* Footer: Action Buttons */}
      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
        {onActivate && (
          <button
            onClick={onActivate}
            disabled={isActive}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              isActive
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
            }`}
            aria-label={`Activate ${skill.metadata.name}`}
          >
            {isActive ? 'Activated' : 'Activate'}
          </button>
        )}

        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            aria-label={`View details for ${skill.metadata.name}`}
          >
            Details
          </button>
        )}

        {onMoreActions && (
          <button
            onClick={onMoreActions}
            className="ml-auto rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
            aria-label={`More actions for ${skill.metadata.name}`}
          >
            <span role="img" aria-hidden="true">
              ⋮
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
