import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import CityList from './CityList';
import { City } from '../hooks/useCities';

// Mock translation function
vi.mock('react-i18next', async () => {
  const actual = await vi.importActual('react-i18next');
  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string, options?: any) => {
        const translations: Record<string, string> = {
          'city.select': 'Select a City',
          'city.search': 'Search cities',
          'city.filterByState': 'Filter by State',
          'city.filterByRegion': 'Filter by Region',
          'city.notFound': 'No cities found',
          'city.heritageCount': `${options?.count || 0} heritage items`,
          'error.loading': 'Failed to load content',
          'error.retry': 'Retry'
        };
        return translations[key] || key;
      },
      i18n: {
        changeLanguage: vi.fn(),
        language: 'en'
      }
    })
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

// Mock city data
const mockCities: City[] = [
  {
    id: '1',
    name: 'Delhi',
    state: 'Delhi',
    region: 'North',
    previewImage: 'https://example.com/delhi.jpg',
    heritageCount: 15
  },
  {
    id: '2',
    name: 'Mumbai',
    state: 'Maharashtra',
    region: 'West',
    previewImage: 'https://example.com/mumbai.jpg',
    heritageCount: 12
  },
  {
    id: '3',
    name: 'Bangalore',
    state: 'Karnataka',
    region: 'South',
    previewImage: 'https://example.com/bangalore.jpg',
    heritageCount: 10
  },
  {
    id: '4',
    name: 'Kolkata',
    state: 'West Bengal',
    region: 'East',
    previewImage: 'https://example.com/kolkata.jpg',
    heritageCount: 18
  },
  {
    id: '5',
    name: 'Jaipur',
    state: 'Rajasthan',
    region: 'North',
    previewImage: 'https://example.com/jaipur.jpg',
    heritageCount: 20
  },
  {
    id: '6',
    name: 'Chennai',
    state: 'Tamil Nadu',
    region: 'South',
    previewImage: 'https://example.com/chennai.jpg',
    heritageCount: 14
  }
];

describe('CityList Unit Tests', () => {
  let mockOnCitySelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnCitySelect = vi.fn();
    vi.clearAllMocks();
  });

  describe('City Rendering with Mock Data', () => {
    it('renders all cities from mock data', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      // Check if all cities are rendered
      mockCities.forEach(city => {
        expect(screen.getByText(city.name)).toBeInTheDocument();
      });
    });

    it('renders city details correctly', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      // Check first city details
      const delhiCard = screen.getByText('Delhi').closest('.city-card');
      expect(delhiCard).toBeInTheDocument();
      
      if (delhiCard) {
        expect(within(delhiCard).getByText('Delhi')).toBeInTheDocument();
        expect(within(delhiCard).getByText('📍 Delhi')).toBeInTheDocument();
        expect(within(delhiCard).getByText('🧭 North')).toBeInTheDocument();
        expect(within(delhiCard).getByText('15 heritage items')).toBeInTheDocument();
      }
    });

    it('renders city images with correct src', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiImage = screen.getByAltText('Delhi') as HTMLImageElement;
      expect(delhiImage).toBeInTheDocument();
      expect(delhiImage.src).toContain('delhi.jpg');
    });

    it('renders empty state when no cities provided', () => {
      render(
        <TestWrapper>
          <CityList
            cities={[]}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('No cities found')).toBeInTheDocument();
    });

    it('renders loading state when isLoading is true', () => {
      render(
        <TestWrapper>
          <CityList
            cities={[]}
            onCitySelect={mockOnCitySelect}
            isLoading={true}
          />
        </TestWrapper>
      );

      // Check for skeleton UI (CityListSkeleton component)
      const skeletons = document.querySelectorAll('.city-card-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders error state when error is provided', () => {
      const errorMessage = 'Network error occurred';
      
      render(
        <TestWrapper>
          <CityList
            cities={[]}
            onCitySelect={mockOnCitySelect}
            error={errorMessage}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('displays heritage count for each city', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('15 heritage items')).toBeInTheDocument();
      expect(screen.getByText('12 heritage items')).toBeInTheDocument();
      expect(screen.getByText('10 heritage items')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    it('filters cities by search term (case insensitive)', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: 'delhi' } });

      // Should show Delhi
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Mumbai')).not.toBeInTheDocument();
      expect(screen.queryByText('Bangalore')).not.toBeInTheDocument();
    });

    it('filters cities by partial search term', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: 'ban' } });

      // Should show Bangalore
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
      expect(screen.queryByText('Mumbai')).not.toBeInTheDocument();
    });

    it('shows no results message when search yields no matches', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      expect(screen.getByText('No cities found')).toBeInTheDocument();
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
    });

    it('clears search filter when input is cleared', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      
      // Apply filter
      fireEvent.change(searchInput, { target: { value: 'delhi' } });
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.queryByText('Mumbai')).not.toBeInTheDocument();

      // Clear filter
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // All cities should be visible again
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
    });

    it('search is case insensitive', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      
      // Test uppercase
      fireEvent.change(searchInput, { target: { value: 'MUMBAI' } });
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      
      // Test mixed case
      fireEvent.change(searchInput, { target: { value: 'MuMbAi' } });
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
    });
  });

  describe('State/Region Filtering', () => {
    it('filters cities by state', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const stateFilter = screen.getByLabelText('🗺️ Filter by State');
      fireEvent.change(stateFilter, { target: { value: 'Maharashtra' } });

      // Should show Mumbai
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
      expect(screen.queryByText('Bangalore')).not.toBeInTheDocument();
    });

    it('filters cities by region', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const regionFilter = screen.getByLabelText('🧭 Filter by Region');
      fireEvent.change(regionFilter, { target: { value: 'South' } });

      // Should show Bangalore and Chennai
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
      expect(screen.getByText('Chennai')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
      expect(screen.queryByText('Mumbai')).not.toBeInTheDocument();
    });

    it('combines search and state filters', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      const stateFilter = screen.getByLabelText('🗺️ Filter by State');

      // Apply both filters
      fireEvent.change(searchInput, { target: { value: 'j' } });
      fireEvent.change(stateFilter, { target: { value: 'Rajasthan' } });

      // Should show only Jaipur (matches both filters)
      expect(screen.getByText('Jaipur')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
      expect(screen.queryByText('Mumbai')).not.toBeInTheDocument();
    });

    it('combines search and region filters', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      const regionFilter = screen.getByLabelText('🧭 Filter by Region');

      // Apply both filters
      fireEvent.change(searchInput, { target: { value: 'del' } });
      fireEvent.change(regionFilter, { target: { value: 'North' } });

      // Should show only Delhi
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Mumbai')).not.toBeInTheDocument();
      expect(screen.queryByText('Jaipur')).not.toBeInTheDocument();
    });

    it('combines all three filters (search, state, region)', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      const stateFilter = screen.getByLabelText('🗺️ Filter by State');
      const regionFilter = screen.getByLabelText('🧭 Filter by Region');

      // Apply all filters
      fireEvent.change(searchInput, { target: { value: 'jai' } });
      fireEvent.change(stateFilter, { target: { value: 'Rajasthan' } });
      fireEvent.change(regionFilter, { target: { value: 'North' } });

      // Should show only Jaipur
      expect(screen.getByText('Jaipur')).toBeInTheDocument();
      
      // Should not show other cities
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();
    });

    it('shows clear filters button when filters are active', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      // Initially no clear button
      expect(screen.queryByText('✕ Clear all filters')).not.toBeInTheDocument();

      // Apply a filter
      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: 'delhi' } });

      // Clear button should appear
      expect(screen.getByText('✕ Clear all filters')).toBeInTheDocument();
    });

    it('clears all filters when clear button is clicked', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Search cities');
      const stateFilter = screen.getByLabelText('🗺️ Filter by State');
      const regionFilter = screen.getByLabelText('🧭 Filter by Region');

      // Apply all filters
      fireEvent.change(searchInput, { target: { value: 'delhi' } });
      fireEvent.change(stateFilter, { target: { value: 'Delhi' } });
      fireEvent.change(regionFilter, { target: { value: 'North' } });

      // Click clear button
      const clearButton = screen.getByText('✕ Clear all filters');
      fireEvent.click(clearButton);

      // All filters should be cleared
      expect(searchInput).toHaveValue('');
      expect(stateFilter).toHaveValue('');
      expect(regionFilter).toHaveValue('');

      // All cities should be visible
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
    });

    it('resets to all cities when state filter is cleared', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const stateFilter = screen.getByLabelText('🗺️ Filter by State');

      // Apply state filter
      fireEvent.change(stateFilter, { target: { value: 'Maharashtra' } });
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();

      // Clear state filter
      fireEvent.change(stateFilter, { target: { value: '' } });

      // All cities should be visible
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Mumbai')).toBeInTheDocument();
    });

    it('resets to all cities when region filter is cleared', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const regionFilter = screen.getByLabelText('🧭 Filter by Region');

      // Apply region filter
      fireEvent.change(regionFilter, { target: { value: 'South' } });
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
      expect(screen.queryByText('Delhi')).not.toBeInTheDocument();

      // Clear region filter
      fireEvent.change(regionFilter, { target: { value: '' } });

      // All cities should be visible
      expect(screen.getByText('Delhi')).toBeInTheDocument();
      expect(screen.getByText('Bangalore')).toBeInTheDocument();
    });
  });

  describe('City Selection Callback', () => {
    it('calls onCitySelect when city card is clicked', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiCard = screen.getByText('Delhi').closest('.city-card');
      if (delhiCard) {
        fireEvent.click(delhiCard);
        expect(mockOnCitySelect).toHaveBeenCalledWith('1');
        expect(mockOnCitySelect).toHaveBeenCalledTimes(1);
      }
    });

    it('calls onCitySelect with correct city ID for different cities', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      // Click Mumbai
      const mumbaiCard = screen.getByText('Mumbai').closest('.city-card');
      if (mumbaiCard) {
        fireEvent.click(mumbaiCard);
        expect(mockOnCitySelect).toHaveBeenCalledWith('2');
      }

      // Click Bangalore
      const bangaloreCard = screen.getByText('Bangalore').closest('.city-card');
      if (bangaloreCard) {
        fireEvent.click(bangaloreCard);
        expect(mockOnCitySelect).toHaveBeenCalledWith('3');
      }

      expect(mockOnCitySelect).toHaveBeenCalledTimes(2);
    });

    it('calls onCitySelect when Enter key is pressed on city card', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiCard = screen.getByText('Delhi').closest('.city-card');
      if (delhiCard) {
        fireEvent.keyDown(delhiCard, { key: 'Enter' });
        expect(mockOnCitySelect).toHaveBeenCalledWith('1');
      }
    });

    it('calls onCitySelect when Space key is pressed on city card', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const mumbaiCard = screen.getByText('Mumbai').closest('.city-card');
      if (mumbaiCard) {
        fireEvent.keyDown(mumbaiCard, { key: ' ' });
        expect(mockOnCitySelect).toHaveBeenCalledWith('2');
      }
    });

    it('does not call onCitySelect for other keys', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiCard = screen.getByText('Delhi').closest('.city-card');
      if (delhiCard) {
        fireEvent.keyDown(delhiCard, { key: 'Tab' });
        fireEvent.keyDown(delhiCard, { key: 'Escape' });
        fireEvent.keyDown(delhiCard, { key: 'a' });
        
        expect(mockOnCitySelect).not.toHaveBeenCalled();
      }
    });

    it('calls onCitySelect for filtered cities', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      // Apply filter
      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: 'jaipur' } });

      // Click filtered city
      const jaipurCard = screen.getByText('Jaipur').closest('.city-card');
      if (jaipurCard) {
        fireEvent.click(jaipurCard);
        expect(mockOnCitySelect).toHaveBeenCalledWith('5');
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels on city cards', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiCard = screen.getByLabelText('Select Delhi, Delhi');
      expect(delhiCard).toBeInTheDocument();
      expect(delhiCard).toHaveAttribute('role', 'button');
    });

    it('has proper tabIndex for keyboard navigation', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiCard = screen.getByText('Delhi').closest('.city-card');
      expect(delhiCard).toHaveAttribute('tabIndex', '0');
    });

    it('has proper alt text for images', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiImage = screen.getByAltText('Delhi');
      expect(delhiImage).toBeInTheDocument();
    });

    it('has proper labels for filter inputs', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText('🔍 Search cities')).toBeInTheDocument();
      expect(screen.getByLabelText('🗺️ Filter by State')).toBeInTheDocument();
      expect(screen.getByLabelText('🧭 Filter by Region')).toBeInTheDocument();
    });
  });

  describe('Image Handling', () => {
    it('sets placeholder image on error', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiImage = screen.getByAltText('Delhi') as HTMLImageElement;
      
      // Trigger error event
      fireEvent.error(delhiImage);

      // Check if placeholder SVG is set
      expect(delhiImage.src).toContain('data:image/svg+xml');
    });

    it('has lazy loading attribute on images', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('UI Elements', () => {
    it('displays Om symbol in header', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('🕉️')).toBeInTheDocument();
    });

    it('displays header title', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Select a City')).toBeInTheDocument();
    });

    it('displays cultural icons for each city', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      // Check for heritage icon (🏛️) - should appear once per city
      const heritageIcons = screen.getAllByText('🏛️');
      expect(heritageIcons.length).toBeGreaterThan(0);
    });

    it('applies regional color classes based on region', () => {
      render(
        <TestWrapper>
          <CityList
            cities={mockCities}
            onCitySelect={mockOnCitySelect}
          />
        </TestWrapper>
      );

      const delhiCard = screen.getByText('Delhi').closest('.city-card');
      const mumbaiCard = screen.getByText('Mumbai').closest('.city-card');
      const bangaloreCard = screen.getByText('Bangalore').closest('.city-card');

      // Check that different regions have different color classes
      expect(delhiCard?.className).toContain('border-kashmiri-500'); // North
      expect(mumbaiCard?.className).toContain('border-rajasthani-500'); // West
      expect(bangaloreCard?.className).toContain('border-kerala-500'); // South
    });
  });
});
