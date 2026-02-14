import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCityHeritage, HeritageItem, useHeritageDetail, useHeritageImages } from '../hooks/useHeritage';
import { useLanguageContext } from '../contexts/LanguageContext';
import ImageGallery from './ImageGallery';

interface CityViewProps {
  cityId?: string;
}

const HERITAGE_CATEGORIES = [
  { key: 'all', label: 'All Categories', icon: '🏛️' },
  { key: 'monuments', label: 'heritage.categories.monuments', icon: '🏛️' },
  { key: 'temples', label: 'heritage.categories.temples', icon: '🕌' },
  { key: 'festivals', label: 'heritage.categories.festivals', icon: '🎭' },
  { key: 'traditions', label: 'heritage.categories.traditions', icon: '🪔' },
  { key: 'cuisine', label: 'heritage.categories.cuisine', icon: '🍛' },
  { key: 'art_forms', label: 'heritage.categories.artForms', icon: '🎨' },
  { key: 'historical_events', label: 'heritage.categories.historicalEvents', icon: '📜' },
  { key: 'customs', label: 'heritage.categories.customs', icon: '🙏' },
];

// Heritage Item Card Component with expandable details
interface HeritageItemCardProps {
  item: HeritageItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  language: string;
}

const HeritageItemCard: React.FC<HeritageItemCardProps> = ({ item, isExpanded, onToggleExpand, language }) => {
  const { t } = useTranslation();
  
  // Fetch detailed heritage data only when expanded
  const { data: heritageDetail, isLoading: detailLoading } = useHeritageDetail(
    item.id,
    language,
    isExpanded
  );
  
  // Fetch images only when expanded
  const { data: images, isLoading: imagesLoading } = useHeritageImages(item.id);
  
  const categoryIcon = HERITAGE_CATEGORIES.find(c => c.key === item.category)?.icon || '🏛️';
  
  return (
    <div className="heritage-card bg-white rounded-lg overflow-hidden border-2 border-sandstone-300 shadow-cultural hover:shadow-cultural-lg transition-all duration-300">
      {/* Thumbnail image */}
      <div className="relative h-48 overflow-hidden bg-sandstone-200 cursor-pointer" onClick={onToggleExpand}>
        <img
          src={item.thumbnailImage}
          alt={item.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23F4E4BC" width="400" height="300"/%3E%3Ctext fill="%2336454F" font-family="sans-serif" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E🏛️%3C/text%3E%3C/svg%3E';
          }}
        />
        {!isExpanded && (
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/50 to-transparent flex items-end justify-center pb-4">
            <span className="text-white text-sm font-medium">Click to explore</span>
          </div>
        )}
      </div>

      {/* Heritage info */}
      <div className="p-sacred-sm">
        <div className="flex items-start justify-between mb-sacred-xs">
          <h3 className="text-cultural-heading text-lg text-charcoal-500 flex-1">
            {item.name}
          </h3>
          <span className="text-xl ml-sacred-xs">{categoryIcon}</span>
        </div>
        
        <p className="text-cultural-body text-sm text-charcoal-400 mb-sacred-xs">
          {item.category === 'art_forms' 
            ? t('heritage.categories.art_forms')
            : item.category === 'historical_events'
            ? t('heritage.categories.historical_events')
            : t(`heritage.categories.${item.category}`, item.category)}
        </p>
        
        <p className="text-cultural-body text-sm text-charcoal-500 mb-sacred-sm">
          {item.summary}
        </p>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-sacred-md pt-sacred-md border-t border-sandstone-300 space-y-sacred-md">
            {detailLoading ? (
              <div className="flex justify-center py-sacred-md">
                <div className="animate-spin text-2xl">🕉️</div>
              </div>
            ) : heritageDetail ? (
              <>
                {/* Amazing Facts / Detailed Description */}
                <div className="bg-saffron-50 border-l-4 border-saffron-500 p-sacred-sm rounded">
                  <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2 flex items-center gap-2">
                    <span>✨</span>
                    <span>Amazing Facts</span>
                  </h4>
                  <p className="text-cultural-body text-sm text-charcoal-700 leading-relaxed">
                    {heritageDetail.detailedDescription}
                  </p>
                </div>

                {/* Cultural Significance */}
                {heritageDetail.significance && (
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-sacred-sm rounded">
                    <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2 flex items-center gap-2">
                      <span>🌟</span>
                      <span>Why It Matters</span>
                    </h4>
                    <p className="text-cultural-body text-sm text-charcoal-700 leading-relaxed">
                      {heritageDetail.significance}
                    </p>
                  </div>
                )}

                {/* Historical Period */}
                {heritageDetail.historicalPeriod && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-charcoal-600">📅 Period:</span>
                    <span className="px-sacred-sm py-1 rounded-full text-xs font-medium bg-sandstone-100 text-charcoal-700 border border-sandstone-300">
                      {heritageDetail.historicalPeriod}
                    </span>
                  </div>
                )}

                {/* Image Gallery */}
                {images && images.length > 0 && (
                  <div className="mt-sacred-md">
                    <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-sacred-sm flex items-center gap-2">
                      <span>🖼️</span>
                      <span>Image Gallery</span>
                    </h4>
                    <ImageGallery images={images} culturalTheme="temple" />
                  </div>
                )}
              </>
            ) : null}
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={onToggleExpand}
          className="w-full mt-sacred-sm px-sacred-sm py-sacred-xs bg-saffron-500 hover:bg-saffron-600 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <span>{isExpanded ? '🔼' : '🔽'}</span>
          <span>{isExpanded ? 'Show Less' : 'Learn More'}</span>
        </button>
      </div>
    </div>
  );
};

const CityView: React.FC<CityViewProps> = React.memo(({ cityId: propCityId }) => {
  const { cityId: paramCityId } = useParams<{ cityId: string }>();
  const cityId = propCityId || paramCityId || '';
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentLanguage } = useLanguageContext();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Persist city selection in sessionStorage
  useEffect(() => {
    if (cityId) {
      sessionStorage.setItem('selectedCityId', cityId);
    }
  }, [cityId]);

  // Fetch city heritage data
  const { data, isLoading, error } = useCityHeritage(cityId, { language: currentLanguage });

  // Filter heritage items by category
  const filteredHeritageItems = useMemo(() => {
    if (!data) return [];
    if (selectedCategory === 'all') return data;
    return data.filter((item: HeritageItem) => item.category === selectedCategory);
  }, [data, selectedCategory]);

  const handleBackToList = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="city-view-container w-full max-w-7xl mx-auto px-sacred-md py-sacred-lg">
        <div className="flex flex-col items-center justify-center py-sacred-xl">
          <div className="animate-spin text-6xl mb-sacred-md">🕉️</div>
          <p className="text-cultural-body text-charcoal-400">{t('heritage.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="city-view-container w-full max-w-7xl mx-auto px-sacred-md py-sacred-lg">
        <div className="flex flex-col items-center justify-center py-sacred-xl text-center">
          <div className="text-kashmiri-500 text-6xl mb-sacred-md">🏛️</div>
          <h2 className="text-cultural-heading text-2xl text-charcoal-500 mb-sacred-sm">
            {t('error.loading')}
          </h2>
          <p className="text-cultural-body text-charcoal-400 mb-sacred-md">
            {error instanceof Error ? error.message : String(error)}
          </p>
          <div className="flex gap-sacred-sm">
            <button
              onClick={() => window.location.reload()}
              className="btn-cultural btn-cultural-primary"
            >
              {t('error.retry')}
            </button>
            <button
              onClick={handleBackToList}
              className="btn-cultural btn-cultural-secondary"
            >
              {t('city.backToList')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="city-view-container w-full max-w-7xl mx-auto px-sacred-md py-sacred-lg">
      {/* Header with back button */}
      <div className="mb-sacred-lg">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-sacred-xs text-cultural-body text-saffron-600 
                   hover:text-saffron-700 transition-colors mb-sacred-md"
          aria-label={t('city.backToList')}
        >
          <span className="text-xl">←</span>
          <span>{t('city.backToList')}</span>
        </button>

        {/* City name and location */}
        <div className="text-center mb-sacred-md">
          <div className="text-4xl mb-sacred-sm">🏛️</div>
          <h1 className="text-cultural-heading text-4xl text-charcoal-500 mb-sacred-xs">
            {data && data.length > 0 ? data[0].name : t('city.name')}
          </h1>
        </div>
      </div>

      {/* Category tabs/filters */}
      <div className="category-tabs bg-ivory-100 border-2 border-kerala-500 rounded-lg p-sacred-sm mb-sacred-lg shadow-cultural">
        <div className="flex flex-wrap gap-sacred-xs justify-center">
          {HERITAGE_CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              className={`
                px-sacred-sm py-sacred-xs rounded-md text-cultural-body text-sm
                transition-all duration-200 flex items-center gap-sacred-xs
                ${
                  selectedCategory === category.key
                    ? 'bg-saffron-500 text-white shadow-md'
                    : 'bg-white text-charcoal-500 hover:bg-sandstone-200 border border-sandstone-300'
                }
              `}
              aria-pressed={selectedCategory === category.key}
            >
              <span>{category.icon}</span>
              <span>{category.key === 'all' ? category.label : t(category.label)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Heritage items grid */}
      {filteredHeritageItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-sacred-xl text-center">
          <div className="text-6xl mb-sacred-md">🏛️</div>
          <p className="text-cultural-body text-charcoal-400">
            {t('heritage.notFound')}
          </p>
        </div>
      ) : (
        <div className="heritage-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-sacred-md">
          {filteredHeritageItems.map((item: HeritageItem) => (
            <HeritageItemCard
              key={item.id}
              item={item}
              isExpanded={expandedItemId === item.id}
              onToggleExpand={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
              language={currentLanguage}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default CityView;
