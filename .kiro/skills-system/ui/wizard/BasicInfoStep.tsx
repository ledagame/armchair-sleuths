/**
 * Basic Info Step Component (Wizard Step 1/4)
 * 
 * First step of the skill creation wizard.
 * Collects basic information: name, description, version, and author.
 * 
 * @example
 * ```tsx
 * <BasicInfoStep
 *   data={{
 *     name: 'my-awesome-skill',
 *     description: 'This skill helps with...',
 *     version: '1.0.0',
 *     author: 'Your Name'
 *   }}
 *   onChange={(data) => updateWizardData(data)}
 *   errors={{}}
 * />
 * ```
 */

import React from 'react';

export interface BasicInfoData {
  /** Skill name (kebab-case) */
  name: string;
  /** Skill description */
  description: string;
  /** Semantic version */
  version: string;
  /** Author name */
  author: string;
}

export interface BasicInfoStepProps {
  /** Current form data */
  data: BasicInfoData;
  /** Callback when data changes */
  onChange: (data: BasicInfoData) => void;
  /** Validation errors */
  errors: Partial<Record<keyof BasicInfoData, string>>;
}

/**
 * BasicInfoStep Component
 * 
 * Wizard step for collecting basic skill information.
 */
export function BasicInfoStep({
  data,
  onChange,
  errors,
}: BasicInfoStepProps) {
  const handleChange = (field: keyof BasicInfoData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const validateSkillName = (name: string): boolean => {
    // Must be kebab-case: lowercase letters, numbers, and hyphens only
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(name);
  };

  const validateVersion = (version: string): boolean => {
    // Must be semantic version: X.Y.Z
    return /^\d+\.\d+\.\d+$/.test(version);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Provide basic details about your skill
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Skill Name */}
        <div>
          <label
            htmlFor="skill-name"
            className="block text-sm font-medium text-gray-700"
          >
            Skill Name <span className="text-red-500">*</span>
          </label>
          <input
            id="skill-name"
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="my-awesome-skill"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.name
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : 'name-help'}
          />
          {errors.name ? (
            <p id="name-error" className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          ) : (
            <p id="name-help" className="mt-1 text-xs text-gray-500">
              Use kebab-case (lowercase with hyphens). Example:
              my-awesome-skill
            </p>
          )}
          {data.name && !validateSkillName(data.name) && !errors.name && (
            <p className="mt-1 text-xs text-yellow-600">
              ⚠️ Name should be in kebab-case format
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="skill-description"
            className="block text-sm font-medium text-gray-700"
          >
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="skill-description"
            value={data.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="This skill helps with..."
            rows={3}
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.description
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? 'description-error' : 'description-help'
            }
          />
          {errors.description ? (
            <p id="description-error" className="mt-1 text-xs text-red-600">
              {errors.description}
            </p>
          ) : (
            <p id="description-help" className="mt-1 text-xs text-gray-500">
              Briefly describe what this skill does (1-2 sentences)
            </p>
          )}
        </div>

        {/* Version */}
        <div>
          <label
            htmlFor="skill-version"
            className="block text-sm font-medium text-gray-700"
          >
            Version <span className="text-red-500">*</span>
          </label>
          <input
            id="skill-version"
            type="text"
            value={data.version}
            onChange={(e) => handleChange('version', e.target.value)}
            placeholder="1.0.0"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.version
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!errors.version}
            aria-describedby={errors.version ? 'version-error' : 'version-help'}
          />
          {errors.version ? (
            <p id="version-error" className="mt-1 text-xs text-red-600">
              {errors.version}
            </p>
          ) : (
            <p id="version-help" className="mt-1 text-xs text-gray-500">
              Semantic version (MAJOR.MINOR.PATCH). Example: 1.0.0
            </p>
          )}
          {data.version && !validateVersion(data.version) && !errors.version && (
            <p className="mt-1 text-xs text-yellow-600">
              ⚠️ Version should follow semantic versioning (X.Y.Z)
            </p>
          )}
        </div>

        {/* Author */}
        <div>
          <label
            htmlFor="skill-author"
            className="block text-sm font-medium text-gray-700"
          >
            Author
          </label>
          <input
            id="skill-author"
            type="text"
            value={data.author}
            onChange={(e) => handleChange('author', e.target.value)}
            placeholder="Your Name"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              errors.author
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!errors.author}
            aria-describedby={errors.author ? 'author-error' : 'author-help'}
          />
          {errors.author ? (
            <p id="author-error" className="mt-1 text-xs text-red-600">
              {errors.author}
            </p>
          ) : (
            <p id="author-help" className="mt-1 text-xs text-gray-500">
              Your name or organization (optional)
            </p>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p>
            <span className="font-medium">Folder:</span>{' '}
            <code className="rounded bg-white px-1 py-0.5">
              skills/{data.name || 'skill-name'}
            </code>
          </p>
          <p>
            <span className="font-medium">Files:</span>{' '}
            <code className="rounded bg-white px-1 py-0.5">
              SKILL.yaml, SKILL.md, README.md
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
