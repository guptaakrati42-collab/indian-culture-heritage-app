import React, { useState, useCallback } from 'react';
import { useHeritageDetail } from '../hooks/useHeritage';

export interface HeritageCardProps {
  heritage: {
    id: string;
    name: string;
    category: 'monuments' | 'temples' | 'festivals' | 'traditions' | 'cuisine' | 'art_forms' | 'historical_events' | 'customs';
    summary: string;
    thumbnailImage: string;
  };
  language: string;
  onExpand?: (heritageId: string) => void;
}

// Cultural category configuration
const categoryConfig = {
  monuments: { icon: '🏛️', color: 'sandstone' },
  temples: { icon: '🕌', color: 'saffron' },
  festivals: { icon: '🎭', color: 'rajasthani' },
  traditions: { icon: '🪔', color: 'emerald' },
  cuisine: { icon: '🍛', color: 'temple' },
  art_forms: { icon: '🎨', color: 'mysore' },
  historical_events: { icon: '📜', color: 'charcoal' },
  customs: { icon: '🙏', color: 'kerala' },
};

const HeritageCard: React.FC<HeritageCardProps> = React.memo(({ heritage, language, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Fetch detailed heritage data only when expanded
  const { data: heritageDetail, isLoading, error } = useHeritageDetail(
    heritage.id,
    language,
    isExpanded // Only fetch when expanded
  );
  
  const config = categoryConfig[heritage.category];
  
  const handleExpand = useCallback(() => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Call onExpand callback if provided
    if (newExpandedState && onExpand) {
      onExpand(heritage.id);
    }
  }, [isExpanded, onExpand, heritage.id]);

  return (
    <div className="heritage-card relative overflow-hidden rounded-lg bg-white border-2 border-kerala-300 shadow-cultural hover:shadow-temple transition-all duration-300 hover:-translate-y-1">
      {/* Cultural Pattern Overlay */}
      <div className="absolute inset-0 bg-paisley-pattern opacity-30 pointer-events-none" />
      
      {/* Header */}
      <div className={`relative bg-gradient-to-br from-${config.color}-200 to-${config.color}-300 p-sacred-md`}>
        <div className="flex items-center space-x-sacred-sm">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-cultural-heading text-lg font-semibold text-charcoal-800">
              {heritage.name}
            </h3>
            <p className="text-sm text-charcoal-600 capitalize">
              {heritage.category.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={heritage.thumbnailImage}
          alt={heritage.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 border-4 border-kerala-400 opacity-20 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-sacred-md relative">
        {/* Summary */}
        <p className="text-cultural-body text-charcoal-700 mb-sacred-sm leading-relaxed">
          {heritage.summary}
        </p>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="overflow-hidden transition-all duration-500 ease-in-out">
            {/* Decorative Divider */}
            <div className="flex items-center my-sacred-sm">
              <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${config.color}-400 to-transparent`} />
              <span className="px-sacred-sm text-lg">🪷</span>
              <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${config.color}-400 to-transparent`} />
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-sacred-lg">
                <div className="loading-mandala" />
              </div>
            ) : error ? (
              <div className="text-center py-sacred-md">
                <p className="text-red-600 text-sm">Failed to load detailed information</p>
              </div>
            ) : heritageDetail ? (
              <div className="space-y-sacred-sm animate-cultural-fade">
                <div>
                  <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2">
                    📖 Historical Context
                  </h4>
                  <p className="text-cultural-body text-charcoal-700 leading-relaxed">
                    {heritageDetail.detailedDescription}
                  </p>
                </div>

                {heritageDetail.significance && (
                  <div>
                    <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2">
                      ⭐ Cultural Significance
                    </h4>
                    <p className="text-cultural-body text-charcoal-700 leading-relaxed">
                      {heritageDetail.significance}
                    </p>
                  </div>
                )}

                {heritageDetail.historicalPeriod && (
                  <div className="flex items-center space-x-2 mt-sacred-sm">
                    <span className="text-sm font-medium text-charcoal-600">Period:</span>
                    <span className={`
                      px-sacred-sm py-1 rounded-full text-xs font-medium
                      bg-${config.color}-100 text-${config.color}-800
                      border border-${config.color}-300
                    `}>
                      {heritageDetail.historicalPeriod}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between mt-sacred-md pt-sacred-sm border-t border-charcoal-200">
          <button
            onClick={handleExpand}
            className={`
              flex items-center space-x-2 px-sacred-md py-sacred-sm
              bg-gradient-to-r from-${config.color}-500 to-${config.color}-600
              text-white rounded-lg font-medium text-sm
              hover:from-${config.color}-600 hover:to-${config.color}-700
              focus-cultural transition-all duration-200
              shadow-sm hover:shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            disabled={isLoading}
          >
            <span>{isExpanded ? '🔼' : '🔽'}</span>
            <span>{isExpanded ? 'Show Less' : 'Learn More'}</span>
          </button>
        </div>
      </div>

      {/* Cultural Corner Decoration */}
      <div className="absolute top-0 left-0 w-8 h-8 overflow-hidden">
        <div className={`
          absolute -top-2 -left-2 w-6 h-6 rotate-45
          bg-gradient-to-br from-${config.color}-400 to-${config.color}-500
          opacity-60
        `} />
      </div>
    </div>
  );
});

export default HeritageCard;
