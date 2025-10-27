/**
 * Storybook stories for SkillPanel Component
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SkillPanel } from './SkillPanel';
import type { Skill } from '../core/types';

const mockSkill: Skill = {
  metadata: {
    name: 'suspect-ai-prompter',
    version: '2.0.0',
    description: 'Optimize AI suspect conversation prompts and test emotional states',
    author: 'Mystery Game Team',
    triggers: ['improve prompt', 'optimize ai', 'test responses'],
    dependencies: {
      skills: ['mystery-case-generator'],
      apis: ['gemini-ai'],
      packages: ['yaml', 'inquirer'],
    },
    capabilities: [
      {
        name: 'prompt-improvement',
        description: 'Analyze and improve suspect prompts',
        examples: [
          'Analyze PROMPT.md for quality issues',
          'Suggest improvements for emotional depth',
        ],
      },
      {
        name: 'emotional-testing',
        description: 'Test suspect emotional states',
        examples: [
          'Test COOPERATIVE state responses',
          'Test NERVOUS state responses',
          'Test DEFENSIVE state responses',
        ],
      },
    ],
    npmScripts: {
      'suspect:test': 'tsx scripts/test-suspects.ts',
      'suspect:add-archetype': 'tsx scripts/add-archetype.ts',
      'suspect:validate': 'tsx scripts/validate-prompts.ts',
    },
  },
  promptContent: 'Test prompt content',
  readmeContent: `# Suspect AI Prompter

## Overview

This skill helps you optimize AI suspect conversation prompts and test emotional states.

## Features

- Analyze PROMPT.md files
- Test emotional state responses
- Generate new archetypes
- Validate prompt quality

## Usage

Run the test script to validate all suspect responses:

\`\`\`bash
npm run suspect:test
\`\`\`

Add a new archetype:

\`\`\`bash
npm run suspect:add-archetype
\`\`\`
`,
  path: '/skills/suspect-ai-prompter',
  lastModified: new Date('2025-01-20'),
  status: 'active',
};

const meta: Meta<typeof SkillPanel> = {
  title: 'Skills System/SkillPanel',
  component: SkillPanel,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onClose: { action: 'close clicked' },
    onExecuteScript: { action: 'execute script' },
  },
};

export default meta;
type Story = StoryObj<typeof SkillPanel>;

/**
 * Default skill panel with all content
 */
export const Default: Story = {
  args: {
    skill: mockSkill,
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-gray-100" />
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Skill panel without scripts
 */
export const NoScripts: Story = {
  args: {
    skill: {
      ...mockSkill,
      metadata: {
        ...mockSkill.metadata,
        npmScripts: undefined,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-gray-100" />
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Skill panel without examples
 */
export const NoExamples: Story = {
  args: {
    skill: {
      ...mockSkill,
      metadata: {
        ...mockSkill.metadata,
        capabilities: mockSkill.metadata.capabilities.map(cap => ({
          ...cap,
          examples: undefined,
        })),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-gray-100" />
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Skill panel with executing script
 */
export const ExecutingScript: Story = {
  args: {
    skill: mockSkill,
    executingScript: 'suspect:test',
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-gray-100" />
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
};

/**
 * Minimal skill panel
 */
export const Minimal: Story = {
  args: {
    skill: {
      ...mockSkill,
      metadata: {
        ...mockSkill.metadata,
        author: undefined,
        triggers: [],
        capabilities: [],
        npmScripts: undefined,
      },
      readmeContent: undefined,
    },
  },
  decorators: [
    (Story) => (
      <div className="h-screen flex">
        <div className="flex-1 bg-gray-100" />
        <div className="w-96">
          <Story />
        </div>
      </div>
    ),
  ],
};
