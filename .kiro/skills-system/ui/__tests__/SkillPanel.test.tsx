/**
 * Tests for SkillPanel Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillPanel } from '../SkillPanel';
import type { Skill } from '../../core/types';

const mockSkill: Skill = {
  metadata: {
    name: 'test-skill',
    version: '1.0.0',
    description: 'A test skill for unit testing',
    author: 'Test Author',
    triggers: ['test', 'example'],
    dependencies: {},
    capabilities: [
      {
        name: 'test-capability',
        description: 'A test capability',
        examples: ['Example 1', 'Example 2'],
      },
    ],
    npmScripts: {
      'test:run': 'npm test',
      'build': 'npm run build',
    },
  },
  promptContent: 'Test prompt content',
  readmeContent: '# Test README\n\nThis is a test README file.',
  path: '/path/to/skill',
  lastModified: new Date('2025-01-01'),
  status: 'inactive',
};

describe('SkillPanel', () => {
  const defaultProps = {
    skill: mockSkill,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render skill name and version', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText('test-skill')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
    });

    it('should render all three tabs', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /scripts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /examples/i })).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByLabelText('Close panel')).toBeInTheDocument();
    });

    it('should show Overview tab by default', () => {
      render(<SkillPanel {...defaultProps} />);

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Close Button', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = jest.fn();
      render(<SkillPanel {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Close panel');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tab Navigation', () => {
    it('should switch to Scripts tab when clicked', () => {
      render(<SkillPanel {...defaultProps} />);

      const scriptsTab = screen.getByRole('tab', { name: /scripts/i });
      fireEvent.click(scriptsTab);

      expect(scriptsTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Available Scripts')).toBeInTheDocument();
    });

    it('should switch to Examples tab when clicked', () => {
      render(<SkillPanel {...defaultProps} />);

      const examplesTab = screen.getByRole('tab', { name: /examples/i });
      fireEvent.click(examplesTab);

      expect(examplesTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Usage Examples')).toBeInTheDocument();
    });

    it('should switch back to Overview tab', () => {
      render(<SkillPanel {...defaultProps} />);

      // Switch to Scripts
      fireEvent.click(screen.getByRole('tab', { name: /scripts/i }));
      
      // Switch back to Overview
      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      fireEvent.click(overviewTab);

      expect(overviewTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    it('should display skill description', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText('A test skill for unit testing')).toBeInTheDocument();
    });

    it('should display author', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('should display trigger keywords', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText('test')).toBeInTheDocument();
      expect(screen.getByText('example')).toBeInTheDocument();
    });

    it('should display capabilities', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText('test-capability')).toBeInTheDocument();
      expect(screen.getByText('A test capability')).toBeInTheDocument();
    });

    it('should display README content', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText(/Test README/)).toBeInTheDocument();
    });
  });

  describe('Scripts Tab', () => {
    it('should display available scripts', () => {
      render(<SkillPanel {...defaultProps} />);

      fireEvent.click(screen.getByRole('tab', { name: /scripts/i }));

      expect(screen.getByText('test:run')).toBeInTheDocument();
      expect(screen.getByText('build')).toBeInTheDocument();
    });

    it('should call onExecuteScript when script button is clicked', () => {
      const onExecuteScript = jest.fn();
      render(<SkillPanel {...defaultProps} onExecuteScript={onExecuteScript} />);

      fireEvent.click(screen.getByRole('tab', { name: /scripts/i }));

      const scriptButtons = screen.getAllByRole('button', { name: /execute/i });
      fireEvent.click(scriptButtons[0]);

      expect(onExecuteScript).toHaveBeenCalledWith('test:run', 'npm test');
    });

    it('should show empty state when no scripts available', () => {
      const skillWithoutScripts = {
        ...mockSkill,
        metadata: {
          ...mockSkill.metadata,
          npmScripts: undefined,
        },
      };

      render(<SkillPanel {...defaultProps} skill={skillWithoutScripts} />);

      fireEvent.click(screen.getByRole('tab', { name: /scripts/i }));

      expect(screen.getByText('No scripts available for this skill')).toBeInTheDocument();
    });
  });

  describe('Examples Tab', () => {
    it('should display examples', () => {
      render(<SkillPanel {...defaultProps} />);

      fireEvent.click(screen.getByRole('tab', { name: /examples/i }));

      expect(screen.getByText('Example 1')).toBeInTheDocument();
      expect(screen.getByText('Example 2')).toBeInTheDocument();
    });

    it('should show empty state when no examples available', () => {
      const skillWithoutExamples = {
        ...mockSkill,
        metadata: {
          ...mockSkill.metadata,
          capabilities: [],
        },
      };

      render(<SkillPanel {...defaultProps} skill={skillWithoutExamples} />);

      fireEvent.click(screen.getByRole('tab', { name: /examples/i }));

      expect(screen.getByText('No examples available for this skill')).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('should display last modified date', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText(/Last modified:/)).toBeInTheDocument();
    });

    it('should display skill status', () => {
      render(<SkillPanel {...defaultProps} />);

      expect(screen.getByText(/Status:/)).toBeInTheDocument();
      expect(screen.getByText('inactive')).toBeInTheDocument();
    });
  });

  describe('Executing Script State', () => {
    it('should show executing state for the running script', () => {
      render(<SkillPanel {...defaultProps} executingScript="test:run" />);

      fireEvent.click(screen.getByRole('tab', { name: /scripts/i }));

      // ActionButton should show executing state
      const buttons = screen.getAllByRole('button');
      const executingButton = buttons.find(btn => btn.textContent?.includes('test:run'));
      expect(executingButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes for tabs', () => {
      render(<SkillPanel {...defaultProps} />);

      const overviewTab = screen.getByRole('tab', { name: /overview/i });
      expect(overviewTab).toHaveAttribute('aria-selected');
      expect(overviewTab).toHaveAttribute('aria-controls');
    });

    it('should have proper role for tab panels', () => {
      render(<SkillPanel {...defaultProps} />);

      const panel = screen.getByRole('tabpanel');
      expect(panel).toBeInTheDocument();
    });
  });
});
