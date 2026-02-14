import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import CityView from './CityView';
import i18n from '../i18n';

// Mock the API client
const mockNavigate = vi.fn();

vi.mock('../services/apiClient', () => ({
  apiClient: {
    getCityHeritage: vi.fn().mockResolvedValue({
      city: {
        id: 'test-city-1',
        name: 'Test City',
        state: 'Test State',
        region: 'Test Region'
      },
      heritage: [
        {
          id: 'heritage-1',
          name: 'Test Heritage 1',
          description: 'Test Description 1',
          category: 'Monument'
        },
        {
          id: 'heritage-2',
          name: 'Test Heritage 2',
          description: 'Test Description 2',
          category: 'Temple'
        }
      ]
    }),
    getCurrentLanguage: vi.fn().mockReturnValue('en')
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ cityId: 'test-city-1' })
  };
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; cityId?: string }> = ({ children, cityId }) => {
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
        <MemoryRouter initialEntries={[`/city/${cityId || 'test-city-1'}`]}>
          {children}
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

// Generate test cases for property testing
const generateCityTestCases = () => {
  const testCases = [];
  const cityIds = [
    'delhi', 'mumbai', 'bangalore', 'kolkata', 'chennai', 'hyderabad',
    'pune', 'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur',
    'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri-chinchwad',
    'patna', 'vadodara', 'ghaziabad'
  ];

  // Add some basic test cases
  for (let i = 0; i < 5; i++) {
    testCases.push({
      cityId: cityIds[i],
      description: `Basic city test case ${i + 1}`
    });
  }

  // Add some random test cases
  for (let i = 0; i < 20; i++) {
    const fromCity = cityIds[Math.floor(Math.random() * cityIds.length)];
    
    if (!testCases.some(tc => tc.cityId === fromCity)) {
      testCases.push({
        cityId: fromCity,
        description: `Random city test case for ${fromCity}`
      });
    }
  }

  return testCases;
};

describe('Property 9: Session State Persistence', () => {
  let originalSessionStorage: Storage;
  let mockSessionStorage: { [key: string]: string };

  beforeEach(() => {
    originalSessionStorage = window.sessionStorage;
    mockSessionStorage = {};

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockSessionStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockSessionStorage[key];
        }),
        clear: vi.fn(() => {
          mockSessionStorage = {};
        }),
        length: 0,
        key: vi.fn()
      },
      writable: true
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: originalSessionStorage,
      writable: true
    });
  });

  it('Property 9: City selection should persist in sessionStorage', async () => {
    const testCases = generateCityTestCases();

    for (const testCase of testCases.slice(0, 5)) {
      // Reset sessionStorage for each test
      mockSessionStorage = {};

      render(
        <TestWrapper cityId={testCase.cityId}>
          <CityView />
        </TestWrapper>
      );

      // Wait for component to mount and potentially set sessionStorage
      await waitFor(() => {
        expect(
          window.sessionStorage.setItem
        ).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Verify sessionStorage was called with the city ID
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        'selectedCityId',
        testCase.cityId
      );
    }
  });

  it('Property 9: City selection should persist across component remounts', async () => {
    const cityId = 'test-city-persistent';

    // First render
    const { unmount } = render(
      <TestWrapper cityId={cityId}>
        <CityView />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockSessionStorage['selectedCityId']).toBe(cityId);
    }, { timeout: 3000 });

    unmount();

    // Second render - should still have the same value
    render(
      <TestWrapper cityId={cityId}>
        <CityView />
      </TestWrapper>
    );

    expect(mockSessionStorage['selectedCityId']).toBe(cityId);
  });

  it('Property 9: City selection should update when switching between cities', async () => {
    const cities = ['city-1', 'city-2', 'city-3', 'city-4', 'city-5'];

    for (const cityId of cities) {
      const { unmount } = render(
        <TestWrapper cityId={cityId}>
          <CityView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSessionStorage['selectedCityId']).toBe(cityId);
      }, { timeout: 3000 });

      unmount();
    }

    // Final check - should have the last city
    expect(mockSessionStorage['selectedCityId']).toBe(cities[cities.length - 1]);
  });

  it('Property 9: City selection should handle sessionStorage errors gracefully', async () => {
    // Mock sessionStorage.setItem to throw an error
    const mockSetItem = vi.fn().mockImplementation(() => {
      throw new Error('sessionStorage is full');
    });

    Object.defineProperty(window, 'sessionStorage', {
      value: {
        ...window.sessionStorage,
        setItem: mockSetItem
      },
      writable: true
    });

    // Component should still render without crashing
    render(
      <TestWrapper cityId="test-city-error">
        <CityView />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Component should handle the error gracefully
    expect(mockSetItem).toHaveBeenCalledWith('selectedCityId', 'test-city-error');
  });

  it('Property 9: City selection should persist only during the session', async () => {
    const cityId = 'test-city-session';

    render(
      <TestWrapper cityId={cityId}>
        <CityView />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockSessionStorage['selectedCityId']).toBe(cityId);
    }, { timeout: 3000 });

    // Simulate session end (clear sessionStorage)
    window.sessionStorage.clear();

    // After clearing, the value should be gone
    expect(mockSessionStorage['selectedCityId']).toBeUndefined();
  });

  it('Property 9: Multiple city selections should overwrite previous selections', async () => {
    const citySequence = ['city-a', 'city-b', 'city-c'];

    for (const cityId of citySequence) {
      const { unmount } = render(
        <TestWrapper cityId={cityId}>
          <CityView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSessionStorage['selectedCityId']).toBe(cityId);
      }, { timeout: 3000 });

      unmount();
    }

    // Should only have the last city ID
    expect(mockSessionStorage['selectedCityId']).toBe('city-c');
    expect(Object.keys(mockSessionStorage).filter(key => key === 'selectedCityId')).toHaveLength(1);
  });

  it('Property 9: City selection should persist with different languages', async () => {
    const cityId = 'test-city-multilang';
    const languages = ['en', 'hi', 'ta', 'bn'];

    for (const language of languages) {
      vi.mocked(require('../services/apiClient').apiClient.getCurrentLanguage).mockReturnValue(language);

      const { unmount } = render(
        <TestWrapper cityId={cityId}>
          <CityView />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockSessionStorage['selectedCityId']).toBe(cityId);
      }, { timeout: 3000 });

      unmount();
    }

    // City ID should persist regardless of language
    expect(mockSessionStorage['selectedCityId']).toBe(cityId);
  });

  it('Property 9: Empty or invalid city IDs should not be persisted', async () => {
    const invalidCityIds = ['', null, undefined];

    for (const invalidId of invalidCityIds) {
      mockSessionStorage = {};

      render(
        <TestWrapper cityId={invalidId as string}>
          <CityView />
        </TestWrapper>
      );

      // Wait a bit to see if anything gets set
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should not persist invalid IDs
      if (invalidId === '' || invalidId === null || invalidId === undefined) {
        expect(mockSessionStorage['selectedCityId']).toBeUndefined();
      }

      unmount();
    }
  });

  it('Property 9: City selection should work with URL parameters', async () => {
    // This test verifies that city selection works when cityId comes from URL params
    const cityId = 'url-param-city';

    render(
      <TestWrapper cityId={cityId}>
        <CityView />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockSessionStorage['selectedCityId']).toBe(cityId);
    }, { timeout: 3000 });
  });
});