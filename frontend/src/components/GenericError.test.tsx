import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { GenericError } from './GenericError';

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

describe('GenericError Unit Tests', () => {
  describe('Basic Rendering', () => {
    it('renders default error message', () => {
      render(
        <TestWrapper>
          <GenericError />
        </TestWrapper>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('renders custom title when provided', () => {
      const customTitle = 'Custom Error Title';

      render(
        <TestWrapper>
          <GenericError title={customTitle} />
        </TestWrapper>
      );

      expect(screen.getByText(customTitle)).toBeInTheDocument();
    });

    it('renders custom message when provided', () => {
      const customMessage = 'This is a custom error message';

      render(
        <TestWrapper>
          <GenericError message={customMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('does not render message when not provided', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError />
        </TestWrapper>
      );

      // Should only show title, no additional message paragraph
      const paragraphs = container.querySelectorAll('p');
      expect(paragraphs.length).toBe(0);
    });
  });

  describe('Icon Types', () => {
    it('renders error icon by default', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError />
        </TestWrapper>
      );

      // Check for red color scheme (error)
      const iconContainer = container.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('text-red-600');
    });

    it('renders warning icon when icon prop is warning', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError icon="warning" />
        </TestWrapper>
      );

      // Check for yellow color scheme (warning)
      const iconContainer = container.querySelector('.bg-yellow-100');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('text-yellow-600');
    });

    it('renders info icon when icon prop is info', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError icon="info" />
        </TestWrapper>
      );

      // Check for blue color scheme (info)
      const iconContainer = container.querySelector('.bg-blue-100');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('text-blue-600');
    });

    it('renders error icon when icon prop is error', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError icon="error" />
        </TestWrapper>
      );

      // Check for red color scheme (error)
      const iconContainer = container.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('text-red-600');
    });
  });

  describe('Retry Button', () => {
    it('displays retry button by default when onRetry is provided', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <GenericError onRetry={onRetry} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <GenericError onRetry={onRetry} />
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
          <GenericError onRetry={onRetry} showRetry={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('hides retry button when onRetry is not provided', () => {
      render(
        <TestWrapper>
          <GenericError showRetry={true} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('shows retry button when both onRetry and showRetry are provided', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <GenericError onRetry={onRetry} showRetry={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for centering', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError />
        </TestWrapper>
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies correct color scheme for error type', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError icon="error" />
        </TestWrapper>
      );

      const iconContainer = container.querySelector('.bg-red-100.text-red-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('applies correct color scheme for warning type', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError icon="warning" />
        </TestWrapper>
      );

      const iconContainer = container.querySelector('.bg-yellow-100.text-yellow-600');
      expect(iconContainer).toBeInTheDocument();
    });

    it('applies correct color scheme for info type', () => {
      const { container } = render(
        <TestWrapper>
          <GenericError icon="info" />
        </TestWrapper>
      );

      const iconContainer = container.querySelector('.bg-blue-100.text-blue-600');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible button when retry is shown', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <GenericError onRetry={onRetry} />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /try again/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName();
    });

    it('has proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <GenericError />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent(/something went wrong/i);
    });

    it('has proper heading with custom title', () => {
      const customTitle = 'Custom Error';

      render(
        <TestWrapper>
          <GenericError title={customTitle} />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent(customTitle);
    });
  });

  describe('Multiple Retry Clicks', () => {
    it('handles multiple retry button clicks', () => {
      const onRetry = vi.fn();

      render(
        <TestWrapper>
          <GenericError onRetry={onRetry} />
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
    it('renders with empty title string', () => {
      render(
        <TestWrapper>
          <GenericError title="" />
        </TestWrapper>
      );

      // Should render with empty title
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('renders with empty message string', () => {
      render(
        <TestWrapper>
          <GenericError message="" />
        </TestWrapper>
      );

      // Should still render the component
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('renders with very long title', () => {
      const longTitle = 'A'.repeat(200);

      render(
        <TestWrapper>
          <GenericError title={longTitle} />
        </TestWrapper>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('renders with very long message', () => {
      const longMessage = 'B'.repeat(500);

      render(
        <TestWrapper>
          <GenericError message={longMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('renders with special characters in title', () => {
      const specialTitle = 'Error: <script>alert("test")</script>';

      render(
        <TestWrapper>
          <GenericError title={specialTitle} />
        </TestWrapper>
      );

      // Should render as text, not execute script
      expect(screen.getByText(specialTitle)).toBeInTheDocument();
    });

    it('renders with special characters in message', () => {
      const specialMessage = 'Message: <img src=x onerror=alert(1)>';

      render(
        <TestWrapper>
          <GenericError message={specialMessage} />
        </TestWrapper>
      );

      // Should render as text, not execute script
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('renders with all props provided', () => {
      const onRetry = vi.fn();
      const title = 'Custom Title';
      const message = 'Custom Message';

      render(
        <TestWrapper>
          <GenericError
            title={title}
            message={message}
            onRetry={onRetry}
            showRetry={true}
            icon="warning"
          />
        </TestWrapper>
      );

      expect(screen.getByText(title)).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();

      const { container } = render(
        <TestWrapper>
          <GenericError icon="warning" />
        </TestWrapper>
      );
      const iconContainer = container.querySelector('.bg-yellow-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('renders with minimal props', () => {
      render(
        <TestWrapper>
          <GenericError />
        </TestWrapper>
      );

      // Should render with defaults
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
