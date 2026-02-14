import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { NotFound } from './NotFound';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </BrowserRouter>
  );
};

describe('NotFound Unit Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Basic Rendering', () => {
    it('renders 404 error message', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it('renders not found icon', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      // Check for SVG icon
      const svg = screen.getByRole('img', { hidden: true });
      expect(svg).toBeInTheDocument();
    });

    it('renders custom message when provided', () => {
      const customMessage = 'The page you are looking for does not exist';

      render(
        <TestWrapper>
          <NotFound message={customMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('does not render custom message when not provided', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      // Should only show default 404 message
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });
  });

  describe('Home Button', () => {
    it('displays home button by default', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });

    it('navigates to home when home button is clicked', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('hides home button when showHomeButton is false', () => {
      render(
        <TestWrapper>
          <NotFound showHomeButton={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('button', { name: /home/i })).not.toBeInTheDocument();
    });

    it('shows home button when showHomeButton is true', () => {
      render(
        <TestWrapper>
          <NotFound showHomeButton={true} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct CSS classes for centering', () => {
      const { container } = render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies gray color scheme for not found errors', () => {
      const { container } = render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      // Check for gray background on icon container
      const iconContainer = container.querySelector('.bg-gray-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('has minimum height for proper centering', () => {
      const { container } = render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-[60vh]');
    });
  });

  describe('Accessibility', () => {
    it('has accessible button when home button is shown', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /home/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAccessibleName();
    });

    it('has proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('404');

      const h3 = screen.getByRole('heading', { level: 3 });
      expect(h3).toHaveTextContent(/page not found/i);
    });
  });

  describe('Multiple Home Button Clicks', () => {
    it('handles multiple home button clicks', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      
      fireEvent.click(homeButton);
      fireEvent.click(homeButton);
      fireEvent.click(homeButton);

      expect(mockNavigate).toHaveBeenCalledTimes(3);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty message string', () => {
      render(
        <TestWrapper>
          <NotFound message="" />
        </TestWrapper>
      );

      // Should still render the component
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    });

    it('renders with very long message', () => {
      const longMessage = 'A'.repeat(500);

      render(
        <TestWrapper>
          <NotFound message={longMessage} />
        </TestWrapper>
      );

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('renders with special characters in message', () => {
      const specialMessage = 'Error: <script>alert("test")</script>';

      render(
        <TestWrapper>
          <NotFound message={specialMessage} />
        </TestWrapper>
      );

      // Should render as text, not execute script
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('renders without router context gracefully', () => {
      // This tests that the component doesn't crash if router is missing
      // In real usage, it should always be wrapped in a router
      const { container } = render(
        <I18nextProvider i18n={i18n}>
          <NotFound showHomeButton={false} />
        </I18nextProvider>
      );

      expect(container).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
    });
  });

  describe('Integration with Router', () => {
    it('uses navigate from react-router-dom', () => {
      render(
        <TestWrapper>
          <NotFound />
        </TestWrapper>
      );

      const homeButton = screen.getByRole('button', { name: /home/i });
      fireEvent.click(homeButton);

      // Verify that the mocked navigate was called
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
