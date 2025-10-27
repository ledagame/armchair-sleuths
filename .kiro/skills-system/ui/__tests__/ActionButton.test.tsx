/**
 * Tests for ActionButton Component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButton } from '../ActionButton';

describe('ActionButton', () => {
  const defaultProps = {
    scriptName: 'test:script',
    description: 'Test script description',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render script name and description', () => {
      render(<ActionButton {...defaultProps} />);

      expect(screen.getByText('test:script')).toBeInTheDocument();
      expect(screen.getByText('Test script description')).toBeInTheDocument();
    });

    it('should render default icon when no icon provided', () => {
      render(<ActionButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('▶');
    });

    it('should render custom icon when provided', () => {
      render(<ActionButton {...defaultProps} icon="🧪" />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('🧪');
    });

    it('should render arrow indicator', () => {
      render(<ActionButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('→');
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', () => {
      const onClick = jest.fn();
      render(<ActionButton {...defaultProps} onClick={onClick} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when disabled', () => {
      const onClick = jest.fn();
      render(<ActionButton {...defaultProps} onClick={onClick} disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should not call onClick when executing', () => {
      const onClick = jest.fn();
      render(<ActionButton {...defaultProps} onClick={onClick} isExecuting />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<ActionButton {...defaultProps} disabled />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should show executing state', () => {
      render(<ActionButton {...defaultProps} isExecuting />);

      expect(screen.getByText('Executing...')).toBeInTheDocument();
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should show hourglass icon when executing', () => {
      render(<ActionButton {...defaultProps} isExecuting />);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('⏳');
    });

    it('should not show arrow when executing', () => {
      render(<ActionButton {...defaultProps} isExecuting />);

      const button = screen.getByRole('button');
      expect(button).not.toHaveTextContent('→');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant styles', () => {
      render(<ActionButton {...defaultProps} variant="primary" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('border-blue-300');
      expect(button.className).toContain('bg-blue-50');
    });

    it('should apply secondary variant styles', () => {
      render(<ActionButton {...defaultProps} variant="secondary" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('border-gray-300');
      expect(button.className).toContain('bg-gray-50');
    });

    it('should apply danger variant styles', () => {
      render(<ActionButton {...defaultProps} variant="danger" />);

      const button = screen.getByRole('button');
      expect(button.className).toContain('border-red-300');
      expect(button.className).toContain('bg-red-50');
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      render(<ActionButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute(
        'aria-label',
        'Execute test:script: Test script description'
      );
    });

    it('should have aria-busy when executing', () => {
      render(<ActionButton {...defaultProps} isExecuting />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should not have aria-busy when not executing', () => {
      render(<ActionButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'false');
    });
  });
});
