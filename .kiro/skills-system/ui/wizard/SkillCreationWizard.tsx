/**
 * Skill Creation Wizard Component
 * 
 * Multi-step wizard for creating new skills.
 * Guides users through: Basic Info → Triggers → Dependencies → Capabilities
 * Generates skill files on completion.
 * 
 * @example
 * ```tsx
 * <SkillCreationWizard
 *   onComplete={(skillData) => createSkill(skillData)}
 *   onCancel={() => closeWizard()}
 * />
 * ```
 */

import React, { useState } from 'react';
import { BasicInfoStep, type BasicInfoData } from './BasicInfoStep';
import { TriggersStep, type TriggersData } from './TriggersStep';
import {
  DependenciesStep,
  type DependenciesData,
} from './DependenciesStep';
import {
  CapabilitiesStep,
  type CapabilitiesData,
} from './CapabilitiesStep';

export interface SkillWizardData {
  basicInfo: BasicInfoData;
  triggers: TriggersData;
  dependencies: DependenciesData;
  capabilities: CapabilitiesData;
}

export interface SkillCreationWizardProps {
  /** Callback when wizard is completed */
  onComplete: (data: SkillWizardData) => void;
  /** Callback when wizard is cancelled */
  onCancel: () => void;
  /** Available skills for dependency selection */
  availableSkills?: string[];
  /** Available APIs for dependency selection */
  availableApis?: string[];
  /** Initial data (for editing existing skill) */
  initialData?: Partial<SkillWizardData>;
}

type WizardStep = 'basicInfo' | 'triggers' | 'dependencies' | 'capabilities';

const STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: 'basicInfo', label: 'Basic Info', number: 1 },
  { id: 'triggers', label: 'Triggers', number: 2 },
  { id: 'dependencies', label: 'Dependencies', number: 3 },
  { id: 'capabilities', label: 'Capabilities', number: 4 },
];

/**
 * SkillCreationWizard Component
 * 
 * A multi-step wizard that guides users through creating a new skill.
 */
export function SkillCreationWizard({
  onComplete,
  onCancel,
  availableSkills = [],
  availableApis = [],
  initialData,
}: SkillCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basicInfo');
  const [wizardData, setWizardData] = useState<SkillWizardData>({
    basicInfo: initialData?.basicInfo || {
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
    },
    triggers: initialData?.triggers || {
      triggers: [],
    },
    dependencies: initialData?.dependencies || {
      skills: [],
      apis: [],
      packages: [],
    },
    capabilities: initialData?.capabilities || {
      capabilities: [],
    },
  });
  const [errors, setErrors] = useState<Record<string, any>>({});

  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const validateStep = (step: WizardStep): boolean => {
    const newErrors: Record<string, any> = {};

    switch (step) {
      case 'basicInfo':
        if (!wizardData.basicInfo.name.trim()) {
          newErrors.name = 'Skill name is required';
        } else if (
          !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(wizardData.basicInfo.name)
        ) {
          newErrors.name = 'Use kebab-case format';
        }
        if (!wizardData.basicInfo.description.trim()) {
          newErrors.description = 'Description is required';
        }
        if (!wizardData.basicInfo.version.trim()) {
          newErrors.version = 'Version is required';
        } else if (!/^\d+\.\d+\.\d+$/.test(wizardData.basicInfo.version)) {
          newErrors.version = 'Use semantic versioning (X.Y.Z)';
        }
        break;

      case 'triggers':
        if (wizardData.triggers.triggers.length === 0) {
          newErrors.triggers = 'Add at least one trigger keyword';
        }
        break;

      case 'capabilities':
        if (wizardData.capabilities.capabilities.length === 0) {
          newErrors.capabilities = 'Add at least one capability';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (isLastStep) {
      onComplete(wizardData);
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(STEPS[nextIndex].id);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(STEPS[prevIndex].id);
      setErrors({});
    }
  };

  const handleStepClick = (stepId: WizardStep) => {
    // Allow clicking on previous steps
    const targetIndex = STEPS.findIndex((s) => s.id === stepId);
    if (targetIndex <= currentStepIndex) {
      setCurrentStep(stepId);
      setErrors({});
    }
  };

  const updateData = <K extends keyof SkillWizardData>(
    key: K,
    data: SkillWizardData[K]
  ) => {
    setWizardData((prev) => ({
      ...prev,
      [key]: data,
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basicInfo':
        return (
          <BasicInfoStep
            data={wizardData.basicInfo}
            onChange={(data) => updateData('basicInfo', data)}
            errors={errors}
          />
        );
      case 'triggers':
        return (
          <TriggersStep
            data={wizardData.triggers}
            onChange={(data) => updateData('triggers', data)}
            errors={errors}
          />
        );
      case 'dependencies':
        return (
          <DependenciesStep
            data={wizardData.dependencies}
            availableSkills={availableSkills}
            availableApis={availableApis}
            onChange={(data) => updateData('dependencies', data)}
            errors={errors}
          />
        );
      case 'capabilities':
        return (
          <CapabilitiesStep
            data={wizardData.capabilities}
            onChange={(data) => updateData('capabilities', data)}
            errors={errors}
          />
        );
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Create New Skill
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Step {currentStepIndex + 1} of {STEPS.length}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-200 px-6 py-4">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex;

              return (
                <li key={step.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => isClickable && handleStepClick(step.id)}
                    disabled={!isClickable}
                    className={`group flex items-center ${
                      isClickable ? 'cursor-pointer' : 'cursor-not-allowed'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    <span
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                        isCompleted
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : isActive
                          ? 'border-blue-600 bg-white text-blue-600'
                          : 'border-gray-300 bg-white text-gray-500'
                      } ${
                        isClickable && !isActive
                          ? 'group-hover:border-blue-400'
                          : ''
                      }`}
                    >
                      {isCompleted ? '✓' : step.number}
                    </span>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {/* Connector */}
                  {index < STEPS.length - 1 && (
                    <div
                      className={`mx-4 h-0.5 flex-1 ${
                        index < currentStepIndex
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">{renderStep()}</div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
        <button
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>

        <div className="flex gap-3">
          {!isFirstStep && (
            <button
              onClick={handleBack}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {isLastStep ? 'Create Skill' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
