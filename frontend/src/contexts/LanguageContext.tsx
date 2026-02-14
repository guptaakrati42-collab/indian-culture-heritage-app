import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../services/apiClient';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  isLanguageLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(i18n.language || 'en');
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);

  const setLanguage = async (language: string) => {
    setIsLanguageLoading(true);
    
    try {
      // Update i18next language
      await i18n.changeLanguage(language);
      
      // Update API client language
      apiClient.setLanguage(language);
      
      // Update local state
      setCurrentLanguage(language);
      
      // Persist to localStorage
      localStorage.setItem('i18nextLng', language);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLanguageLoading(false);
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || 'en';
    if (savedLanguage !== currentLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Ensure API client has the correct language
      apiClient.setLanguage(currentLanguage);
    }
  }, []);

  // Listen for i18next language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setCurrentLanguage(lng);
      apiClient.setLanguage(lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const value: LanguageContextType = {
    currentLanguage,
    setLanguage,
    isLanguageLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguageContext = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
};