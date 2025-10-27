/**
 * Triggers Step Component (Wizard Step 2/4)
 * 
 * Second step of the skill creation wizard.
 * Allows adding/removing trigger keywords that activate the skill.
 * 
 * @example
 * ```tsx
 * <TriggersStep
 *   data={{
 *     triggers: ['improve prompt', 'optimize ai', 'test responses']
 *   }}
 *   onChange={(data) => updateWizardData(data)}
 *   errors={{}}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface TriggersData {
  /** List of trigger keywords */
  triggers: string[];
}

export interface TriggersStepProps {
  /** Current form data */
  data: TriggersData;
  /** Callback when data changes */
  onChange: (data: TriggersData) => void;
  /** Validation errors */
  errors: Partial<Record<'triggers', string>>;
}

/**
 * TriggersStep Component
 * 
 * Wizard step for defining skill trigger keywords.
 */
export function TriggersStep({
  data,
  onChange,
  errors,
}: TriggersStepProps) {
  const [newTrigger, setNewTrigger] = useState('');
  const [inputError, setInputError] = useState('');

  const validateTrigger = (trigger: string): string | null => {
    if (!trigger.trim()) {
      return 'Trigger cannot be empty';
    }
    if (trigger.length < 3) {
      return 'Trigger must be at least 3 characters';
    }
    if (trigger.length > 50) {
      return 'Trigger must be less than 50 characters';
    }
    if (data.triggers.includes(trigger.trim().toLowerCase())) {
      return 'This trigger already exists';
    }
    return null;
  };

  const handleAddTrigger = () => {
    const trimmedTrigger = newTrigger.trim().toLowerCase();
    const error = validateTrigger(trimmedTrigger);

    if (error) {
      setInputError(error);
      return;
    }

    onChange({
      triggers: [...data.triggers, trimmedTrigger],
    });

    setNewTrigger('');
    setInputError('');
  };

  const handleRemoveTrigger = (index: number) => {
    onChange({
      triggers: data.triggers.filter((_, i) => i !== index),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTrigger();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Trigger Keywords
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Add keywords that will activate this skill when mentioned in chat
        </p>
      </div>

      {/* Add Trigger Input */}
      <div>
        <label
          htmlFor="new-trigger"
          className="block text-sm font-medium text-gray-700"
        >
          Add Trigger Keyword
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="new-trigger"
            type="text"
            value={newTrigger}
            onChange={(e) => {
              setNewTrigger(e.target.value);
              setInputError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="improve prompt"
            className={`block flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              inputError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!inputError}
            aria-describedby={inputError ? 'trigger-error' : 'trigger-help'}
          />
          <button
            onClick={handleAddTrigger}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add trigger keyword"
          >
            Add
          </button>
        </div>
        {inputError ? (
          <p id="trigger-error" className="mt-1 text-xs text-red-600">
            {inputError}
          </p>
        ) : (
          <p id="trigger-help" className="mt-1 text-xs text-gray-500">
            Enter a keyword or phrase (3-50 characters). Press Enter or click
            Add.
          </p>
        )}
      </div>

      {/* Current Triggers List */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Current Keywords {data.triggers.length > 0 && `(${data.triggers.length})`}
        </label>

        {errors.triggers && (
          <p className="mt-1 text-xs text-red-600">{errors.triggers}</p>
        )}

        {data.triggers.length === 0 ? (
          <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <p className="text-sm text-gray-500">
              No triggers added yet. Add at least one trigger keyword.
            </p>
          </div>
        ) : (
          <ul className="mt-2 space-y-2">
            {data.triggers.map((trigger, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm font-medium text-gray-900">
                    {trigger}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveTrigger(index)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                  aria-label={`Remove trigger: ${trigger}`}
                >
                  <span role="img" aria-hidden="true">
                    ✕
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Examples */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="flex items-center gap-2 text-sm font-medium text-blue-900">
          <span role="img" aria-hidden="true">
            💡
          </span>
          Examples of Good Triggers
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-blue-700">
          <li>• "improve prompt" - Action-based</li>
          <li>• "generate case" - Task-specific</li>
          <li>• "test responses" - Testing-related</li>
          <li>• "optimize ai" - Improvement-focused</li>
          <li>• "debug error" - Problem-solving</li>
        </ul>
        <p className="mt-2 text-xs text-blue-600">
          Tip: Use clear, action-oriented phrases that users would naturally
          type
        </p>
      </div>

      {/* Preview */}
      {data.triggers.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-medium text-gray-700">
            Activation Preview
          </h3>
          <p className="mt-2 text-xs text-gray-600">
            This skill will activate when users mention:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.triggers.map((trigger, index) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
              >
                "{trigger}"
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
