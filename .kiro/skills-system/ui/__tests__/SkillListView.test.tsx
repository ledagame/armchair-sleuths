/**
 * Tests for SkillListView Component
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { SkillListView } from '../SkillListView';
import type { Skill } from '../../core/types';

const createMockSkill = (overrides: Partial<Skill> = {}): Skill => ({
  metadata: {
    name: 'test-skill',
    version: '1.0.0',
    description: 'A test skill',
    triggers: ['test'],
    dependencies: {},
    capabilities: [],
  },
  promptContent: 'Test prompt',
  path: '/path/to/skill',
  lastModified: new Date('2025-01-01'),
  status: 'inactive',
  ...overrides,
});

const mockSkills: Skill[] = [
  createMockSkill({
    metadata: {
      name: 'skill-one',
      version: '1.0.0',
      description: 'First test skill',
      triggers: ['one'],
      dependencies: {},
      capabilities: [],
    },
    status: 'active',
  }),
  createMockSkill({
    metadata: {
      name: 'skill-two',
      version: '2.0.0',
      description: 'Second test skill',
      triggers: ['two'],
      dependencies: {},
      capabilities: [],
    },
    status: 'inactive',
  }),
  createMockSkill({
    metadata: {
      name: 'skill-three',
      version: '1.5.0',
      description: 'Third test skill',
      triggers: ['three'],
      dependencies: {},
      capabilities: [],
    },
    status: 'error',
  }),
];

describe('SkillListView', () => {
  const defaultProps = {
    skills: mockSkills,
  };

  describe('Rendering', () => {
    it('should render the title', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByText('Skills')).toBeInTheDocument();
    });

    it('should render skill count', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByText('3 of 3 skills')).toBeInTheDocument();
    });

    it('should render all skills', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByText('skill-one')).toBeInTheDocument();
      expect(screen.getByText('skill-two')).toBeInTheDocument();
      expect(screen.getByText('skill-three')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByLabelText('Search skills')).toBeInTheDocument();
    });

    it('should render filter buttons', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /inactive/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /error/i })).toBeInTheDocument();
    });

    it('should render sort dropdown', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByLabelText('Sort skills')).toBeInTheDocument();
    });
  });

  describe('Search', () => {
    it('should filter skills by name', () => {
      render(<SkillListView {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search skills');
      fireEvent.change(searchInput, { target: { value: 'skill-one' } });

      expect(screen.getByText('skill-one')).toBeInTheDocument();
      expect(screen.queryByText('skill-two')).not.toBeInTheDocument();
      expect(screen.queryByText('skill-three')).not.toBeInTheDocument();
    });

    it('should filter skills by description', () => {
      render(<SkillListView {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search skills');
      fireEvent.change(searchInput, { target: { value: 'Second' } });

      expect(screen.queryByText('skill-one')).not.toBeInTheDocument();
      expect(screen.getByText('skill-two')).toBeInTheDocument();
      expect(screen.queryByText('skill-three')).not.toBeInTheDocument();
    });

    it('should filter skills by trigger', () => {
      render(<SkillListView {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search skills');
      fireEvent.change(searchInput, { target: { value: 'three' } });

      expect(screen.queryByText('skill-one')).not.toBeInTheDocument();
      expect(screen.queryByText('skill-two')).not.toBeInTheDocument();
      expect(screen.getByText('skill-three')).toBeInTheDocument();
    });

    it('should show clear button when search has value', () => {
      render(<SkillListView {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search skills');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('should clear search when clear button is clicked', () => {
      render(<SkillListView {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search skills') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'test' } });

      const clearButton = screen.getByLabelText('Clear search');
      fireEvent.click(clearButton);

      expect(searchInput.value).toBe('');
    });

    it('should show no results message when search has no matches', () => {
      render(<SkillListView {...defaultProps} />);

      const searchInput = screen.getByLabelText('Search skills');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No skills found')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should filter by active status', () => {
      render(<SkillListView {...defaultProps} />);

      const activeButton = screen.getByRole('button', { name: /active/i });
      fireEvent.click(activeButton);

      expect(screen.getByText('skill-one')).toBeInTheDocument();
      expect(screen.queryByText('skill-two')).not.toBeInTheDocument();
      expect(screen.queryByText('skill-three')).not.toBeInTheDocument();
    });

    it('should filter by inactive status', () => {
      render(<SkillListView {...defaultProps} />);

      const inactiveButton = screen.getByRole('button', { name: /inactive/i });
      fireEvent.click(inactiveButton);

      expect(screen.queryByText('skill-one')).not.toBeInTheDocument();
      expect(screen.getByText('skill-two')).toBeInTheDocument();
      expect(screen.queryByText('skill-three')).not.toBeInTheDocument();
    });

    it('should filter by error status', () => {
      render(<SkillListView {...defaultProps} />);

      const errorButton = screen.getByRole('button', { name: /error/i });
      fireEvent.click(errorButton);

      expect(screen.queryByText('skill-one')).not.toBeInTheDocument();
      expect(screen.queryByText('skill-two')).not.toBeInTheDocument();
      expect(screen.getByText('skill-three')).toBeInTheDocument();
    });

    it('should show all skills when all filter is selected', () => {
      render(<SkillListView {...defaultProps} />);

      // First filter by active
      fireEvent.click(screen.getByRole('button', { name: /active/i }));
      
      // Then click all
      fireEvent.click(screen.getByRole('button', { name: /all/i }));

      expect(screen.getByText('skill-one')).toBeInTheDocument();
      expect(screen.getByText('skill-two')).toBeInTheDocument();
      expect(screen.getByText('skill-three')).toBeInTheDocument();
    });

    it('should display correct counts for each filter', () => {
      render(<SkillListView {...defaultProps} />);

      expect(screen.getByText(/all.*\(3\)/i)).toBeInTheDocument();
      expect(screen.getByText(/active.*\(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/inactive.*\(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/error.*\(1\)/i)).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should sort by name', () => {
      render(<SkillListView {...defaultProps} />);

      const sortSelect = screen.getByLabelText('Sort skills');
      fireEvent.change(sortSelect, { target: { value: 'name' } });

      const skillCards = screen.getAllByText(/skill-/);
      expect(skillCards[0]).toHaveTextContent('skill-one');
      expect(skillCards[1]).toHaveTextContent('skill-three');
      expect(skillCards[2]).toHaveTextContent('skill-two');
    });

    it('should sort by status', () => {
      render(<SkillListView {...defaultProps} />);

      const sortSelect = screen.getByLabelText('Sort skills');
      fireEvent.change(sortSelect, { target: { value: 'status' } });

      // Status order: active, error, inactive
      const skillCards = screen.getAllByText(/skill-/);
      expect(skillCards[0]).toHaveTextContent('skill-one'); // active
      expect(skillCards[1]).toHaveTextContent('skill-three'); // error
      expect(skillCards[2]).toHaveTextContent('skill-two'); // inactive
    });
  });

  describe('Skill Panel', () => {
    it('should open panel when skill card is clicked', () => {
      render(<SkillListView {...defaultProps} />);

      const skillCard = screen.getByText('skill-one').closest('div');
      if (skillCard) {
        fireEvent.click(skillCard);
      }

      // Panel should be visible
      expect(screen.getByLabelText('Close panel')).toBeInTheDocument();
    });

    it('should close panel when close button is clicked', () => {
      render(<SkillListView {...defaultProps} />);

      // Open panel
      const skillCard = screen.getByText('skill-one').closest('div');
      if (skillCard) {
        fireEvent.click(skillCard);
      }

      // Close panel
      const closeButton = screen.getByLabelText('Close panel');
      fireEvent.click(closeButton);

      // Panel should be closed
      expect(screen.queryByLabelText('Close panel')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading message when isLoading is true', () => {
      render(<SkillListView {...defaultProps} isLoading />);

      expect(screen.getByText('Loading skills...')).toBeInTheDocument();
    });

    it('should not show skills when loading', () => {
      render(<SkillListView {...defaultProps} isLoading />);

      expect(screen.queryByText('skill-one')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no skills', () => {
      render(<SkillListView skills={[]} />);

      expect(screen.getByText('No skills found')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('should call onActivateSkill when activate button is clicked', () => {
      const onActivateSkill = jest.fn();
      render(<SkillListView {...defaultProps} onActivateSkill={onActivateSkill} />);

      // Find inactive skill and click activate
      const skillTwoCard = screen.getByText('skill-two').closest('div')?.parentElement;
      if (skillTwoCard) {
        const activateButton = within(skillTwoCard).getByRole('button', { name: /activate skill-two/i });
        fireEvent.click(activateButton);
      }

      expect(onActivateSkill).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ name: 'skill-two' }),
        })
      );
    });
  });
});
