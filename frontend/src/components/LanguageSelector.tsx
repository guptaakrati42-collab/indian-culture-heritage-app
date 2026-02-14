import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useLanguages } from '../hooks/useLanguages';
import { supportedLanguages } from '../i18n';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = React.memo(({ className = '' }) => {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage, isLanguageLoading } = useLanguageContext();
  const { data: apiLanguages, isLoading: isApiLoading } = useLanguages();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use local supported languages as fallback if API is not available - memoized
  const languages = useMemo(() => 
    apiLanguages || supportedLanguages.map(lang => ({
      code: lang.code,
      name: lang.nativeName,
      englishName: lang.name
    })),
    [apiLanguages]
  );

  // Filter languages based on search term - memoized
  const filteredLanguages = useMemo(() => 
    languages.filter(lang =>
      lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [languages, searchTerm]
  );

  // Get current language display info - memoized
  const currentLangInfo = useMemo(() => 
    languages.find(lang => lang.code === currentLanguage) || languages[0],
    [languages, currentLanguage]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle language selection - memoized
  const handleLanguageSelect = useCallback(async (languageCode: string) => {
    try {
      await setLanguage(languageCode);
      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  }, [setLanguage]);

  // Handle keyboard navigation - memoized
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    } else if (event.key === 'Enter' && !isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  // Get cultural symbol for language - memoized
  const getCulturalSymbol = useCallback((languageCode: string): string => {
    const symbols: Record<string, string> = {
      'en': '🇬🇧',
      'hi': '🕉️',
      'bn': '🐅',
      'te': '🏛️',
      'mr': '🦚',
      'ta': '🌺',
      'gu': '🦁',
      'kn': '🐘',
      'ml': '🥥',
      'or': '🏺',
      'pa': '⚔️',
      'as': '🦏',
      'ks': '🏔️',
      'kok': '🌊',
      'mni': '🏹',
      'ne': '🏔️',
      'sa': '📿',
      'sd': '🐪',
      'ur': '🌙',
      'brx': '🦋',
      'sat': '🌾',
      'mai': '🐟',
      'doi': '🏔️'
    };
    return symbols[languageCode] || '🌐';
  }, []);

  return (
    <div 
      className={`language-selector ${className}`} 
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      {/* Scroll Header */}
      <div 
        className="scroll-header focus-cultural"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t('language.selector.label', 'Select Language')}
      >
        <span className="om-symbol" aria-hidden="true">🕉️</span>
        <div className="current-language-info">
          <span className="current-language text-devanagari">
            {currentLangInfo?.name || 'English'}
          </span>
          <span className="current-language-english text-xs opacity-75">
            {currentLangInfo?.englishName}
          </span>
        </div>
        <div className="scroll-controls">
          <span className="cultural-symbol" aria-hidden="true">
            {getCulturalSymbol(currentLanguage)}
          </span>
          <span 
            className={`scroll-icon transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          >
            📜
          </span>
        </div>
      </div>

      {/* Language Dropdown */}
      {isOpen && (
        <div 
          className="language-dropdown animate-scroll-unfurl"
          role="listbox"
          aria-label={t('language.dropdown.label', 'Available Languages')}
        >
          {/* Search Input */}
          <div className="search-container p-sacred-sm border-b border-kerala-gold/20">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('language.search.placeholder', 'Search languages...')}
              className="w-full px-3 py-2 text-sm bg-transparent border border-kerala-gold/30 rounded-md focus:outline-none focus:border-saffron-primary focus:ring-1 focus:ring-saffron-primary/20"
              aria-label={t('language.search.label', 'Search languages')}
            />
          </div>

          {/* Language Options */}
          <div className="language-options max-h-64 overflow-y-auto">
            {isApiLoading || isLanguageLoading ? (
              <div className="language-option justify-center">
                <div className="loading-lotus" aria-label={t('language.loading', 'Loading languages...')} />
              </div>
            ) : filteredLanguages.length === 0 ? (
              <div className="language-option justify-center text-charcoal/60">
                {t('language.no_results', 'No languages found')}
              </div>
            ) : (
              filteredLanguages.map((language) => (
                <div
                  key={language.code}
                  className={`language-option focus-cultural ${
                    language.code === currentLanguage ? 'bg-saffron-primary/10 border-l-4 border-l-saffron-primary' : ''
                  }`}
                  onClick={() => handleLanguageSelect(language.code)}
                  role="option"
                  tabIndex={0}
                  aria-selected={language.code === currentLanguage}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLanguageSelect(language.code);
                    }
                  }}
                >
                  <div className="language-info">
                    <span className="script text-devanagari font-medium">
                      {language.name}
                    </span>
                    <span className="english-name text-xs text-charcoal/70">
                      {language.englishName}
                    </span>
                  </div>
                  <div className="language-symbols">
                    <span className="region-symbol" aria-hidden="true">
                      {getCulturalSymbol(language.code)}
                    </span>
                    {language.code === currentLanguage && (
                      <span className="selected-indicator text-saffron-primary" aria-hidden="true">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with language count */}
          <div className="dropdown-footer p-sacred-sm border-t border-kerala-gold/20 text-xs text-charcoal/60 text-center">
            {t('language.count', '{{count}} languages supported', { 
              count: languages.length 
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default LanguageSelector;