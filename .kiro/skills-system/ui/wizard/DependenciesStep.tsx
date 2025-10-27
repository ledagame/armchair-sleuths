/**
 * Dependencies Step Component (Wizard Step 3/4)
 * 
 * Third step of the skill creation wizard.
 * Allows selecting required skills, APIs, and npm packages.
 * 
 * @example
 * ```tsx
 * <DependenciesStep
 *   data={{
 *     skills: ['mystery-case-generator'],
 *     apis: ['gemini-ai'],
 *     packages: ['yaml', 'inquirer']
 *   }}
 *   availableSkills={allSkills}
 *   availableApis={allApis}
 *   onChange={(data) => updateWizardData(data)}
 *   errors={{}}
 * />
 * ```
 */

import React, { useState } from 'react';

export interface DependenciesData {
  /** Required skill dependencies */
  skills: string[];
  /** Required API dependencies */
  apis: string[];
  /** Required npm package dependencies */
  packages: string[];
}

export interface DependenciesStepProps {
  /** Current form data */
  data: DependenciesData;
  /** Available skills to choose from */
  availableSkills?: string[];
  /** Available APIs to choose from */
  availableApis?: string[];
  /** Callback when data changes */
  onChange: (data: DependenciesData) => void;
  /** Validation errors */
  errors: Partial<Record<keyof DependenciesData, string>>;
}

/**
 * DependenciesStep Component
 * 
 * Wizard step for defining skill dependencies.
 */
export function DependenciesStep({
  data,
  availableSkills = [],
  availableApis = [],
  onChange,
  errors,
}: DependenciesStepProps) {
  const [newPackage, setNewPackage] = useState('');
  const [packageError, setPackageError] = useState('');

  const handleAddSkill = (skillName: string) => {
    if (!data.skills.includes(skillName)) {
      onChange({
        ...data,
        skills: [...data.skills, skillName],
      });
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    onChange({
      ...data,
      skills: data.skills.filter((s) => s !== skillName),
    });
  };

  const handleAddApi = (apiName: string) => {
    if (!data.apis.includes(apiName)) {
      onChange({
        ...data,
        apis: [...data.apis, apiName],
      });
    }
  };

  const handleRemoveApi = (apiName: string) => {
    onChange({
      ...data,
      apis: data.apis.filter((a) => a !== apiName),
    });
  };

  const validatePackageName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Package name cannot be empty';
    }
    if (!/^[@a-z0-9-~][a-z0-9-._~]*$/.test(name)) {
      return 'Invalid npm package name format';
    }
    if (data.packages.includes(name.trim())) {
      return 'This package is already added';
    }
    return null;
  };

  const handleAddPackage = () => {
    const trimmedPackage = newPackage.trim();
    const error = validatePackageName(trimmedPackage);

    if (error) {
      setPackageError(error);
      return;
    }

    onChange({
      ...data,
      packages: [...data.packages, trimmedPackage],
    });

    setNewPackage('');
    setPackageError('');
  };

  const handleRemovePackage = (packageName: string) => {
    onChange({
      ...data,
      packages: data.packages.filter((p) => p !== packageName),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPackage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Dependencies</h2>
        <p className="mt-1 text-sm text-gray-600">
          Specify what this skill depends on (all optional)
        </p>
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Required Skills
        </label>
        <p className="mt-1 text-xs text-gray-500">
          Other skills that must be available for this skill to work
        </p>

        {availableSkills.length > 0 ? (
          <div className="mt-2 space-y-2">
            {availableSkills.map((skillName) => {
              const isSelected = data.skills.includes(skillName);
              return (
                <label
                  key={skillName}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAddSkill(skillName);
                      } else {
                        handleRemoveSkill(skillName);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{skillName}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">
            No other skills available
          </p>
        )}

        {data.skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="rounded-full hover:bg-blue-200"
                  aria-label={`Remove skill: ${skill}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {errors.skills && (
          <p className="mt-1 text-xs text-red-600">{errors.skills}</p>
        )}
      </div>

      {/* Required APIs */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Required APIs
        </label>
        <p className="mt-1 text-xs text-gray-500">
          External APIs that this skill needs to function
        </p>

        {availableApis.length > 0 ? (
          <div className="mt-2 space-y-2">
            {availableApis.map((apiName) => {
              const isSelected = data.apis.includes(apiName);
              return (
                <label
                  key={apiName}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    isSelected
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleAddApi(apiName);
                      } else {
                        handleRemoveApi(apiName);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-900">{apiName}</span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="mt-2 text-sm text-gray-500">No APIs configured</p>
        )}

        {data.apis.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {data.apis.map((api) => (
              <span
                key={api}
                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
              >
                {api}
                <button
                  onClick={() => handleRemoveApi(api)}
                  className="rounded-full hover:bg-green-200"
                  aria-label={`Remove API: ${api}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {errors.apis && (
          <p className="mt-1 text-xs text-red-600">{errors.apis}</p>
        )}
      </div>

      {/* Required Packages */}
      <div>
        <label
          htmlFor="new-package"
          className="block text-sm font-medium text-gray-700"
        >
          Required Packages
        </label>
        <p className="mt-1 text-xs text-gray-500">
          npm packages that need to be installed
        </p>

        <div className="mt-2 flex gap-2">
          <input
            id="new-package"
            type="text"
            value={newPackage}
            onChange={(e) => {
              setNewPackage(e.target.value);
              setPackageError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="package-name"
            className={`block flex-1 rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 ${
              packageError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }`}
            aria-invalid={!!packageError}
            aria-describedby={packageError ? 'package-error' : 'package-help'}
          />
          <button
            onClick={handleAddPackage}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add package"
          >
            Add
          </button>
        </div>

        {packageError ? (
          <p id="package-error" className="mt-1 text-xs text-red-600">
            {packageError}
          </p>
        ) : (
          <p id="package-help" className="mt-1 text-xs text-gray-500">
            Enter npm package name (e.g., yaml, inquirer, @types/node)
          </p>
        )}

        {data.packages.length > 0 && (
          <ul className="mt-2 space-y-2">
            {data.packages.map((pkg, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="text-sm font-mono text-gray-900">{pkg}</span>
                <button
                  onClick={() => handleRemovePackage(pkg)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove package: ${pkg}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        {errors.packages && (
          <p className="mt-1 text-xs text-red-600">{errors.packages}</p>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-medium text-gray-700">
          Dependencies Summary
        </h3>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          <p>
            <span className="font-medium">Skills:</span>{' '}
            {data.skills.length || 'None'}
          </p>
          <p>
            <span className="font-medium">APIs:</span>{' '}
            {data.apis.length || 'None'}
          </p>
          <p>
            <span className="font-medium">Packages:</span>{' '}
            {data.packages.length || 'None'}
          </p>
        </div>
      </div>
    </div>
  );
}
