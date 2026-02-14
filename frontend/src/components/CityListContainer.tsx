import React from 'react';
import { useLanguageContext } from '../contexts/LanguageContext';
import { useCities } from '../hooks/useCities';
import CityList from './CityList';

interface CityListContainerProps {
  onCitySelect: (cityId: string) => void;
}

/**
 * Container component that integrates CityList with React Query
 * Handles data fetching, loading states, and error handling
 */
const CityListContainer: React.FC<CityListContainerProps> = ({ onCitySelect }) => {
  const { currentLanguage } = useLanguageContext();
  
  // Fetch cities with React Query
  const { data: cities = [], isLoading, error, isError } = useCities({
    language: currentLanguage
  });

  // Format error message
  const errorMessage = isError && error 
    ? (error as any).message || 'Failed to load cities'
    : null;

  return (
    <CityList
      cities={cities}
      onCitySelect={onCitySelect}
      isLoading={isLoading}
      error={errorMessage}
    />
  );
};

export default CityListContainer;
