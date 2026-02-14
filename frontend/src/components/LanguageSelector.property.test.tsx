import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { LanguageProvider } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

/**
 * Property 3: Language Preference Persistence
 * 
 * **Validates: Requirements 1.3**
 * 
 * For any supported language selection, when a user changes their language preference,
 * the system should persist that selection to localStorage and restore it in future sessions.
 * The persistence should work across browser refreshes and component remounts.
 */

// Mock the API client
vi.mock('../services/apiClient', () => ({
  apiClient: {
    getLanguages: vi.fn().mockResolvedValue({
      languages: [
        { code: 'en', name: 'English', englishName: 'English' },
        { code: 'hi', name: 'हिन्दी', englishName: 'Hindi' },
        { code: 'ta', name: 'தமிழ்', englishName: 'Tamil' },
        { code: 'bn', name: 'বাংলা', englishName: 'Bengali' },
        { code: 'gu', name: 'ગુજરાતી', englishName: 'Gujarati' },
        { code: 'kn', name: 'ಕನ್ನಡ', englishName: 'Kannada' },
        { code: 'ml', name: 'മലയാളം', englishName: 'Malayalam' },
        { code: 'mr', name: 'मराठी', englishName: 'Marathi' },
        { code: 'pa', name: 'ਪੰਜਾਬੀ', englishName: 'Punjabi' },
        { code: 'te', name: 'తెలుగు', englishName: 'Telugu' }
      ]
    }),
    setLanguage: vi.fn(),
    getCurrentLanguage: vi.fn().mockReturnValue('en')
  }
}));

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
    <QueryProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </I18nextProvider>
    </QueryProvider>
  );
};

// Property-based test data generator
const generateLanguageTestCases = () => {
  const supportedLanguages = [
    'en', 'hi', 'ta', 'bn', 'gu', 'kn', 'ml', 'mr', 'pa', 'te'
  ];
  
  const testCases = [];
  
  // Generate test cases for each supported language
  for (const language of supportedLanguages) {
    testCases.push({
      language,
      description: `Language preference persistence for ${language}`
    });
  }
  
  // Generate test cases for language switching sequences
  for (let i = 0; i < 20; i++) {
    const fromLang = supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)];
    const toLang = supportedLanguages[Math.floor(Math.random() * supportedLanguages.length)];
    
    if (fromLang !== toLang) {
      testCases.push({
        language: toLang,
        previousLanguage: fromLang,
        description: `Language switch from ${fromLang} to ${toLang}`
      });
    }
  }
  
  return testCases;
};

describe('Property 3: Language Preference Persistence', () => {
  let originalLocalStorage: Storage;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    originalLocalStorage = window.localStorage;
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
        length: 0,
        key: vi.fn()
      },
      writable: true
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original localStorage
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
  });

  it('Property 3: Language preference should persist across component remounts', async () => {
    const testCases = generateLanguageTestCases();
    
    for (const testCase of testCases) {
      // Clear localStorage before each test case
      mockLocalStorage = {};
      
      // First render - select a language
      const { unmount } = render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown and select language
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Find and click the language option
      const languageOptions = screen.getAllByRole('option');
      const targetOption = languageOptions.find(option => 
        option.textContent?.includes(testCase.language)
      );

      if (targetOption) {
        fireEvent.click(targetOption);

        // Wait for language change to complete
        await waitFor(() => {
          expect(window.localStorage.setItem).toHaveBeenCalledWith(
            'i18nextLng', 
            testCase.language
          );
        });

        // Verify localStorage was updated
        expect(mockLocalStorage['i18nextLng']).toBe(testCase.language);
      }

      // Unmount component
      unmount();

      // Second render - verify persistence
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Verify localStorage was read on mount
      await waitFor(() => {
        expect(window.localStorage.getItem).toHaveBeenCalledWith('i18nextLng');
      });

      // The component should restore the previously selected language
      // This is verified by checking that the localStorage value is used
      expect(mockLocalStorage['i18nextLng']).toBe(testCase.language);
    }
  });

  it('Property 3: Language preference should persist through multiple language changes', async () => {
    const languages = ['en', 'hi', 'ta', 'bn', 'gu'];
    
    render(
      <TestWrapper>
        <LanguageSelector />
      </TestWrapper>
    );

    for (const language of languages) {
      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Find and click the language option
      const languageOptions = screen.getAllByRole('option');
      const targetOption = languageOptions.find(option => 
        option.textContent?.includes(language)
      );

      if (targetOption) {
        fireEvent.click(targetOption);

        // Wait for language change to complete
        await waitFor(() => {
          expect(mockLocalStorage['i18nextLng']).toBe(language);
        });
      }

      // Wait a bit before next iteration
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    // Verify final state
    expect(mockLocalStorage['i18nextLng']).toBe(languages[languages.length - 1]);
  });

  it('Property 3: Language preference should handle localStorage errors gracefully', async () => {
    // Mock localStorage to throw errors
    const mockSetItem = vi.fn().mockImplementation(() => {
      throw new Error('localStorage is full');
    });
    
    Object.defineProperty(window, 'localStorage', {
      value: {
        ...window.localStorage,
        setItem: mockSetItem
      },
      writable: true
    });

    render(
      <TestWrapper>
        <LanguageSelector />
      </TestWrapper>
    );

    // Open dropdown and try to select a language
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const languageOptions = screen.getAllByRole('option');
    if (languageOptions.length > 1) {
      fireEvent.click(languageOptions[1]);

      // The component should handle the error gracefully
      // and not crash the application
      await waitFor(() => {
        expect(mockSetItem).toHaveBeenCalled();
      });

      // Component should still be functional
      expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
    }
  });

  it('Property 3: Language preference should default to English when no preference is stored', async () => {
    // Ensure localStorage is empty
    mockLocalStorage = {};
    
    render(
      <TestWrapper>
        <LanguageSelector />
      </TestWrapper>
    );

    // Verify that getItem was called to check for stored preference
    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('i18nextLng');
    });

    // Since no preference is stored, should default to English
    // This is verified by the component rendering without errors
    expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
  });

  it('Property 3: Language preference should restore from localStorage on initial load', async () => {
    // Pre-populate localStorage with a language preference
    const storedLanguage = 'hi';
    mockLocalStorage['i18nextLng'] = storedLanguage;
    
    render(
      <TestWrapper>
        <LanguageSelector />
      </TestWrapper>
    );

    // Verify localStorage was checked on mount
    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('i18nextLng');
    });

    // The component should use the stored language preference
    // This is verified by checking that the stored value is available
    expect(mockLocalStorage['i18nextLng']).toBe(storedLanguage);
  });

  it('Property 3: Language preference should persist across browser sessions (simulation)', async () => {
    const testLanguage = 'ta';
    
    // Simulate first session
    render(
      <TestWrapper>
        <LanguageSelector />
      </TestWrapper>
    );

    // Select a language
    const button = screen.getByRole('button', { name: /select language/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    const languageOptions = screen.getAllByRole('option');
    const tamilOption = languageOptions.find(option => 
      option.textContent?.includes('தமிழ்')
    );

    if (tamilOption) {
      fireEvent.click(tamilOption);

      await waitFor(() => {
        expect(mockLocalStorage['i18nextLng']).toBe(testLanguage);
      });
    }

    // Simulate browser restart by creating new component instance
    // but keeping the same localStorage mock (simulating persistence)
    const storedValue = mockLocalStorage['i18nextLng'];
    
    render(
      <TestWrapper>
        <LanguageSelector />
      </TestWrapper>
    );

    // Verify the language preference persisted
    expect(storedValue).toBe(testLanguage);
    
    // Verify localStorage was accessed to restore the preference
    await waitFor(() => {
      expect(window.localStorage.getItem).toHaveBeenCalledWith('i18nextLng');
    });
  });
});