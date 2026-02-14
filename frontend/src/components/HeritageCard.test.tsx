import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HeritageCard from './HeritageCard';

// Mock the useHeritageDetail hook
const mockUseHeritageDetail = vi.fn();
vi.mock('../hooks/useHeritage', () => ({
  useHeritageDetail: (...args: any[]) => mockUseHeritageDetail(...args),
}));

// Helper to create a QueryClient for tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('HeritageCard Component - Unit Tests', () => {
  const mockHeritage = {
    id: 'heritage-1',
    name: 'Taj Mahal',
    category: 'monuments' as const,
    summary: 'An ivory-white marble mausoleum on the right bank of the river Yamuna.',
    thumbnailImage: '/images/taj-mahal.jpg',
  };

  const mockHeritageDetail = {
    id: 'heritage-1',
    name: 'Taj Mahal',
    category: 'monuments',
    summary: 'An ivory-white marble mausoleum on the right bank of the river Yamuna.',
    thumbnailImage: '/images/taj-mahal.jpg',
    detailedDescription:
      'The Taj Mahal was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal.',
    historicalPeriod: '1632-1653 CE',
    significance:
      'Considered the finest example of Mughal architecture, combining elements from Islamic, Persian, Ottoman Turkish and Indian architectural styles.',
    images: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    mockUseHeritageDetail.mockImplementation((heritageId, language, enabled) => {
      if (!enabled) {
        return { data: undefined, isLoading: false, error: null };
      }
      return {
        data: mockHeritageDetail,
        isLoading: false,
        error: null,
      };
    });
  });

  /**
   * Test: Initial collapsed state
   * Validates: Requirements 3.2
   */
  describe('Initial collapsed state', () => {
    it('should render heritage card in collapsed state by default', () => {
      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Heritage name should be visible
      expect(screen.getByText('Taj Mahal')).toBeInTheDocument();

      // Category should be visible
      expect(screen.getByText(/monuments/i)).toBeInTheDocument();

      // Summary should be visible
      expect(screen.getByText(mockHeritage.summary)).toBeInTheDocument();

      // Detailed content should NOT be visible
      expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Cultural Significance/i)).not.toBeInTheDocument();

      // "Learn More" button should be visible
      expect(screen.getByRole('button', { name: /Learn More/i })).toBeInTheDocument();
    });

    it('should display thumbnail image', () => {
      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      const image = screen.getByAltText('Taj Mahal');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/taj-mahal.jpg');
    });

    it('should display category icon', () => {
      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Check that the category icon is rendered (monuments = 🏛️)
      expect(screen.getByText('🏛️')).toBeInTheDocument();
    });
  });

  /**
   * Test: Expand functionality
   * Validates: Requirements 3.3
   */
  describe('Expand functionality', () => {
    it('should expand and show detailed content when "Learn More" is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Click "Learn More" button
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      // Wait for detailed content to appear
      await waitFor(() => {
        expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
      });

      // Verify detailed description is visible
      expect(screen.getByText(/commissioned in 1632/i)).toBeInTheDocument();

      // Verify significance is visible
      expect(screen.getByText(/Cultural Significance/i)).toBeInTheDocument();
      expect(screen.getByText(/finest example of Mughal architecture/i)).toBeInTheDocument();

      // Verify historical period is visible
      expect(screen.getByText('1632-1653 CE')).toBeInTheDocument();

      // Button text should change to "Show Less"
      expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();
    });

    it('should call onExpand callback when expanded', async () => {
      const user = userEvent.setup();
      const onExpand = vi.fn();

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" onExpand={onExpand} />
        </TestWrapper>
      );

      // Click "Learn More" button
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      // Verify callback was called with correct heritage ID
      expect(onExpand).toHaveBeenCalledWith('heritage-1');
      expect(onExpand).toHaveBeenCalledTimes(1);
    });

    it('should show loading state while fetching detailed content', async () => {
      const user = userEvent.setup();

      // Mock loading state
      mockUseHeritageDetail.mockImplementation((heritageId, language, enabled) => {
        if (!enabled) {
          return { data: undefined, isLoading: false, error: null };
        }
        return {
          data: undefined,
          isLoading: true,
          error: null,
        };
      });

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Click "Learn More" button
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      // Verify loading indicator is shown
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Show Less/i })).toBeInTheDocument();
      });

      // Loading mandala should be visible
      const loadingElement = document.querySelector('.loading-mandala');
      expect(loadingElement).toBeInTheDocument();
    });

    it('should show error message when fetching fails', async () => {
      const user = userEvent.setup();

      // Mock error state
      mockUseHeritageDetail.mockImplementation((heritageId, language, enabled) => {
        if (!enabled) {
          return { data: undefined, isLoading: false, error: null };
        }
        return {
          data: undefined,
          isLoading: false,
          error: new Error('Failed to fetch'),
        };
      });

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Click "Learn More" button
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      // Verify error message is shown
      await waitFor(() => {
        expect(screen.getByText(/Failed to load detailed information/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test: Collapse functionality
   * Validates: Requirements 3.4
   */
  describe('Collapse functionality', () => {
    it('should collapse and hide detailed content when "Show Less" is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // First expand
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
      });

      // Then collapse
      const collapseButton = screen.getByRole('button', { name: /Show Less/i });
      await user.click(collapseButton);

      // Wait for content to be hidden
      await waitFor(() => {
        expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
      });

      // Verify detailed content is hidden
      expect(screen.queryByText(/commissioned in 1632/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Cultural Significance/i)).not.toBeInTheDocument();

      // Button text should change back to "Learn More"
      expect(screen.getByRole('button', { name: /Learn More/i })).toBeInTheDocument();

      // Summary should still be visible
      expect(screen.getByText(mockHeritage.summary)).toBeInTheDocument();
    });

    it('should not call onExpand callback when collapsed', async () => {
      const user = userEvent.setup();
      const onExpand = vi.fn();

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" onExpand={onExpand} />
        </TestWrapper>
      );

      // Expand
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
      });

      // Clear mock calls
      onExpand.mockClear();

      // Collapse
      const collapseButton = screen.getByRole('button', { name: /Show Less/i });
      await user.click(collapseButton);

      // Verify callback was NOT called when collapsing
      expect(onExpand).not.toHaveBeenCalled();
    });
  });

  /**
   * Test: Content display in both states
   * Validates: Requirements 3.2, 3.3, 3.4
   */
  describe('Content display in both states', () => {
    it('should always display summary in both collapsed and expanded states', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Summary visible in collapsed state
      expect(screen.getByText(mockHeritage.summary)).toBeInTheDocument();

      // Expand
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
      });

      // Summary still visible in expanded state
      expect(screen.getByText(mockHeritage.summary)).toBeInTheDocument();

      // Collapse
      const collapseButton = screen.getByRole('button', { name: /Show Less/i });
      await user.click(collapseButton);

      await waitFor(() => {
        expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
      });

      // Summary still visible after collapsing
      expect(screen.getByText(mockHeritage.summary)).toBeInTheDocument();
    });

    it('should display all heritage categories correctly', () => {
      const categories = [
        { category: 'monuments' as const, icon: '🏛️' },
        { category: 'temples' as const, icon: '🕌' },
        { category: 'festivals' as const, icon: '🎭' },
        { category: 'traditions' as const, icon: '🪔' },
        { category: 'cuisine' as const, icon: '🍛' },
        { category: 'art_forms' as const, icon: '🎨' },
        { category: 'historical_events' as const, icon: '📜' },
        { category: 'customs' as const, icon: '🙏' },
      ];

      categories.forEach(({ category, icon }) => {
        const heritage = { ...mockHeritage, category };
        const { unmount } = render(
          <TestWrapper>
            <HeritageCard heritage={heritage} language="en" />
          </TestWrapper>
        );

        // Verify category icon is displayed
        expect(screen.getByText(icon)).toBeInTheDocument();

        // Verify category name is displayed
        expect(screen.getByText(new RegExp(category.replace('_', ' '), 'i'))).toBeInTheDocument();

        unmount();
      });
    });

    it('should handle heritage without optional fields gracefully', async () => {
      const user = userEvent.setup();

      // Mock detail without optional fields
      mockUseHeritageDetail.mockImplementation((heritageId, language, enabled) => {
        if (!enabled) {
          return { data: undefined, isLoading: false, error: null };
        }
        return {
          data: {
            ...mockHeritageDetail,
            significance: undefined,
            historicalPeriod: undefined,
          },
          isLoading: false,
          error: null,
        };
      });

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="en" />
        </TestWrapper>
      );

      // Expand
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
      });

      // Verify component doesn't crash and shows available content
      expect(screen.getByText(/commissioned in 1632/i)).toBeInTheDocument();

      // Optional fields should not be displayed
      expect(screen.queryByText(/Cultural Significance/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Period:/i)).not.toBeInTheDocument();
    });
  });

  /**
   * Test: Language support
   * Validates: Requirements 1.2
   */
  describe('Language support', () => {
    it('should pass language parameter to useHeritageDetail hook', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <HeritageCard heritage={mockHeritage} language="hi" />
        </TestWrapper>
      );

      // Expand to trigger data fetch
      const expandButton = screen.getByRole('button', { name: /Learn More/i });
      await user.click(expandButton);

      // Verify hook was called with correct language
      await waitFor(() => {
        expect(mockUseHeritageDetail).toHaveBeenCalledWith('heritage-1', 'hi', true);
      });
    });

    it('should work with different supported languages', async () => {
      const languages = ['en', 'hi', 'ta', 'bn', 'gu', 'kn', 'ml', 'mr', 'pa', 'te'];

      for (const language of languages) {
        const user = userEvent.setup();
        const { unmount } = render(
          <TestWrapper>
            <HeritageCard heritage={mockHeritage} language={language} />
          </TestWrapper>
        );

        // Expand
        const expandButton = screen.getByRole('button', { name: /Learn More/i });
        await user.click(expandButton);

        // Verify hook was called with correct language
        await waitFor(() => {
          expect(mockUseHeritageDetail).toHaveBeenCalledWith('heritage-1', language, true);
        });

        unmount();
        vi.clearAllMocks();
      }
    });
  });
});
