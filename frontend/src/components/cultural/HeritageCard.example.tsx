import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeritageCardProps {
  heritage: {
    id: string;
    name: string;
    category: 'monuments' | 'temples' | 'festivals' | 'traditions' | 'cuisine' | 'art_forms' | 'historical_events' | 'customs';
    summary: string;
    detailedDescription: string;
    historicalPeriod: string;
    significance: string;
    thumbnailImage: string;
    culturalSymbols: string[];
    regionalStyle: string;
  };
  language: string;
  onExpand: (heritageId: string) => void;
}

// Cultural category icons and colors
const categoryConfig = {
  monuments: { icon: '🏛️', color: 'sandstone', bgGradient: 'bg-gradient-to-br from-sandstone-200 to-sandstone-300' },
  temples: { icon: '🕌', color: 'saffron', bgGradient: 'bg-gradient-to-br from-saffron-200 to-kerala-200' },
  festivals: { icon: '🎭', color: 'rajasthani', bgGradient: 'bg-gradient-to-br from-rajasthani-200 to-mysore-200' },
  traditions: { icon: '🪔', color: 'emerald', bgGradient: 'bg-gradient-to-br from-emerald-200 to-emerald-300' },
  cuisine: { icon: '🍛', color: 'temple', bgGradient: 'bg-gradient-to-br from-temple-200 to-kashmiri-200' },
  art_forms: { icon: '🎨', color: 'mysore', bgGradient: 'bg-gradient-to-br from-mysore-200 to-royal-200' },
  historical_events: { icon: '📜', color: 'charcoal', bgGradient: 'bg-gradient-to-br from-charcoal-200 to-charcoal-300' },
  customs: { icon: '🙏', color: 'kerala', bgGradient: 'bg-gradient-to-br from-kerala-200 to-saffron-200' },
};

const HeritageCard: React.FC<HeritageCardProps> = ({ heritage, language, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const config = categoryConfig[heritage.category];
  
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand(heritage.id);
  };

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-heritage bg-white
        border-2 border-${config.color}-300
        shadow-cultural hover:shadow-temple
        transition-all duration-300 ease-out
        ${isHovered ? 'transform -translate-y-1' : ''}
      `}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Cultural Pattern Overlay */}
      <div className="absolute inset-0 bg-cultural-pattern opacity-30 pointer-events-none" />
      
      {/* Header with Cultural Styling */}
      <div className={`relative ${config.bgGradient} p-sacred-md`}>
        {/* Cultural Symbols */}
        <div className="absolute top-2 right-2 flex space-x-1">
          {heritage.culturalSymbols.map((symbol, index) => (
            <span key={index} className="text-lg opacity-60">
              {symbol}
            </span>
          ))}
        </div>
        
        {/* Category Icon and Name */}
        <div className="flex items-center space-x-sacred-sm mb-sacred-sm">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="text-cultural-heading text-lg font-semibold text-charcoal-800">
              {heritage.name}
            </h3>
            <p className="text-sm text-charcoal-600 capitalize">
              {heritage.category.replace('_', ' ')} • {heritage.historicalPeriod}
            </p>
          </div>
        </div>
      </div>

      {/* Thumbnail Image with Cultural Frame */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={heritage.thumbnailImage}
          alt={heritage.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        {/* Traditional Frame Overlay */}
        <div className="absolute inset-0 border-4 border-kerala-400 opacity-20 pointer-events-none" />
        
        {/* Cultural Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-${config.color}-900/20 to-transparent`} />
      </div>

      {/* Content */}
      <div className="p-sacred-md">
        {/* Summary */}
        <p className="text-cultural-body text-charcoal-700 mb-sacred-sm leading-relaxed">
          {heritage.summary}
        </p>

        {/* Expandable Detailed Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              {/* Decorative Divider */}
              <div className="flex items-center my-sacred-sm">
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${config.color}-400 to-transparent`} />
                <span className="px-sacred-sm text-lg">🪷</span>
                <div className={`flex-1 h-px bg-gradient-to-r from-transparent via-${config.color}-400 to-transparent`} />
              </div>

              {/* Detailed Description */}
              <div className="space-y-sacred-sm">
                <div>
                  <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2">
                    📖 Historical Context
                  </h4>
                  <p className="text-cultural-body text-charcoal-700 leading-relaxed">
                    {heritage.detailedDescription}
                  </p>
                </div>

                <div>
                  <h4 className="text-cultural-heading font-semibold text-charcoal-800 mb-2">
                    ⭐ Cultural Significance
                  </h4>
                  <p className="text-cultural-body text-charcoal-700 leading-relaxed">
                    {heritage.significance}
                  </p>
                </div>

                {/* Regional Style Badge */}
                <div className="flex items-center space-x-2 mt-sacred-sm">
                  <span className="text-sm font-medium text-charcoal-600">Regional Style:</span>
                  <span className={`
                    px-sacred-sm py-1 rounded-full text-xs font-medium
                    bg-${config.color}-100 text-${config.color}-800
                    border border-${config.color}-300
                  `}>
                    {heritage.regionalStyle}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-sacred-md pt-sacred-sm border-t border-charcoal-200">
          <motion.button
            onClick={handleExpand}
            className={`
              flex items-center space-x-2 px-sacred-md py-sacred-sm
              bg-gradient-to-r from-${config.color}-500 to-${config.color}-600
              text-white rounded-temple font-medium text-sm
              hover:from-${config.color}-600 hover:to-${config.color}-700
              focus-cultural transition-all duration-200
              shadow-sm hover:shadow-md
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{isExpanded ? '🔼' : '🔽'}</span>
            <span>{isExpanded ? 'Show Less' : 'Learn More'}</span>
          </motion.button>

          <motion.button
            className={`
              flex items-center space-x-2 px-sacred-md py-sacred-sm
              border-2 border-${config.color}-400 text-${config.color}-700
              rounded-temple font-medium text-sm
              hover:bg-${config.color}-50 focus-cultural
              transition-all duration-200
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>🖼️</span>
            <span>Gallery</span>
          </motion.button>
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
    </motion.div>
  );
};

export default HeritageCard;

// Usage Example:
/*
const exampleHeritage = {
  id: '1',
  name: 'Taj Mahal',
  category: 'monuments' as const,
  summary: 'An ivory-white marble mausoleum built by Mughal emperor Shah Jahan as a tomb for his wife Mumtaz Mahal.',
  detailedDescription: 'The Taj Mahal was commissioned in 1632 by the Mughal emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal, who died in childbirth. The tomb is the centrepiece of a 17-hectare complex, which includes a mosque and a guest house, and is set in formal gardens bounded on three sides by a crenellated wall.',
  historicalPeriod: '1632-1653 CE',
  significance: 'Considered the finest example of Mughal architecture, combining elements from Islamic, Persian, Ottoman Turkish and Indian architectural styles. UNESCO World Heritage Site since 1983.',
  thumbnailImage: '/images/taj-mahal-thumb.jpg',
  culturalSymbols: ['🌙', '⭐', '🕌'],
  regionalStyle: 'Mughal Architecture'
};

<HeritageCard 
  heritage={exampleHeritage}
  language="en"
  onExpand={(id) => console.log('Expanding heritage:', id)}
/>
*/