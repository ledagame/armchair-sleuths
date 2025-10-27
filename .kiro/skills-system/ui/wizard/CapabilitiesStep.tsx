/**
 * Capabilities Step Component (Wizard Step 4/4)
 * 
 * Fourth and final step of the skill creation wizard.
 * Allows adding/editing capabilities with optional script associations.
 * 
 * @example
 * ```tsx
 * <CapabilitiesStep
 *   data={{
 *     capabilities: [
 *       {
 *         name: 'prompt-improvement',
 *         description: 'Analyze and improve prompts',
 *         script: 'scripts/improve-prompt.ts'
 *       }
 *     ]
 *   }}
 *   onChange={(data) => updateWizardData(data)}
 *   errors={{}}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface Capability {
  /** Capability name (kebab-case) */
  name: string;
  /** Description of what this capability does */
  description: string;
  /** Optional script path */
  script?: string;
}

export interface CapabilitiesData {
  /** List of capabilities */
  capabilities: Capability[];
}

export interface CapabilitiesStepProps {
  /** Current form data */
  data: CapabilitiesData;
  /** Callback when data changes */
  onChange: (data: CapabilitiesData) => void;
  /** Validation errors */
  errors: Partial<Record<'capabilities', string>>;
}

/**
 * CapabilitiesStep Component
 * 
 * Wizard step for defining skill capabilities.
 */
export function CapabilitiesStep({
  data,
  onChange,
  errors,
}: CapabilitiesStepProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentCapability, setCurrentCapability] = useState<Capability>({
    name: '',
    description: '',
    script: '',
  });
  const [capabilityErrors, setCapabilityErrors] = useState<
    Partial<Record<keyof Capability, string>>
  >({});

  const validateCapability = (
    capability: Capability
  ): Partial<Record<keyof Capability, string>> => {
    const errors: Partial<Record<keyof Capability, string>> = {};

    if (!capability.name.trim()) {
      errors.name = 'Capability name is required';
    } else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(capability.name)) {
      errors.name = 'Use kebab-case format (lowercase with hyphens)';
    } else if (
      editingIndex === null &&
      data.capabilities.some((c) => c.name === capability.name)
    ) {
      errors.name = 'A capability with this name already exists';
    }

    if (!capability.description.trim()) {
      errors.description = 'Description is required';
    } else if (capability.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (
      capability.script &&
      !/\.(ts|js|sh|py)$/.test(capability.script.trim())
    ) {
      errors.script = 'Script must be a .ts, .js, .sh, or .py file';
    }

    return errors;
  };

  const handleAddCapability = () => {
    const errors = validateCapability(currentCapability);

    if (Object.keys(errors).length > 0) {
      setCapabilityErrors(errors);
      return;
    }

    if (editingIndex !== null) {
      // Update existing capability
      const updated = [...data.capabilities];
      updated[editingIndex] = currentCapability;
      onChange({ capabilities: updated });
      setEditingIndex(null);
    } else {
      // Add new capability
      onChange({
        capabilities: [...data.capabilities, currentCapability],
      });
    }

    // Reset form
    setCurrentCapability({ name: '', description: '', script: '' });
    setCapabilityErrors({});
    setIsAdding(false);
  };

  const handleEditCapability = (index: number) => {
    setCurrentCapability(data.capabilities[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleRemoveCapability = (index: number) => {
    onChange({
      capabilities: data.capabilities.filter((_, i) => i !== index),
    });
  };

  const handleCancel = () => {
    setCurrentCapability({ name: '', description: '', script: '' });
    setCapabilityErrors({});
    setIsAdding(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Capabilities</h2>
        <p className="mt-1 text-sm text-gray-600">
          Define what this skill can do
        </p>
      </div>

      {/* Add/Edit Form */}
      {isAdding ? (
        <div className="space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-sm font-semibold text-blue-900">
            {editingIndex !== null ? 'Edit Capability' : 'Add New Capability'}
          </h3>

          {/* Capability Name */}
          <div>
            <label
              htmlFor="capability-name"
              className="block text-sm font-medium text-gray-700"
            >
              Capability Name <span className="text-red-500">*</span>
            </label>
            <input
              id="capability-name"
              type="text"
              value={currentCapability.name}
              onChange={(e) =>
                setCurrentCapability({
                  ...currentCapability,
                  name: e.target.value,
                })
              }
              placeholder="prompt-improvement"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                capabilityErrors.name
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {capabilityErrors.name && (
              <p className="mt-1 text-xs text-red-600">
                {capabilityErrors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="capability-description"
              className="block text-sm font-medium text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="capability-description"
              value={currentCapability.description}
              onChange={(e) =>
                setCurrentCapability({
                  ...currentCapability,
                  description: e.target.value,
                })
              }
              placeholder="Analyze and improve prompts"
              rows={2}
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                capabilityErrors.description
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {capabilityErrors.description && (
              <p className="mt-1 text-xs text-red-600">
                {capabilityErrors.description}
              </p>
            )}
          </div>

          {/* Script (Optional) */}
          <div>
            <label
              htmlFor="capability-script"
              className="block text-sm font-medium text-gray-700"
            >
              Script (optional)
            </label>
            <input
              id="capability-script"
              type="text"
              value={currentCapability.script}
              onChange={(e) =>
                setCurrentCapability({
                  ...currentCapability,
                  script: e.target.value,
                })
              }
              placeholder="scripts/improve-prompt.ts"
              className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                capabilityErrors.script
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
            {capabilityErrors.script ? (
              <p className="mt-1 text-xs text-red-600">
                {capabilityErrors.script}
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Path to script file (.ts, .js, .sh, or .py)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddCapability}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {editingIndex !== null ? 'Update' : 'Add Capability'}
            </button>
            <button
              onClick={handleCancel}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-4 py-6 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="text-lg">+</span>
          Add Capability
        </button>
      )}

      {/* Added Capabilities List */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Added Capabilities{' '}
          {data.capabilities.length > 0 && `(${data.capabilities.length})`}
        </label>

        {errors.capabilities && (
          <p className="mt-1 text-xs text-red-600">{errors.capabilities}</p>
        )}

        {data.capabilities.length === 0 ? (
          <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">
              No capabilities added yet. Add at least one capability.
            </p>
          </div>
        ) : (
          <ul className="mt-2 space-y-3">
            {data.capabilities.map((capability, index) => (
              <li
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {capability.name}
                    </h4>
                    <p className="text-xs text-gray-600">
                      {capability.description}
                    </p>
                    {capability.script && (
                      <p className="text-xs font-mono text-gray-500">
                        📄 {capability.script}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditCapability(index)}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Edit capability: ${capability.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleRemoveCapability(index)}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Remove capability: ${capability.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview */}
      {data.capabilities.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700">
            Capabilities Summary
          </h3>
          <ul className="mt-2 space-y-1 text-xs text-gray-600">
            {data.capabilities.map((cap, index) => (
              <li key={index} className="flex items-start gap-2">
                <span>•</span>
                <span>
                  <strong>{cap.name}</strong>
                  {cap.script && ` (automated)`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
