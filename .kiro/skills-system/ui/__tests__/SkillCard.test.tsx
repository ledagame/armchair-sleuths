/**
 * Tests for SkillCard Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillCard } from '../SkillCard';
import type { Skill } from '../../core/types';

const mockSkill: Skill = {
  metadata: {
    name: 'test-skill',
    version: '1.0.0',
    description: 'A test skill for unit testing',
    author: 'Test Author',
    triggers: ['test'],
    dependencies: {},
    capabilities: [],
  },
  promptContent: 'Test prompt content',
  readmeContent: 'Test README',
  path: '/path/to/skill',
  lastModified: new Date('2025-01-01'),
  status: 'inactive',
};

describe('SkillCard', () => {
  describe('Rendering', () => {
    it('should render skill name and version', () => {
      render(<SkillCard skill={mockSkill} />);

      expect(screen.getByText('test-skill')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should render skill description', () => {
      render(<SkillCard skill={mockSkill} />);

      expect(screen.getByText('A test skill for unit testing')).toBeInTheDocument();
    });

    it('should render author when provided', () => {
      render(<SkillCard skill={mockSkill} />);

      expect(screen.getByText('by Test Author')).toBeInTheDocument();
    });

    it('should not render author in compact mode', () => {
      render(<SkillCard skill={mockSkill} compact />);

      expect(screen.queryByText('by Test Author')).not.toBeInTheDocument();
    });

    it('should not render description in compact mode', () => {
      render(<SkillCard skill={mockSkill} compact />);

      expect(screen.queryByText('A test skill for unit testing')).not.toBeInTheDocument();
    });
  });

  describe('Status Badge', () => {
    it('should show inactive status', () => {
      render(<SkillCard skill={mockSkill} />);

      expect(screen.getByText('Inactive')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Inactive')).toBeInTheDocument();
    });

    it('should show active status', () => {
      const activeSkill = { ...mockSkill, status: 'active' as const };
      render(<SkillCard skill={activeSkill} />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Active')).toBeInTheDocument();
    });

    it('should show error status', () => {
      const errorSkill = { ...mockSkill, status: 'error' as const };
      render(<SkillCard skill={errorSkill} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: Error')).toBeInTheDocument();
    });
  });

  describe('Action Buttons - Inactive Skill', () => {
    it('should show Activate button when skill is inactive', () => {
      const onActivate = jest.fn();
      render(<SkillCard skill={mockSkill} onActivate={onActivate} />);

      const activateButton = screen.getByRole('button', { name: /activate test-skill/i });
      expect(activateButton).toBeInTheDocument();
    });

    it('should call onActivate when Activate button is clicked', () => {
      const onActivate = jest.fn();
      render(<SkillCard skill={mockSkill} onActivate={onActivate} />);

      const activateButton = screen.getByRole('button', { name: /activate test-skill/i });
      fireEvent.click(activateButton);

      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('should show Details button when skill is inactive', () => {
      const onViewDetails = jest.fn();
      render(<SkillCard skill={mockSkill} onViewDetails={onViewDetails} />);

      const detailsButton = screen.getByRole('button', { name: /view details for test-skill/i });
      expect(detailsButton).toBeInTheDocument();
    });

    it('should disable Activate button when skill has error', () => {
      const errorSkill = { ...mockSkill, status: 'error' as const };
      const onActivate = jest.fn();
      render(<SkillCard skill={errorSkill} onActivate={onActivate} />);

      const activateButton = screen.getByRole('button', { name: /activate test-skill/i });
      expect(activateButton).toBeDisabled();
    });
  });

  describe('Action Buttons - Active Skill', () => {
    const activeSkill = { ...mockSkill, status: 'active' as const };

    it('should show Details button when skill is active', () => {
      const onViewDetails = jest.fn();
      render(<SkillCard skill={activeSkill} onViewDetails={onViewDetails} />);

      const detailsButton = screen.getByRole('button', { name: /view details for test-skill/i });
      expect(detailsButton).toBeInTheDocument();
    });

    it('should show Deactivate button when skill is active', () => {
      const onDeactivate = jest.fn();
      render(<SkillCard skill={activeSkill} onDeactivate={onDeactivate} />);

      const deactivateButton = screen.getByRole('button', { name: /deactivate test-skill/i });
      expect(deactivateButton).toBeInTheDocument();
    });

    it('should call onDeactivate when Deactivate button is clicked', () => {
      const onDeactivate = jest.fn();
      render(<SkillCard skill={activeSkill} onDeactivate={onDeactivate} />);

      const deactivateButton = screen.getByRole('button', { name: /deactivate test-skill/i });
      fireEvent.click(deactivateButton);

      expect(onDeactivate).toHaveBeenCalledTimes(1);
    });

    it('should not show Activate button when skill is active', () => {
      render(<SkillCard skill={activeSkill} />);

      expect(screen.queryByRole('button', { name: /activate test-skill/i })).not.toBeInTheDocument();
    });
  });

  describe('Card Click', () => {
    it('should call onClick when card is clicked', () => {
      const onClick = jest.fn();
      render(<SkillCard skill={mockSkill} onClick={onClick} />);

      const card = screen.getByRole('button');
      fireEvent.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when action button is clicked', () => {
      const onClick = jest.fn();
      const onActivate = jest.fn();
      render(<SkillCard skill={mockSkill} onClick={onClick} onActivate={onActivate} />);

      const activateButton = screen.getByRole('button', { name: /activate test-skill/i });
      fireEvent.click(activateButton);

      expect(onClick).not.toHaveBeenCalled();
      expect(onActivate).toHaveBeenCalledTimes(1);
    });

    it('should support keyboard navigation when onClick is provided', () => {
      const onClick = jest.fn();
      render(<SkillCard skill={mockSkill} onClick={onClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: 'Enter' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should support space key when onClick is provided', () => {
      const onClick = jest.fn();
      render(<SkillCard skill={mockSkill} onClick={onClick} />);

      const card = screen.getByRole('button');
      fireEvent.keyDown(card, { key: ' ' });

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('More Options Button', () => {
    it('should render more options button', () => {
      render(<SkillCard skill={mockSkill} />);

      const moreButton = screen.getByRole('button', { name: /more options for test-skill/i });
      expect(moreButton).toBeInTheDocument();
    });

    it('should not call onClick when more options button is clicked', () => {
      const onClick = jest.fn();
      render(<SkillCard skill={mockSkill} onClick={onClick} />);

      const moreButton = screen.getByRole('button', { name: /more options for test-skill/i });
      fireEvent.click(moreButton);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-labels for buttons', () => {
      const onActivate = jest.fn();
      const onViewDetails = jest.fn();
      render(<SkillCard skill={mockSkill} onActivate={onActivate} onViewDetails={onViewDetails} />);

      expect(screen.getByLabelText('Activate test-skill')).toBeInTheDocument();
      expect(screen.getByLabelText('View details for test-skill')).toBeInTheDocument();
      expect(screen.getByLabelText('More options for test-skill')).toBeInTheDocument();
    });

    it('should have proper role when clickable', () => {
      const onClick = jest.fn();
      render(<SkillCard skill={mockSkill} onClick={onClick} />);

      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when not clickable', () => {
      render(<SkillCard skill={mockSkill} />);

      const cards = screen.queryAllByRole('button');
      // Should only have action buttons, not the card itself
      expect(cards.length).toBeGreaterThan(0);
      expect(cards.every(card => card.tagName === 'BUTTON')).toBe(true);
    });
  });
});
