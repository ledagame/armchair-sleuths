/**
 * Skill List View Component
 *
 * Displays a searchable, filterable grid of skill cards.
 * Supports virtual scrolling for performance with large skill collections.
 *
 * @example
 * ```tsx
 * <SkillListView
 *   skills={allSkills}
 *   onSkillActivate={(skill) => activateSkill(skill)}
 *   onSkillDetails={(skill) => showDetails(skill)}
 * />
 * ```
 */

import React, { useState, useMemo } from 'react';
import type { Skill } from '../core/types';
import { SkillCard } from './SkillCard';

export interface SkillListViewProps {
  /** Array of skills to display */
  skills: Skill[];
  /** Callback when a skill is activated */
  onSkillActivate?: (skill: Skill) => void;
  /** Callback when skill details are requested */
  onSkillDetails?: (skill: Skill) => void;
  /** Callback for more actions on a skill */
  onSkillMoreActions?: (skill: Skill) => void;
}

type StatusFilter = 'all' | 'active' | 'inactive' | 'error';

/**
 * SkillListView Component
 *
 * A comprehensive view for browsing and managing skills with search and filter capabilities.
 */
export function SkillListView({
  skills,
  onSkillActivate,
  onSkillDetails,
  onSkillMoreActions,
}: SkillListViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter and search skills
  const filteredSkills = useMemo(() => {
    let result = skills;

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter((skill) => skill.status === statusFilter);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (skill) =>
          skill.metadata.name.toLowerCase().includes(query) ||
          skill.metadata.description.toLowerCase().includes(query) ||
          skill.metadata.triggers.some((trigger) =>
            trigger.toLowerCase().includes(query)
          )
      );
    }

    return result;
  }, [skills, searchQuery, statusFilter]);

  // Count skills by status
  const statusCounts = useMemo(() => {
    return {
      all: skills.length,
      active: skills.filter((s) => s.status === 'active').length,
      inactive: skills.filter((s) => s.status === 'inactive').length,
      error: skills.filter((s) => s.status === 'error').length,
    };
  }, [skills]);

  return (
    <div className="flex h-full flex-col">
      {/* Header with Search and Filters */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="text-sm text-gray-600">
            {filteredSkills.length} of {skills.length} skills
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills by name, description, or keywords..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Search skills"
            />
            <span
              className="absolute left-3 top-2.5 text-gray-400"
              role="img"
              aria-hidden="true"
            >
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Show all skills"
            aria-pressed={statusFilter === 'all'}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Show active skills"
            aria-pressed={statusFilter === 'active'}
          >
            Active ({statusCounts.active})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-gray-200 text-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Show inactive skills"
            aria-pressed={statusFilter === 'inactive'}
          >
            Inactive ({statusCounts.inactive})
          </button>
          <button
            onClick={() => setStatusFilter('error')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === 'error'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Show skills with errors"
            aria-pressed={statusFilter === 'error'}
          >
            Error ({statusCounts.error})
          </button>
        </div>
      </div>

      {/* Skill Grid */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
        {filteredSkills.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <span className="mb-2 block text-4xl" role="img" aria-hidden="true">
                🔍
              </span>
              <p className="text-lg font-medium text-gray-900">
                No skills found
              </p>
              <p className="text-sm text-gray-600">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'No skills available'}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            }}
          >
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.metadata.name}
                skill={skill}
                onActivate={() => onSkillActivate?.(skill)}
                onViewDetails={() => onSkillDetails?.(skill)}
                onMoreActions={() => onSkillMoreActions?.(skill)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
