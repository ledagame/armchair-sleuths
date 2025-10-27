/**
 * Skill Selection Dialog Component
 * 
 * Displays a modal dialog for selecting multiple skills from a list.
 * Users can select skills using checkboxes and confirm their selection.
 */

import React, { useState, useEffect } from 'react';
import type { Skill } from '../core/types';

export interface SkillSelectionDialogProps {
  /** List of skills to choose from */
  skills: Skill[];
  /** Callback when user confirms selection */
  onConfirm: (selectedSkills: Skill[]) => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Whether the dialog is open */
  isOpen: boolean;
}

/**
 * SkillSelectionDialog Component
 * 
 * A modal dialog that allows users to select one or more skills from a list.
 * Features checkboxes for multi-selection and confirm/cancel actions.
 */
export function SkillSelectionDialog({
  skills,
  onConfirm,
  onCancel,
  isOpen,
}: SkillSelectionDialogProps) {
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(
    new Set()
  );

  // Reset selection when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSkillIds(new Set());
    }
  }, [isOpen]);

  // Handle ESC key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(skillId)) {
        newSet.delete(skillId);
      } else {
        newSet.add(skillId);
      }
      return newSet;
    });
  };

  const handleConfirm = () => {
    const selectedSkills = skills.filter((skill) =>
      selectedSkillIds.has(skill.metadata.name)
    );
    onConfirm(selectedSkills);
  };

  if (!isOpen) {
    return null;
  }

  const hasSelection = selectedSkillIds.size > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-selection-title"
    >
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h2
            id="skill-selection-title"
            className="text-xl font-semibold text-gray-900"
          >
            Select Skills
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Multiple skills match your request. Select the ones you want to
            activate.
          </p>
        </div>

        {/* Skill List */}
        <div className="max-h-96 overflow-y-auto px-6 py-4">
          {skills.length === 0 ? (
            <p className="text-center text-gray-500">No skills available</p>
          ) : (
            <div className="space-y-3">
              {skills.map((skill) => {
                const isSelected = selectedSkillIds.has(skill.metadata.name);
                return (
                  <label
                    key={skill.metadata.name}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSkillSelection(skill.metadata.name)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      aria-label={`Select ${skill.metadata.name}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {skill.metadata.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          v{skill.metadata.version}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {skill.metadata.description}
                      </p>
                      {skill.metadata.triggers.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {skill.metadata.triggers.slice(0, 3).map((trigger) => (
                            <span
                              key={trigger}
                              className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                            >
                              {trigger}
                            </span>
                          ))}
                          {skill.metadata.triggers.length > 3 && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              +{skill.metadata.triggers.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!hasSelection}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              hasSelection
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-300'
            }`}
            aria-label={`Confirm selection of ${selectedSkillIds.size} skill${selectedSkillIds.size !== 1 ? 's' : ''}`}
          >
            Confirm ({selectedSkillIds.size})
          </button>
        </div>
      </div>
    </div>
  );
}
