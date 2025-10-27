/**
 * Storybook stories for ActionButton Component
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ActionButton } from './ActionButton';

const meta: Meta<typeof ActionButton> = {
  title: 'Skills System/ActionButton',
  component: ActionButton,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'clicked' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    icon: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    isExecuting: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ActionButton>;

/**
 * Default ActionButton with primary variant
 */
export const Default: Story = {
  args: {
    scriptName: 'suspect:test',
    description: 'Test suspect responses with different emotional states',
    icon: '🧪',
  },
};

/**
 * ActionButton with secondary variant
 */
export const Secondary: Story = {
  args: {
    scriptName: 'suspect:add-archetype',
    description: 'Add a new suspect archetype to the system',
    icon: '➕',
    variant: 'secondary',
  },
};

/**
 * ActionButton with danger variant
 */
export const Danger: Story = {
  args: {
    scriptName: 'suspect:delete-all',
    description: 'Delete all suspect archetypes (cannot be undone)',
    icon: '🗑️',
    variant: 'danger',
  },
};

/**
 * Disabled ActionButton
 */
export const Disabled: Story = {
  args: {
    scriptName: 'suspect:test',
    description: 'Test suspect responses',
    icon: '🧪',
    disabled: true,
  },
};

/**
 * Executing ActionButton
 */
export const Executing: Story = {
  args: {
    scriptName: 'suspect:test',
    description: 'Test suspect responses',
    icon: '🧪',
    isExecuting: true,
  },
};

/**
 * ActionButton with long description
 */
export const LongDescription: Story = {
  args: {
    scriptName: 'suspect:comprehensive-test',
    description:
      'Run a comprehensive test suite that validates all suspect archetypes, emotional states, conversation flows, and response quality metrics across multiple scenarios',
    icon: '🔬',
  },
};

/**
 * ActionButton with default icon
 */
export const DefaultIcon: Story = {
  args: {
    scriptName: 'build:project',
    description: 'Build the entire project',
  },
};

/**
 * Multiple ActionButtons in a list
 */
export const MultipleButtons: Story = {
  render: () => (
    <div className="space-y-3 max-w-2xl">
      <ActionButton
        scriptName="suspect:test"
        description="Test suspect responses"
        icon="🧪"
        onClick={() => console.log('Test clicked')}
      />
      <ActionButton
        scriptName="suspect:add-archetype"
        description="Add new suspect archetype"
        icon="➕"
        onClick={() => console.log('Add clicked')}
        variant="secondary"
      />
      <ActionButton
        scriptName="suspect:validate"
        description="Validate all suspect prompts"
        icon="✅"
        onClick={() => console.log('Validate clicked')}
      />
      <ActionButton
        scriptName="suspect:optimize"
        description="Optimize prompt quality"
        icon="⚡"
        onClick={() => console.log('Optimize clicked')}
      />
    </div>
  ),
};

/**
 * ActionButtons with different states
 */
export const DifferentStates: Story = {
  render: () => (
    <div className="space-y-3 max-w-2xl">
      <ActionButton
        scriptName="script:normal"
        description="Normal state button"
        icon="▶️"
        onClick={() => console.log('Normal clicked')}
      />
      <ActionButton
        scriptName="script:executing"
        description="Currently executing"
        icon="▶️"
        onClick={() => console.log('Executing clicked')}
        isExecuting
      />
      <ActionButton
        scriptName="script:disabled"
        description="Disabled button"
        icon="▶️"
        onClick={() => console.log('Disabled clicked')}
        disabled
      />
    </div>
  ),
};
