# Implementation Plan: Indian Culture App

## Overview

This implementation plan breaks down the full-stack Indian Culture App into discrete, incremental coding tasks. The app is built with React/TypeScript frontend, Node.js/Express/TypeScript backend, and PostgreSQL database. The implementation follows a bottom-up approach: database schema → backend API → frontend components → integration → testing.

## Tasks

- [x] 1. Set up project structure and development environment
  - Create monorepo structure with frontend and backend directories
  - Initialize TypeScript configuration for both frontend and backend
  - Set up package.json files with all required dependencies
  - Configure ESLint and Prettier for code quality
  - Create Docker Compose file for PostgreSQL database
  - Set up environment variable configuration (.env files)
  - Create README with setup instructions
  - _Requirements: All requirements (foundation)_

- [ ] 2. Database schema and migrations
  - [x] 2.1 Create database migration files for all tables
    - Write SQL migration for cities table with indexes
    - Write SQL migration for heritage_items table with indexes
    - Write SQL migration for translations table with full-text search indexes
    - Write SQL migration for images table with indexes
    - Write SQL migration for languages table with seed data for 23 languages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_
  
  - [x] 2.2 Write property test for database schema integrity
    - **Property 14: Data persistence round-trip**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 8.1**
  
  - [x] 2.3 Create database connection module
    - Implement PostgreSQL connection pool using pg library
    - Add connection error handling and retry logic
    - Create database initialization script
    - _Requirements: 8.1, 8.4_

- [x] 3. Backend core infrastructure
  - [x] 3.1 Set up Express server with TypeScript
    - Create Express app with middleware (CORS, body-parser, helmet)
    - Configure Winston logger for structured logging
    - Set up error handling middleware
    - Create health check endpoint
    - _Requirements: 6.6_
  
  - [x] 3.2 Implement language middleware
    - Create middleware to extract and validate language from request
    - Implement language fallback logic (default to English)
    - Add language code to request context
    - _Requirements: 1.1, 1.2, 1.5, 6.5_
  
  - [x] 3.3 Implement request validation middleware
    - Set up Joi validation schemas for all API endpoints
    - Create validation middleware using Joi
    - Add error response formatting for validation failures
    - _Requirements: 5.6, 6.6_
  
  - [x] 3.4 Set up caching layer
    - Configure node-cache with 15-minute TTL
    - Create cache utility functions (get, set, invalidate)
    - Implement cache key generation strategy
    - _Requirements: 10.1, 10.2_

- [x] 4. Backend services - Translation service
  - [x] 4.1 Implement TranslationService class
    - Write getTranslation method with fallback to English
    - Write getSupportedLanguages method
    - Write getFallbackLanguage method
    - Add query optimization for batch translation retrieval
    - _Requirements: 1.1, 1.2, 1.5, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 4.2 Write property test for translation fallback
    - **Property 1: Language selection consistency**
    - **Validates: Requirements 1.2, 2.6, 6.5, 9.4**
  
  - [x] 4.3 Write unit tests for TranslationService
    - Test translation retrieval for all 23 languages
    - Test fallback to English when translation missing
    - Test error handling for invalid language codes
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 5. Backend services - City service
  - [x] 5.1 Implement CityService class
    - Write getAllCities method with language and filter support
    - Write getCityById method with translation retrieval
    - Write getCityHeritage method with category filtering
    - Optimize queries with proper joins and indexes
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 5.1, 5.5_
  
  - [x] 5.2 Write property test for city heritage completeness
    - **Property 2: City heritage completeness**
    - **Validates: Requirements 2.3, 3.5**
  
  - [x] 5.3 Write property test for city filtering
    - **Property 5: City filtering correctness**
    - **Validates: Requirements 2.5, 2.8**
  
  - [x] 5.4 Write unit tests for CityService
    - Test city retrieval with different languages
    - Test city filtering by state and region
    - Test city search functionality
    - Test error handling for non-existent cities
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6_

- [x] 6. Backend services - Heritage service
  - [x] 6.1 Implement HeritageService class
    - Write getHeritageById method with full details and translations
    - Write getHeritageImages method
    - Write getHeritageByCategory method with filtering
    - Implement efficient query patterns for heritage data
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 5.2, 5.5_
  
  - [x] 6.2 Write property test for heritage detail expansion
    - **Property 4: Heritage detail expansion**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  
  - [x] 6.3 Write property test for category filtering
    - **Property 6: Category filtering correctness**
    - **Validates: Requirements 3.6, 6.7**
  
  - [x] 6.4 Write unit tests for HeritageService
    - Test heritage retrieval with translations
    - Test category filtering
    - Test image retrieval
    - Test error handling for invalid heritage IDs
    - _Requirements: 3.1, 3.6, 4.1, 4.2_

- [x] 7. Backend services - Image service
  - [x] 7.1 Implement ImageService class
    - Write getImageUrl method for thumbnail and full-size images
    - Write uploadImage method with S3/Cloudinary integration
    - Write deleteImage method
    - Implement image URL generation with CDN support
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 10.4_
  
  - [x] 7.2 Write property test for image gallery completeness
    - **Property 7: Image gallery completeness**
    - **Validates: Requirements 4.1, 4.7**
  
  - [x] 7.3 Write unit tests for ImageService
    - Test image URL generation
    - Test thumbnail vs full-size URL handling
    - Test placeholder image fallback
    - _Requirements: 4.1, 4.2, 4.6_

- [x] 8. Backend API endpoints - Cities
  - [x] 8.1 Implement GET /api/v1/cities endpoint
    - Create route handler with language and filter parameters
    - Integrate CityService.getAllCities
    - Add caching for city list responses
    - Implement response formatting
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.8, 6.1_
  
  - [x] 8.2 Implement GET /api/v1/cities/:cityId/heritage endpoint
    - Create route handler with language and category parameters
    - Integrate CityService.getCityHeritage
    - Add caching for heritage list responses
    - Implement response formatting
    - _Requirements: 2.3, 2.4, 3.1, 3.5, 3.6, 6.2, 6.7_
  
  - [x] 8.3 Write integration tests for city endpoints
    - Test GET /cities with various language parameters
    - Test GET /cities with state and region filters
    - Test GET /cities/:cityId/heritage with category filters
    - Test error responses for invalid parameters
    - _Requirements: 6.1, 6.2, 6.6_

- [x] 9. Backend API endpoints - Heritage and images
  - [x] 9.1 Implement GET /api/v1/heritage/:heritageId endpoint
    - Create route handler with language parameter
    - Integrate HeritageService.getHeritageById
    - Add caching for heritage detail responses
    - Implement response formatting with all fields
    - _Requirements: 3.1, 3.2, 3.7, 3.8, 6.3_
  
  - [x] 9.2 Implement GET /api/v1/heritage/:heritageId/images endpoint
    - Create route handler for image retrieval
    - Integrate HeritageService.getHeritageImages
    - Implement response formatting with CDN URLs
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.4_
  
  - [x] 9.3 Implement GET /api/v1/languages endpoint
    - Create route handler for supported languages
    - Integrate TranslationService.getSupportedLanguages
    - Add caching for language list
    - _Requirements: 1.1, 1.4, 6.5_
  
  - [x] 9.4 Write integration tests for heritage and image endpoints
    - Test GET /heritage/:heritageId with various languages
    - Test GET /heritage/:heritageId/images
    - Test GET /languages
    - Test error responses for invalid heritage IDs
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [x] 10. Checkpoint - Backend API complete
  - Ensure all backend tests pass
  - Verify all API endpoints return correct responses
  - Test error handling and validation
  - Ask the user if questions arise

- [x] 11. Frontend setup and core infrastructure
  - [x] 11.1 Initialize React app with TypeScript and Vite
    - Set up React 18+ project with TypeScript
    - Configure Vite for development and production builds
    - Install and configure Tailwind CSS
    - Set up React Router for navigation
    - _Requirements: 7.1, 7.2_
  
  - [x] 11.2 Configure i18next for internationalization
    - Install i18next and react-i18next
    - Create translation files for UI strings in all 23 languages
    - Set up language detection and persistence
    - Configure fallback language (English)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 11.3 Set up React Query for data fetching
    - Install and configure React Query
    - Create QueryClient with caching configuration
    - Set up stale time (5 min for cities, 10 min for heritage)
    - Configure error handling and retry logic
    - _Requirements: 7.4, 10.1, 10.2_
  
  - [x] 11.4 Create API client module
    - Create Axios instance with base URL configuration
    - Implement API methods for all endpoints
    - Add request/response interceptors for language headers
    - Implement error handling and response formatting
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Frontend components - Language selector
  - [x] 12.1 Implement LanguageSelector component
    - Create dropdown component with search functionality
    - Display all 23 languages with native names
    - Implement language selection handler
    - Add language persistence to localStorage
    - Style component with Tailwind CSS
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 12.2 Write property test for language preference persistence
    - **Property 3: Language preference persistence**
    - **Validates: Requirements 1.3**
  
  - [x] 12.3 Write unit tests for LanguageSelector
    - Test language selection updates state
    - Test language persistence to localStorage
    - Test search/filter functionality
    - Test rendering of all 23 languages
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 13. Frontend components - City list
  - [x] 13.1 Implement CityList component
    - Create city grid/list layout with responsive design
    - Implement search functionality for city names
    - Add state and region filter dropdowns
    - Display city preview images with lazy loading
    - Show heritage count for each city
    - Implement city selection handler
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.8, 7.1, 7.2_
  
  - [x] 13.2 Integrate CityList with React Query
    - Create useQuery hook for fetching cities
    - Pass language parameter from context
    - Implement loading states with skeleton UI
    - Handle error states with user-friendly messages
    - _Requirements: 2.2, 7.3, 7.5, 10.1_
  
  - [x] 13.3 Write property test for city search functionality
    - **Property 8: City search correctness**
    - **Validates: Requirements 2.5**
  
  - [x] 13.4 Write unit tests for CityList component
    - Test city rendering with mock data
    - Test search filtering
    - Test state/region filtering
    - Test city selection callback
    - _Requirements: 2.1, 2.2, 2.5, 2.8_

- [x] 14. Frontend components - City view
  - [x] 14.1 Implement CityView component
    - Create layout for displaying city information
    - Display city name and location details
    - Create grid layout for heritage items
    - Implement category tabs/filters for heritage items
    - Add navigation back to city list
    - _Requirements: 2.3, 2.4, 3.1, 3.5, 3.6, 7.1, 7.2, 7.6_
  
  - [x] 14.2 Integrate CityView with React Query
    - Create useQuery hook for fetching city heritage
    - Pass cityId and language parameters
    - Implement loading states
    - Handle error states
    - Cache city selection in sessionStorage
    - _Requirements: 2.3, 2.7, 7.3, 7.4, 7.5, 10.1, 10.2_
  
  - [x] 14.3 Write property test for session persistence
    - **Property 9: Session state persistence**
    - **Validates: Requirements 2.7**
  
  - [x] 14.4 Write unit tests for CityView component
    - Test heritage item rendering
    - Test category filtering
    - Test navigation
    - Test loading and error states
    - _Requirements: 2.3, 3.1, 3.6, 7.2, 7.3, 7.5_

- [x] 15. Frontend components - Heritage card
  - [x] 15.1 Implement HeritageCard component
    - Create card layout with thumbnail image
    - Display heritage name, category, and summary
    - Implement expand/collapse functionality with "More"/"Less" button
    - Show detailed description and historical context when expanded
    - Add smooth transition animations
    - Style with Tailwind CSS
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.7, 3.8, 7.1_
  
  - [x] 15.2 Integrate HeritageCard with API
    - Fetch detailed heritage data on expand
    - Implement lazy loading for detailed content
    - Handle loading state during expansion
    - Cache expanded content
    - _Requirements: 3.2, 3.3, 3.4, 7.3, 7.4, 10.2_
  
  - [x] 15.3 Write property test for expand/collapse state
    - **Property 10: Heritage expansion state consistency**
    - **Validates: Requirements 3.2, 3.3, 3.4**
  
  - [x] 15.4 Write unit tests for HeritageCard component
    - Test initial collapsed state
    - Test expand functionality
    - Test collapse functionality
    - Test content display in both states
    - _Requirements: 3.2, 3.3, 3.4_

- [x] 16. Frontend components - Image gallery
  - [x] 16.1 Implement ImageGallery component
    - Create thumbnail grid layout
    - Implement lazy loading for thumbnail images
    - Add click handlers to open lightbox
    - Display image captions, descriptions, and cultural context
    - Show what each image depicts with detailed descriptions
    - Include location and historical period information when available
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.7, 7.1_
  
  - [x] 16.2 Implement Lightbox component
    - Create full-screen image viewer
    - Implement next/previous navigation
    - Add close button and keyboard shortcuts
    - Display comprehensive image information (description, cultural context, location, period)
    - Show what the image depicts in clear, descriptive text
    - Add toggle for showing/hiding detailed information
    - Add touch gestures for mobile
    - _Requirements: 4.2, 4.3, 4.4, 7.1_
  
  - [x] 16.3 Integrate ImageGallery with API
    - Fetch images for heritage items
    - Implement progressive image loading
    - Handle image load errors with placeholder
    - Optimize image URLs for CDN delivery
    - _Requirements: 4.1, 4.2, 4.5, 4.6, 10.4_
  
  - [x] 16.4 Write property test for image navigation
    - **Property 11: Image navigation correctness**
    - **Validates: Requirements 4.4**
  
  - [x] 16.5 Write unit tests for ImageGallery and Lightbox
    - Test thumbnail rendering
    - Test lightbox open/close
    - Test image navigation
    - Test placeholder display on error
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6_

- [x] 17. Frontend components - Error handling
  - [x] 17.1 Implement ErrorBoundary component
    - Create error boundary with componentDidCatch
    - Display user-friendly error messages
    - Add error logging
    - Provide retry functionality
    - _Requirements: 7.5_
  
  - [x] 17.2 Create error display components
    - Create NetworkError component for API failures
    - Create NotFound component for 404 errors
    - Create GenericError component for unexpected errors
    - Style error messages consistently
    - _Requirements: 7.5_
  
  - [x] 17.3 Write unit tests for error components
    - Test ErrorBoundary catches errors
    - Test error message display
    - Test retry functionality
    - _Requirements: 7.5_

- [x] 18. Frontend routing and navigation
  - [x] 18.1 Set up React Router configuration
    - Define routes for home, city view, and heritage detail
    - Implement route parameters for cityId and heritageId
    - Add 404 route for invalid URLs
    - Configure route-based code splitting
    - _Requirements: 7.2, 7.6_
  
  - [x] 18.2 Implement App component
    - Create root component with Router
    - Add LanguageSelector to header
    - Implement global loading state
    - Add ErrorBoundary wrapper
    - Configure i18next provider
    - Configure React Query provider
    - _Requirements: 1.2, 7.1, 7.2, 7.3, 7.5_
  
  - [x] 18.3 Write integration tests for routing
    - Test navigation between routes
    - Test route parameters
    - Test 404 handling
    - _Requirements: 7.2, 7.6_

- [x] 19. Checkpoint - Frontend components complete
  - Ensure all frontend components render correctly
  - Verify navigation works between all views
  - Test language switching across all components
  - Test responsive design on different screen sizes
  - Ask the user if questions arise

- [x] 20. Performance optimization
  - [x] 20.1 Implement frontend performance optimizations
    - Add React.memo to prevent unnecessary re-renders
    - Implement useMemo and useCallback for expensive computations
    - Configure code splitting for routes
    - Optimize bundle size with tree shaking
    - Add service worker for offline support (optional)
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x] 20.2 Implement image optimization
    - Configure lazy loading for all images
    - Implement responsive image sizes
    - Add WebP format support with fallbacks
    - Configure CDN caching headers
    - Implement image compression in upload pipeline
    - _Requirements: 4.5, 10.4_
  
  - [x] 20.3 Write property test for performance requirements
    - **Property 15: Response time requirements**
    - **Validates: Requirements 10.1, 10.2**
  
  - [x] 20.4 Write performance tests
    - Test city list load time
    - Test heritage content load time
    - Test image load time
    - Test concurrent user handling
    - _Requirements: 10.1, 10.2, 10.3_

- [x] 21. Database seeding and sample data
  - [x] 21.1 Create database seed scripts
    - Write seed script for cities (at least 20 major Indian cities)
    - Write seed script for heritage items (at least 5 per city covering all categories)
    - Write seed script for translations (English and Hindi minimum)
    - Write seed script for images (at least 3 per heritage item)
    - Create script to run all seeds in correct order
    - _Requirements: 2.1, 3.1, 4.1, 5.1, 5.2, 5.3, 5.4, 9.1, 9.2, 9.3_
  
  - [x] 21.2 Write validation tests for seed data
    - Test all cities have required translations
    - Test all heritage items have required fields
    - Test all images have valid URLs
    - Test referential integrity
    - _Requirements: 5.6, 8.2, 8.3, 8.4_

- [x] 22. End-to-end integration
  - [x] 22.1 Wire frontend and backend together
    - Configure API base URL in frontend
    - Set up CORS configuration in backend
    - Test all API endpoints from frontend
    - Verify language switching works end-to-end
    - Test error handling across full stack
    - _Requirements: All requirements_
  
  - [x] 22.2 Write end-to-end integration tests
    - Test complete user flow: select language → select city → view heritage → expand details → view images
    - Test language switching during navigation
    - Test error scenarios (network failures, invalid data)
    - Test caching behavior
    - _Requirements: 1.2, 2.2, 2.3, 3.2, 3.3, 4.2, 4.3_

- [x] 23. Deployment preparation
  - [x] 23.1 Create Docker configuration
    - Write Dockerfile for backend
    - Write Dockerfile for frontend
    - Update Docker Compose for full stack
    - Configure environment variables for production
    - _Requirements: All requirements (deployment)_
  
  - [x] 23.2 Create deployment documentation
    - Write deployment guide for backend
    - Write deployment guide for frontend
    - Document environment variables
    - Document database migration process
    - Create troubleshooting guide
    - _Requirements: All requirements (documentation)_

- [x] 24. Final checkpoint - Complete system verification
  - Run all tests (unit, integration, property-based)
  - Verify all 23 languages work correctly
  - Test all heritage categories display properly
  - Verify image galleries work across all heritage items
  - Test performance under load
  - Ensure all requirements are met
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: database → backend → frontend → integration
- Checkpoints ensure incremental validation at major milestones
- All 23 languages (22 Indian + English) must be supported throughout
- All 8 heritage categories must be represented in the data model and UI
