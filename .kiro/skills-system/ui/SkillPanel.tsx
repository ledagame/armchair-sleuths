/**
 * Skill Panel Component
 *
 * A side panel that displays detailed information about a skill.
 * Features tabs for Overview (README), Scripts, and Examples.
 *
 * @example
 * ```tsx
 * <SkillPanel
 *   skill={selectedSkill}
 *   onClose={() => setSelectedSkill(null)}
 *   onExecuteScript={(scriptName) => executeScript(scriptName)}
 * />
 * ```
 */

import React, { useState } from 'react';
import type { Skill } from '../core/types';
import { ActionButton } from './ActionButton';

export interface SkillPanelProps {
  /** The skill to display */
  skill: Skill;
  /** Callback when panel is closed */
  onClose: () => void;
  /** Callback when a script is executed */
  onExecuteScript?: (scriptName: string) => void;
}

type TabType = 'overview' | 'scripts' | 'examples';

/**
 * SkillPanel Component
 *
 * Displays comprehensive skill information in a side panel with tabbed navigation.
 */
export function SkillPanel({
  skill,
  onClose,
  onExecuteScript,
}: SkillPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Get npm scripts from metadata
  const scripts = skill.metadata.npmScripts
    ? Object.entries(skill.metadata.npmScripts)
    : [];

  // Get examples from capabilities
  const examples = skill.metadata.capabilities.flatMap(
    (cap) => cap.examples || []
  );

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" role="img" aria-hidden="true">
            🎭
          </span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {skill.metadata.name}
            </h2>
            <p className="text-sm text-gray-500">v{skill.metadata.version}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Close panel"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 px-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
          }`}
          aria-label="Overview tab"
          aria-selected={activeTab === 'overview'}
          role="tab"
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('scripts')}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'scripts'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
          }`}
          aria-label="Scripts tab"
          aria-selected={activeTab === 'scripts'}
          role="tab"
        >
          Scripts {scripts.length > 0 && `(${scripts.length})`}
        </button>
        <button
          onClick={() => setActiveTab('examples')}
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'examples'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900'
          }`}
          aria-label="Examples tab"
          aria-selected={activeTab === 'examples'}
          role="tab"
        >
          Examples {examples.length > 0 && `(${examples.length})`}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6" role="tabpanel">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Description
              </h3>
              <p className="text-gray-700">{skill.metadata.description}</p>
            </div>

            {skill.metadata.author && (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Author
                </h3>
                <p className="text-gray-700">{skill.metadata.author}</p>
              </div>
            )}

            {skill.metadata.triggers.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Trigger Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skill.metadata.triggers.map((trigger) => (
                    <span
                      key={trigger}
                      className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {skill.metadata.capabilities.length > 0 && (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Capabilities
                </h3>
                <ul className="space-y-2">
                  {skill.metadata.capabilities.map((cap) => (
                    <li key={cap.name} className="text-gray-700">
                      <span className="font-medium">{cap.name}</span>
                      {cap.description && (
                        <span className="text-gray-600">
                          {' '}
                          - {cap.description}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {skill.readmeContent && (
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  README
                </h3>
                <div className="prose prose-sm max-w-none rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {skill.readmeContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Available Scripts
            </h3>
            {scripts.length === 0 ? (
              <p className="text-gray-600">No scripts available</p>
            ) : (
              <div className="space-y-3">
                {scripts.map(([scriptName, command]) => (
                  <ActionButton
                    key={scriptName}
                    scriptName={scriptName}
                    description={command}
                    onClick={() => onExecuteScript?.(scriptName)}
                    icon="▶"
                    variant="outline"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Examples</h3>
            {examples.length === 0 ? (
              <p className="text-gray-600">No examples available</p>
            ) : (
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {example}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
