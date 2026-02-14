import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import { LanguageProvider } from '../contexts/LanguageContext';
import CityView from './CityView';

/**
 * Unit Tests for CityView Component
 * 
 * Tests:
 * - Heritage item rendering
 * - Category filtering
 * - Navigation
 * - Loading and error states
 * 
 * Requirements: 2.3, 3.1, 3.6, 7.2, 7.3, 7.5
 */

// Mock heritage data
const mockHeritageData = [
  {
    id: 'heritage-1',
    name: 'Taj Mahal',
    category: 'monuments',
    summary: 'An ivory-white marble mausoleum on the right bank of the river Yamuna',
    thumbnailImage: 'https://example.com/taj-mahal.jpg'
  },
  {
    id: 'heritage-2',
    name: 'Meenakshi Temple',
    category: 'temples',
    summary: 'A historic Hindu temple located on the southern bank of the Vaigai River',
    thumbnailImage: 'https://example.com/meenakshi.jpg'
  },
  {
    id: 'heritage-3',
    name: 'Diwali',
    category: 'festivals',
    summary: 'The festival of lights celebrated across India',
    thumbnailImage: 'https://example.com/diwali.jpg'
  },
  {
    id: 'heritage-4',
    name: 'Yoga',
    category: 'traditions',
    summary: 'An ancient practice of physical, mental, and spiritual disciplines',
    thumbnailImage: 'https://example.com/yoga.jpg'
  },
  {
    id: 'heritage-5',
    name: 'Biryani',
    category: 'cuisine',
    summary: 'A mixed rice dish with spices, rice, and meat',
    thumbnailImage: 'https://example.com/biryani.jpg'
  }
];

// Mock the API client
vi.mock('../services/apiClient', () => ({
  apiClient: {
    getCityHeritage: vi.fn(),
    setLanguage: vi.fn(),
    getCurrentLanguage: vi.fn().mockReturnValue('en')
  }
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ cityId: 'test-city-1' })
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <MemoryRouter initialEntries={['/city/test-city-1']}>
            {children}
          </MemoryRouter>
        </LanguageProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe('CityView Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementation
    const { apiClient } = require('../services/apiClient');
    apiClient.getCityHeritage.mockResolvedValue({
      city: {
        id: 'test-city-1',
        name: 'Delhi',
        state: 'Delhi',
        region: 'North'
      },
      heritageItems: mockHeritageData
    });
  });

  describe('Heritage Item Rendering (Requirement 2.3, 3.1)', () => {
    it('should render all heritage items', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      // Wait for heritage items to load
      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // Check all heritage items are rendered
      expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      expect(screen.getByText('Meenakshi Temple')).toBeInTheDocument();
      expect(screen.getByText('Diwali')).toBeInTheDocument();
      expect(screen.getByText('Yoga')).toBeInTheDocument();
      expect(screen.getByText('Biryani')).toBeInTheDocument();
    });

    it('should render heritage item summaries', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // Check summaries are displayed
      expect(screen.getByText(/ivory-white marble mausoleum/i)).toBeInTheDocument();
      expect(screen.getByText(/festival of lights/i)).toBeInTheDocument();
    });

    it('should render heritage item thumbnail images', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // Check images are rendered
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
      
      const tajMahalImage = images.find(img => img.getAttribute('alt') === 'Taj Mahal');
      expect(tajMahalImage).toBeInTheDocument();
      expect(tajMahalImage).toHaveAttribute('src', 'https://example.com/taj-mahal.jpg');
    });

    it('should display placeholder when no heritage items found', async () => {
      const { apiClient } = require('../services/apiClient');
      apiClient.getCityHeritage.mockResolvedValue({
        city: {
          id: 'test-city-1',
          name: 'Empty City',
          state: 'Test State',
          region: 'North'
        },
        heritageItems: []
      });

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/not found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Category Filtering (Requirement 3.6)', () => {
    it('should display all categories by default', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // All items should be visible
      expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      expect(screen.getByText('Meenakshi Temple')).toBeInTheDocument();
      expect(screen.getByText('Diwali')).toBeInTheDocument();
      expect(screen.getByText('Yoga')).toBeInTheDocument();
      expect(screen.getByText('Biryani')).toBeInTheDocument();
    });

    it('should filter heritage items by monuments category', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // Click monuments category button
      const monumentsButton = screen.getByRole('button', { name: /monuments/i });
      fireEvent.click(monumentsButton);

      // Only monuments should be visible
      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
        expect(screen.queryByText('Meenakshi Temple')).not.toBeInTheDocument();
        expect(screen.queryByText('Diwali')).not.toBeInTheDocument();
      });
    });

    it('should filter heritage items by temples category', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Meenakshi Temple')).toBeInTheDocument();
      });

      // Click temples category button
      const templesButton = screen.getByRole('button', { name: /temples/i });
      fireEvent.click(templesButton);

      // Only temples should be visible
      await waitFor(() => {
        expect(screen.getByText('Meenakshi Temple')).toBeInTheDocument();
        expect(screen.queryByText('Taj Mahal')).not.toBeInTheDocument();
        expect(screen.queryByText('Diwali')).not.toBeInTheDocument();
      });
    });

    it('should filter heritage items by festivals category', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Diwali')).toBeInTheDocument();
      });

      // Click festivals category button
      const festivalsButton = screen.getByRole('button', { name: /festivals/i });
      fireEvent.click(festivalsButton);

      // Only festivals should be visible
      await waitFor(() => {
        expect(screen.getByText('Diwali')).toBeInTheDocument();
        expect(screen.queryByText('Taj Mahal')).not.toBeInTheDocument();
        expect(screen.queryByText('Meenakshi Temple')).not.toBeInTheDocument();
      });
    });

    it('should switch between different category filters', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // Filter by monuments
      const monumentsButton = screen.getByRole('button', { name: /monuments/i });
      fireEvent.click(monumentsButton);

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
        expect(screen.queryByText('Biryani')).not.toBeInTheDocument();
      });

      // Switch to cuisine filter
      const cuisineButton = screen.getByRole('button', { name: /cuisine/i });
      fireEvent.click(cuisineButton);

      await waitFor(() => {
        expect(screen.getByText('Biryani')).toBeInTheDocument();
        expect(screen.queryByText('Taj Mahal')).not.toBeInTheDocument();
      });
    });

    it('should show all items when "All Categories" is selected', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // Filter by monuments first
      const monumentsButton = screen.getByRole('button', { name: /monuments/i });
      fireEvent.click(monumentsButton);

      await waitFor(() => {
        expect(screen.queryByText('Biryani')).not.toBeInTheDocument();
      });

      // Click "All Categories"
      const allButton = screen.getByRole('button', { name: /all categories/i });
      fireEvent.click(allButton);

      // All items should be visible again
      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
        expect(screen.getByText('Meenakshi Temple')).toBeInTheDocument();
        expect(screen.getByText('Diwali')).toBeInTheDocument();
        expect(screen.getByText('Yoga')).toBeInTheDocument();
        expect(screen.getByText('Biryani')).toBeInTheDocument();
      });
    });

    it('should highlight the selected category button', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const monumentsButton = screen.getByRole('button', { name: /monuments/i });
      fireEvent.click(monumentsButton);

      // Check button is pressed
      expect(monumentsButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Navigation (Requirement 7.2)', () => {
    it('should display back to list button', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to list/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should navigate back to city list when back button is clicked', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to list/i });
      fireEvent.click(backButton);

      // Check navigate was called with correct path
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should display city name in header', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      // City name should be displayed (from first heritage item)
      expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
    });
  });

  describe('Loading State (Requirement 7.3)', () => {
    it('should display loading indicator while fetching data', async () => {
      const { apiClient } = require('../services/apiClient');
      
      // Create a promise that we can control
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      apiClient.getCityHeritage.mockReturnValue(promise);

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      // Loading indicator should be visible
      expect(screen.getByText(/loading/i)).toBeInTheDocument();

      // Resolve the promise
      resolvePromise({
        city: { id: 'test-city-1', name: 'Delhi', state: 'Delhi', region: 'North' },
        heritageItems: mockHeritageData
      });

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });

    it('should display Om symbol during loading', async () => {
      const { apiClient } = require('../services/apiClient');
      
      let resolvePromise: any;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      
      apiClient.getCityHeritage.mockReturnValue(promise);

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      // Om symbol should be visible during loading
      const loadingContainer = screen.getByText(/loading/i).parentElement;
      expect(loadingContainer).toBeInTheDocument();

      // Resolve the promise
      resolvePromise({
        city: { id: 'test-city-1', name: 'Delhi', state: 'Delhi', region: 'North' },
        heritageItems: mockHeritageData
      });

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error State (Requirement 7.5)', () => {
    it('should display error message when data fetch fails', async () => {
      const { apiClient } = require('../services/apiClient');
      apiClient.getCityHeritage.mockRejectedValue(new Error('Failed to fetch heritage data'));

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/failed to fetch heritage data/i)).toBeInTheDocument();
      });
    });

    it('should display retry button on error', async () => {
      const { apiClient } = require('../services/apiClient');
      apiClient.getCityHeritage.mockRejectedValue(new Error('Network error'));

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should display back to list button on error', async () => {
      const { apiClient } = require('../services/apiClient');
      apiClient.getCityHeritage.mockRejectedValue(new Error('Error'));

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to list/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should navigate back when back button is clicked in error state', async () => {
      const { apiClient } = require('../services/apiClient');
      apiClient.getCityHeritage.mockRejectedValue(new Error('Error'));

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to list/i });
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should display user-friendly error message', async () => {
      const { apiClient } = require('../services/apiClient');
      apiClient.getCityHeritage.mockRejectedValue(new Error('Something went wrong'));

      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Image Error Handling', () => {
    it('should display placeholder image when image fails to load', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img');
      const tajMahalImage = images.find(img => img.getAttribute('alt') === 'Taj Mahal');
      
      // Simulate image load error
      if (tajMahalImage) {
        fireEvent.error(tajMahalImage);
        
        // Check that image src was changed to placeholder
        expect(tajMahalImage).toHaveAttribute('src');
        expect(tajMahalImage.getAttribute('src')).toContain('data:image/svg+xml');
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to list/i });
      expect(backButton).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA attributes for category buttons', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const monumentsButton = screen.getByRole('button', { name: /monuments/i });
      expect(monumentsButton).toHaveAttribute('aria-pressed');
    });

    it('should have alt text for all images', async () => {
      render(
        <TestWrapper>
          <CityView cityId="test-city-1" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Taj Mahal')).toBeInTheDocument();
      });

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });
});
