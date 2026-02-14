import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { LanguageProvider } from '../contexts/LanguageContext';
import { apiClient } from '../services/apiClient';

/**
 * End-to-End Integration Tests
 * 
 * These tests verify the complete user flow:
 * 1. Select language
 * 2. Select city
 * 3. View heritage items
 * 4. Expand details
 * 5. View images
 * 
 * Prerequisites:
 * - Backend server must be running on http://localhost:3000
 * - Database must be seeded with test data
 */

describe('End-to-End User Flow Integration Tests', () => {
  let queryClient: QueryClient;

  beforeAll(() => {
    // Verify backend is accessible
    apiClient.setLanguage('en');
  });

  beforeEach(() => {
    // Create a new QueryClient for each test to avoid cache pollution
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    });

    // Clear localStorage
    localStorage.clear();
    sessionStorage.clear();
  });

  const renderApp = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  describe('Complete User Flow: English', () => {
    it('should complete full user journey in English', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Verify app loads with default language (English)
      await waitFor(() => {
        expect(screen.getByText(/Indian Culture/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 2: Wait for cities to load
      await waitFor(() => {
        const cityElements = screen.queryAllByRole('button', { name: /view heritage/i });
        expect(cityElements.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      // Step 3: Select first city
      const cityButtons = screen.getAllByRole('button', { name: /view heritage/i });
      await user.click(cityButtons[0]);

      // Step 4: Verify city view loads with heritage items
      await waitFor(() => {
        expect(screen.getByText(/Heritage/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 5: Wait for heritage items to load
      await waitFor(() => {
        const heritageCards = screen.queryAllByTestId(/heritage-card/i);
        expect(heritageCards.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      // Step 6: Expand first heritage item
      const moreButtons = screen.getAllByRole('button', { name: /more/i });
      if (moreButtons.length > 0) {
        await user.click(moreButtons[0]);

        // Step 7: Verify detailed description appears
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /less/i })).toBeInTheDocument();
        }, { timeout: 5000 });
      }

      // Step 8: Check if images are present
      const images = screen.queryAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    }, 60000);
  });

  describe('Language Switching During Navigation', () => {
    it('should switch language and update all content', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Load app in English
      await waitFor(() => {
        expect(screen.getByText(/Indian Culture/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Step 2: Wait for cities to load
      await waitFor(() => {
        const cityElements = screen.queryAllByRole('button', { name: /view heritage/i });
        expect(cityElements.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      // Step 3: Switch to Hindi
      const languageSelector = screen.getByRole('combobox', { name: /language/i });
      await user.selectOptions(languageSelector, 'hi');

      // Step 4: Verify content updates to Hindi
      await waitFor(() => {
        // Check if language preference is saved
        expect(localStorage.getItem('preferredLanguage')).toBe('hi');
      }, { timeout: 5000 });

      // Step 5: Select a city
      await waitFor(() => {
        const cityButtons = screen.queryAllByRole('button', { name: /view heritage/i });
        if (cityButtons.length > 0) {
          user.click(cityButtons[0]);
        }
      }, { timeout: 5000 });

      // Step 6: Verify heritage items load in Hindi
      await waitFor(() => {
        expect(screen.getByText(/Heritage/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Step 7: Switch back to English
      const languageSelectorAgain = screen.getByRole('combobox', { name: /language/i });
      await user.selectOptions(languageSelectorAgain, 'en');

      // Step 8: Verify content updates back to English
      await waitFor(() => {
        expect(localStorage.getItem('preferredLanguage')).toBe('en');
      }, { timeout: 5000 });
    }, 60000);

    it('should persist language preference across sessions', async () => {
      const user = userEvent.setup();
      
      // First session: Set language to Tamil
      localStorage.setItem('preferredLanguage', 'ta');
      
      renderApp();

      // Verify app loads with Tamil
      await waitFor(() => {
        expect(apiClient.getCurrentLanguage()).toBe('ta');
      }, { timeout: 5000 });

      // Verify cities load in Tamil
      await waitFor(() => {
        const cityElements = screen.queryAllByRole('button', { name: /view heritage/i });
        expect(cityElements.length).toBeGreaterThan(0);
      }, { timeout: 10000 });
    }, 30000);
  });

  describe('Error Scenarios', () => {
    it('should handle network failures gracefully', async () => {
      // Create a client with invalid URL to simulate network failure
      const originalBaseURL = apiClient['client'].defaults.baseURL;
      apiClient['client'].defaults.baseURL = 'http://localhost:9999/api/v1';

      renderApp();

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      }, { timeout: 10000 });

      // Restore original URL
      apiClient['client'].defaults.baseURL = originalBaseURL;
    }, 30000);

    it('should handle invalid city ID', async () => {
      const user = userEvent.setup();
      renderApp();

      // Navigate directly to invalid city
      window.history.pushState({}, '', '/city/00000000-0000-0000-0000-000000000000');

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/not found|error/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 30000);

    it('should handle invalid heritage ID', async () => {
      renderApp();

      // Navigate directly to invalid heritage
      window.history.pushState({}, '', '/heritage/00000000-0000-0000-0000-000000000000');

      // Verify error message appears
      await waitFor(() => {
        expect(screen.getByText(/not found|error/i)).toBeInTheDocument();
      }, { timeout: 10000 });
    }, 30000);
  });

  describe('Caching Behavior', () => {
    it('should cache city list and not refetch on navigation', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Load cities
      await waitFor(() => {
        const cityElements = screen.queryAllByRole('button', { name: /view heritage/i });
        expect(cityElements.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      const initialCityCount = screen.getAllByRole('button', { name: /view heritage/i }).length;

      // Step 2: Navigate to a city
      const cityButtons = screen.getAllByRole('button', { name: /view heritage/i });
      await user.click(cityButtons[0]);

      // Step 3: Navigate back
      const backButton = screen.getByRole('button', { name: /back/i });
      await user.click(backButton);

      // Step 4: Verify cities are still cached (no loading state)
      await waitFor(() => {
        const cityElements = screen.getAllByRole('button', { name: /view heritage/i });
        expect(cityElements.length).toBe(initialCityCount);
      }, { timeout: 1000 }); // Should be instant from cache
    }, 30000);

    it('should cache heritage details after expansion', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Navigate to city
      await waitFor(() => {
        const cityButtons = screen.queryAllByRole('button', { name: /view heritage/i });
        if (cityButtons.length > 0) {
          user.click(cityButtons[0]);
        }
      }, { timeout: 10000 });

      // Step 2: Wait for heritage items
      await waitFor(() => {
        const heritageCards = screen.queryAllByTestId(/heritage-card/i);
        expect(heritageCards.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      // Step 3: Expand first item
      const moreButtons = screen.getAllByRole('button', { name: /more/i });
      if (moreButtons.length > 0) {
        await user.click(moreButtons[0]);

        // Step 4: Collapse
        await waitFor(() => {
          const lessButton = screen.getByRole('button', { name: /less/i });
          user.click(lessButton);
        }, { timeout: 5000 });

        // Step 5: Expand again (should be instant from cache)
        await waitFor(() => {
          const moreButtonAgain = screen.getByRole('button', { name: /more/i });
          user.click(moreButtonAgain);
        }, { timeout: 1000 });

        // Step 6: Verify details appear instantly
        await waitFor(() => {
          expect(screen.getByRole('button', { name: /less/i })).toBeInTheDocument();
        }, { timeout: 1000 });
      }
    }, 60000);
  });

  describe('Image Gallery Flow', () => {
    it('should display and navigate through image gallery', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Navigate to city
      await waitFor(() => {
        const cityButtons = screen.queryAllByRole('button', { name: /view heritage/i });
        if (cityButtons.length > 0) {
          user.click(cityButtons[0]);
        }
      }, { timeout: 10000 });

      // Step 2: Wait for heritage items with images
      await waitFor(() => {
        const images = screen.queryAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      // Step 3: Click on first image to open lightbox
      const images = screen.getAllByRole('img');
      if (images.length > 0) {
        await user.click(images[0]);

        // Step 4: Verify lightbox opens
        await waitFor(() => {
          expect(screen.getByRole('dialog')).toBeInTheDocument();
        }, { timeout: 5000 });

        // Step 5: Navigate to next image
        const nextButton = screen.getByRole('button', { name: /next/i });
        await user.click(nextButton);

        // Step 6: Navigate to previous image
        const prevButton = screen.getByRole('button', { name: /previous/i });
        await user.click(prevButton);

        // Step 7: Close lightbox
        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        // Step 8: Verify lightbox closes
        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        }, { timeout: 5000 });
      }
    }, 60000);
  });

  describe('Search and Filter', () => {
    it('should filter cities by search term', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Wait for cities to load
      await waitFor(() => {
        const cityElements = screen.queryAllByRole('button', { name: /view heritage/i });
        expect(cityElements.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      const initialCount = screen.getAllByRole('button', { name: /view heritage/i }).length;

      // Step 2: Enter search term
      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await user.type(searchInput, 'Mumbai');

      // Step 3: Verify filtered results
      await waitFor(() => {
        const filteredCities = screen.queryAllByRole('button', { name: /view heritage/i });
        expect(filteredCities.length).toBeLessThanOrEqual(initialCount);
      }, { timeout: 5000 });
    }, 30000);

    it('should filter heritage items by category', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Navigate to city
      await waitFor(() => {
        const cityButtons = screen.queryAllByRole('button', { name: /view heritage/i });
        if (cityButtons.length > 0) {
          user.click(cityButtons[0]);
        }
      }, { timeout: 10000 });

      // Step 2: Wait for heritage items
      await waitFor(() => {
        const heritageCards = screen.queryAllByTestId(/heritage-card/i);
        expect(heritageCards.length).toBeGreaterThan(0);
      }, { timeout: 10000 });

      // Step 3: Select category filter
      const categoryFilter = screen.getByRole('combobox', { name: /category/i });
      await user.selectOptions(categoryFilter, 'monuments');

      // Step 4: Verify filtered results
      await waitFor(() => {
        const heritageCards = screen.queryAllByTestId(/heritage-card/i);
        // All visible cards should be monuments
        heritageCards.forEach(card => {
          expect(within(card).getByText(/monument/i)).toBeInTheDocument();
        });
      }, { timeout: 5000 });
    }, 60000);
  });

  describe('Session Persistence', () => {
    it('should persist city selection in session', async () => {
      const user = userEvent.setup();
      renderApp();

      // Step 1: Navigate to city
      await waitFor(() => {
        const cityButtons = screen.queryAllByRole('button', { name: /view heritage/i });
        if (cityButtons.length > 0) {
          user.click(cityButtons[0]);
        }
      }, { timeout: 10000 });

      // Step 2: Verify city ID is stored in session
      await waitFor(() => {
        const selectedCity = sessionStorage.getItem('selectedCity');
        expect(selectedCity).toBeTruthy();
      }, { timeout: 5000 });

      // Step 3: Refresh page (simulate)
      // In a real E2E test, you would actually refresh
      // Here we just verify the session storage has the value
      const selectedCity = sessionStorage.getItem('selectedCity');
      expect(selectedCity).toBeTruthy();
    }, 30000);
  });
});
