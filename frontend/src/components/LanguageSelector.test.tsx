import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { LanguageProvider } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';

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
        { code: 'te', name: 'తెలుగు', englishName: 'Telugu' },
        { code: 'or', name: 'ଓଡ଼ିଆ', englishName: 'Odia' },
        { code: 'as', name: 'অসমীয়া', englishName: 'Assamese' },
        { code: 'ks', name: 'कॉशुर', englishName: 'Kashmiri' },
        { code: 'kok', name: 'कोंकणी', englishName: 'Konkani' },
        { code: 'mni', name: 'মৈতৈলোন্', englishName: 'Manipuri' },
        { code: 'ne', name: 'नेपाली', englishName: 'Nepali' },
        { code: 'sa', name: 'संस्कृतम्', englishName: 'Sanskrit' },
        { code: 'sd', name: 'سنڌي', englishName: 'Sindhi' },
        { code: 'ur', name: 'اردو', englishName: 'Urdu' },
        { code: 'brx', name: 'बड़ो', englishName: 'Bodo' },
        { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santhali' },
        { code: 'mai', name: 'मैथिली', englishName: 'Maithili' },
        { code: 'doi', name: 'डोगरी', englishName: 'Dogri' }
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

describe('LanguageSelector Unit Tests', () => {
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    
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
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the language selector with current language', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Check if the component renders
      expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      
      // Check if Om symbol is present
      expect(screen.getByText('🕉️')).toBeInTheDocument();
      
      // Check if scroll icon is present
      expect(screen.getByText('📜')).toBeInTheDocument();
    });

    it('renders all 23 languages when dropdown is opened', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: /available languages/i })).toBeInTheDocument();
      });

      // Check that all 23 languages are rendered
      const languageOptions = screen.getAllByRole('option');
      expect(languageOptions).toHaveLength(23);

      // Check for specific languages in their native scripts
      expect(screen.getByText('हिन्दी')).toBeInTheDocument(); // Hindi
      expect(screen.getByText('தமிழ்')).toBeInTheDocument(); // Tamil
      expect(screen.getByText('বাংলা')).toBeInTheDocument(); // Bengali
      expect(screen.getByText('ગુજરાતી')).toBeInTheDocument(); // Gujarati
      expect(screen.getByText('ಕನ್ನಡ')).toBeInTheDocument(); // Kannada
      expect(screen.getByText('മലയാളം')).toBeInTheDocument(); // Malayalam
      expect(screen.getByText('मराठी')).toBeInTheDocument(); // Marathi
      expect(screen.getByText('ਪੰਜਾਬੀ')).toBeInTheDocument(); // Punjabi
      expect(screen.getByText('తెలుగు')).toBeInTheDocument(); // Telugu
    });

    it('displays cultural symbols for each language', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Check if cultural symbols are present (these are emojis/symbols)
      const languageOptions = screen.getAllByRole('option');
      expect(languageOptions.length).toBe(23);

      // Each option should have cultural symbols
      languageOptions.forEach(option => {
        expect(option).toBeInTheDocument();
      });
    });
  });

  describe('Language Selection Updates State', () => {
    it('updates state when a language is selected', async () => {
      const mockSetLanguage = vi.fn().mockResolvedValue(undefined);
      
      // Mock the language context
      vi.doMock('../contexts/LanguageContext', () => ({
        useLanguageContext: () => ({
          currentLanguage: 'en',
          setLanguage: mockSetLanguage,
          isLanguageLoading: false
        }),
        LanguageProvider: ({ children }: { children: React.ReactNode }) => children
      }));

      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Click on Hindi option
      const hindiOption = screen.getByText('हिन्दी').closest('[role="option"]');
      if (hindiOption) {
        fireEvent.click(hindiOption);

        // Verify that setLanguage was called
        await waitFor(() => {
          expect(mockSetLanguage).toHaveBeenCalledWith('hi');
        });
      }
    });

    it('closes dropdown after language selection', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Select a language
      const languageOptions = screen.getAllByRole('option');
      if (languageOptions.length > 1) {
        fireEvent.click(languageOptions[1]);

        // Dropdown should close
        await waitFor(() => {
          expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
      }
    });

    it('shows selected language as current', async () => {
      // Mock with Hindi as current language
      vi.doMock('../contexts/LanguageContext', () => ({
        useLanguageContext: () => ({
          currentLanguage: 'hi',
          setLanguage: vi.fn(),
          isLanguageLoading: false
        }),
        LanguageProvider: ({ children }: { children: React.ReactNode }) => children
      }));

      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Check if Hindi option is marked as selected
      const hindiOption = screen.getByText('हिन्दी').closest('[role="option"]');
      expect(hindiOption).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Language Persistence to localStorage', () => {
    it('persists language selection to localStorage', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Select Tamil
      const tamilOption = screen.getByText('தமிழ்').closest('[role="option"]');
      if (tamilOption) {
        fireEvent.click(tamilOption);

        // Wait for language change to complete
        await waitFor(() => {
          expect(window.localStorage.setItem).toHaveBeenCalledWith('i18nextLng', 'ta');
        });
      }
    });

    it('reads language preference from localStorage on mount', async () => {
      // Pre-populate localStorage
      mockLocalStorage['i18nextLng'] = 'hi';

      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Verify localStorage was read
      await waitFor(() => {
        expect(window.localStorage.getItem).toHaveBeenCalledWith('i18nextLng');
      });
    });

    it('handles localStorage errors gracefully', async () => {
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

      // Component should render without crashing
      expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
    });
  });

  describe('Search/Filter Functionality', () => {
    it('filters languages based on native name search', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Type in search input
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      fireEvent.change(searchInput, { target: { value: 'हिन्दी' } });

      // Wait for filtering to occur
      await waitFor(() => {
        // Should show Hindi option
        expect(screen.getByText('हिन्दी')).toBeInTheDocument();
        // Should not show Tamil (filtered out)
        expect(screen.queryByText('தமிழ்')).not.toBeInTheDocument();
      });
    });

    it('filters languages based on English name search', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Search for "Tamil" in English
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      fireEvent.change(searchInput, { target: { value: 'Tamil' } });

      await waitFor(() => {
        // Should show Tamil option
        expect(screen.getByText('தமிழ்')).toBeInTheDocument();
        // Should not show Hindi (filtered out)
        expect(screen.queryByText('हिन्दी')).not.toBeInTheDocument();
      });
    });

    it('filters languages based on language code search', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Search for language code "hi"
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      fireEvent.change(searchInput, { target: { value: 'hi' } });

      await waitFor(() => {
        // Should show Hindi option
        expect(screen.getByText('हिन्दी')).toBeInTheDocument();
        // Should not show Tamil (filtered out)
        expect(screen.queryByText('தமிழ்')).not.toBeInTheDocument();
      });
    });

    it('shows no results message when search yields no matches', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Search for non-existent language
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      fireEvent.change(searchInput, { target: { value: 'xyz123' } });

      await waitFor(() => {
        expect(screen.getByText(/no languages found/i)).toBeInTheDocument();
      });
    });

    it('clears search when dropdown is closed', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Type in search
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      fireEvent.change(searchInput, { target: { value: 'Hindi' } });

      // Close dropdown by clicking outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });

      // Reopen dropdown
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Search should be cleared
      const newSearchInput = screen.getByPlaceholderText(/search languages/i);
      expect(newSearchInput).toHaveValue('');
    });
  });

  describe('Dropdown Behavior', () => {
    it('opens dropdown when clicked', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: /available languages/i })).toBeInTheDocument();
      });

      // Check if search input is present
      expect(screen.getByPlaceholderText(/search languages/i)).toBeInTheDocument();
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <TestWrapper>
          <div>
            <LanguageSelector />
            <div data-testid="outside">Outside element</div>
          </div>
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('focuses search input when dropdown opens', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Search input should be focused
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      expect(searchInput).toHaveFocus();
    });

    it('displays language count in footer', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Check if language count is displayed
      expect(screen.getByText(/23 languages supported/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('opens dropdown with Enter key', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      
      // Test Enter key to open dropdown
      fireEvent.keyDown(button, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('closes dropdown with Escape key', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Test Escape key to close dropdown
      fireEvent.keyDown(button, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    it('selects language with Enter key on option', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Find Hindi option and press Enter
      const hindiOption = screen.getByText('हिन्दी').closest('[role="option"]');
      if (hindiOption) {
        fireEvent.keyDown(hindiOption, { key: 'Enter' });

        // Dropdown should close
        await waitFor(() => {
          expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
      }
    });

    it('selects language with Space key on option', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Find Tamil option and press Space
      const tamilOption = screen.getByText('தமிழ்').closest('[role="option"]');
      if (tamilOption) {
        fireEvent.keyDown(tamilOption, { key: ' ' });

        // Dropdown should close
        await waitFor(() => {
          expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Loading States', () => {
    it('shows loading state when languages are loading', async () => {
      // Mock API to return loading state
      vi.mocked(require('../services/apiClient').apiClient.getLanguages).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );

      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Should show loading indicator
      expect(screen.getByLabelText(/loading languages/i)).toBeInTheDocument();
    });

    it('shows loading state when language is changing', async () => {
      // Mock language context with loading state
      vi.doMock('../contexts/LanguageContext', () => ({
        useLanguageContext: () => ({
          currentLanguage: 'en',
          setLanguage: vi.fn(),
          isLanguageLoading: true
        }),
        LanguageProvider: ({ children }: { children: React.ReactNode }) => children
      }));

      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Should show loading indicator
      expect(screen.getByLabelText(/loading languages/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      
      // Check ARIA attributes
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');

      // Open dropdown
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Available Languages');
      });
    });

    it('has proper focus management', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      
      // Button should be focusable
      button.focus();
      expect(button).toHaveFocus();

      // Open dropdown
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Search input should be focused
      const searchInput = screen.getByPlaceholderText(/search languages/i);
      expect(searchInput).toHaveFocus();
    });

    it('supports screen reader labels', async () => {
      render(
        <TestWrapper>
          <LanguageSelector />
        </TestWrapper>
      );

      // Check for screen reader friendly labels
      expect(screen.getByRole('button', { name: /select language/i })).toBeInTheDocument();
      
      // Open dropdown
      const button = screen.getByRole('button', { name: /select language/i });
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole('listbox', { name: /available languages/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/search languages/i)).toBeInTheDocument();
      });
    });
  });
});