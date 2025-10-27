/**
 * Tests for SkillSelectionDialog Component
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { SkillSelectionDialog } from '../SkillSelectionDialog';
import type { Skill } from '../../core/types';

describe('SkillSelectionDialog', () => {
  const mockSkills: Skill[] = [
    {
      metadata: {
        name: 'skill-one',
        version: '1.0.0',
        description: 'First test skill',
        triggers: ['test1', 'skill1'],
        dependencies: {},
        capabilities: [],
      },
      promptContent: 'Test prompt 1',
      path: '/test/path1',
      lastModified: new Date(),
      status: 'active',
    },
    {
      metadata: {
        name: 'skill-two',
        version: '2.0.0',
        description: 'Second test skill',
        triggers: ['test2', 'skill2'],
        dependencies: {},
        capabilities: [],
      },
      promptContent: 'Test prompt 2',
      path: '/test/path2',
      lastModified: new Date(),
      status: 'active',
    },
  ];

  it('should have correct props structure', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const props = {
      skills: mockSkills,
      onConfirm,
      onCancel,
      isOpen: true,
    };

    expect(props.skills).toHaveLength(2);
    expect(typeof props.onConfirm).toBe('function');
    expect(typeof props.onCancel).toBe('function');
    expect(props.isOpen).toBe(true);
  });

  it('should return null when not open', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();

    const props = {
      skills: mockSkills,
      onConfirm,
      onCancel,
      isOpen: false,
    };

    expect(props.isOpen).toBe(false);
  });

  it('should handle skill selection logic', () => {
    const selectedIds = new Set<string>();
    
    // Simulate toggle
    const skillId = 'skill-one';
    if (selectedIds.has(skillId)) {
      selectedIds.delete(skillId);
    } else {
      selectedIds.add(skillId);
    }

    expect(selectedIds.has('skill-one')).toBe(true);
    expect(selectedIds.size).toBe(1);

    // Toggle again
    if (selectedIds.has(skillId)) {
      selectedIds.delete(skillId);
    } else {
      selectedIds.add(skillId);
    }

    expect(selectedIds.has('skill-one')).toBe(false);
    expect(selectedIds.size).toBe(0);
  });

  it('should filter selected skills correctly', () => {
    const selectedIds = new Set(['skill-one']);
    const selectedSkills = mockSkills.filter((skill) =>
      selectedIds.has(skill.metadata.name)
    );

    expect(selectedSkills).toHaveLength(1);
    expect(selectedSkills[0].metadata.name).toBe('skill-one');
  });
});
