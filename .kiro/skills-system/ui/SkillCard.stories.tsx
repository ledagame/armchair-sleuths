/**
 * Storybook stories for SkillCard Component
 */

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SkillCard } from './SkillCard';
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
      },
      {
        name: 'emotional-testing',
        description: 'Test suspect emotional states',
      },
    ],
  },
  promptContent: 'Test prompt content',
  readmeContent: 'Test README',
  path: '/skills/suspect-ai-prompter',
  lastModified: new Date('2025-01-20'),
  status: 'inactive',
};

const meta: Meta<typeof SkillCard> = {
  title: 'Skills System/SkillCard',
  component: SkillCard,
  tags: ['autodocs'],
  argTypes: {
    onClick: { action: 'card clicked' },
    onActivate: { action: 'activate clicked' },
    onViewDetails: { action: 'view details clicked' },
    onDeactivate: { action: 'deactivate clicked' },
    compact: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof SkillCard>;

/**
 * Default inactive skill card
 */
export const Inactive: Story = {
  args: {
    skill: mockSkill,
    onActivate: undefined,
    onViewDetails: undefined,
  },
};

/**
 * Active skill card
 */
export const Active: Story = {
  args: {
    skill: {
      ...mockSkill,
      status: 'active',
    },
    onViewDetails: undefined,
    onDeactivate: undefined,
  },
};

/**
 * Skill card with error status
 */
export const Error: Story = {
  args: {
    skill: {
      ...mockSkill,
      status: 'error',
    },
    onActivate: undefined,
    onViewDetails: undefined,
  },
};

/**
 * Compact skill card
 */
export const Compact: Story = {
  args: {
    skill: mockSkill,
    compact: true,
    onActivate: undefined,
    onViewDetails: undefined,
  },
};

/**
 * Clickable skill card
 */
export const Clickable: Story = {
  args: {
    skill: mockSkill,
    onClick: undefined,
    onActivate: undefined,
    onViewDetails: undefined,
  },
};

/**
 * Skill card without author
 */
export const NoAuthor: Story = {
  args: {
    skill: {
      ...mockSkill,
      metadata: {
        ...mockSkill.metadata,
        author: undefined,
      },
    },
    onActivate: undefined,
    onViewDetails: undefined,
  },
};

/**
 * Skill card with long description
 */
export const LongDescription: Story = {
  args: {
    skill: {
      ...mockSkill,
      metadata: {
        ...mockSkill.metadata,
        description:
          'This is a very long description that demonstrates how the skill card handles text overflow. It should be truncated with an ellipsis after two lines to maintain a consistent card height and prevent the layout from breaking.',
      },
    },
    onActivate: undefined,
    onViewDetails: undefined,
  },
};

/**
 * Grid of skill cards
 */
export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl">
      <SkillCard
        skill={mockSkill}
        onActivate={() => console.log('Activate')}
        onViewDetails={() => console.log('View Details')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: {
            ...mockSkill.metadata,
            name: 'case-generator',
            description: 'Generate mystery cases with suspects and clues',
          },
          status: 'active',
        }}
        onViewDetails={() => console.log('View Details')}
        onDeactivate={() => console.log('Deactivate')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: {
            ...mockSkill.metadata,
            name: 'evidence-analyzer',
            description: 'Analyze evidence and generate insights',
          },
          status: 'inactive',
        }}
        onActivate={() => console.log('Activate')}
        onViewDetails={() => console.log('View Details')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: {
            ...mockSkill.metadata,
            name: 'dialogue-writer',
            description: 'Write realistic suspect dialogues',
          },
          status: 'error',
        }}
        onActivate={() => console.log('Activate')}
        onViewDetails={() => console.log('View Details')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: {
            ...mockSkill.metadata,
            name: 'plot-validator',
            description: 'Validate plot consistency and fairness',
          },
          status: 'active',
        }}
        onViewDetails={() => console.log('View Details')}
        onDeactivate={() => console.log('Deactivate')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: {
            ...mockSkill.metadata,
            name: 'image-generator',
            description: 'Generate character and location images',
          },
          status: 'inactive',
        }}
        onActivate={() => console.log('Activate')}
        onViewDetails={() => console.log('View Details')}
      />
    </div>
  ),
};

/**
 * Compact grid of skill cards
 */
export const CompactGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-6xl">
      <SkillCard
        skill={mockSkill}
        compact
        onActivate={() => console.log('Activate')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: { ...mockSkill.metadata, name: 'case-generator' },
          status: 'active',
        }}
        compact
        onDeactivate={() => console.log('Deactivate')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: { ...mockSkill.metadata, name: 'evidence-analyzer' },
        }}
        compact
        onActivate={() => console.log('Activate')}
      />
      <SkillCard
        skill={{
          ...mockSkill,
          metadata: { ...mockSkill.metadata, name: 'dialogue-writer' },
          status: 'error',
        }}
        compact
        onActivate={() => console.log('Activate')}
      />
    </div>
  ),
};

/**
 * Different states comparison
 */
export const States: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Inactive</h3>
        <SkillCard
          skill={mockSkill}
          onActivate={() => console.log('Activate')}
          onViewDetails={() => console.log('View Details')}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Active</h3>
        <SkillCard
          skill={{ ...mockSkill, status: 'active' }}
          onViewDetails={() => console.log('View Details')}
          onDeactivate={() => console.log('Deactivate')}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Error</h3>
        <SkillCard
          skill={{ ...mockSkill, status: 'error' }}
          onActivate={() => console.log('Activate')}
          onViewDetails={() => console.log('View Details')}
        />
      </div>
    </div>
  ),
};
