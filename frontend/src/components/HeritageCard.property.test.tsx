import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HeritageCard, { HeritageCardProps } from './HeritageCard';

// Mock the useHeritageDetail hook
vi.mock('../hooks/useHeritage', () => ({
  useHeritageDetail: (heritageId: string, language: string, enabled: boolean) => {
    if (!enabled) {
      return { data: undefined, isLoading: false, error: null };
    }
    return {
      data: {
        id: heritageId,
        name: 'Test Heritage',
        category: 'monuments',
        summary: 'Test summary',
        thumbnailImage: '/test.jpg',
        detailedDescription: 'Detailed historical context about the heritage',
        historicalPeriod: '1600-1700 CE',
        significance: 'Cultural significance of the heritage',
        images: [],
      },
      isLoading: false,
      error: null,
    };
  },
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

// Property-based test data generator
const generateHeritageTestCases = () => {
  const categories = [
    'monuments',
    'temples',
    'festivals',
    'traditions',
    'cuisine',
    'art_forms',
    'historical_events',
    'customs',
  ] as const;

  const languages = ['en', 'hi', 'bn', 'te', 'mr', 'ta', 'gu', 'kn', 'ml'];

  const testCases = [];

  // Generate test cases for each category
  for (const category of categories) {
    for (let i = 0; i < 3; i++) {
      const language = languages[Math.floor(Math.random() * languages.length)];
      testCases.push({
        heritage: {
          id: `heritage-${category}-${i}`,
          name: `Test ${category} ${i}`,
          category,
          summary: `This is a summary about ${category} heritage item ${i}`,
          thumbnailImage: `/images/${category}-${i}.jpg`,
        },
        language,
        description: `${category} in ${language}`,
      });
    }
  }

  return testCases;
};

describe('HeritageCard - Property-Based Tests', () => {
  /**
   * Property 10: Heritage expansion state consistency
   * 
   * For any heritage item, the card should:
   * 1. Initially display in collapsed state (only summary visible)
   * 2. When "Learn More" button is clicked, expand to show detailed content
   * 3. When button is clicked again, collapse back to summary-only state
   * 4. State transitions should be consistent regardless of heritage data
   * 
   * Validates: Requirements 3.2, 3.3, 3.4
   */
  describe('Property 10: Heritage expansion state consistency', () => {
    it('should maintain consistent expand/collapse state transitions for any heritage item', async () => {
      const testCases = generateHeritageTestCases();

      for (const testCase of testCases) {
        const user = userEvent.setup();
        const queryClient = createTestQueryClient();
        const onExpand = vi.fn();

        const { unmount } = render(
          <QueryClientProvider client={queryClient}>
            <HeritageCard
              heritage={testCase.heritage}
              language={testCase.language}
              onExpand={onExpand}
            />
          </QueryClientProvider>
        );

        // Requirement 3.2: Initially collapsed - only summary visible
        expect(screen.getByText(testCase.heritage.summary)).toBeInTheDocument();
        expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Cultural Significance/i)).not.toBeInTheDocument();

        // Find and verify the "Learn More" button is present
        const expandButton = screen.getByRole('button', { name: /Learn More/i });
        expect(expandButton).toBeInTheDocument();

        // Requirement 3.3: Click "Learn More" to expand
        await user.click(expandButton);

        // Verify onExpand callback was called
        expect(onExpand).toHaveBeenCalledWith(testCase.heritage.id);

        // Wait for expanded content to appear
        await waitFor(() => {
          expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
        });

        // Verify detailed content is visible
        expect(screen.getByText(/Detailed historical context/i)).toBeInTheDocument();

        // Button text should change to "Show Less"
        const collapseButton = screen.getByRole('button', { name: /Show Less/i });
        expect(collapseButton).toBeInTheDocument();

        // Requirement 3.4: Click button again to collapse
        await user.click(collapseButton);

        // Wait for content to collapse
        await waitFor(() => {
          expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
        });

        // Verify detailed content is no longer visible
        expect(screen.queryByText(/Detailed historical context/i)).not.toBeInTheDocument();

        // Button text should change back to "Learn More"
        expect(screen.getByRole('button', { name: /Learn More/i })).toBeInTheDocument();

        // Summary should still be visible
        expect(screen.getByText(testCase.heritage.summary)).toBeInTheDocument();

        unmount();
      }
    });

    it('should handle multiple expand/collapse cycles consistently', async () => {
      const testCases = generateHeritageTestCases().slice(0, 10); // Test with 10 cases

      for (const testCase of testCases) {
        const user = userEvent.setup();
        const queryClient = createTestQueryClient();

        const { unmount } = render(
          <QueryClientProvider client={queryClient}>
            <HeritageCard heritage={testCase.heritage} language={testCase.language} />
          </QueryClientProvider>
        );

        // Perform multiple expand/collapse cycles
        for (let i = 0; i < 3; i++) {
          // Expand
          const expandButton = screen.getByRole('button', { name: /Learn More/i });
          await user.click(expandButton);

          await waitFor(() => {
            expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
          });

          // Collapse
          const collapseButton = screen.getByRole('button', { name: /Show Less/i });
          await user.click(collapseButton);

          await waitFor(() => {
            expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
          });
        }

        // After all cycles, card should be in collapsed state
        expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
        expect(screen.getByText(testCase.heritage.summary)).toBeInTheDocument();

        unmount();
      }
    });

    it('should preserve summary visibility in both collapsed and expanded states', async () => {
      const testCases = generateHeritageTestCases().slice(0, 15); // Test with 15 cases

      for (const testCase of testCases) {
        const user = userEvent.setup();
        const queryClient = createTestQueryClient();

        const { unmount } = render(
          <QueryClientProvider client={queryClient}>
            <HeritageCard heritage={testCase.heritage} language={testCase.language} />
          </QueryClientProvider>
        );

        // Summary should be visible in collapsed state
        expect(screen.getByText(testCase.heritage.summary)).toBeInTheDocument();

        // Expand
        const expandButton = screen.getByRole('button', { name: /Learn More/i });
        await user.click(expandButton);

        await waitFor(() => {
          expect(screen.getByText(/Historical Context/i)).toBeInTheDocument();
        });

        // Summary should still be visible in expanded state
        expect(screen.getByText(testCase.heritage.summary)).toBeInTheDocument();

        // Collapse
        const collapseButton = screen.getByRole('button', { name: /Show Less/i });
        await user.click(collapseButton);

        await waitFor(() => {
          expect(screen.queryByText(/Historical Context/i)).not.toBeInTheDocument();
        });

        // Summary should still be visible after collapsing
        expect(screen.getByText(testCase.heritage.summary)).toBeInTheDocument();

        unmount();
      }
    });
  });
});
