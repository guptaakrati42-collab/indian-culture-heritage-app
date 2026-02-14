/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Cultural Color Palette
      colors: {
        // Primary Colors (Sacred and Traditional)
        saffron: {
          50: '#FFF8F0',
          100: '#FFEED6',
          200: '#FFD9AD',
          300: '#FFC084',
          400: '#FFA75B',
          500: '#FF9933', // Primary saffron
          600: '#E6851A',
          700: '#CC7300',
          800: '#B36200',
          900: '#995100',
        },
        temple: {
          50: '#FFF2ED',
          100: '#FFE0D6',
          200: '#FFBFAD',
          300: '#FF9A84',
          400: '#FF855B',
          500: '#FF6B35', // Temple orange
          600: '#E55A2B',
          700: '#CC4A21',
          800: '#B33A17',
          900: '#992A0D',
        },
        royal: {
          50: '#E6E6FF',
          100: '#CCCCFF',
          200: '#9999FF',
          300: '#6666FF',
          400: '#4169E1',
          500: '#000080', // Royal blue
          600: '#000066',
          700: '#00004D',
          800: '#000033',
          900: '#00001A',
        },
        emerald: {
          50: '#E8F5E8',
          100: '#D1EBD1',
          200: '#A3D7A3',
          300: '#75C375',
          400: '#47AF47',
          500: '#138808', // Emerald green
          600: '#0F6B06',
          700: '#0B4E04',
          800: '#073102',
          900: '#031401',
        },
        
        // Regional Colors
        rajasthani: {
          50: '#FFF0F8',
          100: '#FFE1F1',
          200: '#FFC3E3',
          300: '#FFA5D5',
          400: '#FF87C7',
          500: '#FF69B4', // Rajasthani pink
          600: '#E55A9F',
          700: '#CC4B8A',
          800: '#B23C75',
          900: '#992D60',
        },
        kerala: {
          50: '#FFFEF0',
          100: '#FFFDE1',
          200: '#FFFBC3',
          300: '#FFF9A5',
          400: '#FFF787',
          500: '#FFD700', // Kerala gold
          600: '#E6C200',
          700: '#CCAD00',
          800: '#B39800',
          900: '#998300',
        },
        kashmiri: {
          50: '#FDE8ED',
          100: '#FBD1DB',
          200: '#F7A3B7',
          300: '#F37593',
          400: '#EF476F',
          500: '#DC143C', // Kashmiri crimson
          600: '#B91C3C',
          700: '#96143C',
          800: '#730C3C',
          900: '#50043C',
        },
        mysore: {
          50: '#F0E6F0',
          100: '#E1CCE1',
          200: '#C399C3',
          300: '#A566A5',
          400: '#873387',
          500: '#800080', // Mysore purple
          600: '#660066',
          700: '#4D004D',
          800: '#330033',
          900: '#1A001A',
        },
        
        // Natural Elements
        sandstone: {
          50: '#FDFBF7',
          100: '#FBF7EF',
          200: '#F9F0D4',
          300: '#F6E8B9',
          400: '#F4E4BC', // Primary sandstone
          500: '#E6D1A3',
          600: '#D8BE8A',
          700: '#CAAB71',
          800: '#BC9858',
          900: '#AE853F',
        },
        charcoal: {
          50: '#F2F3F4',
          100: '#E5E7E9',
          200: '#CBCFD3',
          300: '#B1B7BD',
          400: '#97A1A7',
          500: '#36454F', // Primary charcoal
          600: '#2F3E46',
          700: '#28373D',
          800: '#213034',
          900: '#1A292B',
        },
        ivory: {
          50: '#FFFFFF',
          100: '#FFFFF0', // Primary ivory
          200: '#FEFEF0',
          300: '#FDFDEA',
          400: '#FCFCE4',
          500: '#F5F5DC',
          600: '#EBEBC3',
          700: '#E1E1AA',
          800: '#D7D791',
          900: '#CDCD78',
        },
      },
      
      // Cultural Typography
      fontFamily: {
        'devanagari': ['Noto Sans Devanagari', 'Noto Sans', 'Inter', 'sans-serif'],
        'cultural': ['Inter', 'Roboto', 'Segoe UI', 'system-ui', 'sans-serif'],
        'display': ['Crimson Text', 'Playfair Display', 'serif'],
        'manuscript': ['Crimson Text', 'Georgia', 'serif'],
      },
      
      // Sacred Geometry Spacing (Golden Ratio)
      spacing: {
        'sacred-xs': '0.382rem',  // φ^-2
        'sacred-sm': '0.618rem',  // φ^-1
        'sacred': '1rem',         // Base
        'sacred-md': '1.618rem',  // φ
        'sacred-lg': '2.618rem',  // φ^2
        'sacred-xl': '4.236rem',  // φ^3
        'sacred-2xl': '6.854rem', // φ^4
      },
      
      // Cultural Shadows
      boxShadow: {
        'temple': '0 8px 32px rgba(255, 153, 51, 0.2)',
        'mandala': '0 0 20px rgba(255, 215, 0, 0.3)',
        'heritage': '0 4px 16px rgba(220, 20, 60, 0.15)',
        'cultural': '0 2px 8px rgba(54, 69, 79, 0.1)',
        'lotus': '0 0 24px rgba(19, 136, 8, 0.2)',
        'peacock': '0 6px 20px rgba(128, 0, 128, 0.25)',
      },
      
      // Cultural Gradients
      backgroundImage: {
        'saffron-gradient': 'linear-gradient(135deg, #FF9933 0%, #FFB366 100%)',
        'temple-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%)',
        'royal-gradient': 'linear-gradient(135deg, #000080 0%, #4169E1 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #138808 0%, #32CD32 100%)',
        'cultural-sunset': 'linear-gradient(135deg, #FF9933 0%, #FF6B35 50%, #DC143C 100%)',
        'heritage-dawn': 'linear-gradient(135deg, #FFD700 0%, #FF69B4 50%, #800080 100%)',
        'mandala-radial': 'radial-gradient(circle, #FFD700 0%, #FF9933 50%, #DC143C 100%)',
      },
      
      // Cultural Border Radius
      borderRadius: {
        'temple': '0.5rem',
        'mandala': '50%',
        'heritage': '0.75rem',
        'scroll': '1rem 1rem 0.25rem 0.25rem',
      },
      
      // Cultural Animations
      animation: {
        'lotus-bloom': 'lotus-bloom 2s ease-in-out infinite',
        'peacock-shimmer': 'peacock-shimmer 3s ease-in-out infinite',
        'scroll-unfurl': 'scroll-unfurl 0.5s ease-out',
        'mandala-spin': 'spin 4s linear infinite',
        'heritage-glow': 'heritage-glow 2s ease-in-out infinite alternate',
        'cultural-fade': 'fade-in 0.6s ease-out',
      },
      
      // Cultural Grid Templates
      gridTemplateColumns: {
        'heritage': 'repeat(auto-fit, minmax(300px, 1fr))',
        'cities': 'repeat(auto-fit, minmax(250px, 1fr))',
        'gallery': 'repeat(auto-fit, minmax(200px, 1fr))',
      },
      
      // Cultural Aspect Ratios
      aspectRatio: {
        'heritage-card': '4/3',
        'city-preview': '16/9',
        'gallery-thumb': '1/1',
        'traditional': '3/4',
      },
      
      // Cultural Z-Index Scale
      zIndex: {
        'dropdown': '1000',
        'modal': '2000',
        'tooltip': '3000',
        'overlay': '4000',
        'cultural-header': '100',
      },
    },
  },
  plugins: [
    // Custom plugin for cultural utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        // Cultural text styles
        '.text-cultural-heading': {
          fontFamily: theme('fontFamily.display'),
          fontWeight: '600',
          letterSpacing: '0.025em',
        },
        '.text-cultural-body': {
          fontFamily: theme('fontFamily.cultural'),
          lineHeight: '1.618', // Golden ratio
        },
        '.text-devanagari': {
          fontFamily: theme('fontFamily.devanagari'),
        },
        
        // Cultural backgrounds
        '.bg-cultural-pattern': {
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23FF9933" fill-opacity="0.05"%3E%3Cpath d="M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        },
        
        // Cultural borders
        '.border-cultural': {
          borderWidth: '2px',
          borderStyle: 'solid',
          borderImage: 'linear-gradient(45deg, #FF9933, #FFD700, #FF6B35) 1',
        },
        
        // Cultural hover effects
        '.hover-cultural': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme('boxShadow.temple'),
          },
        },
        
        // Cultural focus states
        '.focus-cultural': {
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px ${theme('colors.saffron.500')}40`,
          },
        },
      };
      
      addUtilities(newUtilities);
    },
  ],
};

// Custom keyframes for cultural animations
const customKeyframes = `
@keyframes lotus-bloom {
  0% { transform: scale(0.8) rotate(0deg); opacity: 0.7; }
  50% { transform: scale(1.1) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 0.9; }
}

@keyframes peacock-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes scroll-unfurl {
  0% { height: 0; opacity: 0; transform: rotateX(-90deg); }
  100% { height: auto; opacity: 1; transform: rotateX(0deg); }
}

@keyframes heritage-glow {
  0% { box-shadow: 0 0 5px rgba(255, 153, 51, 0.3); }
  100% { box-shadow: 0 0 20px rgba(255, 153, 51, 0.6); }
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

// Export keyframes for injection into CSS
module.exports.customKeyframes = customKeyframes;