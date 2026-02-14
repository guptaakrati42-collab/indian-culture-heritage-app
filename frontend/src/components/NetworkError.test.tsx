import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { NetworkError } from './NetworkError';

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

describe('NetworkError Unit Tests', () => {
  describe('Basic Rendering', () => {
    it('renders network error message', () => {
      render(
        <TestWrapper>
          <NetworkError />
        </TestWrapper>
      );

      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('renders network error icon', () => {
      render(
        <TestWrapper>
          <NetworkError />
        </TestWrapper>
      );

      // Check for SVG icon
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    it('renders custom message when provided', () => {
      const customMessage = 'Unable to connect to server';

      render(
        <TestWrapper>
          <NetworkError message={customMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('does not render custom message when not provided', () => {
      render(
        <TestWrapper>
          <NetworkError />
        </TestWrapper>
      );

      // Should only show default network error message
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('displays retry button by default', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <NetworkError onRetry={onRetry} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <NetworkError onRetry={onRetry} />
        </TestWrapper>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('hides retry button when showRetry is false', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <NetworkError onRetry={onRetry} showRetry={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('hides retry button when onRetry is not provided', () => {
      render(
        <TestWrapper>
          <NetworkError showRetry={true} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('shows retry button when both onRetry and showRetry are provided', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <NetworkError onRetry={onRetry} showRetry={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for centering', () => {
      const { container } = render(
        <TestWrapper>
          <NetworkError />
        </TestWrapper>
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies orange color scheme for network errors', () => {
      const { container } = render(
        <TestWrapper>
          <NetworkError />
        </TestWrapper>
      );

      // Check for orange background on icon container
      const iconContainer = container.querySelector('.bg-orange-100');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button when retry is shown', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <NetworkError onRetry={onRetry} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName();
    });

    it('has proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <NetworkError />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/network error/i);
    });
  });

  describe('Multiple Retry Clicks', () => {
    it('handles multiple retry button clicks', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <NetworkError onRetry={onRetry} />
        </TestWrapper>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);
      fireEvent.click(retryButton);

      expect(onRetry).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty message string', () => {
      render(
        <TestWrapper>
          <NetworkError message="" />
        </TestWrapper>
      );

      // Should still render the component
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('renders with very long message', () => {
      const longMessage = 'A'.repeat(500);

      render(
        <TestWrapper>
          <NetworkError message={longMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('renders with special characters in message', () => {
      const specialMessage = 'Error: <script>alert("test")</script>';

      render(
        <TestWrapper>
          <NetworkError message={specialMessage} />
        </TestWrapper>
      );

      // Should render as text, not execute script
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });
});
