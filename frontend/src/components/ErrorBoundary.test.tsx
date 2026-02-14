import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

describe('ErrorBoundary Unit Tests', () => {
  beforeEach(() => {
    // Suppress console.error for cleaner test output
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Error Catching', () => {
    it('catches errors thrown by child components', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should display error UI instead of crashing
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('displays error message from caught error', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should display the error message
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('renders children when no error occurs', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should render the child component normally
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('calls onError callback when error is caught', () => {
      const onError = vi.fn();

      render(
        <TestWrapper>
          <ErrorBoundary onError={onError}>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // onError should have been called
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });

    it('logs error to console', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Console.error should have been called
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Error Message Display', () => {
    it('displays default error message when no error message provided', () => {
      const ThrowErrorWithoutMessage: React.FC = () => {
        throw new Error();
      };

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowErrorWithoutMessage />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should display fallback error message
      expect(screen.getByText(/failed to load content/i)).toBeInTheDocument();
    });

    it('displays error icon', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Check for error icon (SVG)
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    it('displays error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should show details section
      expect(screen.getByText(/error details/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should not show details section
      expect(screen.queryByText(/error details/i)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Retry Functionality', () => {
    it('displays retry button', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should display retry button
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('resets error state when retry button is clicked', () => {
      const { rerender } = render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Error UI should be displayed
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Re-render with non-throwing component
      rerender(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError shouldThrow={false} />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should render children normally
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('attempts to re-render children after retry', () => {
      let shouldThrow = true;

      const ConditionalThrow: React.FC = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Success!</div>;
      };

      const { rerender } = render(
        <TestWrapper>
          <ErrorBoundary>
            <ConditionalThrow />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Error UI should be displayed
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Force re-render
      rerender(
        <TestWrapper>
          <ErrorBoundary>
            <ConditionalThrow />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should render successfully
      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error UI</div>;

      render(
        <TestWrapper>
          <ErrorBoundary fallback={customFallback}>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should render custom fallback
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('uses default fallback when custom fallback not provided', () => {
      render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should render default fallback
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Multiple Errors', () => {
    it('handles multiple errors from different children', () => {
      const ThrowError1: React.FC = () => {
        throw new Error('Error 1');
      };

      const ThrowError2: React.FC = () => {
        throw new Error('Error 2');
      };

      const { rerender } = render(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError1 />
          </ErrorBoundary>
        </TestWrapper>
      );

      // First error should be displayed
      expect(screen.getByText('Error 1')).toBeInTheDocument();

      // Rerender with different error
      rerender(
        <TestWrapper>
          <ErrorBoundary>
            <ThrowError2 />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should still show error UI (may show first error until reset)
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('resets state between different error instances', () => {
      let errorMessage = 'First error';

      const DynamicError: React.FC = () => {
        throw new Error(errorMessage);
      };

      const { rerender } = render(
        <TestWrapper>
          <ErrorBoundary>
            <DynamicError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // First error
      expect(screen.getByText('First error')).toBeInTheDocument();

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      // Change error message
      errorMessage = 'Second error';

      // Rerender
      rerender(
        <TestWrapper>
          <ErrorBoundary>
            <DynamicError />
          </ErrorBoundary>
        </TestWrapper>
      );

      // Should show new error
      expect(screen.getByText('Second error')).toBeInTheDocument();
    });
  });

  describe('Nested ErrorBoundaries', () => {
    it('inner boundary catches errors before outer boundary', () => {
      const innerOnError = vi.fn();
      const outerOnError = vi.fn();

      render(
        <TestWrapper>
          <ErrorBoundary onError={outerOnError}>
            <div>Outer boundary</div>
            <ErrorBoundary onError={innerOnError}>
              <ThrowError />
            </ErrorBoundary>
          </ErrorBoundary>
        </TestWrapper>
      );

      // Inner boundary should catch the error
      expect(innerOnError).toHaveBeenCalledTimes(1);
      expect(outerOnError).not.toHaveBeenCalled();

      // Inner boundary error UI should be displayed
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });

    it('outer boundary catches errors from inner boundary if inner fails', () => {
      const BrokenErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        // This simulates a broken error boundary
        return <>{children}</>;
      };

      const outerOnError = vi.fn();

      render(
        <TestWrapper>
          <ErrorBoundary onError={outerOnError}>
            <BrokenErrorBoundary>
              <ThrowError />
            </BrokenErrorBoundary>
          </ErrorBoundary>
        </TestWrapper>
      );

      // Outer boundary should catch the error
      expect(outerOnError).toHaveBeenCalledTimes(1);
    });
  });
});
