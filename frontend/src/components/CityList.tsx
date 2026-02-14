import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { City } from '../hooks/useCities';
import { CityListSkeleton } from './CityCardSkeleton';

interface CityListProps {
  cities: City[];
  onCitySelect: (cityId: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

interface FilterState {
  searchTerm: string;
  selectedState: string;
  selectedRegion: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
  'Andaman and Nicobar Islands', 'Dadra and Nagar Haveli and Daman and Diu',
  'Lakshadweep'
];

const INDIAN_REGIONS = [
  'North', 'South', 'East', 'West', 'Central', 'Northeast'
];

const CityList: React.FC<CityListProps> = React.memo(({
  cities,
  onCitySelect,
  isLoading = false,
  error = null
}) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedState: '',
    selectedRegion: ''
  });

  const filteredCities = useMemo(() => {
    return cities.filter(city => {
      const matchesSearch = !filters.searchTerm || 
        city.name.toLowerCase().includes(filters.searchTerm.toLowerCase());
      const matchesState = !filters.selectedState || city.state === filters.selectedState;
      const matchesRegion = !filters.selectedRegion || city.region === filters.selectedRegion;
      return matchesSearch && matchesState && matchesRegion;
    });
  }, [cities, filters]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchTerm: event.target.value }));
  }, []);

  const handleStateChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, selectedState: event.target.value }));
  }, []);

  const handleRegionChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, selectedRegion: event.target.value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ searchTerm: '', selectedState: '', selectedRegion: '' });
  }, []);

  const getRegionalColorClass = useCallback((region: string): string => {
    const colorMap: Record<string, string> = {
      'North': 'border-kashmiri-500 hover:shadow-kashmiri-500/20',
      'South': 'border-kerala-500 hover:shadow-kerala-500/20',
      'East': 'border-emerald-500 hover:shadow-emerald-500/20',
      'West': 'border-rajasthani-500 hover:shadow-rajasthani-500/20',
      'Central': 'border-saffron-500 hover:shadow-saffron-500/20',
      'Northeast': 'border-mysore-500 hover:shadow-mysore-500/20'
    };
    return colorMap[region] || 'border-saffron-500 hover:shadow-saffron-500/20';
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-sacred-xl text-center">
        <div className="text-kashmiri-500 text-6xl mb-sacred-md"></div>
        <h2 className="text-cultural-heading text-2xl text-charcoal-500 mb-sacred-sm">
          {t('error.loading')}
        </h2>
        <p className="text-cultural-body text-charcoal-400 mb-sacred-md">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-cultural btn-cultural-primary">
          {t('error.retry')}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <CityListSkeleton count={8} />;
  }

  return (
    <div className="city-list-container w-full max-w-7xl mx-auto px-sacred-md py-sacred-lg">
      <div className="text-center mb-sacred-lg">
        <div className="text-4xl mb-sacred-sm"></div>
        <h1 className="text-cultural-heading text-4xl text-charcoal-500 mb-sacred-xs">
          {t('city.select')}
        </h1>
      </div>
      <div className="filters-section bg-ivory-100 border-2 border-kerala-500 rounded-lg p-sacred-md mb-sacred-lg shadow-cultural">
        <div className="mb-sacred-sm">
          <label htmlFor="city-search" className="block text-cultural-body text-sm text-charcoal-500 mb-sacred-xs">
             {t('city.search')}
          </label>
          <input
            id="city-search"
            type="text"
            value={filters.searchTerm}
            onChange={handleSearchChange}
            placeholder={t('city.search')}
            className="w-full px-sacred-sm py-sacred-xs border-2 border-sandstone-500 rounded-md focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-cultural-body bg-white transition-all"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-sacred-sm mb-sacred-sm">
          <div>
            <label htmlFor="state-filter" className="block text-cultural-body text-sm text-charcoal-500 mb-sacred-xs">
               {t('city.filterByState')}
            </label>
            <select
              id="state-filter"
              value={filters.selectedState}
              onChange={handleStateChange}
              className="w-full px-sacred-sm py-sacred-xs border-2 border-sandstone-500 rounded-md focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-cultural-body bg-white transition-all cursor-pointer"
            >
              <option value="">{t('city.filterByState')}</option>
              {INDIAN_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="region-filter" className="block text-cultural-body text-sm text-charcoal-500 mb-sacred-xs">
               {t('city.filterByRegion')}
            </label>
            <select
              id="region-filter"
              value={filters.selectedRegion}
              onChange={handleRegionChange}
              className="w-full px-sacred-sm py-sacred-xs border-2 border-sandstone-500 rounded-md focus:outline-none focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 text-cultural-body bg-white transition-all cursor-pointer"
            >
              <option value="">{t('city.filterByRegion')}</option>
              {INDIAN_REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>
        {(filters.searchTerm || filters.selectedState || filters.selectedRegion) && (
          <button onClick={clearFilters} className="text-sm text-kashmiri-500 hover:text-kashmiri-600 underline transition-colors">
             Clear all filters
          </button>
        )}
      </div>
      {filteredCities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-sacred-xl text-center">
          <div className="text-6xl mb-sacred-md"></div>
          <p className="text-cultural-body text-charcoal-400">{t('city.notFound')}</p>
        </div>
      )}
      {filteredCities.length > 0 && (
        <div className="city-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-sacred-md">
          {filteredCities.map(city => (
            <div
              key={city.id}
              onClick={() => onCitySelect(city.id)}
              className={`city-card group cursor-pointer bg-white rounded-lg overflow-hidden border-3 ${getRegionalColorClass(city.region)} shadow-cultural hover:shadow-cultural-lg transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-saffron-500/30`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCitySelect(city.id);
                }
              }}
              aria-label={`Select ${city.name}, ${city.state}`}
            >
              <div className="relative h-48 overflow-hidden bg-sandstone-200">
                <img
                  src={city.previewImage}
                  alt={city.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F4E4BC" width="400" height="300"/%3E%3Ctext fill="%2336454F" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E%3C/text%3E%3C/svg%3E';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-sacred-sm">
                <h3 className="text-cultural-heading text-lg text-charcoal-500 mb-sacred-xs group-hover:text-saffron-600 transition-colors">
                  {city.name}
                </h3>
                <p className="text-cultural-body text-sm text-charcoal-400 mb-sacred-xs"> {city.state}</p>
                <p className="text-cultural-body text-xs text-charcoal-400 mb-sacred-xs"> {city.region}</p>
                <div className="flex items-center justify-between mt-sacred-sm pt-sacred-xs border-t border-sandstone-300">
                  <span className="text-cultural-body text-xs text-saffron-600 font-medium">
                    {t('city.heritageCount', { count: city.heritageCount })}
                  </span>
                  <span className="text-xl"></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

CityList.displayName = 'CityList';

export default CityList;
