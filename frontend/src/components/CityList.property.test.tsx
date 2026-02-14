import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CityList from './CityList';
import { City } from '../hooks/useCities';

/**
 * Property 8: City Search Correctness
 * 
 * **Validates: Requirements 2.5**
 * 
 * For any search term, when a user enters text into the city search field,
 * the filtered results should only contain cities whose names include that
 * search term (case-insensitive). The search should work correctly across
 * all cities and return all cities when the search term is empty.
 */

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { count?: number }) => {
      const translations: Record<string, string> = {
        'city.select': 'Select a City',
        'city.search': 'Search cities',
        'city.filterByState': 'Filter by State',
        'city.filterByRegion': 'Filter by Region',
        'city.notFound': 'No cities found',
        'city.heritageCount': `${options?.count || 0} heritage items`,
        'error.loading': 'Failed to load',
        'error.retry': 'Retry'
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en'
    }
  })
}));

// Generate test cities with diverse names
const generateTestCities = (): City[] => {
  const cities: City[] = [
    {
      id: '1',
      name: 'Mumbai',
      state: 'Maharashtra',
      region: 'West',
      previewImage: 'https://example.com/mumbai.jpg',
      heritageCount: 15
    },
    {
      id: '2',
      name: 'Delhi',
      state: 'Delhi',
      region: 'North',
      previewImage: 'https://example.com/delhi.jpg',
      heritageCount: 20
    },
    {
      id: '3',
      name: 'Bangalore',
      state: 'Karnataka',
      region: 'South',
      previewImage: 'https://example.com/bangalore.jpg',
      heritageCount: 12
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
      name: 'Chennai',
      state: 'Tamil Nadu',
      region: 'South',
      previewImage: 'https://example.com/chennai.jpg',
      heritageCount: 14
    },
    {
      id: '6',
      name: 'Hyderabad',
      state: 'Telangana',
      region: 'South',
      previewImage: 'https://example.com/hyderabad.jpg',
      heritageCount: 16
    },
    {
      id: '7',
      name: 'Ahmedabad',
      state: 'Gujarat',
      region: 'West',
      previewImage: 'https://example.com/ahmedabad.jpg',
      heritageCount: 11
    },
    {
      id: '8',
      name: 'Pune',
      state: 'Maharashtra',
      region: 'West',
      previewImage: 'https://example.com/pune.jpg',
      heritageCount: 10
    },
    {
      id: '9',
      name: 'Jaipur',
      state: 'Rajasthan',
      region: 'North',
      previewImage: 'https://example.com/jaipur.jpg',
      heritageCount: 22
    },
    {
      id: '10',
      name: 'Lucknow',
      state: 'Uttar Pradesh',
      region: 'North',
      previewImage: 'https://example.com/lucknow.jpg',
      heritageCount: 13
    },
    {
      id: '11',
      name: 'Varanasi',
      state: 'Uttar Pradesh',
      region: 'North',
      previewImage: 'https://example.com/varanasi.jpg',
      heritageCount: 25
    },
    {
      id: '12',
      name: 'Mysore',
      state: 'Karnataka',
      region: 'South',
      previewImage: 'https://example.com/mysore.jpg',
      heritageCount: 9
    }
  ];
  
  return cities;
};

// Generate property-based test cases
const generateSearchTestCases = () => {
  const testCases = [];
  const cities = generateTestCities();
  
  // Test case 1: Empty search should return all cities
  testCases.push({
    searchTerm: '',
    expectedCityIds: cities.map(c => c.id),
    description: 'Empty search returns all cities'
  });
  
  // Test case 2: Exact city name matches (case-insensitive)
  for (const city of cities) {
    testCases.push({
      searchTerm: city.name,
      expectedCityIds: [city.id],
      description: `Exact match for ${city.name}`
    });
    
    // Test lowercase
    testCases.push({
      searchTerm: city.name.toLowerCase(),
      expectedCityIds: [city.id],
      description: `Lowercase match for ${city.name}`
    });
    
    // Test uppercase
    testCases.push({
      searchTerm: city.name.toUpperCase(),
      expectedCityIds: [city.id],
      description: `Uppercase match for ${city.name}`
    });
  }
  
  // Test case 3: Partial matches
  testCases.push({
    searchTerm: 'bad',
    expectedCityIds: cities.filter(c => c.name.toLowerCase().includes('bad')).map(c => c.id),
    description: 'Partial match "bad" (Ahmedabad, Hyderabad)'
  });
  
  testCases.push({
    searchTerm: 'ore',
    expectedCityIds: cities.filter(c => c.name.toLowerCase().includes('ore')).map(c => c.id),
    description: 'Partial match "ore" (Bangalore, Mysore)'
  });
  
  testCases.push({
    searchTerm: 'pur',
    expectedCityIds: cities.filter(c => c.name.toLowerCase().includes('pur')).map(c => c.id),
    description: 'Partial match "pur" (Jaipur)'
  });
  
  // Test case 4: No matches
  testCases.push({
    searchTerm: 'xyz123',
    expectedCityIds: [],
    description: 'No matches for non-existent city'
  });
  
  testCases.push({
    searchTerm: 'Tokyo',
    expectedCityIds: [],
    description: 'No matches for foreign city'
  });
  
  // Test case 5: Single character searches
  testCases.push({
    searchTerm: 'M',
    expectedCityIds: cities.filter(c => c.name.toLowerCase().includes('m')).map(c => c.id),
    description: 'Single character "M"'
  });
  
  testCases.push({
    searchTerm: 'a',
    expectedCityIds: cities.filter(c => c.name.toLowerCase().includes('a')).map(c => c.id),
    description: 'Single character "a"'
  });
  
  // Test case 6: Whitespace handling
  testCases.push({
    searchTerm: ' Mumbai ',
    expectedCityIds: cities.filter(c => c.name.toLowerCase().includes('mumbai')).map(c => c.id),
    description: 'Search with leading/trailing whitespace'
  });
  
  return testCases;
};

describe('Property 8: City Search Correctness', () => {
  const mockOnCitySelect = vi.fn();
  
  it('Property 8: Search should filter cities correctly for all test cases', () => {
    const cities = generateTestCities();
    const testCases = generateSearchTestCases();
    
    for (const testCase of testCases) {
      // Render component
      const { container } = render(
        <CityList
          cities={cities}
          onCitySelect={mockOnCitySelect}
          isLoading={false}
          error={null}
        />
      );
      
      // Find search input
      const searchInput = screen.getByPlaceholderText('Search cities');
      
      // Enter search term
      fireEvent.change(searchInput, { target: { value: testCase.searchTerm } });
      
      // Get all rendered city cards
      const cityCards = container.querySelectorAll('.city-card');
      const renderedCityIds: string[] = [];
      
      cityCards.forEach(card => {
        // Extract city ID from the card's key or data attribute
        const cityName = card.querySelector('h3')?.textContent;
        const matchingCity = cities.find(c => c.name === cityName);
        if (matchingCity) {
          renderedCityIds.push(matchingCity.id);
        }
      });
      
      // Verify the filtered results match expected cities
      expect(renderedCityIds.sort()).toEqual(testCase.expectedCityIds.sort());
      
      // Clean up for next iteration
      fireEvent.change(searchInput, { target: { value: '' } });
    }
  });
  
  it('Property 8: Search should be case-insensitive', () => {
    const cities = generateTestCities();
    const testCity = cities[0]; // Mumbai
    
    const caseVariations = [
      testCity.name.toLowerCase(), // 'mumbai'
      testCity.name.toUpperCase(), // 'MUMBAI'
      testCity.name, // 'Mumbai'
      'mUmBaI', // Mixed case
      'MUMBAI',
      'mumbai'
    ];
    
    for (const searchTerm of caseVariations) {
      const { container } = render(
        <CityList
          cities={cities}
          onCitySelect={mockOnCitySelect}
          isLoading={false}
          error={null}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: searchTerm } });
      
      // Should find exactly one city (Mumbai)
      const cityCards = container.querySelectorAll('.city-card');
      expect(cityCards.length).toBe(1);
      
      const cityName = cityCards[0].querySelector('h3')?.textContent;
      expect(cityName).toBe(testCity.name);
    }
  });
  
  it('Property 8: Search should handle partial matches correctly', () => {
    const cities = generateTestCities();
    
    const partialSearchTests = [
      { term: 'bad', expectedCount: 2 }, // Ahmedabad, Hyderabad
      { term: 'ore', expectedCount: 2 }, // Bangalore, Mysore
      { term: 'ai', expectedCount: 3 }, // Mumbai, Chennai, Jaipur
      { term: 'a', expectedCount: 10 }, // Many cities contain 'a'
    ];
    
    for (const test of partialSearchTests) {
      const { container } = render(
        <CityList
          cities={cities}
          onCitySelect={mockOnCitySelect}
          isLoading={false}
          error={null}
        />
      );
      
      const searchInput = screen.getByPlaceholderText('Search cities');
      fireEvent.change(searchInput, { target: { value: test.term } });
      
      const cityCards = container.querySelectorAll('.city-card');
      expect(cityCards.length).toBe(test.expectedCount);
      
      // Verify all rendered cities contain the search term
      cityCards.forEach(card => {
        const cityName = card.querySelector('h3')?.textContent || '';
        expect(cityName.toLowerCase()).toContain(test.term.toLowerCase());
      });
    }
  });
  
  it('Property 8: Empty search should return all cities', () => {
    const cities = generateTestCities();
    
    const { container } = render(
      <CityList
        cities={cities}
        onCitySelect={mockOnCitySelect}
        isLoading={false}
        error={null}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search cities');
    
    // Initially, all cities should be visible
    let cityCards = container.querySelectorAll('.city-card');
    expect(cityCards.length).toBe(cities.length);
    
    // Enter a search term
    fireEvent.change(searchInput, { target: { value: 'Mumbai' } });
    cityCards = container.querySelectorAll('.city-card');
    expect(cityCards.length).toBe(1);
    
    // Clear the search
    fireEvent.change(searchInput, { target: { value: '' } });
    cityCards = container.querySelectorAll('.city-card');
    expect(cityCards.length).toBe(cities.length);
  });
  
  it('Property 8: Search with no matches should show empty state', () => {
    const cities = generateTestCities();
    
    render(
      <CityList
        cities={cities}
        onCitySelect={mockOnCitySelect}
        isLoading={false}
        error={null}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search cities');
    fireEvent.change(searchInput, { target: { value: 'NonExistentCity123' } });
    
    // Should show "No cities found" message
    expect(screen.getByText('No cities found')).toBeInTheDocument();
  });
  
  it('Property 8: Search should work independently of state and region filters', () => {
    const cities = generateTestCities();
    
    const { container } = render(
      <CityList
        cities={cities}
        onCitySelect={mockOnCitySelect}
        isLoading={false}
        error={null}
      />
    );
    
    // Apply search filter
    const searchInput = screen.getByPlaceholderText('Search cities');
    fireEvent.change(searchInput, { target: { value: 'bad' } });
    
    // Should find Ahmedabad and Hyderabad
    let cityCards = container.querySelectorAll('.city-card');
    expect(cityCards.length).toBe(2);
    
    // Now also apply state filter
    const stateFilter = screen.getByLabelText(/Filter by State/i);
    fireEvent.change(stateFilter, { target: { value: 'Gujarat' } });
    
    // Should now only show Ahmedabad (matches both search and state)
    cityCards = container.querySelectorAll('.city-card');
    expect(cityCards.length).toBe(1);
    
    const cityName = cityCards[0].querySelector('h3')?.textContent;
    expect(cityName).toBe('Ahmedabad');
  });
  
  it('Property 8: Search results should maintain correct city data', () => {
    const cities = generateTestCities();
    
    const { container } = render(
      <CityList
        cities={cities}
        onCitySelect={mockOnCitySelect}
        isLoading={false}
        error={null}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search cities');
    fireEvent.change(searchInput, { target: { value: 'Mumbai' } });
    
    const cityCards = container.querySelectorAll('.city-card');
    expect(cityCards.length).toBe(1);
    
    const card = cityCards[0];
    const mumbaiCity = cities.find(c => c.name === 'Mumbai')!;
    
    // Verify all city data is correctly displayed
    expect(card.querySelector('h3')?.textContent).toBe(mumbaiCity.name);
    expect(card.textContent).toContain(mumbaiCity.state);
    expect(card.textContent).toContain(mumbaiCity.region);
    expect(card.textContent).toContain(`${mumbaiCity.heritageCount} heritage items`);
  });
  
  it('Property 8: Rapid search term changes should produce correct results', () => {
    const cities = generateTestCities();
    
    const { container } = render(
      <CityList
        cities={cities}
        onCitySelect={mockOnCitySelect}
        isLoading={false}
        error={null}
      />
    );
    
    const searchInput = screen.getByPlaceholderText('Search cities');
    const searchSequence = ['M', 'Mu', 'Mum', 'Mumb', 'Mumbai'];
    
    for (const term of searchSequence) {
      fireEvent.change(searchInput, { target: { value: term } });
      
      const cityCards = container.querySelectorAll('.city-card');
      const renderedCities = Array.from(cityCards).map(card => 
        card.querySelector('h3')?.textContent || ''
      );
      
      // Verify all rendered cities contain the search term
      renderedCities.forEach(cityName => {
        expect(cityName.toLowerCase()).toContain(term.toLowerCase());
      });
    }
    
    // Final state should show only Mumbai
    const finalCards = container.querySelectorAll('.city-card');
    expect(finalCards.length).toBe(1);
    expect(finalCards[0].querySelector('h3')?.textContent).toBe('Mumbai');
  });
});
