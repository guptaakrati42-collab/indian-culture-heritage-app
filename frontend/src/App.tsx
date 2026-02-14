import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageSelector } from './components/LanguageSelector';
import { routes } from './routes';

// Loading indicator component - memoized to prevent unnecessary re-renders
const GlobalLoadingIndicator: React.FC<{ isLoading: boolean }> = React.memo(({ isLoading }) => {
  if (!isLoading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-primary-200">
        <div className="h-full bg-primary-600 animate-pulse" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
});

// App header component - memoized to prevent unnecessary re-renders
const AppHeader: React.FC = React.memo(() => {
  const { t, i18n } = useTranslation();
  
  const handleLanguageChange = useCallback((languageCode: string) => {
    i18n.changeLanguage(languageCode);
  }, [i18n]);
  
  return (
    <header className="bg-primary-600 text-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl" role="img" aria-label="Om symbol">
              🕉️
            </span>
            <h1 className="text-xl md:text-2xl font-bold">
              {t('app.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSelector
              currentLanguage={i18n.language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </div>
      </div>
    </header>
  );
});

// Route change tracker for loading state
const RouteChangeTracker: React.FC<{ onRouteChange: () => void }> = ({ onRouteChange }) => {
  const location = useLocation();
  
  useEffect(() => {
    onRouteChange();
  }, [location.pathname, onRouteChange]);
  
  return null;
};

// Main App content
const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRouteChange = useCallback(() => {
    setIsLoading(true);
    // Reset loading state after a short delay
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <RouteChangeTracker onRouteChange={handleRouteChange} />
      <GlobalLoadingIndicator isLoading={isLoading} />
      <AppHeader />
      <main className="min-h-[calc(100vh-64px)] bg-gray-50">
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </main>
    </>
  );
};

// Root App component with providers
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
