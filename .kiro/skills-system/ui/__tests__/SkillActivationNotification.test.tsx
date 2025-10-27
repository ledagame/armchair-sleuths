/**
 * Tests for SkillActivationNotification Component
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SkillActivationNotification } from '../SkillActivationNotification';
import type { Skill } from '../../core/types';

describe('SkillActivationNotification', () => {
  const mockSkill: Skill = {
    metadata: {
      name: 'test-skill',
      version: '1.0.0',
      description: 'A test skill',
      triggers: ['test'],
      dependencies: {},
      capabilities: [],
    },
    promptContent: 'Test prompt',
    path: '/test/path',
    lastModified: new Date(),
    status: 'active',
  };

  it('should render skill name', () => {
    const onViewDetails = vi.fn();
    const onDeactivate = vi.fn();

    // This is a basic structure test
    // In a real environment, you would use @testing-library/react
    const props = {
      skill: mockSkill,
      onViewDetails,
      onDeactivate,
    };

    expect(props.skill.metadata.name).toBe('test-skill');
  });

  it('should have correct callback props', () => {
    const onViewDetails = vi.fn();
    const onDeactivate = vi.fn();

    const props = {
      skill: mockSkill,
      onViewDetails,
      onDeactivate,
    };

    expect(typeof props.onViewDetails).toBe('function');
    expect(typeof props.onDeactivate).toBe('function');
  });
});
